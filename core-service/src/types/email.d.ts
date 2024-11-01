export type EmailJobData = {
    recipient: string;
    emailType: 'booking_created_successful' | 'booking_deleted_successful' | 'event_deleted_by_admin' | 'event_updated_by_admin';
    userName: string;
    eventName: string;
    eventVenue: string;
    eventTime: Date;
    bookingId?: number;
    ticketCount: number;
};
