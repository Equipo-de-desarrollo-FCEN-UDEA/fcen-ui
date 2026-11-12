import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
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

type CompactMenuProps = {
  label: string;
  value: number;
  options: number[];
  onChange: (value: number) => void;
  tone: "neutral" | "brand";
};

const VISIBLE_OPTIONS = 5;
const OPTION_HEIGHT = 32;
const MENU_PADDING = 6;

function formatCount(value: number): string {
  return value.toLocaleString("es-CO");
}

function CompactMenu({ label, value, options, onChange, tone }: CompactMenuProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [below, setBelow] = useState(false);
  const wrapper = useRef<HTMLSpanElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const selectedIndex = Math.max(0, options.indexOf(value));
  const last = options.length - 1;

  const menuHeight = Math.min(options.length, VISIBLE_OPTIONS) * OPTION_HEIGHT + MENU_PADDING * 2;

  const openMenu = () => {
    const top = wrapper.current?.getBoundingClientRect().top ?? 0;
    setBelow(top < menuHeight + MENU_PADDING);
    setActive(selectedIndex);
    setOpen(true);
  };
  const choose = (index: number) => {
    setOpen(false);
    if (options[index] !== value) onChange(options[index]);
  };

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: MouseEvent) => {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", closeOutside);
    return () => document.removeEventListener("mousedown", closeOutside);
  }, [open]);

  useLayoutEffect(() => {
    if (open && list.current) {
      list.current.scrollTop = (selectedIndex - Math.floor(VISIBLE_OPTIONS / 2)) * OPTION_HEIGHT;
    }
  }, [open, selectedIndex]);

  useEffect(() => {
    if (open) document.getElementById(`${id}-${active}`)?.scrollIntoView?.({ block: "nearest" });
  }, [open, active, id]);

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Escape" || event.key === "Tab") {
      setOpen(false);
      return;
    }
    if (!["ArrowDown", "ArrowUp", "Home", "End", "Enter", " "].includes(event.key)) return;
    event.preventDefault();
    if (!open) {
      openMenu();
      return;
    }
    if (event.key === "ArrowDown") setActive(Math.min(active + 1, last));
    if (event.key === "ArrowUp") setActive(Math.max(active - 1, 0));
    if (event.key === "Home") setActive(0);
    if (event.key === "End") setActive(last);
    if (event.key === "Enter" || event.key === " ") choose(active);
  };

  return (
    <span ref={wrapper} className="relative inline-flex">
      <button
        type="button"
        role="combobox"
        aria-label={label}
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-haspopup="listbox"
        aria-activedescendant={open ? `${id}-${active}` : undefined}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onKeyDown}
        className={clsx(
          "h-8 cursor-pointer rounded-md border bg-white pr-7 pl-2 text-left text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 dark:bg-slate-800",
          tone === "brand"
            ? "border-brand-200 text-brand-900 dark:border-slate-700 dark:text-white"
            : "border-gray-300 text-gray-500 dark:border-slate-700 dark:text-gray-300",
        )}
      >
        {formatCount(value)}
      </button>
      <ChevronDown
        size={12}
        aria-hidden
        className={clsx(
          "pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-gray-400 transition-transform",
          open && "rotate-180",
        )}
      />
      {open && (
        <ul
          ref={list}
          id={`${id}-list`}
          role="listbox"
          aria-label={label}
          style={{ maxHeight: menuHeight }}
          className={clsx(
            "absolute left-0 z-[70] min-w-full overflow-y-auto rounded-xl border border-gray-300 bg-white p-1.5 shadow-lg motion-safe:animate-pop-in dark:border-slate-700 dark:bg-slate-900",
            below ? "top-full mt-1.5" : "bottom-full mb-1.5",
          )}
        >
          {options.map((option, index) => (
            <li
              key={option}
              id={`${id}-${index}`}
              role="option"
              aria-selected={option === value}
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => setActive(index)}
              onClick={() => choose(index)}
              className={clsx(
                "flex h-8 cursor-pointer items-center justify-center rounded-lg px-3 text-sm text-gray-700 dark:text-gray-200",
                index === active && "bg-brand-50 dark:bg-brand-500/15",
                option === value && "font-semibold text-brand-800 dark:text-brand-200",
              )}
            >
              {formatCount(option)}
            </li>
          ))}
        </ul>
      )}
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

  const changeSize = (size: number) => onPageSizeChange?.(size);
  const previous = () => onPageChange(page - 1);
  const next = () => onPageChange(page + 1);

  return (
    <nav aria-label="Paginación" className={clsx("flex flex-col items-center justify-between gap-4 sm:flex-row", className)}>
      <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
        <span>
          Mostrando {formatCount(first)}–{formatCount(last)} de {formatCount(total)}
        </span>
        {onPageSizeChange && (
          <>
            <span aria-hidden className="text-gray-400">
              •
            </span>
            <span>Por página</span>
            <CompactMenu label="Por página" value={pageSize} options={pageSizeOptions} onChange={changeSize} tone="neutral" />
          </>
        )}
      </div>
      <div className="flex items-center gap-3 text-sm text-brand-800 dark:text-gray-300">
        <span>Página</span>
        <CompactMenu label="Página" value={page} options={pages} onChange={onPageChange} tone="brand" />
        <span>de {formatCount(totalPages)}</span>
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
