// app.js (backend)
import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import authRoutes from './src/routes/auth.routes.js';

const app = express();

app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://fer-calc-pro-43b2.vercel.app'
    ],
    credentials: true
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);

export default app;