// validators/auth.validator.js

const { body, validationResult } = require('express-validator');

// Middleware para validar el registro de un usuario
const validateRegister = [
    body('email')
        .isEmail().withMessage('Debe proporcionar un correo electrónico válido.')
        .notEmpty().withMessage('El correo electrónico no puede estar vacío.'),

    body('password')
        .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.')
        .notEmpty().withMessage('La contraseña no puede estar vacía.'),

    // Este es un middleware que procesa los resultados de la validación
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Si hay errores, responde con un 400 y la lista de errores
            return res.status(400).json({ errors: errors.array() });
        }
        // Si no hay errores, continúa con el siguiente middleware/controlador
        next();
    }
];

// Middleware para validar el login de un usuario
const validateLogin = [
    body('email')
        .isEmail().withMessage('Debe proporcionar un correo electrónico válido.')
        .notEmpty().withMessage('El correo electrónico no puede estar vacío.'),

    body('password')
        .notEmpty().withMessage('La contraseña no puede estar vacía.'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = {
    validateRegister,
    validateLogin
};