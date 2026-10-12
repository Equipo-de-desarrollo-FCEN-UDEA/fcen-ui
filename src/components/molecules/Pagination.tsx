import type { ChangeEvent } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";
import { Button } from "../atoms/Button";

export type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  pageSizeOptions?: number[];
  onPageSizeChange?: (pageSize: number) => void;
  className?: string;
};

type CompactSelectProps = {
  label: string;
  value: number;
  options: number[];
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  tone: "neutral" | "brand";
};

function CompactSelect({ label, value, options, onChange, tone }: CompactSelectProps) {
  return (
    <span className="relative inline-flex">
      <select
        aria-label={label}
        value={String(value)}
        onChange={onChange}
        className={clsx(
          "h-8 cursor-pointer appearance-none rounded-md border bg-white pr-7 pl-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 dark:bg-slate-800",
          tone === "brand"
            ? "border-brand-200 text-brand-900 dark:border-slate-700 dark:text-white"
            : "border-gray-300 text-gray-500 dark:border-slate-700 dark:text-gray-300",
        )}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown
        size={12}
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-gray-400"
      />
    </span>
  );
}

export const Pagination = ({
  page,
  pageSize,
  total,
  onPageChange,
  pageSizeOptions = [10, 20, 50],
  onPageSizeChange,
  className,
}: PaginationProps) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  const changePage = (event: ChangeEvent<HTMLSelectElement>) => onPageChange(Number(event.target.value));
  const changeSize = (event: ChangeEvent<HTMLSelectElement>) => onPageSizeChange?.(Number(event.target.value));
  const previous = () => onPageChange(page - 1);
  const next = () => onPageChange(page + 1);

  return (
    <nav aria-label="Paginación" className={clsx("flex flex-col items-center justify-between gap-4 sm:flex-row", className)}>
      <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
        <span>
          Mostrando {first}–{last} de {total}
        </span>
        {onPageSizeChange && (
          <>
            <span aria-hidden className="text-gray-400">
              •
            </span>
            <span>Por página</span>
            <CompactSelect label="Por página" value={pageSize} options={pageSizeOptions} onChange={changeSize} tone="neutral" />
          </>
        )}
      </div>
      <div className="flex items-center gap-3 text-sm text-brand-800 dark:text-gray-300">
        <span>Página</span>
        <CompactSelect label="Página" value={page} options={pages} onChange={changePage} tone="brand" />
        <span>de {totalPages}</span>
        <Button
          label="Anterior"
          variant="secondary"
          size="sm"
          onClick={previous}
          disabled={page <= 1}
          iconLeft={<ChevronLeft size={16} aria-hidden />}
        />
        <Button
          label="Siguiente"
          variant="secondary"
          size="sm"
          onClick={next}
          disabled={page >= totalPages}
          iconRight={<ChevronRight size={16} aria-hidden />}
        />
      </div>
    </nav>
  );
};
