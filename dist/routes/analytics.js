"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = require("../db");
const router = express_1.default.Router();
router.get('/projects/stats', async (_req, res) => {
    try {
        const [results] = await db_1.pool.query(`
      SELECT 
        COUNT(*) as total_projects,
        SUM(budget) as total_budget,
        AVG(completion_rate) as avg_completion,
        COUNT(CASE WHEN completion_rate >= 80 THEN 1 END) as completed_projects
      FROM projects
    `);
        res.json(results[0]);
    }
    catch (error) {
        console.error('Error fetching project stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/projects/by-department', async (_req, res) => {
    try {
        const [results] = await db_1.pool.query(`
      SELECT 
        state_department,
        COUNT(*) as project_count,
        SUM(budget) as total_budget,
        AVG(completion_rate) as avg_completion_rate,
        AVG(absorption_rate) as avg_absorption_rate
      FROM projects
      GROUP BY state_department
      ORDER BY project_count DESC
    `);
        res.json(results);
    }
    catch (error) {
        console.error('Error fetching department stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/projects/by-funding', async (_req, res) => {
    try {
        const [results] = await db_1.pool.query(`
      SELECT 
        funding_agency,
        COUNT(*) as project_count,
        SUM(budget) as total_budget,
        AVG(completion_rate) as avg_completion_rate,
        AVG(absorption_rate) as avg_absorption_rate
      FROM projects
      GROUP BY funding_agency
      ORDER BY project_count DESC
    `);
        res.json(results);
    }
    catch (error) {
        console.error('Error fetching funding stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/projects/metrics', async (_req, res) => {
    try {
        const [projects] = await db_1.pool.query(`
      SELECT p.*, 
        GROUP_CONCAT(DISTINCT pm.metric_name, ':', pm.metric_value) as metrics,
        GROUP_CONCAT(DISTINCT r.recommendation_text, ':', r.priority, ':', r.status) as recommendations
      FROM projects p
      LEFT JOIN project_metrics pm ON p.id = pm.project_id
      LEFT JOIN recommendations r ON p.id = r.project_id
      GROUP BY p.id
    `);
        const formattedProjects = projects.map(project => ({
            ...project,
            metrics: project.metrics ? project.metrics.split(',').map((metric) => {
                const [name, value] = metric.split(':');
                return { name, value };
            }) : [],
            recommendations: project.recommendations ? project.recommendations.split(',').map((rec) => {
                const [text, priority, status] = rec.split(':');
                return { text, priority, status };
            }) : []
        }));
        res.json(formattedProjects);
    }
    catch (err) {
        console.error('Error fetching project metrics:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/recommendations/by-priority', async (_req, res) => {
    try {
        const [results] = await db_1.pool.query(`
      SELECT 
        priority,
        COUNT(*) as count,
        GROUP_CONCAT(DISTINCT status) as statuses
      FROM recommendations
      GROUP BY priority
      ORDER BY 
        CASE priority
          WHEN 'High' THEN 1
          WHEN 'Medium' THEN 2
          WHEN 'Low' THEN 3
        END
    `);
        res.json(results);
    }
    catch (error) {
        console.error('Error fetching recommendation stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/recommendations/by-status', async (_req, res) => {
    try {
        const [rows] = await db_1.pool.query(`
      SELECT 
        status,
        COUNT(*) as count,
        GROUP_CONCAT(DISTINCT priority) as priorities
      FROM recommendations
      GROUP BY status
      ORDER BY count DESC
    `);
        res.json(rows);
    }
    catch (err) {
        console.error('Error fetching recommendation stats:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/funding/multiseries', async (_req, res) => {
    try {
        const [rows] = await db_1.pool.query(`
      SELECT YEAR(created_at) as year, 
             SUM(budget) as budget, 
             SUM(total_expenditure) as total_expenditure
      FROM projects
      GROUP BY year
      ORDER BY year
    `);
        res.json(rows);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch multi-series data' });
    }
});
router.get('/metrics/stats', async (_req, res) => {
    try {
        const [results] = await db_1.pool.query(`
      SELECT 
        metric_name,
        AVG(metric_value) as avg_value,
        COUNT(*) as total_count
      FROM project_metrics
      GROUP BY metric_name
      ORDER BY total_count DESC
    `);
        res.json(results);
    }
    catch (error) {
        console.error('Error fetching metrics stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/funding', async (req, res) => {
    try {
        const [totals] = await db_1.pool.query('SELECT SUM(budget) as total_budget, SUM(total_expenditure) as total_expenditure FROM projects');
        const [byAgency] = await db_1.pool.query('SELECT funding_agency, SUM(budget) as budget FROM projects GROUP BY funding_agency');
        const [byYear] = await db_1.pool.query('SELECT YEAR(created_at) as year, SUM(budget) as budget FROM projects GROUP BY year');
        res.json({ totals: totals[0], byAgency, byYear });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch funding analytics' });
    }
});
router.get('/funding/stacked', async (_req, res) => {
    try {
        const [rows] = await db_1.pool.query(`
      SELECT YEAR(created_at) as year, funding_agency, SUM(budget) as budget
      FROM projects
      GROUP BY year, funding_agency
      ORDER BY year, funding_agency
    `);
        res.json(rows);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch stacked data' });
    }
});
router.get('/projects/status-distribution', async (_req, res) => {
    try {
        const [rows] = await db_1.pool.query(`
      SELECT status, COUNT(*) as count FROM projects GROUP BY status
    `);
        res.json(rows);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch status distribution' });
    }
});
router.get('/projects/kpis', async (_req, res) => {
    try {
        const [current] = await db_1.pool.query(`
      SELECT COUNT(*) as total_projects, SUM(budget) as total_budget FROM projects WHERE YEAR(created_at) = YEAR(CURDATE())
    `);
        const [previous] = await db_1.pool.query(`
      SELECT COUNT(*) as total_projects, SUM(budget) as total_budget FROM projects WHERE YEAR(created_at) = YEAR(CURDATE()) - 1
    `);
        res.json({ current: current[0], previous: previous[0] });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch KPIs' });
    }
});
router.get('/projects/by-sector', async (_req, res) => {
    try {
        const [results] = await db_1.pool.query(`
      SELECT 
        sector,
        COUNT(*) as project_count,
        SUM(budget) as total_budget,
        AVG(completion_rate) as avg_completion
      FROM projects
      GROUP BY sector
      ORDER BY project_count DESC
    `);
        res.json(results);
    }
    catch (error) {
        console.error('Error fetching sector stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/projects/by-funding', async (_req, res) => {
    try {
        const [results] = await db_1.pool.query(`
      SELECT 
        funding_type,
        COUNT(*) as project_count,
        SUM(budget) as total_budget,
        AVG(completion_rate) as avg_completion
      FROM projects
      GROUP BY funding_type
      ORDER BY total_budget DESC
    `);
        res.json(results);
    }
    catch (error) {
        console.error('Error fetching funding stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/projects/by-year', async (_req, res) => {
    try {
        const [results] = await db_1.pool.query(`
      SELECT 
        year,
        COUNT(*) as project_count,
        SUM(budget) as total_budget,
        AVG(completion_rate) as avg_completion
      FROM projects
      GROUP BY year
      ORDER BY year DESC
    `);
        res.json(results);
    }
    catch (error) {
        console.error('Error fetching year stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/projects/completion-trends', async (_req, res) => {
    try {
        const [results] = await db_1.pool.query(`
      SELECT 
        year,
        AVG(completion_rate) as avg_completion,
        COUNT(*) as project_count
      FROM projects
      GROUP BY year
      ORDER BY year ASC
    `);
        res.json(results);
    }
    catch (error) {
        console.error('Error fetching completion trends:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=analytics.js.map