import { NextFunction, Response, Request } from "express";
import {UnauthorizedException} from "../exceptions/UnauthorizedException";
import {ErrorCode} from "../exceptions/ErrorCode";
import {getPrismaClient} from "../database/prismaClient";
import {toPublicUser} from "../utils/user.util";
import {verifyToken} from "../utils/jwt.util";
import logger from "../config/logger";

const authMiddleware = async (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new UnauthorizedException('Unauthorized', ErrorCode.UNAUTHORIZED));
    }

    const token = authHeader.split(' ')[1];

    try {
        const payload = verifyToken(token);

        const user = await getPrismaClient().user.findUnique({ where: { id: payload.userId } });
        if (!user) {
            return next(new UnauthorizedException('Unauthorized', ErrorCode.UNAUTHORIZED));
        }

        req.user = toPublicUser(user);
        next();
    } catch (error) {
        logger.error(`Authentication error: ${error}`);
        next(new UnauthorizedException('Unauthorized', ErrorCode.UNAUTHORIZED));
    }
};

export default authMiddleware;
