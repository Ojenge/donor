import xlsx from 'xlsx';
import { pool } from '../db';
import sanitizeHtml from 'sanitize-html';
import { getNormalizedProjectName } from './projectNameMappings';
import { RowDataPacket } from 'mysql2';

interface ProjectData {
  'Project Name': string;
  'State Department': string;
  'Sector': string;
  'Funding Agency': string;
  'Budget': number;
  'Counterpart Funding': number;
  'Total Expenditure': number;
  'Completion Rate': number;
  'Absorption Rate': number;
  'Coverage': string;
  'County': string;
  'Description': string;
}

interface MetricData {
  'Project Name': string;
  'Metric Name': string;
  'Value': number;
  'Type': string;
  'Reporting Period': Date;
}

interface RecommendationData {
  'Project Name': string;
  'Recommendation': string;
  'Priority': string;
  'Status': string;
  'Remarks': string;
  'Due Date': Date;
}

interface ExcelRow {
  [key: string]: any;
}

export class ExcelProcessor {
  private static sanitizeValue(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }
    return sanitizeHtml(String(value).trim(), {
      allowedTags: [],
      allowedAttributes: {}
    });
  }

  private static getDefaultValue(value: any, defaultValue: any): any {
    return value === null || value === undefined ? defaultValue : value;
  }

  private static getNormalizedProjectName(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  private static cleanProjectName(name: string): string {
    if (!name) return '';
    return name
      .trim()
      .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
      .replace(/&/g, 'and')  // Replace & with and
      .replace(/[']/g, '')   // Remove apostrophes
      .replace(/\./g, '')    // Remove periods
      .toLowerCase();        // Convert to lowercase
  }

  private static validateProject(row: any): boolean {
    return row['Project Name'] && row['Project Name'].trim() !== '' &&
           row['State Department'] && row['State Department'].trim() !== '';
  }

  private static validateMetric(row: any): boolean {
    return (
      row['Project Name'] &&
      row['Metric Name'] &&
      row['Value'] !== undefined &&
      row['Type'] &&
      row['Reporting Period']
    );
  }

  private static validateRecommendation(row: any): boolean {
    return (
      row['Project Name'] &&
      row['Recommendation'] &&
      row['Priority'] &&
      row['Status']
    );
  }

  private static filterEmptyRows<T>(rows: T[]): T[] {
    return rows.filter(row => {
      if (!row) return false;
      const values = Object.values(row);
      return values.some(value => value !== undefined && value !== null && value !== '');
    });
  }

  public static async processExcelFile(filePath: string): Promise<ExcelRow[]> {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet) as ExcelRow[];

    return data;
  }

  public static async processProjectData(row: ExcelRow): Promise<void> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Insert project
      const [projectResult] = await connection.query<RowDataPacket[]>(
        'INSERT INTO projects (project_name, state_department, funding_agency, budget, counterpart_funding, total_expenditure, completion_rate, absorption_rate, coverage, county) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          this.sanitizeValue(row['Project Name']),
          this.sanitizeValue(row['State Department']),
          this.sanitizeValue(this.getDefaultValue(row['Funding Agency'], 'Unknown')),
          this.sanitizeValue(this.getDefaultValue(row['Budget'], 0)),
          this.sanitizeValue(this.getDefaultValue(row['Counterpart Funding'], 0)),
          this.sanitizeValue(this.getDefaultValue(row['Total Expenditure'], 0)),
          this.sanitizeValue(this.getDefaultValue(row['Completion Rate'], 0)),
          this.sanitizeValue(this.getDefaultValue(row['Absorption Rate'], 0)),
          this.sanitizeValue(this.getDefaultValue(row['Coverage'], '')),
          this.sanitizeValue(this.getDefaultValue(row['County'], ''))
        ]
      );

      const projectId = (projectResult as any).insertId;

      // Insert metrics if they exist
      if (row['Metrics']) {
        const metrics = Array.isArray(row['Metrics']) ? row['Metrics'] : [row['Metrics']];
        for (const metric of metrics) {
          await connection.query(
            'INSERT INTO project_metrics (project_id, metric_name, metric_value, reporting_period) VALUES (?, ?, ?, ?)',
            [
              projectId,
              this.sanitizeValue(metric['Metric Name']),
              this.sanitizeValue(metric['Value']),
              this.sanitizeValue(metric['Reporting Period'])
            ]
          );
        }
      }

      // Insert recommendations if they exist
      if (row['Recommendations']) {
        const recommendations = Array.isArray(row['Recommendations']) ? row['Recommendations'] : [row['Recommendations']];
        for (const recommendation of recommendations) {
          await connection.query(
            'INSERT INTO recommendations (project_id, recommendation_text, priority, status, remarks, due_date) VALUES (?, ?, ?, ?, ?, ?)',
            [
              projectId,
              this.sanitizeValue(recommendation['Recommendation']),
              this.sanitizeValue(recommendation['Priority']),
              this.sanitizeValue(recommendation['Status']),
              this.sanitizeValue(this.getDefaultValue(recommendation['Remarks'], '')),
              this.sanitizeValue(this.getDefaultValue(recommendation['Due Date'], null))
            ]
          );
        }
      }

      await connection.commit();
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }
} 