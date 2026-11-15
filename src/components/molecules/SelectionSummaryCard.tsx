import type { ReactNode } from "react";
import clsx from "clsx";

export type SelectionSummaryCardProps = {
  label?: string;
  children: ReactNode;
  className?: string;
};

export const SelectionSummaryCard = ({ label, children, className }: SelectionSummaryCardProps) => (
  <div className={clsx("mt-4 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-700 dark:border-brand-900/50 dark:bg-brand-900/30 dark:text-brand-300", className)}>
    {label ? (
      <>
        {label} <span className="font-semibold">{children}</span>
      </>
    ) : (
      <span className="font-semibold">{children}</span>
    )}
  </div>
);
