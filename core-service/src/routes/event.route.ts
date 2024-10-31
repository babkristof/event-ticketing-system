import {Router} from "express";
import {Role} from "@prisma/client";
import {errorHandler} from "../middlewares/error.handler";
import authMiddleware from "../middlewares/auth.middleware";
import roleMiddleware from "../middlewares/role.middleware";
import { eventController} from "../controllers";
import {validateBody} from "../middlewares/validateBody.middleware";
import {createEventSchema, getEventSchema} from "../schemas/event.schema";
import {validateParams} from "../middlewares/validateParams.middleware";
import bookingRoutes from "./booking.route";


const eventRoutes: Router = Router();

eventRoutes.post('/', [authMiddleware, roleMiddleware(Role.ADMIN)], validateBody(createEventSchema), errorHandler(eventController.createEvent));
eventRoutes.get('/', [authMiddleware, roleMiddleware(Role.ADMIN)], errorHandler(eventController.getEvents));
eventRoutes.get('/:eventId', [authMiddleware, roleMiddleware(Role.ADMIN)], validateParams(getEventSchema), errorHandler(eventController.getEvent));
eventRoutes.delete('/:eventId', [authMiddleware, roleMiddleware(Role.ADMIN)], validateParams(getEventSchema), errorHandler(eventController.deleteEvent));

eventRoutes.use('/:eventId/bookings', bookingRoutes);

export default eventRoutes;
