// routes/task.routes.js

const { Router } = require('express');
const {
    createTask,
    getAllTasks,
    getTaskById,
    updateTask,
    deleteTask
} = require('../controllers/task.controller');
const verifyToken = require('../middlewares/auth.middleware');

// Importamos nuestros nuevos validadores de tareas
const { 
    validateCreateTask, 
    validateUpdateTask, 
    validateTaskId 
} = require('../validators/task.validator');

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Tareas
 *   description: Endpoints para la gestión de tareas de un usuario.
 * security:
 *   - bearerAuth: []
 */

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Crea una nueva tarea
 *     tags: [Tareas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Hacer la compra"
 *               description:
 *                 type: string
 *                 example: "Comprar leche, pan y huevos"
 *     responses:
 *       201:
 *         description: Tarea creada exitosamente
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: No autorizado (token no válido o no proporcionado)
 */
router.post('/', verifyToken, validateCreateTask, createTask);

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Obtiene todas las tareas del usuario autenticado
 *     tags: [Tareas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de tareas
 *       401:
 *         description: No autorizado
 */
router.get('/', verifyToken, getAllTasks);

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Obtiene una tarea específica por su ID
 *     tags: [Tareas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalles de la tarea
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso prohibido (la tarea no pertenece al usuario)
 *       404:
 *         description: Tarea no encontrada
 */
router.get('/:id', verifyToken, validateTaskId, getTaskById);

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Actualiza una tarea existente
 *     tags: [Tareas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               completed:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Tarea actualizada
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso prohibido
 *       404:
 *         description: Tarea no encontrada
 */
router.put('/:id', verifyToken, validateTaskId, validateUpdateTask, updateTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Elimina una tarea
 *     tags: [Tareas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Tarea eliminada
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso prohibido
 *       404:
 *         description: Tarea no encontrada
 */
router.delete('/:id', verifyToken, validateTaskId, deleteTask);


module.exports = router;