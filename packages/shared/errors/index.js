export const ErrorCodes = {
    UNAUTHORIZED: 'UNAUTHORIZED',
    BAD_REQUEST: 'BAD_REQUEST',
    NOT_FOUND: 'NOT_FOUND',
    INTERNAL_ERROR: 'INTERNAL_ERROR'
};

export class AppError extends Error {
    constructor(message, statusCode, errorCode) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
    }
}
