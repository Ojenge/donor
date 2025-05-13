// Updated auth.ts
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db';
import { body, validationResult, param } from 'express-validator';
import { verifyToken, adminOnly } from '../middleware/auth';

const router = express.Router();

// Auth routes
router.post(
  '/signup',
  [
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('name').notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query('INSERT INTO users (email, password, name) VALUES (?, ?, ?)', [email, hashedPassword, name]);
      res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows]: any = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '1h' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/verify', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    res.json(decoded);
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Updated projects.ts
router.get('/projects', verifyToken, async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  try {
    const [rows] = await pool.query('SELECT * FROM projects LIMIT ? OFFSET ?', [Number(limit), offset]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post(
  '/projects',
  verifyToken,
  adminOnly,
  [
    body('title').notEmpty(),
    body('donor').notEmpty(),
    body('county').notEmpty(),
    body('budget').isNumeric(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, donor, county, budget } = req.body;

    try {
      await pool.query(
        'INSERT INTO projects (title, donor, county, budget) VALUES (?, ?, ?, ?)',
        [title, donor, county, budget]
      );
      res.status(201).json({ message: 'Project created' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Updated users.ts
router.get('/users', verifyToken, adminOnly, async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  try {
    const [rows] = await pool.query('SELECT id, name, email, role FROM users LIMIT ? OFFSET ?', [Number(limit), offset]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch(
  '/users/:id/role',
  verifyToken,
  adminOnly,
  [param('id').isInt(), body('role').isIn(['admin', 'user'])],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { role } = req.body;

    try {
      await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
      res.json({ message: 'User role updated' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

export default router;
