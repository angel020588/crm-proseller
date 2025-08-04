
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function SuperAdminPanel() {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [systemStats, setSystemStats] = useState({});
  const [premiumGifts, setPremiumGifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [godMode, setGodMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkSuperAdminAccess();
    fetchAllData();
  }, []);

  const checkSuperAdminAccess = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.email !== 'fundaciondam2019@gmail.com') {
        navigate('/dashboard');
        return;
      }
      setGodMode(true);
    } catch (error) {
      navigate('/login');
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [usersRes, statsRes] = await Promise.all([
        axios.get('/api/super-admin/users', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get('/api/super-admin/stats', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      setUsers(usersRes.data);
      setSystemStats(statsRes.data);
    } catch (error) {
      setError('Error al cargar datos del super admin');
    } finally {
      setLoading(false);
    }
  };

  // 👑 REGALAR PREMIUM A CUALQUIER USUARIO
  const giftPremium = async (userId, months = 3) => {
    try {
      await axios.post(`/api/super-admin/gift-premium`, {
        userId,
        months
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSuccess(`¡Premium regalado por ${months} meses!`);
      fetchAllData();
    } catch (error) {
      setError('Error al regalar premium');
    }
  };

  // 🎭 CAMBIAR ROL DE CUALQUIER USUARIO
  const changeUserRole = async (userId, newRole) => {
    try {
      await axios.put(`/api/super-admin/change-role`, {
        userId,
        role: newRole
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSuccess(`Rol cambiado a ${newRole}`);
      fetchAllData();
    } catch (error) {
      setError('Error al cambiar rol');
    }
  };

  // 💰 CREAR CÓDIGOS DE DESCUENTO
  const createDiscountCode = async () => {
    const code = prompt('Nombre del código de descuento:');
    const discount = prompt('Porcentaje de descuento (0-100):');
    const maxUses = prompt('Máximo de usos (0 = ilimitado):');

    if (!code || !discount) return;

    try {
      await axios.post(`/api/super-admin/create-discount`, {
        code,
        discount: parseInt(discount),
        maxUses: parseInt(maxUses) || 0
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSuccess(`Código ${code} creado con ${discount}% descuento`);
    } catch (error) {
      setError('Error al crear código de descuento');
    }
  };

  // 🔧 MANTENIMIENTO DEL SISTEMA
  const maintenanceMode = async (enable) => {
    try {
      await axios.post(`/api/super-admin/maintenance`, {
        enabled: enable
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSuccess(`Modo mantenimiento ${enable ? 'activado' : 'desactivado'}`);
    } catch (error) {
      setError('Error al cambiar modo mantenimiento');
    }
  };

  // 📊 GENERAR REPORTE FINANCIERO
  const generateFinancialReport = async () => {
    try {
      const response = await axios.get('/api/super-admin/financial-report', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte_financiero_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccess('Reporte financiero descargado');
    } catch (error) {
      setError('Error al generar reporte financiero');
    }
  };

  // 🎯 ENVIAR NOTIFICACIÓN GLOBAL
  const sendGlobalNotification = async () => {
    const title = prompt('Título de la notificación:');
    const message = prompt('Mensaje:');
    const type = prompt('Tipo (info, warning, error, success):') || 'info';

    if (!title || !message) return;

    try {
      await axios.post(`/api/super-admin/global-notification`, {
        title,
        message,
        type
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSuccess('Notificación enviada a todos los usuarios');
    } catch (error) {
      setError('Error al enviar notificación global');
    }
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-8 rounded-2xl">
        <h2 className="text-3xl font-bold mb-4">👑 Modo Super Admin Activado</h2>
        <p className="text-purple-100">Control total del sistema CRM ProSeller</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-500 text-white p-6 rounded-xl">
          <div className="text-3xl font-bold">{systemStats.totalUsers || 0}</div>
          <div className="text-blue-100">Total Usuarios</div>
        </div>
        <div className="bg-green-500 text-white p-6 rounded-xl">
          <div className="text-3xl font-bold">{systemStats.premiumUsers || 0}</div>
          <div className="text-green-100">Usuarios Premium</div>
        </div>
        <div className="bg-yellow-500 text-white p-6 rounded-xl">
          <div className="text-3xl font-bold">${systemStats.monthlyRevenue || 0}</div>
          <div className="text-yellow-100">Ingresos Mensuales</div>
        </div>
        <div className="bg-purple-500 text-white p-6 rounded-xl">
          <div className="text-3xl font-bold">{systemStats.activeSubscriptions || 0}</div>
          <div className="text-purple-100">Suscripciones Activas</div>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">⚡ Acciones Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={createDiscountCode}
            className="p-4 bg-green-100 hover:bg-green-200 border border-green-300 rounded-lg text-center"
          >
            <div className="text-2xl mb-2">💰</div>
            <div className="text-sm font-medium">Crear Código Descuento</div>
          </button>
          <button
            onClick={() => maintenanceMode(true)}
            className="p-4 bg-yellow-100 hover:bg-yellow-200 border border-yellow-300 rounded-lg text-center"
          >
            <div className="text-2xl mb-2">🔧</div>
            <div className="text-sm font-medium">Modo Mantenimiento</div>
          </button>
          <button
            onClick={generateFinancialReport}
            className="p-4 bg-blue-100 hover:bg-blue-200 border border-blue-300 rounded-lg text-center"
          >
            <div className="text-2xl mb-2">📊</div>
            <div className="text-sm font-medium">Reporte Financiero</div>
          </button>
          <button
            onClick={sendGlobalNotification}
            className="p-4 bg-purple-100 hover:bg-purple-200 border border-purple-300 rounded-lg text-center"
          >
            <div className="text-2xl mb-2">📢</div>
            <div className="text-sm font-medium">Notificación Global</div>
          </button>
        </div>
      </div>
    </div>
  );

  const renderUsersTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">👥 Control Total de Usuarios</h2>
        <div className="space-x-2">
          <button
            onClick={() => window.open('/api/super-admin/export/all-data', '_blank')}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            📥 Exportar Todo
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ingresos</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones Super Admin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user.subscription?.plan === 'premium' ? 'bg-gold-100 text-gold-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.subscription?.plan || 'gratuito'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.isActive ? 'Activo' : 'Pausado'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  ${user.totalRevenue || 0}
                </td>
                <td className="px-6 py-4 space-x-2">
                  <button
                    onClick={() => giftPremium(user.id, 3)}
                    className="px-3 py-1 text-xs bg-gold-500 hover:bg-gold-600 text-white rounded"
                    title="Regalar 3 meses premium"
                  >
                    👑 Premium x3
                  </button>
                  <button
                    onClick={() => giftPremium(user.id, 12)}
                    className="px-3 py-1 text-xs bg-purple-500 hover:bg-purple-600 text-white rounded"
                    title="Regalar 1 año premium"
                  >
                    💎 Premium x12
                  </button>
                  <select
                    onChange={(e) => changeUserRole(user.id, e.target.value)}
                    className="px-2 py-1 text-xs border rounded"
                    defaultValue={user.role || 'user'}
                  >
                    <option value="user">Usuario</option>
                    <option value="moderator">Moderador</option>
                    <option value="admin">Admin</option>
                    <option value="vip">VIP</option>
                  </select>
                  {user.email !== 'fundaciondam2019@gmail.com' && (
                    <button
                      onClick={() => {
                        if (window.confirm('⚠️ ¿Eliminar este usuario?')) {
                          // Lógica de eliminación
                        }
                      }}
                      className="px-3 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded"
                    >
                      🗑️
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSystemTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">🔧 Control del Sistema</h2>
      
      {/* Configuraciones Globales */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">⚙️ Configuraciones Globales</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Registro de nuevos usuarios</span>
              <button className="bg-green-500 text-white px-3 py-1 rounded text-sm">
                Habilitado
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span>Modo mantenimiento</span>
              <button 
                onClick={() => maintenanceMode(false)}
                className="bg-gray-500 text-white px-3 py-1 rounded text-sm"
              >
                Deshabilitado
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span>Límite de usuarios gratuitos</span>
              <input 
                type="number" 
                className="border rounded px-2 py-1 w-20" 
                defaultValue="1000"
              />
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Precio Premium (USD)</span>
              <input 
                type="number" 
                className="border rounded px-2 py-1 w-20" 
                defaultValue="29.99"
              />
            </div>
            <div className="flex items-center justify-between">
              <span>Trial premium (días)</span>
              <input 
                type="number" 
                className="border rounded px-2 py-1 w-20" 
                defaultValue="7"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Acciones Peligrosas */}
      <div className="bg-red-50 rounded-xl shadow-md p-6 border border-red-200">
        <h3 className="text-lg font-semibold mb-4 text-red-800">☠️ Zona Peligrosa</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <button
            onClick={() => {
              if (window.confirm('⚠️ ¿Reiniciar toda la base de datos? ESTO NO SE PUEDE DESHACER')) {
                // Lógica de reset
              }
            }}
            className="p-4 bg-red-100 hover:bg-red-200 border border-red-300 rounded-lg text-center text-red-800"
          >
            <div className="text-2xl mb-2">💥</div>
            <div className="text-sm font-medium">Reset DB Completo</div>
          </button>
          <button
            onClick={() => {
              if (window.confirm('⚠️ ¿Eliminar todas las suscripciones?')) {
                // Lógica de eliminación
              }
            }}
            className="p-4 bg-red-100 hover:bg-red-200 border border-red-300 rounded-lg text-center text-red-800"
          >
            <div className="text-2xl mb-2">💳</div>
            <div className="text-sm font-medium">Cancelar Todas las Suscripciones</div>
          </button>
          <button
            onClick={() => {
              if (window.confirm('⚠️ ¿Regalar Premium a TODOS los usuarios?')) {
                // Lógica masiva
              }
            }}
            className="p-4 bg-green-100 hover:bg-green-200 border border-green-300 rounded-lg text-center text-green-800"
          >
            <div className="text-2xl mb-2">🎁</div>
            <div className="text-sm font-medium">Premium para Todos</div>
          </button>
        </div>
      </div>
    </div>
  );

  if (!godMode) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">🚫 Acceso Denegado</h1>
          <p>Solo el Super Admin puede acceder a este panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            👑 Super Admin Panel
          </h1>
          <p className="text-gray-600 mt-2">Control absoluto del CRM ProSeller - Modo Dios Activado</p>
        </div>

        {/* Alertas */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md mb-6">
          <div className="flex border-b">
            {[
              { id: 'overview', label: '👑 Overview', icon: '👑' },
              { id: 'users', label: '👥 Usuarios', icon: '👥' },
              { id: 'system', label: '🔧 Sistema', icon: '🔧' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-medium ${
                  activeTab === tab.id
                    ? 'border-b-2 border-purple-500 text-purple-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Contenido */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          {loading && (
            <div className="text-center py-12">
              <div className="text-lg text-gray-600">Cargando super admin data...</div>
            </div>
          )}

          {!loading && activeTab === 'overview' && renderOverviewTab()}
          {!loading && activeTab === 'users' && renderUsersTab()}
          {!loading && activeTab === 'system' && renderSystemTab()}
        </div>
      </div>
    </div>
  );
}
