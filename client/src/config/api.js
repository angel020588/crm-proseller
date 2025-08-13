
// Configuración de la API
const getApiUrl = () => {
  // En desarrollo, usa variables de entorno
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // En producción, usa la misma URL del frontend
  return window.location.origin;
};

export const API_URL = getApiUrl();

const apiConfig = {
  API_URL
};

export default apiConfig;
