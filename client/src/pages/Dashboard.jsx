import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [data, setData] = useState({
    stats: {},
    recentClients: [],
    recentQuotations: [],
    recentLeads: [],
    recentFollowups: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeframe, setTimeframe] = useState('month');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, [timeframe]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Verificar que tenemos token
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('❌ No hay token disponible');
        navigate('/login');
        return;
      }

      console.log('🔑 Usando token:', token.substring(0, 20) + '...');

      const [
        statsRes,
        clientsRes,
        quotationsRes,
        leadsRes,
        followupsRes
      ] = await Promise.all([
        axios.get(`/api/stats/dashboard?timeframe=${timeframe}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }),
        axios.get('/api/clients?limit=5', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }),
        axios.get('/api/quotations?limit=5', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }),
        axios.get('/api/leads?limit=5', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }),
        axios.get('/api/followups?limit=5', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })
      ]);

      setData({
        stats: statsRes.data,
        recentClients: clientsRes.data,
        recentQuotations: quotationsRes.data,
        recentLeads: leadsRes.data,
        recentFollowups: followupsRes.data
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error.response?.status === 401) {
        console.error('❌ Token inválido, redirigiendo al login');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        setError('Error al cargar los datos del dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const getConversionRate = () => {
    const totalLeads = data.stats.leads?.total || 0;
    const convertedLeads = data.stats.leads?.converted || 0;
    return totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : 0;
  };

  const getQuotationSuccessRate = () => {
    const totalQuotations = data.stats.quotations?.total || 0;
    const approvedQuotations = data.stats.quotations?.approved || 0;
    return totalQuotations > 0 ? ((approvedQuotations / totalQuotations) * 100).toFixed(1) : 0;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Cargando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-100">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">📊 Dashboard Analytics</h1>
          <p className="text-gray-600 mt-2">Panel de control y métricas avanzadas</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="border border-blue-300 p-2 rounded-lg bg-white shadow-sm"
          >
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
            <option value="quarter">Este trimestre</option>
            <option value="year">Este año</option>
          </select>
          <Link
            to="/resumen"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-md transition-colors"
          >
            📋 Ver Resumen Completo
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{data.stats.clients?.total || 0}</div>
              <div className="text-blue-100">Total Clientes</div>
              {data.stats.clients?.new && (
                <div className="text-sm text-blue-200">+{data.stats.clients.new} nuevos</div>
              )}
            </div>
            <div className="text-4xl opacity-80">👥</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{data.stats.leads?.total || 0}</div>
              <div className="text-purple-100">Total Leads</div>
              <div className="text-sm text-purple-200">{getConversionRate()}% conversión</div>
            </div>
            <div className="text-4xl opacity-80">🎯</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{data.stats.quotations?.total || 0}</div>
              <div className="text-green-100">Cotizaciones</div>
              <div className="text-sm text-green-200">{getQuotationSuccessRate()}% aprobadas</div>
            </div>
            <div className="text-4xl opacity-80">💼</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">
                {formatCurrency(data.stats.revenue?.total || 0)}
              </div>
              <div className="text-yellow-100">Ingresos</div>
              {data.stats.revenue?.growth && (
                <div className="text-sm text-yellow-200">
                  {data.stats.revenue.growth > 0 ? '+' : ''}{data.stats.revenue.growth}%
                </div>
              )}
            </div>
            <div className="text-4xl opacity-80">💰</div>
          </div>
        </div>
      </div>

      {/* Métricas Secundarias */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Rendimiento de Leads</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Nuevos:</span>
              <span className="font-semibold">{data.stats.leads?.new || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Contactados:</span>
              <span className="font-semibold">{data.stats.leads?.contacted || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Convertidos:</span>
              <span className="font-semibold text-green-600">{data.stats.leads?.converted || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">💼 Estado Cotizaciones</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Pendientes:</span>
              <span className="font-semibold text-yellow-600">{data.stats.quotations?.pending || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Enviadas:</span>
              <span className="font-semibold text-blue-600">{data.stats.quotations?.sent || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Aprobadas:</span>
              <span className="font-semibold text-green-600">{data.stats.quotations?.approved || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📞 Seguimientos</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Pendientes:</span>
              <span className="font-semibold text-red-600">{data.stats.followups?.pending || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Hoy:</span>
              <span className="font-semibold text-orange-600">{data.stats.followups?.today || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Esta semana:</span>
              <span className="font-semibold">{data.stats.followups?.thisWeek || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actividad Reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Clientes Recientes */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">👥 Clientes Recientes</h2>
            <Link to="/clients" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Ver todos →
            </Link>
          </div>
          <div className="space-y-3">
            {data.recentClients.slice(0, 5).map((client) => (
              <div key={client.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{client.name}</div>
                  <div className="text-sm text-gray-600">{client.email}</div>
                </div>
                <div className="text-xs text-gray-500">
                  {formatDate(client.createdAt)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leads Recientes */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">🎯 Leads Recientes</h2>
            <Link to="/leads" className="text-purple-600 hover:text-purple-800 text-sm font-medium">
              Ver todos →
            </Link>
          </div>
          <div className="space-y-3">
            {data.recentLeads.slice(0, 5).map((lead) => (
              <div key={lead.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{lead.name}</div>
                  <div className="text-sm text-gray-600">{lead.company || lead.email}</div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    lead.status === 'convertido' ? 'bg-green-100 text-green-800' :
                    lead.status === 'calificado' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {lead.status}
                  </span>
                  <div className="text-xs text-gray-500">
                    {formatDate(lead.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Accesos Rápidos */}
      <div className="mt-8 bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">🚀 Acciones Rápidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/leads')}
            className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition-colors border border-purple-200"
          >
            <div className="text-2xl mb-2">🎯</div>
            <div className="text-sm font-medium text-purple-900">Nuevo Lead</div>
          </button>
          <button
            onClick={() => navigate('/clients')}
            className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition-colors border border-blue-200"
          >
            <div className="text-2xl mb-2">👥</div>
            <div className="text-sm font-medium text-blue-900">Nuevo Cliente</div>
          </button>
          <button
            onClick={() => navigate('/quotations')}
            className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-center transition-colors border border-green-200"
          >
            <div className="text-2xl mb-2">💼</div>
            <div className="text-sm font-medium text-green-900">Nueva Cotización</div>
          </button>
          <button
            onClick={() => navigate('/followups')}
            className="p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg text-center transition-colors border border-yellow-200"
          >
            <div className="text-2xl mb-2">📞</div>
            <div className="text-sm font-medium text-yellow-900">Seguimiento</div>
          </button>
        </div>
      </div>
    </div>
  );
}