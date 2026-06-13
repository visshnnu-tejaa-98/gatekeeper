import * as React from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { DashboardLayout } from '@/components/shell/DashboardLayout'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { CopyButton } from '@/components/ui/CopyButton'
import { Skeleton } from '@/components/ui/Skeleton'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import {
  AppWindow,
  Plus,
  Search,
  ExternalLink,
  ChevronRight,
  KeyRound,
  Filter,
} from 'lucide-react'
import { useApplications } from '@/services/oidc.queries'

export const Route = createFileRoute('/dashboard/applications/')({ component: ApplicationsPage })

function ApplicationsPage() {
  return (
    <DashboardLayout>
      <Inner />
    </DashboardLayout>
  )
}

function Inner() {
  const { data: apps = [], isLoading } = useApplications()
  const [search, setSearch] = React.useState('')

  const q = search.trim().toLowerCase()
  const filtered = apps.filter((a) => {
    if (q === '') return true
    return (
      (a.name || '').toLowerCase().includes(q) ||
      (a.clientId || '').toLowerCase().includes(q) ||
      (a.url || '').toLowerCase().includes(q)
    )
  })

  return (
    <>
      <PageHeader
        title="Applications"
        description="OAuth2 clients registered in your workspace"
        actions={
          <Link to="/dashboard/applications/new">
            <Button variant="primary" size="sm" className="gap-1">
              <Plus className="size-3.5" /> New application
            </Button>
          </Link>
        }
      />

      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 max-w-sm">
          <Input
            icon={Search}
            placeholder="Search by name, client ID, or URL…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" size="md" className="gap-1.5">
          <Filter className="size-3.5" /> Filter
        </Button>
        <div className="ml-auto text-[12px] text-white/40">
          {filtered.length} of {apps.length}
        </div>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-44 rounded-lg" />
          ))}
        </div>
      ) : apps.length === 0 ? (
        <EmptyState
          icon={AppWindow}
          title="No applications yet"
          description="Register an OAuth2 client to start integrating with iLogin."
          action={
            <Link to="/dashboard/applications/new">
              <Button variant="primary" size="sm" className="gap-1">
                <Plus className="size-3.5" /> Register your first application
              </Button>
            </Link>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No matches"
          description={`Nothing matched "${search}". Try a different query.`}
          compact
        />
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((a, idx) => (
            <Link
              key={a.id}
              to="/dashboard/applications/$id"
              params={{ id: a.id }}
              className="group anim-up"
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              <Card className="hover:bg-white/[0.04] hover:border-white/16 transition-all duration-150 cursor-pointer h-full">
                <div className="p-4 flex items-center gap-3 border-b border-white/6">
                  <div className="size-9 rounded-md bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-violet-500/20 flex items-center justify-center">
                    <AppWindow className="size-4 text-violet-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-white truncate">{a.name}</p>
                    {a.url && (
                      <a
                        href={a.url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[11.5px] text-white/40 hover:text-white/70 flex items-center gap-1 truncate"
                      >
                        {a.url} <ExternalLink className="size-2.5 shrink-0" />
                      </a>
                    )}
                  </div>
                  <ChevronRight className="size-4 text-white/25 group-hover:text-white/60 transition-colors shrink-0" />
                </div>
                <div className="p-4 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <KeyRound className="size-3 text-white/30 shrink-0" />
                    <code className="flex-1 text-[11px] font-mono text-white/55 truncate">
                      {a.clientId.slice(0, 24)}…
                    </code>
                    <CopyButton value={a.clientId} silent className="size-6" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone="purple" size="sm">OAuth2</Badge>
                    <Badge tone="blue" size="sm">PKCE</Badge>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
