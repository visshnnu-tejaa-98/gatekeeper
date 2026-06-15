import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { DashboardLayout } from '@/components/shell/DashboardLayout'
import { PageHeader } from '@/components/ui/PageHeader'
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/Card'
import { Input, Field } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { CodeReveal } from '@/components/ui/CopyButton'
import {
  Mail,
  User as UserIcon,
  ShieldCheck,
  Camera,
  CheckCircle2,
  AlertCircle,
  Send,
  ArrowRight,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  useProfile,
  useUploadAvatar,
  useRequestVerifyEmail,
} from '@/services/auth.queries'
import { useUpdateUser } from '@/services/users.queries'
import { getErrorMessage } from '@/services/api'

export const Route = createFileRoute('/dashboard/profile')({
  component: ProfilePage,
})

function ProfilePage() {
  return (
    <DashboardLayout>
      <Inner />
    </DashboardLayout>
  )
}

function Inner() {
  const { data: user } = useProfile()
  const upload = useUploadAvatar()
  const verifyReq = useRequestVerifyEmail()
  const update = useUpdateUser()
  const fileRef = React.useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<{ name: string; email: string }>({
    values: { name: user?.name || '', email: user?.email || '' },
  })

  React.useEffect(() => {
    if (user) reset({ name: user.name, email: user.email })
  }, [user, reset])

  const onSubmit: SubmitHandler<{ name: string; email: string }> = async (
    values,
  ) => {
    if (!user) return
    try {
      const payload: any = { id: user.id }
      if (values.name !== user.name) payload.name = values.name
      if (values.email !== user.email) payload.email = values.email
      if (Object.keys(payload).length === 1) {
        toast.error('No changes')
        return
      }
      await update.mutateAsync(payload)
      toast.success('Profile updated')
    } catch (e) {
      toast.error(getErrorMessage(e))
    }
  }

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      await upload.mutateAsync(file)
      toast.success('Avatar updated')
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const handleVerify = async () => {
    try {
      await verifyReq.mutateAsync()
      toast.success('Verification email sent — check your inbox')
    } catch (e) {
      toast.error(getErrorMessage(e))
    }
  }

  return (
    <>
      <PageHeader
        title="Profile"
        description="Manage your personal account details"
      />

      <div className="grid lg:grid-cols-[1fr_360px] gap-5 max-w-5xl">
        {/* Left col */}
        <div className="flex flex-col gap-5">
          {/* Personal info */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Personal details</CardTitle>
                <CardDescription>
                  Visible to applications during consent
                </CardDescription>
              </div>
            </CardHeader>
            <CardBody>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-4"
              >
                <Field label="Full name" error={errors.name?.message}>
                  <Input
                    icon={UserIcon}
                    {...register('name', {
                      required: 'Required',
                      minLength: { value: 2, message: 'Too short' },
                    })}
                    error={!!errors.name}
                  />
                </Field>
                <Field
                  label="Email"
                  hint={
                    user?.isEmailVerified
                      ? 'Verified'
                      : 'Not verified — verify below'
                  }
                  error={errors.email?.message}
                >
                  <Input
                    icon={Mail}
                    type="email"
                    {...register('email', {
                      required: 'Required',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Invalid email',
                      },
                    })}
                    error={!!errors.email}
                  />
                </Field>
              </form>
            </CardBody>
            <CardFooter>
              <p className="text-[12px] text-white/40">
                {isDirty ? 'Unsaved changes' : 'All saved'}
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSubmit(onSubmit)}
                loading={update.isPending}
                disabled={!isDirty}
                className="gap-1"
              >
                Save changes <ArrowRight className="size-3.5" />
              </Button>
            </CardFooter>
          </Card>

          {/* Email verification */}
          {!user?.isEmailVerified && (
            <Card className="border-amber-500/15">
              <CardHeader>
                <div>
                  <CardTitle className="text-amber-200 flex items-center gap-2">
                    <AlertCircle className="size-4" /> Email not verified
                  </CardTitle>
                  <CardDescription>
                    Verify your email to register OAuth2 applications and access
                    advanced features
                  </CardDescription>
                </div>
              </CardHeader>
              <CardBody>
                <Button
                  variant="primary"
                  onClick={handleVerify}
                  loading={verifyReq.isPending}
                  className="gap-1.5"
                >
                  <Send className="size-3.5" /> Send verification email
                </Button>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Right col */}
        <div className="flex flex-col gap-5">
          {/* Avatar */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Avatar</CardTitle>
                <CardDescription>PNG or JPEG, up to 5 MB</CardDescription>
              </div>
            </CardHeader>
            <CardBody className="flex flex-col items-center pt-2">
              <div className="relative inline-block mb-3 group">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={upload.isPending}
                  className="relative cursor-pointer rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0c14] disabled:cursor-not-allowed"
                  title="Change avatar"
                  aria-label="Change avatar"
                >
                  <Avatar
                    src={user?.avatar}
                    name={user?.name}
                    size="xl"
                    className="size-20"
                  />
                  <span className="pointer-events-none absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <Camera className="size-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={upload.isPending}
                  className="absolute -bottom-1 -right-1 size-7 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 border-2 border-[#0c0c14] flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                  title="Change avatar"
                  aria-label="Change avatar"
                >
                  <Camera className="size-3 text-white" />
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={handleAvatar}
                  className="hidden"
                />
              </div>
              <p className="text-[11.5px] text-white/40 text-center">
                Click to upload a new image
              </p>
              {upload.isPending && (
                <p className="text-[11px] text-violet-300 anim-pulse mt-1">
                  Uploading…
                </p>
              )}
            </CardBody>
          </Card>

          {/* Identity */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Identity</CardTitle>
                <CardDescription>Your role and account status</CardDescription>
              </div>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[12.5px] text-white/55">Role</span>
                <Badge
                  tone={
                    user?.role === 'super_admin'
                      ? 'purple'
                      : user?.role === 'admin'
                        ? 'blue'
                        : 'green'
                  }
                >
                  <ShieldCheck className="size-2.5" /> {user?.role}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12.5px] text-white/55">Email</span>
                {user?.isEmailVerified ? (
                  <Badge tone="green">
                    <CheckCircle2 className="size-2.5" /> verified
                  </Badge>
                ) : (
                  <Badge tone="orange">
                    <AlertCircle className="size-2.5" /> unverified
                  </Badge>
                )}
              </div>
              {user?.id && (
                <div className="pt-3 border-t border-white/6">
                  <p className="text-[10.5px] uppercase tracking-wider font-semibold text-white/35 mb-1.5">
                    User ID
                  </p>
                  <CodeReveal value={user.id} />
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  )
}
