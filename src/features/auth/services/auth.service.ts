import { api, unwrap } from "@/shared/api/client";
import type {
  AcceptInviteDto,
  ChangePasswordDto,
  CreateInviteDto,
  LoginDto,
  UpdateUserDto,
} from "../types/auth.dto";
export type {
  AcceptInviteDto,
  ChangePasswordDto,
  CreateInviteDto,
  LoginDto,
  UpdateUserDto,
} from "../types/auth.dto";

export const getMe = () => unwrap(api.GET("/v1/auth/me"));
export const getAuthConfig = () => unwrap(api.GET("/v1/auth/config"));
export const getInvitePreview = (token: string) =>
  unwrap(api.GET("/v1/auth/invite/{token}", { params: { path: { token } } }));
export const login = (body: LoginDto) =>
  unwrap(api.POST("/v1/auth/login", { body }));
export const acceptInvite = (body: AcceptInviteDto) =>
  unwrap(api.POST("/v1/auth/accept-invite", { body }));
export const logout = () => unwrap(api.POST("/v1/auth/logout"));
export const changePassword = (body: ChangePasswordDto) =>
  unwrap(api.POST("/v1/auth/password", { body }));
export const createTelegramLink = () =>
  unwrap(api.POST("/v1/auth/telegram-link"));
export const unlinkTelegram = () => unwrap(api.DELETE("/v1/auth/telegram"));
export const getUsers = () => unwrap(api.GET("/v1/users"));
export const createInvite = (body: CreateInviteDto) =>
  unwrap(api.POST("/v1/users/invites", { body }));
export const revokeInvite = (id: string) =>
  unwrap(api.DELETE("/v1/users/invites/{id}", { params: { path: { id } } }));
export const updateUser = (id: string, body: UpdateUserDto) =>
  unwrap(api.PATCH("/v1/users/{id}", { params: { path: { id } }, body }));
export const impersonate = (id: string) =>
  unwrap(api.POST("/v1/users/{id}/impersonate", { params: { path: { id } } }));
export const stopImpersonation = () =>
  unwrap(api.POST("/v1/auth/impersonation/stop"));
