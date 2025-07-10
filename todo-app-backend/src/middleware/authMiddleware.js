// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Asegúrate de que las variables de entorno se carguen aquí también

const authMiddleware = (req, res, next) => {
    console.log('--- Ejecutando authMiddleware ---'); // Log al inicio del middleware
    const authHeader = req.headers['authorization'];
    console.log('Authorization Header:', authHeader); // Log del header completo

    const token = authHeader && authHeader.split(' ')[1];
    console.log('Token extraído:', token ? 'Presente' : 'Ausente'); // Indica si se extrajo un token

    if (!token) {
        console.log('Error de autenticación: No se proporcionó token o el formato es incorrecto.'); // Depuración
        return res.status(401).json({ message: 'Acceso denegado. No se proporcionó token o el formato es incorrecto.' });
    }

    try {
        // Asegúrate de que process.env.JWT_SECRET esté cargado y sea accesible
        if (!process.env.JWT_SECRET) {
            console.error('ERROR: JWT_SECRET no está definido en las variables de entorno.');
            return res.status(500).json({ message: 'Error de configuración del servidor: JWT_SECRET no definido.' });
        }
        console.log('Intentando verificar token con JWT_SECRET...'); // Depuración

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token verificado exitosamente. Decoded payload:', decoded); // Log del payload decodificado

        // Aseguramos que el objeto req.user contenga userId, username y email
        // ¡Importante!: Asegúrate de que tu payload JWT realmente contenga estas propiedades
        // (userId, username, email) según cómo las estés firmando en tu ruta de login/registro.
        req.user = {
            userId: decoded.userId,
            username: decoded.username,
            email: decoded.email
        };
        console.log('req.user asignado:', req.user); // Log del objeto req.user asignado

        next(); // Pasa al siguiente middleware o a la ruta
    } catch (error) {
        console.error('Error de verificación de token en authMiddleware:', error.message); // Log del error específico
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expirado. Por favor, inicia sesión de nuevo.' });
        }
        // Para cualquier otro error (ej. JsonWebTokenError por token malformado)
        return res.status(403).json({ message: 'Token inválido. Acceso denegado.' });
    }
};

module.exports = authMiddleware;