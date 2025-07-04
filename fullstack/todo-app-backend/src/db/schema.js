// src/db/schema.js
const { pgTable, serial, text, timestamp } = require('drizzle-orm/pg-core');

// Definición de la tabla de usuarios
// Se usa 'text' para username y email ya que son cadenas de longitud variable.
// 'unique()' asegura que no haya dos usuarios con el mismo username o email.
// 'notNull()' asegura que estos campos siempre deben tener un valor.
const users = pgTable('users', {
    id: serial('id').primaryKey(),
    username: text('username').notNull().unique(), // Se mantiene el username como único y no nulo
    email: text('email').notNull().unique(),       // NUEVO: Campo email, único y no nulo
    passwordHash: text('password_hash').notNull(),  // Hash de la contraseña
    createdAt: timestamp('created_at').defaultNow().notNull(), // Fecha de creación (automática)
    updatedAt: timestamp('updated_at').defaultNow().notNull(), // Fecha de última actualización (automática)
});

// Definición de la tabla de tareas
// 'userId' es una clave foránea que referencia el 'id' de la tabla 'users'.
// 'onDelete: 'cascade'' significa que si un usuario es eliminado, sus tareas también lo serán.
// 'text' se usa para campos como title, description, status, priority por su flexibilidad.
const tasks = pgTable('tasks', {
    id: serial('id').primaryKey(),
    userId: serial('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }), // Clave foránea al usuario
    title: text('title').notNull(),        // Título de la tarea, no puede ser nulo
    description: text('description'),      // Descripción de la tarea (opcional)
    status: text('status').default('pending').notNull(), // Estado de la tarea (ej. 'pending', 'completed')
    priority: text('priority').default('low').notNull(), // Prioridad de la tarea (ej. 'low', 'medium', 'high')
    dueDate: timestamp('due_date'),        // Fecha de vencimiento (opcional)
    completedAt: timestamp('completed_at'), // Fecha de completado (opcional)
    createdAt: timestamp('created_at').defaultNow().notNull(), // Fecha de creación (automática)
    updatedAt: timestamp('updated_at').defaultNow().notNull(), // Fecha de última actualización (automática)
});

// Exporta las tablas para que puedan ser utilizadas en otras partes de la aplicación (ej. en db/index.js o en las rutas)
module.exports = {
    users,
    tasks,
};