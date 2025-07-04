// src/db/schema.js
const { pgTable, text, varchar, timestamp, serial, pgEnum, boolean } = require('drizzle-orm/pg-core');

// Definición de enumeraciones
const priorityEnum = pgEnum('priority', ['low', 'medium', 'high']);
const statusEnum = pgEnum('status', ['pending', 'completed']);

// Tabla de usuarios
const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 256 }).unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Tabla de tareas
const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  userId: serial('user_id').notNull().references(() => users.id), // Clave foránea al usuario
  title: varchar('title', { length: 256 }).notNull(),
  description: text('description'),
  status: statusEnum('status').default('pending').notNull(), // Usando el enum
  priority: priorityEnum('priority').default('low').notNull(), // Usando el enum
  dueDate: timestamp('due_date'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(), // Añadir `onUpdate()` si Drizzle lo soporta, o manejar manualmente.
});

module.exports = {
  users,
  tasks,
  priorityEnum,
  statusEnum,
};