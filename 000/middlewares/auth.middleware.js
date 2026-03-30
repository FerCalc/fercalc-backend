const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // 1. Obtener el token de la cabecera de autorización
    // El formato estándar es "Bearer <token>"
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
        // Si no hay cabecera de autorización, no hay acceso
        return res.status(403).json({ message: "Acceso denegado. Se requiere un token." });
    }

    // Separamos "Bearer" del token en sí
    const token = authHeader.split(' ')[1];

    if (!token) {
        // Si la cabecera existe pero no hay token, no hay acceso
        return res.status(403).json({ message: "Formato de token inválido." });
    }

    // 2. Verificar el token
    try {
        // jwt.verify descifra el token. Si es válido, devuelve el payload (los datos que guardamos).
        // Si no es válido (expirado, manipulado), lanzará un error.
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Guardar el payload del token en el objeto `req`
        // Esto permite que las rutas que vienen después tengan acceso a la información del usuario.
        req.user = decoded;

        // 4. Llamar a next() para pasar a la siguiente función (la lógica de la ruta)
        next();
    } catch (error) {
        console.error("Error al verificar el token:", error.message);
        return res.status(401).json({ message: "Token inválido o expirado." });
    }
};

module.exports = verifyToken;