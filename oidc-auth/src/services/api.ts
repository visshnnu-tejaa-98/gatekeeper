import axios from 'axios'
import { tokenStore } from './tokenStore'

const BASE_URL = import.meta.env.BASE_URL || 'http://localhost:9000/api'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = tokenStore.getAccess()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
