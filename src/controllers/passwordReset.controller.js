// src/controllers/passwordReset.controller.js
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { Resend } from 'resend';
import User from '../models/user.model.js';
import PasswordReset from '../models/passwordReset.model.js';

const resend = new Resend(process.env.RESEND_API_KEY);

// URL del frontend (para el link en el email)
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://fer-calc-pro-43b2.vercel.app';

// ─────────────────────────────────────────────
// PASO 1: El usuario pide restablecer su contraseña
// ─────────────────────────────────────────────
export const requestPasswordReset = async (req, res) => {
    const { email } = req.body;

    try {
        // Siempre respondemos lo mismo para no revelar si el correo existe
        const genericResponse = {
            message: 'Si ese correo está registrado, recibirás un enlace para restablecer tu contraseña en los próximos minutos.'
        };

        const user = await User.findOne({ email: email.trim().toLowerCase() });
        if (!user) return res.json(genericResponse); // No revelar que no existe

        // Eliminar tokens anteriores del mismo usuario
        await PasswordReset.deleteMany({ userId: user._id });

        // Generar token seguro
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

        await new PasswordReset({ userId: user._id, token, expiresAt }).save();

        const resetLink = `${FRONTEND_URL}/reset-password?token=${token}`;

        // Enviar email con Resend
        await resend.emails.send({
            from: 'FerCalc <onboarding@resend.dev>', // ← Cambiá por tu dominio verificado en Resend
            to: user.email,
            subject: 'Restablecé tu contraseña — FerCalc',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #f9fafb; padding: 32px; border-radius: 12px;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <h1 style="color: #16a34a; font-size: 28px; margin: 0;">FerCalc</h1>
                        <p style="color: #6b7280; font-size: 14px; margin-top: 4px;">Calculadora Nutricional</p>
                    </div>

                    <div style="background: white; border-radius: 10px; padding: 28px; border: 1px solid #e5e7eb;">
                        <h2 style="color: #1f2937; font-size: 20px; margin-top: 0;">Restablecé tu contraseña</h2>
                        <p style="color: #4b5563; line-height: 1.6;">
                            Hola <strong>${user.username}</strong>, recibimos una solicitud para restablecer la contraseña de tu cuenta en FerCalc.
                        </p>
                        <p style="color: #4b5563; line-height: 1.6;">
                            Hacé clic en el botón de abajo para crear una nueva contraseña. Este enlace es válido por <strong>1 hora</strong>.
                        </p>

                        <div style="text-align: center; margin: 28px 0;">
                            <a href="${resetLink}"
                               style="background-color: #16a34a; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
                                Restablecer contraseña
                            </a>
                        </div>

                        <p style="color: #9ca3af; font-size: 13px; line-height: 1.6;">
                            Si no solicitaste este cambio, podés ignorar este correo. Tu contraseña no será modificada.
                        </p>
                        <p style="color: #9ca3af; font-size: 12px; margin-top: 16px; word-break: break-all;">
                            O copiá este enlace en tu navegador:<br/>
                            <a href="${resetLink}" style="color: #16a34a;">${resetLink}</a>
                        </p>
                    </div>

                    <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px;">
                        © ${new Date().getFullYear()} FerCalc — Calculadora Nutricional
                    </p>
                </div>
            `,
        });

        res.json(genericResponse);

    } catch (error) {
        console.error('Error en requestPasswordReset:', error);
        res.status(500).json({ message: 'Error interno del servidor. Intentá de nuevo más tarde.' });
    }
};

// ─────────────────────────────────────────────
// PASO 2: El usuario envía el nuevo password con el token
// ─────────────────────────────────────────────
export const confirmPasswordReset = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        if (!token || !newPassword) {
            return res.status(400).json({ message: 'Token y nueva contraseña son obligatorios.' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres.' });
        }

        // Buscar el token
        const resetEntry = await PasswordReset.findOne({ token, used: false });

        if (!resetEntry) {
            return res.status(400).json({ message: 'El enlace no es válido o ya fue utilizado.' });
        }

        if (new Date() > resetEntry.expiresAt) {
            await PasswordReset.deleteOne({ _id: resetEntry._id });
            return res.status(400).json({ message: 'El enlace expiró. Solicitá uno nuevo.' });
        }

        // Actualizar la contraseña
        const passwordHash = await bcrypt.hash(newPassword, 10);
        await User.findByIdAndUpdate(resetEntry.userId, { password: passwordHash });

        // Marcar el token como usado
        await PasswordReset.findByIdAndUpdate(resetEntry._id, { used: true });

        res.json({ message: 'Contraseña restablecida correctamente. Ya podés iniciar sesión.' });

    } catch (error) {
        console.error('Error en confirmPasswordReset:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};
