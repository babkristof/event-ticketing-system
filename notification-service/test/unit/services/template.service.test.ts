import { renderEmailTemplate } from '../../../src/services/template.service';
import { EmailData } from '../../../src/schemas/email.schema';
import logger from "../../../src/config/logger";
import ejs from "ejs";

jest.mock('ejs', () => ({
    renderFile: jest.fn().mockImplementation((_, data) =>
        Promise.resolve(`Rendered template for ${data.emailType}`)
    )
}));
jest.mock('../../../src/config/logger', () => ({
    error: jest.fn(),
    debug: jest.fn(),
}));

describe('Template Service', () => {
    it('renders the correct template for booking_created_successful', async () => {
        const emailData: EmailData = { emailType: 'booking_created_successful', recipient: 'test@example.com', userName: 'Test User', eventName: 'Event', eventVenue: 'Venue', eventTime: new Date().toTimeString(), ticketCount: 1 };
        const result = await renderEmailTemplate(emailData);
        expect(result).toContain('Rendered template for booking_created_successful');
    });

    it('renders the correct template for event_deleted_by_admin', async () => {
        const emailData: EmailData = { emailType: 'event_deleted_by_admin', recipient: 'test@example.com', userName: 'Test User', eventName: 'Event', eventVenue: 'Venue', eventTime: new Date().toTimeString(), ticketCount: 1 };
        const result = await renderEmailTemplate(emailData);
        expect(result).toContain('Rendered template for event_deleted_by_admin');
    });

    it('throws error for missing template', async () => {
        const emailData: EmailData = {
            emailType: 'invalid_type' as EmailData['emailType'],
            recipient: 'test@example.com',
            userName: 'username',
            eventName: 'eventname',
            eventVenue: 'eventvenue',
            eventTime: 'eventtime',
            ticketCount: 1,
            bookingId: 1
        };

        await expect(renderEmailTemplate(emailData)).rejects.toThrow('No template found for email type: invalid_type');
        expect(logger.error).toHaveBeenCalledWith('No template found for email type: invalid_type');
    });
    it('logs and rethrows an error if template rendering fails', async () => {
        const emailData: EmailData = {
            emailType: 'booking_created_successful',
            recipient: 'test@example.com',
            userName: 'Test User',
            eventName: 'Event',
            eventVenue: 'Venue',
            eventTime: new Date().toTimeString(),
            ticketCount: 1
        };

        const mockError = new Error('Render failure');
        (ejs.renderFile as jest.Mock).mockRejectedValue(mockError);

        await expect(renderEmailTemplate(emailData)).rejects.toThrow('Render failure');
        expect(logger.error).toHaveBeenCalledWith('Error rendering email template', { error: mockError });
    });
});
