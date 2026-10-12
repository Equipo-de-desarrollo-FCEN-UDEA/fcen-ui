import type { LucideIcon } from "lucide-react";
import clsx from "clsx";
import { AnimatedCount } from "../atoms/AnimatedCount";
import { tones, type Tone } from "../../theme/tones";

export type StatusTileProps = {
  label: string;
  count: number;
  tone: Tone;
  icon: LucideIcon;
  watermark?: LucideIcon;
  onClick?: () => void;
  selected?: boolean;
  order?: number;
  className?: string;
};

export const StatusTile = ({
  label,
  count,
  tone,
  icon: Icon,
  watermark: Watermark = Icon,
  onClick,
  selected = false,
  order = 0,
  className,
}: StatusTileProps) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={onClick ? selected : undefined}
    disabled={!onClick}
    style={{ animationDelay: `${order * 60}ms` }}
    className={clsx(
      "group relative flex min-h-[104px] w-full flex-col overflow-hidden rounded-2xl p-3 text-left text-white shadow-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 motion-safe:animate-fade-up disabled:cursor-default enabled:cursor-pointer enabled:hover:-translate-y-0.5 enabled:hover:shadow-lg enabled:hover:ring-4",
      tones[tone].tile,
      selected && "ring-4 ring-white/60",
      className,
    )}
  >
    <Watermark
      aria-hidden
      className="pointer-events-none absolute -right-3 -bottom-3 h-16 w-16 -rotate-12 text-white/20 transition-transform duration-500 group-enabled:group-hover:rotate-0"
    />
    <span className="relative mb-auto grid h-6 w-6 place-items-center rounded-md bg-white/25">
      <Icon size={14} aria-hidden />
    </span>
    <AnimatedCount value={count} className="relative mt-3 text-2xl leading-tight font-bold" />
    <span className="relative text-xs font-medium text-white/90">{label}</span>
  </button>
);
