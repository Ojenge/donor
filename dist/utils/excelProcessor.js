"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExcelProcessor = void 0;
const xlsx_1 = __importDefault(require("xlsx"));
const db_1 = require("../db");
const sanitize_html_1 = __importDefault(require("sanitize-html"));
class ExcelProcessor {
    static sanitizeValue(value) {
        if (value === null || value === undefined) {
            return '';
        }
        return (0, sanitize_html_1.default)(String(value).trim(), {
            allowedTags: [],
            allowedAttributes: {}
        });
    }
    static getDefaultValue(value, defaultValue) {
        return value === null || value === undefined ? defaultValue : value;
    }
    static getNormalizedProjectName(name) {
        return name.toLowerCase().replace(/[^a-z0-9]/g, '');
    }
    static cleanProjectName(name) {
        if (!name)
            return '';
        return name
            .trim()
            .replace(/\s+/g, ' ')
            .replace(/&/g, 'and')
            .replace(/[']/g, '')
            .replace(/\./g, '')
            .toLowerCase();
    }
    static validateProject(row) {
        return row['Project Name'] && row['Project Name'].trim() !== '' &&
            row['State Department'] && row['State Department'].trim() !== '';
    }
    static validateMetric(row) {
        return (row['Project Name'] &&
            row['Metric Name'] &&
            row['Value'] !== undefined &&
            row['Type'] &&
            row['Reporting Period']);
    }
    static validateRecommendation(row) {
        return (row['Project Name'] &&
            row['Recommendation'] &&
            row['Priority'] &&
            row['Status']);
    }
    static filterEmptyRows(rows) {
        return rows.filter(row => {
            if (!row)
                return false;
            const values = Object.values(row);
            return values.some(value => value !== undefined && value !== null && value !== '');
        });
    }
    static async processExcelFile(filePath) {
        const workbook = xlsx_1.default.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx_1.default.utils.sheet_to_json(worksheet);
        return data;
    }
    static async processProjectData(row) {
        const connection = await db_1.pool.getConnection();
        try {
            await connection.beginTransaction();
            const [projectResult] = await connection.query('INSERT INTO projects (project_name, state_department, funding_agency, budget, counterpart_funding, total_expenditure, completion_rate, absorption_rate, coverage, county) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
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
            ]);
            const projectId = projectResult.insertId;
            if (row['Metrics']) {
                const metrics = Array.isArray(row['Metrics']) ? row['Metrics'] : [row['Metrics']];
                for (const metric of metrics) {
                    await connection.query('INSERT INTO project_metrics (project_id, metric_name, metric_value, reporting_period) VALUES (?, ?, ?, ?)', [
                        projectId,
                        this.sanitizeValue(metric['Metric Name']),
                        this.sanitizeValue(metric['Value']),
                        this.sanitizeValue(metric['Reporting Period'])
                    ]);
                }
            }
            if (row['Recommendations']) {
                const recommendations = Array.isArray(row['Recommendations']) ? row['Recommendations'] : [row['Recommendations']];
                for (const recommendation of recommendations) {
                    await connection.query('INSERT INTO recommendations (project_id, recommendation_text, priority, status, remarks, due_date) VALUES (?, ?, ?, ?, ?, ?)', [
                        projectId,
                        this.sanitizeValue(recommendation['Recommendation']),
                        this.sanitizeValue(recommendation['Priority']),
                        this.sanitizeValue(recommendation['Status']),
                        this.sanitizeValue(this.getDefaultValue(recommendation['Remarks'], '')),
                        this.sanitizeValue(this.getDefaultValue(recommendation['Due Date'], null))
                    ]);
                }
            }
            await connection.commit();
        }
        catch (err) {
            await connection.rollback();
            throw err;
        }
        finally {
            connection.release();
        }
    }
}
exports.ExcelProcessor = ExcelProcessor;
//# sourceMappingURL=excelProcessor.js.map