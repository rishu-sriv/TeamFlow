import axios from 'axios'
import { mockAdapter } from './mock/adapter.js'

const MOCK_MODE = import.meta.env.VITE_MOCK_MODE === 'true'

const api = axios.create({
  baseURL: MOCK_MODE
    ? '/api/v1'
    : (import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/v1` : '/api/v1'),
  headers: { 'Content-Type': 'application/json' },
  ...(MOCK_MODE ? { adapter: mockAdapter } : { withCredentials: true }),
})

// Attach token to every request
api.interceptors.request.use(
  (config) => {
    const stored = localStorage.getItem('teamflow-auth')
    if (stored) {
      try {
        const { state } = JSON.parse(stored)
        if (state?.token) {
          config.headers.Authorization = `Bearer ${state.token}`
        }
      } catch {
        // ignore parse error
      }
    }
    return config
  },
  (err) => Promise.reject(err)
)

// Handle 401 globally (skip in mock mode — tokens are always valid)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (!MOCK_MODE && err.response?.status === 401) {
      localStorage.removeItem('teamflow-auth')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
