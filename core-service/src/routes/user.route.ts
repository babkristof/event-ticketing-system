import {errorHandler} from "../middlewares/error.handler";
import {Router} from "express";
import authMiddleware from "../middlewares/auth.middleware";
import {userController} from "../controllers";

const userRoutes: Router = Router();

userRoutes.get('/me', [authMiddleware], errorHandler(userController.me));

export default userRoutes;
