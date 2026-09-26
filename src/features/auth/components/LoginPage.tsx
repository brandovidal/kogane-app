import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Copy, Dices, Eye, EyeOff, KeyRound, ShieldCheck, Sparkles } from "lucide-react";

import { googleSignInUrl, useAcceptInvite, useAuthConfig, useInvitePreview, useLogin } from "@/shared/api/hooks/auth";
import { withQuery } from "@/shared/api/query";
import { errorMessage } from "@/shared/api/hooks/use-api-mutation";
import { safeReturnPath } from "@/shared/lib/auth-redirect";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";

const ERRORS: Record<string, string> = {
  no_invitado: "Esa cuenta de Google no tiene invitación. Pídele una a un administrador.",
  desactivado: "Esta cuenta está desactivada.",
  google: "No se pudo entrar con Google. Intenta de nuevo.",
};

function params() {
  const query = new URLSearchParams(window.location.search);
  return { invite: query.get("invitacion"), error: query.get("error"), returnTo: safeReturnPath(query.get("volver")) };
}

function generatePassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%*-_";
  const bytes = window.crypto.getRandomValues(new Uint8Array(20));
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

// Entrar (P23, D83): email or mobile + password, or Google. Nobody registers alone: the way in is an invitation link
// (?invitacion=…), which proves the email, or an admin who registered the email (Google then recognises it)
function LoginPageView() {
  // The address is read after hydration: the page is static
  const [url, setUrl] = useState<ReturnType<typeof params> | null>(null);
  useEffect(() => setUrl(params()), []);

  const config = useAuthConfig().data;
  const preview = useInvitePreview(url?.invite ?? null);
  const login = useLogin();
  const acceptInvite = useAcceptInvite();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [name, setName] = useState("");
  const [googleError, setGoogleError] = useState<string | null>(null);
  const generatedInvite = useRef(false);

  const invite = url?.invite ?? null;
  const returnTo = url?.returnTo ?? "/";
  const done = () => window.location.replace(returnTo);
  const error = googleError ?? (url?.error ? (ERRORS[url.error] ?? ERRORS.google) : null);

  const google = async () => {
    try {
      window.location.assign(await googleSignInUrl(returnTo, invite));
    } catch (caught) {
      setGoogleError(errorMessage(caught));
    }
  };

  const invalidInvite = Boolean(url && invite && preview.isError);
  const inviteEmail = invite && preview.data ? preview.data.email : null;

  useEffect(() => {
    if (!inviteEmail || generatedInvite.current) return;
    generatedInvite.current = true;
    setPassword(generatePassword());
    setGeneratedPassword(true);
    setShowPassword(true);
  }, [inviteEmail]);

  const generateInvitePassword = () => {
    setPassword(generatePassword());
    setGeneratedPassword(true);
    setShowPassword(true);
    setCopiedPassword(false);
  };

  if (!url) return null;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#090a0c] px-4 py-8 text-white sm:px-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,rgba(72,94,180,0.18),transparent_44%),radial-gradient(ellipse_at_90%_85%,rgba(45,150,135,0.12),transparent_38%)]" />
      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/10 bg-[#101114]/95 shadow-2xl shadow-black/50 lg:min-h-[640px] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden flex-col justify-between overflow-hidden border-r border-white/10 bg-[#111318] p-10 lg:flex">
          <div aria-hidden="true" className="absolute -right-24 top-28 h-80 w-80 rounded-full border border-white/[0.06]" />
          <div aria-hidden="true" className="absolute -right-12 top-40 h-56 w-56 rounded-full border border-white/[0.08]" />
          <div className="relative flex items-center gap-3">
            <img src="/kogane.webp" alt="" width={44} height={44} className="rounded-xl bg-white p-1" />
            <span className="text-lg font-semibold tracking-tight">Kogane</span>
          </div>
          <div className="relative max-w-md">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-300/20 bg-indigo-300/10 text-indigo-200"><Sparkles className="h-5 w-5" /></div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-indigo-200/80">Tu espacio financiero</p>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight">Todo tu dinero, <span className="text-white/50">con más claridad.</span></h1>
            <p className="mt-5 max-w-sm text-sm leading-6 text-white/55">Organiza gastos, tarjetas y pagos en un solo lugar. Entra de forma segura para continuar.</p>
          </div>
          <div className="relative flex items-center gap-2 text-xs text-white/45"><ShieldCheck className="h-4 w-4 text-emerald-300/80" />Acceso privado mediante invitación</div>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-10 lg:p-12">
          <div className="w-full max-w-sm">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <img src="/kogane.webp" alt="Kogane" width={42} height={42} className="rounded-xl bg-white p-1" />
              <span className="text-lg font-semibold">Kogane</span>
            </div>
            <Card className="border-0 bg-transparent text-white shadow-none">
              <CardHeader className="space-y-2 p-0 pb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-200/75">Bienvenido</p>
                <CardTitle className="text-3xl font-semibold tracking-tight">{inviteEmail ? "Te invitaron a Kogane" : "Entrar a Kogane"}</CardTitle>
                <p className="text-sm leading-6 text-white/55">{inviteEmail ? `Completa tu acceso para ${inviteEmail}.` : "Ingresa a tu cuenta para ver tus finanzas."}</p>
              </CardHeader>
              <CardContent className="space-y-5 p-0">
          {error && <p role="alert" className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</p>}
          {invalidInvite && <p role="alert" className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">La invitación venció o ya se usó: pide otra.</p>}

          {!invalidInvite && (
            <Button type="button" variant="outline" className="h-12 w-full border-white/15 bg-white/[0.04] text-white hover:bg-white/[0.09] hover:text-white disabled:opacity-50" onClick={google} disabled={!config?.google}>
              <svg viewBox="0 0 48 48" aria-hidden="true" className="mr-2 h-[18px] w-[18px]"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3A12 12 0 1 1 32 15.1l5.7-5.7A20 20 0 1 0 44 24c0-1.2-.1-2.3-.4-3.5Z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8A12 12 0 0 1 32 15.1l5.7-5.7A20 20 0 0 0 6.3 14.7Z"/><path fill="#4CAF50" d="M24 44a20 20 0 0 0 13.5-5.3l-6.2-5.2A12 12 0 0 1 12.8 28l-6.5 5A20 20 0 0 0 24 44Z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4 5.5l6.2 5.2A20 20 0 0 0 44 24c0-1.2-.1-2.3-.4-3.5Z"/></svg>
              Iniciar sesión con Google <ArrowUpRight className="ml-auto h-4 w-4 text-white/45" />
            </Button>
          )}
          {!invalidInvite && <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.16em] text-white/35"><span className="h-px flex-1 bg-white/10" />o con contraseña<span className="h-px flex-1 bg-white/10" /></div>}
          {config && !config.google && !invalidInvite && <p className="-mt-3 text-center text-xs text-amber-200/75">Google no está configurado para este entorno.</p>}

          {inviteEmail ? (
            <form
              className="space-y-3"
              onSubmit={(event) => {
                event.preventDefault();
                acceptInvite.mutate({ token: invite!, name: name.trim() || undefined, password }, { onSuccess: done });
              }}
            >
              <Input className="h-12 border-white/10 bg-white/[0.04] text-white placeholder:text-white/35" placeholder="Tu nombre" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
              <div className="flex gap-2">
                <Input className="h-12 min-w-0 border-white/10 bg-white/[0.04] text-white placeholder:text-white/35" type={showPassword ? "text" : "password"} placeholder="Contraseña (10 caracteres o más)" autoComplete="new-password" minLength={10} required value={password} onChange={(e) => { setPassword(e.target.value); setGeneratedPassword(false); setCopiedPassword(false); }} />
                <Button type="button" variant="outline" size="icon" className="h-12 w-12 shrink-0 border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.09] hover:text-white" onClick={generateInvitePassword} aria-label="Generar otra contraseña" title="Generar otra contraseña"><Dices className="h-4 w-4" /></Button>
                <Button type="button" variant="outline" size="icon" className="h-12 w-12 shrink-0 border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.09] hover:text-white" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}><span className="sr-only">{showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}</span>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button>
                <Button type="button" variant="outline" size="icon" className="h-12 w-12 shrink-0 border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.09] hover:text-white" onClick={() => { void navigator.clipboard.writeText(password).then(() => setCopiedPassword(true)).catch(() => setCopiedPassword(false)); }} aria-label="Copiar contraseña" title={copiedPassword ? "Copiada" : "Copiar contraseña"} disabled={!password}><Copy className="h-4 w-4" /></Button>
              </div>
              <p className="text-xs leading-5 text-white/45">{generatedPassword ? "Generamos una contraseña segura. Cópiala y guárdala; se activará al crear tu acceso." : "La contraseña se activará al crear tu acceso."}</p>
              <Button type="submit" className="h-12 w-full bg-white text-[#101114] hover:bg-white/90" disabled={acceptInvite.isPending || password.length < 10}>
                <KeyRound className="mr-2 h-4 w-4" /> Crear mi acceso
              </Button>
            </form>
          ) : !invalidInvite ? (
            <form
              className="space-y-3"
              onSubmit={(event) => {
                event.preventDefault();
                login.mutate({ identifier: identifier.trim(), password }, { onSuccess: done });
              }}
            >
              <Input className="h-12 border-white/10 bg-white/[0.04] text-white placeholder:text-white/35" placeholder="Correo o celular" autoComplete="username" required value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
              <Input className="h-12 border-white/10 bg-white/[0.04] text-white placeholder:text-white/35" type="password" placeholder="Contraseña" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              <Button type="submit" className="h-12 w-full bg-white text-[#101114] hover:bg-white/90" disabled={login.isPending || !identifier.trim() || !password}>
                Entrar
              </Button>
            </form>
          ) : null}

          {!inviteEmail && !invalidInvite && (
            <details className="group rounded-lg border border-white/10 bg-white/[0.025] px-3 py-2.5 text-sm">
              <summary className="cursor-pointer list-none font-medium text-white/75 marker:hidden">¿Olvidaste tu contraseña?</summary>
              <p className="mt-2 leading-5 text-white/50">
                Pídele al administrador de Kogane una nueva invitación para el correo de tu cuenta. Abre el enlace para elegir otra contraseña. Por seguridad, Kogane no envía enlaces de recuperación por correo automáticamente.
              </p>
            </details>
          )}

          <p className="pt-1 text-center text-xs leading-5 text-white/45">Solo con invitación. ¿No tienes una? Pídesela a quien administra Kogane.</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}

export const LoginPage = withQuery(LoginPageView);
