import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

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
  const [passwordStrength, setPasswordStrength] = useState(null);
  const navigate = useNavigate();

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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { name, email, password, confirmPassword, roleName } = formData;

    if (!name || !email || !password || !confirmPassword) {
      setError("Por favor completa todos los campos");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
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
        name,
        email,
        password,
        roleName,
      });

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        axios.defaults.headers.common["Authorization"] =
          `Bearer ${res.data.token}`;
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("❌ Error en registro:", err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.code === "ECONNABORTED" || !err.response) {
        setError("Error de red. Verifica tu conexión a internet.");
      } else {
        setError("Error al crear la cuenta. Intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = (color) => {
    switch (color) {
      case "red":
        return "bg-red-500 text-red-600";
      case "yellow":
        return "bg-yellow-500 text-yellow-600";
      case "blue":
        return "bg-blue-500 text-blue-600";
      case "green":
        return "bg-green-500 text-green-600";
      default:
        return "";
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
          {/* NOMBRE */}
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-1">
              Nombre completo
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Tu nombre completo"
              required
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* EMAIL */}
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="correo@ejemplo.com"
              required
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* CONTRASEÑA */}
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-1">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="********"
                required
                className="w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {passwordStrength && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(passwordStrength.color)}`}
                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                  />
                </div>
                <p
                  className={`text-xs mt-1 ${getStrengthColor(passwordStrength.color)}`}
                >
                  Fuerza: {passwordStrength.strength}. Mejoras:{" "}
                  {passwordStrength.feedback.join(", ")}
                </p>
              </div>
            )}
          </div>

          {/* CONFIRMAR CONTRASEÑA */}
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-1">
              Confirmar contraseña
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="********"
              required
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* ROLE */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-1">
              Tipo de cuenta
            </label>
            <select
              name="roleName"
              value={formData.roleName}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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