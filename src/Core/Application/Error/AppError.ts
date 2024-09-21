export class AppError extends Error {
    public statusCode: number;
    public errorCode: number;
    public isOperational: boolean;

    constructor(message: string, statusCode = 500, errorCode = 1, isOperational = true) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this);
    }
}
//For wrong field inputs and other validation errors
// 400 Bad Request
export class ValidationError extends AppError {
    constructor(message: string) {
        super(message, 400, 9);
    }
}

//For user authentication errors and other authentication error
// 401 Unauthorized
export class AuthenticationError extends AppError {
    constructor(message: string) {
        super(message, 401, 2);
    }
}

// For accessibility-based errors related to duplicate accounts
export class AccessibilityError extends AppError {
    constructor(message: string) {
        super(message, 400, 16);
    }
}

// 403 Forbidden
export class ForbiddenError extends AppError {
    constructor(message: string) {
        super(message, 403, 10);
    }
}

// 404 Not Found
export class NotFoundError extends AppError {
    constructor(message: string) {
        super(message, 404, 3);
    }
}

// 409 Conflict
export class ConflictError extends AppError {
    constructor(message: string) {
        super(message, 409, 5);
    }
}

// 422 Unprocessable Entity
export class UnprocessableEntityError extends AppError {
    constructor(message: string) {
        super(message, 422, 11);
    }
}

// 429 Too Many Requests
export class RateLimitError extends AppError {
    constructor(message: string) {
        super(message, 429, 12);
    }
}

// 500 Internal Server Error
export class InternalServerError extends AppError {
    constructor(message: string) {
        super(message, 500, 1);
    }
}

// 500 Configuration Error (specific type of Internal Server Error)
export class ConfigurationError extends AppError {
    constructor(message: string) {
        super(message, 500, 4);
    }
}

// 502 Bad Gateway
export class BadGatewayError extends AppError {
    constructor(message: string) {
        super(message, 502, 13);
    }
}

// 503 Service Unavailable
export class ServiceUnavailableError extends AppError {
    constructor(message: string) {
        super(message, 503, 14);
    }
}

// 504 Gateway Timeout
export class GatewayTimeoutError extends AppError {
    constructor(message: string) {
        super(message, 504, 15);
    }
}