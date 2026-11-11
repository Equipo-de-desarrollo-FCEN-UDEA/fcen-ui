import { ChevronRight, Clock, Paperclip } from "lucide-react";
import clsx from "clsx";
import { Avatar } from "../atoms/Avatar";
import { StatusBadge } from "../atoms/StatusBadge";
import { tones } from "../../theme/tones";
import type { RecordMeta, RecordStatus } from "./RecordCard";
import { cardColumns, columnsStyle, COLUMNS_CLASS, tableColumns } from "./recordColumns";

export type RecordRowVariant = "card" | "table";

export type RecordRowProps = {
  person?: { name: string; detail?: string };
  title: string;
  status: RecordStatus;
  place?: RecordMeta;
  dates?: { primary: string; secondary?: string };
  waiting?: string;
  documents?: number | null;
  variant?: RecordRowVariant;
  striped?: boolean;
  muted?: boolean;
  onClick?: () => void;
  order?: number;
  className?: string;
};

function Documents({ count }: { count: number | null }) {
  if (count === null) return <span aria-hidden />;
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

function TableRow({
  person,
  title,
  status,
  place,
  dates,
  waiting,
  documents,
  striped = false,
  muted = false,
  onClick,
  order = 0,
  className,
}: RecordRowProps) {
  const columns = tableColumns({
    person: person !== undefined,
    waiting: waiting !== undefined,
    documents: documents !== undefined,
  });

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      style={{ animationDelay: `${order * 50}ms`, ...columnsStyle(columns) }}
      className={clsx(
        "grid w-full grid-cols-1 items-center gap-x-4 gap-y-2 border-b border-gray-100 px-6 py-3.5 text-left transition-colors motion-safe:animate-fade-up focus:outline-none focus-visible:bg-brand-50 disabled:cursor-default enabled:cursor-pointer enabled:hover:bg-brand-50 dark:border-slate-800 dark:focus-visible:bg-brand-500/10 dark:enabled:hover:bg-brand-500/10",
        COLUMNS_CLASS,
        striped ? "bg-slate-50 dark:bg-slate-800/40" : "bg-white dark:bg-slate-900",
        className,
      )}
    >
      {person && (
        <span className="flex min-w-0 items-center gap-2.5">
          <Avatar name={person.name} />
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{person.name}</span>
            {person.detail && <span className="truncate text-xs text-gray-500 dark:text-gray-400">{person.detail}</span>}
          </span>
        </span>
      )}
      <span
        className={clsx(
          "flex min-w-0 flex-col gap-0.5",
          muted ? "text-gray-500 dark:text-gray-400" : "text-gray-900 dark:text-gray-100",
        )}
      >
        <span className="truncate text-sm font-semibold">{title}</span>
        {place && <span className="truncate text-xs text-gray-500 dark:text-gray-400">{place.text}</span>}
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        {dates && (
          <>
            <span className="text-sm text-gray-700 dark:text-gray-300">{dates.primary}</span>
            {dates.secondary && <span className="text-xs text-gray-500 dark:text-gray-400">{dates.secondary}</span>}
          </>
        )}
      </span>
      {waiting !== undefined && <span className="text-xs text-gray-500 dark:text-gray-400">{waiting}</span>}
      <span>
        <StatusBadge label={status.label} tone={status.tone} />
      </span>
      {documents !== undefined && <Documents count={documents} />}
    </button>
  );
}

function CardRow({ person, title, status, place, dates, waiting, documents, onClick, order = 0, className }: RecordRowProps) {
  const PlaceIcon = place?.icon;
  const columns = cardColumns({ person: person !== undefined, documents: documents !== undefined });

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      style={{ animationDelay: `${order * 50}ms`, ...columnsStyle(columns) }}
      className={clsx(
        "group grid w-full grid-cols-[4px_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 motion-safe:animate-fade-up disabled:cursor-default enabled:cursor-pointer enabled:hover:border-brand-200 enabled:hover:bg-brand-50 enabled:hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:enabled:hover:bg-brand-500/10",
        COLUMNS_CLASS,
        className,
      )}
    >
      <span aria-hidden className={clsx("h-9 w-1 self-center rounded-full", tones[status.tone].solid)} />
      {person && (
        <span className="flex min-w-0 items-center gap-3">
          <Avatar name={person.name} />
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate text-sm font-semibold text-gray-900 dark:text-gray-50">{person.name}</span>
            {person.detail && <span className="truncate text-xs text-gray-500 dark:text-gray-400">{person.detail}</span>}
          </span>
        </span>
      )}
      <span className="col-start-2 flex min-w-0 flex-col gap-0.5 md:col-start-auto">
        <span className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{title}</span>
        {place && PlaceIcon && (
          <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <PlaceIcon size={12} aria-hidden className="shrink-0" />
            <span className="truncate">{place.text}</span>
          </span>
        )}
      </span>
      <span className="col-start-2 flex min-w-0 flex-col gap-0.5 md:col-start-auto">
        {dates && (
          <>
            <span className="truncate text-sm font-medium text-gray-700 dark:text-gray-200">{dates.primary}</span>
            {dates.secondary && <span className="text-xs text-gray-500 dark:text-gray-400">{dates.secondary}</span>}
          </>
        )}
      </span>
      <span className="col-start-2 md:col-start-auto">
        {waiting && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium whitespace-nowrap text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <Clock size={12} aria-hidden />
            {waiting}
          </span>
        )}
      </span>
      <span className="col-start-2 md:col-start-auto">
        <StatusBadge label={status.label} tone={status.tone} />
      </span>
      {documents !== undefined && (
        <span className="col-start-2 md:col-start-auto">
          <Documents count={documents} />
        </span>
      )}
      <span className="col-start-3 row-start-1 md:col-start-auto md:row-start-auto">
        {onClick && (
          <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-50 text-gray-400 transition-colors group-hover:bg-brand-600 group-hover:text-white dark:bg-slate-800">
            <ChevronRight size={16} aria-hidden className="transition-transform group-hover:translate-x-0.5" />
          </span>
        )}
      </span>
    </button>
  );
}

export const RecordRow = ({ variant = "card", ...props }: RecordRowProps) =>
  variant === "table" ? <TableRow {...props} /> : <CardRow {...props} />;
