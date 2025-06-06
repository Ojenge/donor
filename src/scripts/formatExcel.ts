import path from 'path';
import { ExcelFormatter } from '../utils/excelFormatter';

const inputFile = process.argv[2];
const outputFile = process.argv[3];

if (!inputFile || !outputFile) {
  console.error('Please provide input and output file paths');
  console.error('Usage: npm run format-excel <input-file> <output-file>');
  process.exit(1);
}

try {
  const inputPath = path.resolve(inputFile);
  const outputPath = path.resolve(outputFile);
  
  ExcelFormatter.formatExcelFile(inputPath, outputPath);
} catch (error) {
  console.error('Error:', error);
  process.exit(1);
} 