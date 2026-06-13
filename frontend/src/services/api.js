import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

// Inyectar token automáticamente en cada petición
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json'
  }
  return config
})

// Si el token expiró, redirigir al login
api.interceptors.response.use(
  res => res,
  err => {
    // Solo cerrar sesión si es 401 y NO es login
    if (err.response?.status === 401 && !err.config.url.includes('/auth/login')) {
      console.warn('Sesión expirada')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api