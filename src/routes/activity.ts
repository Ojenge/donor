import express from 'express';
import { pool } from '../db';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

interface UserActivity {
  id: number;
  user_id: number;
  activity_type: string;
  description: string;
  ip_address: string;
  user_agent: string;
  created_at: Date;
}

// Track user activity
export const trackActivity = async (
  userId: number,
  activityType: string,
  description: string,
  ipAddress: string,
  userAgent: string
): Promise<void> => {
  await pool.execute(
    `INSERT INTO user_activities (
      user_id, activity_type, description, ip_address, user_agent
    ) VALUES (?, ?, ?, ?, ?)`,
    [userId, activityType, description, ipAddress, userAgent]
  );
};

// Get user's activity history
router.get('/my-activity', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const [rows] = await pool.execute(
      `SELECT * FROM user_activities 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [req.user?.id, Number(limit), offset]
    );

    const [total] = await pool.execute(
      'SELECT COUNT(*) as total FROM user_activities WHERE user_id = ?',
      [req.user?.id]
    );

    res.json({
      activities: rows,
      pagination: {
        total: (total as any)[0].total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil((total as any)[0].total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get activity statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const [dailyStats] = await pool.execute(
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) as count,
        activity_type
       FROM user_activities 
       WHERE user_id = ? 
       AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY DATE(created_at), activity_type
       ORDER BY date DESC`,
      [req.user?.id]
    );

    const [activityTypes] = await pool.execute(
      `SELECT 
        activity_type,
        COUNT(*) as count
       FROM user_activities 
       WHERE user_id = ?
       GROUP BY activity_type`,
      [req.user?.id]
    );

    res.json({
      dailyStats,
      activityTypes
    });
  } catch (error) {
    console.error('Error fetching activity stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get recent activity
router.get('/recent', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT * FROM user_activities 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT 10`,
      [req.user?.id]
    );

    res.json(rows);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router; 