import xlsx from 'xlsx';
import { Project, ProjectMetric, Recommendation } from '../types';

interface ExcelRow {
  [key: string]: any;
}

export class ExcelFormatter {
  private static formatDate(date: any): string {
    if (!date) return '';
    if (typeof date === 'string') {
      const parsed = new Date(date);
      return isNaN(parsed.getTime()) ? '' : parsed.toISOString().split('T')[0];
    }
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    return '';
  }

  private static formatNumber(value: any): number {
    if (value === null || value === undefined) return 0;
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  }

  public static formatProjectData(project: Project): ExcelRow {
    return {
      'Project Name': project.project_name,
      'State Department': project.state_department,
      'Funding Agency': project.funding_agency,
      'Budget': this.formatNumber(project.budget),
      'Counterpart Funding': this.formatNumber(project.counterpart_funding),
      'Total Expenditure': this.formatNumber(project.total_expenditure),
      'Completion Rate': this.formatNumber(project.completion_rate),
      'Absorption Rate': this.formatNumber(project.absorption_rate),
      'Coverage': project.coverage,
      'County': project.county
    };
  }

  public static formatMetricData(metric: ProjectMetric): ExcelRow {
    return {
      'Project Name': metric.project_id.toString(),
      'Metric Name': metric.metric_name,
      'Value': this.formatNumber(metric.metric_value),
      'Reporting Period': this.formatDate(metric.reporting_period)
    };
  }

  public static formatRecommendationData(recommendation: Recommendation): ExcelRow {
    return {
      'Project Name': recommendation.project_id.toString(),
      'Recommendation': recommendation.recommendation_text,
      'Priority': recommendation.priority,
      'Status': recommendation.status,
      'Remarks': recommendation.remarks,
      'Due Date': this.formatDate(recommendation.due_date)
    };
  }

  public static writeToExcel(data: {
    projects: Project[];
    metrics: ProjectMetric[];
    recommendations: Recommendation[];
  }, filePath: string): void {
    const workbook = xlsx.utils.book_new();

    // Format and add projects sheet
    const projectsData = data.projects.map(project => this.formatProjectData(project));
    const projectsSheet = xlsx.utils.json_to_sheet(projectsData);
    xlsx.utils.book_append_sheet(workbook, projectsSheet, 'Projects');

    // Format and add metrics sheet
    const metricsData = data.metrics.map(metric => this.formatMetricData(metric));
    const metricsSheet = xlsx.utils.json_to_sheet(metricsData);
    xlsx.utils.book_append_sheet(workbook, metricsSheet, 'Metrics');

    // Format and add recommendations sheet
    const recommendationsData = data.recommendations.map(rec => this.formatRecommendationData(rec));
    const recommendationsSheet = xlsx.utils.json_to_sheet(recommendationsData);
    xlsx.utils.book_append_sheet(workbook, recommendationsSheet, 'Recommendations');

    // Write to file
    xlsx.writeFile(workbook, filePath);
  }
} 