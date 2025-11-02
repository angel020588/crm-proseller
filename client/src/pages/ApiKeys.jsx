import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

export default function ApiKeys() {
  const [keys, setKeys] = useState([]);
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const token = localStorage.getItem("token");

  const fetchKeys = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/apikeys", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setKeys(res.data);
    } catch (err) {
      setError("Error al cargar API Keys");
      console.error("Error fetching API keys:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const createKey = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/apikeys/create",
        { description },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Mostrar la API Key generada en un modal o alert mejorado
      const newKey = res.data.key;
      setDescription("");
      setShowCreateForm(false);
      fetchKeys();

      // Crear un modal personalizado para mostrar la API Key
      showApiKeyModal(newKey, description);

    } catch (err) {
      setError("Error al crear API Key");
      console.error("Error creating API key:", err);
    }
  };

  const showApiKeyModal = (apiKey, desc) => {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50';
    modal.innerHTML = `
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-bold text-gray-900 mb-4">¡API Key Creada!</h3>
          <div class="mb-4">
            <p class="text-sm text-gray-600 mb-2">Descripción: ${desc}</p>
            <p class="text-sm text-gray-600 mb-2">Guarda esta API Key en un lugar seguro. No podrás verla nuevamente.</p>
            <div class="bg-gray-100 p-3 rounded border">
              <code class="text-sm break-all select-all">${apiKey}</code>
            </div>
          </div>
          <div class="flex justify-end space-x-2">
            <button onclick="navigator.clipboard.writeText('${apiKey}'); this.innerText='¡Copiado!'" 
                    class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
              Copiar
            </button>
            <button onclick="this.closest('.fixed').remove()" 
                    class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  };

  const deactivateKey = async (key) => {
    if (!window.confirm("¿Desactivar esta API Key?")) return;
    try {
      await axios.post(
        "http://localhost:5000/api/apikeys/deactivate",
        { key },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchKeys();
    } catch (err) {
      setError("Error al desactivar API Key");
      console.error("Error deactivating API key:", err);
    }
  };

  const activateKey = async (key) => {
    try {
      await axios.post(
        "http://localhost:5000/api/apikeys/activate",
        { key },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchKeys();
    } catch (err) {
      setError("Error al activar API Key");
      console.error("Error activating API key:", err);
    }
  };

  const deleteKey = async (id) => {
    if (!window.confirm("¿Eliminar permanentemente esta API Key? Esta acción no se puede deshacer.")) return;
    try {
      await axios.delete(`http://localhost:5000/api/apikeys/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchKeys();
    } catch (err) {
      setError("Error al eliminar API Key");
      console.error("Error deleting API key:", err);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("API Key copiada al portapapeles");
    });
  };

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Cargando...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de API Keys</h1>
          <p className="text-gray-600 mt-1">Administra las claves de API para acceder a tu CRM programáticamente</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
        >
          Nueva API Key
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Formulario para crear API Key */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Crear Nueva API Key</h3>
            <form onSubmit={createKey}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                <input
                  type="text"
                  placeholder="Ej: Integración con mi app móvil"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                >
                  Crear API Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de API Keys */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {keys.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7 6h-2m-3-6V9a3 3 0 116 0v1M9 12l2 2 4-4m5 2a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay API Keys</h3>
              <p className="mt-1 text-sm text-gray-500">Crea tu primera API Key para comenzar a integrar con tu CRM.</p>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {keys.map((k) => (
              <li key={k.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        k.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {k.active ? '🟢 Activa' : '🔴 Inactiva'}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mt-2">
                      {k.description || "Sin descripción"}
                    </p>
                    <div className="mt-2 flex items-center space-x-2">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono break-all">
                        {k.key}
                      </code>
                      <button
                        onClick={() => copyToClipboard(k.key)}
                        className="text-blue-600 hover:text-blue-800 text-xs"
                        title="Copiar API Key"
                      >
                        📋 Copiar
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Creada: {new Date(k.createdAt).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    {k.active ? (
                      <button
                        onClick={() => deactivateKey(k.key)}
                        className="text-red-600 hover:text-red-900 text-sm"
                      >
                        Desactivar
                      </button>
                    ) : (
                      <button
                        onClick={() => activateKey(k.key)}
                        className="text-green-600 hover:text-green-900 text-sm"
                      >
                        Activar
                      </button>
                    )}
                    <button
                      onClick={() => deleteKey(k.id)}
                      className="text-red-600 hover:text-red-900 text-sm"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Información sobre el uso de API Keys */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4">
        <h3 className="text-sm font-medium text-blue-900">💡 Cómo usar tus API Keys</h3>
        <div className="mt-2 text-sm text-blue-700">
          <p>Incluye tu API Key en las peticiones HTTP usando uno de estos métodos:</p>
          <ul className="mt-2 list-disc list-inside space-y-1">
            <li><strong>Header:</strong> <code className="bg-blue-100 px-1 rounded">X-API-Key: tu_api_key_aqui</code></li>
            <li><strong>Query param:</strong> <code className="bg-blue-100 px-1 rounded">?api_key=tu_api_key_aqui</code></li>
          </ul>
          <p className="mt-2">
            <strong>Endpoint base:</strong> <code className="bg-blue-100 px-1 rounded">http://localhost:5000/api/</code>
          </p>
        </div>
      </div>
    </div>
  );
}