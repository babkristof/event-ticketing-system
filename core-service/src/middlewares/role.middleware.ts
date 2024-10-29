import {UnauthorizedException} from "../exceptions/UnauthorizedException";
import {ErrorCode} from "../exceptions/ErrorCode";
import {Role} from "@prisma/client";
import {Response, Request, NextFunction} from "express";
import logger from "../config/logger";

const roleMiddleware = (requiredRole: Role) => async (req: Request, _res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user || user.role !== requiredRole) {
        logger.debug(`Unauthorized access attempt by user: ${user?.id} with role ${user?.role}, required role: ${requiredRole}`)
        return next(new UnauthorizedException('Unauthorized', ErrorCode.UNAUTHORIZED));
    }
    next();
};

export default roleMiddleware;
