import { createFileRoute } from '@tanstack/react-router'
import { DashboardLayout } from '@/components/shell/DashboardLayout'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge, StatusDot } from '@/components/ui/Badge'
import { CodeReveal } from '@/components/ui/CopyButton'
import {
  Globe,
  Server,
  Database,
  ShieldCheck,
  ExternalLink,
  Github,
} from 'lucide-react'
import { useProfile, useLogout } from '@/services/auth.queries'
import { useDiscovery, useJwks } from '@/services/oidc.queries'
import { tokenStore } from '@/services/tokenStore'
import { toast } from 'sonner'

export const Route = createFileRoute('/dashboard/settings')({ component: SettingsPage })

function SettingsPage() {
  return (
    <DashboardLayout>
      <Inner />
    </DashboardLayout>
  )
}

function Inner() {
  const { data: user } = useProfile()
  const { data: discovery } = useDiscovery()
  const { data: jwks } = useJwks()
  const logout = useLogout()

  const handleLogout = async () => {
    await logout.mutateAsync()
    toast.success('Signed out')
    window.location.href = '/login'
  }

  return (
    <>
      <PageHeader title="Settings" description="Workspace configuration and OIDC endpoints" />

      <div className="grid lg:grid-cols-[minmax(0,1fr)_360px] gap-5 max-w-5xl">
        {/* Left col */}
        <div className="flex flex-col gap-5 min-w-0">
          {/* Workspace */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Workspace</CardTitle>
                <CardDescription>Your iLogin instance details</CardDescription>
              </div>
            </CardHeader>
            <CardBody className="space-y-3.5">
              <Row icon={Server} label="Account" value={user?.name || '—'} />
              <Row icon={Globe} label="Email" value={user?.email || '—'} />
              <Row
                icon={ShieldCheck}
                label="Role"
                value={
                  <Badge tone={user?.role === 'super_admin' ? 'purple' : user?.role === 'admin' ? 'blue' : 'green'}>
                    {user?.role}
                  </Badge>
                }
              />
              <Row
                icon={Database}
                label="Status"
                value={
                  <span className="flex items-center gap-1.5">
                    <StatusDot tone="green" />
                    <span className="text-[12.5px] text-emerald-300 font-medium">Operational</span>
                  </span>
                }
              />
            </CardBody>
          </Card>

          {/* OIDC endpoints */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>OIDC endpoints</CardTitle>
                <CardDescription>Use these in your OAuth2 client config</CardDescription>
              </div>
              <Badge tone="green" size="md">
                <StatusDot tone="green" /> Live
              </Badge>
            </CardHeader>
            <CardBody className="space-y-3">
              <Endpoint label="Issuer" url={discovery?.issuer} />
              <Endpoint label="Authorization" url={discovery?.authorization_endpoint} />
              <Endpoint label="Token" url={discovery?.token_endpoint} />
              <Endpoint label="UserInfo" url={discovery?.userinfo_endpoint} />
              <Endpoint label="JWKS" url={discovery?.jwks_uri} />
            </CardBody>
          </Card>

          {/* JWKS preview */}
          {jwks && (
            <Card className="overflow-hidden">
              <CardHeader>
                <div>
                  <CardTitle>Public signing keys</CardTitle>
                  <CardDescription>JSON Web Key Set used to verify tokens</CardDescription>
                </div>
                <Badge tone="purple" size="md">{jwks.keys?.length || 0} key{(jwks.keys?.length || 0) === 1 ? '' : 's'}</Badge>
              </CardHeader>
              <CardBody>
                <div className="min-w-0 max-w-full overflow-hidden">
                  <pre className="text-[11px] font-mono leading-relaxed bg-[#08080c] border border-white/8 rounded-md p-3 text-white/60 overflow-auto max-h-48 max-w-full whitespace-pre [overflow-wrap:anywhere] break-all">
{JSON.stringify(jwks, null, 2)}
                  </pre>
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Right col */}
        <div className="flex flex-col gap-5">
          {/* Quick links */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Resources</CardTitle>
                <CardDescription>Docs and source code</CardDescription>
              </div>
            </CardHeader>
            <CardBody className="space-y-2">
              <ResourceLink icon={Github} label="GitHub" sub="Source code" href="https://github.com" />
              <ResourceLink icon={Globe} label="Docs" sub="API reference" href="/docs" />
              <ResourceLink icon={ShieldCheck} label="Security" sub="Disclosure policy" href="mailto:security@ilogin.dev" />
            </CardBody>
          </Card>

          {/* Session */}
          <Card className="border-red-500/15">
            <CardHeader>
              <div>
                <CardTitle className="text-red-300">Session</CardTitle>
                <CardDescription>End your current session</CardDescription>
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-[12.5px] text-white/55 leading-relaxed mb-4">
                Signing out revokes your access token and clears the refresh token from storage.
              </p>
              <Button variant="danger" block className="gap-1.5" onClick={handleLogout} loading={logout.isPending}>
                Sign out everywhere
              </Button>
            </CardBody>
          </Card>

          {/* Token preview */}
          {tokenStore.getAccess() && (
            <Card>
              <CardHeader>
                <div>
                  <CardTitle className="text-[13.5px]">Active token</CardTitle>
                  <CardDescription>Your current access token (truncated)</CardDescription>
                </div>
              </CardHeader>
              <CardBody>
                <CodeReveal value={tokenStore.getAccess()!.slice(0, 60) + '…'} mono={false} />
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}

function Row({ icon: Icon, label, value }: { icon: any; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-[12.5px] text-white/55">
        <Icon className="size-3.5 text-white/40" /> {label}
      </div>
      <div className="text-[13px] text-white font-medium">{value}</div>
    </div>
  )
}

function Endpoint({ label, url }: { label: string; url?: string }) {
  return (
    <div>
      <p className="text-[10.5px] uppercase tracking-wider font-semibold text-white/35 mb-1.5">{label}</p>
      <CodeReveal value={url || '—'} mono={false} />
    </div>
  )
}

function ResourceLink({
  icon: Icon,
  label,
  sub,
  href,
}: {
  icon: any
  label: string
  sub: string
  href: string
}) {
  return (
    <a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel="noreferrer"
      className="group flex items-center gap-3 p-2.5 -m-2.5 rounded-md hover:bg-white/[0.04] transition-colors"
    >
      <div className="size-8 rounded-md bg-gradient-to-br from-violet-500/15 to-blue-500/15 border border-violet-500/15 flex items-center justify-center">
        <Icon className="size-3.5 text-violet-300" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12.5px] font-medium text-white">{label}</p>
        <p className="text-[11px] text-white/40">{sub}</p>
      </div>
      <ExternalLink className="size-3.5 text-white/30 group-hover:text-white/60 transition-colors" />
    </a>
  )
}
