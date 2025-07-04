// src/db/index.js
require('dotenv').config(); // Carga las variables de entorno desde .env

const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const schema = require('./schema');

// Verificar que la URL esté definida
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL no está definida en .env');
  throw new Error('Falta definir DATABASE_URL en el archivo .env');
}

// Inicializa el cliente de PostgreSQL
const client = postgres(connectionString, {
  // Opcional: log de queries para depuración. Descomentar si necesitas ver las queries SQL.
  // debug: true
});

// Inicializa Drizzle ORM con el cliente y el esquema
const db = drizzle(client, { schema });

// Para depuración: verifica si la instancia de db se inicializó correctamente
console.log('DB instance initialized in src/db/index.js:', !!db);

// Exporta la instancia de db lista para usar
module.exports = db;
