import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from './config/api'; // Assuming config/api.js exists and exports API_URL
import './App.css';

// Importar componentes
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Leads from './pages/Leads';
import Quotations from './pages/Quotations';
import Followups from './pages/Followups';
import ApiKeys from './pages/ApiKeys';
import Account from './pages/Perfil'; // Assuming Perfil is the correct path for Account
import Subscription from './pages/Subscription';
import PrivateRoute from './components/PrivateRoute';
import NotFound from './components/NotFound'; // Imported NotFound from original code

// Configurar axios con la URL base
// Make sure API_URL is correctly defined in './config/api'
// Example: export const API_URL = 'http://localhost:5000/api';
axios.defaults.baseURL = API_URL;

function App() {
  // Configurar interceptor para manejar tokens y redireccionar en caso de 401
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Set authorization header for all requests if token exists
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      // If no token, ensure header is removed
      delete axios.defaults.headers.common['Authorization'];
    }

    // Interceptor para manejar respuestas de autenticación
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response, // Simply return response if it's successful
      (error) => {
        // If the error is a 401 (Unauthorized)
        if (error.response?.status === 401) {
          // Clear local storage and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user'); // Assuming user data is also stored
          delete axios.defaults.headers.common['Authorization'];
          // Use window.location.href for a full page reload and redirect
          window.location.href = '/login';
        }
        // Reject the promise to allow further error handling if needed
        return Promise.reject(error);
      }
    );

    // Cleanup function to remove the interceptor when the component unmounts
    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Redirect from root to dashboard if logged in, otherwise to login */}
          <Route path="/" element={
            localStorage.getItem('token') ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          } />

          {/* Protected routes */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />

          <Route path="/clients" element={
            <PrivateRoute>
              <Clients />
            </PrivateRoute>
          } />

          <Route path="/leads" element={
            <PrivateRoute>
              <Leads />
            </PrivateRoute>
          } />

          <Route path="/quotations" element={
            <PrivateRoute>
              <Quotations />
            </PrivateRoute>
          } />

          <Route path="/followups" element={
            <PrivateRoute>
              <Followups />
            </PrivateRoute>
          } />

          <Route path="/apikeys" element={
            <PrivateRoute>
              <ApiKeys />
            </PrivateRoute>
          } />

          <Route path="/account" element={
            <PrivateRoute>
              <Account />
            </PrivateRoute>
          } />

          <Route path="/subscription" element={
            <PrivateRoute>
              <Subscription />
            </PrivateRoute>
          } />

          {/* Catch-all for undefined routes */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;