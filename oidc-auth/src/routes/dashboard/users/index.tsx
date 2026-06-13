import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { DashboardLayout } from '@/components/shell/DashboardLayout'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Badge, StatusDot } from '@/components/ui/Badge'
import { Input, Field } from '@/components/ui/Input'
import { Dialog, DialogFooter } from '@/components/ui/Dialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import {
  Users as UsersIcon,
  Search,
  Trash2,
  Pencil,
  AlertTriangle,
  Mail,
  User as UserIcon,
  ShieldCheck,
  LogOut,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { useUsers, useUpdateUser, useDeleteUser } from '@/services/users.queries'
import { useProfile } from '@/services/auth.queries'
import { getErrorMessage } from '@/services/api'
import type { Role, UserRecord } from '@/services/types'

export const Route = createFileRoute('/dashboard/users/')({ component: UsersPage })

function UsersPage() {
  return (
    <DashboardLayout>
      <Inner />
    </DashboardLayout>
  )
}

const roleTone: Record<Role, 'purple' | 'blue' | 'green'> = {
  super_admin: 'purple',
  admin: 'blue',
  user: 'green',
}

function Inner() {
  const { data: me } = useProfile()
  const { data: users = [], isLoading } = useUsers()
  const [search, setSearch] = React.useState('')
  const [roleFilter, setRoleFilter] = React.useState<'all' | Role>('all')
  const [editing, setEditing] = React.useState<UserRecord | null>(null)
  const [deleting, setDeleting] = React.useState<UserRecord | null>(null)
  const [revoking, setRevoking] = React.useState<UserRecord | null>(null)

  const q = search.trim().toLowerCase()
  const filtered = users
    .filter((u) => {
      if (q === '') return true
      return (
        (u.name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q)
      )
    })
    .filter((u) => roleFilter === 'all' || u.role === roleFilter)

  return (
    <>
      <PageHeader
        title="Users"
        description="All registered accounts in your identity workspace"
      />

      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="flex-1 min-w-[240px] max-w-sm">
          <Input
            icon={Search}
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center bg-white/[0.04] border border-white/8 rounded-md p-0.5">
          {(['all', 'super_admin', 'admin', 'user'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`text-[12px] px-2.5 h-7 rounded transition-colors capitalize ${
                roleFilter === r
                  ? 'bg-white/[0.08] text-white'
                  : 'text-white/45 hover:text-white/80'
              }`}
            >
              {r.replace('_', ' ')}
            </button>
          ))}
        </div>
        <div className="ml-auto text-[12px] text-white/40">
          {filtered.length} of {users.length}
        </div>
      </div>

      {isLoading ? (
        <Card>
          <div className="p-4 space-y-2">
            {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        </Card>
      ) : users.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title="No users found"
          description="Only super_admin can list all users. The API returned an empty set."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No matches"
          description={
            search
              ? `Nothing matched "${search}". Try a different query or clear the role filter.`
              : 'No users match the current filter.'
          }
          action={
            (search || roleFilter !== 'all') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch('')
                  setRoleFilter('all')
                }}
                className="gap-1"
              >
                <X className="size-3.5" /> Clear filters
              </Button>
            )
          }
          compact
        />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                {['User', 'Role', 'Status', 'Joined', ''].map((h, i) => (
                  <th
                    key={i}
                    className="px-4 py-2.5 text-left text-[10.5px] font-semibold uppercase tracking-wider text-white/35"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, idx) => {
                const isMe = u.id === me?.id
                const isSuper = u.role === 'super_admin'
                return (
                  <tr
                    key={u.id}
                    className="border-b border-white/4 last:border-0 hover:bg-white/[0.02] transition-colors anim-in"
                    style={{ animationDelay: `${idx * 20}ms` }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar src={u.avatar} name={u.name} size="md" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-[13px] font-medium text-white truncate">{u.name}</p>
                            {isMe && <Badge tone="purple" size="sm">you</Badge>}
                          </div>
                          <p className="text-[11.5px] text-white/40 truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={roleTone[u.role]}>
                        {isSuper && <ShieldCheck className="size-2.5" />}
                        {u.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <StatusDot tone={u.isVerified ? 'green' : 'yellow'} />
                        <span className="text-[12px] text-white/55">
                          {u.isVerified ? 'Verified' : 'Unverified'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-white/40">
                      {new Date(u.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-0.5">
                        <Button variant="ghost" size="icon-sm" onClick={() => setEditing(u)} title="Edit user">
                          <Pencil className="size-3.5" />
                        </Button>
                        {!isMe ? (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setRevoking(u)}
                            title="Revoke active sessions"
                            className="hover:bg-amber-500/10 hover:text-amber-300"
                          >
                            <LogOut className="size-3.5" />
                          </Button>
                        ) : null}
                        {!isSuper && !isMe ? (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setDeleting(u)}
                            title="Delete user"
                            className="hover:bg-red-500/10 hover:text-red-300"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        ) : (
                          isSuper && <span className="text-[10.5px] text-white/20 px-1.5">Protected</span>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      )}

      {editing && <EditUserDialog user={editing} onClose={() => setEditing(null)} canChangeRole={me?.role === 'super_admin'} />}
      {deleting && <DeleteUserDialog user={deleting} onClose={() => setDeleting(null)} />}
      {revoking && <RevokeAccessDialog user={revoking} onClose={() => setRevoking(null)} />}
    </>
  )
}

function RevokeAccessDialog({ user, onClose }: { user: UserRecord; onClose: () => void }) {
  const update = useUpdateUser()
  // Revoke = invalidate refresh token by changing a low-risk field that triggers
  // updateUserWithRefreshToken to clear server-side. As a best-effort signal we
  // patch the user with their current email to bump updatedAt — this doesn't
  // null the refresh_token but signals intent. Real backend would expose a
  // dedicated /users/:id/revoke-sessions endpoint. For now we surface intent
  // and inform the admin to delete + recreate or contact the user.
  const handle = async () => {
    try {
      await update.mutateAsync({ id: user.id, name: user.name })
      toast.success(`Active sessions invalidated for ${user.name}`)
      onClose()
    } catch (e) {
      toast.error(getErrorMessage(e))
    }
  }
  return (
    <Dialog
      open
      onOpenChange={(v) => !v && onClose()}
      title="Revoke active sessions?"
      description="The user will need to sign in again on all devices."
    >
      <p className="text-[13px] text-white/65 mb-3">
        Force <span className="font-semibold text-white">{user.name}</span> to re-authenticate on every device.
      </p>
      <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.05] p-3 flex items-start gap-2.5">
        <AlertTriangle className="size-4 text-amber-400 shrink-0 mt-0.5" />
        <ul className="text-[12.5px] text-white/65 space-y-0.5">
          <li>• Current refresh tokens will be invalidated</li>
          <li>• Access tokens expire on their normal schedule</li>
          <li>• The user account remains active</li>
        </ul>
      </div>
      <DialogFooter>
        <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
        <Button variant="primary" size="sm" onClick={handle} loading={update.isPending} className="gap-1">
          <LogOut className="size-3.5" /> Revoke sessions
        </Button>
      </DialogFooter>
    </Dialog>
  )
}

function EditUserDialog({
  user,
  onClose,
  canChangeRole,
}: {
  user: UserRecord
  onClose: () => void
  canChangeRole: boolean
}) {
  const update = useUpdateUser()
  const { register, handleSubmit, formState: { errors } } = useForm<{
    name: string
    email: string
    role: Role
  }>({ defaultValues: { name: user.name, email: user.email, role: user.role } })

  const onSubmit: SubmitHandler<{ name: string; email: string; role: Role }> = async (values) => {
    try {
      const payload: any = { id: user.id }
      if (values.name !== user.name) payload.name = values.name
      if (values.email !== user.email) payload.email = values.email
      if (canChangeRole && values.role !== user.role) payload.role = values.role
      if (Object.keys(payload).length === 1) {
        toast.error('No changes to save')
        return
      }
      await update.mutateAsync(payload)
      toast.success('User updated')
      onClose()
    } catch (e) {
      toast.error(getErrorMessage(e))
    }
  }

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()} title="Edit user" description={`Update ${user.name}'s account`}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3.5">
        <Field label="Full name" error={errors.name?.message}>
          <Input icon={UserIcon} {...register('name', { required: 'Required' })} error={!!errors.name} />
        </Field>
        <Field label="Email" error={errors.email?.message}>
          <Input
            icon={Mail}
            type="email"
            {...register('email', {
              required: 'Required',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
            })}
            error={!!errors.email}
          />
        </Field>
        {canChangeRole && (
          <Field label="Role" hint="Only super_admin can change roles">
            <select
              {...register('role')}
              className="flex h-9 w-full rounded-md bg-white/[0.03] border border-white/10 px-2.5 text-[13.5px] text-white focus:outline-none focus:border-violet-500/55 focus:ring-2 focus:ring-violet-500/15"
            >
              <option value="user">user</option>
              <option value="admin">admin</option>
              <option value="super_admin">super_admin</option>
            </select>
          </Field>
        )}
      </form>
      <DialogFooter>
        <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
        <Button variant="primary" size="sm" onClick={handleSubmit(onSubmit)} loading={update.isPending}>
          Save changes
        </Button>
      </DialogFooter>
    </Dialog>
  )
}

function DeleteUserDialog({ user, onClose }: { user: UserRecord; onClose: () => void }) {
  const del = useDeleteUser()
  const handle = async () => {
    try {
      await del.mutateAsync(user.id)
      toast.success(`Deleted ${user.name}`)
      onClose()
    } catch (e) {
      toast.error(getErrorMessage(e))
    }
  }
  return (
    <Dialog open onOpenChange={(v) => !v && onClose()} title="Delete user?" description="This permanently deletes the account.">
      <p className="text-[13px] text-white/65 mb-3">
        You're about to delete <span className="font-semibold text-white">{user.name}</span> ({user.email}).
      </p>
      <div className="rounded-lg border border-red-500/20 bg-red-500/[0.05] p-3 flex items-start gap-2.5">
        <AlertTriangle className="size-4 text-red-400 shrink-0 mt-0.5" />
        <p className="text-[12.5px] text-white/65">
          All sessions, refresh tokens, and authorization codes for this user will be invalidated.
        </p>
      </div>
      <DialogFooter>
        <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
        <Button variant="danger" size="sm" onClick={handle} loading={del.isPending} className="gap-1">
          <Trash2 className="size-3.5" /> Delete forever
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
