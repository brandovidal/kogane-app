import type { ImportDetailViewProps } from "../types/import-types";
import { formatDate } from "@/shared/lib/dates";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import {
  BATCH_STATUS,
  TAB_LABELS,
  TAB_ORDER,
} from "@/features/imports/constants/import-options";
import { useNotionImportDetail } from "../hooks/useNotionImportDetail";
import { ImportSummaryTab } from "../sections/ImportSummaryTab";
import { ImportRowsTab } from "../sections/ImportRowsTab";

export function NotionImportDetailView({ id }: ImportDetailViewProps) {
  const { batch, apply, discard, preview, confirmApply, confirmDiscard } =
    useNotionImportDetail(id);
  if (!batch) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            Notion · {formatDate(batch.createdAt)}
            <Badge variant={preview ? "default" : "secondary"}>
              {BATCH_STATUS[batch.status]}
            </Badge>
          </CardTitle>
          {preview && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={confirmDiscard}
                disabled={discard.isPending}
              >
                Descartar
              </Button>
              <Button
                size="sm"
                onClick={confirmApply}
                disabled={
                  apply.isPending || batch.created + batch.updated === 0
                }
              >
                {apply.isPending ? "Importando…" : "Importar"}
              </Button>
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {preview
            ? "Revisa dónde se guardará cada fila. Solo al importar se escriben tus gastos."
            : `Importado el ${batch.appliedAt ? formatDate(batch.appliedAt) : "—"}.`}
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="summary">
          <div className="overflow-x-auto">
            <TabsList>
              <TabsTrigger value="summary">Resumen</TabsTrigger>
              {TAB_ORDER.map((tab) => (
                <TabsTrigger key={tab} value={tab}>
                  {TAB_LABELS[tab]} ({batch.tabs[tab]})
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          <TabsContent value="summary" className="mt-3">
            <ImportSummaryTab batch={batch} />
          </TabsContent>
          {TAB_ORDER.map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-3">
              <ImportRowsTab batchId={batch.id} tab={tab} applied={!preview} />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
