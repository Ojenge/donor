"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("../db");
const crypto_1 = __importDefault(require("crypto"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const router = express_1.default.Router();
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await db_1.pool.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = rows[0];
        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
        if (!isValidPassword) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        });
    }
    catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/me', async (req, res) => {
    if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
    }
    try {
        const [rows] = await db_1.pool.query('SELECT id, email, role FROM users WHERE id = ?', [req.user.id]);
        const user = rows[0];
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json({
            id: user.id,
            email: user.email,
            role: user.role
        });
    }
    catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const [rows] = await db_1.pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        const user = rows[0];
        if (!user) {
            return res.json({ message: 'If your email is registered, you will receive a password reset link' });
        }
        const resetToken = crypto_1.default.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000);
        await db_1.pool.execute('UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?', [resetToken, resetTokenExpiry, user.id]);
        const transporter = nodemailer_1.default.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        await transporter.sendMail({
            to: user.email,
            subject: 'Password Reset Request',
            html: `
        <p>You requested a password reset.</p>
        <p>Click this <a href="${resetUrl}">link</a> to reset your password.</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
        });
        res.json({ message: 'If your email is registered, you will receive a password reset link' });
    }
    catch (error) {
        console.error('Password reset request error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
router.post('/reset-password', async (req, res) => {
    try {
        const { token, password } = req.body;
        const [rows] = await db_1.pool.execute('SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()', [token]);
        const user = rows[0];
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        await db_1.pool.execute('UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?', [hashedPassword, user.id]);
        res.json({ message: 'Password has been reset successfully' });
    }
    catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map