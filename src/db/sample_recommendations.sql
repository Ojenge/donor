-- First, let's get the existing project IDs
SET @project1_id = (SELECT id FROM projects ORDER BY RAND() LIMIT 1);
SET @project2_id = (SELECT id FROM projects WHERE id != @project1_id ORDER BY RAND() LIMIT 1);
SET @project3_id = (SELECT id FROM projects WHERE id NOT IN (@project1_id, @project2_id) ORDER BY RAND() LIMIT 1);

-- Insert sample recommendations
INSERT INTO recommendations 
(project_id, recommendation_text, priority, status, remarks, due_date, assigned_to, progress, action_taken)
VALUES
-- High priority recommendations
(@project1_id, 'Implement stricter budget monitoring controls', 'High', 'In Progress', 
 'Current controls need enhancement', DATE_ADD(CURRENT_DATE, INTERVAL 30 DAY),
 'Finance Team', 65.5, 'Budget monitoring system being upgraded'),

(@project2_id, 'Accelerate stakeholder engagement process', 'High', 'Pending',
 'Critical for project success', DATE_ADD(CURRENT_DATE, INTERVAL 15 DAY),
 'Project Manager', 0.0, NULL),

(@project3_id, 'Review and update risk management framework', 'High', 'Implemented',
 'Successfully completed', DATE_ADD(CURRENT_DATE, INTERVAL -15 DAY),
 'Risk Management Team', 100.0, 'New framework implemented and documented'),

-- Medium priority recommendations
(@project1_id, 'Enhance project documentation standards', 'Medium', 'In Progress',
 'Documentation needs standardization', DATE_ADD(CURRENT_DATE, INTERVAL 45 DAY),
 'Documentation Team', 35.0, 'Template creation in progress'),

(@project2_id, 'Conduct additional staff training sessions', 'Medium', 'Pending',
 'Training needed for new systems', DATE_ADD(CURRENT_DATE, INTERVAL 60 DAY),
 'HR Department', 0.0, NULL),

-- Low priority recommendations
(@project3_id, 'Update project communication plan', 'Low', 'In Progress',
 'Regular updates needed', DATE_ADD(CURRENT_DATE, INTERVAL 90 DAY),
 'Communications Team', 25.0, 'Draft plan under review'),

(@project1_id, 'Implement green initiatives', 'Low', 'Implemented',
 'Environmental considerations', DATE_ADD(CURRENT_DATE, INTERVAL -30 DAY),
 'Sustainability Team', 100.0, 'All initiatives successfully implemented'),

(@project2_id, 'Review vendor contracts', 'Low', 'Rejected',
 'Not feasible at this time', NULL,
 'Procurement Team', 0.0, 'Cost implications too high');

-- If no projects exist, create a sample project and add recommendations
INSERT INTO projects 
(project_name, state_department, sector, funding_agency, budget, counterpart_funding, 
 total_expenditure, completion_rate, absorption_rate, status, project_code)
SELECT 
    'Sample Project 1',
    'Finance',
    'Infrastructure',
    'World Bank',
    5000000.00,
    1000000.00,
    2500000.00,
    50.00,
    45.00,
    'Active',
    'PROJ001'
WHERE NOT EXISTS (SELECT 1 FROM projects LIMIT 1);

-- Get the ID of the sample project if it was created
SET @sample_project_id = LAST_INSERT_ID();

-- Add recommendations for the sample project if it was created
INSERT INTO recommendations 
(project_id, recommendation_text, priority, status, remarks, due_date, assigned_to, progress, action_taken)
SELECT 
    @sample_project_id,
    'Initial project review needed',
    'High',
    'Pending',
    'Baseline assessment required',
    DATE_ADD(CURRENT_DATE, INTERVAL 30 DAY),
    'Project Manager',
    0.0,
    NULL
WHERE @sample_project_id > 0; 