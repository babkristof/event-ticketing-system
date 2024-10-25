import { ErrorCode } from '../exceptions/ErrorCode';

export type ErrorResponse = {
    message: string;
    errorCode: ErrorCode | 'UNKNOWN_ERROR';
    errors?: any;
};