// src/schemas/record.schema.js

import { z } from 'zod';

// Esquema para la creación de un registro nutricional
export const createRecordSchema = z.object({
  description: z
    .string({
      required_error: 'La descripción es requerida.',
    })
    .min(1, { message: 'La descripción no puede estar vacía.' })
    .max(255, { message: 'La descripción no puede tener más de 255 caracteres.' }),

  calories: z
    .number({
      required_error: 'Las calorías son requeridas.',
      invalid_type_error: 'Las calorías deben ser un número.',
    })
    .positive({ message: 'Las calorías deben ser un número positivo.' }),

  // La fecha es opcional. Si se proporciona, debe ser una cadena en formato de fecha y hora.
  // Zod la convertirá automáticamente a un objeto Date.
  date: z.coerce.date().optional(),
});

// Esquema para la actualización de un registro nutricional
// Usamos .partial() para hacer que todos los campos del esquema de creación sean opcionales.
export const updateRecordSchema = createRecordSchema.partial();