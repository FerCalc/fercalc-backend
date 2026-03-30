// routes/auth.routes.js

const { Router } = require('express');
const { register, login, getProfile } = require('../controllers/auth.controller');
const verifyToken = require('../middlewares/auth.middleware');

const { validateRegister, validateLogin } = require('../validators/auth.validator');

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Autenticación
 *   description: Endpoints para registro e inicio de sesión de usuarios.
 */

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Registra un nuevo usuario.
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: El correo electrónico del usuario.
 *                 example: usuario@correo.com
 *               password:
 *                 type: string
 *                 description: La contraseña del usuario (mínimo 6 caracteres).
 *                 example: password123
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente.
 *       400:
 *         description: Datos inválidos (ej. email ya existe, contraseña corta).
 *       500:
 *         description: Error en el servidor.
 */
// VERSIÓN CORREGIDA: Se incluye el validador 'validateRegister' entre la ruta y el controlador.
router.post('/register', validateRegister, register);

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Inicia sesión y obtiene un token JWT.
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: usuario@correo.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso. Devuelve un token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Credenciales incorrectas.
 *       500:
 *         description: Error en el servidor.
 */
// VERSIÓN CORREGIDA: Se incluye el validador 'validateLogin' entre la ruta y el controlador.
router.post('/login', validateLogin, login);

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Obtiene el perfil del usuario autenticado.
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario.
 *       401:
 *         description: Token inválido o expirado.
 *       403:
 *         description: Acceso denegado, no se proporcionó token.
 *       404:
 *         description: Usuario no encontrado.
 */
// Esta ruta ya estaba bien.
router.get('/profile', verifyToken, getProfile);

module.exports = router;