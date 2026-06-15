const ACCESS_KEY = 'accessToken'
const REFRESH_KEY = 'refreshToken'
const USER_KEY = 'user'

type ToKenType = {
  accessToken: string
  refreshToken: string
  id: string
}

// SSR-safe localStorage access
const ls = () => (typeof window === 'undefined' ? null : window.localStorage)

// Decode a JWT payload without verifying the signature. Returns null on
// any error — caller treats null as "not logged in".
function decodeJwt(token: string): { exp?: number } | null {
  try {
    const segment = token.split('.')[1]
    if (!segment) return null
    const padded = segment.padEnd(segment.length + ((4 - (segment.length % 4)) % 4), '=')
    const base64 = padded.replace(/-/g, '+').replace(/_/g, '/')
    const json = typeof atob === 'function' ? atob(base64) : ''
    return JSON.parse(json)
  } catch {
    return null
  }
}

export const tokenStore = {
  getAccess: () => ls()?.getItem(ACCESS_KEY) ?? null,
  getRefresh: () => ls()?.getItem(REFRESH_KEY) ?? null,
  getUser: () => ls()?.getItem(USER_KEY) ?? null,

  set: ({ accessToken, refreshToken, id }: ToKenType) => {
    const store = ls()
    if (!store) return
    if (accessToken) store.setItem(ACCESS_KEY, accessToken)
    if (refreshToken) store.setItem(REFRESH_KEY, refreshToken)
    if (id) store.setItem(USER_KEY, id)
  },

  clear: () => {
    const store = ls()
    if (!store) return
    store.removeItem(ACCESS_KEY)
    store.removeItem(REFRESH_KEY)
    store.removeItem(USER_KEY)
  },

  /**
   * Best-effort client-side check: is there a non-expired access token?
   * Server still authoritatively validates every request — this is just
   * a UX signal to swap nav buttons. 30s skew tolerance.
   */
  isLoggedIn: (): boolean => {
    const token = ls()?.getItem(ACCESS_KEY)
    if (!token) return false
    const payload = decodeJwt(token)
    if (!payload?.exp) return true // no exp claim → assume valid until server says otherwise
    return payload.exp * 1000 > Date.now() - 30_000
  },
}
