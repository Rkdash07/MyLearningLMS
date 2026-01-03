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

    if (err.isOperational) {
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
