export type EmailJobData = {
    recipient: string;
    emailType: 'booking_created_successful' | 'booking_deleted_successful';
    userName: string;
    eventName: string;
    eventVenue: string;
    eventTime: Date;
    bookingId?: number;
    ticketCount: number;
};
