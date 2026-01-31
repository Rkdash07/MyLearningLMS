// Custom error class
export class AppError extends Error {
    constructor(message, statusCode, errors = null) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        this.errors = errors;

        Error.captureStackTrace(this, this.constructor);
    }
}

// Error handler for async functions
export const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

// Global error handling middleware
export const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Handle multer errors
    if (err.name === 'MulterError') {
        if (err.code === 'FILE_TOO_LARGE') {
            err.statusCode = 413;
            err.message = 'File size exceeds maximum limit of 500MB';
        } else if (err.code === 'LIMIT_FILE_SIZE') {
            err.statusCode = 413;
            err.message = 'File size exceeds maximum limit';
        } else if (err.code === 'LIMIT_FILE_COUNT') {
            err.statusCode = 400;
            err.message = 'Too many files uploaded';
        }
    }

    const errorResponse = {
        success: false,
        status: err.status,
        message: err.message
    };

    // Include errors array if present (for validation errors)
    if (err.errors) {
        errorResponse.errors = err.errors;
    }

    if (process.env.NODE_ENV === 'development') {
        // Development error response
        errorResponse.stack = err.stack;
        errorResponse.error = err;
    }

    if (err.isOperational || err.name === 'MulterError') {
        // Operational, trusted error: send message to client
        res.status(err.statusCode).json(errorResponse);
    } else {
        // Programming or other unknown error: don't leak error details
        console.error('ERROR 💥', err);
        if (process.env.NODE_ENV === 'development') {
            res.status(err.statusCode).json(errorResponse);
        } else {
            res.status(500).json({
                success: false,
                status: 'error',
                message: 'Something went wrong!'
            });
        }
    }
};

// Handle specific MongoDB errors
export const handleMongoError = (err) => {
    if (err.name === 'CastError') {
        return new AppError(`Invalid ${err.path}: ${err.value}`, 400);
    }
    if (err.code === 11000) {
        // Handle duplicate key error
        const field = Object.keys(err.keyPattern || {})[0] || 'field';
        const value = err.keyValue ? Object.values(err.keyValue)[0] : 'value';
        if (field === 'email') {
            return new AppError('User already exists with this email', 400);
        }
        return new AppError(`Duplicate ${field} value: ${value}. Please use another value!`, 400);
    }
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(el => el.message);
        return new AppError(`Invalid input data. ${errors.join('. ')}`, 400);
    }
    return err;
};

// Handle JWT errors
export const handleJWTError = () => 
    new AppError('Invalid token. Please log in again!', 401);

export const handleJWTExpiredError = () => 
    new AppError('Your token has expired! Please log in again.', 401);
