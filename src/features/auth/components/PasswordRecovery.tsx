import { useState } from "react";
import { KeyRound } from "lucide-react";

import {
  useForgotPassword,
  useResetPassword,
} from "@/features/auth/hooks/auth";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";

const fieldClass =
  "h-12 border-white/10 bg-white/[0.04] text-white placeholder:text-white/35";

// "¿Olvidaste tu contraseña?": emails a one-use link (60 min) when the server can send mail; otherwise an admin re-invites
export function ForgotPasswordPanel({
  mailEnabled,
  initialEmail,
}: {
  mailEnabled: boolean;
  initialEmail: string;
}) {
  const forgot = useForgotPassword();
  const [email, setEmail] = useState(
    initialEmail.includes("@") ? initialEmail : "",
  );

  return (
    <details className="group rounded-lg border border-white/10 bg-white/[0.025] px-3 py-2.5 text-sm">
      <summary className="cursor-pointer list-none font-medium text-white/75 marker:hidden">
        ¿Olvidaste tu contraseña?
      </summary>
      {!mailEnabled ? (
        <p className="mt-2 leading-5 text-white/50">
          Pídele al administrador de Kogane una nueva invitación para el correo
          de tu cuenta. Abre el enlace para elegir otra contraseña.
        </p>
      ) : forgot.isSuccess ? (
        <p role="status" className="mt-2 leading-5 text-emerald-200/80">
          Si el correo tiene una cuenta, te enviamos un enlace para elegir otra
          contraseña. Vence en 60 minutos.
        </p>
      ) : (
        <form
          className="mt-3 space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            forgot.mutate({ email: email.trim() });
          }}
        >
          <p className="leading-5 text-white/50">
            Escribe el correo de tu cuenta y te enviamos un enlace para elegir
            otra contraseña.
          </p>
          <Input
            className={fieldClass}
            type="email"
            placeholder="Correo de tu cuenta"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button
            type="submit"
            variant="outline"
            className="h-11 w-full border-white/15 bg-white/[0.04] text-white hover:bg-white/[0.09] hover:text-white"
            disabled={forgot.isPending || !email.trim()}
          >
            Enviar enlace
          </Button>
        </form>
      )}
    </details>
  );
}

// The page opened from the emailed link (?restablecer=…): choose a new password; other sessions are closed
export function ResetPasswordForm({
  token,
  onDone,
}: {
  token: string;
  onDone: () => void;
}) {
  const reset = useResetPassword();
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const mismatch = repeat.length > 0 && repeat !== password;

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        reset.mutate({ token, password }, { onSuccess: onDone });
      }}
    >
      <Input
        className={fieldClass}
        type="password"
        placeholder="Nueva contraseña (10 caracteres o más)"
        autoComplete="new-password"
        minLength={10}
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Input
        className={fieldClass}
        type="password"
        placeholder="Repite la contraseña"
        autoComplete="new-password"
        required
        value={repeat}
        onChange={(e) => setRepeat(e.target.value)}
      />
      {mismatch && (
        <p className="text-xs text-destructive">
          Las contraseñas no coinciden.
        </p>
      )}
      <Button
        type="submit"
        className="h-12 w-full bg-white text-[#101114] hover:bg-white/90"
        disabled={
          reset.isPending || password.length < 10 || password !== repeat
        }
      >
        <KeyRound className="mr-2 h-4 w-4" /> Cambiar contraseña
      </Button>
    </form>
  );
}
