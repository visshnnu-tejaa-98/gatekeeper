import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './api'
import type {
  Application,
  ApplicationDetail,
  ApplicationWithSecret,
  IntrospectResult,
} from './types'

// ─── Applications ───
export function useApplications() {
  return useQuery({
    queryKey: ['applications'],
    queryFn: async (): Promise<Application[]> => {
      const { data } = await api.get('/o/applications')
      return data.data || []
    },
    retry: false,
  })
}

export function useApplication(id: string | undefined) {
  return useQuery({
    queryKey: ['application', id],
    queryFn: async (): Promise<ApplicationDetail> => {
      const { data } = await api.get(`/o/application/${id}`)
      return data.data
    },
    enabled: !!id,
  })
}

export function useRegisterClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: {
      applicationDisplayName: string
      applicationUrl: string
      redirectUri: string
    }): Promise<ApplicationWithSecret> => {
      const { data } = await api.post('/o/register-client', body)
      return data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['applications'] }),
  })
}

export function useUpdateApplication() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      ...body
    }: {
      id: string
      name?: string
      redirectUri?: string
    }): Promise<Application> => {
      const { data } = await api.patch(`/o/applications/${id}`, body)
      return data.data
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['applications'] })
      qc.invalidateQueries({ queryKey: ['application', vars.id] })
    },
  })
}

export function useRotateSecret() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string): Promise<ApplicationWithSecret> => {
      const { data } = await api.post(`/o/rotate-secret/${id}`)
      return data.data
    },
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['application', id] })
    },
  })
}

export function useDeleteApplication() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/o/delete-client/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['applications'] }),
  })
}

// ─── OIDC Protocol ───
export function useConsent() {
  return useMutation({
    mutationFn: async (body: {
      consent_token: string
      client_id: string
      code_challange?: string
      algorithm?: string
    }) => {
      const { data } = await api.post('/o/consent', body)
      return data.data
    },
  })
}

export function useRevokeToken() {
  return useMutation({
    mutationFn: async (body: {
      token: string
      token_type_hint?: 'access_token' | 'refresh_token'
      client_id: string
      client_secret: string
    }) => {
      const { data } = await api.post('/o/revoke', body)
      return data.data
    },
  })
}

export function useIntrospectToken() {
  return useMutation({
    mutationFn: async (body: {
      token: string
      client_id: string
      client_secret: string
    }): Promise<IntrospectResult> => {
      const { data } = await api.post('/o/introspect', body)
      return data.data
    },
  })
}

export function useDiscovery() {
  return useQuery({
    queryKey: ['oidc-discovery'],
    queryFn: async () => {
      const { data } = await api.get('/.well-known/openid-configuration')
      return data
    },
    staleTime: Infinity,
  })
}

export function useJwks() {
  return useQuery({
    queryKey: ['oidc-jwks'],
    queryFn: async () => {
      const { data } = await api.get('/o/jwks.json')
      return data
    },
    staleTime: Infinity,
  })
}
