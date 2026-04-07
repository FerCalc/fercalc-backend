// src/routes/auth.routes.js
import { Router } from 'express';
import { login, register, logout, profile } from '../controllers/auth.controller.js';
import { requestPasswordReset, confirmPasswordReset } from '../controllers/passwordReset.controller.js';
import { authRequired } from '../middlewares/validateToken.js';

const router = Router();

router.post('/register',        register);
router.post('/login',           login);
router.post('/logout',          logout);
router.get('/verify',           authRequired, profile);
router.get('/profile',          authRequired, profile);

// Recuperación de contraseña
router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password',  confirmPasswordReset);

export default router;
