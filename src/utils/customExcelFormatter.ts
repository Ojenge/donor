import xlsx from 'xlsx';

interface ExcelRow {
  [key: string]: any;
}

export class CustomExcelFormatter {
  public static formatExcelData(data: ExcelRow[]): ExcelRow[] {
    return data.map(row => {
      const formattedRow: ExcelRow = {};

      // Format project data
      if (row['Project Name']) {
        formattedRow['Project Name'] = String(row['Project Name']).trim();
      }
      if (row['State Department']) {
        formattedRow['State Department'] = String(row['State Department']).trim();
      }
      if (row['Funding Agency']) {
        formattedRow['Funding Agency'] = String(row['Funding Agency']).trim();
      }
      if (row['Budget']) {
        formattedRow['Budget'] = Number(row['Budget']) || 0;
      }
      if (row['Counterpart Funding']) {
        formattedRow['Counterpart Funding'] = Number(row['Counterpart Funding']) || 0;
      }
      if (row['Total Expenditure']) {
        formattedRow['Total Expenditure'] = Number(row['Total Expenditure']) || 0;
      }
      if (row['Completion Rate']) {
        formattedRow['Completion Rate'] = Number(row['Completion Rate']) || 0;
      }
      if (row['Absorption Rate']) {
        formattedRow['Absorption Rate'] = Number(row['Absorption Rate']) || 0;
      }
      if (row['Coverage']) {
        formattedRow['Coverage'] = String(row['Coverage']).trim();
      }
      if (row['County']) {
        formattedRow['County'] = String(row['County']).trim();
      }

      // Format metrics
      if (row['Metrics']) {
        const metrics = Array.isArray(row['Metrics']) ? row['Metrics'] : [row['Metrics']];
        formattedRow['Metrics'] = metrics.map(metric => ({
          'Metric Name': String(metric['Metric Name'] || '').trim(),
          'Value': String(metric['Value'] || '').trim(),
          'Reporting Period': String(metric['Reporting Period'] || '').trim()
        }));
      }

      // Format recommendations
      if (row['Recommendations']) {
        const recommendations = Array.isArray(row['Recommendations']) ? row['Recommendations'] : [row['Recommendations']];
        formattedRow['Recommendations'] = recommendations.map(rec => ({
          'Recommendation': String(rec['Recommendation'] || '').trim(),
          'Priority': String(rec['Priority'] || '').trim(),
          'Status': String(rec['Status'] || '').trim(),
          'Remarks': String(rec['Remarks'] || '').trim(),
          'Due Date': rec['Due Date'] ? new Date(rec['Due Date']) : null
        }));
      }

      return formattedRow;
    });
  }

  public static writeToExcel(data: ExcelRow[], filePath: string): void {
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Data');
    xlsx.writeFile(workbook, filePath);
  }
} 