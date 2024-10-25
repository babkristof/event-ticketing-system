import { HttpException } from './HttpException';
import { ErrorCode } from './ErrorCode';

export class NotFoundException extends HttpException {
  constructor(message: string, errorCode: ErrorCode = ErrorCode.NOT_FOUND) {
    super(message, errorCode, 400);
  }
}
