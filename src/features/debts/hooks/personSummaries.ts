import { useQuery } from "@tanstack/react-query";

import { useApiMutation } from "@/shared/api/hooks/use-api-mutation";
import {
  getPersonSummaries,
  savePersonSummary,
  setPersonSummariesStatus,
} from "../services/person-summary.service";
import type {
  BulkPersonSummaryStatusDto,
  SavePersonSummaryDto,
} from "../types/person-summary.dto";

const KEY = ["person-summaries"] as const;

// What was decided for each person in a month; a person without a row is a draft
export const usePersonSummaries = (month: number, year: number) =>
  useQuery({
    queryKey: [...KEY, month, year],
    queryFn: () => getPersonSummaries({ month, year }),
  });

export const useSavePersonSummary = () =>
  useApiMutation(
    (input: { personId: string; body: SavePersonSummaryDto }) =>
      savePersonSummary(input.personId, input.body),
    { invalidate: [[...KEY]], success: "Resumen guardado" },
  );

export const useSetPersonSummariesStatus = () =>
  useApiMutation(
    (body: BulkPersonSummaryStatusDto) => setPersonSummariesStatus(body),
    { invalidate: [[...KEY]], success: "Estado actualizado" },
  );
