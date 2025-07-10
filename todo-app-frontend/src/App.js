// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';
import './App.css'; // Puedes ajustar tus estilos CSS globales aquí

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Al cargar la aplicación, verifica si hay un token en localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Opcional: podrías verificar si el token es válido con una llamada al backend
      setIsAuthenticated(true);
    }
  }, []);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); // Eliminar el token de localStorage
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <div className="App">
        <nav style={navStyle}>
          <ul style={ulStyle}>
            <li style={liStyle}>
              <Link to="/" style={linkStyle}>Inicio</Link>
            </li>
            {!isAuthenticated && (
              <li style={liStyle}>
                <Link to="/auth" style={linkStyle}>Login / Registro</Link>
              </li>
            )}
            {isAuthenticated && (
              <li style={liStyle}>
                <Link to="/dashboard" style={linkStyle}>Dashboard</Link>
              </li>
            )}
            {isAuthenticated && (
              <li style={liStyle}>
                <button onClick={handleLogout} style={logoutLinkStyle}>Cerrar Sesión</button>
              </li>
            )}
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
              <h1>Bienvenido a tu Todo App</h1>
              <p>Por favor, regístrate o inicia sesión para continuar.</p>
            </div>
          } />
          {/* Ruta para el formulario de autenticación */}
          <Route path="/auth" element={isAuthenticated ? <Navigate to="/dashboard" /> : <AuthForm onAuthSuccess={handleAuthSuccess} />} />
          {/* Ruta protegida para el dashboard */}
          <Route path="/dashboard" element={isAuthenticated ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/auth" />} />
          {/* Ruta para cualquier otra URL no definida */}
          <Route path="*" element={<p style={{ textAlign: 'center', marginTop: '50px' }}>404: Página no encontrada</p>} />
        </Routes>
      </div>
    </Router>
  );
}

// Estilos básicos para la barra de navegación
const navStyle = {
  backgroundColor: '#333',
  padding: '10px 0',
  boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
};

const ulStyle = {
  listStyle: 'none',
  display: 'flex',
  justifyContent: 'center',
  margin: 0,
  padding: 0
};

const liStyle = {
  margin: '0 15px'
};

const linkStyle = {
  color: 'white',
  textDecoration: 'none',
  padding: '8px 15px',
  borderRadius: '4px',
  transition: 'background-color 0.2s ease-in-out'
};

const logoutLinkStyle = {
  background: 'none',
  border: 'none',
  color: 'white',
  cursor: 'pointer',
  padding: '8px 15px',
  borderRadius: '4px',
  transition: 'background-color 0.2s ease-in-out'
};


export default App;
