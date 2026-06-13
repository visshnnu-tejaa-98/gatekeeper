// ─── Auth ───
export type Role = 'user' | 'admin' | 'super_admin'

export interface UserProfile {
  id: string
  name: string
  email: string
  role: Role
  isEmailVerified?: boolean
  avatar?: string | null
}

export interface LoginRequest {
  email: string
  password: string
  clientId?: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  clientId?: string
}

export interface AuthSuccess {
  id: string
  accessToken: string
  refreshToken?: string
}

export interface ConsentTokenResponse {
  consentToken: string
  applicationName: string
  scopes: string[]
}

export type LoginResponse = AuthSuccess | ConsentTokenResponse
export type RegisterResponse = AuthSuccess | ConsentTokenResponse

// ─── Applications (OIDC clients) ───
export interface Application {
  id: string
  name: string
  url: string
  redirectUri: string
  clientId: string
}

export interface ApplicationDetail extends Application {
  createdAt: string
  updatedAt: string
}

export interface ApplicationWithSecret {
  id: string
  applicationDisplayName?: string
  applicationURL?: string
  redirectURI?: string
  clientId: string
  clientSecret: string
}

// ─── Users ───
export interface UserRecord {
  id: string
  name: string
  email: string
  role: Role
  avatar: string | null
  isVerified: boolean
  createdAt: string
  updatedAt: string
}

// ─── OIDC ───
export interface IntrospectResult {
  active: boolean
  sub?: string
  email?: string
  name?: string
  picture?: string
  role?: string
  iss?: string
  exp?: number
  iat?: number
  jti?: string
}
