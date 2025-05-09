"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const excelProcessor_1 = require("../utils/excelProcessor");
const inputFile = process.argv[2];
if (!inputFile) {
    console.error('Please provide input file path');
    console.error('Usage: npm run upload-formatted <input-file>');
    process.exit(1);
}
try {
    const inputPath = path_1.default.resolve(inputFile);
    console.log('Starting data import...');
    excelProcessor_1.ExcelProcessor.processExcelFile(inputPath)
        .then(() => {
        console.log('Data import completed successfully!');
        process.exit(0);
    })
        .catch((error) => {
        console.error('Error importing data:', error);
        process.exit(1);
    });
}
catch (error) {
    console.error('Error:', error);
    process.exit(1);
}
//# sourceMappingURL=uploadFormattedData.js.map