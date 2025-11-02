
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingClient, setEditingClient] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/clients", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClients(res.data);
      setError("");
    } catch (err) {
      setError("Error al cargar clientes");
    } finally {
      setLoading(false);
    }
  }, [token]);

  const createClient = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "/api/clients",
        { name, email, phone, address },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setName(""); 
      setEmail(""); 
      setPhone(""); 
      setAddress("");
      setError("");
      fetchClients();
    } catch (err) {
      setError("Error al crear cliente");
    }
  };

  const updateClient = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `/api/clients/${editingClient.id}`,
        { name, email, phone, address },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingClient(null);
      setName(""); 
      setEmail(""); 
      setPhone(""); 
      setAddress("");
      setError("");
      fetchClients();
    } catch (err) {
      setError("Error al actualizar cliente");
    }
  };

  const deleteClient = async (id) => {
    if (!window.confirm("¿Eliminar este cliente?")) return;
    try {
      await axios.delete(`/api/clients/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setError("");
      fetchClients();
    } catch (err) {
      setError("Error al eliminar cliente");
    }
  };

  const startEditing = (client) => {
    setEditingClient(client);
    setName(client.name);
    setEmail(client.email);
    setPhone(client.phone);
    setAddress(client.address);
  };

  const cancelEditing = () => {
    setEditingClient(null);
    setName("");
    setEmail("");
    setPhone("");
    setAddress("");
  };

  useEffect(() => { 
    fetchClients(); 
  }, [fetchClients]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando clientes...</p>
        </div>
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
                <div className="border-blue-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Clientes
                </div>
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
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/subscription")}
                className="text-gray-500 hover:text-gray-700"
              >
                Suscripción
              </button>
              <button
                onClick={() => navigate("/perfil")}
                className="text-gray-500 hover:text-gray-700"
              >
                Perfil
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  navigate("/login");
                }}
                className="bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Clientes</h1>
          <p className="mt-2 text-gray-600">Administra tu base de clientes</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {editingClient ? "Editar Cliente" : "Agregar Nuevo Cliente"}
          </h2>
          <form onSubmit={editingClient ? updateClient : createClient}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input 
                  type="text" 
                  placeholder="Nombre completo" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correo Electrónico
                </label>
                <input 
                  type="email" 
                  placeholder="correo@ejemplo.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input 
                  type="text" 
                  placeholder="+1 234 567 8900" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección
                </label>
                <input 
                  type="text" 
                  placeholder="Dirección completa" 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                />
              </div>
            </div>
            <div className="mt-6 flex space-x-3">
              <button 
                type="submit" 
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {editingClient ? "Actualizar Cliente" : "Agregar Cliente"}
              </button>
              {editingClient && (
                <button 
                  type="button"
                  onClick={cancelEditing}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 font-medium focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Clients List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Lista de Clientes ({clients.length})
            </h2>
          </div>
          {clients.length === 0 ? (
            <div className="p-6 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay clientes</h3>
              <p className="mt-1 text-sm text-gray-500">Comienza agregando tu primer cliente.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {clients.map((client) => (
                <li key={client.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">{client.name}</h3>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => startEditing(client)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Editar
                          </button>
                          <button 
                            onClick={() => deleteClient(client.id)} 
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                            </svg>
                            {client.email || "Sin correo"}
                          </p>
                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                            </svg>
                            {client.phone || "Sin teléfono"}
                          </p>
                        </div>
                        {client.address && (
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            {client.address}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
