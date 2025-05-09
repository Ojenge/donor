import * as xlsx from 'xlsx';
import path from 'path';

const inputFile = process.argv[2];

if (!inputFile) {
  console.error('Please provide input file path');
  console.error('Usage: npm run check-excel <input-file>');
  process.exit(1);
}

try {
  const inputPath = path.resolve(inputFile);
  const workbook = xlsx.readFile(inputPath);

  console.log('\nExcel File Structure:');
  console.log('====================\n');

  for (const sheetName of workbook.SheetNames) {
    console.log(`Sheet: ${sheetName}`);
    console.log('-------------------');
    
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json<string[]>(worksheet, { header: 1 });
    
    if (data.length > 0) {
      const headers = data[0];
      console.log('Headers:', headers);
      console.log('Number of rows:', data.length - 1);
      
      if (data.length > 1) {
        console.log('\nFirst row of data:');
        const firstRow = data[1];
        headers.forEach((header: string, index: number) => {
          console.log(`${header}: ${firstRow[index]}`);
        });
      }
    } else {
      console.log('Sheet is empty');
    }
    
    console.log('\n');
  }
} catch (error) {
  console.error('Error reading Excel file:', error);
  process.exit(1);
} 