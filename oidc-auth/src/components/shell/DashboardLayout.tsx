import * as React from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { tokenStore } from '@/services/tokenStore'
import { useProfile } from '@/services/auth.queries'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const { isError, isLoading } = useProfile()

  React.useEffect(() => {
    if (!tokenStore.getAccess()) {
      navigate({ to: '/login' })
    }
  }, [navigate])

  React.useEffect(() => {
    if (isError) {
      tokenStore.clear()
      navigate({ to: '/login' })
    }
  }, [isError, navigate])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="anim-spin size-5 text-violet-400">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity=".3" strokeWidth="3" />
            <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-[#08080c]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-6 py-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
