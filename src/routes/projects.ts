import express, { Request, Response } from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '../db';
import { ProjectWithDetails } from '../types';

const router = express.Router();

// Get all projects
router.get('/', async (req, res) => {
  try {
    const { department, year, search, ids } = req.query;
    if (ids) {
      const idList = (ids as string).split(',').map(Number);
      const [projects] = await pool.query<RowDataPacket[]>('SELECT * FROM projects WHERE id IN (?)', [idList]);
      return res.json(projects);
    }
    let sql = 'SELECT * FROM projects WHERE 1=1';
    const params: any[] = [];
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
    const [rows] = await pool.query<RowDataPacket[]>(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get project by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [project] = await pool.query<RowDataPacket[]>('SELECT * FROM projects WHERE id = ?', [id]);
    if (!project.length) return res.status(404).json({ error: 'Project not found' });
    const [metrics] = await pool.query<RowDataPacket[]>('SELECT * FROM project_metrics WHERE project_id = ?', [id]);
    const [documents] = await pool.query<RowDataPacket[]>('SELECT * FROM project_documents WHERE project_id = ?', [id]);
    const [recommendations] = await pool.query<RowDataPacket[]>('SELECT * FROM recommendations WHERE project_id = ?', [id]);
    res.json({ ...project[0], metrics, documents, recommendations });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch project details' });
  }
});

// Create new project
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { project_name, state_department, funding_agency, budget, counterpart_funding, total_expenditure, completion_rate, absorption_rate, coverage, county } = req.body;

    const [result] = await pool.query<ResultSetHeader>(`
      INSERT INTO projects (
        project_name, state_department, funding_agency, budget, 
        counterpart_funding, total_expenditure, completion_rate, 
        absorption_rate, coverage, county
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [project_name, state_department, funding_agency, budget, counterpart_funding, total_expenditure, completion_rate, absorption_rate, coverage, county]);

    res.status(201).json({ id: result.insertId, message: 'Project created successfully' });
  } catch (err) {
    console.error('Error creating project:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update project
router.put('/:id', async (req, res) => {
  const {
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
    end_date
  } = req.body;

  try {
    await pool.query(
      `UPDATE projects SET
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
      WHERE id = ?`,
      [
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
      ]
    );

    res.json({ message: 'Project updated successfully' });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Delete project
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const [result] = await pool.query<ResultSetHeader>('DELETE FROM projects WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    console.error('Error deleting project:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 