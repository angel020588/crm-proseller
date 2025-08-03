
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('todas');
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    followupReminders: true,
    leadAlerts: true,
    quotationUpdates: true,
    systemAlerts: true
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchNotifications();
    fetchSettings();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data);
    } catch (err) {
      setError('Error al cargar notificaciones');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await axios.get('/api/notifications/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSettings(res.data);
    } catch (err) {
      console.error('Error al cargar configuración:', err);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`/api/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(notifications.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      ));
    } catch (err) {
      setError('Error al marcar notificación como leída');
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put('/api/notifications/read-all', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(notifications.map(notif => ({ ...notif, read: true })));
    } catch (err) {
      setError('Error al marcar todas como leídas');
    }
  };

  const deleteNotification = async (notificationId) => {
    if (!window.confirm('¿Eliminar esta notificación?')) return;
    try {
      await axios.delete(`/api/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(notifications.filter(notif => notif.id !== notificationId));
    } catch (err) {
      setError('Error al eliminar notificación');
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      await axios.put('/api/notifications/settings', newSettings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSettings(newSettings);
    } catch (err) {
      setError('Error al actualizar configuración');
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      followup: '📞',
      lead: '🎯',
      quotation: '💼',
      client: '👥',
      system: '⚙️',
      reminder: '⏰',
      alert: '🚨'
    };
    return icons[type] || '📢';
  };

  const getNotificationColor = (type, priority) => {
    if (priority === 'high') return 'border-l-red-500 bg-red-50';
    if (priority === 'medium') return 'border-l-yellow-500 bg-yellow-50';
    
    const colors = {
      followup: 'border-l-blue-500 bg-blue-50',
      lead: 'border-l-purple-500 bg-purple-50',
      quotation: 'border-l-green-500 bg-green-50',
      client: 'border-l-indigo-500 bg-indigo-50',
      system: 'border-l-gray-500 bg-gray-50'
    };
    return colors[type] || 'border-l-gray-500 bg-gray-50';
  };

  const filteredNotifications = filter === 'todas' 
    ? notifications 
    : filter === 'no_leidas' 
    ? notifications.filter(n => !n.read)
    : notifications.filter(n => n.type === filter);

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return <div className="flex justify-center items-center h-64">Cargando notificaciones...</div>;
  }

  return (
    <div className="p-6 min-h-screen bg-gradient-to-r from-slate-50 to-blue-100 text-gray-900">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">🔔 Notificaciones</h1>
          <p className="text-gray-600 mt-1">
            {unreadCount > 0 ? `${unreadCount} notificaciones sin leer` : 'Todas las notificaciones están al día'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            ⚙️ Configurar
          </button>
          <Link
            to="/"
            className="text-blue-600 hover:underline font-medium text-sm"
          >
            Volver al Panel Principal
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Panel de Configuración */}
      {showSettings && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-blue-200">
          <h2 className="text-xl font-bold mb-4">⚙️ Configuración de Notificaciones</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(settings).map(([key, value]) => (
              <label key={key} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => {
                    const newSettings = { ...settings, [key]: e.target.checked };
                    setSettings(newSettings);
                    updateSettings(newSettings);
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  {key === 'emailNotifications' && 'Notificaciones por email'}
                  {key === 'followupReminders' && 'Recordatorios de seguimiento'}
                  {key === 'leadAlerts' && 'Alertas de nuevos leads'}
                  {key === 'quotationUpdates' && 'Actualizaciones de cotizaciones'}
                  {key === 'systemAlerts' && 'Alertas del sistema'}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Filtros y Acciones */}
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        <div className="flex items-center space-x-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-blue-300 p-2 rounded-lg bg-white"
          >
            <option value="todas">Todas</option>
            <option value="no_leidas">No leídas</option>
            <option value="followup">Seguimientos</option>
            <option value="lead">Leads</option>
            <option value="quotation">Cotizaciones</option>
            <option value="client">Clientes</option>
            <option value="system">Sistema</option>
          </select>
          <span className="text-sm text-gray-600">
            {filteredNotifications.length} notificaciones
          </span>
        </div>
        
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            ✓ Marcar todas como leídas
          </button>
        )}
      </div>

      {/* Lista de Notificaciones */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📭</div>
            <p className="text-gray-600">No hay notificaciones para mostrar</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border-l-4 transition-all hover:shadow-md ${
                getNotificationColor(notification.type, notification.priority)
              } ${!notification.read ? 'shadow-md' : 'opacity-75'}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className={`font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                          Nuevo
                        </span>
                      )}
                      {notification.priority === 'high' && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          Urgente
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>
                        {new Date(notification.createdAt).toLocaleString('es-ES')}
                      </span>
                      {notification.relatedEntity && (
                        <span className="bg-gray-200 px-2 py-1 rounded">
                          {notification.relatedEntity}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      title="Marcar como leída"
                    >
                      ✓
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Estadísticas rápidas */}
      <div className="mt-8 bg-white rounded-xl shadow-md p-6 border border-blue-200">
        <h2 className="text-xl font-bold mb-4">📊 Resumen de Notificaciones</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{unreadCount}</div>
            <div className="text-sm text-gray-600">Sin leer</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {notifications.filter(n => n.read).length}
            </div>
            <div className="text-sm text-gray-600">Leídas</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {notifications.filter(n => n.priority === 'high').length}
            </div>
            <div className="text-sm text-gray-600">Urgentes</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {notifications.filter(n => n.type === 'followup').length}
            </div>
            <div className="text-sm text-gray-600">Seguimientos</div>
          </div>
        </div>
      </div>
    </div>
  );
}
