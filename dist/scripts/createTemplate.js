"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const xlsx = __importStar(require("xlsx"));
const path_1 = __importDefault(require("path"));
const templateData = {
    projects: [
        {
            'Project Name': 'Example Project',
            'Funding Agency': 'Example Agency',
            'Sector': 'Education',
            'Budget': 1000000,
            'Start Date': '2024-01-01',
            'End Date': '2024-12-31',
            'Status': 'Active',
            'Description': 'This is an example project'
        }
    ],
    metrics: [
        {
            'Project Name': 'Example Project',
            'Metric Name': 'Number of Beneficiaries',
            'Value': 1000,
            'Type': 'Performance',
            'Reporting Period': '2024-03-31'
        }
    ],
    recommendations: [
        {
            'Project Name': 'Example Project',
            'Recommendation': 'Increase community engagement',
            'Priority': 'High',
            'Status': 'Pending',
            'Assigned To': 'Project Manager',
            'Due Date': '2024-06-30'
        }
    ],
    stakeholders: [
        {
            'Project Name': 'Example Project',
            'Stakeholder Name': 'Local Community',
            'Type': 'External',
            'Contact Info': 'community@example.com',
            'Role': 'Beneficiary'
        }
    ]
};
const workbook = xlsx.utils.book_new();
const projectsSheet = xlsx.utils.json_to_sheet(templateData.projects);
xlsx.utils.book_append_sheet(workbook, projectsSheet, 'Projects');
const metricsSheet = xlsx.utils.json_to_sheet(templateData.metrics);
xlsx.utils.book_append_sheet(workbook, metricsSheet, 'Metrics');
const recommendationsSheet = xlsx.utils.json_to_sheet(templateData.recommendations);
xlsx.utils.book_append_sheet(workbook, recommendationsSheet, 'Recommendations');
const stakeholdersSheet = xlsx.utils.json_to_sheet(templateData.stakeholders);
xlsx.utils.book_append_sheet(workbook, stakeholdersSheet, 'Stakeholders');
const outputPath = path_1.default.resolve(__dirname, '../../template.xlsx');
xlsx.writeFile(workbook, outputPath);
console.log('Template Excel file created successfully!');
console.log('Output file:', outputPath);
//# sourceMappingURL=createTemplate.js.map