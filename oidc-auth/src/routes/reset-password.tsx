import * as React from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { AuthLayout } from '@/components/shell/AuthLayout'
import { Button } from '@/components/ui/Button'
import { Input, Field } from '@/components/ui/Input'
import { Lock, Eye, EyeOff, CheckCircle2, ArrowUpRight, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { useResetPassword } from '@/services/auth.queries'
import { getErrorMessage } from '@/services/api'

export const Route = createFileRoute('/reset-password')({ component: ResetPasswordPage })

type Form = { password: string; confirm: string }

function ResetPasswordPage() {
  const navigate = useNavigate()
  const [showPwd, setShowPwd] = React.useState(false)
  const [done, setDone] = React.useState(false)
  const reset = useResetPassword()
  const token = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('token') || '' : ''
  const { register, handleSubmit, watch, formState: { errors } } = useForm<Form>()
  const pwd = watch('password')

  const onSubmit: SubmitHandler<Form> = async (values) => {
    if (!token) {
      toast.error('Missing reset token')
      return
    }
    try {
      await reset.mutateAsync({ token, password: values.password })
      setDone(true)
      toast.success('Password updated')
    } catch (e) {
      toast.error(getErrorMessage(e))
    }
  }

  if (!token) {
    return (
      <AuthLayout>
        <div className="anim-up flex flex-col items-center text-center py-6">
          <div className="size-12 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mb-4">
            <AlertTriangle className="size-5 text-amber-400" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white mb-2">Invalid link</h1>
          <p className="text-[13.5px] text-white/45 mb-6 max-w-sm">
            This reset link is missing required information. Request a fresh one.
          </p>
          <Link to="/forgot-password" className="w-full max-w-xs">
            <Button variant="primary" block>Get a new link</Button>
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <div className="anim-up mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-white mb-1">Set new password</h1>
        <p className="text-[13.5px] text-white/45">
          Pick a strong password you don't use anywhere else.
        </p>
      </div>

      {done ? (
        <div className="anim-up-1 flex flex-col items-center text-center py-2">
          <div className="size-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-4">
            <CheckCircle2 className="size-5 text-emerald-400" />
          </div>
          <p className="text-[14px] text-white font-medium mb-1">Password updated</p>
          <p className="text-[12.5px] text-white/45 mb-6">You can sign in with your new password now.</p>
          <Button variant="primary" block onClick={() => navigate({ to: '/login' })}>
            Sign in <ArrowUpRight className="size-4" />
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="anim-up-1 flex flex-col gap-4">
          <Field label="New password" hint="At least 8 characters" error={errors.password?.message}>
            <Input
              icon={Lock}
              type={showPwd ? 'text' : 'password'}
              placeholder="••••••••"
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
              {...register('confirm', { required: 'Required', validate: (v) => v === pwd || 'Passwords do not match' })}
              error={!!errors.confirm}
            />
          </Field>
          <Button type="submit" variant="primary" block size="lg" loading={reset.isPending}>
            Update password
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}
