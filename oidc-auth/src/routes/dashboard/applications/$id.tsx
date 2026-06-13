import * as React from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { DashboardLayout } from '@/components/shell/DashboardLayout'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardBody, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Field } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { CodeReveal } from '@/components/ui/CopyButton'
import { Skeleton } from '@/components/ui/Skeleton'
import { Dialog, DialogFooter } from '@/components/ui/Dialog'
import {
  AppWindow,
  ArrowLeft,
  ArrowRight,
  Globe,
  RefreshCw,
  Trash2,
  ExternalLink,
  AlertTriangle,
  ShieldAlert,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  useApplication,
  useUpdateApplication,
  useRotateSecret,
  useDeleteApplication,
} from '@/services/oidc.queries'
import { getErrorMessage } from '@/services/api'

export const Route = createFileRoute('/dashboard/applications/$id')({ component: AppDetailPage })

function AppDetailPage() {
  return (
    <DashboardLayout>
      <Inner />
    </DashboardLayout>
  )
}

function Inner() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const { data: app, isLoading } = useApplication(id)
  const update = useUpdateApplication()
  const rotate = useRotateSecret()
  const del = useDeleteApplication()

  const [newSecret, setNewSecret] = React.useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [rotateOpen, setRotateOpen] = React.useState(false)

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<{
    name: string
    redirectUri: string
  }>({ values: { name: app?.name || '', redirectUri: app?.redirectUri || '' } })

  React.useEffect(() => {
    if (app) reset({ name: app.name, redirectUri: app.redirectUri })
  }, [app, reset])

  const onUpdate: SubmitHandler<{ name: string; redirectUri: string }> = async (values) => {
    try {
      const payload: any = { id }
      if (values.name !== app?.name) payload.name = values.name
      if (values.redirectUri !== app?.redirectUri) payload.redirectUri = values.redirectUri
      if (Object.keys(payload).length === 1) {
        toast.error('No changes to save')
        return
      }
      await update.mutateAsync(payload)
      toast.success('Application updated')
    } catch (e) {
      toast.error(getErrorMessage(e))
    }
  }

  const handleRotate = async () => {
    try {
      const data = await rotate.mutateAsync(id)
      setNewSecret(data.clientSecret)
      setRotateOpen(false)
      toast.success('Secret rotated — copy it now')
    } catch (e) {
      toast.error(getErrorMessage(e))
    }
  }

  const handleDelete = async () => {
    try {
      await del.mutateAsync(id)
      toast.success('Application deleted')
      navigate({ to: '/dashboard/applications' })
    } catch (e) {
      toast.error(getErrorMessage(e))
    }
  }

  if (isLoading) {
    return (
      <>
        <PageHeader title="Application" />
        <div className="grid lg:grid-cols-[1fr_360px] gap-5 max-w-5xl">
          <Skeleton className="h-64 rounded-lg" />
          <Skeleton className="h-48 rounded-lg" />
        </div>
      </>
    )
  }

  if (!app) {
    return (
      <>
        <PageHeader title="Application not found" />
        <Link to="/dashboard/applications">
          <Button variant="outline" className="gap-1"><ArrowLeft className="size-4" /> Back to applications</Button>
        </Link>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <span>{app.name}</span>
            <Badge tone="purple" size="md">OAuth2</Badge>
          </span>
        }
        description={
          <a href={app.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-white/45 hover:text-white">
            {app.url} <ExternalLink className="size-3" />
          </a>
        }
        actions={
          <Link to="/dashboard/applications">
            <Button variant="ghost" size="sm" className="gap-1"><ArrowLeft className="size-3.5" /> All apps</Button>
          </Link>
        }
      />

      <div className="grid lg:grid-cols-[1fr_360px] gap-5 max-w-5xl">
        {/* Left col */}
        <div className="flex flex-col gap-5">
          {newSecret && (
            <Card glow className="border-amber-500/30 anim-up">
              <CardBody className="pt-4">
                <div className="flex items-start gap-3">
                  <div className="size-9 rounded-md bg-amber-500/15 border border-amber-500/25 flex items-center justify-center shrink-0">
                    <ShieldAlert className="size-4 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-white mb-1">New client secret</p>
                    <p className="text-[12.5px] text-white/55 mb-3">
                      Copy this secret immediately. It won't be shown again.
                    </p>
                    <CodeReveal value={newSecret} />
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Credentials */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Credentials</CardTitle>
                <CardDescription>Use these in your application's OAuth2 config</CardDescription>
              </div>
            </CardHeader>
            <CardBody className="space-y-3">
              <div>
                <p className="text-[10.5px] uppercase tracking-wider font-semibold text-white/35 mb-1.5">
                  Client ID
                </p>
                <CodeReveal value={app.clientId} />
              </div>
              <div>
                <p className="text-[10.5px] uppercase tracking-wider font-semibold text-white/35 mb-1.5">
                  Redirect URI
                </p>
                <CodeReveal value={app.redirectUri} mono={false} />
              </div>
              <div>
                <p className="text-[10.5px] uppercase tracking-wider font-semibold text-white/35 mb-1.5">
                  Application ID
                </p>
                <CodeReveal value={app.id} />
              </div>
            </CardBody>
          </Card>

          {/* Edit */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Edit application</CardTitle>
                <CardDescription>Update the display name or redirect URI</CardDescription>
              </div>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleSubmit(onUpdate)} className="flex flex-col gap-4">
                <Field label="Application name" error={errors.name?.message}>
                  <Input
                    icon={AppWindow}
                    {...register('name', { required: 'Required' })}
                    error={!!errors.name}
                  />
                </Field>
                <Field label="Redirect URI" error={errors.redirectUri?.message}>
                  <Input
                    icon={Globe}
                    type="url"
                    {...register('redirectUri', { required: 'Required' })}
                    error={!!errors.redirectUri}
                  />
                </Field>
              </form>
            </CardBody>
            <CardFooter>
              <p className="text-[12px] text-white/40">
                {isDirty ? 'Unsaved changes' : 'No changes'}
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSubmit(onUpdate)}
                loading={update.isPending}
                disabled={!isDirty}
                className="gap-1"
              >
                Save changes <ArrowRight className="size-3.5" />
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right col */}
        <div className="flex flex-col gap-5">
          {/* Rotate */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Rotate secret</CardTitle>
                <CardDescription>Invalidates the current client secret immediately</CardDescription>
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-[12.5px] text-white/55 leading-relaxed mb-4">
                Any integration using the current secret will stop working. Plan a deployment
                window before rotating in production.
              </p>
              <Button variant="outline" block className="gap-1.5" onClick={() => setRotateOpen(true)}>
                <RefreshCw className="size-3.5" /> Rotate secret
              </Button>
            </CardBody>
          </Card>

          {/* Danger zone */}
          <Card className="border-red-500/15">
            <CardHeader>
              <div>
                <CardTitle className="text-red-300">Delete application</CardTitle>
                <CardDescription>Permanent — cannot be undone</CardDescription>
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-[12.5px] text-white/55 leading-relaxed mb-4">
                All existing access tokens issued by this client will stop being valid. Users
                will need to re-authenticate.
              </p>
              <Button variant="danger" block className="gap-1.5" onClick={() => setDeleteOpen(true)}>
                <Trash2 className="size-3.5" /> Delete application
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Rotate confirm dialog */}
      <Dialog
        open={rotateOpen}
        onOpenChange={setRotateOpen}
        title="Rotate client secret?"
        description="The current secret will stop working immediately."
      >
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.05] p-3 mb-4 flex items-start gap-2.5">
          <AlertTriangle className="size-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[12.5px] text-white/65">
            You'll need to update your application's environment with the new secret before
            users can authenticate again.
          </p>
        </div>
        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => setRotateOpen(false)}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={handleRotate} loading={rotate.isPending} className="gap-1">
            <RefreshCw className="size-3.5" /> Rotate secret
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this application?"
        description="This action cannot be undone."
      >
        <p className="text-[13px] text-white/65 mb-3">
          You're about to permanently delete <span className="font-semibold text-white">{app.name}</span>.
        </p>
        <div className="rounded-lg border border-red-500/20 bg-red-500/[0.05] p-3 mb-4 flex items-start gap-2.5">
          <AlertTriangle className="size-4 text-red-400 shrink-0 mt-0.5" />
          <ul className="text-[12.5px] text-white/65 space-y-0.5">
            <li>• All access tokens will be invalidated</li>
            <li>• Users will be signed out of this app</li>
            <li>• Client ID will not be reusable</li>
          </ul>
        </div>
        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button variant="danger" size="sm" onClick={handleDelete} loading={del.isPending} className="gap-1">
            <Trash2 className="size-3.5" /> Delete forever
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  )
}
