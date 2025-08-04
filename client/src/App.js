import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Followups from './pages/Followups';
import Notifications from './pages/Notifications';
import Account from './pages/Account';
import Perfil from './pages/Perfil';
import Resumen from './pages/Resumen';
import ResumenCompleto from './pages/ResumenCompleto';
import Leads from './pages/Leads';
import Clients from './pages/Clients';
import Quotations from './pages/Quotations';
import ApiKeys from './pages/ApiKeys';
import Subscription from './pages/Subscription';
import Automation from './pages/Automation';
import Roles from './pages/Roles';
import AdminPanel from './pages/AdminPanel'; // Asegúrate de que esta ruta sea correcta
import './App.css';

// Configurar axios globalmente
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Interceptor para manejar errores de autenticación
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

function App() {
  useEffect(() => {
    // Configurar axios con el token guardado al iniciar la app
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/quotations" element={<Quotations />} />
          <Route path="/followups" element={<Followups />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/account" element={<Account />} />
          <Route path="/apikeys" element={<ApiKeys />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/resumen" element={<Resumen />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/resumen-completo" element={<ResumenCompleto />} />
          <Route path="/automation" element={<Automation />} />
          <Route path="/roles" element={<Roles />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;