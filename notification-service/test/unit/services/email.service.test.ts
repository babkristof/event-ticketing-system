import { sendEmail } from '../../../src/services/email.service';
import { getTransporter } from '../../../src/utils/email.util';
import { renderEmailTemplate } from '../../../src/services/template.service';
import { EmailData } from '../../../src/schemas/email.schema';
import logger from '../../../src/config/logger';

jest.mock('../../../src/utils/email.util');
jest.mock('../../../src/config/logger');
jest.mock('../../../src/services/template.service');
const mockSendMail = jest.fn();
(getTransporter as jest.Mock).mockReturnValue({ sendMail: mockSendMail });
(renderEmailTemplate as jest.Mock).mockResolvedValue('Mocked HTML content');

describe('Email Service', () => {
    const emailData: EmailData = {
        emailType: 'booking_created_successful',
        recipient: 'test@example.com',
        userName: 'Test User',
        eventName: 'Event',
        eventVenue: 'Venue',
        eventTime: new Date().toTimeString(),
        ticketCount: 1,
        bookingId: 1
    };

    beforeEach(() => {
        mockSendMail.mockClear();
        jest.clearAllMocks();
    });

    it('sends an email with the correct parameters', async () => {
        await sendEmail(emailData);
        expect(mockSendMail).toHaveBeenCalledTimes(1);
        expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
            to: emailData.recipient,
            from: 'no-reply@example.com',
            subject: 'Your Booking is Confirmed'
        }));
    });

    it('sends an email with the correct subject for booking_deleted_successful', async () => {
        const deletedEmailData:EmailData = { ...emailData, emailType: 'booking_deleted_successful' };
        await sendEmail(deletedEmailData);

        expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
            subject: 'Booking Cancellation Confirmed'
        }));
    });

    it('sends an email with the correct subject for event_deleted_by_admin', async () => {
        const deletedEventEmailData: EmailData = { ...emailData, emailType: 'event_deleted_by_admin' };
        await sendEmail(deletedEventEmailData);

        expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
            subject: 'Event deleted'
        }));
    });
    it('sends an email with a default subject for unknown email types', async () => {
        const unknownEmailData = { ...emailData, emailType: 'unknown_type' as EmailData['emailType'] };
        await sendEmail(unknownEmailData);

        expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
            subject: 'Notification'
        }));
    });

    it('logs an error if email fails to send', async () => {
        mockSendMail.mockRejectedValueOnce(new Error('Email failed'));
        await expect(sendEmail(emailData)).rejects.toThrow('Email failed');
        expect(logger.error).toHaveBeenCalledWith(
            `Failed to send email to ${emailData.recipient}`,
            expect.objectContaining({ error: expect.any(Error) })
        );
    });
});