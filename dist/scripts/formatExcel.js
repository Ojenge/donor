"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const excelFormatter_1 = require("../utils/excelFormatter");
const inputFile = process.argv[2];
const outputFile = process.argv[3];
if (!inputFile || !outputFile) {
    console.error('Please provide input and output file paths');
    console.error('Usage: npm run format-excel <input-file> <output-file>');
    process.exit(1);
}
try {
    const inputPath = path_1.default.resolve(inputFile);
    const outputPath = path_1.default.resolve(outputFile);
    excelFormatter_1.ExcelFormatter.formatExcelFile(inputPath, outputPath);
}
catch (error) {
    console.error('Error:', error);
    process.exit(1);
}
//# sourceMappingURL=formatExcel.js.map