// src/routes/authRoutes.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { users } = require('../db/schema');
const { eq } = require('drizzle-orm'); // Necesario para las consultas WHERE

const router = express.Router();

// Ruta de Registro
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body; // Ahora esperamos 'email'

    if (!email || !password) { // Validamos 'email' y 'password'
        return res.status(400).json({ message: 'Correo electrónico y contraseña son requeridos.' });
    }

    try {
        // Verificar si el correo ya existe
        const existingUser = await db.select().from(users).where(eq(users.email, email));
        if (existingUser.length > 0) {
            return res.status(409).json({ message: 'El correo electrónico ya está registrado.' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        // Insertar el nuevo usuario con email
        const newUser = await db.insert(users).values({
            username: username || email, // Puedes mantener username como opcional o usar el email como username si no se proporciona
            email, // Guardamos el email
            passwordHash,
        }).returning({ id: users.id, username: users.username, email: users.email }); // Retornar email también

        const token = jwt.sign(
            { userId: newUser[0].id, username: newUser[0].username, email: newUser[0].email }, // Incluir email en el token
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            token,
            user: { id: newUser[0].id, username: newUser[0].username, email: newUser[0].email }
        });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// Ruta de Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body; // Ahora esperamos 'email'

    if (!email || !password) { // Validamos 'email' y 'password'
        return res.status(400).json({ message: 'Correo electrónico y contraseña son requeridos.' });
    }

    try {
        // Buscar usuario por email
        const userArray = await db.select().from(users).where(eq(users.email, email));
        const user = userArray[0];

        if (!user) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        const token = jwt.sign(
            { userId: user.id, username: user.username, email: user.email }, // Incluir email en el token
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'Inicio de sesión exitoso',
            token,
            user: { id: user.id, username: user.username, email: user.email }
        });
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

module.exports = router;
