import * as React from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { AuthLayout } from '@/components/shell/AuthLayout'
import { Button } from '@/components/ui/Button'
import { Input, Field } from '@/components/ui/Input'
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { useForgotPassword } from '@/services/auth.queries'
import { getErrorMessage } from '@/services/api'

export const Route = createFileRoute('/forgot-password')({ component: ForgotPasswordPage })

function ForgotPasswordPage() {
  const [email, setEmail] = React.useState('')
  const [sent, setSent] = React.useState(false)
  const forgot = useForgotPassword()
  const { register, handleSubmit, formState: { errors } } = useForm<{ email: string }>()

  const onSubmit: SubmitHandler<{ email: string }> = async (values) => {
    try {
      await forgot.mutateAsync(values.email)
      setEmail(values.email)
      setSent(true)
    } catch (e) {
      toast.error(getErrorMessage(e))
    }
  }

  return (
    <AuthLayout>
      <div className="anim-up mb-6">
        <Link
          to="/login"
          className="inline-flex items-center gap-1 text-[12.5px] text-white/45 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="size-3.5" /> Back to sign in
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-white mb-1">Reset your password</h1>
        <p className="text-[13.5px] text-white/45">
          {sent ? 'Check your inbox for the reset link.' : 'Enter your email — we\'ll send a reset link.'}
        </p>
      </div>

      {sent ? (
        <div className="anim-up-1 flex flex-col items-center text-center py-4">
          <div className="size-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-4">
            <CheckCircle2 className="size-5 text-emerald-400" />
          </div>
          <p className="text-[14px] text-white font-medium mb-1">Email sent</p>
          <p className="text-[12.5px] text-white/45 mb-6">
            We sent a reset link to <span className="text-white/75">{email}</span>
          </p>
          <Link to="/login" className="w-full">
            <Button variant="outline" block>Back to sign in</Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="anim-up-1 flex flex-col gap-4">
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
          <Button type="submit" variant="primary" block size="lg" loading={forgot.isPending}>
            Send reset link
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}
