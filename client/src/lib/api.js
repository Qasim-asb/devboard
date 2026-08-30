import axios from 'axios'

const apiUrl = import.meta.env.VITE_API_URL

if (!apiUrl) {
  throw new Error('VITE_API_URL is not configured')
}

const api = axios.create({
  baseURL: apiUrl,
  timeout: 5000
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('devboard-token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export default api