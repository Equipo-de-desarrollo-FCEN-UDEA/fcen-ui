import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import clsx from "clsx";
import { CodePill } from "../atoms/CodePill";
import { StatusBadge } from "../atoms/StatusBadge";
import { tones, type Tone } from "../../theme/tones";

export type RecordStatus = {
  label: string;
  tone: Tone;
};

export type RecordMeta = {
  icon: LucideIcon;
  text: string;
};

export type RecordNote = {
  icon: LucideIcon;
  text: string;
  tone?: Tone;
};

export type RecordCardProps = {
  title: string;
  status: RecordStatus;
  code?: string;
  meta?: RecordMeta[];
  progress?: { reached: number; total: number };
  note?: RecordNote;
  footer?: string;
  onClick?: () => void;
  order?: number;
  className?: string;
};

export const RecordCard = ({
  title,
  status,
  code,
  meta = [],
  progress,
  note,
  footer,
  onClick,
  order = 0,
  className,
}: RecordCardProps) => {
  const NoteIcon = note?.icon;
  const noteTone = tones[note?.tone ?? "warning"];
  const segments = progress ? Array.from({ length: progress.total }, (_, index) => index < progress.reached) : [];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      style={{ animationDelay: `${order * 60}ms` }}
      className={clsx(
        "group flex w-full flex-col gap-3.5 rounded-2xl border border-gray-200 bg-white px-5 pt-5 pb-4.5 text-left shadow-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 motion-safe:animate-fade-up disabled:cursor-default enabled:cursor-pointer enabled:hover:-translate-y-0.5 enabled:hover:border-brand-300 enabled:hover:shadow-lg dark:border-slate-700 dark:bg-slate-900 dark:enabled:hover:border-brand-500/50",
        className,
      )}
    >
      <span className="flex items-center justify-between gap-2">
        <StatusBadge label={status.label} tone={status.tone} />
        {code && <CodePill code={code} />}
      </span>
      <span className="line-clamp-2 text-base font-semibold text-gray-900 dark:text-gray-50">{title}</span>
      {meta.length > 0 && (
        <span className="flex flex-col gap-1.5">
          {meta.map((item) => {
            const Icon = item.icon;
            return (
              <span key={item.text} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Icon size={14} aria-hidden className="shrink-0 text-gray-400" />
                <span className="truncate">{item.text}</span>
              </span>
            );
          })}
        </span>
      )}
      {segments.length > 0 && (
        <span aria-hidden className="flex gap-1">
          {segments.map((reached, index) => (
            <span key={index} className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              {reached && (
                <span
                  style={{ animationDelay: `${order * 60 + index * 120}ms` }}
                  className={clsx("absolute inset-0 origin-left rounded-full motion-safe:animate-grow-x", tones[status.tone].solid)}
                />
              )}
            </span>
          ))}
        </span>
      )}
      {note && NoteIcon && (
        <span
          className={clsx(
            "inline-flex items-center gap-2 self-start rounded-[10px] border py-1.5 pr-3 pl-2.5 text-xs font-semibold",
            noteTone.soft,
            noteTone.softBorder,
            noteTone.softText,
          )}
        >
          <NoteIcon size={14} aria-hidden />
          {note.text}
        </span>
      )}
      <span className="mt-auto flex items-center justify-between gap-2">
        <span className="text-xs text-gray-500 dark:text-gray-400">{footer}</span>
        {onClick && (
          <span className="grid h-7 w-7 place-items-center rounded-full bg-slate-50 text-gray-400 transition-colors group-hover:bg-brand-600 group-hover:text-white dark:bg-slate-800">
            <ChevronRight size={16} aria-hidden className="transition-transform group-hover:translate-x-0.5" />
          </span>
        )}
      </span>
    </button>
  );
};
