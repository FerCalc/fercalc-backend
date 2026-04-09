// src/controllers/analytics.controller.js

import LoginEvent from '../models/loginEvent.model.js';
import User from '../models/user.model.js';

// ── Resumen general ──
export const resumenAnalytics = async (req, res) => {
    try {
        const { desde, hasta } = req.query;
        const filtro = {};
        if (desde || hasta) {
            filtro.createdAt = {};
            if (desde) filtro.createdAt.$gte = new Date(desde);
            if (hasta) {
                const hastaFin = new Date(hasta);
                hastaFin.setHours(23, 59, 59, 999);
                filtro.createdAt.$lte = hastaFin;
            }
        }

        const totalLogins = await LoginEvent.countDocuments(filtro);
        const usuariosUnicos = await LoginEvent.distinct('userId', filtro);
        const totalUsuarios = await User.countDocuments();

        // Logins por día
        const loginsPorDia = await LoginEvent.aggregate([
            { $match: filtro },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'America/Asuncion' }
                    },
                    cantidad: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Usuarios más activos
        const topUsuarios = await LoginEvent.aggregate([
            { $match: filtro },
            { $group: { _id: '$email', username: { $last: '$username' }, logins: { $sum: 1 } } },
            { $sort: { logins: -1 } },
            { $limit: 10 }
        ]);

        // Logins por hora del día (horas pico)
        const loginsPorHora = await LoginEvent.aggregate([
            { $match: filtro },
            {
                $group: {
                    _id: { $hour: { date: '$createdAt', timezone: 'America/Asuncion' } },
                    cantidad: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Logins por dispositivo
        const loginsPorDispositivo = await LoginEvent.aggregate([
            { $match: filtro },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $regexMatch: { input: '$dispositivo', regex: /android/i } }, 'Android',
                            {
                                $cond: [
                                    { $regexMatch: { input: '$dispositivo', regex: /ios/i } }, 'iOS',
                                    {
                                        $cond: [
                                            { $regexMatch: { input: '$dispositivo', regex: /windows/i } }, 'Windows',
                                            {
                                                $cond: [
                                                    { $regexMatch: { input: '$dispositivo', regex: /mac/i } }, 'Mac',
                                                    'Otro'
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    cantidad: { $sum: 1 }
                }
            },
            { $sort: { cantidad: -1 } }
        ]);

        res.json({
            totalLogins,
            usuariosUnicos: usuariosUnicos.length,
            totalUsuarios,
            loginsPorDia,
            topUsuarios,
            loginsPorHora,
            loginsPorDispositivo,
        });
    } catch (error) {
        console.error('Error en resumenAnalytics:', error);
        res.status(500).json({ message: 'Error al obtener analytics.' });
    }
};

// ── Tabla detallada de eventos ──
export const tablaEventos = async (req, res) => {
    try {
        const { desde, hasta, page = 1, limit = 50 } = req.query;
        const filtro = {};
        if (desde || hasta) {
            filtro.createdAt = {};
            if (desde) filtro.createdAt.$gte = new Date(desde);
            if (hasta) {
                const hastaFin = new Date(hasta);
                hastaFin.setHours(23, 59, 59, 999);
                filtro.createdAt.$lte = hastaFin;
            }
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await LoginEvent.countDocuments(filtro);
        const eventos = await LoginEvent.find(filtro)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        res.json({ total, page: parseInt(page), eventos });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener eventos.' });
    }
};
