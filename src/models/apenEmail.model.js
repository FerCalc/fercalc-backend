// src/models/apenEmail.model.js

import mongoose from 'mongoose';

const apenEmailSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true, // Siempre guardado en minúsculas para evitar duplicados
    },
    // Nombre del socio (opcional, para referencia del admin)
    nombre: {
        type: String,
        trim: true,
        default: null,
    },
    // Si ya usó su correo para registrarse
    registrado: {
        type: Boolean,
        default: false,
    },
    registradoAt: {
        type: Date,
        default: null,
    },
    // Quién lo agregó y cuándo (auditoría)
    agregadoPor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
}, {
    timestamps: true,
});

export default mongoose.model('ApenEmail', apenEmailSchema);
