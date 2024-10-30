import { z } from 'zod';

export const emailDataSchema = z.object({
    recipient: z.string().email(),
    emailType: z.enum(['booking_created_successful', 'booking_created_failed', 'booking_deleted_successful', 'booking_deleted_failed']),
    userName: z.string(),
    eventName: z.string(),
    eventVenue: z.string(),
    eventTime: z.string(),
    ticketNumber: z.string(),
    bookingId: z.string().optional()
});

export type EmailData = z.infer<typeof emailDataSchema>;
