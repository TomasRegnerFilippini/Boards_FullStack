// src/db/schema.js
const { pgTable, serial, text, timestamp, integer } = require('drizzle-orm/pg-core');

// Definición de la tabla de usuarios
const users = pgTable('users', {
    id: serial('id').primaryKey(),
    username: text('username').notNull().unique(),
    email: text('email').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});


// Definición de la tabla de tareas
const tasks = pgTable('tasks', {
    id: serial('id').primaryKey(),
    // CORREGIDO: userId debe ser un entero, referenciando users.id
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    status: text('status').default('pending').notNull(),
    priority: text('priority').default('low').notNull(),
    dueDate: timestamp('due_date'),
    completedAt: timestamp('completed_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    orderIndex: integer('order_index').default(0).notNull(),
});

module.exports = {
    users,
    tasks,
};