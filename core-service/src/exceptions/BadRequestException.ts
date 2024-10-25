import { ErrorCode } from "./ErrorCode";
import { HttpException } from "./HttpException";

export class BadRequestException extends HttpException {
    constructor(message: string, errorCode: ErrorCode = ErrorCode.BAD_REQUEST) {
        super(message, errorCode, 400);
    }
}