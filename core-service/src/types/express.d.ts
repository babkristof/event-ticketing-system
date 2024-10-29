import { Request } from 'express';
import {PublicUser} from "./user";

declare module 'express-serve-static-core' {
    interface Request {
        user?: PublicUser;
    }
}

export interface AuthenticatedRequest<TBody = never, TParams = never> extends Request {
    user: PublicUser;
    body: TBody;
    params: TParams;
}