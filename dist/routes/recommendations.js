"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = require("../db");
const router = express_1.default.Router();
router.get('/', async (req, res) => {
    try {
        const [recommendations] = await db_1.pool.query(`
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
    }
    catch (error) {
        console.error('Error fetching recommendations:', error);
        res.status(500).json({ error: 'Failed to fetch recommendations' });
    }
});
router.get('/stats', async (req, res) => {
    try {
        const [priorityStats] = await db_1.pool.query(`
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
        const [statusStats] = await db_1.pool.query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM recommendations
      GROUP BY status
    `);
        const [projectStats] = await db_1.pool.query(`
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
    }
    catch (error) {
        console.error('Error fetching recommendation stats:', error);
        res.status(500).json({ error: 'Failed to fetch recommendation statistics' });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const [recommendations] = await db_1.pool.query('SELECT * FROM recommendations WHERE id = ?', [req.params.id]);
        if (!recommendations[0]) {
            return res.status(404).json({ error: 'Recommendation not found' });
        }
        res.json(recommendations[0]);
    }
    catch (error) {
        console.error('Error fetching recommendation:', error);
        res.status(500).json({ error: 'Failed to fetch recommendation' });
    }
});
router.post('/', async (req, res) => {
    const { project_id, recommendation_text, priority, status, remarks, due_date, assigned_to, progress, action_taken } = req.body;
    try {
        const [result] = await db_1.pool.query(`INSERT INTO recommendations (
        project_id, recommendation_text, priority, status, remarks,
        due_date, assigned_to, progress, action_taken
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            project_id,
            recommendation_text,
            priority,
            status,
            remarks,
            due_date,
            assigned_to,
            progress,
            action_taken
        ]);
        res.status(201).json({
            id: result.insertId,
            message: 'Recommendation created successfully'
        });
    }
    catch (error) {
        console.error('Error creating recommendation:', error);
        res.status(500).json({ error: 'Failed to create recommendation' });
    }
});
router.put('/:id', async (req, res) => {
    const { project_id, recommendation_text, priority, status, remarks, due_date, assigned_to, progress, action_taken } = req.body;
    try {
        await db_1.pool.query(`UPDATE recommendations SET
        project_id = ?,
        recommendation_text = ?,
        priority = ?,
        status = ?,
        remarks = ?,
        due_date = ?,
        assigned_to = ?,
        progress = ?,
        action_taken = ?
      WHERE id = ?`, [
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
        ]);
        res.json({ message: 'Recommendation updated successfully' });
    }
    catch (error) {
        console.error('Error updating recommendation:', error);
        res.status(500).json({ error: 'Failed to update recommendation' });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        await db_1.pool.query('DELETE FROM recommendations WHERE id = ?', [req.params.id]);
        res.json({ message: 'Recommendation deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting recommendation:', error);
        res.status(500).json({ error: 'Failed to delete recommendation' });
    }
});
exports.default = router;
//# sourceMappingURL=recommendations.js.map