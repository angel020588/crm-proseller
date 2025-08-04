
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [systemStats, setSystemStats] = useState({});
  const [systemConfig, setSystemConfig] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
    fetchData();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.role !== 'admin') {
        navigate('/dashboard');
        return;
      }
    } catch (error) {
      navigate('/login');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, statsRes] = await Promise.all([
        axios.get('/api/admin/users', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get('/api/admin/stats', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      setUsers(usersRes.data);
      setSystemStats(statsRes.data);
    } catch (error) {
      setError('Error al cargar datos administrativos');
    } finally {
      setLoading(false);
    }
  };

  // 🗑️ BORRAR USUARIO
  const deleteUser = async (userId) => {
    if (!window.confirm('⚠️ ¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await axios.delete(`/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSuccess('Usuario eliminado correctamente');
      fetchData();
    } catch (error) {
      setError('Error al eliminar usuario');
    }
  };

  // ⏸️ PAUSAR/ACTIVAR USUARIO
  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await axios.put(`/api/admin/users/${userId}`, {
        isActive: !currentStatus
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSuccess(`Usuario ${!currentStatus ? 'activado' : 'pausado'} correctamente`);
      fetchData();
    } catch (error) {
      setError('Error al cambiar estado del usuario');
    }
  };

  // 📥 DESCARGAR DATOS
  const downloadData = async (type) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/admin/export/${type}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccess(`Datos de ${type} descargados correctamente`);
    } catch (error) {
      setError(`Error al descargar datos de ${type}`);
    } finally {
      setLoading(false);
    }
  };

  // 🧹 BORRAR DATOS MASIVAMENTE
  const massDelete = async (type) => {
    const confirmText = `ELIMINAR ${type.toUpperCase()}`;
    const userInput = window.prompt(
      `⚠️ PELIGRO: Vas a eliminar TODOS los ${type}.\n\nEscribe exactamente: "${confirmText}" para confirmar:`
    );

    if (userInput !== confirmText) {
      alert('Operación cancelada');
      return;
    }

    try {
      setLoading(true);
      await axios.delete(`/api/admin/mass-delete/${type}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSuccess(`Todos los ${type} han sido eliminados`);
      fetchData();
    } catch (error) {
      setError(`Error al eliminar ${type} masivamente`);
    } finally {
      setLoading(false);
    }
  };

  const renderUsersTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">👥 Gestión de Usuarios</h2>
        <button
          onClick={() => downloadData('users')}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
        >
          📥 Descargar CSV
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Creado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role || 'user'}
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
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 space-x-2">
                  <button
                    onClick={() => toggleUserStatus(user.id, user.isActive)}
                    className={`px-3 py-1 text-xs rounded ${
                      user.isActive 
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    {user.isActive ? '⏸️ Pausar' : '▶️ Activar'}
                  </button>
                  {user.email !== 'admin@admin.com' && (
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="px-3 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded"
                    >
                      🗑️ Borrar
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

  const renderDataTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">📊 Gestión de Datos</h2>
      
      {/* Descargas */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">📥 Descargar Datos</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['users', 'clients', 'leads', 'quotations'].map((type) => (
            <button
              key={type}
              onClick={() => downloadData(type)}
              className="p-4 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg text-center"
            >
              <div className="text-2xl mb-2">📄</div>
              <div className="text-sm font-medium">Descargar {type}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Eliminación Masiva */}
      <div className="bg-red-50 rounded-xl shadow-md p-6 border border-red-200">
        <h3 className="text-lg font-semibold mb-4 text-red-800">🗑️ Eliminación Masiva (PELIGROSO)</h3>
        <p className="text-sm text-red-600 mb-4">⚠️ Estas acciones eliminarán TODOS los datos del tipo seleccionado. No se pueden deshacer.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['clients', 'leads', 'quotations', 'followups'].map((type) => (
            <button
              key={type}
              onClick={() => massDelete(type)}
              className="p-4 bg-red-100 hover:bg-red-200 border border-red-300 rounded-lg text-center text-red-800"
            >
              <div className="text-2xl mb-2">☠️</div>
              <div className="text-sm font-medium">Eliminar todos los {type}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStatsTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">📈 Estadísticas del Sistema</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-500 text-white p-6 rounded-xl">
          <div className="text-3xl font-bold">{systemStats.totalUsers || 0}</div>
          <div className="text-blue-100">Total Usuarios</div>
        </div>
        <div className="bg-green-500 text-white p-6 rounded-xl">
          <div className="text-3xl font-bold">{systemStats.activeUsers || 0}</div>
          <div className="text-green-100">Usuarios Activos</div>
        </div>
        <div className="bg-purple-500 text-white p-6 rounded-xl">
          <div className="text-3xl font-bold">{systemStats.totalRoles || 0}</div>
          <div className="text-purple-100">Roles Configurados</div>
        </div>
      </div>

      {/* Estadísticas por Rol */}
      {systemStats.usersByRole && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">👥 Usuarios por Rol</h3>
          <div className="space-y-2">
            {Object.entries(systemStats.usersByRole).map(([role, count]) => (
              <div key={role} className="flex justify-between items-center">
                <span className="font-medium">{role}</span>
                <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">🛠️ Panel Administrativo</h1>
          <p className="text-gray-600 mt-2">Control total del sistema CRM</p>
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
              { id: 'users', label: '👥 Usuarios', icon: '👥' },
              { id: 'data', label: '📊 Datos', icon: '📊' },
              { id: 'stats', label: '📈 Estadísticas', icon: '📈' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-medium ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Contenido */}
        <div className="bg-gray-50 rounded-xl p-6">
          {loading && (
            <div className="text-center py-12">
              <div className="text-lg text-gray-600">Cargando...</div>
            </div>
          )}

          {!loading && activeTab === 'users' && renderUsersTab()}
          {!loading && activeTab === 'data' && renderDataTab()}
          {!loading && activeTab === 'stats' && renderStatsTab()}
        </div>
      </div>
    </div>
  );
}
