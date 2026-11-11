import { Paperclip } from "lucide-react";

export type DocumentCountProps = {
  count: number | null;
};

export const DocumentCount = ({ count }: DocumentCountProps) => {
  if (count === null) return null;
  if (count === 0) {
    return (
      <span className="text-sm text-gray-400 dark:text-gray-500">
        <span aria-hidden>—</span>
        <span className="sr-only">Sin documentos</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-200">
      <Paperclip size={14} aria-hidden className="shrink-0 text-gray-500 dark:text-gray-400" />
      {count}
      <span className="sr-only">{count === 1 ? " documento" : " documentos"}</span>
    </span>
  );
};
