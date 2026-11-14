import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Chip } from "./Chip";

export type SearchableMultiSelectOption = {
  value: string;
  label: string;
};

export type SearchableMultiSelectProps = {
  options: SearchableMultiSelectOption[];
  values: string[];
  onChange: (values: string[]) => void;
  label?: string;
  placeholder?: string;
  helperText?: string;
  className?: string;
};

const normalize = (text: string) => text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export const SearchableMultiSelect = ({
  options,
  values,
  onChange,
  label,
  placeholder = "Buscar...",
  helperText,
  className,
}: SearchableMultiSelectProps) => {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const selected = options.filter((option) => values.includes(option.value));
  const visible = options.filter(
    (option) => !values.includes(option.value) && normalize(option.label).startsWith(normalize(query)),
  );

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", closeOutside);
    return () => document.removeEventListener("mousedown", closeOutside);
  }, [open]);

  const remove = (value: string) => onChange(values.filter((item) => item !== value));
  const add = (value: string) => {
    if (!values.includes(value)) onChange([...values, value]);
    setQuery("");
    setOpen(true);
    inputRef.current?.focus();
  };

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
      add(visible[activeIndex].value);
    } else if (event.key === "Backspace" && !query && values.length > 0) {
      remove(values[values.length - 1]);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={`flex w-full flex-col gap-1 ${className ?? ""}`}>
      {label && <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</label>}
      <div
        className="flex min-h-[42px] flex-wrap items-center gap-1 rounded-xl border border-gray-300 bg-white px-2 py-1 focus-within:border-brand-600 focus-within:shadow-focus dark:border-slate-700 dark:bg-slate-900 dark:focus-within:border-brand-400"
        onClick={() => {
          setOpen(true);
          inputRef.current?.focus();
        }}
      >
        {selected.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            removeLabel={`Eliminar ${option.label}`}
            onRemove={() => remove(option.value)}
            className="bg-brand-100 text-brand-800 dark:bg-brand-500/20 dark:text-brand-200"
          />
        ))}
        <input
          ref={inputRef}
          id={id}
          role="combobox"
          aria-label={label ? undefined : placeholder}
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={`${id}-listbox`}
          aria-haspopup="listbox"
          aria-activedescendant={open && visible[activeIndex] ? `${id}-option-${activeIndex}` : undefined}
          autoComplete="off"
          className="min-w-[120px] flex-1 bg-transparent px-1 text-sm text-gray-700 outline-none placeholder:text-gray-400 dark:text-gray-100 dark:placeholder:text-gray-500"
          placeholder={values.length ? "" : placeholder}
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
        />
      </div>
      {open && (
        <ul
          id={`${id}-listbox`}
          role="listbox"
          aria-label={label ?? placeholder}
          aria-multiselectable="true"
          className="z-20 max-h-56 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-900"
        >
          {visible.length === 0 ? (
            <li className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">Sin resultados</li>
          ) : visible.map((option, index) => (
            <li
              key={option.value}
              id={`${id}-option-${index}`}
              role="option"
              aria-selected="false"
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => add(option.value)}
              className={`cursor-pointer rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-200 ${
                index === activeIndex ? "bg-brand-50 dark:bg-brand-500/15" : "hover:bg-gray-50 dark:hover:bg-slate-800"
              }`}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
      {helperText && <p className="text-xs text-gray-500 dark:text-gray-400">{helperText}</p>}
    </div>
  );
};
