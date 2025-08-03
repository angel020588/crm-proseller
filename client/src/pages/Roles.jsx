
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Roles() {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('roles');
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    permissions: {
      dashboard: { read: false, write: false, delete: false },
      leads: { read: false, write: false, delete: false },
      clients: { read: false, write: false, delete: false },
      quotations: { read: false, write: false, delete: false },
      followups: { read: false, write: false, delete: false },
      users: { read: false, write: false, delete: false },
      settings: { read: false, write: false, delete: false },
      apikeys: { read: false, write: false, delete: false },
      admin: { read: false, write: false, delete: false }
    }
  });

  useEffect(() => {
    fetchRoles();
    fetchUsers();
  }, []);

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/roles', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoles(response.data);
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/roles', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchRoles();
      resetForm();
      alert('Rol creado exitosamente');
    } catch (error) {
      console.error('Error creating role:', error);
      alert('Error al crear rol');
    }
  };

  const assignRole = async (userId, roleId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/roles/assign', 
        { userId, roleId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers();
      alert('Rol asignado exitosamente');
    } catch (error) {
      console.error('Error assigning role:', error);
      alert('Error al asignar rol');
    }
  };

  const updatePermission = (module, action, value) => {
    setFormData({
      ...formData,
      permissions: {
        ...formData.permissions,
        [module]: {
          ...formData.permissions[module],
          [action]: value
        }
      }
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      displayName: '',
      description: '',
      permissions: {
        dashboard: { read: false, write: false, delete: false },
        leads: { read: false, write: false, delete: false },
        clients: { read: false, write: false, delete: false },
        quotations: { read: false, write: false, delete: false },
        followups: { read: false, write: false, delete: false },
        users: { read: false, write: false, delete: false },
        settings: { read: false, write: false, delete: false },
        apikeys: { read: false, write: false, delete: false },
        admin: { read: false, write: false, delete: false }
      }
    });
    setShowModal(false);
  };

  const getRoleColor = (roleName) => {
    const colors = {
      owner: 'bg-red-100 text-red-800',
      admin: 'bg-purple-100 text-purple-800',
      manager: 'bg-blue-100 text-blue-800',
      vendedor: 'bg-green-100 text-green-800',
      viewer: 'bg-gray-100 text-gray-800'
    };
    return colors[roleName] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Cargando roles...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 hover:text-gray-900 text-sm flex items-center gap-1"
              >
                ← Volver al Dashboard
              </button>
              <h1 className="text-2xl font-bold text-gray-900">👥 Gestión de Roles</h1>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Nuevo Rol Personalizado
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('roles')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'roles'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Roles del Sistema
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Asignación de Usuarios
              </button>
            </nav>
          </div>

          {/* Contenido de Tabs */}
          {activeTab === 'roles' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roles.map((role) => (
                <div key={role.id} className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{role.displayName}</h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(role.name)}`}>
                        {role.name}
                      </span>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      role.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {role.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{role.description}</p>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Permisos:</h4>
                    <div className="grid grid-cols-3 gap-1 text-xs">
                      {Object.entries(role.permissions || {}).map(([module, perms]) => (
                        <div key={module} className="bg-gray-50 p-2 rounded">
                          <div className="font-medium capitalize">{module}</div>
                          <div className="space-y-1">
                            {perms.read && <span className="block text-green-600">✓ Leer</span>}
                            {perms.write && <span className="block text-blue-600">✓ Escribir</span>}
                            {perms.delete && <span className="block text-red-600">✓ Eliminar</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rol Actual
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cambiar Rol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                          defaultValue=""
                          onChange={(e) => {
                            if (e.target.value) {
                              assignRole(user.id, e.target.value);
                              e.target.value = "";
                            }
                          }}
                        >
                          <option value="">Seleccionar rol</option>
                          {roles.map((role) => (
                            <option key={role.id} value={role.id}>
                              {role.displayName}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Ver Permisos
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Modal para crear rol */}
          {showModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-2/3 max-w-4xl shadow-lg rounded-md bg-white max-h-screen overflow-y-auto">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Crear Nuevo Rol
                </h3>
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del rol (sistema)</label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="ej: custom_role"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nombre para mostrar</label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={formData.displayName}
                        onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                        placeholder="ej: Rol Personalizado"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                    <textarea
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Describe las responsabilidades de este rol..."
                    />
                  </div>

                  {/* Matriz de Permisos */}
                  <div className="mb-6">
                    <h4 className="text-md font-semibold mb-4">Matriz de Permisos</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Módulo
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Leer
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Escribir
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Eliminar
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {Object.keys(formData.permissions).map((module) => (
                            <tr key={module}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                                {module}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                <input
                                  type="checkbox"
                                  checked={formData.permissions[module].read}
                                  onChange={(e) => updatePermission(module, 'read', e.target.checked)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                <input
                                  type="checkbox"
                                  checked={formData.permissions[module].write}
                                  onChange={(e) => updatePermission(module, 'write', e.target.checked)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                <input
                                  type="checkbox"
                                  checked={formData.permissions[module].delete}
                                  onChange={(e) => updatePermission(module, 'delete', e.target.checked)}
                                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                    >
                      Crear Rol
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
