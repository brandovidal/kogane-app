import { useQuery } from "@tanstack/react-query";

import { useApiMutation } from "@/shared/api/hooks/use-api-mutation";
import {
  acceptInvite,
  changePassword,
  createInvite,
  createTelegramLink,
  getAuthConfig,
  getInvitePreview,
  getMe,
  getUsers,
  impersonate,
  login,
  logout,
  revokeInvite,
  stopImpersonation,
  unlinkTelegram,
  updateUser,
  type AcceptInviteDto,
  type ChangePasswordDto,
  type CreateInviteDto,
  type LoginDto,
  type UpdateUserDto,
} from "../services/auth.service";

export const authKeys = {
  me: ["auth", "me"] as const,
  config: ["auth", "config"] as const,
  users: ["auth", "users"] as const,
};

// Who is signed in; without a session the client already sent the browser to Entrar (401 SESSION_REQUIRED)
export const useMe = () =>
  useQuery({
    queryKey: authKeys.me,
    queryFn: getMe,
    retry: false,
    staleTime: 60_000,
  });

export const useAuthConfig = () =>
  useQuery({
    queryKey: authKeys.config,
    queryFn: getAuthConfig,
    staleTime: Infinity,
  });

export const useInvitePreview = (token: string | null) =>
  useQuery({
    queryKey: ["auth", "invite", token],
    queryFn: () => getInvitePreview(token!),
    enabled: !!token,
    retry: false,
  });

export const useLogin = () =>
  useApiMutation((body: LoginDto) => login(body), {
    invalidate: [authKeys.me],
  });

export const useAcceptInvite = () =>
  useApiMutation((body: AcceptInviteDto) => acceptInvite(body), {
    invalidate: [authKeys.me],
  });

export const useLogout = () => useApiMutation(logout, { invalidate: [] });

export const useChangePassword = () =>
  useApiMutation((body: ChangePasswordDto) => changePassword(body), {
    invalidate: [authKeys.me],
    success: "Contraseña guardada",
  });

// A t.me link that links the chat to this user (15 minutes)
export const useTelegramLink = () =>
  useApiMutation(createTelegramLink, {
    invalidate: [],
  });

export const useUnlinkTelegram = () =>
  useApiMutation(unlinkTelegram, {
    invalidate: [authKeys.me],
    success: "Telegram desvinculado",
  });

// ==================== Users (admins) and the backdoor (superadmin) ====================

export const useUsers = (enabled: boolean) =>
  useQuery({
    queryKey: authKeys.users,
    queryFn: getUsers,
    enabled,
  });

export const useInviteUser = () =>
  useApiMutation((body: CreateInviteDto) => createInvite(body), {
    invalidate: [authKeys.users],
  });

export const useRevokeInvite = () =>
  useApiMutation((id: string) => revokeInvite(id), {
    invalidate: [authKeys.users],
    success: "Invitación cancelada",
  });

export const useUpdateUser = () =>
  useApiMutation(
    ({ id, body }: { id: string; body: UpdateUserDto }) => updateUser(id, body),
    { invalidate: [authKeys.users], success: "Guardado" },
  );

// The superadmin enters as a user (D84): the whole app reloads as them
export const useImpersonate = () =>
  useApiMutation((id: string) => impersonate(id), {
    invalidate: [],
  });

export const useStopImpersonation = () =>
  useApiMutation(stopImpersonation, {
    invalidate: [],
  });
