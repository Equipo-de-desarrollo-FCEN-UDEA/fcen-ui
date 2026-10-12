import clsx from "clsx";

export type ChipProps = {
  label: string;
  onRemove?: () => void;
  removeLabel?: string;
  className?: string;
};

export const Chip = ({ label, onRemove, removeLabel, className }: ChipProps) => (
  <span
    className={clsx(
      "inline-flex max-w-full items-center gap-2 rounded-full bg-slate-200 px-3 py-1 text-sm font-medium text-slate-800 dark:bg-slate-700 dark:text-slate-100",
      className,
    )}
  >
    <span className="truncate">{label}</span>
    {onRemove && (
      <button
        type="button"
        onClick={onRemove}
        aria-label={removeLabel ?? `Quitar ${label}`}
        className="flex h-4 w-4 cursor-pointer items-center justify-center rounded-full text-xs font-bold text-slate-600 transition-colors hover:bg-slate-300 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 dark:text-slate-300 dark:hover:bg-slate-600 dark:hover:text-white"
      >
        ×
      </button>
    )}
  </span>
);
