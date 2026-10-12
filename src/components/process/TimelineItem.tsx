import type { ReactNode } from "react";
import { User } from "lucide-react";
import clsx from "clsx";
import { StatusBadge } from "../atoms/StatusBadge";
import { tones, type Tone } from "../../theme/tones";

export type TimelineItemProps = {
  tone: Tone;
  status: string;
  date: string;
  actor: string;
  observation?: ReactNode;
  observationLabel?: string;
  last?: boolean;
  order?: number;
};

export const TimelineItem = ({
  tone,
  status,
  date,
  actor,
  observation,
  observationLabel = "Observación",
  last = false,
  order = 0,
}: TimelineItemProps) => (
  <li style={{ animationDelay: `${order * 80}ms` }} className="flex gap-4 motion-safe:animate-fade-up">
    <div className="flex w-4 shrink-0 flex-col items-center gap-1.5 pt-1">
      <span className={clsx("h-3 w-3 shrink-0 rounded-full ring-4 ring-white dark:ring-slate-900", tones[tone].solid)} />
      {!last && <span aria-hidden className="w-0.5 flex-1 rounded-full bg-slate-200 dark:bg-slate-700" />}
    </div>
    <div className={clsx("flex min-w-0 flex-1 flex-col gap-1.5", !last && "pb-6")}>
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge label={status} tone={tone} />
        <span className="text-xs text-gray-500 dark:text-gray-400">{date}</span>
      </div>
      <p className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-200">
        <User size={14} aria-hidden className="shrink-0 text-gray-400" />
        {actor}
      </p>
      {observation && (
        <div className="flex flex-col gap-0.5 pt-0.5">
          <span className="text-xs font-medium text-gray-400 dark:text-gray-500">{observationLabel}</span>
          <div className="text-sm text-gray-600 dark:text-gray-300">{observation}</div>
        </div>
      )}
    </div>
  </li>
);

export type TimelineProps = {
  children: ReactNode;
  label?: string;
  className?: string;
};

export const Timeline = ({ children, label, className }: TimelineProps) => (
  <ol aria-label={label} className={clsx("flex flex-col", className)}>
    {children}
  </ol>
);
