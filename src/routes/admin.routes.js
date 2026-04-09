// src/routes/admin.routes.js

import { Router } from 'express';
import { authRequired } from '../middlewares/validateToken.js';
import {
    listarCorreos, agregarCorreo, cargaMasiva, eliminarCorreo, estadisticas,
} from '../controllers/admin.controller.js';
import { resumenAnalytics, tablaEventos } from '../controllers/analytics.controller.js';

const router = Router();

const adminRequired = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: "Acceso denegado." });
    }
    next();
};

router.use(authRequired, adminRequired);

// ── Correos APEN ──
router.get('/correos',          listarCorreos);
router.get('/estadisticas',     estadisticas);
router.post('/correos',         agregarCorreo);
router.post('/correos/masivo',  cargaMasiva);
router.delete('/correos/:id',   eliminarCorreo);

// ── Analytics ──
router.get('/analytics/resumen', resumenAnalytics);
router.get('/analytics/eventos', tablaEventos);

export default router;
