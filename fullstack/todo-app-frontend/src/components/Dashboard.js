// src/components/Dashboard.js
import React from 'react';

const Dashboard = ({ onLogout }) => {
  return (
    <div style={dashboardContainerStyle}>
      <h2>¡Bienvenido al Dashboard!</h2>
      <p>Aquí es donde verás y gestionarás tus tareas.</p>
      <button onClick={onLogout} style={logoutButtonStyle}>
        Cerrar Sesión
      </button>
      <p style={{ marginTop: '20px', fontSize: '0.9em', color: '#666' }}>
        El token de sesión no se muestra aquí por seguridad, pero está activo.
      </p>
      {/* FUTURO: Aquí irían los componentes de gestión de tareas */}
    </div>
  );
};

// Estilos básicos
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
  padding: '12px 25px',
  backgroundColor: '#dc3545',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '1em',
  fontWeight: 'bold',
  marginTop: '20px',
  transition: 'background-color 0.2s ease-in-out'
};

export default Dashboard;