import axios from 'axios'

const apiUrl = import.meta.env.VITE_API_URL

if (!apiUrl) {
  throw new Error('VITE_API_URL is not configured')
}

const api = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
  timeout: 5000
})

export default api