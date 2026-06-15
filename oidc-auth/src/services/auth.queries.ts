import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './api'
import { tokenStore } from './tokenStore'
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  UserProfile,
} from './types'

// ─── Profile ───
export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async (): Promise<UserProfile> => {
      const { data } = await api.get('/api/auth/profile')
      return data.data.user
    },
    enabled: !!tokenStore.getAccess(),
    retry: false,
    staleTime: 30_000,
  })
}

// ─── Register ───
export function useRegister() {
  return useMutation({
    mutationFn: async ({
      clientId,
      ...body
    }: RegisterRequest): Promise<RegisterResponse> => {
      const url = clientId
        ? `/api/auth/register?client_id=${encodeURIComponent(clientId)}`
        : '/api/auth/register'
      const { data } = await api.post(url, body)
      if (data.data?.accessToken) {
        tokenStore.set({
          accessToken: data.data.accessToken,
          refreshToken: data.data.refreshToken || '',
          id: data.data.id || '',
        })
      }
      return data.data
    },
  })
}

// ─── Login ───
export function useLogin() {
  return useMutation({
    mutationFn: async ({
      clientId,
      ...body
    }: LoginRequest): Promise<LoginResponse> => {
      const url = clientId
        ? `/api/auth/login?client_id=${encodeURIComponent(clientId)}`
        : '/api/auth/login'
      const { data } = await api.post(url, body)
      if (data.data?.accessToken) {
        tokenStore.set({
          accessToken: data.data.accessToken,
          refreshToken: data.data.refreshToken || '',
          id: data.data.id || '',
        })
      }
      return data.data
    },
  })
}

// ─── Logout ───
export function useLogout() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      try {
        await api.post('/api/auth/logout')
      } catch {
        /* server-side errors shouldn't block local logout */
      }
      tokenStore.clear()
      qc.clear()
    },
  })
}

// ─── Email verification ───
export function useRequestVerifyEmail() {
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.get('/api/auth/verify-email-request')
      return data.data
    },
  })
}

export function useVerifyEmail() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (token: string) => {
      const { data } = await api.post('/api/auth/verify', { token })
      // Backend now re-issues tokens after verify so the JWT carries
      // email_verified: true. Persist them so the client picks up immediately.
      if (data.data?.accessToken) {
        tokenStore.set({
          accessToken: data.data.accessToken,
          refreshToken: data.data.refreshToken || '',
          id: data.data.id || tokenStore.getUser() || '',
        })
      }
      return data.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}

// ─── Password ───
export function useForgotPassword() {
  return useMutation({
    mutationFn: async (email: string) => {
      const { data } = await api.post('/api/auth/forgot-password', { email })
      return data.data
    },
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async ({
      token,
      password,
    }: {
      token: string
      password: string
    }) => {
      const { data } = await api.post(
        `/api/auth/reset-password?token=${token}`,
        { password },
      )
      return data.data
    },
  })
}

// ─── Avatar ───
export function useUploadAvatar() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData()
      form.append('avatar', file)
      const { data } = await api.post('/api/auth/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile'] }),
  })
}
