import type { CSSProperties, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import clsx from "clsx";
import { EmptyState } from "../molecules/EmptyState";

export type DataTableColumn<T> = {
  key: keyof T | string;
  header: string;
  width?: string;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  render?: (row: T) => ReactNode;
};

export type DataTableProps<T> = {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  columns: DataTableColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: LucideIcon;
  sortBy?: string | null;
  sortDir?: "asc" | "desc" | null;
  onSort?: (key: string) => void;
  rowKey?: (row: T, index: number) => string | number;
  rowActions?: (row: T) => ReactNode;
  className?: string;
};

const alignClass = (align?: DataTableColumn<unknown>["align"]) =>
  align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";

export function DataTable<T>({
  title,
  subtitle,
  actions,
  columns,
  data,
  loading = false,
  emptyMessage = "Sin registros",
  emptyIcon = Inbox,
  sortBy = null,
  sortDir = null,
  onSort,
  rowKey,
  rowActions,
  className,
}: DataTableProps<T>) {
  const actionColumnCount = rowActions ? 1 : 0;
  const columnCount = columns.length + actionColumnCount;
  const tableTitle = title ?? "Datos";

  return (
    <div className={clsx("rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900", className)}>
      {(title || subtitle || actions) && (
        <div className="flex items-center justify-between border-b border-gray-100 p-4 dark:border-slate-700">
          <div>
            {title && <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</h2>}
            {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
          </div>
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full table-fixed">
          <caption className="sr-only">{tableTitle}</caption>
          <thead className="bg-gray-50 dark:bg-slate-800">
            <tr>
              {columns.map((column) => {
                const direction = sortBy === String(column.key) ? sortDir : null;
                const ariaSort = direction === "asc" ? "ascending" : direction === "desc" ? "descending" : "none";
                return (
                  <th
                    key={String(column.key)}
                    scope="col"
                    aria-sort={column.sortable && onSort ? ariaSort : undefined}
                    className={clsx("border-b border-gray-200 px-4 py-3 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:border-slate-700 dark:text-gray-400", alignClass(column.align))}
                    style={{ width: column.width } as CSSProperties}
                  >
                    {column.sortable && onSort ? (
                      <button
                        type="button"
                        onClick={() => onSort(String(column.key))}
                        className="inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
                      >
                        <span>{column.header}</span>
                        <span aria-hidden className="text-xs text-gray-400 dark:text-gray-500">
                          {direction === "asc" ? "▲" : direction === "desc" ? "▼" : "↕"}
                        </span>
                      </button>
                    ) : column.header}
                  </th>
                );
              })}
              {rowActions && <th scope="col" className="border-b border-gray-200 px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:border-slate-700 dark:text-gray-400">Acciones</th>}
            </tr>
          </thead>
          <tbody aria-busy={loading || undefined}>
            {loading ? (
              Array.from({ length: 5 }, (_, row) => (
                <tr key={`skeleton-${row}`} aria-hidden>
                  {Array.from({ length: columnCount }, (_, column) => (
                    <td key={column} className="px-4 py-4">
                      <span
                        className="block h-3.5 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800"
                        style={{ animationDelay: `${(row + column) * 60}ms` }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columnCount}>
                  <EmptyState title={emptyMessage} icon={emptyIcon} compact />
                </td>
              </tr>
            ) : data.map((row, index) => (
              <tr
                key={rowKey ? rowKey(row, index) : index}
                className="border-b border-gray-100 transition-colors last:border-0 odd:bg-white even:bg-gray-50/40 hover:bg-brand-50/60 dark:border-slate-800 dark:odd:bg-slate-900 dark:even:bg-slate-800/20 dark:hover:bg-slate-800/70"
              >
                {columns.map((column) => (
                  <td key={String(column.key)} className={clsx("px-4 py-3 text-sm text-gray-700 dark:text-gray-300", alignClass(column.align))}>
                    {column.render
                      ? column.render(row)
                      : String(row[column.key as keyof T] ?? "")}
                  </td>
                ))}
                {rowActions && <td className="px-4 py-3 text-right text-sm text-gray-700 dark:text-gray-300"><div className="flex justify-end gap-2">{rowActions(row)}</div></td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
