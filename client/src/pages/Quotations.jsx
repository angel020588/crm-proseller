import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Quotations() {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/quotations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuotations(response.data);
    } catch (error) {
      console.error('Error fetching quotations:', error);
      setError('Error al cargar las cotizaciones');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Cargando cotizaciones...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <>
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">💼 Cotizaciones</h1>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg">
          + Nueva Cotización
        </button>
      </div>

      {quotations.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500 text-lg">No hay cotizaciones disponibles</div>
          <p className="text-gray-400 mt-2">Crea tu primera cotización para comenzar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {quotations.map((quotation) => (
            <div key={quotation.id} className="bg-white p-6 rounded-xl shadow-md border border-purple-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-purple-900">
                    Cotización #{quotation.id}
                  </h3>
                  <p className="text-sm text-gray-600">{quotation.clientName}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  quotation.status === 'enviada' ? 'bg-blue-100 text-blue-800' :
                  quotation.status === 'aceptada' ? 'bg-green-100 text-green-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {quotation.status}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm">💰 Total: €{quotation.total}</p>
                <p className="text-sm">📅 Fecha: {new Date(quotation.createdAt).toLocaleDateString()}</p>
              </div>

              <div className="flex space-x-2">
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm">
                  Ver
                </button>
                <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm">
                  Editar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}