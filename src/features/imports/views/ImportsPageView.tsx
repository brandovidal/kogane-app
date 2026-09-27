import { withQuery } from "@/shared/api/query";
import { EmptyState } from "@/shared/components/data-display/EmptyState";
import { useImportsPage } from "../hooks/useImportsPage";
import { ImportUploadCard } from "../components/ImportUploadCard";
import { ImportHistoryCard } from "../components/ImportHistoryCard";
import { NotionImportDetailView } from "./NotionImportDetailView";
import { StatementPreview } from "../components/StatementPreview";

export function ImportsPageView() {
  const { history, current, source, id, setSelected } = useImportsPage();

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,2.5fr)]">
      <div className="space-y-4">
        <ImportUploadCard onRead={setSelected} />
        <ImportHistoryCard
          items={history}
          current={current}
          onSelect={setSelected}
        />
      </div>
      <div className="min-w-0">
        {source === "notion" && <NotionImportDetailView id={id} />}
        {source === "statement" && <StatementPreview id={id} />}
        {!current && (
          <EmptyState
            title="Nada para revisar"
            description="Sube el estado de cuenta de tu tarjeta en PDF o un export de Notion. Las capturas van por Mensajes."
          />
        )}
      </div>
    </div>
  );
}

export const ImportsPage = withQuery(ImportsPageView);
