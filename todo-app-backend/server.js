// server.js
require('dotenv').config(); // Cargar variables de entorno al principio
const express = require('express');
const cors = require('cors');
const authRoutes = require('./src/routes/authRoutes');
const taskRoutes = require('./src/routes/taskRoutes'); // taskRoutes ahora maneja reordenamiento
const db = require('./src/db'); // Importa la instancia de db para asegurar que se inicialice

const app = express();
const PORT = process.env.PORT || 5000; // Confirma que el servidor corre en el puerto 5000

// Middleware
app.use(cors()); // Habilita CORS para permitir solicitudes desde el frontend
app.use(express.json()); // Para parsear cuerpos de solicitud JSON
app.use(express.urlencoded({ extended: true })); // Para parsear datos de formularios URL-encoded

// --- LOG DE DEPURACIÓN GLOBAL ---
// Este middleware se ejecutará para CADA solicitud que llegue a Express.
app.use((req, res, next) => {
    console.log(`--- Petición entrante: ${req.method} ${req.url} ---`);
    console.log('Headers (Authorization):', req.headers.authorization ? 'Presente' : 'Ausente');
    // Para evitar que el body se lea dos veces y cause problemas, solo lo logueamos si es un POST/PUT
    if (req.method === 'POST' || req.method === 'PUT') {
        console.log('Body (antes de ruta):', JSON.stringify(req.body, null, 2));
    }
    next(); // Pasa la solicitud al siguiente middleware/ruta
});
// --- FIN LOG DE DEPURACIÓN GLOBAL ---

// --- RUTAS DE LA APLICACIÓN ---
app.use('/api/auth', authRoutes); // Rutas para registro y login
app.use('/api/tasks', taskRoutes); // Rutas para operaciones CRUD de tareas y reordenamiento

// Ruta de prueba simple para la raíz del API
app.get('/', (req, res) => {
    res.send('API de Todo-App funcionando!');
});

// Middleware de manejo de errores (al final de todas las rutas)
app.use((err, req, res, next) => {
    console.error('ERROR GLOBAL EN EXPRESS:', err.stack);
    res.status(500).send('Algo salió mal en el servidor!');
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Server corriendo en el puerto ${PORT}`);
    // Opcional: una prueba de conexión a la base de datos al iniciar el servidor
    // db.select().from(db.users).limit(0).then(() => {
    //   console.log('¡Conexión a la base de datos exitosa!');
    // }).catch(err => {
    //   console.error('Fallo la conexión a la base de datos:', err);
    // });
});