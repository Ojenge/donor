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
const inputFile = process.argv[2];
if (!inputFile) {
    console.error('Please provide input file path');
    console.error('Usage: npm run check-excel <input-file>');
    process.exit(1);
}
try {
    const inputPath = path_1.default.resolve(inputFile);
    const workbook = xlsx.readFile(inputPath);
    console.log('\nExcel File Structure:');
    console.log('====================\n');
    for (const sheetName of workbook.SheetNames) {
        console.log(`Sheet: ${sheetName}`);
        console.log('-------------------');
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
        if (data.length > 0) {
            const headers = data[0];
            console.log('Headers:', headers);
            console.log('Number of rows:', data.length - 1);
            if (data.length > 1) {
                console.log('\nFirst row of data:');
                const firstRow = data[1];
                headers.forEach((header, index) => {
                    console.log(`${header}: ${firstRow[index]}`);
                });
            }
        }
        else {
            console.log('Sheet is empty');
        }
        console.log('\n');
    }
}
catch (error) {
    console.error('Error reading Excel file:', error);
    process.exit(1);
}
//# sourceMappingURL=checkExcelStructure.js.map