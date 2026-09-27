import type { ImportDetailViewProps } from "../types/import-types";
import { useStatement } from "@/features/statements/hooks/statements";
import { StatementDetail } from "@/features/statements/components/StatementDetail";

export function StatementPreview({ id }: ImportDetailViewProps) {
  const statement = useStatement(id).data;
  return statement ? <StatementDetail statement={statement} /> : null;
}
