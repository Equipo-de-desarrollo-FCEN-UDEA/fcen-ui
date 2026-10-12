import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import clsx from "clsx";

export type HeroNavTileProps = {
  label: string;
  icon: LucideIcon;
  watermark: LucideIcon;
  onClick: () => void;
  detail?: ReactNode;
  order?: number;
  className?: string;
};

export const HeroNavTile = ({
  label,
  icon: Icon,
  watermark: Watermark,
  onClick,
  detail,
  order = 0,
  className,
}: HeroNavTileProps) => (
  <button
    type="button"
    onClick={onClick}
    style={{ animationDelay: `${order * 60}ms` }}
    className={clsx(
      "group relative flex w-full cursor-pointer items-center gap-5 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-5 text-left text-white shadow-md shadow-brand-700/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-700/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 motion-safe:animate-fade-up md:p-6",
      className,
    )}
  >
    <Watermark
      aria-hidden
      className="pointer-events-none absolute -right-6 -bottom-8 h-36 w-36 rotate-12 text-white/10 transition-transform duration-500 group-hover:rotate-0"
    />
    <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/15 transition-transform duration-200 group-hover:-rotate-6 group-hover:scale-110">
      <Icon className="h-7 w-7" aria-hidden />
    </span>
    <span className="relative min-w-0 flex-1">
      <span className="block text-xl font-bold md:text-2xl">{label}</span>
      {detail && <span className="mt-1 flex items-center gap-2 text-sm text-white/85">{detail}</span>}
    </span>
    <ChevronRight aria-hidden className="relative h-6 w-6 opacity-70 transition-transform group-hover:translate-x-1" />
  </button>
);
