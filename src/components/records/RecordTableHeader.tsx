import clsx from "clsx";
import { columnsStyle, COLUMNS_CLASS, tableColumns } from "./recordColumns";

export type RecordTableHeaderProps = {
  labels: {
    person?: string;
    title: string;
    dates: string;
    waiting?: string;
    status: string;
    documents?: string;
  };
  className?: string;
};

export const RecordTableHeader = ({ labels, className }: RecordTableHeaderProps) => {
  const columns = tableColumns({
    person: labels.person !== undefined,
    waiting: labels.waiting !== undefined,
    documents: labels.documents !== undefined,
  });

  return (
    <div
      aria-hidden
      style={columnsStyle(columns)}
      className={clsx(
        "hidden gap-x-4 border-b border-gray-200 bg-gray-50 px-6 py-3 text-xs font-semibold tracking-[0.3px] text-gray-500 uppercase md:grid dark:border-slate-800 dark:bg-slate-800/60 dark:text-gray-400",
        COLUMNS_CLASS,
        className,
      )}
    >
      {labels.person !== undefined && <span>{labels.person}</span>}
      <span>{labels.title}</span>
      <span>{labels.dates}</span>
      {labels.waiting !== undefined && <span>{labels.waiting}</span>}
      <span>{labels.status}</span>
      {labels.documents !== undefined && <span>{labels.documents}</span>}
    </div>
  );
};
