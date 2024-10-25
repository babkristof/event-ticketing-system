import { ErrorCode } from "./ErrorCode";

export class HttpException extends Error {
    message: string;
    errorCode: ErrorCode;
    statusCode: number;
    errors?: Record<string, unknown>;

    constructor(message: string, errorCode: ErrorCode, statusCode: number, errors?: Record<string, unknown>) {
        super(message);
        this.message = message;
        this.errorCode = errorCode;
        this.statusCode = statusCode;
        this.errors = errors;
    }
}