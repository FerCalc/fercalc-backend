// src/middlewares/validator.middleware.js

export const validateSchema = (schema) => (req, res, next) => {
    try {
        // Intenta validar el cuerpo de la petición con el esquema proporcionado
        schema.parse(req.body);
        // Si la validación es exitosa, pasa al siguiente middleware o controlador
        next();
    } catch (error) {
        // Si la validación falla, Zod lanza un error que capturamos aquí.
        // El objeto de error de Zod contiene una propiedad 'issues' que es un array de errores.
        // Mapeamos ese array para extraer solo los mensajes de error.
        return res.status(400).json({
            // CORRECCIÓN: Usamos error.issues en lugar de error.errors
            message: error.issues.map((issue) => issue.message),
        });
    }
};
