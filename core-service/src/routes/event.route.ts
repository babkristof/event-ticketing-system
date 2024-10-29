import {Router} from "express";
import {Role} from "@prisma/client";
import {errorHandler} from "../middlewares/error.handler";
import authMiddleware from "../middlewares/auth.middleware";
import roleMiddleware from "../middlewares/role.middleware";
import { eventController} from "../controllers";
import {validateBody} from "../middlewares/validateBody.middleware";
import {createEventSchema, getEventSchema} from "../schemas/event.schema";
import {validateParams} from "../middlewares/validateParams.middleware";


const eventRoutes: Router = Router();

eventRoutes.post('/', [authMiddleware, roleMiddleware(Role.ADMIN)], validateBody(createEventSchema), errorHandler(eventController.createEvent));
eventRoutes.get('/', [authMiddleware, roleMiddleware(Role.ADMIN)], errorHandler(eventController.getEvents));
eventRoutes.get('/:id', [authMiddleware, roleMiddleware(Role.ADMIN)], validateParams(getEventSchema), errorHandler(eventController.getEvent));

export default eventRoutes;
