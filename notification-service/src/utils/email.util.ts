import nodemailer, { Transporter } from 'nodemailer';
import {emailConfig} from "../config/config";

let transporter: Transporter | null = null;

export const getTransporter = (): Transporter => {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: emailConfig.host,
            port: emailConfig.port,
            auth: emailConfig.auth,
            secure: emailConfig.secure
        });
    }
    return transporter;
};