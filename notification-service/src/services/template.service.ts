import path from 'path';
import ejs from 'ejs';
import { EmailData } from '../schemas/email.schema';
import logger from "../config/logger";

const templateMap: Record<string, string> = {
    booking_created_successful: 'bookingCreatedSuccessful.ejs',
    booking_deleted_successful: 'bookingDeletedSuccessful.ejs',
    event_deleted_by_admin: 'eventDeletedSuccessful.ejs',
    event_updated_by_admin: 'eventUpdatedSuccessful.ejs',
};

export const renderEmailTemplate = async (emailData: EmailData): Promise<string> => {
    const templateName = templateMap[emailData.emailType];
    if (!templateName) {
        const error = `No template found for email type: ${emailData.emailType}`;
        logger.error(error);
        throw new Error(error);
    }

    const templatePath = path.join(__dirname, '../templates', templateName);
    logger.debug(`Rendering template for ${emailData.emailType} from ${templatePath}`);

    try {
        return await ejs.renderFile(templatePath, emailData);
    } catch (err) {
        logger.error('Error rendering email template', { error: err });
        throw err;
    }
};