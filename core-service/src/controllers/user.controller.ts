import {Response} from 'express';
import {AuthenticatedRequest} from "../types/express";
import {userService} from "../services";
import {UserWithBookings} from "../types/user";


export const me = async (req: AuthenticatedRequest, res: Response) => {
    const user: UserWithBookings = await userService.me(req.user.id);
    res.status(200).json(user);
};
