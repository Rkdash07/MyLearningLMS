import jwt from "jsonwebtoken";
import fs from "fs";
import { User } from "../models/user.model.js";

export const generateToken = async (res, userId, message) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  // #region agent log
  const tokenSize = token.length;
  const logPath = 'e:\\UdemyServerProblem - secureLMS\\.cursor\\debug.log';
  const logEntry = JSON.stringify({
    location: 'generateToken.js:8',
    message: 'JWT token generated',
    data: { userId, tokenSize },
    timestamp: Date.now(),
    sessionId: 'debug-session',
    runId: 'run1',
    hypothesisId: 'C'
  }) + '\n';
  fs.appendFileSync(logPath, logEntry, 'utf8');
  // #endregion agent log

  // Fetch user to send in response (excluding password)
  const user = await User.findById(userId).select("-password");

  return res
    .status(200)
    .cookie("token", token, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    })
    .json({
      success: true,
      message,
      data: user,
    });
};
