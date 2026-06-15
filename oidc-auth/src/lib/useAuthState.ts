import * as React from 'react'
import { tokenStore } from '@/services/tokenStore'

/**
 * Reactive hook that returns whether the user has a non-expired access token.
 * Listens for storage events so it updates if auth happens in another tab,
 * and re-checks periodically to catch local expiry.
 */
export function useAuthState() {
  const [loggedIn, setLoggedIn] = React.useState<boolean>(false)

  React.useEffect(() => {
    const sync = () => setLoggedIn(tokenStore.isLoggedIn())
    sync()
    window.addEventListener('storage', sync)
    window.addEventListener('focus', sync)
    const interval = window.setInterval(sync, 60_000)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('focus', sync)
      window.clearInterval(interval)
    }
  }, [])

  return loggedIn
}
