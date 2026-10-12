import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import clsx from "clsx";

export type EmptyStateProps = {
  title: string;
  message?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  compact?: boolean;
  className?: string;
};

export const EmptyState = ({ title, message, icon: Icon = Inbox, action, compact = false, className }: EmptyStateProps) => (
  <div
    className={clsx(
      "flex flex-col items-center text-center motion-safe:animate-fade-up",
      compact ? "gap-2 px-6 py-8" : "gap-3.5 px-8 py-12",
      className,
    )}
  >
    <div className={clsx("relative grid place-items-center", compact ? "h-14 w-14" : "h-32 w-32")}>
      {!compact && (
        <>
          <span
            aria-hidden
            className="absolute inset-0 rounded-full border border-brand-100 motion-safe:animate-breathe dark:border-brand-500/20"
          />
          <span
            aria-hidden
            className="absolute inset-3.5 rounded-full border border-brand-100 motion-safe:animate-breathe [animation-delay:400ms] dark:border-brand-500/20"
          />
          <span
            aria-hidden
            className="absolute inset-7 rounded-full border border-brand-200 motion-safe:animate-breathe [animation-delay:800ms] dark:border-brand-500/30"
          />
        </>
      )}
      {compact && <span aria-hidden className="absolute inset-0 rounded-full border border-brand-100 dark:border-brand-500/20" />}
      <span
        className={clsx(
          "relative grid place-items-center rounded-full border border-brand-200 bg-brand-50 text-brand-600 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300",
          compact ? "h-10 w-10" : "h-16 w-16",
        )}
      >
        <Icon size={compact ? 20 : 28} aria-hidden />
      </span>
    </div>
    <p className={clsx("font-semibold text-slate-800 dark:text-slate-100", compact ? "text-sm" : "text-base")}>{title}</p>
    {message && <p className={clsx("text-slate-500 dark:text-slate-400", compact ? "text-xs" : "text-sm")}>{message}</p>}
    {action && <div className="pt-1">{action}</div>}
  </div>
);
