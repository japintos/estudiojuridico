import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para agregar token a las peticiones
api.interceptors.request.use((config) => {
  // No agregar token a rutas públicas como /login
  if (config.url?.includes('/auth/login')) {
    return config
  }

  const token = localStorage.getItem('auth-storage')
  if (token) {
    try {
      const parsed = JSON.parse(token)
      // Buscar token en diferentes estructuras posibles
      const tokenValue = parsed?.state?.token || parsed?.token
      if (tokenValue) {
        config.headers.Authorization = `Bearer ${tokenValue}`
      }
      // No mostrar warning si es una ruta pública o si simplemente no hay token aún
    } catch (error) {
      // Solo mostrar error si realmente hay un problema de parsing
      if (process.env.NODE_ENV === 'development') {
        console.error('Error parsing auth storage:', error)
      }
    }
  }
  return config
})

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token expirado, inválido o sin permisos
      localStorage.removeItem('auth-storage')
      // Solo redirigir si no estamos ya en login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api

