// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';

const Dashboard = ({ onLogout }) => {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_TASKS_URL = 'http://localhost:5000/api/tasks'; // URL base para las tareas

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
        setTasks(data); // Asume que el backend devuelve un array de tareas
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
    e.preventDefault(); // Previene la recarga de la página
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
        body: JSON.stringify({ title: newTaskTitle, status: 'pending', priority: 'low' }), // Valores por defecto
      });

      const data = await response.json();

      if (response.ok) {
        setTasks(prevTasks => [...prevTasks, data.task]); // Añade la nueva tarea al estado
        setNewTaskTitle(''); // Limpia el input
      } else {
        setError(data.message || 'Error al crear la tarea.');
      }
    } catch (err) {
      setError('Error de red o del servidor al crear la tarea.');
      console.error('Error al crear tarea:', err);
    }
  };

  // Cargar tareas cuando el componente se monta
  useEffect(() => {
    fetchTasks();
  }, []); // El array vacío asegura que se ejecute solo una vez al montar

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
                <span style={{ textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}>
                  {task.title}
                </span>
                {/* Futuros botones de editar/eliminar/marcar completado irán aquí */}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '1.1em'
};

export default Dashboard;