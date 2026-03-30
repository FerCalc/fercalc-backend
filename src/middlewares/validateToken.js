// src/middlewares/validateToken.js (CORREGIDO)

import jwt from 'jsonwebtoken';
import User from '../models/user.model.js'; // Usamos import
import 'dotenv/config'; // Para asegurar que las variables de entorno se carguen

// Usamos 'export const' para crear una exportación nombrada
export const authRequired = (req, res, next) => {
    // 1. Obtenemos el token de las cookies de la petición
    const { token } = req.cookies;

    // 2. Si no hay token, el usuario no está autorizado
    if (!token) {
        return res.status(401).json({ message: "No hay token, autorización denegada" });
    }

    // 3. Si hay token, lo verificamos (usando TOKEN_SECRET)
    jwt.verify(token, process.env.TOKEN_SECRET, async (err, decodedPayload) => {
        // 4. Si hay un error en la verificación (token inválido o expirado)
        if (err) {
            // Es útil devolver el tipo de error para depuración en el frontend
            if (err.name === 'JsonWebTokenError') {
                return res.status(401).json({ message: "Token inválido" });
            }
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ message: "Token expirado" });
            }
            return res.status(401).json({ message: "Token inválido, autorización denegada" });
        }

        // 5. Si el token es válido, buscamos al usuario por el ID guardado en el payload
        try {
            // Usamos el modelo de Mongoose que ya importamos
            const userFound = await User.findById(decodedPayload.id).select('-password');
            
            if (!userFound) {
                return res.status(401).json({ message: "Usuario no encontrado, autorización denegada" });
            }

            // 6. Guardamos los datos del usuario en el objeto 'req'
            req.user = userFound;

            // 7. Llamamos a next() para que la petición continúe
            next();

        } catch (error) {
            console.error("Error al buscar usuario en middleware:", error);
            return res.status(500).json({ message: "Error interno del servidor" });
        }
    });
};