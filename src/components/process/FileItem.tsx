import { CircleCheck, FileText, Trash2, TriangleAlert } from "lucide-react";
import clsx from "clsx";

export type FileItemState = "uploaded" | "uploading" | "error";

export type FileItemProps = {
  name: string;
  state: FileItemState;
  detail?: string;
  progress?: number;
  onRemove?: () => void;
  removeLabel?: string;
  className?: string;
};

export const FileItem = ({ name, state, detail, progress = 0, onRemove, removeLabel, className }: FileItemProps) => {
  const percent = Math.min(100, Math.max(0, Math.round(progress)));

  return (
    <div
      data-state={state}
      className={clsx(
        "flex items-center gap-3 rounded-xl border bg-white p-3 shadow-sm motion-safe:animate-fade-up dark:bg-slate-900",
        state === "error" ? "border-rose-300 dark:border-rose-500/50" : "border-gray-200 dark:border-slate-700",
        className,
      )}
    >
      <span
        className={clsx(
          "grid h-10 w-10 shrink-0 place-items-center rounded-xl",
          state === "error"
            ? "bg-rose-50 text-rose-600 dark:bg-rose-500/10"
            : "bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300",
        )}
      >
        <FileText size={20} aria-hidden />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{name}</span>
        {state === "uploading" ? (
          <span
            role="progressbar"
            aria-label={`Subiendo ${name}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
          >
            <span
              className="block h-full rounded-full bg-emerald-500 transition-[width] duration-300"
              style={{ width: `${percent}%` }}
            />
          </span>
        ) : (
          detail && (
            <span
              className={clsx("truncate text-xs", state === "error" ? "text-rose-600 dark:text-rose-400" : "text-gray-500")}
            >
              {detail}
            </span>
          )
        )}
      </div>
      {state === "uploaded" && <CircleCheck size={18} aria-hidden className="shrink-0 text-emerald-600" />}
      {state === "error" && <TriangleAlert size={18} aria-hidden className="shrink-0 text-rose-600" />}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={removeLabel ?? `Quitar ${name}`}
          className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-lg text-gray-400 transition-colors hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 dark:hover:bg-rose-500/10"
        >
          <Trash2 size={18} aria-hidden />
        </button>
      )}
    </div>
  );
};
