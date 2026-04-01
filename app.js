// app.js (backend)
import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import authRoutes from './src/routes/auth.routes.js';

const app = express();

// ✅ Opciones de CORS definidas una sola vez
const corsOptions = {
    origin: [
        'http://localhost:5173',
        'https://fer-calc-pro-43b2.vercel.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

// ✅ Aplicar CORS a todas las rutas
app.use(cors(corsOptions));

// ✅ Responder explícitamente a las peticiones preflight OPTIONS
app.options('*', cors(corsOptions));

app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);

export default app;