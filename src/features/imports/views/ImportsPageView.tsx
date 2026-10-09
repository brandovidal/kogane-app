import { useState } from "react";
import { Replace } from "lucide-react";
import { withQuery } from "@/shared/api/query";
import { Button } from "@/ui/button";
import { useImportsPage } from "../hooks/useImportsPage";
import { ImportUploadCard } from "../components/ImportUploadCard";
import { ImportHistoryCard } from "../components/ImportHistoryCard";
import { ImportRecents } from "../components/ImportRecents";
import { NotionImportDetailView } from "./NotionImportDetailView";
import { StatementPreview } from "../components/StatementPreview";

export function ImportsPageView() {
  const { history, current, source, id, setSelected, startNew } =
    useImportsPage();
  const [showHistory, setShowHistory] = useState(false);

  if (current)
    return (
      <div className="space-y-3">
        {source === "notion" && (
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={startNew}>
              <Replace className="size-4" /> Cambiar export
            </Button>
          </div>
        )}
        <div className="min-w-0">
          {source === "notion" && <NotionImportDetailView id={id} />}
          {source === "statement" && (
            <StatementPreview id={id} onChangeFile={startNew} />
          )}
        </div>
      </div>
    );

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="flex items-start justify-center py-6 lg:py-16">
        <ImportUploadCard onRead={setSelected} />
      </div>
      <div className="space-y-4">
        {showHistory ? (
          <ImportHistoryCard
            items={history}
            current={current}
            onSelect={setSelected}
            onClose={() => setShowHistory(false)}
          />
        ) : (
          <ImportRecents
            items={history}
            onSelect={setSelected}
            onViewAll={() => setShowHistory(true)}
          />
        )}
      </div>
    </div>
  );
}

export const ImportsPage = withQuery(ImportsPageView);
