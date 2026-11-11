import { ChevronRight, Clock, Paperclip } from "lucide-react";
import clsx from "clsx";
import { Avatar } from "../atoms/Avatar";
import { StatusBadge } from "../atoms/StatusBadge";
import { tones } from "../../theme/tones";
import type { RecordMeta, RecordStatus } from "./RecordCard";

export type RecordRowProps = {
  person?: { name: string; detail?: string };
  title: string;
  status: RecordStatus;
  place?: RecordMeta;
  dates?: { primary: string; secondary?: string };
  waiting?: string;
  documents?: number | null;
  accent?: boolean;
  onClick?: () => void;
  order?: number;
  className?: string;
};

const COLUMNS = {
  person: "md:grid-cols-[4px_minmax(0,16rem)_minmax(0,1fr)_10rem_8rem_8rem_auto]",
  personDocuments: "md:grid-cols-[4px_minmax(0,16rem)_minmax(0,1fr)_10rem_8rem_8rem_6rem_auto]",
  plain: "md:grid-cols-[4px_minmax(0,1fr)_10rem_8rem_8rem_auto]",
  documents: "md:grid-cols-[4px_minmax(0,1fr)_10rem_8rem_8rem_6rem_auto]",
};

const COLUMNS_WITHOUT_ACCENT = {
  person: "md:grid-cols-[minmax(0,16rem)_minmax(0,1fr)_10rem_8rem_8rem_auto]",
  personDocuments: "md:grid-cols-[minmax(0,16rem)_minmax(0,1fr)_10rem_8rem_8rem_6rem_auto]",
  plain: "md:grid-cols-[minmax(0,1fr)_10rem_8rem_8rem_auto]",
  documents: "md:grid-cols-[minmax(0,1fr)_10rem_8rem_8rem_6rem_auto]",
};

const LAYOUT = {
  accent: { grid: "grid-cols-[4px_minmax(0,1fr)_auto]", content: "col-start-2", end: "col-start-3" },
  plain: { grid: "grid-cols-[minmax(0,1fr)_auto]", content: "col-start-1", end: "col-start-2" },
};

function columnsOf(hasPerson: boolean, hasDocuments: boolean, accent: boolean): string {
  const columns = accent ? COLUMNS : COLUMNS_WITHOUT_ACCENT;
  if (hasPerson) return hasDocuments ? columns.personDocuments : columns.person;
  return hasDocuments ? columns.documents : columns.plain;
}

function Documents({ count }: { count: number | null }) {
  if (count === null) return null;
  if (count === 0) {
    return (
      <span className="text-sm text-gray-400 dark:text-gray-500">
        <span aria-hidden>—</span>
        <span className="sr-only">Sin documentos</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-200">
      <Paperclip size={14} aria-hidden className="shrink-0 text-gray-500 dark:text-gray-400" />
      {count}
      <span className="sr-only">{count === 1 ? " documento" : " documentos"}</span>
    </span>
  );
}

export const RecordRow = ({
  person,
  title,
  status,
  place,
  dates,
  waiting,
  documents,
  accent = true,
  onClick,
  order = 0,
  className,
}: RecordRowProps) => {
  const PlaceIcon = place?.icon;
  const layout = accent ? LAYOUT.accent : LAYOUT.plain;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      style={{ animationDelay: `${order * 50}ms` }}
      className={clsx(
        "group grid w-full items-center gap-x-4 gap-y-2 rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 motion-safe:animate-fade-up disabled:cursor-default enabled:cursor-pointer enabled:hover:border-brand-200 enabled:hover:bg-brand-50 enabled:hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:enabled:hover:bg-brand-500/10",
        layout.grid,
        columnsOf(person !== undefined, documents !== undefined, accent),
        className,
      )}
    >
      {accent && <span aria-hidden className={clsx("h-9 w-1 self-center rounded-full", tones[status.tone].solid)} />}
      {person && (
        <span className="flex min-w-0 items-center gap-3">
          <Avatar name={person.name} />
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate text-sm font-semibold text-gray-900 dark:text-gray-50">{person.name}</span>
            {person.detail && <span className="truncate text-xs text-gray-500 dark:text-gray-400">{person.detail}</span>}
          </span>
        </span>
      )}
      <span className={clsx(layout.content, "flex min-w-0 flex-col gap-0.5 md:col-start-auto")}>
        <span className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{title}</span>
        {place && PlaceIcon && (
          <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <PlaceIcon size={12} aria-hidden className="shrink-0" />
            <span className="truncate">{place.text}</span>
          </span>
        )}
      </span>
      <span className={clsx(layout.content, "flex min-w-0 flex-col gap-0.5 md:col-start-auto")}>
        {dates && (
          <>
            <span className="truncate text-sm font-medium text-gray-700 dark:text-gray-200">{dates.primary}</span>
            {dates.secondary && <span className="text-xs text-gray-500 dark:text-gray-400">{dates.secondary}</span>}
          </>
        )}
      </span>
      <span className={clsx(layout.content, "md:col-start-auto")}>
        {waiting && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium whitespace-nowrap text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <Clock size={12} aria-hidden />
            {waiting}
          </span>
        )}
      </span>
      <span className={clsx(layout.content, "md:col-start-auto")}>
        <StatusBadge label={status.label} tone={status.tone} />
      </span>
      {documents !== undefined && (
        <span className={clsx(layout.content, "md:col-start-auto")}>
          <Documents count={documents} />
        </span>
      )}
      <span className={clsx(layout.end, "row-start-1 md:col-start-auto md:row-start-auto")}>
        {onClick && (
          <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-50 text-gray-400 transition-colors group-hover:bg-brand-600 group-hover:text-white dark:bg-slate-800">
            <ChevronRight size={16} aria-hidden className="transition-transform group-hover:translate-x-0.5" />
          </span>
        )}
      </span>
    </button>
  );
};
