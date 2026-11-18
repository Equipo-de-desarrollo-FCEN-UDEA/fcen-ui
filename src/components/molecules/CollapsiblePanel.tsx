import { useId, type ReactNode } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import clsx from "clsx";
import { Button } from "../atoms/Button";

export type CollapsiblePanelProps = {
  index: number;
  title: string;
  subtitle: string;
  collapsed: boolean;
  onToggle: () => void;
  hideToggle?: boolean;
  error?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

export const CollapsiblePanel = ({
  index,
  title,
  subtitle,
  collapsed,
  onToggle,
  hideToggle = false,
  error,
  actions,
  children,
  className,
}: CollapsiblePanelProps) => {
  const contentId = useId();
  return (
    <section className={clsx("overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900", className)}>
      <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 px-5 py-4 dark:border-slate-800">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
              {index}
            </span>
            <div className="min-w-0">
              <h3 className="break-words text-base font-bold text-slate-800 dark:text-white">{title}</h3>
              <p className="break-words text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
            </div>
          </div>
          {error && <p role="alert" className="mt-2 text-sm font-medium text-red-600 dark:text-rose-400">{error}</p>}
        </div>
        <div className="flex items-center gap-2">
          {!hideToggle && (
            <Button
              label={collapsed ? "Expandir" : "Minimizar"}
              variant="outline"
              iconLeft={collapsed ? <ChevronDown size={16} aria-hidden /> : <ChevronUp size={16} aria-hidden />}
              aria-expanded={!collapsed}
              aria-controls={contentId}
              onClick={onToggle}
            />
          )}
          {actions}
        </div>
      </div>
      {(!collapsed || hideToggle) && <div id={contentId} className="p-6">{children}</div>}
    </section>
  );
};
