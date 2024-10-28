import { Router } from 'express';
import authRoutes from './auth.route';
import userRoutes from "./user.route";

const apiRouter: Router = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/user', userRoutes)

export default apiRouter;
