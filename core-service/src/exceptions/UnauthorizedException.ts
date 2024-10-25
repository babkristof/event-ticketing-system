import { ErrorCode } from './ErrorCode';
import { HttpException } from './HttpException';

export class UnauthorizedException extends HttpException {
  constructor(message: string, errorCode: ErrorCode = ErrorCode.UNAUTHORIZED) {
    super(message, errorCode, 401);
  }
}
