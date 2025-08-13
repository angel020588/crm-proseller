import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function Subscription() {
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  const fetchSubscription = useCallback(async () => {
    try {
      const res = await axios.get("/api/subscription", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlan(res.data);
    } catch (err) {
      setError("Error al cargar la suscripción");
    }
  }, [token]);

  const handleSubscribe = async (priceId) => {
    try {
      const res = await axios.post(
        "/api/stripe/create-checkout-session",
        { priceId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      window.location.href = res.data.url;
    } catch (err) {
      setError("Error al iniciar suscripción");
    }
  };

  useEffect(() => { 
    fetchSubscription(); 
  }, [fetchSubscription]);

  return (
    <div className="p-6 min-h-screen bg-gradient-to-r from-gray-50 to-blue-100 text-gray-900">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight">💼 Planes y Suscripciones</h1>
        <Link
          to="/"
          className="text-blue-600 hover:underline font-medium text-sm"
        >
          Volver al Panel Principal
        </Link>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="grid md:grid-cols-4 gap-6">
        {[{
          name: "Gratis",
          price: "$0 MXN",
          features: ["150 mensajes IA", "1 video de 15s"],
          id: "price_gratis"
        }, {
          name: "Starter",
          price: "$14.50 USD",
          features: ["1,500 mensajes IA", "3 videos Pro"],
          id: "price_starter"
        }, {
          name: "Professional",
          price: "$34.50 USD",
          features: ["7,500 mensajes IA", "5 videos Pro"],
          id: "price_professional"
        }, {
          name: "Enterprise",
          price: "$60 USD",
          features: ["Mensajes ilimitados", "15 videos Pro"],
          id: "price_enterprise"
        }].map((p) => (
          <div key={p.id} className="bg-white border border-blue-300 rounded-xl shadow p-6">
            <h2 className="text-xl font-bold text-blue-800 mb-2">{p.name}</h2>
            <p className="text-lg font-semibold text-gray-800 mb-3">{p.price}</p>
            <ul className="text-sm text-gray-700 mb-4 space-y-1">
              {p.features.map((f, idx) => <li key={idx}>✅ {f}</li>)}
            </ul>
            <button
              onClick={() => handleSubscribe(p.id)}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2 px-4 rounded-lg"
            >
              Suscribirme
            </button>
          </div>
        ))}
      </div>

      <div className="mt-10 p-6 bg-white rounded-xl shadow border border-blue-200">
        <h2 className="text-lg font-semibold mb-2">🧠 Tu suscripción actual:</h2>
        {plan ? (
          <p className="text-blue-800 font-medium">{plan.name} — {plan.status}</p>
        ) : (
          <p className="text-gray-600">No tienes una suscripción activa.</p>
        )}
        <a
          href="https://billing.stripe.com/p/login"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block text-sm text-blue-600 hover:underline"
        >
          Gestionar mi suscripción
        </a>
      </div>
    </div>
  );
}