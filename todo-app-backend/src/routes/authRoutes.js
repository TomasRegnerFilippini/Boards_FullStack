// src/routes/authRoutes.js
// src/routes/authRoutes.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db'); // Importa la instancia de la base de datos
const { users } = require('../db/schema'); // Importa la tabla de usuarios del esquema
const { eq } = require('drizzle-orm'); // Necesitas 'eq' para la cláusula WHERE

console.log('db imported in authRoutes.js:', !!db); // Depuración: true si db no es undefined
console.log('users table imported in authRoutes.js:', !!users); // Depuración: true si users no es undefined

const router = express.Router();

// Ruta de Registro de Usuario
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validar entradas básicas
        if (!username || !password) {
            return res.status(400).json({ message: 'Nombre de usuario y contraseña son requeridos.' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres.' });
        }

        // 1. Verificar si el usuario ya existe
        // La línea 26 del error original (si las líneas coinciden) es db.select()
        const existingUsers = await db.select().from(users).where(eq(users.username, username));
        if (existingUsers.length > 0) {
            return res.status(409).json({ message: 'El usuario ya existe' });
        }

        // 2. Hashear la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Insertar el nuevo usuario en la base de datos
        const newUser = await db.insert(users).values({
            username: username,
            passwordHash: hashedPassword
        }).returning(); // .returning() para obtener el usuario insertado

        // Asegurarse de que el usuario fue insertado (Drizzle con .returning() devuelve un array)
        if (!newUser || newUser.length === 0) {
            return res.status(500).json({ message: 'Error al crear el usuario' });
        }

        // 4. Generar JWT (si el registro es exitoso, puedes generar un token para iniciar sesión automáticamente)
        const token = jwt.sign(
            { userId: newUser[0].id, username: newUser[0].username }, // Acceder al primer elemento del array
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            token,
            user: {
                id: newUser[0].id,
                username: newUser[0].username
            }
        });

    } catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).json({ message: 'Error interno del servidor durante el registro' });
    }
});

// Ruta de Inicio de Sesión de Usuario
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1. Buscar el usuario por nombre de usuario
        const existingUsers = await db.select().from(users).where(eq(users.username, username));
        const user = existingUsers[0]; // Drizzle select devuelve un array

        if (!user) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // 2. Comparar la contraseña hasheada
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // 3. Generar JWT
        const token = jwt.sign(
            { userId: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'Inicio de sesión exitoso',
            token,
            user: {
                id: user.id,
                username: user.username
            }
        });

    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({ message: 'Error interno del servidor durante el inicio de sesión' });
    }
});

module.exports = router;
