import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const generateToken = async (res, userId, message) => {
  // Generate JWT token with minimal claims to keep size small
  const token = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" } // Extended from 1d to reduce token refresh requests
  );

  // Fetch user to send in response (excluding password and large fields)
  const user = await User.findById(userId).select(
    "-password -enrolledCourses -createdCourses"
  );

  // Create minimal user object to send in response
  const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    bio: user.bio,
  };

  return res
    .status(200)
    .cookie("token", token, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production" ? true : false,
      maxAge: 1 * 24 * 60 * 60 * 1000, // 1 days
      path: "/", // Ensure cookie is sent to all endpoints
    })
    .json({
      success: true,
      message,
      data: userResponse,
    });
};
