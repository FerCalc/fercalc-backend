// src/routes/tasks.routes.js

import { Router } from 'express';
import { authRequired } from '../middlewares/validateToken.js';
import { getTasks, getTask, createTask, updateTask, deleteTask } from '../controllers/task.controller.js';
import { validateSchema } from '../middlewares/validator.middleware.js';
import { createTaskSchema } from '../schemas/task.schema.js';

const router = Router();

// Todas estas rutas requieren autenticación
router.get('/tasks', authRequired, getTasks);
router.get('/tasks/:id', authRequired, getTask);

// Usamos el validador de Zod antes de crear la tarea
router.post('/tasks', authRequired, validateSchema(createTaskSchema), createTask);

router.delete('/tasks/:id', authRequired, deleteTask);
router.put('/tasks/:id', authRequired, updateTask);

export default router;