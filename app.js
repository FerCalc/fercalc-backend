// app.js (backend)
import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import authRoutes from './src/routes/auth.routes.js';
import taskRoutes from './src/routes/task.routes.js';
import adminRoutes from './src/routes/admin.routes.js';

const app = express();

const corsOptions = {
    origin: [
        'http://localhost:5173',
        'https://fer-calc-pro-43b2.vercel.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api', taskRoutes);
app.use('/api/admin', adminRoutes); // ← Panel de administración APEN

export default app;
