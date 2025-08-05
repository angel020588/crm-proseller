
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import SuperAdminPanel from './pages/SuperAdminPanel';
import Clients from './pages/Clients';
import Leads from './pages/Leads';
import Followups from './pages/Followups';
import Quotations from './pages/Quotations';
import Notifications from './pages/Notifications';
import Subscription from './pages/Subscription';
import Roles from './pages/Roles';
import ApiKeys from './pages/ApiKeys';
import Automation from './pages/Automation';
import Resumen from './pages/Resumen';
import ResumenCompleto from './pages/ResumenCompleto';
import Account from './pages/Account';
import PrivateRoute from './components/PrivateRoute';
import NotFound from './components/NotFound';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<PrivateRoute component={Dashboard} />} />
        <Route path="/admin" element={<PrivateRoute component={AdminPanel} />} />
        <Route path="/superadmin" element={<PrivateRoute component={SuperAdminPanel} />} />
        <Route path="/clients" element={<PrivateRoute component={Clients} />} />
        <Route path="/leads" element={<PrivateRoute component={Leads} />} />
        <Route path="/followups" element={<PrivateRoute component={Followups} />} />
        <Route path="/quotations" element={<PrivateRoute component={Quotations} />} />
        <Route path="/notifications" element={<PrivateRoute component={Notifications} />} />
        <Route path="/subscription" element={<PrivateRoute component={Subscription} />} />
        <Route path="/roles" element={<PrivateRoute component={Roles} />} />
        <Route path="/apikeys" element={<PrivateRoute component={ApiKeys} />} />
        <Route path="/automation" element={<PrivateRoute component={Automation} />} />
        <Route path="/resumen" element={<PrivateRoute component={Resumen} />} />
        <Route path="/resumen-completo" element={<PrivateRoute component={ResumenCompleto} />} />
        <Route path="/account" element={<PrivateRoute component={Account} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
