import { useQuery, useQueryClient } from '@tanstack/react-query'

import { useApiMutation } from '@/shared/api/hooks/use-api-mutation'
import {
  acceptInvite,
  changePassword,
  createInvite,
  createTelegramLink,
  forgotPassword,
  getAuthConfig,
  getDeviceSessions,
  getInvitePreview,
  getMe,
  getUsers,
  impersonate,
  login,
  logout,
  resetPassword,
  revokeDeviceSession,
  revokeOtherDeviceSessions,
  revokeInvite,
  stopImpersonation,
  unlinkTelegram,
  updateProfile,
  updateUser,
  type AcceptInviteDto,
  type ChangePasswordDto,
  type CreateInviteDto,
  type ForgotPasswordDto,
  type LoginDto,
  type ResetPasswordDto,
  type UpdateProfileDto,
  type UpdateUserDto,
  type RevokedSessionsDto,
} from '../services/auth.service'

const authKeys = {
  me: ['auth', 'me'] as const,
  config: ['auth', 'config'] as const,
  users: ['auth', 'users'] as const,
  sessions: ['auth', 'sessions'] as const,
}

// Who is signed in; without a session the client already sent the browser to Entrar (401 SESSION_REQUIRED)
export const useMe = () =>
  useQuery({
    queryKey: authKeys.me,
    queryFn: getMe,
    retry: false,
    staleTime: 60_000,
  })

export const useAuthConfig = () =>
  useQuery({
    queryKey: authKeys.config,
    queryFn: getAuthConfig,
    staleTime: Infinity,
  })

export const useDeviceSessions = () =>
  useQuery({
    queryKey: authKeys.sessions,
    queryFn: getDeviceSessions,
    staleTime: 30_000,
  })

export const useRevokeDeviceSession = () =>
  useApiMutation((id: string) => revokeDeviceSession(id), {
    invalidate: [authKeys.sessions],
    success: 'Sesión cerrada',
  })

export const useRevokeDeviceSessions = () => {
  const queryClient = useQueryClient()
  return useApiMutation(
    async (ids: string[]) => {
      try {
        return await Promise.all(ids.map(revokeDeviceSession))
      } finally {
        await queryClient.invalidateQueries({ queryKey: authKeys.sessions })
      }
    },
    {
      invalidate: [],
      success: (results) => {
        const count = results.reduce((total, result) => total + result.revoked, 0)
        return `${count} ${count === 1 ? 'sesión cerrada' : 'sesiones cerradas'}`
      },
    },
  )
}

export const useRevokeOtherDeviceSessions = () =>
  useApiMutation(revokeOtherDeviceSessions, {
    invalidate: [authKeys.sessions],
    success: (result: RevokedSessionsDto) => `${result.revoked} ${result.revoked === 1 ? 'sesión cerrada' : 'sesiones cerradas'}`,
  })

export const useInvitePreview = (token: string | null) =>
  useQuery({
    queryKey: ['auth', 'invite', token],
    queryFn: () => getInvitePreview(token!),
    enabled: !!token,
    retry: false,
  })

export const useLogin = () =>
  useApiMutation((body: LoginDto) => login(body), {
    invalidate: [authKeys.me],
  })

export const useAcceptInvite = () =>
  useApiMutation((body: AcceptInviteDto) => acceptInvite(body), {
    invalidate: [authKeys.me],
  })

export const useLogout = () => useApiMutation(logout, { invalidate: [] })

export const useUpdateProfile = () =>
  useApiMutation((body: UpdateProfileDto) => updateProfile(body), {
    invalidate: [authKeys.me],
  })

export const useChangePassword = () =>
  useApiMutation((body: ChangePasswordDto) => changePassword(body), {
    invalidate: [authKeys.me],
    success: 'Contraseña guardada',
  })

// A t.me link that links the chat to this user (15 minutes)
export const useTelegramLink = () =>
  useApiMutation(createTelegramLink, {
    invalidate: [],
  })

export const useUnlinkTelegram = () =>
  useApiMutation(unlinkTelegram, {
    invalidate: [authKeys.me],
    success: 'Telegram desvinculado',
  })

// ==================== Users (admins) and the backdoor (superadmin) ====================

export const useUsers = (enabled: boolean) =>
  useQuery({
    queryKey: authKeys.users,
    queryFn: getUsers,
    enabled,
  })

export const useInviteUser = () =>
  useApiMutation((body: CreateInviteDto) => createInvite(body), {
    invalidate: [authKeys.users],
  })

export const useRevokeInvite = () =>
  useApiMutation((id: string) => revokeInvite(id), {
    invalidate: [authKeys.users],
    success: 'Invitación cancelada',
  })

export const useUpdateUser = () =>
  useApiMutation(({ id, body }: { id: string; body: UpdateUserDto }) => updateUser(id, body), {
    invalidate: [authKeys.users],
    success: 'Guardado',
  })

// The superadmin enters as a user (D84): the whole app reloads as them
export const useImpersonate = () =>
  useApiMutation((id: string) => impersonate(id), {
    invalidate: [],
  })

export const useStopImpersonation = () =>
  useApiMutation(stopImpersonation, {
    invalidate: [],
  })

// "¿Olvidaste tu contraseña?": the answer is the same whether the email exists or not
export const useForgotPassword = () =>
  useApiMutation((body: ForgotPasswordDto) => forgotPassword(body), {
    invalidate: [],
  })

export const useResetPassword = () =>
  useApiMutation((body: ResetPasswordDto) => resetPassword(body), {
    invalidate: [authKeys.me],
    success: 'Contraseña cambiada: ya puedes entrar',
  })
