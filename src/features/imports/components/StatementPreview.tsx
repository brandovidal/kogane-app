import type { ImportDetailViewProps } from "../types/import-types";
import { useStatement } from "@/features/statements/hooks/statements";
import { StatementDetail } from "@/features/statements/components/StatementDetail";

export function StatementPreview({
  id,
  onChangeFile,
}: ImportDetailViewProps & { onChangeFile?: () => void }) {
  const statement = useStatement(id).data;
  return statement ? (
    <StatementDetail statement={statement} onChangeFile={onChangeFile} />
  ) : null;
}
