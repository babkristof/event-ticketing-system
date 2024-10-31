import { EmailData } from '../schemas/email.schema';
import { renderEmailTemplate } from './template.service';
import { getTransporter } from "../utils/email.util";
import logger from "../config/logger";

export const sendEmail = async (emailData: EmailData) => {
    try {
        const html = await renderEmailTemplate(emailData);
        const mailOptions = {
            from: 'no-reply@example.com',
            to: emailData.recipient,
            subject: getEmailSubject(emailData.emailType),
            html,
        };

        logger.debug(`Sending email to ${emailData.recipient} with subject "${mailOptions.subject}"`);
        await getTransporter().sendMail(mailOptions);
        logger.info(`Email sent to ${emailData.recipient} for ${emailData.emailType}`);
    } catch (err) {
        logger.error(`Failed to send email to ${emailData.recipient}`, { error: err });
        throw err;
    }
};

const getEmailSubject = (emailType: string): string => {
    switch (emailType) {
        case 'booking_created_successful':
            return 'Your Booking is Confirmed';
        case 'booking_deleted_successful':
            return 'Booking Cancellation Confirmed';
        case 'event_deleted_by_admin':
            return 'Event deleted';
        default:
            return 'Notification';
    }
};