import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { API_URL } from "../config/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      });

      const { token, user } = response.data;

      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        navigate("/dashboard");
      } else {
        setError("Credenciales inválidas");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResetMessage("");

    try {
      await axios.post(`${API_URL}/api/auth/forgot-password`, {
        email: resetEmail,
      });
      setResetMessage(
        "Se ha enviado un enlace de recuperación a tu correo electrónico",
      );
      setShowForgotPassword(false);
      setResetEmail("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Error al enviar el correo de recuperación",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Iniciar Sesión
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
              >
                👁️
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => setShowForgotPassword(!showForgotPassword)}
            className="text-sm text-blue-600 hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        {showForgotPassword && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Recuperar Contraseña</h3>
            <form onSubmit={handleForgotPassword}>
              <input
                type="email"
                placeholder="Ingresa tu correo electrónico"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Enviando..." : "Enviar"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetEmail("");
                    setError("");
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {resetMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mt-4">
            {resetMessage}
          </div>
        )}

        <p className="text-sm text-center mt-6 text-gray-600">
          ¿No tienes cuenta?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
