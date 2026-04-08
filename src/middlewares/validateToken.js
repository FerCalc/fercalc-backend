// src/middlewares/validateToken.js

import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import 'dotenv/config';

export const authRequired = (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return res.status(401).json({ message: "No hay token, autorización denegada" });
    }

    jwt.verify(token, process.env.TOKEN_SECRET, async (err, decodedPayload) => {
        if (err) {
            if (err.name === 'JsonWebTokenError') {
                return res.status(401).json({ message: "Token inválido" });
            }
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ message: "Token expirado" });
            }
            return res.status(401).json({ message: "Token inválido, autorización denegada" });
        }

        try {
            const userFound = await User.findById(decodedPayload.id).select('-password');

            if (!userFound) {
                return res.status(401).json({ message: "Usuario no encontrado" });
            }

            // ── Sesión única: verificar que el token sea el activo ──
            if (userFound.currentToken !== token) {
                return res.status(401).json({
                    message: "Tu sesión fue cerrada porque iniciaste sesión en otro dispositivo.",
                    code: "SESSION_REPLACED"
                });
            }

            req.user = userFound;
            next();

        } catch (error) {
            console.error("Error en middleware:", error);
            return res.status(500).json({ message: "Error interno del servidor" });
        }
    });
};
