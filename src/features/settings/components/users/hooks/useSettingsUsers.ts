import { useEffect, useMemo, useState } from 'react'
import { useAuthConfig, useImpersonate, useInviteUser, useMe, useRevokeInvite, useUpdateUser, useUsers } from '@/features/auth/hooks/auth'
import { EMPTY_INVITES, EMPTY_USERS } from '../constants'
import type { Confirmation, InviteDraft, InviteResult, RoleFilter, StatusFilter, User, UserTab } from '../types'

export function useSettingsUsers() {
  const { data: me } = useMe()
  const { data, isLoading, isError } = useUsers(true)
  const { data: authConfig } = useAuthConfig()
  const update = useUpdateUser()
  const impersonate = useImpersonate()
  const revoke = useRevokeInvite()
  const invite = useInviteUser()
  const [tab, setTab] = useState<UserTab>('users')
  const [search, setSearch] = useState('')
  const [role, setRole] = useState<RoleFilter>('all')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteDraft, setInviteDraft] = useState<InviteDraft | null>(null)
  const [createdInvite, setCreatedInvite] = useState<InviteResult | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null)
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])

  const users = data?.users ?? EMPTY_USERS
  const invites = data?.invites ?? EMPTY_INVITES
  const filteredUsers = useMemo(
    () =>
      users.filter((user) => {
        const text = `${user.name} ${user.email} ${user.phone ?? ''}`.toLocaleLowerCase()
        return text.includes(search.toLocaleLowerCase()) && (role === 'all' || user.role === role) && (status === 'all' || user.status === status)
      }),
    [users, search, role, status],
  )
  const activeAdmins = users.filter((user) => user.role === 'admin' && user.status === 'active').length
  const busy = update.isPending || impersonate.isPending || revoke.isPending || invite.isPending

  const openInvite = (draft: InviteDraft | null = null) => {
    setInviteDraft(draft)
    setInviteOpen(true)
  }

  const createInvite = (input: InviteDraft & { send: boolean }) => {
    invite.mutate(
      { email: input.email.trim(), role: input.role, send: input.send },
      {
        onSuccess: (result) => {
          setInviteDraft(null)
          setInviteOpen(false)
          setCreatedInvite({ email: result.email, url: result.url, emailed: result.emailed, role: input.role })
        },
      },
    )
  }

  const confirmAction = () => {
    if (!confirmation) return
    if (confirmation.kind === 'role') {
      update.mutate(
        { id: confirmation.user.id, body: { role: confirmation.role } },
        {
          onSuccess: () => {
            setSelectedUser((current) => (current?.id === confirmation.user.id ? { ...current, role: confirmation.role } : current))
            setConfirmation(null)
          },
        },
      )
    } else if (confirmation.kind === 'status') {
      update.mutate(
        { id: confirmation.user.id, body: { status: confirmation.status } },
        {
          onSuccess: () => {
            setSelectedUser((current) => (current?.id === confirmation.user.id ? { ...current, status: confirmation.status } : current))
            setConfirmation(null)
          },
        },
      )
    } else if (confirmation.kind === 'revoke') {
      revoke.mutate(confirmation.invite.id, { onSuccess: () => setConfirmation(null) })
    } else {
      impersonate.mutate(confirmation.user.id, { onSuccess: () => window.location.replace('/') })
    }
  }

  const inviteAnother = () => {
    setCreatedInvite(null)
    setInviteDraft(null)
    setInviteOpen(true)
  }

  return {
    me,
    data,
    isLoading,
    isError,
    authConfig,
    tab,
    setTab,
    search,
    setSearch,
    role,
    setRole,
    status,
    setStatus,
    inviteOpen,
    setInviteOpen,
    inviteDraft,
    createdInvite,
    setCreatedInvite,
    selectedUser,
    setSelectedUser,
    confirmation,
    setConfirmation,
    hydrated,
    users,
    invites,
    filteredUsers,
    activeAdmins,
    busy,
    openInvite,
    createInvite,
    inviteAnother,
    confirmAction,
  }
}
