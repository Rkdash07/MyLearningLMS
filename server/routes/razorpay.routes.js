import express from "express";
import {
  createRazorpayOrder,
  verifyPayment,
} from "../controllers/razorpay.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * Create a Razorpay order for course purchase
 * @route POST /api/v1/razorpay/create-order
 */
router.post("/create-order", isAuthenticated, createRazorpayOrder);

/**
 * Verify Razorpay payment after user completes payment
 * @route POST /api/v1/razorpay/verify-payment
 */
router.post("/verify-payment", isAuthenticated, verifyPayment);

export default router;
