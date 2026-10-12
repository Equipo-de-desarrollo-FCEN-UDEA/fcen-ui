import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import clsx from "clsx";

export type NavTileProps = {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  detail?: ReactNode;
  order?: number;
  className?: string;
};

export const NavTile = ({ label, icon: Icon, onClick, detail, order = 0, className }: NavTileProps) => (
  <button
    type="button"
    onClick={onClick}
    style={{ animationDelay: `${order * 60}ms` }}
    className={clsx(
      "group relative w-full cursor-pointer rounded-2xl border border-brand-100 bg-white/80 p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 motion-safe:animate-fade-up dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-brand-500/50",
      className,
    )}
  >
    <span className="flex items-center gap-4">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-700 transition-transform duration-200 group-hover:scale-110 dark:bg-brand-500/15 dark:text-brand-300">
        <Icon className="h-6 w-6" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-slate-800 dark:text-slate-100">{label}</span>
        {detail && (
          <span className="mt-1 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">{detail}</span>
        )}
      </span>
      <ChevronRight
        aria-hidden
        className="h-5 w-5 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-brand-600 dark:text-slate-600 dark:group-hover:text-brand-300"
      />
    </span>
  </button>
);
