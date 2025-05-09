import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ExcelProcessor } from '../utils/excelProcessor';

const router = express.Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    const uploadsDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure file filter
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.mimetype === 'application/vnd.ms-excel') {
    cb(null, true);
  } else {
    cb(new Error('Only Excel files are allowed'));
  }
};

// Create multer upload instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Upload and process Excel file
router.post('/', upload.single('file'), async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }

  try {
    const data = await ExcelProcessor.processExcelFile(req.file.path);
    let successCount = 0;
    let errorCount = 0;

    for (const row of data) {
      try {
        await ExcelProcessor.processProjectData(row);
        successCount++;
      } catch (err) {
        console.error('Error inserting row:', err);
        errorCount++;
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      message: 'File processed successfully',
      stats: {
        total: data.length,
        success: successCount,
        errors: errorCount
      }
    });
  } catch (err) {
    console.error('Error processing file:', err);
    res.status(500).json({ error: 'Error processing file' });
  }
});

export default router; 