import express, { Express } from 'express';
import messageRouter from './routes/messageRoutes';
import { errorConverter, errorHandler } from './middleware';

const app: Express = express();
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(messageRouter);
app.use(errorConverter);
app.use(errorHandler);

export default app;