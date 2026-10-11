import { useMemo } from "react";
import { Link2, ShieldCheck } from "lucide-react";
import type { useMe } from "@/features/auth/hooks/auth";
import { AUTH_ROLE_LABELS } from "../../constants/roles";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";

export function ProfileAccountCard({
  user,
  googleEnabled,
  linkingGoogle,
  googleNotice,
  onLinkGoogle,
}: {
  user: NonNullable<ReturnType<typeof useMe>["data"]>;
  googleEnabled: boolean;
  linkingGoogle: boolean;
  googleNotice: { kind: "success" | "error"; text: string } | null;
  onLinkGoogle: () => void;
}) {
  const initials = useMemo(
    () =>
      user.name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toLocaleUpperCase())
        .join(""),
    [user.name],
  );
  const signInMethods = user.phone ? "Correo o celular" : "Correo";

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center gap-3">
          <div
            aria-hidden="true"
            className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary/15 text-lg font-semibold text-primary"
          >
            {initials || "K"}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-semibold">{user.name}</h2>
              <Badge variant="secondary">
                {AUTH_ROLE_LABELS[user.role] ?? user.role}
              </Badge>
            </div>
            <p className="truncate text-sm text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">
            {user.googleLinked ? "Google vinculado" : "Sin Google"}
          </Badge>
          <Badge variant="outline">
            {user.hasPassword ? "Con contraseña" : "Sin contraseña"}
          </Badge>
          {!user.googleLinked && googleEnabled && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={onLinkGoogle}
              disabled={linkingGoogle}
            >
              <Link2 aria-hidden="true" className="size-4" />
              {linkingGoogle ? "Abriendo Google…" : "Vincular Google"}
            </Button>
          )}
        </div>

        <dl className="space-y-2 border-t pt-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">Persona en repartos</dt>
            <dd className="truncate text-right">
              Yo · {user.nickname?.trim() || user.name}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">Entras con</dt>
            <dd className="text-right">{signInMethods}</dd>
          </div>
        </dl>

        {googleNotice && (
          <p
            role={googleNotice.kind === "error" ? "alert" : "status"}
            className={`flex items-start gap-2 rounded-md border px-3 py-2 text-xs ${
              googleNotice.kind === "success"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border-destructive/30 bg-destructive/10 text-destructive"
            }`}
          >
            {googleNotice.kind === "success" && (
              <ShieldCheck
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0"
              />
            )}
            {googleNotice.text}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
