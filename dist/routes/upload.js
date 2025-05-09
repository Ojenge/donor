"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const excelProcessor_1 = require("../utils/excelProcessor");
const router = express_1.default.Router();
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        const uploadsDir = path_1.default.join(__dirname, '../../uploads');
        if (!fs_1.default.existsSync(uploadsDir)) {
            fs_1.default.mkdirSync(uploadsDir, { recursive: true });
        }
        cb(null, uploadsDir);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const fileFilter = (_req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel') {
        cb(null, true);
    }
    else {
        cb(new Error('Only Excel files are allowed'));
    }
};
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});
router.post('/', upload.single('file'), async (req, res) => {
    if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
    }
    try {
        const data = await excelProcessor_1.ExcelProcessor.processExcelFile(req.file.path);
        let successCount = 0;
        let errorCount = 0;
        for (const row of data) {
            try {
                await excelProcessor_1.ExcelProcessor.processProjectData(row);
                successCount++;
            }
            catch (err) {
                console.error('Error inserting row:', err);
                errorCount++;
            }
        }
        fs_1.default.unlinkSync(req.file.path);
        res.json({
            message: 'File processed successfully',
            stats: {
                total: data.length,
                success: successCount,
                errors: errorCount
            }
        });
    }
    catch (err) {
        console.error('Error processing file:', err);
        res.status(500).json({ error: 'Error processing file' });
    }
});
exports.default = router;
//# sourceMappingURL=upload.js.map