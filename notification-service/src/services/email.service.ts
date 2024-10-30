import {EmailData} from '../schemas/email.schema';
import {renderEmailTemplate} from './template.service';
import {getTransporter} from "../utils/email.util";

export const sendEmail = async (emailData: EmailData) => {
    const html = await renderEmailTemplate(emailData);

    const mailOptions = {
        from: 'no-reply@example.com',
        to: emailData.recipient,
        subject: getEmailSubject(emailData.emailType),
        html,
    };

    await getTransporter().sendMail(mailOptions);
};

const getEmailSubject = (emailType: string): string => {
    switch (emailType) {
        case 'booking_created_successful':
            return 'Your Booking is Confirmed';
        case 'booking_created_failed':
            return 'Booking Failed';
        case 'booking_deleted_successful':
            return 'Booking Cancellation Confirmed';
        case 'booking_deleted_failed':
            return 'Booking Cancellation Failed';
        default:
            return 'Notification';
    }
};