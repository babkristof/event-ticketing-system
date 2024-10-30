import { HttpException } from './HttpException';
import { ErrorCode } from './ErrorCode';

export class ConflictException extends HttpException {
    constructor(message: string, errorCode: ErrorCode = ErrorCode.CONFLICT) {
        super(message, errorCode, 409);
    }
}
