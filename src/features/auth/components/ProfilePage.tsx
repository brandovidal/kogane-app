import { useEffect, useState } from "react";
import { ExternalLink, KeyRound, Send } from "lucide-react";

import { googleLinkUrl, useAuthConfig, useChangePassword, useMe, useTelegramLink, useUnlinkTelegram } from "@/shared/api/hooks/auth";
import { errorMessage } from "@/shared/api/hooks/use-api-mutation";
import { withQuery } from "@/shared/api/query";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";

const ROLE_LABELS: Record<string, string> = { superadmin: "Superadmin", admin: "Admin", member: "Miembro" };

// Perfil (P23): who I am, my password and the Telegram chat linked to my account (D85)
function ProfilePageView() {
  const { data: me } = useMe();
  const authConfig = useAuthConfig().data;
  const changePassword = useChangePassword();
  const telegramLink = useTelegramLink();
  const unlink = useUnlinkTelegram();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [link, setLink] = useState<{ url: string; expiresAt: string } | null>(null);
  const [linkingGoogle, setLinkingGoogle] = useState(false);
  const [googleNotice, setGoogleNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const result = params.get("google");
    const failure = params.get("google_error");
    if (result === "linked") setGoogleNotice({ kind: "success", text: "Google quedó vinculado a tu cuenta." });
    if (failure) {
      const messages: Record<string, string> = {
        cancelled: "Se canceló la vinculación de Google.",
        email: "El correo de Google debe ser el mismo de tu cuenta de Kogane.",
        linked: "Esa cuenta de Google ya está vinculada a otra cuenta de Kogane.",
        session: "Tu sesión venció. Vuelve a iniciar sesión e inténtalo de nuevo.",
      };
      setGoogleNotice({ kind: "error", text: messages[failure] ?? "No se pudo vincular Google." });
    }
    if (result || failure) window.history.replaceState(null, "", window.location.pathname);
  }, []);
  if (!me) return null;

  const startGoogleLink = async () => {
    setLinkingGoogle(true);
    try {
      window.location.assign(await googleLinkUrl());
    } catch (error) {
      setGoogleNotice({ kind: "error", text: errorMessage(error) });
      setLinkingGoogle(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {me.name} <Badge variant="secondary">{ROLE_LABELS[me.role] ?? me.role}</Badge>
          </CardTitle>
          <CardDescription>
            {me.email}
            {me.phone ? ` · ${me.phone}` : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          <Badge variant="outline">{me.googleLinked ? "Google vinculado" : "Sin Google"}</Badge>
          <Badge variant="outline">{me.hasPassword ? "Con contraseña" : "Sin contraseña"}</Badge>
          {!me.googleLinked && authConfig?.google && (
            <Button variant="outline" size="sm" className="basis-full sm:basis-auto" onClick={startGoogleLink} disabled={linkingGoogle}>
              <GoogleMark /> {linkingGoogle ? "Abriendo Google…" : "Vincular con Google"}
            </Button>
          )}
        </CardContent>
      </Card>

      {googleNotice && (
        <p role="status" className={`rounded-md border px-3 py-2 text-sm ${googleNotice.kind === "success" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-destructive/30 bg-destructive/10 text-destructive"}`}>
          {googleNotice.text}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contraseña</CardTitle>
          <CardDescription>{me.hasPassword ? "Cámbiala cuando quieras." : "Define una para entrar sin Google."} Mínimo 10 caracteres.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]"
            onSubmit={(event) => {
              event.preventDefault();
              changePassword.mutate({ current: current || undefined, next }, { onSuccess: () => (setCurrent(""), setNext("")) });
            }}
          >
            {me.hasPassword && <Input type="password" placeholder="Contraseña actual" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />}
            <Input type="password" placeholder="Contraseña nueva" autoComplete="new-password" minLength={10} value={next} onChange={(e) => setNext(e.target.value)} />
            <Button type="submit" disabled={changePassword.isPending || next.length < 10 || (me.hasPassword && !current)}>
              <KeyRound className="mr-1.5 h-4 w-4" /> Guardar
            </Button>
          </form>
          {me.hasPassword && (
            <details className="mt-4 rounded-lg border bg-muted/30 px-3 py-2.5 text-sm">
              <summary className="cursor-pointer font-medium">¿Olvidaste tu contraseña actual?</summary>
              <p className="mt-2 leading-5 text-muted-foreground">
                Pídele al administrador una nueva invitación para el correo de esta cuenta. Al abrirla podrás definir otra contraseña; Kogane no envía enlaces de recuperación automáticamente.
              </p>
            </details>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Telegram</CardTitle>
          <CardDescription>
            El bot guarda lo que le mandes en tu cuenta, no en la de otros. {me.telegramLinked ? "Este chat ya está vinculado." : "Vincula tu chat para usarlo."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={me.telegramLinked ? "outline" : "default"}
              onClick={() => telegramLink.mutate(undefined, { onSuccess: (created) => setLink(created) })}
              disabled={telegramLink.isPending}
            >
              <Send className="mr-1.5 h-4 w-4" /> {me.telegramLinked ? "Vincular otro chat" : "Vincular Telegram"}
            </Button>
            {me.telegramLinked && (
              <Button variant="outline" disabled={unlink.isPending} onClick={() => window.confirm("¿Desvincular Telegram de tu cuenta?") && unlink.mutate()}>
                Desvincular
              </Button>
            )}
          </div>
          {link && (
            <p className="text-sm">
              <a className="inline-flex items-center gap-1 font-medium underline" href={link.url} target="_blank" rel="noreferrer">
                Abrir el bot con tu código <ExternalLink className="h-3.5 w-3.5" />
              </a>{" "}
              <span className="text-muted-foreground">
                (sirve una vez y vence a las {new Date(link.expiresAt).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })})
              </span>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function GoogleMark() {
  return <svg viewBox="0 0 48 48" aria-hidden="true" className="mr-1.5 h-4 w-4"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3A12 12 0 1 1 32 15.1l5.7-5.7A20 20 0 1 0 44 24c0-1.2-.1-2.3-.4-3.5Z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8A12 12 0 0 1 32 15.1l5.7-5.7A20 20 0 0 0 6.3 14.7Z"/><path fill="#4CAF50" d="M24 44a20 20 0 0 0 13.5-5.3l-6.2-5.2A12 12 0 0 1 12.8 28l-6.5 5A20 20 0 0 0 24 44Z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4 5.5l6.2 5.2A20 20 0 0 0 44 24c0-1.2-.1-2.3-.4-3.5Z"/></svg>;
}

export const ProfilePage = withQuery(ProfilePageView);
