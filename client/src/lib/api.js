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

let csrfTokenPromise = null

async function getCsrfToken() {
  if (!csrfTokenPromise) {
    csrfTokenPromise = api.get('/auth/csrf-token').then(({ data }) => data.csrfToken).finally(() => { csrfTokenPromise = null })
  }

  return csrfTokenPromise
}

api.interceptors.request.use(
  async config => {
    const method = config.method?.toUpperCase()

    const safeMethods = ['GET', 'HEAD', 'OPTIONS']

    if (!method || safeMethods.includes(method)) {
      return config
    }

    const csrfToken = await getCsrfToken()

    config.headers['X-CSRF-Token'] = csrfToken

    return config
  }
)

export default api