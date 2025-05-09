import * as xlsx from 'xlsx';
import path from 'path';

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

// Add each sheet to the workbook
const projectsSheet = xlsx.utils.json_to_sheet(templateData.projects);
xlsx.utils.book_append_sheet(workbook, projectsSheet, 'Projects');

const metricsSheet = xlsx.utils.json_to_sheet(templateData.metrics);
xlsx.utils.book_append_sheet(workbook, metricsSheet, 'Metrics');

const recommendationsSheet = xlsx.utils.json_to_sheet(templateData.recommendations);
xlsx.utils.book_append_sheet(workbook, recommendationsSheet, 'Recommendations');

const stakeholdersSheet = xlsx.utils.json_to_sheet(templateData.stakeholders);
xlsx.utils.book_append_sheet(workbook, stakeholdersSheet, 'Stakeholders');

// Write the template to a file
const outputPath = path.resolve(__dirname, '../../template.xlsx');
xlsx.writeFile(workbook, outputPath);

console.log('Template Excel file created successfully!');
console.log('Output file:', outputPath); 