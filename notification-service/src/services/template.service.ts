import path from 'path';
import ejs from 'ejs';
import { EmailData } from '../schemas/email.schema';

const templateMap: Record<string, string> = {
    booking_created_successful: 'bookingCreatedSuccessful.ejs',
    booking_created_failed: 'bookingCreatedFailed.ejs',
    booking_deleted_successful: 'bookingDeletedSuccessful.ejs',
    booking_deleted_failed: 'bookingDeletedFailed.ejs',
};

export const renderEmailTemplate = async (emailData: EmailData): Promise<string> => {
    const templateName = templateMap[emailData.emailType];
    const templatePath = path.join(__dirname, '../templates', templateName);

    return ejs.renderFile(templatePath, emailData);
};
