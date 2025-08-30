import express from 'express';
import authRoutes from './routes/auth.routes.ts';
import userRoutes from './routes/user.routes.ts';
import habitRoutes from './routes/habit.routes.ts';
import cors from 'cors';
import morgan from 'morgan';
import helment from 'helmet';
import { isTest } from '../env.ts';
// import type { skip } from 'node:test';

const app = express();
app.use(helment());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    morgan('dev', {
        skip: () => isTest(),
    })
);

app.get('/health', (req, res) => {
    res.json({ message: 'Hello' }).status(200);
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/habits', habitRoutes);

export { app };
export default app;
