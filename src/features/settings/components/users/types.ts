import type { useUsers } from '@/features/auth/hooks/auth'

export type UserData = NonNullable<ReturnType<typeof useUsers>['data']>
export type User = UserData['users'][number]
export type Invite = UserData['invites'][number]
export type UserTab = 'users' | 'invites' | 'roles'
export type RoleFilter = 'all' | 'member' | 'admin' | 'superadmin'
export type StatusFilter = 'all' | 'active' | 'disabled'
export type InviteDraft = { email: string; role: 'member' | 'admin' }
export type InviteResult = InviteDraft & { url: string; emailed: boolean }
export type Confirmation =
  | { kind: 'role'; user: User; role: 'admin' | 'member' }
  | { kind: 'status'; user: User; status: 'active' | 'disabled' }
  | { kind: 'revoke'; invite: Invite }
  | { kind: 'impersonate'; user: User }
