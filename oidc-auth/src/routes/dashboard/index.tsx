import { createFileRoute, Link } from '@tanstack/react-router'
import { DashboardLayout } from '@/components/shell/DashboardLayout'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardBody, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge, StatusDot } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { CodeReveal } from '@/components/ui/CopyButton'
import { Skeleton } from '@/components/ui/Skeleton'
import {
  AppWindow,
  ShieldCheck,
  ArrowUpRight,
  Plus,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronRight,
  Activity,
  Zap,
} from 'lucide-react'
import { useProfile } from '@/services/auth.queries'
import { useApplications } from '@/services/oidc.queries'

export const Route = createFileRoute('/dashboard/')({ component: DashboardHome })

function DashboardHome() {
  return (
    <DashboardLayout>
      <DashboardInner />
    </DashboardLayout>
  )
}

function DashboardInner() {
  const { data: user } = useProfile()
  const { data: apps = [], isLoading: appsLoading } = useApplications()
  const isSuper = user?.role === 'super_admin'

  return (
    <>
      <PageHeader
        title={`Welcome back${user?.name ? `, ${user.name.split(' ')[0]}` : ''}`}
        description="Manage your identity workspace. Monitor sessions, register apps, control access."
        actions={
          <>
            <Link to="/dashboard/tokens">
              <Button variant="secondary" size="sm" className="gap-1">
                <Activity className="size-3.5" /> Token Lab
              </Button>
            </Link>
            <Link to="/dashboard/applications/new">
              <Button variant="primary" size="sm" className="gap-1">
                <Plus className="size-3.5" /> New application
              </Button>
            </Link>
          </>
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5 anim-up">
        <StatCard
          icon={AppWindow}
          label="Applications"
          value={appsLoading ? '—' : String(apps.length)}
          tone="violet"
          hint="OAuth2 clients"
        />
        <StatCard
          icon={ShieldCheck}
          label="Your role"
          value={user?.role || '—'}
          tone="blue"
          hint="Access level"
        />
        <StatCard
          icon={Zap}
          label="Email status"
          value={user?.isEmailVerified ? 'Verified' : 'Pending'}
          tone={user?.isEmailVerified ? 'emerald' : 'amber'}
          hint={user?.isEmailVerified ? 'Verified' : 'Action needed'}
        />
        <StatCard
          icon={Clock}
          label="Session"
          value="Active"
          tone="emerald"
          hint="Token live"
        />
      </div>

      {/* Two-column grid */}
      <div className="grid lg:grid-cols-[1fr_360px] gap-5">
        {/* Applications */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Recent applications</CardTitle>
              <CardDescription>OAuth2 clients registered in your workspace</CardDescription>
            </div>
            <Link to="/dashboard/applications">
              <Button variant="ghost" size="sm" className="gap-1">
                View all <ChevronRight className="size-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardBody className="p-0">
            {appsLoading ? (
              <div className="px-5 py-2 space-y-2 pb-4">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : apps.length === 0 ? (
              <div className="px-5 pb-5">
                <div className="text-center py-8 rounded-lg border border-dashed border-white/10">
                  <AppWindow className="size-5 text-white/30 mx-auto mb-2" />
                  <p className="text-[13px] text-white/55 mb-1">No applications yet</p>
                  <p className="text-[12px] text-white/35 mb-4">Register your first OAuth2 client</p>
                  <Link to="/dashboard/applications/new">
                    <Button variant="primary" size="sm" className="gap-1">
                      <Plus className="size-3.5" /> Register application
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-white/6">
                {apps.slice(0, 4).map((a) => (
                  <Link
                    key={a.id}
                    to="/dashboard/applications/$id"
                    params={{ id: a.id }}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.025] group transition-colors"
                  >
                    <div className="size-8 rounded-md bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-violet-500/15 flex items-center justify-center shrink-0">
                      <AppWindow className="size-3.5 text-violet-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-white truncate">{a.name}</p>
                      <p className="text-[11px] text-white/40 font-mono truncate">{a.clientId}</p>
                    </div>
                    <ChevronRight className="size-3.5 text-white/25 group-hover:text-white/60 transition-colors" />
                  </Link>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Right side */}
        <div className="flex flex-col gap-5">
          {/* Account health */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Account health</CardTitle>
                <CardDescription>Recommended next steps</CardDescription>
              </div>
            </CardHeader>
            <CardBody className="space-y-2.5 pt-1">
              <HealthRow
                ok={!!user?.isEmailVerified}
                title="Email verified"
                description={user?.isEmailVerified ? 'Confirmed' : 'Required to register apps'}
                action={!user?.isEmailVerified ? { label: 'Verify', to: '/dashboard/profile' } : null}
              />
              <HealthRow
                ok={true}
                title="Account active"
                description={`Role: ${user?.role || '—'}`}
              />
              <HealthRow
                ok={apps.length > 0}
                title={apps.length > 0 ? `${apps.length} application${apps.length === 1 ? '' : 's'}` : 'No applications yet'}
                description={apps.length > 0 ? 'OAuth2 clients registered' : 'Register your first client'}
                action={apps.length === 0 ? { label: 'Create', to: '/dashboard/applications/new' } : null}
              />
            </CardBody>
          </Card>

          {/* Profile card */}
          {user && (
            <Card>
              <CardBody className="pt-4">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar src={user.avatar} name={user.name} size="lg" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13.5px] font-semibold text-white truncate">{user.name}</p>
                    <p className="text-[11.5px] text-white/45 truncate">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mb-3">
                  <Badge tone={isSuper ? 'purple' : user.role === 'admin' ? 'blue' : 'green'}>
                    <ShieldCheck className="size-2.5" /> {user.role}
                  </Badge>
                  {user.isEmailVerified ? (
                    <Badge tone="green">
                      <CheckCircle2 className="size-2.5" /> verified
                    </Badge>
                  ) : (
                    <Badge tone="orange">
                      <AlertCircle className="size-2.5" /> unverified
                    </Badge>
                  )}
                </div>
                <CodeReveal value={user.id} label="USER ID" className="text-[11px]" />
              </CardBody>
              <CardFooter>
                <Link to="/dashboard/profile" className="text-[12px] text-violet-300 hover:text-violet-200 font-medium">
                  Edit profile
                </Link>
                <ArrowUpRight className="size-3.5 text-white/40" />
              </CardFooter>
            </Card>
          )}
        </div>
      </div>

      {/* Pro tip */}
      <div className="mt-5 anim-up-1">
        <Card className="bg-gradient-to-br from-violet-500/[0.04] to-transparent border-violet-500/15">
          <CardBody>
            <div className="flex items-start gap-3">
              <div className="size-9 rounded-lg bg-violet-500/15 border border-violet-500/25 flex items-center justify-center shrink-0">
                <Sparkles className="size-4 text-violet-300" />
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-semibold text-white mb-1">Try the Token Lab</p>
                <p className="text-[12.5px] text-white/55 leading-relaxed max-w-2xl">
                  Test the RFC 7662 introspection endpoint, revoke tokens, and explore JWT claims —
                  all from a clean playground. No curl required.
                </p>
              </div>
              <Link to="/dashboard/tokens">
                <Button variant="primary" size="sm" className="gap-1">
                  Open lab <ArrowUpRight className="size-3.5" />
                </Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = 'violet',
}: {
  icon: typeof AppWindow
  label: string
  value: string
  hint?: string
  tone?: 'violet' | 'blue' | 'emerald' | 'amber' | 'pink'
}) {
  const tones = {
    violet: 'text-violet-300 bg-violet-500/15 border-violet-500/20',
    blue: 'text-blue-300 bg-blue-500/15 border-blue-500/20',
    emerald: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/20',
    amber: 'text-amber-300 bg-amber-500/15 border-amber-500/20',
    pink: 'text-pink-300 bg-pink-500/15 border-pink-500/20',
  }
  return (
    <div className="relative rounded-lg border border-white/8 bg-white/[0.02] p-4 hover:bg-white/[0.035] hover:border-white/14 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className={`size-8 rounded-md border flex items-center justify-center ${tones[tone]}`}>
          <Icon className="size-4" />
        </div>
        {hint && (
          <span className="text-[10px] uppercase tracking-wider text-white/30 font-semibold">{hint}</span>
        )}
      </div>
      <p className="text-[11px] text-white/40 font-medium mb-1">{label}</p>
      <p className="text-[22px] font-semibold tracking-tight text-white leading-none capitalize">{value}</p>
    </div>
  )
}

function HealthRow({
  ok,
  title,
  description,
  action,
}: {
  ok: boolean
  title: string
  description?: string
  action?: { label: string; to: string } | null
}) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-md bg-white/[0.02] border border-white/6">
      <StatusDot tone={ok ? 'green' : 'yellow'} />
      <div className="flex-1 min-w-0">
        <p className="text-[12.5px] font-medium text-white">{title}</p>
        {description && <p className="text-[11px] text-white/40">{description}</p>}
      </div>
      {action && (
        <Link to={action.to}>
          <Button variant="ghost" size="xs">{action.label}</Button>
        </Link>
      )}
    </div>
  )
}
