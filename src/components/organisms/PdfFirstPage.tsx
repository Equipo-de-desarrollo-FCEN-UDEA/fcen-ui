import { useCallback, useRef, useState } from "react";
import { FileX } from "lucide-react";
import clsx from "clsx";
import { Spinner } from "../atoms/Spinner";
import { EmptyState } from "../molecules/EmptyState";
import { usePdfPages } from "./pdfPages";

export type PdfFirstPageProps = {
  file: Blob;
  label: string;
  errorMessage?: string;
  className?: string;
};

type Outcome = { file: Blob; failed: boolean };

export const PdfFirstPage = ({
  file,
  label,
  errorMessage = "No se puede mostrar este archivo",
  className,
}: PdfFirstPageProps) => {
  const container = useRef<HTMLDivElement>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const markReady = useCallback((source: Blob) => setOutcome({ file: source, failed: false }), []);
  const markFailed = useCallback((source: Blob) => setOutcome({ file: source, failed: true }), []);
  usePdfPages(container, file, { onReady: markReady, onFail: markFailed, lastPage: 1, label });
  const settled = outcome?.file === file ? outcome : null;

  return (
    <div className={clsx("relative w-full", className)}>
      {!settled && (
        <div className="grid place-items-center py-16">
          <Spinner size={28} label="Cargando documento" />
        </div>
      )}
      {settled?.failed && <EmptyState compact icon={FileX} title={errorMessage} />}
      <div ref={container} hidden={settled?.failed} />
    </div>
  );
};
