import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

// Reemplaza por tu dominio de backend si estás en producción
const API_URL =
  process.env.REACT_APP_API_URL || window.location.origin;

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    roleName: "usuario",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(null);
  const navigate = useNavigate();

  const evaluatePasswordStrength = (password) => {
    let score = 0;
    let feedback = [];

    if (password.length >= 8) score++;
    else feedback.push("Mínimo 8 caracteres");
    if (/[a-z]/.test(password)) score++;
    else feedback.push("Incluye minúsculas");
    if (/[A-Z]/.test(password)) score++;
    else feedback.push("Incluye mayúsculas");
    if (/[0-9]/.test(password)) score++;
    else feedback.push("Incluye números");
    if (/[^A-Za-z0-9]/.test(password)) score++;
    else feedback.push("Incluye símbolos");

    const strength =
      score <= 2
        ? "débil"
        : score <= 3
          ? "media"
          : score <= 4
            ? "fuerte"
            : "muy fuerte";
    const color =
      score <= 2
        ? "red"
        : score <= 3
          ? "yellow"
          : score <= 4
            ? "blue"
            : "green";

    return { score, strength, feedback, color };
  };

  useEffect(() => {
    if (formData.password) {
      setPasswordStrength(evaluatePasswordStrength(formData.password));
    } else {
      setPasswordStrength(null);
    }
  }, [formData.password]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    if (!passwordStrength || passwordStrength.score < 3) {
      setError("La contraseña debe ser más fuerte");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/api/auth/register`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        roleName: formData.roleName,
      });

      const { token, user } = res.data;

      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        navigate("/dashboard");
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.code === "NETWORK_ERROR" || !err.response) {
        setError("Error de conexión. Verifica tu internet.");
      } else {
        setError("Error al registrar. Intenta nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Mapa de colores para Tailwind (porque clases dinámicas no aplican directamente)
  const tailwindColorMap = {
    red: "bg-red-500 text-red-600",
    yellow: "bg-yellow-500 text-yellow-600",
    blue: "bg-blue-500 text-blue-600",
    green: "bg-green-500 text-green-600",
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Crear Cuenta
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister}>
          {/* Nombre */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Nombre completo
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Tu nombre completo"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Correo electrónico
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Contraseña */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Tu contraseña"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
              >
                👁️
              </button>
            </div>

            {passwordStrength && (
              <div className="mt-2">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${tailwindColorMap[passwordStrength.color]}`}
                      style={{
                        width: `${(passwordStrength.score / 5) * 100}%`,
                      }}
                    />
                  </div>
                  <span
                    className={`text-xs font-medium ${tailwindColorMap[passwordStrength.color]}`}
                  >
                    {passwordStrength.strength}
                  </span>
                </div>
                {passwordStrength.feedback.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Mejoras: {passwordStrength.feedback.join(", ")}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Confirmar contraseña */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Confirmar contraseña
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repite tu contraseña"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
              >
                👁️
              </button>
            </div>
          </div>

          {/* Tipo de cuenta */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">
              Tipo de cuenta
            </label>
            <select
              name="roleName"
              value={formData.roleName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="usuario">👤 Usuario</option>
              <option value="editor">✏️ Editor</option>
              <option value="supervisor">👨‍💼 Supervisor</option>
              <option value="admin">👑 Administrador</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Creando cuenta..." : "Crear Cuenta"}
          </button>
        </form>

        <p className="text-sm text-center mt-4 text-gray-600">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
