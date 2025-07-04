// server.js
require('dotenv').config(); // Cargar variables de entorno al principio
const express = require('express');
const cors = require('cors');
const authRoutes = require('./src/routes/authRoutes');
const taskRoutes = require('./src/routes/taskRoutes'); // Importa las nuevas rutas de tareas
const db = require('./src/db'); // Importa la instancia de db para asegurar que se inicialice

const app = express();
const PORT = process.env.PORT || 5000; // Confirmado que el servidor corre en el puerto 5000

// Middleware
app.use(cors()); // Habilita CORS para permitir solicitudes desde el frontend
app.use(express.json()); // Para parsear cuerpos de solicitud JSON

// Rutas
app.use('/api/auth', authRoutes); // Rutas para registro y login
app.use('/api/tasks', taskRoutes); // Rutas para operaciones con tareas (crear, leer, etc.)

// Ruta de prueba simple
app.get('/', (req, res) => {
  res.send('API de Todo-App funcionando!');
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Opcional: una prueba de conexión a la base de datos al iniciar el servidor
  // Esta parte no es estrictamente necesaria para que el servidor funcione, pero ayuda a depurar.
  // db.select().from(db.users).limit(0).then(() => {
  //   console.log('Database connection successful!');
  // }).catch(err => {
  //   console.error('Database connection failed:', err);
  // });
});