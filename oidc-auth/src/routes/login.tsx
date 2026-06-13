import * as React from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { AuthLayout } from '@/components/shell/AuthLayout'
import { Button } from '@/components/ui/Button'
import { Input, Field } from '@/components/ui/Input'
import { Card, CardBody } from '@/components/ui/Card'
import { Mail, Lock, Eye, EyeOff, ArrowUpRight, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { useLogin } from '@/services/auth.queries'
import { getErrorMessage } from '@/services/api'
import { tokenStore } from '@/services/tokenStore'

export const Route = createFileRoute('/login')({ component: LoginPage })

type LoginForm = { email: string; password: string }

function LoginPage() {
  const navigate = useNavigate()
  const [showPwd, setShowPwd] = React.useState(false)
  const login = useLogin()
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    defaultValues: { email: '', password: '' },
  })

  const onSubmit: SubmitHandler<LoginForm> = async (values) => {
    try {
      const data = await login.mutateAsync(values)
      if ('consentToken' in data) {
        sessionStorage.setItem('consent_token', data.consentToken)
        toast.success(`Continue to ${data.applicationName}`)
        navigate({ to: '/authorize' })
      } else {
        toast.success('Welcome back')
        navigate({ to: '/dashboard' })
      }
    } catch (e) {
      toast.error(getErrorMessage(e))
    }
  }

  React.useEffect(() => {
    if (tokenStore.getAccess()) navigate({ to: '/dashboard' })
  }, [navigate])

  return (
    <AuthLayout
      hero={{
        eyebrow: 'Welcome back',
        title: 'Sign in to your identity workspace.',
        description:
          'Manage applications, users, and sessions from a single self-hosted dashboard.',
        footer: (
          <Card inset className="p-4">
            <CardBody className="p-0">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-[12.5px] text-white/55 leading-relaxed">
                  Refresh token rotation enabled. Your session is automatically renewed without
                  re-authentication.
                </p>
              </div>
            </CardBody>
          </Card>
        ),
      }}
    >
      <div className="anim-up mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-white mb-1">Sign in</h1>
        <p className="text-[13.5px] text-white/45">
          New here?{' '}
          <Link to="/signup" className="text-violet-300 hover:text-violet-200 font-medium">
            Create an account
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="anim-up-1 flex flex-col gap-4">
        <Field label="Email" error={errors.email?.message}>
          <Input
            icon={Mail}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
            })}
            error={!!errors.email}
          />
        </Field>

        <Field
          label={
            <div className="flex items-center justify-between w-full">
              <span>Password</span>
              <Link to="/forgot-password" className="text-[11.5px] font-medium text-violet-300 hover:text-violet-200">
                Forgot?
              </Link>
            </div>
          }
          error={errors.password?.message}
        >
          <Input
            icon={Lock}
            type={showPwd ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            iconRight={
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                className="hover:text-white transition-colors"
              >
                {showPwd ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              </button>
            }
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 8, message: 'Min 8 characters' },
            })}
            error={!!errors.password}
          />
        </Field>

        <Button type="submit" variant="primary" block size="lg" loading={login.isPending}>
          Sign in <ArrowUpRight className="size-4" />
        </Button>
      </form>

      <div className="anim-up-2 mt-7 pt-6 border-t border-white/6">
        <p className="text-[11.5px] text-center text-white/35">
          By signing in you agree to our{' '}
          <Link to="/" className="text-white/55 hover:text-white">Terms</Link>{' '}
          and{' '}
          <Link to="/" className="text-white/55 hover:text-white">Privacy Policy</Link>
        </p>
      </div>
    </AuthLayout>
  )
}
