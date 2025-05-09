import express from 'express';
import { pool } from '../db';

const router = express.Router();

// Get all recommendations
router.get('/', async (req, res) => {
  try {
    const [recommendations] = await pool.query(`
      SELECT 
        r.*,
        p.project_name,
        p.id
      FROM recommendations r
      LEFT JOIN projects p ON r.project_id = p.id
      ORDER BY 
        CASE r.priority
          WHEN 'High' THEN 1
          WHEN 'Medium' THEN 2
          WHEN 'Low' THEN 3
        END,
        r.due_date ASC
    `);
    
    res.json(recommendations);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

// Get recommendations statistics
router.get('/stats', async (req, res) => {
  try {
    // Get recommendations by priority
    const [priorityStats] = await pool.query(`
      SELECT 
        priority,
        COUNT(*) as count
      FROM recommendations
      GROUP BY priority
      ORDER BY 
        CASE priority
          WHEN 'High' THEN 1
          WHEN 'Medium' THEN 2
          WHEN 'Low' THEN 3
        END
    `);

    // Get recommendations by status
    const [statusStats] = await pool.query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM recommendations
      GROUP BY status
    `);

    // Get recommendations by project
    const [projectStats] = await pool.query(`
      SELECT 
        p.project_name,
        COUNT(r.id) as recommendation_count
      FROM projects p
      LEFT JOIN recommendations r ON p.id = r.project_id
      GROUP BY p.id, p.project_name
      ORDER BY recommendation_count DESC
      LIMIT 5
    `);

    res.json({
      byPriority: priorityStats,
      byStatus: statusStats,
      byProject: projectStats
    });
  } catch (error) {
    console.error('Error fetching recommendation stats:', error);
    res.status(500).json({ error: 'Failed to fetch recommendation statistics' });
  }
});

// Get recommendation by ID
router.get('/:id', async (req, res) => {
  try {
    const [recommendations] = await pool.query(
      'SELECT * FROM recommendations WHERE id = ?',
      [req.params.id]
    );
    
    if (!recommendations[0]) {
      return res.status(404).json({ error: 'Recommendation not found' });
    }
    
    res.json(recommendations[0]);
  } catch (error) {
    console.error('Error fetching recommendation:', error);
    res.status(500).json({ error: 'Failed to fetch recommendation' });
  }
});

// Create new recommendation
router.post('/', async (req, res) => {
  const {
    project_id,
    recommendation_text,
    priority,
    status,
    remarks,
    due_date,
    assigned_to,
    progress,
    action_taken
  } = req.body;

  try {
    const [result] = await pool.query(
      `INSERT INTO recommendations (
        project_id, recommendation_text, priority, status, remarks,
        due_date, assigned_to, progress, action_taken
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        project_id,
        recommendation_text,
        priority,
        status,
        remarks,
        due_date,
        assigned_to,
        progress,
        action_taken
      ]
    );

    res.status(201).json({
      id: result.insertId,
      message: 'Recommendation created successfully'
    });
  } catch (error) {
    console.error('Error creating recommendation:', error);
    res.status(500).json({ error: 'Failed to create recommendation' });
  }
});

// Update recommendation
router.put('/:id', async (req, res) => {
  const {
    project_id,
    recommendation_text,
    priority,
    status,
    remarks,
    due_date,
    assigned_to,
    progress,
    action_taken
  } = req.body;

  try {
    await pool.query(
      `UPDATE recommendations SET
        project_id = ?,
        recommendation_text = ?,
        priority = ?,
        status = ?,
        remarks = ?,
        due_date = ?,
        assigned_to = ?,
        progress = ?,
        action_taken = ?
      WHERE id = ?`,
      [
        project_id,
        recommendation_text,
        priority,
        status,
        remarks,
        due_date,
        assigned_to,
        progress,
        action_taken,
        req.params.id
      ]
    );

    res.json({ message: 'Recommendation updated successfully' });
  } catch (error) {
    console.error('Error updating recommendation:', error);
    res.status(500).json({ error: 'Failed to update recommendation' });
  }
});

// Delete recommendation
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM recommendations WHERE id = ?', [req.params.id]);
    res.json({ message: 'Recommendation deleted successfully' });
  } catch (error) {
    console.error('Error deleting recommendation:', error);
    res.status(500).json({ error: 'Failed to delete recommendation' });
  }
});

export default router; 