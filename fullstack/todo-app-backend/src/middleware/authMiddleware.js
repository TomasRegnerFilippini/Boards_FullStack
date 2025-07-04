// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Acceso denegado. No se proporcionó token.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Aseguramos que el objeto req.user contenga userId, username y email
        req.user = {
            userId: decoded.userId,
            username: decoded.username, // Puede que aún lo uses en algún lado
            email: decoded.email // <-- Asegúrate de que el email esté aquí
        };

        next();
    } catch (error) {
        console.error('Error de autenticación:', error.message);
        return res.status(403).json({ message: 'Token inválido o expirado.' });
    }
};

module.exports = authMiddleware;