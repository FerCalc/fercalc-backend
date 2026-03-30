// controllers/task.controller.js

const prisma = require('../lib/prisma');

const createTask = async (req, res, next) => {
    const { title, description } = req.body;
    try {
        const task = await prisma.task.create({
            data: {
                title,
                description,
                authorId: req.userId // req.userId es añadido por el middleware verifyToken
            }
        });
        res.status(201).json(task);
    } catch (error) {
        next(error);
    }
};

const getAllTasks = async (req, res, next) => {
    try {
        const tasks = await prisma.task.findMany({
            where: { authorId: req.userId }
        });
        res.status(200).json(tasks);
    } catch (error) {
        next(error);
    }
};

const getTaskById = async (req, res, next) => {
    const { id } = req.params;
    try {
        const task = await prisma.task.findUnique({
            where: { id: parseInt(id) }
        });

        if (!task) {
            const error = new Error('Tarea no encontrada.');
            error.statusCode = 404;
            throw error;
        }

        // Verificamos que el usuario solo pueda acceder a sus propias tareas
        if (task.authorId !== req.userId) {
            const error = new Error('Acceso no autorizado.');
            error.statusCode = 403; // 403 Forbidden
            throw error;
        }

        res.status(200).json(task);
    } catch (error) {
        next(error);
    }
};

const updateTask = async (req, res, next) => {
    const { id } = req.params;
    const { title, description, completed } = req.body;
    try {
        // Primero, verificamos que la tarea exista y pertenezca al usuario
        const task = await prisma.task.findUnique({
            where: { id: parseInt(id) }
        });

        if (!task) {
            const error = new Error('Tarea no encontrada.');
            error.statusCode = 404;
            throw error;
        }

        if (task.authorId !== req.userId) {
            const error = new Error('Acceso no autorizado.');
            error.statusCode = 403;
            throw error;
        }

        // Si todo está bien, actualizamos
        const updatedTask = await prisma.task.update({
            where: { id: parseInt(id) },
            data: { title, description, completed }
        });
        res.status(200).json(updatedTask);
    } catch (error) {
        next(error);
    }
};

const deleteTask = async (req, res, next) => {
    const { id } = req.params;
    try {
        // Verificamos que la tarea exista y pertenezca al usuario
        const task = await prisma.task.findUnique({
            where: { id: parseInt(id) }
        });

        if (!task) {
            const error = new Error('Tarea no encontrada.');
            error.statusCode = 404;
            throw error;
        }

        if (task.authorId !== req.userId) {
            const error = new Error('Acceso no autorizado.');
            error.statusCode = 403;
            throw error;
        }

        // Si todo está bien, la borramos
        await prisma.task.delete({
            where: { id: parseInt(id) }
        });
        res.status(204).send(); // 204 No Content es estándar para borrados exitosos
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createTask,
    getAllTasks,
    getTaskById,
    updateTask,
    deleteTask
};