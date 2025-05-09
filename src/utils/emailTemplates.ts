import { User } from '../types';

interface EmailTemplate {
  subject: string;
  html: string;
}

export const getWelcomeEmail = (user: User): EmailTemplate => ({
  subject: 'Welcome to the Analytics Dashboard',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1976d2;">Welcome to the Analytics Dashboard!</h2>
      <p>Dear ${user.first_name} ${user.last_name},</p>
      <p>Welcome to the Analytics Dashboard. Your account has been successfully created.</p>
      <p>You can now access the dashboard using your email: ${user.email}</p>
      <p>If you have any questions, please don't hesitate to contact the support team.</p>
      <div style="margin-top: 20px; padding: 20px; background-color: #f5f5f5; border-radius: 5px;">
        <p style="margin: 0;">Best regards,<br>The Analytics Team</p>
      </div>
    </div>
  `
});

export const getPasswordResetEmail = (resetToken: string): EmailTemplate => ({
  subject: 'Password Reset Request',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1976d2;">Password Reset Request</h2>
      <p>We received a request to reset your password.</p>
      <p>Click the button below to reset your password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}/reset-password/${resetToken}" 
           style="background-color: #1976d2; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 4px; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <div style="margin-top: 20px; padding: 20px; background-color: #f5f5f5; border-radius: 5px;">
        <p style="margin: 0;">Best regards,<br>The Analytics Team</p>
      </div>
    </div>
  `
});

export const getAccountLockedEmail = (user: User): EmailTemplate => ({
  subject: 'Account Locked - Security Alert',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #d32f2f;">Account Locked - Security Alert</h2>
      <p>Dear ${user.first_name} ${user.last_name},</p>
      <p>We detected multiple failed login attempts on your account. For security reasons, 
         your account has been temporarily locked.</p>
      <p>To unlock your account, please click the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}/unlock-account" 
           style="background-color: #1976d2; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 4px; display: inline-block;">
          Unlock Account
        </a>
      </div>
      <p>If you didn't attempt to log in, please contact support immediately.</p>
      <div style="margin-top: 20px; padding: 20px; background-color: #f5f5f5; border-radius: 5px;">
        <p style="margin: 0;">Best regards,<br>The Analytics Team</p>
      </div>
    </div>
  `
});

export const getNewLoginEmail = (user: User, ipAddress: string, userAgent: string): EmailTemplate => ({
  subject: 'New Login Detected',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1976d2;">New Login Detected</h2>
      <p>Dear ${user.first_name} ${user.last_name},</p>
      <p>A new login was detected on your account:</p>
      <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>IP Address:</strong> ${ipAddress}</p>
        <p><strong>Device:</strong> ${userAgent}</p>
      </div>
      <p>If this was you, you can ignore this email. If you didn't log in, 
         please secure your account immediately.</p>
      <div style="margin-top: 20px; padding: 20px; background-color: #f5f5f5; border-radius: 5px;">
        <p style="margin: 0;">Best regards,<br>The Analytics Team</p>
      </div>
    </div>
  `
});

export const getRoleChangeEmail = (user: User, newRole: string): EmailTemplate => ({
  subject: 'Account Role Updated',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1976d2;">Account Role Updated</h2>
      <p>Dear ${user.first_name} ${user.last_name},</p>
      <p>Your account role has been updated to: <strong>${newRole}</strong></p>
      <p>This change affects your access permissions in the system.</p>
      <p>If you have any questions about your new role, please contact your administrator.</p>
      <div style="margin-top: 20px; padding: 20px; background-color: #f5f5f5; border-radius: 5px;">
        <p style="margin: 0;">Best regards,<br>The Analytics Team</p>
      </div>
    </div>
  `
}); 