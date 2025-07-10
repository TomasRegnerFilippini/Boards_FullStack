// src/components/AuthForm.js
import React, { useState } from 'react';

const AuthForm = ({ onAuthSuccess }) => {
  const [email, setEmail] = useState(''); // Cambiado de username a email
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); // Añadido para el registro
  const [message, setMessage] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  const API_BASE_URL = 'http://localhost:5000/api/auth';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const endpoint = isRegisterMode ? 'register' : 'login';
    const actionText = isRegisterMode ? 'Registro' : 'Inicio de sesión';

    // Datos a enviar: email y password siempre
    const bodyData = { email, password };
    // Si estamos en modo registro, también enviamos el username
    if (isRegisterMode) {
      bodyData.username = username;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyData), // Usamos bodyData
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`${actionText} exitoso: ${data.message}`);
        console.log(`${actionText} exitoso:`, data);
        if (data.token) {
          localStorage.setItem('token', data.token);
          onAuthSuccess(data.token);
        }
      } else {
        setMessage(`Error al ${actionText.toLowerCase()}: ${data.message}`);
        console.error(`Error en el ${actionText.toLowerCase()}:`, data);
      }
    } catch (error) {
      setMessage(`Error de red: ${error.message}`);
      console.error('Error de red o del servidor:', error);
    }
  };

  return (
    <div style={formContainerStyle}>
      <h2>{isRegisterMode ? 'Registrarse' : 'Iniciar Sesión'}</h2>
      {message && <p style={{ color: message.includes('Error') ? 'red' : 'green' }}>{message}</p>}
      <form onSubmit={handleSubmit} style={formStyle}>
        {isRegisterMode && ( // Solo muestra el campo de username en modo registro
          <input
            type="text"
            placeholder="Nombre de usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={inputStyle}
          />
        )}
        <input
          type="email" // Tipo de input para email
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={inputStyle}
        />
        <button type="submit" style={buttonStyle}>
          {isRegisterMode ? 'Registrarse' : 'Iniciar Sesión'}
        </button>
      </form>
      <button
        onClick={() => setIsRegisterMode(!isRegisterMode)}
        style={toggleButtonStyle}
      >
        {isRegisterMode ? 'Ya tengo cuenta: Iniciar Sesión' : 'No tengo cuenta: Registrarme'}
      </button>
    </div>
  );
};

// Estilos (mantener los mismos o ajustarlos si lo deseas)
const formContainerStyle = {
  padding: '20px',
  maxWidth: '400px',
  margin: '50px auto',
  border: '1px solid #ddd',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  backgroundColor: '#fff',
  textAlign: 'center'
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '15px',
  marginTop: '20px'
};

const inputStyle = {
  padding: '10px 12px',
  borderRadius: '5px',
  border: '1px solid #bbb',
  fontSize: '1em'
};

const buttonStyle = {
  padding: '12px 20px',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '1em',
  fontWeight: 'bold',
  transition: 'background-color 0.2s ease-in-out'
};

const toggleButtonStyle = {
  marginTop: '20px',
  padding: '10px 15px',
  backgroundColor: '#6c757d',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '0.9em',
  transition: 'background-color 0.2s ease-in-out'
};

export default AuthForm;