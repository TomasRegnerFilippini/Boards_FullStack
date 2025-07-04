// src/routes/taskRoutes.js
const express = require('express');
const authMiddleware = require('../middleware/authMiddleware'); // Importa el middleware de autenticación
const db = require('../db'); // Importa la instancia de la base de datos
const { tasks } = require('../db/schema'); // Importa la tabla de tareas del esquema
const { eq, and } = require('drizzle-orm'); // Necesitas 'eq' para WHERE y 'and' para múltiples condiciones

const router = express.Router();

// --- RUTAS PROTEGIDAS POR AUTENTICACIÓN ---
// Todas estas rutas usarán 'authMiddleware' para asegurar que el usuario esté logueado

// Ruta para crear una nueva tarea
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { title, description, status, priority, dueDate } = req.body;
        const userId = req.user.userId; // Obtenemos el ID del usuario del token JWT (adjuntado por authMiddleware)

        // Validación básica de entrada
        if (!title) {
            return res.status(400).json({ message: 'El título de la tarea es requerido.' });
        }

        const newTask = await db.insert(tasks).values({
            userId,
            title,
            description,
            status: status || 'pending', // Default a 'pending' si no se proporciona
            priority: priority || 'low',   // Default a 'low' si no se proporciona
            dueDate: dueDate ? new Date(dueDate) : null, // Convertir a objeto Date o null
            // createdAt y updatedAt se manejarán con defaultNow() en el esquema
        }).returning(); // .returning() para obtener la tarea insertada

        if (!newTask || newTask.length === 0) {
            return res.status(500).json({ message: 'Error al crear la tarea.' });
        }

        res.status(201).json({ message: 'Tarea creada exitosamente', task: newTask[0] });
    } catch (error) {
        console.error('Error al crear tarea:', error);
        res.status(500).json({ message: 'Error interno del servidor al crear la tarea.' });
    }
});

// Ruta para obtener todas las tareas del usuario autenticado
router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId; // Obtenemos el ID del usuario del token JWT

        // Selecciona todas las tareas que pertenecen al usuario autenticado
        const userTasks = await db.select().from(tasks).where(eq(tasks.userId, userId));

        res.status(200).json(userTasks); // Envía el array de tareas
    } catch (error) {
        console.error('Error al obtener tareas:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener las tareas.' });
    }
});

// Ruta para obtener una tarea específica por ID
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const taskId = parseInt(req.params.id); // Convierte el ID de la URL a número
        const userId = req.user.userId;

        if (isNaN(taskId)) {
            return res.status(400).json({ message: 'ID de tarea inválido.' });
        }

        // Busca la tarea por ID y asegúrate de que pertenezca al usuario autenticado
        const task = await db.select()
                           .from(tasks)
                           .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));

        if (!task || task.length === 0) {
            return res.status(404).json({ message: 'Tarea no encontrada o no pertenece a este usuario.' });
        }

        res.status(200).json(task[0]);
    } catch (error) {
        console.error('Error al obtener tarea por ID:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener la tarea.' });
    }
});

// Ruta para actualizar una tarea existente
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const taskId = parseInt(req.params.id);
        const userId = req.user.userId;
        const { title, description, status, priority, dueDate, completedAt } = req.body;

        if (isNaN(taskId)) {
            return res.status(400).json({ message: 'ID de tarea inválido.' });
        }

        // Prepara los datos a actualizar, solo incluyendo los que se proporcionaron
        const updatedData = {};
        if (title !== undefined) updatedData.title = title;
        if (description !== undefined) updatedData.description = description;
        if (status !== undefined) updatedData.status = status;
        if (priority !== undefined) updatedData.priority = priority;
        if (dueDate !== undefined) updatedData.dueDate = dueDate ? new Date(dueDate) : null;
        if (completedAt !== undefined) updatedData.completedAt = completedAt ? new Date(completedAt) : null;
        updatedData.updatedAt = new Date(); // Actualiza el timestamp de modificación

        // Actualiza la tarea, asegurando que pertenezca al usuario y devuelva la tarea actualizada
        const updatedTask = await db.update(tasks)
                                   .set(updatedData)
                                   .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
                                   .returning();

        if (!updatedTask || updatedTask.length === 0) {
            return res.status(404).json({ message: 'Tarea no encontrada o no pertenece a este usuario.' });
        }

        res.status(200).json({ message: 'Tarea actualizada exitosamente', task: updatedTask[0] });
    } catch (error) {
        console.error('Error al actualizar tarea:', error);
        res.status(500).json({ message: 'Error interno del servidor al actualizar la tarea.' });
    }
});

// Ruta para eliminar una tarea
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const taskId = parseInt(req.params.id);
        const userId = req.user.userId;

        if (isNaN(taskId)) {
            return res.status(400).json({ message: 'ID de tarea inválido.' });
        }

        // Elimina la tarea, asegurando que pertenezca al usuario
        const deletedTask = await db.delete(tasks)
                                  .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
                                  .returning(); // Drizzle retorna los registros eliminados

        if (!deletedTask || deletedTask.length === 0) {
            return res.status(404).json({ message: 'Tarea no encontrada o no pertenece a este usuario.' });
        }

        res.status(200).json({ message: 'Tarea eliminada exitosamente', task: deletedTask[0] });
    } catch (error) {
        console.error('Error al eliminar tarea:', error);
        res.status(500).json({ message: 'Error interno del servidor al eliminar la tarea.' });
    }
});

module.exports = router;