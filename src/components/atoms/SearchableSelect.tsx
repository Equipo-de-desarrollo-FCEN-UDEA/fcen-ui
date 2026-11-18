import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";
import clsx from "clsx";
import { Button } from "./Button";
import { colors } from "../../theme/colors";

export type SearchableSelectState = "default" | "error" | "success";
export type SearchableSelectSize = "sm" | "md" | "lg";
export type SearchableSelectVariant = "default" | "outline";

export type SearchableSelectOption = {
  value: string;
  label: string;
  icon?: ReactNode;
  selectedLabel?: string;
};

export type SearchableSelectProps = {
  options: SearchableSelectOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  state?: SearchableSelectState;
  size?: SearchableSelectSize;
  variant?: SearchableSelectVariant;
  placeholder?: string;
  helperText?: string;
  disabled?: boolean;
  dropdownMinWidth?: number;
  className?: string;
  inputClassName?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
};

type MenuPosition = { top: number; left: number; width: number };

const sizeClasses: Record<SearchableSelectSize, string> = {
  sm: "h-9 text-sm",
  md: "h-10 text-base",
  lg: "h-12 text-lg",
};

const normalize = (text: string) =>
  text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[-.,()]/g, "");

export const SearchableSelect = ({
  options,
  value,
  onChange,
  label,
  state = "default",
  size = "md",
  variant = "default",
  placeholder = "Buscar...",
  helperText,
  disabled = false,
  dropdownMinWidth = 0,
  className,
  inputClassName,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedBy,
}: SearchableSelectProps) => {
  const id = useId();
  const helperId = useId();
  const listboxId = `${id}-listbox`;
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [position, setPosition] = useState<MenuPosition>({ top: 0, left: 0, width: 0 });
  const selected = options.find((option) => option.value === value);
  const stateClass = state === "error" ? colors.field.error : state === "success" ? colors.field.success : colors.field.idle;
  const describedBy = [ariaDescribedBy, helperText ? helperId : undefined].filter(Boolean).join(" ") || undefined;
  const queryWords = normalize(query).split(/\s+/).filter(Boolean);
  const visible = options
    .filter((option) => queryWords.every((word) => normalize(option.label).includes(word)))
    .sort((a, b) => Number(!normalize(a.label).startsWith(normalize(query))) -
      Number(!normalize(b.label).startsWith(normalize(query))));

  const close = () => {
    setOpen(false);
    setQuery("");
  };
  const choose = (option: SearchableSelectOption) => {
    onChange(option.value);
    close();
  };
  const placeMenu = useCallback(() => {
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPosition({ top: rect.bottom + 4, left: rect.left, width: Math.max(rect.width, dropdownMinWidth) });
  }, [dropdownMinWidth]);

  useLayoutEffect(() => {
    if (open) placeMenu();
  }, [open, visible.length, placeMenu]);

  useEffect(() => {
    if (open && variant === "outline") inputRef.current?.focus();
  }, [open, variant]);

  useEffect(() => {
    if (!open) return;
    const onOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!wrapperRef.current?.contains(target) && !menuRef.current?.contains(target)) close();
    };
    document.addEventListener("mousedown", onOutside);
    window.addEventListener("resize", placeMenu);
    window.addEventListener("scroll", placeMenu, true);
    return () => {
      document.removeEventListener("mousedown", onOutside);
      window.removeEventListener("resize", placeMenu);
      window.removeEventListener("scroll", placeMenu, true);
    };
  }, [open, placeMenu]);

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!open) setOpen(true);
      else setActiveIndex((index) => Math.min(index + 1, visible.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter" && open && visible[activeIndex]) {
      event.preventDefault();
      choose(visible[activeIndex]);
    } else if (event.key === "Escape") {
      close();
    } else if (event.key === "Tab") {
      close();
    }
  };

  const selectedLabel = selected?.selectedLabel ?? selected?.label ?? placeholder;
  const inputClasses = clsx(
    "w-full rounded-xl border bg-white pr-10 pl-3.5 text-gray-700 outline-none transition placeholder:text-gray-400 dark:bg-slate-900 dark:text-gray-100 dark:placeholder:text-gray-500",
    colors.field.base,
    stateClass,
    colors.field.disabled,
    sizeClasses[size],
    selected?.icon && !open && "pl-11",
    inputClassName,
  );

  return (
    <div className={clsx("relative flex w-full flex-col gap-1", className)}>
      {label && <label htmlFor={id} className={clsx("text-sm font-medium", colors.neutral.text)}>{label}</label>}
      <div ref={wrapperRef} className="relative w-full">
        {variant === "outline" && !open ? (
          <Button
            id={id}
            label={selectedLabel}
            variant="outline"
            size={size}
            disabled={disabled}
            aria-label={ariaLabel}
            aria-invalid={state === "error" || undefined}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={listboxId}
            aria-describedby={describedBy}
            onClick={() => setOpen(true)}
            iconRight={<ChevronDown size={16} aria-hidden />}
            className={clsx(
              "h-10 w-full justify-between border-gray-300 font-medium shadow-sm dark:border-slate-700",
              state === "error" && "border-red-600 dark:border-rose-500",
              state === "success" && "border-emerald-600 dark:border-emerald-500",
              sizeClasses[size],
            )}
          />
        ) : (
          <>
            {selected?.icon && !open && (
              <span className="pointer-events-none absolute inset-y-0 left-3 z-10 flex items-center">{selected.icon}</span>
            )}
            <input
              ref={inputRef}
              id={id}
              type="text"
              role="combobox"
              aria-label={ariaLabel ?? (label ? undefined : placeholder)}
              aria-invalid={state === "error" || undefined}
              aria-describedby={describedBy}
              aria-autocomplete="list"
              aria-expanded={open}
              aria-controls={listboxId}
              aria-haspopup="listbox"
              aria-activedescendant={open && visible[activeIndex] ? `${id}-option-${activeIndex}` : undefined}
              autoComplete="off"
              disabled={disabled}
              value={open ? query : ""}
              placeholder={open ? placeholder : selectedLabel}
              onFocus={() => {
                if (!disabled) {
                  setQuery("");
                  setOpen(true);
                }
              }}
              onChange={(event) => {
                setQuery(event.target.value);
                setActiveIndex(0);
                setOpen(true);
              }}
              onKeyDown={onKeyDown}
              className={inputClasses}
            />
            <ChevronDown
              size={16}
              aria-hidden
              className={clsx("pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 transition-transform", open && "rotate-180")}
            />
          </>
        )}
        {open && typeof document !== "undefined" && createPortal(
          <ul
            ref={menuRef}
            id={listboxId}
            role="listbox"
            aria-label={label ?? placeholder}
            style={{ position: "fixed", top: position.top, left: position.left, width: position.width }}
            className="z-[120] max-h-56 overflow-y-auto rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg dark:border-slate-700 dark:bg-slate-900"
          >
            {visible.length === 0 && (
              <li className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">Sin resultados</li>
            )}
            {visible.map((option, index) => (
              <li
                key={option.value}
                id={`${id}-option-${index}`}
                role="option"
                aria-selected={option.value === value}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => choose(option)}
                className={clsx(
                  "flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-200",
                  index === activeIndex && "bg-brand-50 dark:bg-brand-500/15",
                  option.value === value && "font-semibold",
                )}
              >
                {option.icon}
                <span className="min-w-0 flex-1 break-words">{option.label}</span>
                {option.value === value && <Check size={16} aria-hidden className="text-brand-600 dark:text-brand-300" />}
              </li>
            ))}
          </ul>,
          document.body,
        )}
      </div>
      {helperText && (
        <p id={helperId} className={clsx("text-xs", state === "error" ? "text-red-600 dark:text-rose-400" : state === "success" ? "text-emerald-700 dark:text-emerald-300" : "text-gray-500 dark:text-gray-400")}>
          {helperText}
        </p>
      )}
    </div>
  );
};
