import Razorpay from "razorpay";
import crypto from "crypto";
import { Course } from "../models/course.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import { User } from "../models/user.model.js";
import { catchAsync } from "../middleware/error.middleware.js";
import { AppError } from "../middleware/error.middleware.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Helper function to enroll user in course after successful payment
 */
const enrollUserInCourse = async (userId, courseId) => {
  try {
    // Update user's enrolled courses
    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { enrolledCourses: { course: courseId } } },
      { new: true }
    );

    // Update course's enrolled students
    await Course.findByIdAndUpdate(
      courseId,
      { $addToSet: { enrolledStudents: userId } },
      { new: true }
    );
  } catch (error) {
    console.error("Error enrolling user in course:", error);
    throw error;
  }
};

/**
 * Create Razorpay order for course purchase
 * @route POST /api/v1/razorpay/create-order
 */
export const createRazorpayOrder = catchAsync(async (req, res) => {
  const userId = req.id;
  const { courseId } = req.body;

  // Validate course exists
  const course = await Course.findById(courseId);
  if (!course) {
    throw new AppError("Course not found", 404);
  }

  // Validate course is published
  if (!course.isPublished) {
    throw new AppError("Course is not published", 400);
  }

  // Check if user already purchased the course
  const existingPurchase = await CoursePurchase.findOne({
    user: userId,
    course: courseId,
    status: "completed",
  });

  if (existingPurchase) {
    throw new AppError("You have already purchased this course", 400);
  }

  // Create a new course purchase record
  const newPurchase = new CoursePurchase({
    course: courseId,
    user: userId,
    amount: course.price,
    currency: "INR",
    status: "pending",
    paymentMethod: "razorpay",
  });

  // Create Razorpay order
  const options = {
    amount: course.price * 100, // Amount in paise
    currency: "INR",
    receipt: `course_${courseId}_${userId}`,
    notes: {
      courseId: courseId.toString(),
      userId: userId.toString(),
      courseName: course.title,
    },
  };

  const order = await razorpay.orders.create(options);

  // Save payment ID to purchase record
  newPurchase.paymentId = order.id;
  await newPurchase.save();

  res.status(200).json({
    success: true,
    order,
    course: {
      _id: course._id,
      name: course.title,
      description: course.description,
      image: course.thumbnail,
      price: course.price,
    },
  });
});

/**
 * Verify Razorpay payment and enroll user in course
 * @route POST /api/v1/razorpay/verify-payment
 */
export const verifyPayment = catchAsync(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  // Validate required fields
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new AppError(
      "Missing payment verification details",
      400
    );
  }

  // Verify payment signature
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  const isAuthentic = expectedSignature === razorpay_signature;

  if (!isAuthentic) {
    throw new AppError("Payment verification failed - Invalid signature", 400);
  }

  // Update purchase record
  const purchase = await CoursePurchase.findOne({
    paymentId: razorpay_order_id,
  }).populate("course");

  if (!purchase) {
    throw new AppError("Purchase record not found", 404);
  }

  if (purchase.status === "completed") {
    return res.status(200).json({
      success: true,
      message: "Payment already verified",
      courseId: purchase.course._id,
    });
  }

  // Update purchase status
  purchase.status = "completed";
  await purchase.save();

  // Enroll user in course
  await enrollUserInCourse(purchase.user, purchase.course._id);

  res.status(200).json({
    success: true,
    message: "Payment verified successfully. You are now enrolled in the course!",
    courseId: purchase.course._id,
  });
});
