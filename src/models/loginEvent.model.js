// src/models/loginEvent.model.js

import mongoose from 'mongoose';

const loginEventSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    // Dispositivo / navegador (del header User-Agent)
    dispositivo: {
        type: String,
        default: 'Desconocido',
    },
    // IP del request
    ip: {
        type: String,
        default: null,
    },
}, {
    timestamps: true, // createdAt = momento exacto del login
});

export default mongoose.model('LoginEvent', loginEventSchema);
