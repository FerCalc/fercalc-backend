// src/validators/auth.schema.js

const { z } = require('zod');

// Esquema de validación para el registro de un nuevo usuario
const registerSchema = z.object({
  username: z
    .string({
      required_error: 'El nombre de usuario es requerido.',
    })
    .min(3, {
      message: 'El nombre de usuario debe tener al menos 3 caracteres.',
    }),
  email: z
    .string({
      required_error: 'El correo electrónico es requerido.',
    })
    .email({
      message: 'El formato del correo electrónico no es válido.',
    }),
  password: z
    .string({
      required_error: 'La contraseña es requerida.',
    })
    .min(6, {
      message: 'La contraseña debe tener al menos 6 caracteres.',
    }),
});

// Esquema de validación para el inicio de sesión
const loginSchema = z.object({
  email: z
    .string({
      required_error: 'El correo electrónico es requerido.',
    })
    .email({
      message: 'El formato del correo electrónico no es válido.',
    }),
  password: z
    .string({
      required_error: 'La contraseña es requerida.',
    })
    .min(6, {
      message: 'La contraseña debe tener al menos 6 caracteres.',
    }),
});

module.exports = {
  registerSchema,
  loginSchema,
};