import express from 'express';
import cors from 'cors';
import projectsRouter from './routes/projects';
import recommendationsRouter from './routes/recommendations';
import analyticsRouter from './routes/analytics';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/projects', projectsRouter);
app.use('/api/recommendations', recommendationsRouter);
app.use('/api/analytics', analyticsRouter);

export default app; 