import { Request } from 'express';
import {PublicUser} from "./user";

declare module 'express-serve-static-core' {
    interface Request {
        user?: PublicUser;
    }
}

export interface AuthenticatedRequest extends Request {
    user: PublicUser;
}