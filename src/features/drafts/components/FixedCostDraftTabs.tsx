import { useEffect, useState } from "react";
import {
  CalendarClock,
  NotebookPen,
  ReceiptText,
  UsersRound,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { FixedCostDraftGeneralSection } from "../sections/FixedCostDraftGeneralSection";
import { FixedCostDraftScheduleSection } from "../sections/FixedCostDraftScheduleSection";
import { FixedCostDraftSharingSection } from "../sections/FixedCostDraftSharingSection";
import { FixedCostDraftNotesSection } from "../sections/FixedCostDraftNotesSection";
import type { DraftFormSectionProps } from "../types/draft-form";

export function FixedCostDraftTabs(props: DraftFormSectionProps) {
  const [activeTab, setActiveTab] = useState("general");
  useEffect(() => {
    if (
      props.missingFields.some((field) =>
        ["installment", "spentAt"].includes(field),
      )
    ) {
      setActiveTab("schedule");
    } else if (props.missingFields.length) {
      setActiveTab("general");
    }
  }, [props.missingFields]);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="general" className="text-xs sm:text-sm">
          <ReceiptText aria-hidden="true" className="hidden sm:block" />
          General
        </TabsTrigger>
        <TabsTrigger value="schedule" className="text-xs sm:text-sm">
          <CalendarClock aria-hidden="true" className="hidden sm:block" />
          Programación
        </TabsTrigger>
        <TabsTrigger value="sharing" className="text-xs sm:text-sm">
          <UsersRound aria-hidden="true" className="hidden sm:block" />
          Reparto
        </TabsTrigger>
        <TabsTrigger value="notes" className="text-xs sm:text-sm">
          <NotebookPen aria-hidden="true" className="hidden sm:block" />
          Notas
        </TabsTrigger>
      </TabsList>
      <TabsContent value="general" className="py-4">
        <FixedCostDraftGeneralSection {...props} />
      </TabsContent>
      <TabsContent value="schedule" className="py-4">
        <FixedCostDraftScheduleSection {...props} />
      </TabsContent>
      <TabsContent value="sharing" className="py-4">
        <FixedCostDraftSharingSection {...props} />
      </TabsContent>
      <TabsContent value="notes" className="py-4">
        <FixedCostDraftNotesSection {...props} />
      </TabsContent>
    </Tabs>
  );
}
