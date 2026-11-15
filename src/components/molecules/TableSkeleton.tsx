import clsx from "clsx";

export type TableSkeletonProps = {
  rows?: number;
  columns?: number;
  className?: string;
};

export const TableSkeleton = ({ rows = 5, columns = 4, className }: TableSkeletonProps) => (
  <div
    className={clsx("w-full overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900", className)}
    role="status"
    aria-busy="true"
    aria-label="Cargando tabla"
  >
    <div className="flex gap-4 border-b border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-700 dark:bg-slate-800/70">
      {Array.from({ length: Math.max(0, columns) }, (_, column) => (
        <span key={column} className="h-3 flex-1 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
      ))}
    </div>
    {Array.from({ length: Math.max(0, rows) }, (_, row) => (
      <div key={row} className="flex gap-4 border-b border-slate-100 px-6 py-5 last:border-b-0 dark:border-slate-800">
        {Array.from({ length: Math.max(0, columns) }, (_, column) => (
          <span
            key={column}
            className="h-3.5 flex-1 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800"
            style={{ animationDelay: `${(row + column) * 60}ms` }}
          />
        ))}
      </div>
    ))}
  </div>
);
