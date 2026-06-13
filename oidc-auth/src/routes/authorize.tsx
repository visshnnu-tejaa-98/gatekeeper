import * as React from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { AuthLayout } from '@/components/shell/AuthLayout'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Card, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Mail, User, ShieldCheck, X, CheckCircle2, Globe } from 'lucide-react'
import { toast } from 'sonner'
import { useConsent } from '@/services/oidc.queries'
import { useProfile } from '@/services/auth.queries'
import { getErrorMessage } from '@/services/api'
import { tokenStore } from '@/services/tokenStore'

export const Route = createFileRoute('/authorize')({ component: AuthorizePage })

interface ScopeDef {
  id: string
  label: string
  description: string
  icon: typeof Mail
}

const SCOPES: ScopeDef[] = [
  { id: 'openid', label: 'Verify your identity', description: 'Your user ID will be shared', icon: ShieldCheck },
  { id: 'email', label: 'Read your email address', description: 'Including verification status', icon: Mail },
  { id: 'profile', label: 'Read profile info', description: 'Name, avatar, role', icon: User },
]

function AuthorizePage() {
  const navigate = useNavigate()
  const consent = useConsent()
  const { data: user } = useProfile()

  const search = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams()
  const clientId = search.get('client_id') || ''
  const codeChallange = search.get('code_challange') || ''
  const algorithm = search.get('algorithm') || 'SHA-256'
  const appName = search.get('app_name') || decodeURIComponent(clientId)
  const consentToken = typeof window !== 'undefined' ? sessionStorage.getItem('consent_token') || '' : ''

  React.useEffect(() => {
    if (!consentToken) navigate({ to: '/login' })
  }, [consentToken, navigate])

  const handleAllow = async () => {
    if (!consentToken || !clientId) {
      toast.error('Missing consent token or client ID')
      return
    }
    try {
      const body: any = { consent_token: consentToken, client_id: clientId }
      if (codeChallange) {
        body.code_challange = codeChallange
        body.algorithm = algorithm
      }
      const data = await consent.mutateAsync(body)
      sessionStorage.removeItem('consent_token')
      if (data.redirectUriWithShortcode) {
        window.location.href = data.redirectUriWithShortcode
      }
    } catch (e) {
      toast.error(getErrorMessage(e))
    }
  }

  const handleDeny = () => {
    sessionStorage.removeItem('consent_token')
    tokenStore.clear()
    navigate({ to: '/login' })
  }

  return (
    <AuthLayout>
      <div className="anim-up text-center mb-6">
        <div className="inline-flex items-center justify-center size-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-violet-500/25 mb-4">
          <Globe className="size-5 text-violet-300" />
        </div>
        <h1 className="text-[18px] font-semibold tracking-tight text-white mb-1.5">
          <span className="text-violet-300">{appName || 'An application'}</span> wants to access your account
        </h1>
        <p className="text-[13px] text-white/45">
          Make sure you trust this application before granting access.
        </p>
      </div>

      {/* Signed in as */}
      {user && (
        <div className="anim-up-1 mb-4">
          <Card inset className="p-3">
            <CardBody className="p-0 flex items-center gap-3">
              <Avatar src={user.avatar} name={user.name} size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-[12.5px] font-medium text-white truncate">{user.name}</p>
                <p className="text-[11px] text-white/45 truncate">{user.email}</p>
              </div>
              <Badge tone={user.role === 'super_admin' ? 'purple' : user.role === 'admin' ? 'blue' : 'green'}>
                {user.role}
              </Badge>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Scopes */}
      <div className="anim-up-2 mb-5">
        <p className="text-[11px] uppercase tracking-wider text-white/35 font-semibold mb-2 px-1">
          Requested permissions
        </p>
        <div className="flex flex-col gap-1.5">
          {SCOPES.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-md bg-white/[0.02] border border-white/8"
            >
              <div className="size-7 rounded-md bg-gradient-to-br from-violet-500/15 to-blue-500/15 border border-violet-500/15 flex items-center justify-center shrink-0">
                <s.icon className="size-3.5 text-violet-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-white">{s.label}</p>
                <p className="text-[11.5px] text-white/45">{s.description}</p>
              </div>
              <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="anim-up-3 flex flex-col gap-2">
        <Button variant="primary" block size="lg" onClick={handleAllow} loading={consent.isPending}>
          Allow access
        </Button>
        <Button variant="ghost" block size="lg" onClick={handleDeny} className="gap-1">
          <X className="size-4" /> Cancel
        </Button>
      </div>

      <p className="anim-up-4 text-[11px] text-center text-white/30 mt-5 leading-relaxed">
        You can revoke access at any time from your dashboard. iLogin never shares your password
        with applications.
      </p>
    </AuthLayout>
  )
}
