"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExcelFormatter = void 0;
const xlsx_1 = __importDefault(require("xlsx"));
class ExcelFormatter {
    static formatDate(date) {
        if (!date)
            return '';
        if (typeof date === 'string') {
            const parsed = new Date(date);
            return isNaN(parsed.getTime()) ? '' : parsed.toISOString().split('T')[0];
        }
        if (date instanceof Date) {
            return date.toISOString().split('T')[0];
        }
        return '';
    }
    static formatNumber(value) {
        if (value === null || value === undefined)
            return 0;
        const num = Number(value);
        return isNaN(num) ? 0 : num;
    }
    static formatProjectData(project) {
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
    static formatMetricData(metric) {
        return {
            'Project Name': metric.project_id.toString(),
            'Metric Name': metric.metric_name,
            'Value': this.formatNumber(metric.metric_value),
            'Reporting Period': this.formatDate(metric.reporting_period)
        };
    }
    static formatRecommendationData(recommendation) {
        return {
            'Project Name': recommendation.project_id.toString(),
            'Recommendation': recommendation.recommendation_text,
            'Priority': recommendation.priority,
            'Status': recommendation.status,
            'Remarks': recommendation.remarks,
            'Due Date': this.formatDate(recommendation.due_date)
        };
    }
    static writeToExcel(data, filePath) {
        const workbook = xlsx_1.default.utils.book_new();
        const projectsData = data.projects.map(project => this.formatProjectData(project));
        const projectsSheet = xlsx_1.default.utils.json_to_sheet(projectsData);
        xlsx_1.default.utils.book_append_sheet(workbook, projectsSheet, 'Projects');
        const metricsData = data.metrics.map(metric => this.formatMetricData(metric));
        const metricsSheet = xlsx_1.default.utils.json_to_sheet(metricsData);
        xlsx_1.default.utils.book_append_sheet(workbook, metricsSheet, 'Metrics');
        const recommendationsData = data.recommendations.map(rec => this.formatRecommendationData(rec));
        const recommendationsSheet = xlsx_1.default.utils.json_to_sheet(recommendationsData);
        xlsx_1.default.utils.book_append_sheet(workbook, recommendationsSheet, 'Recommendations');
        xlsx_1.default.writeFile(workbook, filePath);
    }
}
exports.ExcelFormatter = ExcelFormatter;
//# sourceMappingURL=excelFormatter.js.map