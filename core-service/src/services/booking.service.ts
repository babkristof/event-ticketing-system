import { Booking } from '@prisma/client';
import { NotFoundException } from '../exceptions/NotFoundException';
import { ErrorCode } from '../exceptions/ErrorCode';
import { ConflictException } from '../exceptions/ConflictException';
import { getPrismaClient } from '../database/prismaClient';
import { addEmailJob } from '../queues/email.queue';
import { PublicUser } from '../types/user';
import logger from '../config/logger';

export const create = async (eventId: number, user: PublicUser, ticketCount: number): Promise<Booking> => {
  return getPrismaClient().$transaction(async (tx) => {
    const event = await tx.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found', ErrorCode.EVENT_NOT_FOUND);
    if (event.availableTickets < ticketCount)
      throw new ConflictException('Not enough tickets available', ErrorCode.NOT_ENOUGH_TICKET);

    const booking = await tx.booking.create({
      data: { userId: user.id, eventId, ticketCount }
    });
    await tx.event.update({
      where: { id: eventId },
      data: { availableTickets: { decrement: ticketCount } }
    });
    logger.info(`Booking created successfully for user ${user.id} for event ${eventId}`);
    addEmailJob({
      recipient: user.email,
      emailType: 'booking_created_successful',
      userName: user.name,
      eventName: event.name,
      eventVenue: event.venue,
      eventTime: event.date,
      bookingId: booking.id,
      ticketCount: booking.ticketCount
    }).catch((err) => {
      logger.error('Email sending failed', err);
    });
    return booking;
  });
};

export const get = async (eventId: number, bookingId: number): Promise<Booking> => {
  const booking = await getPrismaClient().booking.findFirst({
    where: { id: bookingId, eventId }
  });
  if (!booking) throw new NotFoundException('Booking not found', ErrorCode.BOOKING_NOT_FOUND);
  logger.debug(`Fetched booking ${bookingId} for event ${eventId}`);
  return booking;
};

export const remove = async (eventId: number, bookingId: number, user: PublicUser): Promise<void> => {
  await getPrismaClient().$transaction(async (tx) => {
    const booking = await tx.booking.findFirst({
      where: { id: bookingId, eventId }
    });
    if (!booking) throw new NotFoundException('Booking not found', ErrorCode.BOOKING_NOT_FOUND);

    await tx.booking.delete({
      where: { id: bookingId }
    });
    const event = await tx.event.update({
      where: { id: eventId },
      data: { availableTickets: { increment: booking.ticketCount } }
    });
    logger.info(`Booking ${bookingId} canceled successfully for user ${user.id} on event ${eventId}`);
    addEmailJob({
      recipient: user.email,
      emailType: 'booking_deleted_successful',
      userName: user.name,
      eventName: event.name,
      eventVenue: event.venue,
      eventTime: event.date,
      bookingId: booking.id,
      ticketCount: booking.ticketCount
    }).catch((err) => {
      logger.error('Email sending failed', err);
    });
  });
};
