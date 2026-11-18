import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Calendar, X } from "lucide-react";
import clsx from "clsx";
import { colors } from "../../theme/colors";

export type DateFieldProps = {
  text: string;
  placeholder: string;
  clearLabel: string;
  onClear: () => void;
  children: (close: () => void) => ReactNode;
  label?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
  invalid?: boolean;
  id?: string;
  disabled?: boolean;
  className?: string;
};

type PopoverPosition = { top: number; left: number };

const POPOVER_GAP = 6;
const SCREEN_MARGIN = 8;
const TABBABLE = 'button:not([disabled]):not([tabindex="-1"])';

function placeUnder(field: DOMRect, width: number, height: number): PopoverPosition {
  const below = window.innerHeight - field.bottom;
  const flip = below < height + POPOVER_GAP && field.top > below;
  return {
    top: flip ? field.top - height - POPOVER_GAP : field.bottom + POPOVER_GAP,
    left: Math.max(SCREEN_MARGIN, Math.min(field.left, window.innerWidth - width - SCREEN_MARGIN)),
  };
}

export function DateField({
  text,
  placeholder,
  clearLabel,
  onClear,
  children,
  label,
  "aria-label": ariaLabel,
  "aria-describedby": describedBy,
  invalid = false,
  id,
  disabled = false,
  className,
}: DateFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const labelId = `${fieldId}-label`;
  const textId = `${fieldId}-text`;
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<PopoverPosition>({ top: 0, left: 0 });
  const wrapperRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const name = label ?? ariaLabel;
  const showsText = Boolean(text) || placeholder !== name;
  const clearable = Boolean(text) && !disabled;

  const close = useCallback(() => {
    setOpen(false);
    (document.getElementById(fieldId) as HTMLButtonElement).focus();
  }, [fieldId]);

  const place = useCallback(() => {
    const wrapper = wrapperRef.current;
    const popover = popoverRef.current;
    if (!wrapper || !popover) return;
    setPosition(placeUnder(wrapper.getBoundingClientRect(), popover.offsetWidth, popover.offsetHeight));
  }, []);

  useLayoutEffect(() => {
    if (open) place();
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (wrapperRef.current?.contains(target) || popoverRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", closeOutside);
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      document.removeEventListener("mousedown", closeOutside);
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [open, place]);

  const clear = () => {
    onClear();
    close();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      close();
      return;
    }
    if (event.key !== "Tab") return;
    event.stopPropagation();
    const elements = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(TABBABLE));
    const first = elements[0];
    const last = elements[elements.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div className={clsx("flex w-full flex-col gap-1", className)}>
      {label && (
        <label id={labelId} htmlFor={fieldId} className={clsx("text-sm font-medium", colors.neutral.text)}>
          {label}
        </label>
      )}
      {!label && ariaLabel && (
        <span id={labelId} hidden>
          {ariaLabel}
        </span>
      )}
      <div ref={wrapperRef} className="relative w-full">
        <button
          id={fieldId}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-labelledby={name ? (showsText ? `${labelId} ${textId}` : labelId) : undefined}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          disabled={disabled}
          onClick={() => setOpen((value) => !value)}
          className={clsx(
            "flex min-h-10 w-full cursor-pointer items-center gap-2.5 py-2 pl-3.5 text-left text-base tabular-nums",
            colors.field.base,
            invalid ? colors.field.error : colors.field.idle,
            colors.field.disabled,
            open && (invalid ? "shadow-focus-danger" : "border-brand-600 shadow-focus dark:border-brand-400"),
            clearable ? "pr-10" : "pr-3.5",
          )}
        >
          <Calendar size={16} aria-hidden className="shrink-0 text-gray-400 dark:text-gray-500" />
          <span id={textId} className={clsx("min-w-0 flex-1 break-words", !text && "text-gray-400 dark:text-gray-500")}>
            {text || placeholder}
          </span>
        </button>
        {clearable && (
          <button
            type="button"
            aria-label={clearLabel}
            onClick={clear}
            className="absolute top-1/2 right-2 grid h-7 w-7 -translate-y-1/2 cursor-pointer place-items-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 dark:text-gray-500 dark:hover:bg-slate-800 dark:hover:text-gray-300 dark:focus-visible:ring-brand-400"
          >
            <X size={14} aria-hidden />
          </button>
        )}
      </div>
      {open &&
        createPortal(
          <div
            ref={popoverRef}
            role="dialog"
            aria-modal="true"
            aria-label="Calendario"
            onKeyDown={onKeyDown}
            style={{ position: "fixed", top: position.top, left: position.left }}
            className="z-[70] w-max rounded-2xl border border-gray-200 bg-white p-3 text-gray-700 shadow-xl motion-safe:animate-pop-in dark:border-slate-700 dark:bg-slate-900 dark:text-gray-200"
          >
            {children(close)}
          </div>,
          document.body,
        )}
    </div>
  );
}
