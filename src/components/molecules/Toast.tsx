import type { LucideIcon } from "lucide-react";
import { CircleAlert, CircleCheck, CircleX, Info, X } from "lucide-react";
import clsx from "clsx";
import { tones, type Tone } from "../../theme/tones";

export type ToastTone = "success" | "error" | "warning" | "info";

export type ToastProps = {
  tone?: ToastTone;
  title: string;
  message?: string;
  duration?: number;
  onClose?: () => void;
  onExpire?: () => void;
  closeLabel?: string;
  className?: string;
};

const toneMap: Record<ToastTone, { tone: Tone; icon: LucideIcon; role: "status" | "alert" }> = {
  success: { tone: "success", icon: CircleCheck, role: "status" },
  error: { tone: "danger", icon: CircleX, role: "alert" },
  warning: { tone: "warning", icon: CircleAlert, role: "alert" },
  info: { tone: "info", icon: Info, role: "status" },
};

export const Toast = ({
  tone = "info",
  title,
  message,
  duration,
  onClose,
  onExpire,
  closeLabel = "Cerrar aviso",
  className,
}: ToastProps) => {
  const { tone: toneKey, icon: Icon, role } = toneMap[tone];
  const styles = tones[toneKey];

  return (
    <div
      role={role}
      className={clsx(
        "group pointer-events-auto relative flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-xl border border-slate-200 bg-white pt-3.5 pr-3 pb-4 pl-4 shadow-lg dark:border-slate-700 dark:bg-slate-900",
        className,
      )}
    >
      <span
        className={clsx(
          "grid h-8 w-8 shrink-0 place-items-center rounded-full border",
          styles.soft,
          styles.softBorder,
          styles.softText,
        )}
      >
        <Icon size={18} aria-hidden />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 pt-0.5">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</p>
        {message && <p className="text-xs text-gray-500 dark:text-gray-400">{message}</p>}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
          className="grid h-6 w-6 shrink-0 cursor-pointer place-items-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 dark:hover:bg-slate-800 dark:hover:text-gray-300"
        >
          <X size={16} aria-hidden />
        </button>
      )}
      {duration !== undefined && (
        <span
          data-testid="toast-timer"
          onAnimationEnd={onExpire}
          style={{ animationDuration: `${duration}ms` }}
          className={clsx(
            "absolute inset-x-0 bottom-0 h-[3px] origin-left animate-shrink-x group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]",
            styles.solid,
          )}
        />
      )}
    </div>
  );
};
