import axios from 'axios';

// Configuración base de axios
// Usa variable de entorno o fallback a Render
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://proyecto-avanzada-p1.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // El servidor respondió con un código de error
      console.error('Error de API:', error.response.data);
    } else if (error.request) {
      // La petición fue hecha pero no hubo respuesta
      console.error('No hay respuesta del servidor');
    } else {
      // Algo pasó al configurar la petición
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
