import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";
import clsx from "clsx";
import { colors } from "../../theme/colors";
import type { FieldState } from "../atoms/Input";

export type SelectOptionItem = {
  value: string;
  label: string;
  code?: string;
  disabled?: boolean;
};

export type SelectProps = {
  options: SelectOptionItem[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  emptyText?: string;
  state?: FieldState;
  disabled?: boolean;
  id?: string;
  name?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
  "aria-required"?: boolean;
  className?: string;
};

type MenuPosition = { top: number; left: number; width: number };

const MENU_GAP = 6;

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

function matches(option: SelectOptionItem, query: string): boolean {
  const needle = normalize(query.trim());
  return normalize(option.label).includes(needle) || normalize(option.code ?? "").startsWith(needle);
}

function nextEnabled(options: SelectOptionItem[], from: number, step: 1 | -1): number {
  for (let index = from + step; index >= 0 && index < options.length; index += step) {
    if (!options[index].disabled) return index;
  }
  return from;
}

export const Select = ({
  options,
  value,
  onChange,
  placeholder = "Seleccionar…",
  searchable = false,
  emptyText = "Sin resultados",
  state = "default",
  disabled = false,
  id,
  name,
  className,
  ...aria
}: SelectProps) => {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const listboxId = `${controlId}-listbox`;
  const optionId = (index: number) => `${controlId}-option-${index}`;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [position, setPosition] = useState<MenuPosition>({ top: 0, left: 0, width: 0 });
  const wrapperRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  const selected = options.find((option) => option.value === value) ?? null;
  const visible = searchable && query ? options.filter((option) => matches(option, query)) : options;

  const openMenu = () => {
    if (disabled || open) return;
    const selectedIndex = options.findIndex((option) => option.value === value);
    setQuery("");
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : nextEnabled(options, -1, 1));
    setOpen(true);
  };

  const closeMenu = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActiveIndex(-1);
  }, []);

  const choose = (index: number) => {
    const option = visible[index];
    if (!option || option.disabled) return;
    onChange(option.value);
    closeMenu();
  };

  const place = useCallback(() => {
    const wrapper = wrapperRef.current;
    const menu = menuRef.current;
    if (!wrapper || !menu) return;
    const rect = wrapper.getBoundingClientRect();
    const menuHeight = menu.offsetHeight;
    const below = window.innerHeight - rect.bottom;
    const flip = below < menuHeight + MENU_GAP && rect.top > below;
    setPosition({
      top: flip ? rect.top - menuHeight - MENU_GAP : rect.bottom + MENU_GAP,
      left: rect.left,
      width: rect.width,
    });
  }, []);

  useLayoutEffect(() => {
    if (open) place();
  }, [open, place, visible.length]);

  useEffect(() => {
    if (!open) return;
    const handlePointer = (event: MouseEvent) => {
      const target = event.target as Node;
      if (wrapperRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      closeMenu();
    };
    document.addEventListener("mousedown", handlePointer);
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [open, place, closeMenu]);

  useEffect(() => {
    if (!open || activeIndex < 0) return;
    document.getElementById(`${controlId}-option-${activeIndex}`)?.scrollIntoView?.({ block: "nearest" });
  }, [open, activeIndex, controlId]);

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const last = visible.length - 1;
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (!open) openMenu();
        else setActiveIndex(nextEnabled(visible, activeIndex, 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        if (!open) openMenu();
        else setActiveIndex(nextEnabled(visible, activeIndex, -1));
        break;
      case "Home":
        if (!open) return;
        event.preventDefault();
        setActiveIndex(nextEnabled(visible, -1, 1));
        break;
      case "End":
        if (!open) return;
        event.preventDefault();
        setActiveIndex(nextEnabled(visible, last + 1, -1));
        break;
      case "Enter":
        event.preventDefault();
        if (open) choose(activeIndex);
        else openMenu();
        break;
      case " ":
        if (searchable) return;
        event.preventDefault();
        if (open) choose(activeIndex);
        else openMenu();
        break;
      case "Escape":
        if (!open) return;
        event.preventDefault();
        closeMenu();
        break;
      case "Tab":
        if (open) closeMenu();
        break;
    }
  };

  const toggle = () => {
    if (open) closeMenu();
    else openMenu();
  };

  const controlClass = clsx(
    "h-10 w-full pr-10 pl-3.5 text-left text-base",
    colors.field.base,
    state === "error" ? colors.field.error : colors.field.idle,
    open && state !== "error" && "border-brand-600 shadow-focus",
    disabled ? "cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-slate-800" : "cursor-pointer",
  );

  const comboboxProps = {
    id: controlId,
    role: "combobox" as const,
    "aria-expanded": open,
    "aria-controls": listboxId,
    "aria-haspopup": "listbox" as const,
    "aria-activedescendant": open && activeIndex >= 0 ? optionId(activeIndex) : undefined,
    "aria-invalid": state === "error" || undefined,
    disabled,
    onKeyDown: handleKeyDown,
    ...aria,
  };

  const handleQuery = (text: string) => {
    if (!open) openMenu();
    setQuery(text);
    setActiveIndex(text ? 0 : -1);
  };

  return (
    <div ref={wrapperRef} className={clsx("relative w-full", className)}>
      {searchable ? (
        <input
          {...comboboxProps}
          type="text"
          autoComplete="off"
          aria-autocomplete="list"
          value={open ? query : (selected?.label ?? "")}
          placeholder={selected?.label ?? placeholder}
          onChange={(event) => handleQuery(event.target.value)}
          onFocus={(event) => event.target.select()}
          onClick={openMenu}
          className={clsx(controlClass, "cursor-text placeholder:text-gray-400")}
        />
      ) : (
        <button {...comboboxProps} type="button" onClick={toggle} className={controlClass}>
          <span className={clsx("block truncate", !selected && "text-gray-400 dark:text-gray-500")}>
            {selected?.label ?? placeholder}
          </span>
        </button>
      )}
      <ChevronDown
        size={16}
        aria-hidden
        className={clsx(
          "pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 transition-transform duration-200",
          open && "rotate-180",
        )}
      />
      {name && <input type="hidden" name={name} value={value ?? ""} />}
      {open &&
        createPortal(
          <ul
            ref={menuRef}
            id={listboxId}
            role="listbox"
            style={{ position: "fixed", top: position.top, left: position.left, width: position.width }}
            className="z-[70] flex max-h-60 flex-col gap-0.5 overflow-y-auto rounded-xl border border-gray-300 bg-white p-1.5 shadow-lg motion-safe:animate-pop-in dark:border-slate-700 dark:bg-slate-900"
          >
            {visible.length === 0 && <li className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">{emptyText}</li>}
            {visible.map((option, index) => {
              const isSelected = option.value === value;
              return (
                <li
                  key={option.value}
                  id={optionId(index)}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={option.disabled || undefined}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => choose(index)}
                  className={clsx(
                    "flex items-center gap-2.5 rounded-[10px] px-3 py-2 text-sm text-gray-700 transition-colors dark:text-gray-200",
                    index === activeIndex && "bg-brand-50 dark:bg-brand-500/15",
                    isSelected && "font-semibold",
                    option.disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                  )}
                >
                  {option.code && (
                    <span className="inline-flex w-8 shrink-0 justify-center rounded-md bg-slate-100 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      {option.code}
                    </span>
                  )}
                  <span className="flex-1 truncate">{option.label}</span>
                  {isSelected && <Check size={16} aria-hidden className="shrink-0 text-brand-600 dark:text-brand-300" />}
                </li>
              );
            })}
          </ul>,
          document.body,
        )}
    </div>
  );
};
