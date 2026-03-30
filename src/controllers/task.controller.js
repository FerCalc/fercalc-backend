// src/controllers/tasks.controller.js

import Task from '../models/Task.model.js';

export const getTasks = async (req, res) => {
    try {
        // Buscamos todas las tareas que pertenezcan al usuario logueado.
        const tasks = await Task.find({ user: req.user.id }).populate('user');
        res.json(tasks);
    } catch (error) {
        return res.status(500).json({ message: "Algo salió mal" });
    }
};

export const createTask = async (req, res) => {
    try {
        const { title, description, date } = req.body;
        const newTask = new Task({
            title,
            description,
            date,
            user: req.user.id // Asignamos el ID del usuario logueado a la tarea.
        });
        const savedTask = await newTask.save();
        res.json(savedTask);
    } catch (error) {
        return res.status(500).json({ message: "Algo salió mal" });
    }
};

export const getTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id).populate('user');
        if (!task) return res.status(404).json({ message: "Tarea no encontrada" });
        res.json(task);
    } catch (error) {
        return res.status(404).json({ message: "Tarea no encontrada" });
    }
};

export const deleteTask = async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) return res.status(404).json({ message: "Tarea no encontrada" });
        return res.sendStatus(204); // 204 significa que todo salió bien, pero no hay contenido que devolver.
    } catch (error) {
        return res.status(404).json({ message: "Tarea no encontrada" });
    }
};

export const updateTask = async (req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!task) return res.status(404).json({ message: "Tarea no encontrada" });
        res.json(task);
    } catch (error) {
        return res.status(404).json({ message: "Tarea no encontrada" });
    }
};