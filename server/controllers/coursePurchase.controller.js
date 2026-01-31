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
 * Handle Razorpay webhook events for payment verification
 * @route POST /api/v1/payments/razorpay-webhook
 */
export const handleRazorpayWebhook = catchAsync(async (req, res) => {
  const { event } = req.body;

  // Handle payment.authorized event
  if (event === "payment.authorized" || event === "payment.captured") {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Verify payment signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      throw new AppError("Payment verification failed", 400);
    }

    // Update purchase record
    const purchase = await CoursePurchase.findOne({
      paymentId: razorpay_order_id,
    }).populate("course");

    if (!purchase) {
      throw new AppError("Purchase record not found", 404);
    }

    purchase.status = "completed";
    await purchase.save();

    // Enroll user in course
    await enrollUserInCourse(purchase.user, purchase.course._id);
  }

  res.status(200).json({ received: true });
});

/**
 * Get course details with purchase status
 * @route GET /api/v1/payments/courses/:courseId/purchase-status
 */
export const getCoursePurchaseStatus = catchAsync(async (req, res) => {
  const { courseId } = req.params;

  // Find course with populated data
  const course = await Course.findById(courseId)
    .populate("instructor", "name avatar")
    .populate({
      path: "lectures",
      select: "title videoUrl duration isPreview order",
      options: { sort: { order: 1 } },
    });

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  // Check if user has purchased the course
  const purchased = await CoursePurchase.exists({
    user: req.id,
    course: courseId,
    status: "completed",
  });

  res.status(200).json({
    success: true,
    data: {
      course,
      isPurchased: Boolean(purchased),
    },
  });
});

/**
 * Get all purchased courses
 * @route GET /api/v1/payments/purchased-courses
 */
export const getPurchasedCourses = catchAsync(async (req, res) => {
  const purchases = await CoursePurchase.find({
    user: req.id,
    status: "completed",
  }).populate({
    path: "course",
    select: "title thumbnail description category subtitle price level",
    populate: {
      path: "instructor",
      select: "name avatar",
    },
  });

  res.status(200).json({
    success: true,
    data: purchases.map((purchase) => purchase.course).filter(Boolean),
  });
});
