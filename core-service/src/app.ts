import express, { Application } from 'express';
import { errorMiddleware } from './middlewares/error.middleware';
import { requestLogger } from './middlewares/logger.middleware';

const app: Application = express();

// Middleware
app.use(express.json());
app.use(requestLogger);

// Routes
app.get('/', async (_req, res) => {
    res.send('app is working');
})
app.use(errorMiddleware);

export default app;
