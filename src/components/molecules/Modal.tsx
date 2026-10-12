import { useEffect, useId, useRef, type KeyboardEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { LucideIcon } from "lucide-react";
import { CircleCheck, CircleX, Info, TriangleAlert, X } from "lucide-react";
import clsx from "clsx";
import { Button, type ButtonVariant } from "../atoms/Button";
import { tones, type Tone } from "../../theme/tones";

export type ModalIntent = "neutral" | "success" | "warning" | "danger";
export type ModalSize = "md" | "lg";

export type ModalAction = {
  label: string;
  variant?: ButtonVariant;
  onClick?: () => void;
  isLoading?: boolean;
  loadingText?: string;
  disabled?: boolean;
  iconLeft?: ReactNode;
};

export type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  intent?: ModalIntent;
  icon?: LucideIcon;
  size?: ModalSize;
  children?: ReactNode;
  actions?: ModalAction[];
  closeOnBackdropClick?: boolean;
  closeLabel?: string;
  className?: string;
};

const intents: Record<ModalIntent, { tone: Tone; icon: LucideIcon }> = {
  neutral: { tone: "neutral", icon: Info },
  success: { tone: "success", icon: CircleCheck },
  warning: { tone: "warning", icon: TriangleAlert },
  danger: { tone: "danger", icon: CircleX },
};

const sizes: Record<ModalSize, string> = {
  md: "max-w-lg",
  lg: "max-w-2xl",
};

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function focusablesIn(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE));
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  intent = "neutral",
  icon,
  size = "md",
  children,
  actions,
  closeOnBackdropClick = true,
  closeLabel = "Cerrar",
  className,
}: ModalProps) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const panel = panelRef.current as HTMLDivElement;
    const first = focusablesIn(panel).find((element) => !element.dataset.modalClose);
    (first ?? panel).focus();

    return () => {
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const { tone, icon: defaultIcon } = intents[intent];
  const Icon = icon ?? defaultIcon;
  const styles = tones[tone];

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      onCloseRef.current();
      return;
    }
    if (event.key !== "Tab") return;
    const elements = focusablesIn(event.currentTarget);
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

  const handleBackdrop = () => {
    if (closeOnBackdropClick) onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        data-testid="modal-backdrop"
        aria-hidden
        onClick={handleBackdrop}
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-[2px] motion-safe:animate-fade-in dark:bg-black/60"
      />
      <div className="pointer-events-none relative flex min-h-full items-end justify-center p-4 sm:items-center sm:p-6">
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={description ? descriptionId : undefined}
          tabIndex={-1}
          onKeyDown={handleKeyDown}
          className={clsx(
            "pointer-events-auto relative flex max-h-[calc(100dvh-2rem)] w-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white text-gray-700 shadow-xl outline-none motion-safe:animate-modal-in dark:border-slate-700 dark:bg-slate-900 dark:text-gray-200",
            sizes[size],
            className,
          )}
        >
          <div className={clsx("flex items-start gap-4 pt-6 pr-5 pl-6", children ? "pb-4" : "pb-5")}>
            <span
              className={clsx(
                "grid h-11 w-11 shrink-0 place-items-center rounded-[14px] border",
                styles.soft,
                styles.softBorder,
                styles.softText,
              )}
            >
              <Icon size={22} aria-hidden />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1 pt-0.5">
              <h2 id={titleId} className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                {title}
              </h2>
              {description && (
                <div id={descriptionId} className="text-sm text-gray-600 dark:text-gray-400">
                  {description}
                </div>
              )}
            </div>
            <button
              type="button"
              data-modal-close="true"
              onClick={onClose}
              aria-label={closeLabel}
              className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-[10px] text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 dark:hover:bg-slate-800 dark:hover:text-gray-300"
            >
              <X size={16} aria-hidden />
            </button>
          </div>
          {children && <div className="flex-1 overflow-y-auto px-6 pt-1 pb-6">{children}</div>}
          {actions && actions.length > 0 && (
            <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-700 dark:bg-slate-800/60">
              {actions.map((action) => (
                <Button
                  key={action.label}
                  label={action.label}
                  variant={action.variant ?? "primary"}
                  onClick={action.onClick}
                  isLoading={action.isLoading}
                  loadingText={action.loadingText}
                  disabled={action.disabled}
                  iconLeft={action.iconLeft}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};
