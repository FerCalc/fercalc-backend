// src/controllers/auth.controller.js

import User from '../models/user.model.js';
import ApenEmail from '../models/apenEmail.model.js';
import LoginEvent from '../models/loginEvent.model.js';
import bcrypt from 'bcryptjs';
import { createAccessToken } from '../libs/jwt.js';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://fer-calc-pro-43b2.vercel.app';

const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
};

// ── Parsear User-Agent de forma legible ──
const parseDevice = (userAgent = '') => {
    if (!userAgent) return 'Desconocido';
    if (/android/i.test(userAgent)) return `Android — ${/Chrome\/[\d.]+/.exec(userAgent)?.[0] || 'Browser'}`;
    if (/iphone|ipad/i.test(userAgent)) return `iOS — ${/Version\/[\d.]+/.exec(userAgent)?.[0] || 'Safari'}`;
    if (/windows/i.test(userAgent)) return `Windows — ${/Chrome\/[\d.]+|Firefox\/[\d.]+|Edg\/[\d.]+/.exec(userAgent)?.[0] || 'Browser'}`;
    if (/mac/i.test(userAgent)) return `Mac — ${/Chrome\/[\d.]+|Firefox\/[\d.]+|Safari\/[\d.]+/.exec(userAgent)?.[0] || 'Browser'}`;
    if (/linux/i.test(userAgent)) return `Linux — ${/Chrome\/[\d.]+|Firefox\/[\d.]+/.exec(userAgent)?.[0] || 'Browser'}`;
    return userAgent.substring(0, 60);
};

// ── Email de aviso de nueva sesión ──
const sendNewSessionEmail = async (user, dispositivo) => {
    try {
        const fecha = new Date().toLocaleString('es-PY', {
            dateStyle: 'long', timeStyle: 'short', timeZone: 'America/Asuncion'
        });
        await resend.emails.send({
            from: 'FerCalc <onboarding@resend.dev>',
            to: user.email,
            subject: 'Nueva sesión iniciada en FerCalc',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #f9fafb; padding: 32px; border-radius: 12px;">
                    <h1 style="color: #16a34a; margin: 0 0 4px;">FerCalc</h1>
                    <p style="color: #6b7280; font-size: 13px; margin: 0 0 24px;">Calculadora Nutricional</p>
                    <div style="background: white; border-radius: 10px; padding: 24px; border: 1px solid #e5e7eb;">
                        <h2 style="color: #1f2937; margin-top: 0;">Se inició sesión en tu cuenta</h2>
                        <p style="color: #4b5563;">Hola <strong>${user.username}</strong>, detectamos un nuevo inicio de sesión.</p>
                        <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 16px 0;">
                            <p style="margin: 0; color: #374151; font-size: 14px;">📅 <strong>Fecha:</strong> ${fecha}</p>
                            <p style="margin: 8px 0 0; color: #374151; font-size: 14px;">💻 <strong>Dispositivo:</strong> ${dispositivo}</p>
                        </div>
                        <p style="color: #ef4444; font-size: 14px;">⚠️ Tu sesión anterior fue cerrada. Si no fuiste vos, cambiá tu contraseña.</p>
                        <a href="${FRONTEND_URL}/forgot-password" style="display:inline-block;background:#ef4444;color:white;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
                            Cambiar contraseña
                        </a>
                    </div>
                </div>
            `,
        });
    } catch (err) {
        console.error('Error enviando email de sesión:', err);
    }
};

// ─────────────────────────────────────────────
// REGISTRO
// ─────────────────────────────────────────────
export const register = async (req, res) => {
    const { email, password, username } = req.body;
    try {
        const emailLower = email.trim().toLowerCase();

        const apenEntry = await ApenEmail.findOne({ email: emailLower });
        if (!apenEntry) {
            return res.status(403).json({
                errors: ["Tu correo no está en el listado de socios de la APEN. Si creés que es un error, contactá a la APEN."]
            });
        }

        const userFound = await User.findOne({ email: emailLower });
        if (userFound) {
            return res.status(400).json({
                errors: ["Este correo ya tiene una cuenta registrada. ¿Querés iniciar sesión?"]
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email: emailLower, password: passwordHash });
        const userSaved = await newUser.save();

        const token = await createAccessToken({ id: userSaved._id });
        await User.findByIdAndUpdate(userSaved._id, { currentToken: token });

        await ApenEmail.findOneAndUpdate(
            { email: emailLower },
            { registrado: true, registradoAt: new Date() }
        );

        // Registrar evento de login
        await new LoginEvent({
            userId: userSaved._id,
            username: userSaved.username,
            email: userSaved.email,
            dispositivo: parseDevice(req.headers['user-agent']),
            ip: req.ip || req.headers['x-forwarded-for'] || null,
        }).save();

        res.cookie('token', token, cookieOptions);
        res.status(201).json({
            id: userSaved._id,
            username: userSaved.username,
            email: userSaved.email,
            role: userSaved.role,
        });
    } catch (error) {
        console.error('Error en register:', error);
        res.status(500).json({ errors: ["Error interno del servidor."] });
    }
};

// ─────────────────────────────────────────────
// LOGIN — registra evento + sesión única
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

        const dispositivo = parseDevice(req.headers['user-agent']);
        const token = await createAccessToken({ id: userFound._id });

        // Sesión única: avisar si había sesión activa
        if (userFound.currentToken) {
            sendNewSessionEmail(userFound, dispositivo);
        }

        await User.findByIdAndUpdate(userFound._id, { currentToken: token });

        // ── Registrar evento de login para analytics ──
        await new LoginEvent({
            userId: userFound._id,
            username: userFound.username,
            email: userFound.email,
            dispositivo,
            ip: req.ip || req.headers['x-forwarded-for'] || null,
        }).save();

        res.cookie('token', token, cookieOptions);
        res.json({
            id: userFound._id,
            username: userFound.username,
            email: userFound.email,
            role: userFound.role,
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ errors: ["Error interno del servidor."] });
    }
};

// ─────────────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────────────
export const logout = async (req, res) => {
    try {
        const { token } = req.cookies;
        if (token) {
            const jwt = await import('jsonwebtoken');
            const decoded = jwt.default.verify(token, process.env.TOKEN_SECRET);
            await User.findByIdAndUpdate(decoded.id, { currentToken: null });
        }
    } catch (_) {}
    res.cookie('token', '', { ...cookieOptions, expires: new Date(0) });
    return res.sendStatus(200);
};

// ─────────────────────────────────────────────
// PROFILE / VERIFY
// ─────────────────────────────────────────────
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
