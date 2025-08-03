
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function RolesPermisos() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('users');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('user'); // 'user', 'role'
  const [editingItem, setEditingItem] = useState(null);
  
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    roleId: '',
    active: true
  });

  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    permissions: []
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, rolesRes, permissionsRes] = await Promise.all([
        axios.get('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/roles', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/admin/permissions', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setUsers(usersRes.data);
      setRoles(rolesRes.data);
      setPermissions(permissionsRes.data);
    } catch (err) {
      setError('Error al cargar datos de roles y permisos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await axios.put(`/api/admin/users/${editingItem.id}`, userForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('/api/admin/users', userForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      resetForm();
      fetchData();
    } catch (err) {
      setError('Error al guardar usuario');
    }
  };

  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await axios.put(`/api/roles/${editingItem.id}`, roleForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('/api/roles', roleForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      resetForm();
      fetchData();
    } catch (err) {
      setError('Error al guardar rol');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('¿Eliminar este usuario?')) return;
    try {
      await axios.delete(`/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      setError('Error al eliminar usuario');
    }
  };

  const deleteRole = async (roleId) => {
    if (!window.confirm('¿Eliminar este rol?')) return;
    try {
      await axios.delete(`/api/roles/${roleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      setError('Error al eliminar rol');
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await axios.put(`/api/admin/users/${userId}/status`, 
        { active: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchData();
    } catch (err) {
      setError('Error al cambiar estado del usuario');
    }
  };

  const openUserModal = (user = null) => {
    if (user) {
      setUserForm({
        name: user.name,
        email: user.email,
        roleId: user.roleId,
        active: user.active
      });
      setEditingItem(user);
    }
    setModalType('user');
    setShowModal(true);
  };

  const openRoleModal = (role = null) => {
    if (role) {
      setRoleForm({
        name: role.name,
        description: role.description,
        permissions: role.permissions || []
      });
      setEditingItem(role);
    }
    setModalType('role');
    setShowModal(true);
  };

  const resetForm = () => {
    setUserForm({ name: '', email: '', roleId: '', active: true });
    setRoleForm({ name: '', description: '', permissions: [] });
    setEditingItem(null);
    setShowModal(false);
  };

  const togglePermission = (permissionId) => {
    const currentPermissions = roleForm.permissions;
    const newPermissions = currentPermissions.includes(permissionId)
      ? currentPermissions.filter(p => p !== permissionId)
      : [...currentPermissions, permissionId];
    
    setRoleForm({ ...roleForm, permissions: newPermissions });
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Cargando...</div>;
  }

  return (
    <div className="p-6 min-h-screen bg-gradient-to-r from-slate-50 to-indigo-100 text-gray-900">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight">🔐 Roles y Permisos</h1>
        <Link
          to="/"
          className="text-indigo-600 hover:underline font-medium text-sm"
        >
          Volver al Panel Principal
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'users'
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          👥 Usuarios ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'roles'
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          🎭 Roles ({roles.length})
        </button>
        <button
          onClick={() => setActiveTab('permissions')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'permissions'
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          🔑 Permisos ({permissions.length})
        </button>
      </div>

      {/* Tab: Usuarios */}
      {activeTab === 'users' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Gestión de Usuarios</h2>
            <button
              onClick={() => openUserModal()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              ➕ Nuevo Usuario
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Último acceso</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800">
                        {user.Role?.name || 'Sin rol'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleUserStatus(user.id, user.active)}
                        className={`px-2 py-1 text-xs rounded-full ${
                          user.active 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {user.active ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('es-ES') : 'Nunca'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => openUserModal(user)}
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        🗑️ Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Roles */}
      {activeTab === 'roles' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Gestión de Roles</h2>
            <button
              onClick={() => openRoleModal()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              ➕ Nuevo Rol
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role) => (
              <div key={role.id} className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{role.name}</h3>
                    <p className="text-sm text-gray-600">{role.description}</p>
                  </div>
                  <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                    {role.Users?.length || 0} usuarios
                  </span>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Permisos:</h4>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions?.map((permissionId) => {
                      const permission = permissions.find(p => p.id === permissionId);
                      return (
                        <span key={permissionId} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          {permission?.name || permissionId}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => openRoleModal(role)}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => deleteRole(role.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Permisos */}
      {activeTab === 'permissions' && (
        <div>
          <h2 className="text-xl font-bold mb-4">Lista de Permisos del Sistema</h2>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {permissions.map((permission) => (
                <div key={permission.id} className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-semibold text-gray-900">{permission.name}</h3>
                  <p className="text-sm text-gray-600">{permission.description}</p>
                  <span className="text-xs text-gray-500">ID: {permission.code}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              {modalType === 'user' 
                ? (editingItem ? '✏️ Editar Usuario' : '➕ Nuevo Usuario')
                : (editingItem ? '✏️ Editar Rol' : '➕ Nuevo Rol')
              }
            </h2>
            
            {modalType === 'user' ? (
              <form onSubmit={handleUserSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Nombre completo"
                  value={userForm.name}
                  onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                  required
                  className="w-full border border-gray-300 p-3 rounded-lg"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                  required
                  className="w-full border border-gray-300 p-3 rounded-lg"
                />
                <select
                  value={userForm.roleId}
                  onChange={(e) => setUserForm({...userForm, roleId: e.target.value})}
                  required
                  className="w-full border border-gray-300 p-3 rounded-lg"
                >
                  <option value="">Seleccionar rol</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={userForm.active}
                    onChange={(e) => setUserForm({...userForm, active: e.target.checked})}
                    className="h-4 w-4 text-indigo-600"
                  />
                  <span>Usuario activo</span>
                </label>
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    {editingItem ? 'Actualizar' : 'Crear'} Usuario
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRoleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Nombre del rol"
                  value={roleForm.name}
                  onChange={(e) => setRoleForm({...roleForm, name: e.target.value})}
                  required
                  className="w-full border border-gray-300 p-3 rounded-lg"
                />
                <textarea
                  placeholder="Descripción del rol"
                  value={roleForm.description}
                  onChange={(e) => setRoleForm({...roleForm, description: e.target.value})}
                  rows="3"
                  className="w-full border border-gray-300 p-3 rounded-lg"
                />
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Permisos:</h3>
                  <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                    {permissions.map((permission) => (
                      <label key={permission.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={roleForm.permissions.includes(permission.id)}
                          onChange={() => togglePermission(permission.id)}
                          className="h-4 w-4 text-indigo-600"
                        />
                        <span className="text-sm">{permission.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    {editingItem ? 'Actualizar' : 'Crear'} Rol
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
