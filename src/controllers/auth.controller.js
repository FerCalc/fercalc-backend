// src/controllers/auth.controller.js

// CAMBIO: Usamos 'import' en lugar de 'require'
import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { createAccessToken } from '../libs/jwt.js';

// --- FUNCIÓN DE REGISTRO ---
// CAMBIO: Añadimos 'export' para que la función pueda ser importada en otros archivos
export const register = async (req, res) => {
    const { email, password, username } = req.body;
    try {
        const userFound = await User.findOne({ email });
        if (userFound) return res.status(400).json({ errors: ["El correo ya está en uso"] }); // Es mejor enviar 'errors' como en el frontend

        const passwordHash = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: passwordHash });
        const userSaved = await newUser.save();
        const token = await createAccessToken({ id: userSaved._id });

        res.cookie('token', token, { 
            httpOnly: process.env.NODE_ENV !== 'development', // Más seguro para producción
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'strict' 
        });
        res.status(201).json({ id: userSaved._id, username: userSaved.username, email: userSaved.email });
    } catch (error) {
        res.status(500).json({ message: "Error interno del servidor." });
    }
};

// --- FUNCIÓN DE LOGIN ---
// CAMBIO: Añadimos 'export'
export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const userFound = await User.findOne({ email });
        if (!userFound) return res.status(400).json({ errors: ["Credenciales inválidas"] });

        const isMatch = await bcrypt.compare(password, userFound.password);
        if (!isMatch) return res.status(400).json({ errors: ["Credenciales inválidas"] });

        const token = await createAccessToken({ id: userFound._id });
        res.cookie('token', token, { 
            httpOnly: process.env.NODE_ENV !== 'development',
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'strict' 
        });
        res.json({ id: userFound._id, username: userFound.username, email: userFound.email });
    } catch (error) {
        res.status(500).json({ message: "Error interno del servidor." });
    }
};

// --- FUNCIÓN DE LOGOUT ---
// CAMBIO: Añadimos 'export'
export const logout = (req, res) => {
    res.cookie('token', '', {
        expires: new Date(0),
    });
    return res.sendStatus(200);
};

// --- FUNCIÓN DE PROFILE ---
// CAMBIO: Añadimos 'export'
export const profile = async (req, res) => {
    // Esta función ya hace lo que necesitamos para la verificación del token.
    // Devuelve los datos del usuario si el token es válido.
    return res.json({
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        createdAt: req.user.createdAt,
        updatedAt: req.user.updatedAt,
    });
};

// ELIMINADO: Ya no necesitamos 'module.exports' ni la función 'verifyToken' duplicada.
// La función 'profile' cumplirá el propósito de la verificación.