-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_name VARCHAR(255) NOT NULL,
  state_department VARCHAR(255) NOT NULL,
  sector VARCHAR(255),
  funding_agency VARCHAR(255) NOT NULL,
  budget DECIMAL(15,2) NOT NULL,
  counterpart_funding DECIMAL(15,2) NOT NULL,
  total_expenditure DECIMAL(15,2) NOT NULL,
  completion_rate DECIMAL(8,2),
  absorption_rate DECIMAL(8,2),
  coverage VARCHAR(255),
  county TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create project_metrics table for tracking various metrics
CREATE TABLE IF NOT EXISTS project_metrics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  metric_name VARCHAR(255) NOT NULL,
  metric_value DECIMAL(15,2),
  metric_type ENUM('Financial', 'Performance', 'Impact', 'Other') NOT NULL,
  reporting_period DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Create recommendations table
CREATE TABLE IF NOT EXISTS recommendations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  recommendation_text TEXT NOT NULL,
  priority ENUM('High', 'Medium', 'Low') NOT NULL,
  status ENUM('Pending', 'In Progress', 'Implemented', 'Rejected') DEFAULT 'Pending',
  remarks TEXT,
  due_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Create project_stakeholders table
CREATE TABLE IF NOT EXISTS project_stakeholders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  stakeholder_name VARCHAR(255) NOT NULL,
  stakeholder_type ENUM('Internal', 'External', 'Partner', 'Other') NOT NULL,
  contact_info VARCHAR(255),
  role VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Create project_documents table
CREATE TABLE IF NOT EXISTS project_documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  document_name VARCHAR(255) NOT NULL,
  document_type VARCHAR(100) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

ALTER TABLE projects
  ADD COLUMN start_date DATE,
  ADD COLUMN end_date DATE,
  ADD COLUMN status ENUM('Active', 'Completed', 'Suspended', 'On Hold') DEFAULT 'Active',
  ADD COLUMN project_code VARCHAR(100) UNIQUE,
  ADD COLUMN location VARCHAR(255);

ALTER TABLE project_metrics
  ADD COLUMN target_value DECIMAL(15,2),
  ADD COLUMN unit VARCHAR(50),
  ADD COLUMN updated_by INT,
  ADD COLUMN updated_at TIMESTAMP NULL DEFAULT NULL;

ALTER TABLE recommendations
  ADD COLUMN assigned_to VARCHAR(255),
  ADD COLUMN progress DECIMAL(5,2),
  ADD COLUMN action_taken TEXT;

ALTER TABLE project_stakeholders
  ADD COLUMN email VARCHAR(255),
  ADD COLUMN phone VARCHAR(50);

ALTER TABLE project_documents
  ADD COLUMN description TEXT,
  ADD COLUMN uploaded_by INT;

ALTER TABLE users
  ADD COLUMN first_name VARCHAR(255),
  ADD COLUMN last_name VARCHAR(255),
  ADD COLUMN department VARCHAR(255),
  ADD COLUMN is_active BOOLEAN DEFAULT TRUE;

-- Insert default admin user (password: admin123)
INSERT INTO users (email, password, role) VALUES 
('admin@example.com', '$2y$10$J9W4YpbNjInXdt3vYOehvO8zKMx0q3n4dIxZzGUkzGLKZlJ4vh3rW', 'admin')
ON DUPLICATE KEY UPDATE email = email; 

INSERT INTO users (email, password, role, first_name, last_name, department, is_active) VALUES 
('collinsojenge@gmail.com', '$2y$10$J9W4YpbNjInXdt3vYOehvO8zKMx0q3n4dIxZzGUkzGLKZlJ4vh3rW', 'admin', 'Collins', 'Ojenge', 'Administration', TRUE)
ON DUPLICATE KEY UPDATE email = email; 