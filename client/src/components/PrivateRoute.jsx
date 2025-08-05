
import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }
  
  try {
    // Verificar que el token no esté expirado (básico)
    const tokenData = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    if (tokenData.exp < currentTime) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return <Navigate to="/login" replace />;
    }
  } catch (error) {
    console.error('Error validando token:', error);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default PrivateRoute;
