import * as React from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { AuthLayout } from '@/components/shell/AuthLayout'
import { Button } from '@/components/ui/Button'
import { Input, Field } from '@/components/ui/Input'
import { Mail, Lock, Eye, EyeOff, User, ArrowUpRight, ShieldCheck, Zap, Lock as LockIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useRegister } from '@/services/auth.queries'
import { getErrorMessage } from '@/services/api'
import { tokenStore } from '@/services/tokenStore'

export const Route = createFileRoute('/signup')({ component: SignupPage })

type SignupForm = { name: string; email: string; password: string; confirm: string }

function SignupPage() {
  const navigate = useNavigate()
  const [showPwd, setShowPwd] = React.useState(false)
  const register$ = useRegister()
  const { register, handleSubmit, watch, formState: { errors } } = useForm<SignupForm>({
    defaultValues: { name: '', email: '', password: '', confirm: '' },
  })
  const pwd = watch('password')

  const search =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams()
  const clientId = search.get('client_id') || undefined

  React.useEffect(() => {
    if (tokenStore.getAccess() && !clientId) navigate({ to: '/dashboard' })
  }, [navigate, clientId])

  const onSubmit: SubmitHandler<SignupForm> = async (values) => {
    try {
      const data = await register$.mutateAsync({
        name: values.name,
        email: values.email,
        password: values.password,
        clientId,
      })
      if ('consentToken' in data) {
        sessionStorage.setItem('consent_token', data.consentToken)
        window.location.href = `/authorize?${search.toString()}`
      } else {
        toast.success('Account created — verify your email')
        navigate({ to: '/dashboard' })
      }
    } catch (e) {
      toast.error(getErrorMessage(e))
    }
  }

  return (
    <AuthLayout
      hero={{
        eyebrow: 'Get started',
        title: 'Your identity stack.\nOwned by you.',
        description:
          'Spin up a self-hosted OAuth2 + OIDC provider in minutes. Open source. No per-seat pricing.',
        footer: (
          <div className="flex flex-col gap-3">
            {[
              { icon: ShieldCheck, label: 'Standards-compliant OIDC out of the box' },
              { icon: Zap, label: 'PKCE for SPAs without storing secrets' },
              { icon: LockIcon, label: 'Refresh token rotation & instant revocation' },
            ].map((b) => (
              <div key={b.label} className="flex items-start gap-2.5 text-[13px] text-white/65">
                <b.icon className="size-4 text-violet-300 shrink-0 mt-0.5" />
                <span>{b.label}</span>
              </div>
            ))}
          </div>
        ),
      }}
    >
      <div className="anim-up mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-white mb-1">Create your account</h1>
        <p className="text-[13.5px] text-white/45">
          Already have one?{' '}
          <Link to="/login" className="text-violet-300 hover:text-violet-200 font-medium">
            Sign in
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="anim-up-1 flex flex-col gap-3.5">
        <Field label="Full name" error={errors.name?.message}>
          <Input
            icon={User}
            placeholder="Jane Doe"
            autoComplete="name"
            {...register('name', { required: 'Required', minLength: { value: 2, message: 'Too short' } })}
            error={!!errors.name}
          />
        </Field>
        <Field label="Email" error={errors.email?.message}>
          <Input
            icon={Mail}
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            {...register('email', {
              required: 'Required',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
            })}
            error={!!errors.email}
          />
        </Field>
        <Field
          label="Password"
          hint="Minimum 8 characters"
          error={errors.password?.message}
        >
          <Input
            icon={Lock}
            type={showPwd ? 'text' : 'password'}
            placeholder="••••••••"
            autoComplete="new-password"
            iconRight={
              <button type="button" onClick={() => setShowPwd((s) => !s)} className="hover:text-white">
                {showPwd ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              </button>
            }
            {...register('password', { required: 'Required', minLength: { value: 8, message: 'Min 8 characters' } })}
            error={!!errors.password}
          />
        </Field>
        <Field label="Confirm password" error={errors.confirm?.message}>
          <Input
            icon={Lock}
            type={showPwd ? 'text' : 'password'}
            placeholder="Re-enter password"
            autoComplete="new-password"
            {...register('confirm', {
              required: 'Required',
              validate: (v) => v === pwd || 'Passwords do not match',
            })}
            error={!!errors.confirm}
          />
        </Field>

        <Button type="submit" variant="primary" block size="lg" loading={register$.isPending} className="mt-2">
          Create account <ArrowUpRight className="size-4" />
        </Button>
      </form>

      <p className="anim-up-2 text-[11.5px] text-center text-white/35 mt-6">
        By creating an account you agree to our{' '}
        <Link to="/" className="text-white/55 hover:text-white">Terms</Link>
        {' '}and{' '}
        <Link to="/" className="text-white/55 hover:text-white">Privacy</Link>
      </p>
    </AuthLayout>
  )
}
