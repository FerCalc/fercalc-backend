// controllers/auth.controller.js

// CAMBIO CLAVE: En lugar de importar desde el cliente generado,
// importamos nuestra instancia única y configurada desde lib/prisma.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword
            }
        });

        // No devolvemos la contraseña en la respuesta
        const userResponse = { id: user.id, email: user.email };
        res.status(201).json(userResponse);

    } catch (error) {
        // Si el error es por un email duplicado (código de error de Prisma P2002)
        if (error.code === 'P2002') {
            const customError = new Error('El correo electrónico ya está en uso.');
            customError.statusCode = 400;
            return next(customError);
        }
        // Para cualquier otro error, lo pasamos al manejador central
        next(error);
    }
};

const login = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            const error = new Error('Credenciales incorrectas.');
            error.statusCode = 400;
            throw error;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            const error = new Error('Credenciales incorrectas.');
            error.statusCode = 400;
            throw error;
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token });

    } catch (error) {
        next(error);
    }
};

const getProfile = async (req, res, next) => {
    try {
        // req.userId viene del middleware verifyToken
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: { id: true, email: true } // Seleccionamos solo los campos seguros
        });

        if (!user) {
            // Este caso es raro (token válido para un usuario borrado), pero es bueno manejarlo
            const error = new Error('Usuario no encontrado.');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    getProfile
};