// src/libs/jwt.js (CORREGIDO)

import jwt from 'jsonwebtoken';
// Importamos 'dotenv/config' para asegurarnos de que las variables de entorno estén cargadas
import 'dotenv/config';

// CAMBIO: Usamos 'export const' para crear una exportación NOMBRADA.
// Esto hará que 'import { createAccessToken }' funcione correctamente.
export const createAccessToken = (payload) => {
    return new Promise((resolve, reject) => {
        jwt.sign(
            payload,
            process.env.TOKEN_SECRET, // Usamos la variable de entorno para la clave secreta
            {
                expiresIn: "1d",
            },
            (err, token) => {
                if (err) reject(err);
                resolve(token);
            }
        );
    });
};