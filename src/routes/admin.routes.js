// src/routes/admin.routes.js

import { Router } from 'express';
import { authRequired } from '../middlewares/validateToken.js';
import {
    listarCorreos,
    agregarCorreo,
    cargaMasiva,
    eliminarCorreo,
    estadisticas,
} from '../controllers/admin.controller.js';

const router = Router();

// Middleware que verifica rol admin (se aplica a todas las rutas de este archivo)
const adminRequired = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: "Acceso denegado. Se requiere rol de administrador." });
    }
    next();
};

// Todas las rutas requieren: 1) token válido  2) rol admin
router.use(authRequired, adminRequired);

router.get('/correos',          listarCorreos);
router.get('/estadisticas',     estadisticas);
router.post('/correos',         agregarCorreo);
router.post('/correos/masivo',  cargaMasiva);
router.delete('/correos/:id',   eliminarCorreo);

export default router;
