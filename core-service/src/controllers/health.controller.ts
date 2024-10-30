import { Request, Response } from 'express';
import { getHealthStatus } from '../services/health.service';

export const healthCheck = async (_req: Request, res: Response) => {
    const healthStatus = await getHealthStatus();
    res.status(healthStatus.status === 'healthy' ? 200 : 503).json(healthStatus);
};