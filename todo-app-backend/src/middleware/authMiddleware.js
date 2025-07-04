// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // 1. Obtener el token del encabezado de la autorización
    const authHeader = req.headers['authorization'];
    // El token viene en formato "Bearer YOUR_TOKEN", así que lo separamos
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        // Si no hay token, el usuario no está autenticado
        return res.status(401).json({ message: 'Acceso denegado. No se proporcionó token.' });
    }

    try {
        // 2. Verificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 3. Adjuntar la información del usuario al objeto 'req'
        // Esto permite que las rutas subsiguientes sepan qué usuario hizo la solicitud
        req.user = decoded; 
        
        // 4. Continuar con la siguiente función middleware o ruta
        next();
    } catch (error) {
        // Si el token no es válido (expirado, malformado, etc.)
        console.error('Error de autenticación:', error.message);
        return res.status(403).json({ message: 'Token inválido o expirado.' });
    }
};

module.exports = authMiddleware;