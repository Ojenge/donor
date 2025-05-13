import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from 'dotenv';
import { pool } from './db';
import mergedRoutes from './routes/mergedRoutes'; // <- adjust path as needed

// Load env variables
config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: 'https://donor.delivery.go.ke',
  credentials: true
}));
app.use(helmet());
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Register merged routes under /api
app.use('/api', mergedRoutes);

// Error handling
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Test DB connection
pool.getConnection()
  .then(conn => {
    console.log('Database connected successfully');
    conn.release();
  })
  .catch(err => {
    console.error('Error connecting to the database:', err);
    process.exit(1);
  });
