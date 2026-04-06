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
    // ── Rol del usuario ──
    // 'user'  → socio APEN con acceso normal
    // 'admin' → puede gestionar el panel de correos APEN
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
}, {
    timestamps: true,
});

export default mongoose.model('User', userSchema);
