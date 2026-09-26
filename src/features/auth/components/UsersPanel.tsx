import { useState } from "react";
import { Check, Copy, LogIn, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { useAuthConfig, useImpersonate, useInviteUser, useMe, useRevokeInvite, useUpdateUser, useUsers } from "@/shared/api/hooks/auth";
import { formatDate } from "@/shared/lib/dates";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

const ROLE_LABELS: Record<string, string> = { superadmin: "Superadmin", admin: "Admin", member: "Miembro" };
const STATUS_LABELS: Record<string, string> = { active: "Activo", invited: "Invitado", disabled: "Desactivado" };

// Configuración ▸ Usuarios (P23, D84): admins invite (the link is handed over by them: there is no mail yet), give admin or
// member and activate or disable; only the superadmin can enter as a user (the backdoor)
export function UsersPanel() {
  const { data: me } = useMe();
  const { data } = useUsers(true);
  const mail = useAuthConfig().data?.mail ?? false;
  const invite = useInviteUser();
  const revoke = useRevokeInvite();
  const update = useUpdateUser();
  const impersonate = useImpersonate();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"member" | "admin">("member");
  const [created, setCreated] = useState<{ email: string; url: string; emailed: boolean } | null>(null);
  const [copied, setCopied] = useState(false);
  if (!me || !data) return null;

  const copy = async (url: string) => {
    await navigator.clipboard.writeText(url).catch(() => undefined);
    setCopied(true);
    toast.success("Enlace copiado");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invitar</CardTitle>
          <CardDescription>
            Se crea un enlace de 7 días. {mail ? "También se envía por correo desde la cuenta de Gmail configurada." : "Aquí no hay correo configurado: pasa el enlace tú (WhatsApp, por ejemplo)."} Quien lo abre entra con Google o elige una contraseña.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <form
            className="grid gap-2 sm:grid-cols-[1fr_140px_auto]"
            onSubmit={(event) => {
              event.preventDefault();
              invite.mutate({ email: email.trim(), role, send: true }, { onSuccess: (result) => (setCreated({ email: result.email, url: result.url, emailed: result.emailed }), setEmail("")) });
            }}
          >
            <Input type="email" placeholder="correo@ejemplo.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <Select value={role} onValueChange={(value) => setRole(value as "member" | "admin")}>
              <SelectTrigger aria-label="Rol"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Miembro</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" disabled={invite.isPending || !email.trim()}>
              <UserPlus className="mr-1.5 h-4 w-4" /> Invitar
            </Button>
          </form>
          {created && (
            <div className="space-y-1 rounded-md border bg-muted/40 p-3 text-sm">
              <p>
                {created.emailed ? <>Correo enviado a <span className="font-medium">{created.email}</span>. </> : <>Enlace para <span className="font-medium">{created.email}</span>{mail ? " (el correo no salió: pásalo tú)" : ""}: </>}
                (se muestra una sola vez)
              </p>
              <div className="flex gap-2">
                <Input readOnly value={created.url} onFocus={(event) => event.currentTarget.select()} />
                <Button type="button" variant="outline" onClick={() => copy(created.url)}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}
          {data.invites.length > 0 && (
            <ul className="divide-y rounded-md border text-sm">
              {data.invites.map((item) => (
                <li key={item.id} className="flex items-center gap-2 px-3 py-2">
                  <span className="min-w-0 flex-1 truncate">{item.email}</span>
                  <Badge variant="outline">{ROLE_LABELS[item.role]}</Badge>
                  <span className="text-xs text-muted-foreground">vence {formatDate(item.expiresAt)}</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" aria-label={`Cancelar la invitación de ${item.email}`} onClick={() => revoke.mutate(item.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y rounded-md border text-sm">
            {data.users.map((user) => {
              const isSuper = user.role === "superadmin";
              const self = user.id === me.id;
              return (
                <li key={user.id} className="flex flex-wrap items-center gap-2 px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{user.name}{self ? " (tú)" : ""}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email}
                      {user.phone ? ` · ${user.phone}` : ""}
                    </p>
                  </div>
                  {isSuper ? (
                    <Badge>{ROLE_LABELS.superadmin}</Badge>
                  ) : (
                    <Select value={user.role} onValueChange={(value) => update.mutate({ id: user.id, body: { role: value as "admin" | "member" } })}>
                      <SelectTrigger className="h-8 w-[110px]" aria-label={`Rol de ${user.name}`}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Miembro</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  <Badge variant={user.status === "active" ? "secondary" : "outline"}>{STATUS_LABELS[user.status] ?? user.status}</Badge>
                  {!isSuper && !self && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={update.isPending}
                      onClick={() => update.mutate({ id: user.id, body: { status: user.status === "disabled" ? "active" : "disabled" } })}
                    >
                      {user.status === "disabled" ? "Activar" : "Desactivar"}
                    </Button>
                  )}
                  {me.role === "superadmin" && !self && user.status === "active" && (
                    <Button
                      variant="outline"
                      size="sm"
                      title="Entrar como este usuario durante unas horas (queda en el historial)"
                      disabled={impersonate.isPending}
                      onClick={() => impersonate.mutate(user.id, { onSuccess: () => window.location.replace("/") })}
                    >
                      <LogIn className="mr-1.5 h-3.5 w-3.5" /> Entrar como
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
