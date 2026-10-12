import { useId, useState, type ChangeEvent, type DragEvent } from "react";
import { FileUp, TriangleAlert } from "lucide-react";
import clsx from "clsx";

export type FileRejection = "type" | "size";

export type FileDropProps = {
  onFile: (file: File) => void;
  onReject?: (reason: FileRejection, file: File) => void;
  accept?: string;
  maxSizeMb?: number;
  title?: string;
  dropTitle?: string;
  hint?: string;
  error?: string;
  errorTitle?: string;
  typeErrorMessage?: string;
  sizeErrorMessage?: string;
  disabled?: boolean;
  className?: string;
};

const MEGABYTE = 1024 * 1024;

export function acceptsFile(file: File, accept?: string): boolean {
  if (!accept) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return accept
    .split(",")
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean)
    .some((token) => {
      if (token.startsWith(".")) return name.endsWith(token);
      if (token.endsWith("/*")) return type.startsWith(token.slice(0, -1));
      return type === token;
    });
}

export const FileDrop = ({
  onFile,
  onReject,
  accept,
  maxSizeMb,
  title = "Arrastrar el archivo o seleccionarlo",
  dropTitle = "Soltar el archivo aquí",
  hint,
  error,
  errorTitle = "El archivo no es válido",
  typeErrorMessage = "Formato no permitido",
  sizeErrorMessage,
  disabled = false,
  className,
}: FileDropProps) => {
  const inputId = useId();
  const [dragging, setDragging] = useState(false);
  const [rejection, setRejection] = useState<string | null>(null);
  const message = error ?? rejection;

  const receive = (file: File | undefined) => {
    if (!file) return;
    if (!acceptsFile(file, accept)) {
      setRejection(typeErrorMessage);
      onReject?.("type", file);
      return;
    }
    if (maxSizeMb !== undefined && file.size > maxSizeMb * MEGABYTE) {
      setRejection(sizeErrorMessage ?? `Supera los ${maxSizeMb} MB`);
      onReject?.("size", file);
      return;
    }
    setRejection(null);
    onFile(file);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    receive(event.target.files?.[0]);
    event.target.value = "";
  };

  const handleDragOver = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    if (!disabled) setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(false);
    if (!disabled) receive(event.dataTransfer.files[0]);
  };

  const state = message ? "error" : dragging ? "dragover" : "default";

  return (
    <label
      htmlFor={inputId}
      data-state={state}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={clsx(
        "flex flex-col items-center justify-center gap-1.5 rounded-2xl border-[1.5px] border-dashed px-6 py-7 text-center transition-all duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-600 has-[:focus-visible]:ring-offset-2",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
        state === "default" &&
          "border-brand-300 bg-brand-50 hover:border-brand-500 dark:border-brand-500/40 dark:bg-brand-500/5",
        state === "dragover" && "scale-[1.01] border-brand-600 bg-brand-100/60 dark:bg-brand-500/15",
        state === "error" && "border-rose-400 bg-rose-50 dark:border-rose-500/50 dark:bg-rose-500/5",
        className,
      )}
    >
      <input
        id={inputId}
        type="file"
        accept={accept}
        disabled={disabled}
        onChange={handleChange}
        aria-invalid={state === "error" || undefined}
        className="sr-only"
      />
      <span
        className={clsx(
          "mb-1.5 grid h-13 w-13 place-items-center rounded-full bg-white shadow-sm transition-transform duration-200 dark:bg-slate-900",
          state === "dragover" && "-translate-y-1",
          state === "error" ? "text-rose-600" : "text-brand-600 dark:text-brand-300",
        )}
      >
        {state === "error" ? <TriangleAlert size={24} aria-hidden /> : <FileUp size={24} aria-hidden />}
      </span>
      <span
        className={clsx(
          "text-sm font-semibold",
          state === "error" ? "text-rose-700 dark:text-rose-300" : "text-brand-800 dark:text-brand-200",
        )}
      >
        {state === "error" ? errorTitle : state === "dragover" ? dropTitle : title}
      </span>
      {(message || hint) && (
        <span
          role={message ? "alert" : undefined}
          className={clsx("text-xs", message ? "text-rose-600 dark:text-rose-400" : "text-gray-500 dark:text-gray-400")}
        >
          {message ?? hint}
        </span>
      )}
    </label>
  );
};
