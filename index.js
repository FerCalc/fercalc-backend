// index.js (Backend - ACTUALIZADO)

import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';

// Importaciones de rutas
import authRoutes from './src/routes/auth.routes.js';
import taskRoutes from './src/routes/task.routes.js'; // <-- 1. IMPORTA LAS RUTAS DE TAREAS

import { connectDB } from './db.js';

const app = express();

connectDB();

// Middlewares
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// Rutas
app.use('/api', authRoutes);
app.use('/api', taskRoutes); // <-- 2. USA LAS RUTAS DE TAREAS

// Iniciar Servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});