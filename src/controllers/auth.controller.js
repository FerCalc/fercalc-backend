// src/controllers/auth.controller.js

import User from '../models/user.model.js';
import ApenEmail from '../models/apenEmail.model.js';
import bcrypt from 'bcryptjs';
import { createAccessToken } from '../libs/jwt.js';

const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
};

// ─────────────────────────────────────────────
// REGISTRO — valida que el correo sea de un socio APEN
// ─────────────────────────────────────────────
export const register = async (req, res) => {
    const { email, password, username } = req.body;

    try {
        const emailLower = email.trim().toLowerCase();

        // 1. Verificar que el correo esté en la lista APEN
        const apenEntry = await ApenEmail.findOne({ email: emailLower });
        if (!apenEntry) {
            return res.status(403).json({
                errors: ["Tu correo electrónico no está en el listado de socios de la APEN. Solo los socios activos pueden registrarse. Si creés que es un error, contactá a la APEN."]
            });
        }

        // 2. Verificar que ese correo no haya sido ya registrado en la app
        const userFound = await User.findOne({ email: emailLower });
        if (userFound) {
            return res.status(400).json({
                errors: ["Este correo ya tiene una cuenta registrada. ¿Querés iniciar sesión?"]
            });
        }

        // 3. Crear el usuario
        const passwordHash = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email: emailLower, password: passwordHash });
        const userSaved = await newUser.save();

        // 4. Marcar el correo APEN como registrado
        await ApenEmail.findOneAndUpdate(
            { email: emailLower },
            { registrado: true, registradoAt: new Date() }
        );

        // 5. Generar token y responder
        const token = await createAccessToken({ id: userSaved._id });
        res.cookie('token', token, cookieOptions);
        res.status(201).json({
            id: userSaved._id,
            username: userSaved.username,
            email: userSaved.email,
            role: userSaved.role,
        });

    } catch (error) {
        console.error('Error en register:', error);
        res.status(500).json({ errors: ["Error interno del servidor. Intentá de nuevo más tarde."] });
    }
};

// ─────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const emailLower = email.trim().toLowerCase();
        const userFound = await User.findOne({ email: emailLower });

        if (!userFound) {
            return res.status(400).json({
                errors: ["El correo o la contraseña son incorrectos. Verificá tus datos e intentá de nuevo."]
            });
        }

        const isMatch = await bcrypt.compare(password, userFound.password);
        if (!isMatch) {
            return res.status(400).json({
                errors: ["El correo o la contraseña son incorrectos. Verificá tus datos e intentá de nuevo."]
            });
        }

        const token = await createAccessToken({ id: userFound._id });
        res.cookie('token', token, cookieOptions);
        res.json({
            id: userFound._id,
            username: userFound.username,
            email: userFound.email,
            role: userFound.role,
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ errors: ["Error interno del servidor. Intentá de nuevo más tarde."] });
    }
};

export const logout = (req, res) => {
    res.cookie('token', '', { ...cookieOptions, expires: new Date(0) });
    return res.sendStatus(200);
};

export const profile = async (req, res) => {
    return res.json({
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
        createdAt: req.user.createdAt,
        updatedAt: req.user.updatedAt,
    });
};
