import {z} from "zod";

export const createEventSchema = z.object({
    name: z.string().min(1, "Event name is required").max(100, "Event name too long"),
    description: z.string().min(1, "Event description is required").max(500, "Description too long"),
    date: z.string()
        .refine((date) => !isNaN(Date.parse(date)), { message: "Invalid date format" })
        .transform((date) => new Date(date)),
    venue: z.string().min(1, "Venue is required"),
    totalTickets: z.number().int().positive("Total tickets must be a positive integer"),
});

export const getEventSchema = z.object({
    eventId: z.preprocess(
        (val) => (typeof val === "string" ? parseInt(val, 10) : val),
        z.number().int().positive("Event ID must be a positive integer")
    ),
});


export type CreateEventData = z.infer<typeof createEventSchema>;
export type GetEventData = z.infer<typeof getEventSchema>;

