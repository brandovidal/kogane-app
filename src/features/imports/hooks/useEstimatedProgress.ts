import { useEffect, useState } from "react";
import { estimateProgress } from "../lib/upload-flow";

// Avance estimado mientras la API lee el archivo (no informa progreso real)
export function useEstimatedProgress(active: boolean) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (!active) {
      setProgress(0);
      return;
    }
    const start = Date.now();
    const timer = window.setInterval(
      () => setProgress(estimateProgress(Date.now() - start)),
      250,
    );
    return () => window.clearInterval(timer);
  }, [active]);
  return progress;
}
