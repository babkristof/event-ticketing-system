import { z } from 'zod';

export const emailDataSchema = z.object({
    recipient: z.string().email(),
    emailType: z.enum(['booking_created_successful', 'booking_deleted_successful', 'event_deleted_by_admin', 'event_updated_by_admin']),
    userName: z.string(),
    eventName: z.string(),
    eventVenue: z.string(),
    eventTime: z.string(),
    ticketCount: z.number(),
    bookingId: z.number().optional()
});

export type EmailData = z.infer<typeof emailDataSchema>;