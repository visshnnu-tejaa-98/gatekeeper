import * as React from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { DashboardLayout } from '@/components/shell/DashboardLayout'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardBody, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card'
import { Input, Field } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { CodeReveal } from '@/components/ui/CopyButton'
import {
  AppWindow,
  Globe,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import { useRegisterClient } from '@/services/oidc.queries'
import { getErrorMessage } from '@/services/api'
import type { ApplicationWithSecret } from '@/services/types'
import { Dialog, DialogFooter } from '@/components/ui/Dialog'

export const Route = createFileRoute('/dashboard/applications/new')({ component: NewAppPage })

type Form = { applicationDisplayName: string; applicationUrl: string; redirectUri: string }

function NewAppPage() {
  return (
    <DashboardLayout>
      <Inner />
    </DashboardLayout>
  )
}

function Inner() {
  const navigate = useNavigate()
  const [created, setCreated] = React.useState<ApplicationWithSecret | null>(null)
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [pendingValues, setPendingValues] = React.useState<Form | null>(null)
  const register$ = useRegisterClient()
  const { register, handleSubmit, formState: { errors }, getValues } = useForm<Form>()

  const onSubmit: SubmitHandler<Form> = (values) => {
    setPendingValues(values)
    setConfirmOpen(true)
  }

  const performCreate = async () => {
    const values = pendingValues || getValues()
    try {
      const data = await register$.mutateAsync(values)
      setCreated(data)
      setConfirmOpen(false)
      toast.success('Application registered')
    } catch (e) {
      toast.error(getErrorMessage(e))
    }
  }

  if (created) {
    return (
      <>
        <PageHeader
          title="Application registered"
          description="Save your client secret — it won't be shown again."
        />
        <div className="max-w-2xl mx-auto">
          <Card glow className="border-violet-500/20 anim-up">
            <CardBody className="pt-5">
              <div className="flex items-start gap-3 mb-5">
                <div className="size-9 rounded-md bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="size-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-white">{created.applicationDisplayName || 'New application'}</p>
                  <p className="text-[12.5px] text-white/45 mt-0.5">Use the credentials below in your application's config.</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-[10.5px] uppercase tracking-wider font-semibold text-white/35 mb-1.5">Client ID</p>
                  <CodeReveal value={created.clientId} />
                </div>
                <div>
                  <p className="text-[10.5px] uppercase tracking-wider font-semibold text-amber-300 mb-1.5 flex items-center gap-1">
                    <ShieldAlert className="size-3" /> Client Secret (shown once)
                  </p>
                  <CodeReveal value={created.clientSecret} />
                </div>
              </div>

              <div className="mt-5 rounded-lg border border-amber-500/20 bg-amber-500/[0.05] p-3 flex items-start gap-2.5">
                <AlertTriangle className="size-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[12.5px] text-amber-200 font-medium">Copy your secret now</p>
                  <p className="text-[12px] text-white/55 mt-0.5">
                    This secret is hashed before storage and cannot be retrieved later. If you lose it,
                    you'll need to rotate.
                  </p>
                </div>
              </div>
            </CardBody>
            <CardFooter>
              <Link to="/dashboard/applications">
                <Button variant="ghost" size="sm" className="gap-1">
                  <ArrowLeft className="size-3.5" /> Back to list
                </Button>
              </Link>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate({ to: '/dashboard/applications/$id', params: { id: created.id } })}
                className="gap-1"
              >
                Open application <ArrowRight className="size-3.5" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="New application"
        description="Register an OAuth2 client to integrate iLogin with your app."
        actions={
          <Link to="/dashboard/applications">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="size-3.5" /> Back
            </Button>
          </Link>
        }
      />

      <div className="grid lg:grid-cols-[1fr_360px] gap-5 max-w-5xl">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Application details</CardTitle>
              <CardDescription>You can change these later from the application page.</CardDescription>
            </div>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <Field
                label="Application name"
                hint="A human-readable label for users during consent"
                error={errors.applicationDisplayName?.message}
              >
                <Input
                  icon={AppWindow}
                  placeholder="Acme Inc"
                  {...register('applicationDisplayName', { required: 'Required', minLength: { value: 2, message: 'Too short' } })}
                  error={!!errors.applicationDisplayName}
                />
              </Field>
              <Field
                label="Application URL"
                hint="Public homepage — used as a unique key per workspace"
                error={errors.applicationUrl?.message}
              >
                <Input
                  icon={Globe}
                  type="url"
                  placeholder="https://acme.com"
                  {...register('applicationUrl', { required: 'Required' })}
                  error={!!errors.applicationUrl}
                />
              </Field>
              <Field
                label="Redirect URI"
                hint="OAuth2 callback — where users return after consent"
                error={errors.redirectUri?.message}
              >
                <Input
                  icon={ArrowRight}
                  type="url"
                  placeholder="https://acme.com/auth/callback"
                  {...register('redirectUri', { required: 'Required' })}
                  error={!!errors.redirectUri}
                />
              </Field>
              <Button type="submit" variant="primary" size="lg" loading={register$.isPending} className="self-start gap-1.5 mt-2">
                Create application <ArrowRight className="size-4" />
              </Button>
            </form>
          </CardBody>
        </Card>

        {/* Tips */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="text-[13.5px]">What you'll get</CardTitle>
              <CardDescription>After registration:</CardDescription>
            </div>
          </CardHeader>
          <CardBody className="space-y-3">
            {[
              { icon: AppWindow, t: 'Client ID', d: 'A 32-char public identifier' },
              { icon: ShieldAlert, t: 'Client Secret', d: '64-char secret (shown once)' },
              { icon: Globe, t: 'OIDC endpoints', d: 'Authorize, token, JWKS' },
            ].map((b) => (
              <div key={b.t} className="flex items-start gap-2.5 text-[12.5px] text-white/65">
                <b.icon className="size-3.5 text-violet-300 shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-medium">{b.t}</p>
                  <p className="text-white/40 text-[11.5px]">{b.d}</p>
                </div>
              </div>
            ))}
            <div className="pt-3 mt-3 border-t border-white/6">
              <a
                href="#"
                className="text-[12px] text-violet-300 hover:text-violet-200 inline-flex items-center gap-1 font-medium"
              >
                Integration guide <ExternalLink className="size-3" />
              </a>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Confirmation dialog */}
      <Dialog
        open={confirmOpen}
        onOpenChange={(v) => !v && !register$.isPending && setConfirmOpen(false)}
        title="Create this application?"
        description="Review the details before generating credentials"
      >
        {pendingValues && (
          <div className="space-y-3 mb-4">
            <DetailRow label="Display name" value={pendingValues.applicationDisplayName} />
            <DetailRow label="URL" value={pendingValues.applicationUrl} mono />
            <DetailRow label="Redirect URI" value={pendingValues.redirectUri} mono />
          </div>
        )}
        <div className="rounded-lg border border-violet-500/20 bg-violet-500/[0.05] p-3 flex items-start gap-2.5">
          <Sparkles className="size-4 text-violet-300 shrink-0 mt-0.5" />
          <p className="text-[12.5px] text-white/65">
            A new client ID and a one-time client secret will be generated. Copy the secret immediately —
            it cannot be retrieved later.
          </p>
        </div>
        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => setConfirmOpen(false)} disabled={register$.isPending}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={performCreate} loading={register$.isPending} className="gap-1">
            <CheckCircle2 className="size-3.5" /> Create application
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  )
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 text-[12.5px]">
      <span className="text-white/40 shrink-0">{label}</span>
      <span className={`text-white text-right break-all min-w-0 ${mono ? 'font-mono text-[12px]' : ''}`}>{value}</span>
    </div>
  )
}
