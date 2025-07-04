// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';

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
        // Ordenar las tareas por ID (o createdAt) para una consistencia visual
        // Si necesitas un ordenamiento personalizado, requerirá un campo en el backend.
        setTasks(data.sort((a, b) => a.id - b.id));
      } else {
        setError(data.message || 'Error al cargar las tareas.');
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
        setTasks(prevTasks => [...prevTasks, data.task].sort((a, b) => a.id - b.id)); // Añade y reordena
        setNewTaskTitle('');
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
    const completedAt = newStatus === 'completed' ? new Date().toISOString() : null; // Marca la fecha de completado

    try {
      const response = await fetch(`${API_TASKS_URL}/${taskId}`, {
        method: 'PUT', // Usamos PUT para actualizar
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus, completedAt: completedAt }),
      });

      const data = await response.json();

      if (response.ok) {
        // Actualiza el estado local de las tareas
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
      return; // Si el usuario cancela, no hacemos nada
    }

    try {
      const response = await fetch(`${API_TASKS_URL}/${taskId}`, {
        method: 'DELETE', // Usamos DELETE para eliminar
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Filtra la tarea eliminada del estado local
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
          <ul style={taskListStyle}>
            {tasks.map(task => (
              <li key={task.id} style={taskItemStyle}>
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
                  🗑️ {/* Icono de tachito de basura */}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

// Estilos básicos (puedes moverlos a un archivo CSS después)
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
    justifyContent: 'flex-start', // Alinea los elementos a la izquierda
    alignItems: 'center',
    fontSize: '1.1em'
};

const checkboxStyle = {
    marginRight: '10px',
    transform: 'scale(1.2)' // Hace el checkbox un poco más grande
};

const deleteButtonStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1.5em', // Tamaño del icono
    marginLeft: '15px', // Espacio a la izquierda del icono
    padding: '0 5px',
    color: '#dc3545' // Color del icono
};

export default Dashboard;