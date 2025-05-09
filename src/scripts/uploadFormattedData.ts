import path from 'path';
import { ExcelProcessor } from '../utils/excelProcessor';

const inputFile = process.argv[2];

if (!inputFile) {
  console.error('Please provide input file path');
  console.error('Usage: npm run upload-formatted <input-file>');
  process.exit(1);
}

try {
  const inputPath = path.resolve(inputFile);
  console.log('Starting data import...');
  ExcelProcessor.processExcelFile(inputPath)
    .then(() => {
      console.log('Data import completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error importing data:', error);
      process.exit(1);
    });
} catch (error) {
  console.error('Error:', error);
  process.exit(1);
} 