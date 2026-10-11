import { useState } from "react";
import { FileText } from "lucide-react";
import { toast } from "sonner";

import { errorMessage } from "@/shared/api/hooks/use-api-mutation";
import { Button } from "@/ui/button";
import { getStatementFile } from "../services/statement.service";

export function ViewStatementFileButton({
  statementId,
}: {
  statementId: string;
}) {
  const [loading, setLoading] = useState(false);

  const open = async () => {
    // The tab opens inside the click so the browser does not block it while the link is requested
    const tab = window.open("", "_blank");
    setLoading(true);
    try {
      const { url } = await getStatementFile(statementId);
      if (!url) {
        tab?.close();
        toast.info("Este estado de cuenta no tiene el PDF guardado.");
        return;
      }
      if (tab) tab.location.href = url;
      else window.location.assign(url);
    } catch (error) {
      tab?.close();
      toast.error(errorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" size="sm" disabled={loading} onClick={open}>
      <FileText className="size-4" /> Ver estado de cuenta
    </Button>
  );
}
