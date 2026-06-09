import type { LoginUserType, RegisterUserType } from '#/types'
import { api } from './api'
import { tokenStore } from './tokenStore'

export const authService = {
  async register({ name, email, password }: RegisterUserType) {
    const { data } = await api.post('/api/auth/register', {
      name,
      email,
      password,
    })
    tokenStore.set(data.data)
    return data
  },
  async login({ email, password }: LoginUserType) {
    const { data } = await api.post('/api/auth/login', { email, password })

    tokenStore.set(data.data)
    return data
  },
  async profile() {
    const { data } = await api.get('/api/auth/profile')
    return data.data.user
  },

  async registerClient({
    redirectUri,
    applicationDisplayName,
    applicationUrl,
  }: {
    redirectUri: string
    applicationDisplayName: string
    applicationUrl: string
  }) {
    const { data } = await api.post('/o/register-client', {
      redirectUri,
      applicationDisplayName,
      applicationUrl,
    })
    console.log('from: authService', {
      redirectUri,
      applicationDisplayName,
      applicationUrl,
    })
    return data
  },
}
