// validators/task.validator.js

const { body, param, validationResult } = require('express-validator');

// Función helper para manejar los errores de validación y evitar repetición de código
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Validador para la creación de tareas
const validateCreateTask = [
    body('title')
        .notEmpty().withMessage('El título no puede estar vacío.')
        .isString().withMessage('El título debe ser una cadena de texto.'),
    
    body('description')
        .optional() // El campo es opcional
        .isString().withMessage('La descripción debe ser una cadena de texto.'),

    handleValidationErrors
];

// Validador para la actualización de tareas
const validateUpdateTask = [
    body('title')
        .optional()
        .notEmpty().withMessage('El título no puede estar vacío si se proporciona.')
        .isString().withMessage('El título debe ser una cadena de texto.'),

    body('description')
        .optional()
        .isString().withMessage('La descripción debe ser una cadena de texto.'),

    body('completed')
        .optional()
        .isBoolean().withMessage('El campo "completed" debe ser un valor booleano (true o false).'),

    handleValidationErrors
];

// Validador para el ID de la tarea en los parámetros de la URL
const validateTaskId = [
    param('id')
        .isInt({ gt: 0 }).withMessage('El ID de la tarea debe ser un número entero positivo.'),

    handleValidationErrors
];

module.exports = {
    validateCreateTask,
    validateUpdateTask,
    validateTaskId
};