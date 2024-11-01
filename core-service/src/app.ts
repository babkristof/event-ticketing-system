import express, { Application } from 'express';
import { errorMiddleware } from './middlewares/error.middleware';
import { requestLogger } from './middlewares/logger.middleware';
import apiRouter from './routes';
import { healthController } from './controllers';

const app: Application = express();

// Middleware
app.use(express.json());
app.use(requestLogger);

// Routes
app.use('/api', apiRouter);
app.get('/health', healthController.healthCheck);

app.use(errorMiddleware);

export default app;
