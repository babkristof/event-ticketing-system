import { Response } from 'express';
import { AuthenticatedRequest } from '../types/express';
import { eventService } from '../services';
import { CreateEventData, GetEventData, UpdateEventData } from '../schemas/event.schema';
import { Event } from '@prisma/client';
import { UpdateEventParams } from '../types/event';

export const createEvent = async (req: AuthenticatedRequest<CreateEventData>, res: Response) => {
  const createdEvent: Event = await eventService.create(req.body, req.user.id);
  res.status(201).json({ id: createdEvent.id });
};

export const getEvent = async (req: AuthenticatedRequest<GetEventData>, res: Response) => {
  const event: Event = await eventService.get(req.params);
  res.status(200).json(event);
};

export const getEvents = async (_req: AuthenticatedRequest, res: Response) => {
  const events: Event[] = await eventService.getAll();
  res.status(200).json(events);
};

export const deleteEvent = async (req: AuthenticatedRequest<GetEventData>, res: Response) => {
  await eventService.remove(req.params);
  res.status(204).send();
};

export const updateEvent = async (req: AuthenticatedRequest<UpdateEventData, UpdateEventParams>, res: Response) => {
  const updatedEvent = await eventService.update(req.params.eventId, req.body);
  res.status(200).json(updatedEvent);
};
