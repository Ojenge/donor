import express from 'express';
import { RowDataPacket } from 'mysql2';
import { pool } from '../db';
import { ProjectStats, DepartmentStats, FundingStats, RecommendationStats, ProjectWithDetails } from '../types';

const router = express.Router();

// Get overall project statistics
router.get('/projects/stats', async (_req, res) => {
  try {
    const [results] = await pool.query<RowDataPacket[]>(`
      SELECT 
        COUNT(*) as total_projects,
        SUM(budget) as total_budget,
        AVG(completion_rate) as avg_completion,
        COUNT(CASE WHEN completion_rate >= 80 THEN 1 END) as completed_projects
      FROM projects
    `);
    res.json(results[0]);
  } catch (error) {
    console.error('Error fetching project stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get projects by department
router.get('/projects/by-department', async (_req, res) => {
  try {
    const [results] = await pool.query<RowDataPacket[]>(`
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

    res.json(results as DepartmentStats[]);
  } catch (error) {
    console.error('Error fetching department stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get projects by funding agency
router.get('/projects/by-funding', async (_req, res) => {
  try {
    const [results] = await pool.query<RowDataPacket[]>(`
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

    res.json(results as FundingStats[]);
  } catch (error) {
    console.error('Error fetching funding stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get detailed project metrics
router.get('/projects/metrics', async (_req, res) => {
  try {
    const [projects] = await pool.query<RowDataPacket[]>(`
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
      metrics: project.metrics ? project.metrics.split(',').map((metric: string) => {
        const [name, value] = metric.split(':');
        return { name, value };
      }) : [],
      recommendations: project.recommendations ? project.recommendations.split(',').map((rec: string) => {
        const [text, priority, status] = rec.split(':');
        return { text, priority, status };
      }) : []
    }));

    res.json(formattedProjects as ProjectWithDetails[]);
  } catch (err) {
    console.error('Error fetching project metrics:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get recommendations by priority
router.get('/recommendations/by-priority', async (_req, res) => {
  try {
    const [results] = await pool.query<RowDataPacket[]>(`
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

    res.json(results as RecommendationStats[]);
  } catch (error) {
    console.error('Error fetching recommendation stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get recommendations by status
router.get('/recommendations/by-status', async (_req, res) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        status,
        COUNT(*) as count,
        GROUP_CONCAT(DISTINCT priority) as priorities
      FROM recommendations
      GROUP BY status
      ORDER BY count DESC
    `);

    res.json(rows as RecommendationStats[]);
  } catch (err) {
    console.error('Error fetching recommendation stats:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Add to backend/src/routes/analytics.ts
router.get('/funding/multiseries', async (_req, res) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT YEAR(created_at) as year, 
             SUM(budget) as budget, 
             SUM(total_expenditure) as total_expenditure
      FROM projects
      GROUP BY year
      ORDER BY year
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch multi-series data' });
  }
});

// Get metrics statistics
router.get('/metrics/stats', async (_req, res) => {
  try {
    const [results] = await pool.query<RowDataPacket[]>(`
      SELECT 
        metric_name,
        AVG(metric_value) as avg_value,
        COUNT(*) as total_count
      FROM project_metrics
      GROUP BY metric_name
      ORDER BY total_count DESC
    `);

    res.json(results);
  } catch (error) {
    console.error('Error fetching metrics stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/analytics/funding
router.get('/funding', async (req, res) => {
  try {
    const { timeRange } = req.query;
    let dateFilter = '';
    
    switch (timeRange) {
      case 'current':
        dateFilter = 'WHERE YEAR(created_at) = YEAR(CURDATE())';
        break;
      case 'last_year':
        dateFilter = 'WHERE YEAR(created_at) = YEAR(CURDATE()) - 1';
        break;
      case 'last_3_years':
        dateFilter = 'WHERE YEAR(created_at) >= YEAR(CURDATE()) - 3';
        break;
      default:
        dateFilter = '';
    }

    // Get total budget and expenditure
    const [totals] = await pool.query<RowDataPacket[]>(`
      SELECT 
        COALESCE(SUM(budget), 0) as total_budget,
        COALESCE(SUM(total_expenditure), 0) as total_expenditure,
        CASE 
          WHEN SUM(budget) > 0 THEN (SUM(total_expenditure) / SUM(budget) * 100)
          ELSE 0
        END as absorption_rate
      FROM projects
      ${dateFilter}
    `);

    // Get department-wise breakdown
    const [byDepartment] = await pool.query<RowDataPacket[]>(`
      SELECT 
        state_department as department,
        COALESCE(SUM(budget), 0) as budget,
        COALESCE(SUM(total_expenditure), 0) as expenditure,
        CASE 
          WHEN SUM(budget) > 0 THEN (SUM(total_expenditure) / SUM(budget) * 100)
          ELSE 0
        END as absorption_rate
      FROM projects
      ${dateFilter}
      GROUP BY state_department
      ORDER BY budget DESC
    `);

    // Get funding agency breakdown
    const [byFundingAgency] = await pool.query<RowDataPacket[]>(`
      SELECT 
        funding_agency as agency,
        COALESCE(SUM(budget), 0) as budget,
        COALESCE(SUM(total_expenditure), 0) as expenditure,
        CASE 
          WHEN SUM(budget) > 0 THEN (SUM(total_expenditure) / SUM(budget) * 100)
          ELSE 0
        END as absorption_rate
      FROM projects
      ${dateFilter}
      GROUP BY funding_agency
      ORDER BY budget DESC
    `);

    // Get monthly trends
    const [monthlyTrends] = await pool.query<RowDataPacket[]>(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COALESCE(SUM(budget), 0) as budget,
        COALESCE(SUM(total_expenditure), 0) as expenditure
      FROM projects
      ${dateFilter}
      GROUP BY month
      ORDER BY month ASC
    `);

    // Get top projects
    const [topProjects] = await pool.query<RowDataPacket[]>(`
      SELECT 
        project_name,
        COALESCE(budget, 0) as budget,
        COALESCE(total_expenditure, 0) as expenditure,
        CASE 
          WHEN budget > 0 THEN (total_expenditure / budget * 100)
          ELSE 0
        END as absorption_rate,
        CASE 
          WHEN completion_rate >= 80 THEN 'Completed'
          WHEN completion_rate >= 40 THEN 'In Progress'
          ELSE 'Pending'
        END as status
      FROM projects
      ${dateFilter}
      ORDER BY budget DESC
      LIMIT 10
    `);

    res.json({
      total_budget: Number(totals[0].total_budget) || 0,
      total_expenditure: Number(totals[0].total_expenditure) || 0,
      absorption_rate: Number(totals[0].absorption_rate) || 0,
      by_department: byDepartment.map(dept => ({
        ...dept,
        budget: Number(dept.budget) || 0,
        expenditure: Number(dept.expenditure) || 0,
        absorption_rate: Number(dept.absorption_rate) || 0
      })),
      by_funding_agency: byFundingAgency.map(agency => ({
        ...agency,
        budget: Number(agency.budget) || 0,
        expenditure: Number(agency.expenditure) || 0,
        absorption_rate: Number(agency.absorption_rate) || 0
      })),
      monthly_trends: monthlyTrends.map(month => ({
        ...month,
        budget: Number(month.budget) || 0,
        expenditure: Number(month.expenditure) || 0
      })),
      top_projects: topProjects.map(project => ({
        ...project,
        budget: Number(project.budget) || 0,
        expenditure: Number(project.expenditure) || 0,
        absorption_rate: Number(project.absorption_rate) || 0
      }))
    });
  } catch (err) {
    console.error('Error fetching funding analytics:', err);
    res.status(500).json({ error: 'Failed to fetch funding analytics' });
  }
});
router.get('/funding/stacked', async (_req, res) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT YEAR(created_at) as year, funding_agency, SUM(budget) as budget
      FROM projects
      GROUP BY year, funding_agency
      ORDER BY year, funding_agency
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stacked data' });
  }
});
router.get('/projects/status-distribution', async (_req, res) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT status, COUNT(*) as count FROM projects GROUP BY status
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch status distribution' });
  }
});
router.get('/projects/kpis', async (_req, res) => {
  try {
    const [current] = await pool.query<RowDataPacket[]>(`
      SELECT COUNT(*) as total_projects, SUM(budget) as total_budget FROM projects WHERE YEAR(created_at) = YEAR(CURDATE())
    `);
    const [previous] = await pool.query<RowDataPacket[]>(`
      SELECT COUNT(*) as total_projects, SUM(budget) as total_budget FROM projects WHERE YEAR(created_at) = YEAR(CURDATE()) - 1
    `);
    res.json({ current: current[0], previous: previous[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch KPIs' });
  }
});

// Get projects by sector
router.get('/projects/by-sector', async (_req, res) => {
  try {
    const [results] = await pool.query<RowDataPacket[]>(`
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
  } catch (error) {
    console.error('Error fetching sector stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get projects by funding type
router.get('/projects/by-funding', async (_req, res) => {
  try {
    const [results] = await pool.query<RowDataPacket[]>(`
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
  } catch (error) {
    console.error('Error fetching funding stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get projects by year
router.get('/projects/by-year', async (_req, res) => {
  try {
    const [results] = await pool.query<RowDataPacket[]>(`
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
  } catch (error) {
    console.error('Error fetching year stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get completion rate trends
router.get('/projects/completion-trends', async (_req, res) => {
  try {
    const [results] = await pool.query<RowDataPacket[]>(`
      SELECT 
        year,
        AVG(completion_rate) as avg_completion,
        COUNT(*) as project_count
      FROM projects
      GROUP BY year
      ORDER BY year ASC
    `);
    res.json(results);
  } catch (error) {
    console.error('Error fetching completion trends:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 