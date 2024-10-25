import { ErrorCode } from "./ErrorCode";
import { HttpException } from "./HttpException";

export class InternalException extends HttpException {
    constructor(message: string, errorCode: ErrorCode = ErrorCode.INTERNAL_EXCEPTION) {
        super(message, errorCode, 500);
    }
}