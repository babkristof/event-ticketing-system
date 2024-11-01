import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware';
import { bookingController } from '../controllers';
import { validateBody } from '../middlewares/validateBody.middleware';
import { validateParams } from '../middlewares/validateParams.middleware';
import { createBookingSchema, getBookingSchema } from '../schemas/booking.schema';
import { errorHandler } from '../middlewares/error.handler';
import roleMiddleware from '../middlewares/role.middleware';
import { Role } from '@prisma/client';

const bookingRoutes: Router = Router({ mergeParams: true });

bookingRoutes.post(
  '/',
  [authMiddleware, roleMiddleware(Role.CUSTOMER)],
  validateBody(createBookingSchema),
  errorHandler(bookingController.createBooking)
);
bookingRoutes.get(
  '/:bookingId',
  [authMiddleware, roleMiddleware(Role.CUSTOMER)],
  validateParams(getBookingSchema),
  errorHandler(bookingController.getBooking)
);
bookingRoutes.delete(
  '/:bookingId',
  [authMiddleware, roleMiddleware(Role.CUSTOMER)],
  validateParams(getBookingSchema),
  errorHandler(bookingController.cancelBooking)
);

export default bookingRoutes;
