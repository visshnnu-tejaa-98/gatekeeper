import axios, { type AxiosError } from 'axios'
import { tokenStore } from './tokenStore'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = tokenStore.getAccess()
  if (token && config.headers) config.headers.Authorization = `Bearer ${token}`
  return config
})

let isRefreshing = false
let refreshQueue: Array<(token: string | null) => void> = []

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as any
    if (
      error.response?.status === 401 &&
      !original?._retry &&
      !original?.url?.includes('/auth/refresh') &&
      !original?.url?.includes('/auth/login') &&
      tokenStore.getRefresh()
    ) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshQueue.push((token) => {
            if (token) {
              original.headers.Authorization = `Bearer ${token}`
              resolve(api(original))
            } else resolve(Promise.reject(error))
          })
        })
      }
      original._retry = true
      isRefreshing = true
      try {
        const refreshToken = tokenStore.getRefresh()
        const { data } = await axios.post(`${BASE_URL}/api/auth/refresh`, { refreshToken })
        const { accessToken, refreshToken: newRefresh } = data.data
        tokenStore.set({
          accessToken,
          refreshToken: newRefresh,
          id: tokenStore.getUser() || '',
        })
        refreshQueue.forEach((cb) => cb(accessToken))
        refreshQueue = []
        original.headers.Authorization = `Bearer ${accessToken}`
        return api(original)
      } catch (e) {
        refreshQueue.forEach((cb) => cb(null))
        refreshQueue = []
        tokenStore.clear()
        if (typeof window !== 'undefined') window.location.href = '/login'
        return Promise.reject(e)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  },
)

export type ApiError = {
  message: string
  details?: { code: string; error: string }
}

export function getErrorMessage(e: unknown): string {
  const err = e as AxiosError<ApiError>
  return err?.response?.data?.message || err?.message || 'Something went wrong'
}
