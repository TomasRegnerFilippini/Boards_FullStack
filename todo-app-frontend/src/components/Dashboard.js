// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'; // <--- NUEVA IMPORTACIÓN

const Dashboard = ({ onLogout }) => {
    const [tasks, setTasks] = useState([]);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const API_TASKS_URL = 'http://localhost:5000/api/tasks';

    // Función para obtener todas las tareas del usuario
    const fetchTasks = async () => {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('token');
        if (!token) {
            setError('No autenticado. Por favor, inicia sesión de nuevo.');
            setLoading(false);
            onLogout(); // Forzar logout si no hay token
            return;
        }

        try {
            const response = await fetch(API_TASKS_URL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (response.ok) {
                // El backend ya devuelve las tareas ordenadas por orderIndex, lo cual es ideal.
                setTasks(data); 
            } else {
                setError(data.message || 'Error al cargar las tareas.');
                // Si el token es inválido o expirado, forzar logout
                if (response.status === 401 || response.status === 403) {
                    onLogout();
                }
            }
        } catch (err) {
            setError('Error de red o del servidor al cargar tareas.');
            console.error('Error al obtener tareas:', err);
        } finally {
            setLoading(false);
        }
    };

    // Función para crear una nueva tarea
    const handleCreateTask = async (e) => {
        e.preventDefault();
        setError('');
        if (!newTaskTitle.trim()) {
            setError('El título de la tarea no puede estar vacío.');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            setError('No autenticado. Por favor, inicia sesión de nuevo.');
            return;
        }

        try {
            const response = await fetch(API_TASKS_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ title: newTaskTitle, status: 'pending', priority: 'low' }),
            });

            const data = await response.json();

            if (response.ok) {
                // El backend asigna el orderIndex. Volvemos a fetchar para tener el orden correcto.
                // Opcional: podrías insertarlo directamente en el array si el backend te devuelve el orderIndex
                setNewTaskTitle('');
                fetchTasks(); // <--- Volver a cargar para obtener el nuevo orderIndex y mantener la consistencia
            } else {
                setError(data.message || 'Error al crear la tarea.');
            }
        } catch (err) {
            setError('Error de red o del servidor al crear la tarea.');
            console.error('Error al crear tarea:', err);
        }
    };

    // Función para marcar/desmarcar una tarea como completada
    const handleToggleComplete = async (taskId, currentStatus) => {
        setError('');
        const token = localStorage.getItem('token');
        if (!token) {
            setError('No autenticado. Por favor, inicia sesión de nuevo.');
            return;
        }

        const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
        const completedAt = newStatus === 'completed' ? new Date().toISOString() : null;

        try {
            const response = await fetch(`${API_TASKS_URL}/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ status: newStatus, completedAt: completedAt }),
            });

            const data = await response.json();

            if (response.ok) {
                setTasks(prevTasks =>
                    prevTasks.map(task =>
                        task.id === taskId ? { ...task, status: newStatus, completedAt: completedAt } : task
                    )
                );
            } else {
                setError(data.message || 'Error al actualizar la tarea.');
            }
        } catch (err) {
            setError('Error de red o del servidor al actualizar la tarea.');
            console.error('Error al actualizar tarea:', err);
        }
    };

    // Función para eliminar una tarea
    const handleDeleteTask = async (taskId) => {
        setError('');
        const token = localStorage.getItem('token');
        if (!token) {
            setError('No autenticado. Por favor, inicia sesión de nuevo.');
            return;
        }

        if (!window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
            return;
        }

        try {
            const response = await fetch(`${API_TASKS_URL}/${taskId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
            } else {
                const data = await response.json();
                setError(data.message || 'Error al eliminar la tarea.');
            }
        } catch (err) {
            setError('Error de red o del servidor al eliminar la tarea.');
            console.error('Error al eliminar tarea:', err);
        }
    };

    // --- Lógica de Drag and Drop --- <--- NUEVA FUNCIÓN
    const onDragEnd = async (result) => {
        // 'destination' es el lugar donde se soltó el Draggable
        // 'source' es el lugar desde donde se arrastró el Draggable
        // 'draggableId' es el ID del Draggable que se movió
        if (!result.destination) {
            return; // Si no se soltó en un Droppable, no hacer nada
        }

        // Si el elemento no cambió de posición, no hacer nada
        if (result.destination.droppableId === result.source.droppableId &&
            result.destination.index === result.source.index) {
            return;
        }

        const newTasks = Array.from(tasks); // Crear una copia para no mutar el estado directamente
        const [reorderedItem] = newTasks.splice(result.source.index, 1); // Quitar el elemento de su posición original
        newTasks.splice(result.destination.index, 0, reorderedItem); // Insertarlo en la nueva posición

        // Actualizar los 'orderIndex' basándose en la nueva posición en el array
        const updatedOrderTasks = newTasks.map((task, index) => ({
            id: task.id,
            orderIndex: index,
        }));

        setTasks(newTasks); // Actualización optimista: actualizar el UI inmediatamente para una mejor UX

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No autenticado. Por favor, inicia sesión de nuevo.');
                onLogout();
                return;
            }

            // Llamar a tu API de backend para reordenar las tareas
            const response = await fetch(`${API_TASKS_URL}/reorder`, { // <--- RUTA DE REORDENAR
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ orderedTasks: updatedOrderTasks }),
            });

            if (!response.ok) {
                console.error('Error al enviar el reordenamiento al backend:', response.statusText);
                setError('Fallo el reordenamiento en el servidor. Reintentando...');
                fetchTasks(); // <--- Revertir: volver a cargar las tareas del backend si falla
            } else {
                const resultData = await response.json();
                console.log('Reordenamiento exitoso en el backend:', resultData);
                // No es estrictamente necesario volver a fetchTasks() aquí si la actualización optimista fue correcta
                // y el backend devuelve los IDs y orderIndex actualizados.
            }
        } catch (err) {
            console.error('Error calling reorder API:', err);
            setError(err.message || 'Error al guardar el nuevo orden de las tareas.');
            fetchTasks(); // <--- Revertir: refetchear el estado correcto desde el backend
        }
    };

    // Cargar tareas cuando el componente se monta
    useEffect(() => {
        fetchTasks();
    }, []);

    return (
        <div style={dashboardContainerStyle}>
            <h2>¡Bienvenido al Dashboard!</h2>
            <p>Gestiona tus tareas aquí.</p>

            <button onClick={onLogout} style={logoutButtonStyle}>
                Cerrar Sesión
            </button>

            {error && <p style={{ color: 'red', marginTop: '15px' }}>{error}</p>}

            <div style={sectionStyle}>
                <h3>Crear Nueva Tarea</h3>
                <form onSubmit={handleCreateTask} style={createTaskFormStyle}>
                    <input
                        type="text"
                        placeholder="Título de la nueva tarea"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        style={inputStyle}
                    />
                    <button type="submit" style={createTaskButtonStyle}>Añadir Tarea</button>
                </form>
            </div>

            <div style={sectionStyle}>
                <h3>Tus Tareas</h3>
                {loading ? (
                    <p>Cargando tareas...</p>
                ) : tasks.length === 0 ? (
                    <p>No tienes tareas aún. ¡Añade una!</p>
                ) : (
                    // --- Drag and Drop Context --- <--- AQUÍ EMPIEZA LA INTEGRACIÓN DND
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="tasks-list">
                            {(provided) => (
                                <ul
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    style={taskListStyle} // Tus estilos de lista existentes
                                >
                                    {tasks.map((task, index) => (
                                        <Draggable key={String(task.id)} draggableId={String(task.id)} index={index}>
                                            {(provided, snapshot) => ( // 'snapshot' para estilos de arrastre
                                                <li
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps} // Esto permite arrastrar el elemento completo
                                                    style={{
                                                        ...taskItemStyle, // Tus estilos de item existentes
                                                        // Estilos adicionales para visualización durante el arrastre
                                                        backgroundColor: snapshot.isDragging ? '#e0f7fa' : taskItemStyle.backgroundColor, // Color cuando se arrastra
                                                        border: snapshot.isDragging ? '1px solid #00bcd4' : taskItemStyle.border,
                                                        boxShadow: snapshot.isDragging ? '0 4px 15px rgba(0, 0, 0, 0.2)' : taskItemStyle.boxShadow,
                                                        ...provided.draggableProps.style, // ESTO ES CLAVE para el estilo del arrastre
                                                    }}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={task.status === 'completed'}
                                                        onChange={() => handleToggleComplete(task.id, task.status)}
                                                        style={checkboxStyle}
                                                    />
                                                    <span style={{
                                                        textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                                                        flexGrow: 1,
                                                        textAlign: 'left',
                                                        marginLeft: '10px'
                                                    }}>
                                                        {task.title}
                                                    </span>
                                                    <button
                                                        onClick={() => handleDeleteTask(task.id)}
                                                        style={deleteButtonStyle}
                                                        title="Eliminar tarea"
                                                    >
                                                        🗑️
                                                    </button>
                                                </li>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder} {/* Importante para mantener el espacio durante el arrastre */}
                                </ul>
                            )}
                        </Droppable>
                    </DragDropContext>
                    // --- Fin Drag and Drop Context ---
                )}
            </div>
        </div>
    );
};

// Estilos básicos (mantengo tus estilos en línea)
const dashboardContainerStyle = {
    padding: '30px',
    maxWidth: '600px',
    margin: '50px auto',
    border: '1px solid #ddd',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    backgroundColor: '#fff',
    textAlign: 'center'
};

const logoutButtonStyle = {
    padding: '10px 20px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '0.9em',
    fontWeight: 'bold',
    marginTop: '20px',
    transition: 'background-color 0.2s ease-in-out'
};

const sectionStyle = {
    marginTop: '30px',
    paddingTop: '20px',
    borderTop: '1px solid #eee'
};

const createTaskFormStyle = {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    marginTop: '15px'
};

const inputStyle = {
    padding: '10px 12px',
    borderRadius: '5px',
    border: '1px solid #bbb',
    fontSize: '1em',
    flexGrow: 1
};

const createTaskButtonStyle = {
    padding: '10px 15px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1em',
    fontWeight: 'bold'
};

const taskListStyle = {
    listStyle: 'none',
    padding: 0,
    marginTop: '20px'
};

const taskItemStyle = {
    background: '#f9f9f9',
    border: '1px solid #eee',
    padding: '12px 15px',
    marginBottom: '8px',
    borderRadius: '5px',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    fontSize: '1.1em'
};

const checkboxStyle = {
    marginRight: '10px',
    transform: 'scale(1.2)'
};

const deleteButtonStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1.5em',
    marginLeft: '15px',
    padding: '0 5px',
    color: '#dc3545'
};

export default Dashboard;