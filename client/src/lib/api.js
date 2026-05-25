import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api/v1`
    : '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    try {
      const stored = localStorage.getItem('teamflow-auth')
      if (stored) {
        const { state } = JSON.parse(stored)
        if (state?.token) config.headers.Authorization = `Bearer ${state.token}`
      }
    } catch { /* ignore */ }
    return config
  },
  (err) => Promise.reject(err)
)

// Handle 401 globally — clear session and redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('teamflow-auth')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
