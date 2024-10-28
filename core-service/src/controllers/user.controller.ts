import {Response} from 'express';
import {AuthenticatedRequest} from "../types/express";


export const me = async (req: AuthenticatedRequest, res: Response) => {
    res.status(200).json(req.user);
};
