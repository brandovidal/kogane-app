import type { Schemas } from '@/shared/api/client'

export type LoginDto = Schemas['LoginDto']
export type AcceptInviteDto = Schemas['AcceptInviteDto']
export type UpdateProfileDto = Schemas['UpdateProfileDto']
export type ChangePasswordDto = Schemas['ChangePasswordDto']
export type CreateInviteDto = Schemas['CreateInviteDto']
export type UpdateUserDto = Schemas['UpdateUserDto']
export type ForgotPasswordDto = Schemas['ForgotPasswordDto']
export type ResetPasswordDto = Schemas['ResetPasswordDto']

export type AuthDeviceKind = 'desktop' | 'mobile' | 'tablet' | 'unknown'

export interface AuthDeviceSession {
  id: string
  browser: string
  os: string
  kind: AuthDeviceKind
  ipAddress: string | null
  createdAt: string
  lastSeenAt: string
  expiresAt: string
  current: boolean
  impersonated: boolean
}

export interface RevokedSessionsDto {
  revoked: number
  closedCurrent: boolean
}
