// src/routes/auth.routes.js

import { Router } from 'express';
// CAMBIO: Usamos 'import' para traer las funciones del controlador
import { login, register, logout, profile } from '../controllers/auth.controller.js';
import { authRequired } from '../middlewares/validateToken.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// CORRECCIÓN: Usamos la función 'profile' para el endpoint '/verify'
// ya que hace exactamente lo que necesitamos: verifica el token a través del middleware
// y devuelve los datos del usuario si es válido.
router.get('/verify', authRequired, profile);

// También puedes tener una ruta de perfil si quieres, que hace lo mismo
router.get('/profile', authRequired, profile);

export default router;