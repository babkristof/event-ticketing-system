import { Router } from 'express';
import authRoutes from './auth.route';
import userRoutes from "./user.route";
import eventRoutes from "./event.route";

const apiRouter: Router = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes)
apiRouter.use('/events', eventRoutes)


export default apiRouter;
