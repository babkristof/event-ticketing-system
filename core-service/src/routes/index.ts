import { Router } from 'express';
import authRoutes from './auth.route';

const apiRouter: Router = Router();

apiRouter.use('/auth', authRoutes);

export default apiRouter;
