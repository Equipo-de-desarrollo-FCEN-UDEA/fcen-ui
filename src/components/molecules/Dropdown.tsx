import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronRight, LoaderCircle } from "lucide-react";
import clsx from "clsx";
import { Button } from "../atoms/Button";

export type DropdownOption<T = string> = {
  label: string;
  value: T;
  children?: DropdownOption<T>[];
  expandable?: boolean;
};

export type DropdownProps<T> = {
  title: string;
  options: DropdownOption<T>[];
  onSelect: (value: T, option?: DropdownOption<T>) => void;
  onExpand?: (value: T) => void;
  loadingId?: T | null;
  disabled?: boolean;
  maxVisibleOptions?: number;
  className?: string;
  emptyText?: string;
};

export const Dropdown = <T,>({
  title,
  options,
  onSelect,
  onExpand,
  loadingId,
  disabled = false,
  maxVisibleOptions,
  className,
  emptyText = "Sin datos disponibles",
}: DropdownProps<T>) => {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: MouseEvent) => {
      if (!container.current?.contains(event.target as Node)) {
        setOpen(false);
        setExpanded(new Set());
      }
    };
    document.addEventListener("mousedown", closeOutside);
    return () => document.removeEventListener("mousedown", closeOutside);
  }, [open]);

  const select = (option: DropdownOption<T>) => {
    onSelect(option.value, option);
    setOpen(false);
    setExpanded(new Set());
  };

  const renderOptions = (items: DropdownOption<T>[], parentPath = "") =>
    items.map((option, index) => {
      const path = `${parentPath}${index}`;
      const children = option.children ?? [];
      const canExpand = children.length > 0 || Boolean(option.expandable);
      const isExpanded = expanded.has(path);
      const isLoading = loadingId === option.value;
      return (
        <li key={path} role="none" className="min-w-0">
          <div className={clsx("flex items-center rounded-lg", isExpanded ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300" : "text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-slate-800")}>
            <button
              type="button"
              role="menuitem"
              onClick={() => select(option)}
              className="min-w-0 flex-1 break-words rounded-lg px-3 py-2 text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
            >
              {option.label}
            </button>
            {canExpand && (
              <button
                type="button"
                aria-label={`${isExpanded ? "Ocultar" : "Ver"} subunidades de ${option.label}`}
                aria-expanded={isExpanded}
                onClick={() => {
                  if (children.length === 0) onExpand?.(option.value);
                  setExpanded((previous) => {
                    const next = new Set(previous);
                    if (next.has(path)) next.delete(path);
                    else next.add(path);
                    return next;
                  });
                }}
                className="mr-1 grid h-8 w-8 shrink-0 place-items-center rounded-md text-gray-500 hover:bg-white hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-brand-300"
              >
                {isLoading ? <LoaderCircle size={14} aria-hidden className="animate-spin" /> : <ChevronRight size={14} aria-hidden className={clsx("transition-transform", isExpanded && "rotate-90")} />}
              </button>
            )}
          </div>
          {isExpanded && children.length > 0 && (
            <ul role="group" className="mb-1 ml-4 mt-1 border-l border-brand-200 pl-2 dark:border-brand-500/30">
              {renderOptions(children, `${path}.`)}
            </ul>
          )}
        </li>
      );
    });

  return (
    <div ref={container} className={clsx("relative w-full text-left", className)}>
      <Button
        label={title}
        variant="outline"
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="h-10 w-full justify-between border-gray-300 font-medium shadow-sm dark:border-slate-700"
        iconRight={<ChevronDown size={16} aria-hidden className={clsx("transition-transform", open && "rotate-180")} />}
      />
      {open && !disabled && (
        <ul
          role="menu"
          aria-label={title}
          style={{ maxHeight: maxVisibleOptions ? `${Math.max(maxVisibleOptions, 1) * 2.5}rem` : undefined }}
          className="absolute left-0 z-[100] mt-1 w-full min-w-full overflow-y-auto rounded-xl border border-gray-200 bg-white p-1 shadow-xl dark:border-slate-700 dark:bg-slate-900"
        >
          {options.length === 0 ? (
            <li role="presentation" className="px-4 py-3 text-center text-sm italic text-gray-500 dark:text-gray-400">{emptyText}</li>
          ) : renderOptions(options)}
        </ul>
      )}
    </div>
  );
};
