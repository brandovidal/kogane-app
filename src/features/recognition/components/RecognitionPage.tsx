import { MessageSquare, ScanText } from "lucide-react";
import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";

// Reconocimiento (D49): several screenshots or a statement at once, reviewed in batch. It needs P21 (hybrid OCR);
// meanwhile each screenshot goes through Mensajes (D57)
export function RecognitionPage() {
  return (
    <Card className="max-w-xl">
      <CardContent className="space-y-4 pt-6">
        <div className="flex items-center gap-2">
          <ScanText className="h-5 w-5" />
          <h2 className="font-semibold">Reconocimiento de capturas</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Subir varias capturas o un estado de cuenta y revisarlos en lote llega con el reconocimiento de capturas bancarias
          (P21). Mientras tanto, manda cada captura por Mensajes: la AI la lee y queda en Borrador si falta algo.
        </p>
        <a href="/mensajes">
          <Button size="sm"><MessageSquare className="mr-1 h-4 w-4" /> Ir a Mensajes</Button>
        </a>
      </CardContent>
    </Card>
  );
}
