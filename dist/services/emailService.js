"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const emailTemplates_1 = require("../utils/emailTemplates");
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});
class EmailService {
    static async sendEmail(to, subject, html) {
        try {
            await transporter.sendMail({
                from: process.env.SMTP_FROM,
                to,
                subject,
                html
            });
            console.log(`Email sent successfully to ${to}`);
        }
        catch (error) {
            console.error('Error sending email:', error);
            throw new Error('Failed to send email');
        }
    }
    static async sendWelcomeEmail(user) {
        const { subject, html } = (0, emailTemplates_1.getWelcomeEmail)(user);
        await this.sendEmail(user.email, subject, html);
    }
    static async sendPasswordResetEmail(email, resetToken) {
        const { subject, html } = (0, emailTemplates_1.getPasswordResetEmail)(resetToken);
        await this.sendEmail(email, subject, html);
    }
    static async sendAccountLockedEmail(user) {
        const { subject, html } = (0, emailTemplates_1.getAccountLockedEmail)(user);
        await this.sendEmail(user.email, subject, html);
    }
    static async sendNewLoginEmail(user, ipAddress, userAgent) {
        const { subject, html } = (0, emailTemplates_1.getNewLoginEmail)(user, ipAddress, userAgent);
        await this.sendEmail(user.email, subject, html);
    }
    static async sendRoleChangeEmail(user, newRole) {
        const { subject, html } = (0, emailTemplates_1.getRoleChangeEmail)(user, newRole);
        await this.sendEmail(user.email, subject, html);
    }
}
exports.EmailService = EmailService;
//# sourceMappingURL=emailService.js.map