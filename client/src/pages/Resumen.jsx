import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Resumen() {
  const [data, setData] = useState({
    clients: [],
    quotations: [],
    leads: [],
    followups: [],
    stats: {},
    user: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [
        clientsRes,
        quotationsRes,
        leadsRes,
        followupsRes,
        statsRes,
        userRes
      ] = await Promise.all([
        axios.get('http://localhost:5000/api/clients', { headers }),
        axios.get('http://localhost:5000/api/quotations', { headers }),
        axios.get('http://localhost:5000/api/leads', { headers }),
        axios.get('http://localhost:5000/api/followups', { headers }),
        axios.get('http://localhost:5000/api/stats/summary', { headers }),
        axios.get('http://localhost:5000/api/users/profile', { headers })
      ]);

      setData({
        clients: clientsRes.data,
        quotations: quotationsRes.data,
        leads: leadsRes.data,
        followups: followupsRes.data,
        stats: statsRes.data,
        user: userRes.data
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Error al cargar los datos del resumen');
    } finally {
      setLoading(false);
    }
  };

  const downloadCompletePDF = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/resumen/pdf', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `resumen-crm-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      setError('Error al descargar el PDF del resumen');
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Cargando resumen completo...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">CRM ProSeller</h1>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => navigate("/leads")}
                  className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Leads
                </button>
                <button
                  onClick={() => navigate("/clients")}
                  className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Clientes
                </button>
                <button
                  onClick={() => navigate("/quotations")}
                  className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Cotizaciones
                </button>
                <button
                  onClick={() => navigate("/followups")}
                  className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Seguimientos
                </button>
                <button
                  onClick={() => navigate("/apikeys")}
                  className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  API Keys
                </button>
                <button
                  onClick={() => navigate("/resumen")}
                  className="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Resumen
                </button>
                <button
                  onClick={() => navigate("/perfil")}
                  className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Mi Perfil
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {data.user?.name} ({data.user?.roleDisplayName})
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="p-6 bg-gray-100 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">📋 Resumen Completo del CRM</h1>
              <button
                onClick={downloadCompletePDF}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md font-medium shadow-sm transition-colors flex items-center gap-2"
              >
                📄 Descargar PDF Completo
              </button>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {/* Información del Usuario */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">👤 Información del Usuario</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-gray-600">Nombre:</span>
                  <p className="font-medium">{data.user.name || 'No especificado'}</p>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>
                  <p className="font-medium">{data.user.email || 'No especificado'}</p>
                </div>
                <div>
                  <span className="text-gray-600">Fecha de registro:</span>
                  <p className="font-medium">{data.user.createdAt ? formatDate(data.user.createdAt) : 'No disponible'}</p>
                </div>
              </div>
            </div>

            {/* Estadísticas Generales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-blue-500 text-white p-6 rounded-lg shadow-sm">
                <div className="text-3xl font-bold">{data.clients.length}</div>
                <div className="text-blue-100">Total Clientes</div>
              </div>
              <div className="bg-purple-500 text-white p-6 rounded-lg shadow-sm">
                <div className="text-3xl font-bold">{data.quotations.length}</div>
                <div className="text-purple-100">Total Cotizaciones</div>
              </div>
              <div className="bg-green-500 text-white p-6 rounded-lg shadow-sm">
                <div className="text-3xl font-bold">{data.leads.length}</div>
                <div className="text-green-100">Total Leads</div>
              </div>
              <div className="bg-yellow-500 text-white p-6 rounded-lg shadow-sm">
                <div className="text-3xl font-bold">{data.followups.length}</div>
                <div className="text-yellow-100">Seguimientos</div>
              </div>
            </div>

            {/* Resumen de Cotizaciones */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">💰 Resumen de Cotizaciones</h2>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                {['pendiente', 'enviada', 'aprobada', 'rechazada', 'cancelada'].map(status => {
                  const count = data.quotations.filter(q => q.status === status).length;
                  return (
                    <div key={status} className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-2xl font-bold">{count}</div>
                      <div className="text-sm text-gray-600 capitalize">{status}</div>
                    </div>
                  );
                })}
              </div>
              <div className="border-t pt-4">
                <div className="text-2xl font-bold text-green-600">
                  Valor Total: {formatCurrency(
                    data.quotations.reduce((sum, q) => sum + parseFloat(q.total || 0), 0)
                  )}
                </div>
              </div>
            </div>

            {/* Lista de Clientes Recientes */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">👥 Clientes Recientes</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Nombre</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Email</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Empresa</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data.clients.slice(0, 5).map((client) => (
                      <tr key={client.id}>
                        <td className="px-4 py-2 text-sm text-gray-900">{client.name}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{client.email || 'N/A'}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{client.company || 'N/A'}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{formatDate(client.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Lista de Cotizaciones Recientes */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">💼 Cotizaciones Recientes</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Título</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Cliente</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Estado</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Total</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data.quotations.slice(0, 5).map((quotation) => (
                      <tr key={quotation.id}>
                        <td className="px-4 py-2 text-sm text-gray-900">{quotation.title}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{quotation.Client?.name || 'N/A'}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            quotation.status === 'aprobada' ? 'bg-green-100 text-green-800' :
                            quotation.status === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                            quotation.status === 'enviada' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {quotation.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900">
                          {formatCurrency(quotation.total)}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-600">{formatDate(quotation.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Lista de Leads Recientes */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">🎯 Leads Recientes</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Nombre</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Email</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Estado</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Fuente</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data.leads.slice(0, 5).map((lead) => (
                      <tr key={lead.id}>
                        <td className="px-4 py-2 text-sm text-gray-900">{lead.name}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{lead.email || 'N/A'}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            lead.status === 'convertido' ? 'bg-green-100 text-green-800' :
                            lead.status === 'calificado' ? 'bg-blue-100 text-blue-800' :
                            lead.status === 'contactado' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-600">{lead.source || 'N/A'}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{formatDate(lead.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Seguimientos Recientes */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">📞 Seguimientos Recientes</h2>
              <div className="space-y-3">
                {data.followups.slice(0, 5).map((followup) => (
                  <div key={followup.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium text-gray-900">{followup.title}</div>
                      <div className="text-sm text-gray-600">{followup.description}</div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(followup.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navegación rápida */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">🔗 Navegación Rápida</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => navigate('/quotations')}
                  className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition-colors"
                >
                  <div className="text-2xl mb-2">💰</div>
                  <div className="text-sm font-medium">Nueva Cotización</div>
                </button>
                <button
                  onClick={() => navigate('/clients')}
                  className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition-colors"
                >
                  <div className="text-2xl mb-2">👥</div>
                  <div className="text-sm font-medium">Nuevo Cliente</div>
                </button>
                <button
                  onClick={() => navigate('/leads')}
                  className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-center transition-colors"
                >
                  <div className="text-2xl mb-2">🎯</div>
                  <div className="text-sm font-medium">Nuevo Lead</div>
                </button>
                <button
                  onClick={() => navigate('/followups')}
                  className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-center transition-colors"
                >
                  <div className="text-2xl mb-2">📞</div>
                  <div className="text-sm font-medium">Seguimiento</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}