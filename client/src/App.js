import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import './App.css';
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

function App() {
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
        </Routes>
      </div>
    </Router>
  );
}

export default App;