// src/middlewares/validate.middleware.js

import { ZodError } from 'zod';

/**
 * Middleware para validar el cuerpo de la solicitud contra un esquema de Zod.
 * @param {import('zod').ZodSchema} schema - El esquema de Zod para validar.
 * @returns {import('express').RequestHandler}
 */
export const validateSchema = (schema) => (req, res, next) => {
  try {
    // Intenta analizar y validar el cuerpo de la solicitud con el esquema proporcionado.
    // .parse() arroja un error si la validación falla.
    schema.parse(req.body);
    // Si la validación es exitosa, pasa al siguiente middleware o controlador.
    next();
  } catch (error) {
    // Si el error es una instancia de ZodError, significa que la validación falló.
    if (error instanceof ZodError) {
      // Mapeamos los errores de Zod a un formato más simple y legible.
      // CORRECCIÓN: Usamos error.issues en lugar de error.errors
      const errorMessages = error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      // Respondemos con un estado 400 (Bad Request) y los mensajes de error.
      return res.status(400).json({ message: 'Error de validación', errors: errorMessages });
    }
    // Si es otro tipo de error, lo pasamos al manejador de errores de Express.
    next(error);
  }
};