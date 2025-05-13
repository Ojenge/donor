import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from 'dotenv';
import { pool } from './db';
import analyticsRoutes from './routes/analytics';
import projectsRoutes from './routes/projects';
import authRoutes from './routes/auth';
import uploadRoutes from './routes/upload';
import usersRoutes from './routes/users';
import { authenticateToken } from './middleware/auth';
import recommendationsRoutes from './routes/recommendations';


// Load environment variables
config();

const app = express();
const port = process.env.PORT || 3000;
const allowedOrigins = ['https://donor.delivery.go.ke'];

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.options('*', cors());



// app.use(cors({
//   origin: 'https://donor.delivery.go.ke',
//   credentials: true
// }));
app.use(helmet());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (_req: express.Request, res: express.Response) => {
  res.json({ status: 'ok' });
});


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateToken, usersRoutes);
app.use('/api/analytics', authenticateToken, analyticsRoutes);
app.use('/api/projects', authenticateToken, projectsRoutes);
app.use('/api/upload', authenticateToken, uploadRoutes);
app.use('/api/recommendations', authenticateToken, recommendationsRoutes);

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Handle database connection
pool.getConnection()
  .then(connection => {
    console.log('Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('Error connecting to the database:', err);
    process.exit(1);
  }); 
