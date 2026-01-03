import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import hpp from "hpp";
import rateLimit from "express-rate-limit";
import http from "http";
import fs from "fs";
import connectDB from "./database/db.js";
import userRoute from "./routes/user.route.js";
import courseRoute from "./routes/course.route.js";
import mediaRoute from "./routes/media.route.js";
import purchaseRoute from "./routes/purchaseCourse.route.js";
import courseProgressRoute from "./routes/courseProgress.route.js";
import razorpayRoute from "./routes/razorpay.routes.js";
import healthRoute from "./routes/health.routes.js";
import { errorHandler, handleMongoError, handleJWTError, handleJWTExpiredError } from "./middleware/error.middleware.js";

// Load environment variables
dotenv.config();

// Connect to database
await connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Global rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});

// Security Middleware
app.use(helmet()); // Set security HTTP headers
// app.use(mongoSanitize()); // Data sanitization against NoSQL query injection
// app.use(xss()); // Data sanitization against XSS
app.use(hpp()); // Prevent HTTP Parameter Pollution
app.use("/api", limiter); // Apply rate limiting to all routes

// Logging Middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Body Parser Middleware
app.use(express.json({ limit: "10kb" })); // Body limit is 10kb
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// #region agent log
// Middleware to log header sizes for debugging 431 errors
app.use((req, res, next) => {
  const headerSize = JSON.stringify(req.headers).length;
  const cookieCount = Object.keys(req.cookies || {}).length;
  const cookieSize = JSON.stringify(req.cookies || {}).length;
  const tokenSize = req.cookies?.token ? req.cookies.token.length : 0;
  const logPath = 'e:\\UdemyServerProblem - secureLMS\\.cursor\\debug.log';
  const logEntry = JSON.stringify({
    location: 'index.js:53',
    message: 'Request headers received',
    data: { url: req.url, method: req.method, headerSize, cookieCount, cookieSize, tokenSize, cookieKeys: Object.keys(req.cookies || {}) },
    timestamp: Date.now(),
    sessionId: 'debug-session',
    runId: 'run1',
    hypothesisId: 'A'
  }) + '\n';
  fs.appendFileSync(logPath, logEntry, 'utf8');
  next();
});
// #endregion agent log

// CORS Configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "device-remember-token",
      "Access-Control-Allow-Origin",
      "Origin",
      "Accept",
    ],
  })
);

// API Routes
app.use("/api/v1/media", mediaRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/course", courseRoute);
app.use("/api/v1/purchase", purchaseRoute);
app.use("/api/v1/progress", courseProgressRoute);
app.use("/api/v1/razorpay", razorpayRoute);
app.use("/health", healthRoute);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    status: "error",
    message: "Route not found",
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  // #region agent log
  if (err.code === 'HPE_HEADER_OVERFLOW' || err.statusCode === 431) {
    const logPath = 'e:\\UdemyServerProblem - secureLMS\\.cursor\\debug.log';
    const headerSize = JSON.stringify(req.headers || {}).length;
    const cookieCount = Object.keys(req.cookies || {}).length;
    const cookieSize = JSON.stringify(req.cookies || {}).length;
    const logEntry = JSON.stringify({
      location: 'index.js:91',
      message: '431/HPE_HEADER_OVERFLOW error detected',
      data: { url: req.url, method: req.method, headerSize, cookieCount, cookieSize, errorCode: err.code, statusCode: err.statusCode },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'run1',
      hypothesisId: 'A'
    }) + '\n';
    fs.appendFileSync(logPath, logEntry, 'utf8');
  }
  // #endregion agent log
  // Handle MongoDB errors
  if (err.name === "CastError" || err.code === 11000 || err.name === "ValidationError") {
    err = handleMongoError(err);
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    err = handleJWTError();
  }
  if (err.name === "TokenExpiredError") {
    err = handleJWTExpiredError();
  }

  errorHandler(err, req, res, next);
});

// Start server
// #region agent log
// Configure maxHeaderSize to handle larger headers (default is 8KB, increasing to 32KB)
// This fixes 431 "Request Header Fields Too Large" errors
const server = http.createServer({ maxHeaderSize: 32768 }, app);

// Handle HTTP-level errors (before Express middleware)
server.on('clientError', (err, socket) => {
  const logPath = 'e:\\UdemyServerProblem - secureLMS\\.cursor\\debug.log';
  if (err.code === 'HPE_HEADER_OVERFLOW' || err.message?.includes('431')) {
    const logEntry = JSON.stringify({
      location: 'index.js:154',
      message: 'HTTP-level 431/HPE_HEADER_OVERFLOW detected',
      data: { errorCode: err.code, message: err.message },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'run1',
      hypothesisId: 'A'
    }) + '\n';
    fs.appendFileSync(logPath, logEntry, 'utf8');
  }
  socket.end('HTTP/1.1 431 Request Header Fields Too Large\r\n\r\n');
});

server.listen(PORT, () => {
  console.log(
    ` Server running on port ${PORT} in ${process.env.NODE_ENV} mode`
  );
  const logPath = 'e:\\UdemyServerProblem - secureLMS\\.cursor\\debug.log';
  const logEntry = JSON.stringify({
    location: 'index.js:171',
    message: 'Server started with maxHeaderSize',
    data: { port: PORT, maxHeaderSize: 32768 },
    timestamp: Date.now(),
    sessionId: 'debug-session',
    runId: 'run1',
    hypothesisId: 'A'
  }) + '\n';
  fs.appendFileSync(logPath, logEntry, 'utf8');
});
// #endregion agent log
