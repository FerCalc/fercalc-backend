// src/models/Task.model.js

import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    // ¡LA CLAVE! Aquí relacionamos la tarea con un usuario.
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Hace referencia al modelo 'User' que ya creamos.
        required: true,
    }
}, {
    timestamps: true // Esto crea automáticamente los campos createdAt y updatedAt
});

export default mongoose.model('Task', taskSchema);