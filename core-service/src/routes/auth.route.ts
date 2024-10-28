import { Router } from 'express';
import { errorHandler } from '../middlewares/error.handler';
import { validateRequest } from '../middlewares/validation.middleware';
import { LoginSchema, SignUpSchema } from '../schemas/auth.schema';
import { authController} from "../controllers";

const authRoutes: Router = Router();

authRoutes.post('/signup', validateRequest(SignUpSchema), errorHandler(authController.signup));
authRoutes.post('/login', validateRequest(LoginSchema), errorHandler(authController.login));

export default authRoutes;
