import nodemailer from 'nodemailer';
import { User } from '../types';
import {
  getWelcomeEmail,
  getPasswordResetEmail,
  getAccountLockedEmail,
  getNewLoginEmail,
  getRoleChangeEmail
} from '../utils/emailTemplates';

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export class EmailService {
  private static async sendEmail(to: string, subject: string, html: string) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to,
        subject,
        html
      });
      console.log(`Email sent successfully to ${to}`);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  static async sendWelcomeEmail(user: User) {
    const { subject, html } = getWelcomeEmail(user);
    await this.sendEmail(user.email, subject, html);
  }

  static async sendPasswordResetEmail(email: string, resetToken: string) {
    const { subject, html } = getPasswordResetEmail(resetToken);
    await this.sendEmail(email, subject, html);
  }

  static async sendAccountLockedEmail(user: User) {
    const { subject, html } = getAccountLockedEmail(user);
    await this.sendEmail(user.email, subject, html);
  }

  static async sendNewLoginEmail(user: User, ipAddress: string, userAgent: string) {
    const { subject, html } = getNewLoginEmail(user, ipAddress, userAgent);
    await this.sendEmail(user.email, subject, html);
  }

  static async sendRoleChangeEmail(user: User, newRole: string) {
    const { subject, html } = getRoleChangeEmail(user, newRole);
    await this.sendEmail(user.email, subject, html);
  }
} 