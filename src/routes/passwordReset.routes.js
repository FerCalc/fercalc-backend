// src/routes/passwordReset.routes.js
import { Router } from 'express';
import { requestPasswordReset, confirmPasswordReset } from '../controllers/passwordReset.controller.js';

const router = Router();

// POST /api/auth/forgot-password  → solicita el email de restablecimiento
router.post('/forgot-password', requestPasswordReset);

// POST /api/auth/reset-password   → confirma el nuevo password con el token
router.post('/reset-password', confirmPasswordReset);

export default router;
