import type { CSSProperties, ReactNode } from "react";
import clsx from "clsx";

export type TableColumn = {
  label: string;
  width?: string;
  align?: "start" | "center";
};

export type TableProps = {
  columns: TableColumn[];
  children: ReactNode;
  className?: string;
};

export type TableRowProps = {
  children: ReactNode;
  onClick?: () => void;
  order?: number;
  className?: string;
};

const COLUMNS_CLASS = "@5xl:grid-cols-(--table-columns)";

const CENTERED_CELLS = [
  "@5xl:[&>*>:nth-child(1)]:justify-self-center",
  "@5xl:[&>*>:nth-child(2)]:justify-self-center",
  "@5xl:[&>*>:nth-child(3)]:justify-self-center",
  "@5xl:[&>*>:nth-child(4)]:justify-self-center",
  "@5xl:[&>*>:nth-child(5)]:justify-self-center",
  "@5xl:[&>*>:nth-child(6)]:justify-self-center",
  "@5xl:[&>*>:nth-child(7)]:justify-self-center",
  "@5xl:[&>*>:nth-child(8)]:justify-self-center",
  "@5xl:[&>*>:nth-child(9)]:justify-self-center",
  "@5xl:[&>*>:nth-child(10)]:justify-self-center",
];

function centeredCells(columns: TableColumn[]): string[] {
  return columns.flatMap((column, index) => (column.align === "center" ? [CENTERED_CELLS[index]] : []));
}

function templateOf(columns: TableColumn[]): CSSProperties {
  const template = columns.map((column) => column.width ?? "minmax(0,1fr)").join(" ");
  return { "--table-columns": template } as CSSProperties;
}

export const Table = ({ columns, children, className }: TableProps) => (
  <div
    style={templateOf(columns)}
    className={clsx(
      "@container overflow-hidden rounded-[20px] border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900",
      className,
    )}
  >
    <div
      aria-hidden
      className={clsx(
        "hidden gap-x-4 border-b border-gray-200 bg-gray-50 px-6 py-3 text-xs font-semibold tracking-[0.3px] text-gray-500 uppercase @5xl:grid dark:border-slate-800 dark:bg-slate-800/60 dark:text-gray-400",
        COLUMNS_CLASS,
      )}
    >
      {columns.map((column) => (
        <span key={column.label} className={clsx(column.align === "center" && "justify-self-center")}>
          {column.label}
        </span>
      ))}
    </div>
    <div className={clsx(centeredCells(columns))}>{children}</div>
  </div>
);

export const TableRow = ({ children, onClick, order = 0, className }: TableRowProps) => {
  const style = { animationDelay: `${order * 50}ms` };
  const classes = clsx(
    "flex w-full flex-wrap items-center gap-x-4 gap-y-2 border-b border-gray-100 px-6 py-3.5 text-left motion-safe:animate-fade-up even:bg-slate-50 @5xl:grid dark:border-slate-800 dark:even:bg-slate-800/40",
    COLUMNS_CLASS,
    onClick &&
      "cursor-pointer transition-colors hover:bg-brand-50 focus:outline-none focus-visible:bg-brand-50 dark:hover:bg-brand-500/10 dark:focus-visible:bg-brand-500/10",
    className,
  );

  if (!onClick) {
    return (
      <div style={style} className={classes}>
        {children}
      </div>
    );
  }
  return (
    <button type="button" onClick={onClick} style={style} className={classes}>
      {children}
    </button>
  );
};
