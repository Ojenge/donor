import express from 'express';
import { pool } from '../db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import bcrypt from 'bcryptjs';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { User, UserCreate, UserUpdate } from '../types';

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticateToken, requireAdmin, async (_req, res) => {
  try {
    const [users] = await pool.query<RowDataPacket[]>(`
      SELECT 
        id, email, role, first_name, last_name, 
        department, is_active, 
        created_at
      FROM users
      ORDER BY created_at DESC
    `);

    res.json(users as User[]);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.query<RowDataPacket[]>(
      'SELECT id, email, role, first_name, last_name, department, is_active FROM users WHERE id = ?',
      [req.user?.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(users[0] as User);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new user (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const userData: UserCreate = req.body;

    // Validate required fields
    if (!userData.email || !userData.password || !userData.role || !userData.first_name || !userData.last_name || !userData.department) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if email already exists
    const [existingUsers] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ?',
      [userData.email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Insert new user
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO users (
        email, password, role, first_name, last_name, 
        department, is_active, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, true, NOW())`,
      [
        userData.email,
        hashedPassword,
        userData.role,
        userData.first_name,
        userData.last_name,
        userData.department,
      ]
    );

    // Fetch created user
    const [users] = await pool.query<RowDataPacket[]>(
      'SELECT id, email, role, first_name, last_name, department, is_active FROM users WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(users[0] as User);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const userData: UserUpdate = req.body;

    // Check if user exists
    const [existingUsers] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM users WHERE id = ?',
      [userId]
    );

    if (existingUsers.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Build update query
    const updates: string[] = [];
    const values: any[] = [];

    if (userData.email) {
      updates.push('email = ?');
      values.push(userData.email);
    }

    if (userData.password) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
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

    // updates.push('updated_at = NOW()');
    values.push(userId);

    // Update user
    await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Fetch updated user
    const [users] = await pool.query<RowDataPacket[]>(
      'SELECT id, email, role, first_name, last_name, department, is_active FROM users WHERE id = ?',
      [userId]
    );

    res.json(users[0] as User);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    // Check if user exists
    const [existingUsers] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM users WHERE id = ?',
      [userId]
    );

    if (existingUsers.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete user
    await pool.query('DELETE FROM users WHERE id = ?', [userId]);

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 