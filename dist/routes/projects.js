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
        const { department, year, search, ids } = req.query;
        if (ids) {
            const idList = ids.split(',').map(Number);
            const [projects] = await db_1.pool.query('SELECT * FROM projects WHERE id IN (?)', [idList]);
            return res.json(projects);
        }
        let sql = 'SELECT * FROM projects WHERE 1=1';
        const params = [];
        if (department) {
            sql += ' AND state_department = ?';
            params.push(department);
        }
        if (year) {
            sql += ' AND YEAR(created_at) = ?';
            params.push(year);
        }
        if (search) {
            sql += ' AND (project_name LIKE ? OR description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }
        const [rows] = await db_1.pool.query(sql, params);
        res.json(rows);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [project] = await db_1.pool.query('SELECT * FROM projects WHERE id = ?', [id]);
        if (!project.length)
            return res.status(404).json({ error: 'Project not found' });
        const [metrics] = await db_1.pool.query('SELECT * FROM project_metrics WHERE project_id = ?', [id]);
        const [documents] = await db_1.pool.query('SELECT * FROM project_documents WHERE project_id = ?', [id]);
        const [recommendations] = await db_1.pool.query('SELECT * FROM recommendations WHERE project_id = ?', [id]);
        res.json({ ...project[0], metrics, documents, recommendations });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch project details' });
    }
});
router.post('/', async (req, res) => {
    try {
        const { project_name, state_department, funding_agency, budget, counterpart_funding, total_expenditure, completion_rate, absorption_rate, coverage, county } = req.body;
        const [result] = await db_1.pool.query(`
      INSERT INTO projects (
        project_name, state_department, funding_agency, budget, 
        counterpart_funding, total_expenditure, completion_rate, 
        absorption_rate, coverage, county
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [project_name, state_department, funding_agency, budget, counterpart_funding, total_expenditure, completion_rate, absorption_rate, coverage, county]);
        res.status(201).json({ id: result.insertId, message: 'Project created successfully' });
    }
    catch (err) {
        console.error('Error creating project:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.put('/:id', async (req, res) => {
    const { project_name, project_code, state_department, funding_agency, budget, total_expenditure, completion_rate, absorption_rate, status, start_date, end_date } = req.body;
    try {
        await db_1.pool.query(`UPDATE projects SET
        project_name = ?,
        id = ?,
        state_department = ?,
        funding_agency = ?,
        budget = ?,
        total_expenditure = ?,
        completion_rate = ?,
        absorption_rate = ?,
        status = ?,
        start_date = ?,
        end_date = ?
      WHERE id = ?`, [
            project_name,
            project_code,
            state_department,
            funding_agency,
            budget,
            total_expenditure,
            completion_rate,
            absorption_rate,
            status,
            start_date,
            end_date,
            req.params.id
        ]);
        res.json({ message: 'Project updated successfully' });
    }
    catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ error: 'Failed to update project' });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await db_1.pool.query('DELETE FROM projects WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Project not found' });
            return;
        }
        res.json({ message: 'Project deleted successfully' });
    }
    catch (err) {
        console.error('Error deleting project:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=projects.js.map