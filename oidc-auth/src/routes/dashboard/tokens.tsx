import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { DashboardLayout } from '@/components/shell/DashboardLayout'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Input, Field, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
  Activity,
  KeyRound,
  Lock,
  Send,
  CheckCircle2,
  XCircle,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import { useIntrospectToken, useRevokeToken } from '@/services/oidc.queries'
import { getErrorMessage } from '@/services/api'
import type { IntrospectResult } from '@/services/types'

export const Route = createFileRoute('/dashboard/tokens')({ component: TokensLab })

function TokensLab() {
  return (
    <DashboardLayout>
      <Inner />
    </DashboardLayout>
  )
}

type Tab = 'introspect' | 'revoke'

function Inner() {
  const [tab, setTab] = React.useState<Tab>('introspect')

  return (
    <>
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            Token Lab <Badge tone="purple" size="md">RFC 7009 · 7662</Badge>
          </span>
        }
        description="Test the introspection and revocation endpoints from a clean playground."
        actions={
          <a
            href="https://datatracker.ietf.org/doc/html/rfc7662"
            target="_blank"
            rel="noreferrer"
          >
            <Button variant="secondary" size="sm" className="gap-1">
              <Sparkles className="size-3.5" /> RFC Spec
            </Button>
          </a>
        }
      />

      {/* Tab bar */}
      <div className="flex items-center gap-1 p-1 rounded-lg bg-white/[0.03] border border-white/8 w-fit mb-5">
        <TabButton active={tab === 'introspect'} onClick={() => setTab('introspect')} icon={Activity}>
          Introspect
        </TabButton>
        <TabButton active={tab === 'revoke'} onClick={() => setTab('revoke')} icon={Lock}>
          Revoke
        </TabButton>
      </div>

      {tab === 'introspect' ? <IntrospectPanel /> : <RevokePanel />}
    </>
  )
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean
  onClick: () => void
  icon: typeof Activity
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 h-7 text-[12.5px] font-medium rounded-md transition-colors ${
        active
          ? 'bg-white/[0.07] text-white shadow-sm'
          : 'text-white/45 hover:text-white/80'
      }`}
    >
      <Icon className="size-3.5" />
      {children}
    </button>
  )
}

function IntrospectPanel() {
  const introspect = useIntrospectToken()
  const [result, setResult] = React.useState<IntrospectResult | null>(null)
  const { register, handleSubmit, formState: { errors } } = useForm<{
    token: string
    client_id: string
    client_secret: string
  }>()

  const onSubmit: SubmitHandler<{ token: string; client_id: string; client_secret: string }> = async (values) => {
    try {
      const data = await introspect.mutateAsync(values)
      setResult(data)
    } catch (e) {
      toast.error(getErrorMessage(e))
    }
  }

  return (
    <div className="grid lg:grid-cols-[1fr_420px] gap-5 max-w-6xl">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Introspect token</CardTitle>
            <CardDescription>Send a token + client credentials to /o/introspect</CardDescription>
          </div>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Field label="Access token (JWT)" error={errors.token?.message}>
              <Textarea
                placeholder="eyJhbGc..."
                rows={4}
                className="font-mono text-[12px]"
                {...register('token', { required: 'Required' })}
                error={!!errors.token}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Client ID" error={errors.client_id?.message}>
                <Input
                  icon={KeyRound}
                  placeholder="32-char client id"
                  {...register('client_id', { required: 'Required' })}
                  error={!!errors.client_id}
                />
              </Field>
              <Field label="Client secret" error={errors.client_secret?.message}>
                <Input
                  icon={Lock}
                  type="password"
                  placeholder="••••••••"
                  {...register('client_secret', { required: 'Required' })}
                  error={!!errors.client_secret}
                />
              </Field>
            </div>
            <Button type="submit" variant="primary" size="lg" loading={introspect.isPending} className="self-start gap-1.5 mt-2">
              <Send className="size-4" /> Introspect token
            </Button>
          </form>
        </CardBody>
      </Card>

      <ResultPanel result={result} loading={introspect.isPending} />
    </div>
  )
}

function RevokePanel() {
  const revoke = useRevokeToken()
  const { register, handleSubmit, watch, formState: { errors } } = useForm<{
    token: string
    token_type_hint: 'access_token' | 'refresh_token'
    client_id: string
    client_secret: string
  }>({ defaultValues: { token_type_hint: 'access_token' } })

  const onSubmit: SubmitHandler<{
    token: string
    token_type_hint: 'access_token' | 'refresh_token'
    client_id: string
    client_secret: string
  }> = async (values) => {
    try {
      await revoke.mutateAsync(values)
      toast.success('Token revoked successfully')
    } catch (e) {
      toast.error(getErrorMessage(e))
    }
  }

  const hint = watch('token_type_hint')

  return (
    <div className="max-w-3xl">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Revoke token</CardTitle>
            <CardDescription>
              Immediately invalidates the token by inserting jti into the revocation list
            </CardDescription>
          </div>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Field label="Token to revoke" error={errors.token?.message}>
              <Textarea
                placeholder="Paste the access or refresh token..."
                rows={4}
                className="font-mono text-[12px]"
                {...register('token', { required: 'Required' })}
                error={!!errors.token}
              />
            </Field>

            <Field label="Token type">
              <div className="flex items-center gap-1 p-1 rounded-lg bg-white/[0.03] border border-white/8 w-fit">
                {(['access_token', 'refresh_token'] as const).map((t) => (
                  <label
                    key={t}
                    className={`text-[12.5px] font-medium px-3 h-7 rounded-md flex items-center cursor-pointer transition-colors ${
                      hint === t ? 'bg-white/[0.07] text-white' : 'text-white/45 hover:text-white/80'
                    }`}
                  >
                    <input type="radio" value={t} {...register('token_type_hint')} className="sr-only" />
                    {t.replace('_', ' ')}
                  </label>
                ))}
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Client ID" error={errors.client_id?.message}>
                <Input
                  icon={KeyRound}
                  {...register('client_id', { required: 'Required' })}
                  error={!!errors.client_id}
                />
              </Field>
              <Field label="Client secret" error={errors.client_secret?.message}>
                <Input
                  icon={Lock}
                  type="password"
                  {...register('client_secret', { required: 'Required' })}
                  error={!!errors.client_secret}
                />
              </Field>
            </div>

            <Button type="submit" variant="danger" size="lg" loading={revoke.isPending} className="self-start gap-1.5 mt-2">
              <Lock className="size-4" /> Revoke token
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}

function ResultPanel({ result, loading }: { result: IntrospectResult | null; loading: boolean }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex-1">
          <CardTitle>Result</CardTitle>
          <CardDescription>
            {result
              ? result.active
                ? 'Token is valid and active'
                : 'Token is inactive or invalid'
              : 'Submit a token to see its claims'}
          </CardDescription>
        </div>
        {result && (
          <Badge tone={result.active ? 'green' : 'red'}>
            {result.active ? (
              <CheckCircle2 className="size-2.5" />
            ) : (
              <XCircle className="size-2.5" />
            )}
            {result.active ? 'active' : 'inactive'}
          </Badge>
        )}
      </CardHeader>
      <CardBody>
        {loading ? (
          <div className="text-center py-12 text-white/40 text-[13px]">Running…</div>
        ) : result ? (
          <pre className="text-[11.5px] font-mono leading-relaxed bg-[#08080c] border border-white/8 rounded-md p-3 text-white/75 overflow-x-auto">
{JSON.stringify(result, null, 2)}
          </pre>
        ) : (
          <div className="text-center py-12 text-white/30 text-[13px] border border-dashed border-white/10 rounded-md">
            <Activity className="size-5 mx-auto mb-2 text-white/30" />
            Awaiting submission
          </div>
        )}
      </CardBody>
    </Card>
  )
}
