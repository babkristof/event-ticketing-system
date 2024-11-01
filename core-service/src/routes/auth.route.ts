import { Router } from 'express';
import { errorHandler } from '../middlewares/error.handler';
import { validateBody } from '../middlewares/validateBody.middleware';
import { LoginSchema, SignUpSchema } from '../schemas/auth.schema';
import { authController } from '../controllers';

const authRoutes: Router = Router();

authRoutes.post('/signup', validateBody(SignUpSchema), errorHandler(authController.signup));
authRoutes.post('/login', validateBody(LoginSchema), errorHandler(authController.login));

export default authRoutes;
