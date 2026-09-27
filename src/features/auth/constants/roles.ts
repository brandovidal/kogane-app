export const AUTH_ROLE = {
  SUPERADMIN: "superadmin",
  ADMIN: "admin",
  MEMBER: "member",
} as const;
export const AUTH_ROLE_LABELS: Record<string, string> = {
  [AUTH_ROLE.SUPERADMIN]: "Superadmin",
  [AUTH_ROLE.ADMIN]: "Admin",
  [AUTH_ROLE.MEMBER]: "Miembro",
};
