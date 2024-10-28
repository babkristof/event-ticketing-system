import { Router } from 'express';
import { errorHandler } from '../middlewares/error.handler';
import { login, signup } from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/validation.middleware';
import { LoginSchema, SignUpSchema } from '../schemas/auth.schema';

const authRoutes: Router = Router();

authRoutes.post('/signup', validateRequest(SignUpSchema), errorHandler(signup));
authRoutes.post('/login', validateRequest(LoginSchema), errorHandler(login));

export default authRoutes;
