import { ArrowRight, Settings2 } from "lucide-react";
import { Button } from "@/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/card";

export function ProfileAppSettingsCard() {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Settings2
            aria-hidden="true"
            className="size-4 text-muted-foreground"
          />
          Ajustes de la app
        </CardTitle>
        <CardDescription>
          Tema, moneda predeterminada, zona horaria y avisos se configuran por
          separado de tu perfil.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button type="button" variant="outline" size="sm" asChild>
          <a href="/configuracion/general">
            Ir a Configuración{" "}
            <ArrowRight aria-hidden="true" className="size-4" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
