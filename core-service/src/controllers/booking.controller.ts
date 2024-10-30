import {Response} from 'express';
import {AuthenticatedRequest} from "../types/express";
import {bookingService} from "../services";
import {CreateBookingData} from "../schemas/booking.schema";
import {EventBookingParams, EventParams} from "../types/booking";


export const createBooking = async (req: AuthenticatedRequest<CreateBookingData, EventParams>, res: Response) => {
    const eventId = parseInt(req.params.eventId, 10);
    const { ticketCount } = req.body;

    const booking = await bookingService.create(eventId, req.user, ticketCount);
    res.status(201).json(booking);
};

export const getBooking = async (req: AuthenticatedRequest<{}, EventBookingParams>, res: Response) => {
    const eventId = parseInt(req.params.eventId, 10);
    const bookingId = parseInt(req.params.bookingId, 10);

    const booking = await bookingService.get(eventId, bookingId);
    res.status(200).json(booking);
};

export const cancelBooking = async (req: AuthenticatedRequest<{}, EventBookingParams>, res: Response) => {
    const eventId = parseInt(req.params.eventId, 10);
    const bookingId = parseInt(req.params.bookingId, 10);

    await bookingService.remove(eventId, bookingId, req.user);
    res.status(204).send();
};
