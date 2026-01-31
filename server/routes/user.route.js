import express from "express";
import {
    authenticateUser,
    changeUserPassword,
    createUserAccount,
    deleteUserAccount,
    getCurrentUserProfile,
    signOutUser,
    updateUserProfile
} from "../controllers/user.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import upload from "../utils/multer.js";
import { validateSignup, validateSignin, validatePasswordChange } from "../middleware/validation.middleware.js";

const router = express.Router();

// Auth routes
router.post("/signup", validateSignup, createUserAccount);
router.post("/signin", validateSignin, authenticateUser);
router.post("/signout", signOutUser);

// OAuth routes
router.get("/auth/google", (req, res) => {
  // Placeholder for Google OAuth - can be implemented with passport-google-oauth20
  res.status(501).json({
    success: false,
    message: "Google OAuth is not yet implemented. Please use email/password authentication.",
  });
});

router.get("/auth/github", (req, res) => {
  // Placeholder for GitHub OAuth - can be implemented with passport-github2
  res.status(501).json({
    success: false,
    message: "GitHub OAuth is not yet implemented. Please use email/password authentication.",
  });
});

// Profile routes
router.get("/profile", isAuthenticated, getCurrentUserProfile);
router.patch("/profile", 
    isAuthenticated, 
    upload.single("avatar"), 
    updateUserProfile
);

// Password management
router.patch("/change-password",
    isAuthenticated,
    validatePasswordChange,
    changeUserPassword
);

// Account management
router.delete("/account", isAuthenticated, deleteUserAccount);

export default router;