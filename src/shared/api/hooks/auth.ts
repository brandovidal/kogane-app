import { useQuery } from "@tanstack/react-query";

import { api, unwrap, type Schemas } from "../client";
import { useApiMutation } from "./use-api-mutation";

export const authKeys = {
  me: ["auth", "me"] as const,
  config: ["auth", "config"] as const,
  users: ["auth", "users"] as const,
};

// Who is signed in; without a session the client already sent the browser to Entrar (401 SESSION_REQUIRED)
export const useMe = () =>
  useQuery({
    queryKey: authKeys.me,
    queryFn: () => unwrap(api.GET("/v1/auth/me")),
    retry: false,
    staleTime: 60_000,
  });

export const useAuthConfig = () =>
  useQuery({ queryKey: authKeys.config, queryFn: () => unwrap(api.GET("/v1/auth/config")), staleTime: Infinity });

export const useInvitePreview = (token: string | null) =>
  useQuery({
    queryKey: ["auth", "invite", token],
    queryFn: () => unwrap(api.GET("/v1/auth/invite/{token}", { params: { path: { token: token! } } })),
    enabled: !!token,
    retry: false,
  });

export const useLogin = () =>
  useApiMutation((body: Schemas["LoginDto"]) => unwrap(api.POST("/v1/auth/login", { body })), { invalidate: [authKeys.me] });

export const useAcceptInvite = () =>
  useApiMutation((body: Schemas["AcceptInviteDto"]) => unwrap(api.POST("/v1/auth/accept-invite", { body })), {
    invalidate: [authKeys.me],
  });

export const useLogout = () =>
  useApiMutation(() => unwrap(api.POST("/v1/auth/logout")), { invalidate: [] });

export const useChangePassword = () =>
  useApiMutation((body: Schemas["ChangePasswordDto"]) => unwrap(api.POST("/v1/auth/password", { body })), {
    invalidate: [authKeys.me],
    success: "Contraseña guardada",
  });

// A t.me link that links the chat to this user (15 minutes)
export const useTelegramLink = () =>
  useApiMutation(() => unwrap(api.POST("/v1/auth/telegram-link")), { invalidate: [] });

export const useUnlinkTelegram = () =>
  useApiMutation(() => unwrap(api.DELETE("/v1/auth/telegram")), { invalidate: [authKeys.me], success: "Telegram desvinculado" });

export async function googleSignInUrl(returnTo: string, invite: string | null): Promise<string> {
  const { url } = await unwrap(api.GET("/v1/auth/google", { params: { query: { returnTo, ...(invite ? { invite } : {}) } } }));
  return url;
}

export async function googleLinkUrl(): Promise<string> {
  const { url } = await unwrap(api.GET("/v1/auth/google/link"));
  return url;
}

// ==================== Users (admins) and the backdoor (superadmin) ====================

export const useUsers = (enabled: boolean) =>
  useQuery({ queryKey: authKeys.users, queryFn: () => unwrap(api.GET("/v1/users")), enabled });

export const useInviteUser = () =>
  useApiMutation((body: Schemas["CreateInviteDto"]) => unwrap(api.POST("/v1/users/invites", { body })), {
    invalidate: [authKeys.users],
  });

export const useRevokeInvite = () =>
  useApiMutation((id: string) => unwrap(api.DELETE("/v1/users/invites/{id}", { params: { path: { id } } })), {
    invalidate: [authKeys.users],
    success: "Invitación cancelada",
  });

export const useUpdateUser = () =>
  useApiMutation(
    ({ id, body }: { id: string; body: Schemas["UpdateUserDto"] }) =>
      unwrap(api.PATCH("/v1/users/{id}", { params: { path: { id } }, body })),
    { invalidate: [authKeys.users], success: "Guardado" },
  );

// The superadmin enters as a user (D84): the whole app reloads as them
export const useImpersonate = () =>
  useApiMutation((id: string) => unwrap(api.POST("/v1/users/{id}/impersonate", { params: { path: { id } } })), {
    invalidate: [],
  });

export const useStopImpersonation = () =>
  useApiMutation(() => unwrap(api.POST("/v1/auth/impersonation/stop")), { invalidate: [] });
