
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    roleName: "usuario"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(null);
  const navigate = useNavigate();

  // Evaluar fuerza de contraseña en tiempo real
  const evaluatePasswordStrength = (password) => {
    let score = 0;
    let feedback = [];

    if (password.length >= 8) score += 1;
    else feedback.push("Mínimo 8 caracteres");

    if (/[a-z]/.test(password)) score += 1;
    else feedback.push("Incluye minúsculas");

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push("Incluye mayúsculas");

    if (/[0-9]/.test(password)) score += 1;
    else feedback.push("Incluye números");

    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    else feedback.push("Incluye símbolos");

    const strength = score <= 2 ? 'débil' : score <= 3 ? 'media' : score <= 4 ? 'fuerte' : 'muy fuerte';
    const color = score <= 2 ? 'red' : score <= 3 ? 'yellow' : score <= 4 ? 'blue' : 'green';
    
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validaciones
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
      const res = await axios.post("/api/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        roleName: formData.roleName
      });

      // Auto-login después del registro
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        axios.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("❌ Error en registro:", err);
      
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.status === 500) {
        setError("Error interno del servidor. Por favor, intenta de nuevo.");
      } else if (err.code === 'NETWORK_ERROR' || !err.response) {
        setError("Error de conexión. Verifica tu internet e intenta de nuevo.");
      } else {
        setError("Error al crear la cuenta. Por favor, intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
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
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Nombre completo
            </label>
            <input
              type="text"
              name="name"
              placeholder="Tu nombre completo"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Correo electrónico
            </label>
            <input
              type="email"
              name="email"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Mínimo 8 caracteres con mayúsculas, números y símbolos"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            
            {/* Indicador de fuerza de contraseña */}
            {passwordStrength && (
              <div className="mt-2">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 bg-${passwordStrength.color}-500`}
                      style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    ></div>
                  </div>
                  <span className={`text-sm font-medium text-${passwordStrength.color}-600`}>
                    {passwordStrength.strength}
                  </span>
                </div>
                {passwordStrength.feedback.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Mejoras: {passwordStrength.feedback.join(', ')}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Confirmar contraseña
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Repite tu contraseña"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Tipo de cuenta
            </label>
            <select
              name="roleName"
              value={formData.roleName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
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
