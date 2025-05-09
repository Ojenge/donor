"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = require("../db");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/', auth_1.authenticateToken, auth_1.requireAdmin, async (_req, res) => {
    try {
        const [users] = await db_1.pool.query(`
      SELECT 
        id, email, role, first_name, last_name, 
        department, is_active, last_login, 
        created_at, updated_at
      FROM users
      ORDER BY created_at DESC
    `);
        res.json(users);
    }
    catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/me', auth_1.authenticateToken, async (req, res) => {
    var _a;
    try {
        const [users] = await db_1.pool.query('SELECT id, email, role, first_name, last_name, department, is_active, last_login FROM users WHERE id = ?', [(_a = req.user) === null || _a === void 0 ? void 0 : _a.id]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(users[0]);
    }
    catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const userData = req.body;
        if (!userData.email || !userData.password || !userData.role || !userData.first_name || !userData.last_name || !userData.department) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        const [existingUsers] = await db_1.pool.query('SELECT id FROM users WHERE email = ?', [userData.email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ error: 'Email already exists' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(userData.password, 10);
        const [result] = await db_1.pool.query(`INSERT INTO users (
        email, password, role, first_name, last_name, 
        department, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, true, NOW(), NOW())`, [
            userData.email,
            hashedPassword,
            userData.role,
            userData.first_name,
            userData.last_name,
            userData.department,
        ]);
        const [users] = await db_1.pool.query('SELECT id, email, role, first_name, last_name, department, is_active FROM users WHERE id = ?', [result.insertId]);
        res.status(201).json(users[0]);
    }
    catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.put('/:id', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const userData = req.body;
        const [existingUsers] = await db_1.pool.query('SELECT id FROM users WHERE id = ?', [userId]);
        if (existingUsers.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        const updates = [];
        const values = [];
        if (userData.email) {
            updates.push('email = ?');
            values.push(userData.email);
        }
        if (userData.password) {
            const hashedPassword = await bcryptjs_1.default.hash(userData.password, 10);
            updates.push('password = ?');
            values.push(hashedPassword);
        }
        if (userData.role) {
            updates.push('role = ?');
            values.push(userData.role);
        }
        if (userData.first_name) {
            updates.push('first_name = ?');
            values.push(userData.first_name);
        }
        if (userData.last_name) {
            updates.push('last_name = ?');
            values.push(userData.last_name);
        }
        if (userData.department) {
            updates.push('department = ?');
            values.push(userData.department);
        }
        if (userData.is_active !== undefined) {
            updates.push('is_active = ?');
            values.push(userData.is_active);
        }
        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }
        updates.push('updated_at = NOW()');
        values.push(userId);
        await db_1.pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
        const [users] = await db_1.pool.query('SELECT id, email, role, first_name, last_name, department, is_active FROM users WHERE id = ?', [userId]);
        res.json(users[0]);
    }
    catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.delete('/:id', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const [existingUsers] = await db_1.pool.query('SELECT id FROM users WHERE id = ?', [userId]);
        if (existingUsers.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        await db_1.pool.query('DELETE FROM users WHERE id = ?', [userId]);
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map