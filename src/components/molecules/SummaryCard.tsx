import type { LucideIcon } from "lucide-react";
import clsx from "clsx";

export type SummaryCardProps = {
  label: string;
  value: string;
  icon: LucideIcon;
  className?: string;
};

export const SummaryCard = ({ label, value, icon: Icon, className }: SummaryCardProps) => (
  <div
    className={clsx(
      "inline-flex items-center gap-3 rounded-xl border border-brand-200 bg-brand-50 py-3 pr-4.5 pl-3.5 dark:border-brand-500/30 dark:bg-brand-500/10",
      className,
    )}
  >
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-white text-brand-600 shadow-sm dark:bg-slate-900 dark:text-brand-300">
      <Icon size={18} aria-hidden />
    </span>
    <span className="flex min-w-0 flex-col">
      <span className="text-xs font-medium text-brand-700 dark:text-brand-200">{label}</span>
      <span className="truncate text-sm font-semibold text-brand-900 dark:text-white">{value}</span>
    </span>
  </div>
);
