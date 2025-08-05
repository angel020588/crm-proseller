
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    clients: [],
    leads: [],
    quotations: [],
    followups: [],
    stats: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      // Fetch all data in parallel
      const [
        statsRes,
        clientsRes,
        leadsRes,
        quotationsRes,
        followupsRes,
        userRes
      ] = await Promise.all([
        axios.get('/api/dashboard/stats', { headers }),
        axios.get('/api/clients', { headers }).catch(() => ({ data: [] })),
        axios.get('/api/leads', { headers }).catch(() => ({ data: [] })),
        axios.get('/api/quotations', { headers }).catch(() => ({ data: [] })),
        axios.get('/api/followups', { headers }).catch(() => ({ data: [] })),
        axios.get('/api/auth/verify', { headers }).catch(() => ({ data: { user: {} } }))
      ]);

      setDashboardData({
        clients: clientsRes.data.slice(0, 5) || [],
        leads: leadsRes.data.slice(0, 5) || [],
        quotations: quotationsRes.data.slice(0, 5) || [],
        followups: followupsRes.data.slice(0, 5) || [],
        stats: statsRes.data || {}
      });
      
      setUser(userRes.data.user || {});
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Error al cargar los datos del dashboard');
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">CRM ProSeller</h1>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform transition-transform">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Menú</h2>
              <p className="text-sm text-gray-600">{user?.name}</p>
            </div>
            <nav className="p-4 space-y-2">
              <Link to="/dashboard" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
                📊 Dashboard
              </Link>
              <Link to="/clients" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
                👥 Clientes
              </Link>
              <Link to="/leads" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
                🎯 Leads
              </Link>
              <Link to="/quotations" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
                📋 Cotizaciones
              </Link>
              <Link to="/followups" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
                📞 Seguimientos
              </Link>
              <Link to="/perfil" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
                👤 Perfil
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 rounded-md text-red-600 hover:bg-red-50"
              >
                🚪 Cerrar Sesión
              </button>
            </nav>
          </div>
        </div>
      )}

      <div className="lg:flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <div className="w-64 bg-white shadow-sm border-r">
            <div className="p-6 border-b">
              <h1 className="text-xl font-bold text-gray-900">CRM ProSeller</h1>
              <p className="text-sm text-gray-600 mt-1">{user?.name}</p>
            </div>
            <nav className="p-4 space-y-1">
              <Link to="/dashboard" className="flex items-center px-3 py-2 rounded-md text-gray-900 bg-blue-50 border-r-2 border-blue-600">
                📊 Dashboard
              </Link>
              <Link to="/clients" className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
                👥 Clientes
              </Link>
              <Link to="/leads" className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
                🎯 Leads
              </Link>
              <Link to="/quotations" className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
                📋 Cotizaciones
              </Link>
              <Link to="/followups" className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
                📞 Seguimientos
              </Link>
              <Link to="/perfil" className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
                👤 Perfil
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-3 py-2 rounded-md text-red-600 hover:bg-red-50"
              >
                🚪 Cerrar Sesión
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-8">
          {error && (
            <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Welcome Section */}
          <div className="mb-6">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
              ¡Bienvenido, {user?.name}! 👋
            </h2>
            <p className="text-gray-600 mt-1">
              Aquí tienes un resumen de tu actividad comercial
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <span className="text-xl lg:text-2xl">👥</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Clientes</p>
                  <p className="text-xl lg:text-2xl font-bold text-gray-900">
                    {dashboardData.stats.totalClients || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <span className="text-xl lg:text-2xl">🎯</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Leads</p>
                  <p className="text-xl lg:text-2xl font-bold text-gray-900">
                    {dashboardData.stats.totalLeads || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <span className="text-xl lg:text-2xl">📋</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Cotizaciones</p>
                  <p className="text-xl lg:text-2xl font-bold text-gray-900">
                    {dashboardData.stats.totalQuotations || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <span className="text-xl lg:text-2xl">📞</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Seguimientos</p>
                  <p className="text-xl lg:text-2xl font-bold text-gray-900">
                    {dashboardData.stats.totalFollowups || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Link
              to="/clients"
              className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg text-center transition-colors"
            >
              <div className="text-2xl lg:text-3xl mb-2">👥</div>
              <div className="text-sm lg:text-base font-medium">Gestionar Clientes</div>
            </Link>

            <Link
              to="/leads"
              className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg text-center transition-colors"
            >
              <div className="text-2xl lg:text-3xl mb-2">🎯</div>
              <div className="text-sm lg:text-base font-medium">Nuevos Leads</div>
            </Link>

            <Link
              to="/quotations"
              className="bg-yellow-600 hover:bg-yellow-700 text-white p-4 rounded-lg text-center transition-colors"
            >
              <div className="text-2xl lg:text-3xl mb-2">📋</div>
              <div className="text-sm lg:text-base font-medium">Crear Cotización</div>
            </Link>

            <Link
              to="/followups"
              className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg text-center transition-colors"
            >
              <div className="text-2xl lg:text-3xl mb-2">📞</div>
              <div className="text-sm lg:text-base font-medium">Seguimientos</div>
            </Link>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Clients */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 lg:p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Últimos Clientes</h3>
              </div>
              <div className="p-4 lg:p-6">
                {dashboardData.clients.length > 0 ? (
                  <div className="space-y-3">
                    {dashboardData.clients.map((client) => (
                      <div key={client.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 text-sm lg:text-base">{client.name}</p>
                          <p className="text-xs lg:text-sm text-gray-600">{client.email}</p>
                        </div>
                        <Link
                          to={`/clients/${client.id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Ver →
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No hay clientes recientes</p>
                )}
              </div>
            </div>

            {/* Recent Followups */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 lg:p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Próximos Seguimientos</h3>
              </div>
              <div className="p-4 lg:p-6">
                {dashboardData.followups.length > 0 ? (
                  <div className="space-y-3">
                    {dashboardData.followups.map((followup) => (
                      <div key={followup.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 text-sm lg:text-base">{followup.subject}</p>
                          <p className="text-xs lg:text-sm text-gray-600">
                            {new Date(followup.scheduledDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Link
                          to={`/followups/${followup.id}`}
                          className="text-purple-600 hover:text-purple-800 text-sm"
                        >
                          Ver →
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No hay seguimientos pendientes</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
