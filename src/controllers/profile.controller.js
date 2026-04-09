// src/controllers/profile.controller.js

import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';

const DIAS_LIMITE_USERNAME = 30;

// ─────────────────────────────────────────────
// CAMBIAR NOMBRE DE USUARIO (límite 30 días)
// ─────────────────────────────────────────────
export const changeUsername = async (req, res) => {
    const { newUsername } = req.body;

    if (!newUsername || newUsername.trim().length < 3) {
        return res.status(400).json({ message: 'El nombre debe tener al menos 3 caracteres.' });
    }

    try {
        const user = await User.findById(req.user.id);

        // Verificar límite de tiempo
        if (user.usernameChangedAt) {
            const diasDesdeUltimoCambio = (Date.now() - new Date(user.usernameChangedAt)) / (1000 * 60 * 60 * 24);
            if (diasDesdeUltimoCambio < DIAS_LIMITE_USERNAME) {
                const diasRestantes = Math.ceil(DIAS_LIMITE_USERNAME - diasDesdeUltimoCambio);
                return res.status(400).json({
                    message: `Solo podés cambiar tu nombre una vez cada ${DIAS_LIMITE_USERNAME} días. Podés volver a cambiarlo en ${diasRestantes} ${diasRestantes === 1 ? 'día' : 'días'}.`
                });
            }
        }

        user.username = newUsername.trim();
        user.usernameChangedAt = new Date();
        await user.save();

        res.json({
            message: 'Nombre de usuario actualizado correctamente.',
            username: user.username,
            usernameChangedAt: user.usernameChangedAt,
        });
    } catch (error) {
        console.error('Error en changeUsername:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// ─────────────────────────────────────────────
// CAMBIAR CONTRASEÑA (pide la actual)
// ─────────────────────────────────────────────
export const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Completá todos los campos.' });
    }
    if (newPassword.length < 6) {
        return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 6 caracteres.' });
    }

    try {
        const user = await User.findById(req.user.id);

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'La contraseña actual es incorrecta.' });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        // Invalidar sesión actual para forzar re-login
        user.currentToken = null;
        await user.save();

        res.json({ message: 'Contraseña actualizada. Por seguridad, iniciá sesión nuevamente.' });
    } catch (error) {
        console.error('Error en changePassword:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// ─────────────────────────────────────────────
// OBTENER INFO DEL PERFIL (días restantes para cambio de nombre)
// ─────────────────────────────────────────────
export const getProfileInfo = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password -currentToken');

        let diasParaCambiarNombre = 0;
        if (user.usernameChangedAt) {
            const diasTranscurridos = (Date.now() - new Date(user.usernameChangedAt)) / (1000 * 60 * 60 * 24);
            diasParaCambiarNombre = Math.max(0, Math.ceil(DIAS_LIMITE_USERNAME - diasTranscurridos));
        }

        res.json({
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            usernameChangedAt: user.usernameChangedAt,
            diasParaCambiarNombre,
            puedecambiarNombre: diasParaCambiarNombre === 0,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el perfil.' });
    }
};

// ─────────────────────────────────────────────
// ELIMINAR CUENTA
// ─────────────────────────────────────────────
export const deleteAccount = async (req, res) => {
    const { confirmacion } = req.body;

    if (confirmacion !== 'ELIMINAR') {
        return res.status(400).json({ message: 'Confirmación incorrecta. Escribí ELIMINAR para continuar.' });
    }

    try {
        await User.findByIdAndDelete(req.user.id);
        // Limpiar cookie
        res.cookie('token', '', {
            httpOnly: true, secure: true, sameSite: 'none', expires: new Date(0)
        });
        res.json({ message: 'Tu cuenta fue eliminada correctamente.' });
    } catch (error) {
        console.error('Error en deleteAccount:', error);
        res.status(500).json({ message: 'Error al eliminar la cuenta.' });
    }
};
