// src/models/user.model.js

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    // ── Sesión única: solo el último token emitido es válido ──
    currentToken: {
        type: String,
        default: null,
    },
    // ── Para limitar cambios de nombre de usuario ──
    usernameChangedAt: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
});

export default mongoose.model('User', userSchema);
