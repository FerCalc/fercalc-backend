// middlewares/errorHandler.middleware.js

// Un middleware de manejo de errores en Express siempre tiene 4 argumentos.
const errorHandler = (err, req, res, next) => {
    // Imprimimos el error en la consola para propósitos de debugging
    console.error(err.stack);

    // Si el error tiene un código de estado definido, lo usamos. Si no, es un 500.
    const statusCode = err.statusCode || 500;

    // Enviamos una respuesta JSON estandarizada
    res.status(statusCode).json({
        status: 'error',
        statusCode: statusCode,
        message: err.message || 'Ha ocurrido un error inesperado en el servidor.'
    });
};

module.exports = errorHandler;