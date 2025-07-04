// src/routes/taskRoutes.js
const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const db = require('../db');
const { tasks } = require('../db/schema');
const { eq, and, count } = require('drizzle-orm');

const router = express.Router();

// Middleware de autenticación para todas las rutas definidas en este router.
router.use(authMiddleware);

// --- RUTA: Reordenar Tareas (PUT /api/tasks/reorder) ---
// ¡IMPORTANTE: COLOCADA AQUÍ PARA EVITAR CONFLICTOS CON /:id!
router.put('/reorder', async (req, res) => {
    try {
        console.log('--- ¡¡¡EJECUTANDO RUTA /api/tasks/reorder DENTRO DE taskRoutes.js!!! ---');

        const { orderedTasks } = req.body;
        const userId = req.user.userId;

        console.log('--- Intentando reordenar tareas ---');
        console.log('Usuario ID (desde token):', userId);
        console.log('Cuerpo de la solicitud (orderedTasks):', JSON.stringify(orderedTasks, null, 2));

        if (!Array.isArray(orderedTasks) || orderedTasks.length === 0) {
            console.log('Error de validación inicial: Array de tareas ordenadas inválido o vacío.');
            return res.status(400).json({ message: 'Array de tareas ordenadas inválido.' });
        }

        const transaction = await db.transaction(async (tx) => {
            const results = [];
            for (const taskUpdate of orderedTasks) {
                const { id, orderIndex } = taskUpdate;

                console.log(`Procesando tarea ID: ${id}, newOrderIndex: ${orderIndex}`);

                if (typeof id !== 'number' || typeof orderIndex !== 'number') {
                    console.log(`Error: ID ${id} o orderIndex ${orderIndex} no son números.`);
                    throw new Error('Formato de tarea ordenada inválido: id y orderIndex deben ser números enteros.');
                }

                const existingTask = await tx.select()
                                            .from(tasks)
                                            .where(and(eq(tasks.id, id), eq(tasks.userId, userId)));

                console.log(`Verificación de existencia para Tarea ID ${id} con Usuario ID ${userId}:`, existingTask);

                if (existingTask.length === 0) {
                    console.log(`VALIDACIÓN FALLIDA: Tarea con ID ${id} no encontrada o no pertenece al usuario ${userId}.`);
                    throw new Error(`Tarea con ID ${id} no encontrada o no pertenece a este usuario.`);
                }

                const updated = await tx.update(tasks)
                                        .set({ orderIndex: orderIndex, updatedAt: new Date() })
                                        .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
                                        .returning({ id: tasks.id, orderIndex: tasks.orderIndex });

                console.log(`Resultado de actualización para ID ${id}:`, updated);

                if (updated.length > 0) {
                    results.push(updated[0]);
                } else {
                    console.log(`Advertencia: La tarea con ID ${id} no se actualizó, a pesar de existir.`);
                    throw new Error(`Fallo al actualizar la tarea con ID ${id}.`);
                }
            }
            return results;
        });

        if (transaction.length === 0) {
            console.log('Advertencia: La transacción se completó, pero no se reordenó ninguna tarea.');
            return res.status(400).json({ message: 'Ninguna tarea fue reordenada, verifica los IDs y el usuario.' });
        }

        console.log('Reordenamiento exitoso. Tareas actualizadas:', transaction);
        res.status(200).json({ message: 'Tareas reordenadas exitosamente', updatedTasks: transaction });
    } catch (error) {
        console.error('--- ERROR al reordenar tareas (DETALLE COMPLETO) ---');
        console.error('Mensaje:', error.message);
        console.error('Stack:', error.stack);
        console.error('----------------------------------------------------');

        res.status(500).json({ message: error.message || 'Error interno del servidor al reordenar tareas.' });
    }
});

// --- FIN RUTA REORDER ---


// Ruta para obtener todas las tareas del usuario (GET /api/tasks)
router.get('/', async (req, res) => {
    try {
        const userId = req.user.userId;
        const userTasks = await db.select().from(tasks).where(eq(tasks.userId, userId)).orderBy(tasks.orderIndex); // Ordenar por orderIndex
        res.status(200).json(userTasks);
    } catch (error) {
        console.error('Error al obtener tareas:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener tareas.' });
    }
});

// Ruta para obtener una tarea por ID (GET /api/tasks/:id)
// ESTA RUTA DEBE IR DESPUÉS DE /reorder para evitar conflictos.
router.get('/:id', async (req, res) => {
    try {
        const taskId = parseInt(req.params.id);
        const userId = req.user.userId;

        if (isNaN(taskId)) {
            return res.status(400).json({ message: 'ID de tarea inválido.' });
        }

        const taskArray = await db.select().from(tasks).where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));
        const task = taskArray[0];

        if (!task) {
            return res.status(404).json({ message: 'Tarea no encontrada o no pertenece al usuario.' });
        }

        res.status(200).json(task);
    } catch (error) {
        console.error('Error al obtener tarea por ID:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener la tarea.' });
    }
});


// Ruta para crear una nueva tarea (POST /api/tasks)
router.post('/', async (req, res) => {
    try {
        const { title, description, status, priority, dueDate } = req.body;
        const userId = req.user.userId;

        if (!title) {
            return res.status(400).json({ message: 'El título de la tarea es requerido.' });
        }

        const taskCountResult = await db.select({ count: count() })
                                        .from(tasks)
                                        .where(eq(tasks.userId, userId));
        const currentTaskCount = taskCountResult[0].count;
        const newOrderIndex = currentTaskCount; 

        const newTask = await db.insert(tasks).values({
            userId,
            title,
            description,
            status: status || 'pending',
            priority: priority || 'low',
            dueDate: dueDate ? new Date(dueDate) : null,
            orderIndex: newOrderIndex,
        }).returning();

        if (!newTask || newTask.length === 0) {
            return res.status(500).json({ message: 'Error al crear la tarea.' });
        }

        res.status(201).json({ message: 'Tarea creada exitosamente', task: newTask[0] });
    } catch (error) {
        console.error('Error al crear tarea:', error);
        res.status(500).json({ message: 'Error interno del servidor al crear la tarea.' });
    }
});

// Ruta para actualizar una tarea (PUT /api/tasks/:id)
router.put('/:id', async (req, res) => {
    try {
        const taskId = parseInt(req.params.id);
        const userId = req.user.userId;
        const { title, description, status, priority, dueDate, completedAt } = req.body;

        if (isNaN(taskId)) {
            return res.status(400).json({ message: 'ID de tarea inválido.' });
        }

        const updateFields = { updatedAt: new Date() };
        if (title !== undefined) updateFields.title = title;
        if (description !== undefined) updateFields.description = description;
        if (status !== undefined) updateFields.status = status;
        if (priority !== undefined) updateFields.priority = priority;
        if (dueDate !== undefined) updateFields.dueDate = dueDate ? new Date(dueDate) : null;
        if (completedAt !== undefined) updateFields.completedAt = completedAt ? new Date(completedAt) : null;

        if (Object.keys(updateFields).length === 1 && updateFields.updatedAt) {
            return res.status(400).json({ message: 'No se proporcionaron campos para actualizar.' });
        }

        const updatedTask = await db.update(tasks)
                                        .set(updateFields)
                                        .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
                                        .returning();

        if (!updatedTask || updatedTask.length === 0) {
            return res.status(404).json({ message: 'Tarea no encontrada o no pertenece al usuario.' });
        }

        res.status(200).json({ message: 'Tarea actualizada exitosamente', task: updatedTask[0] });
    } catch (error) {
        console.error('Error al actualizar tarea:', error);
        res.status(500).json({ message: 'Error interno del servidor al actualizar la tarea.' });
    }
});

// Ruta para eliminar una tarea (DELETE /api/tasks/:id)
router.delete('/:id', async (req, res) => {
    try {
        const taskId = parseInt(req.params.id);
        const userId = req.user.userId;

        if (isNaN(taskId)) {
            return res.status(400).json({ message: 'ID de tarea inválido.' });
        }

        const deletedTask = await db.delete(tasks)
                                        .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
                                        .returning();

        if (!deletedTask || deletedTask.length === 0) {
            return res.status(404).json({ message: 'Tarea no encontrada o no pertenece al usuario.' });
        }

        res.status(200).json({ message: 'Tarea eliminada exitosamente', task: deletedTask[0] });
    } catch (error) {
        console.error('Error al eliminar tarea:', error);
        res.status(500).json({ message: 'Error interno del servidor al eliminar la tarea.' });
    }
});

module.exports = router;