import { ApiError, api, apiFetch, unwrap } from '@/shared/api/client'
import type {
  AcceptInviteDto,
  ChangePasswordDto,
  CreateInviteDto,
  ForgotPasswordDto,
  LoginDto,
  ResetPasswordDto,
  UpdateProfileDto,
  UpdateUserDto,
  AuthDeviceSession,
  RevokedSessionsDto,
} from '../types/auth.dto'
export type {
  AcceptInviteDto,
  AuthDeviceSession,
  ChangePasswordDto,
  CreateInviteDto,
  ForgotPasswordDto,
  LoginDto,
  ResetPasswordDto,
  RevokedSessionsDto,
  UpdateProfileDto,
  UpdateUserDto,
} from '../types/auth.dto'

type ApiEnvelope<T> = {
  data?: T
  code?: string
  message?: string
  details?: unknown
}

async function requestSessions<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await apiFetch(`/api/v1/auth/sessions${path}`, init)
  const body = (await response.json().catch(() => ({}))) as ApiEnvelope<T>
  if (!response.ok) {
    throw new ApiError(response.status, body.code ?? 'UNKNOWN_ERROR', body.message ?? response.statusText, body.details)
  }
  return body.data as T
}

export const getMe = () => unwrap(api.GET('/v1/auth/me'))
export const getAuthConfig = () => unwrap(api.GET('/v1/auth/config'))
export const getInvitePreview = (token: string) => unwrap(api.GET('/v1/auth/invite/{token}', { params: { path: { token } } }))
export const login = (body: LoginDto) => unwrap(api.POST('/v1/auth/login', { body }))
export const acceptInvite = (body: AcceptInviteDto) => unwrap(api.POST('/v1/auth/accept-invite', { body }))
export const forgotPassword = (body: ForgotPasswordDto) => unwrap(api.POST('/v1/auth/forgot-password', { body }))
export const resetPassword = (body: ResetPasswordDto) => unwrap(api.POST('/v1/auth/reset-password', { body }))
export const getDeviceSessions = async () => (await requestSessions<{ sessions: AuthDeviceSession[] }>('')).sessions
export const revokeDeviceSession = (id: string) => requestSessions<RevokedSessionsDto>(`/${encodeURIComponent(id)}`, { method: 'DELETE' })
export const revokeOtherDeviceSessions = () => requestSessions<RevokedSessionsDto>('/revoke-others', { method: 'POST' })
export const logout = () => unwrap(api.POST('/v1/auth/logout'))
export const updateProfile = (body: UpdateProfileDto) => unwrap(api.PATCH('/v1/auth/me', { body }))
export const changePassword = (body: ChangePasswordDto) => unwrap(api.POST('/v1/auth/password', { body }))
export const createTelegramLink = () => unwrap(api.POST('/v1/auth/telegram-link'))
export const unlinkTelegram = () => unwrap(api.DELETE('/v1/auth/telegram'))
export const getUsers = () => unwrap(api.GET('/v1/users'))
export const createInvite = (body: CreateInviteDto) => unwrap(api.POST('/v1/users/invites', { body }))
export const revokeInvite = (id: string) => unwrap(api.DELETE('/v1/users/invites/{id}', { params: { path: { id } } }))
export const updateUser = (id: string, body: UpdateUserDto) => unwrap(api.PATCH('/v1/users/{id}', { params: { path: { id } }, body }))
export const impersonate = (id: string) => unwrap(api.POST('/v1/users/{id}/impersonate', { params: { path: { id } } }))
export const stopImpersonation = () => unwrap(api.POST('/v1/auth/impersonation/stop'))
