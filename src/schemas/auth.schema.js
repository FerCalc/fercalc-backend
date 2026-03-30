// src/schemas/auth.schema.js

const { z } = require('zod');

// Definimos el esquema de validación para el registro
const registerSchema = z.object({
    username: z.string({
        required_error: 'El nombre de usuario es requerido',
    }),
    email: z.string({
        required_error: 'El correo electrónico es requerido',
    }).email({
        message: 'El correo electrónico no es válido',
    }),
    password: z.string({
        required_error: 'La contraseña es requerida',
    }).min(6, {
        message: 'La contraseña debe tener al menos 6 caracteres',
    }),
});

module.exports = {
    registerSchema,
};