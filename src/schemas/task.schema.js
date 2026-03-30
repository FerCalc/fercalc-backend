// src/schemas/task.schema.js

import { z } from 'zod';

export const createTaskSchema = z.object({
    title: z.string({
        required_error: 'El título es requerido'
    }),
    description: z.string({
        required_error: 'La descripción debe ser un texto'
    }).optional(),
    date: z.string().datetime().optional(),
});