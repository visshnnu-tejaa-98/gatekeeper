import * as React from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { AuthLayout } from '@/components/shell/AuthLayout'
import { Button } from '@/components/ui/Button'
import { CheckCircle2, AlertTriangle, ArrowUpRight, Loader2 } from 'lucide-react'
import { useVerifyEmail } from '@/services/auth.queries'
import { getErrorMessage } from '@/services/api'

export const Route = createFileRoute('/verify-email')({ component: VerifyEmailPage })

function VerifyEmailPage() {
  const navigate = useNavigate()
  const verify = useVerifyEmail()
  const [status, setStatus] = React.useState<'pending' | 'ok' | 'fail'>('pending')
  const [error, setError] = React.useState<string>('')
  const token = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('token') || '' : ''

  React.useEffect(() => {
    if (!token) {
      setStatus('fail')
      setError('Missing verification token in URL')
      return
    }
    verify
      .mutateAsync(token)
      .then(() => {
        setStatus('ok')
        // Auto-redirect after the user has had time to register the success.
        const t = setTimeout(() => navigate({ to: '/dashboard' }), 2200)
        return () => clearTimeout(t)
      })
      .catch((e) => {
        setStatus('fail')
        setError(getErrorMessage(e))
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  return (
    <AuthLayout>
      <div className="anim-up flex flex-col items-center text-center py-2">
        {status === 'pending' && (
          <>
            <div className="size-12 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center mb-4">
              <Loader2 className="size-5 text-violet-300 anim-spin" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-white mb-1">Verifying…</h1>
            <p className="text-[13.5px] text-white/45">Hold tight while we confirm your email.</p>
          </>
        )}

        {status === 'ok' && (
          <>
            <div className="size-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-4">
              <CheckCircle2 className="size-5 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-white mb-1">Email verified</h1>
            <p className="text-[13.5px] text-white/45 mb-2">
              Your email is confirmed. You now have full access to register applications and more.
            </p>
            <p className="text-[11.5px] text-white/30 mb-5">
              Your session token has been refreshed · Redirecting…
            </p>
            <Button variant="primary" block onClick={() => navigate({ to: '/dashboard' })}>
              Go to dashboard now <ArrowUpRight className="size-4" />
            </Button>
          </>
        )}

        {status === 'fail' && (
          <>
            <div className="size-12 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center mb-4">
              <AlertTriangle className="size-5 text-red-400" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-white mb-1">Verification failed</h1>
            <p className="text-[13.5px] text-white/45 mb-1">{error}</p>
            <p className="text-[12px] text-white/35 mb-6">The link may have expired or been used already.</p>
            <div className="flex flex-col gap-2 w-full">
              <Link to="/dashboard/profile" className="w-full">
                <Button variant="primary" block>Request new link</Button>
              </Link>
              <Link to="/login" className="w-full">
                <Button variant="ghost" block>Back to sign in</Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </AuthLayout>
  )
}
