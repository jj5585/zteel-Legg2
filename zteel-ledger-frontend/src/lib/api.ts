import axios from "axios"

// Use the environment variable if it exists, otherwise use localhost
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8001"

const api = axios.create({
  baseURL: baseURL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api