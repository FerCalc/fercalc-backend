// app.js (EN TU BACKEND)

import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors'; // Asegúrate de importar cors

import authRoutes from './src/routes/auth.routes.js'; // Ajusta la ruta si es necesario

const app = express();

// --- CONFIGURACIÓN DE CORS (LA PARTE IMPORTANTE) ---
app.use(cors({
    origin: 'http://localhost:5173', // Permite solo a tu frontend hacer peticiones
    credentials: true // Permite el envío de cookies
}));

// --- OTROS MIDDLEWARES ---
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// --- RUTAS ---
app.use("/api/auth", authRoutes);

export default app;