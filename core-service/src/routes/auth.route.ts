import { Router } from 'express';
import { errorHandler } from '../middlewares/error.handler';
import { login, signup } from '../controllers/auth.controller';

const authRoutes: Router = Router();

authRoutes.post('/signup', errorHandler(signup));
authRoutes.post('/login', errorHandler(login));

export default authRoutes;
