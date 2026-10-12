import { useEffect, useRef, useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Building2, ChevronDown, LogOut, Moon, Sun } from "lucide-react";
import clsx from "clsx";
import { Avatar } from "../atoms/Avatar";
import { Button } from "../atoms/Button";

export type ThemeMode = "light" | "dark";

export type TopBarProps = {
  name: string;
  roleLabel?: string;
  roleIcon?: LucideIcon;
  userMenu?: (close: () => void) => ReactNode;
  theme?: ThemeMode;
  onToggleTheme?: () => void;
  onSignOut?: () => void;
  signingOut?: boolean;
  className?: string;
};

export const TopBar = ({
  name,
  roleLabel,
  roleIcon: RoleIcon = Building2,
  userMenu,
  theme = "light",
  onToggleTheme,
  onSignOut,
  signingOut = false,
  className,
}: TopBarProps) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointer = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const close = () => setOpen(false);
  const toggle = () => setOpen((current) => !current);

  return (
    <header
      className={clsx(
        "flex items-center justify-between gap-4 border-b border-gray-200 bg-white/95 px-4 py-3.5 backdrop-blur sm:px-6 dark:border-slate-800 dark:bg-slate-900/95",
        className,
      )}
    >
      <div ref={wrapperRef} className="relative min-w-0">
        <button
          ref={triggerRef}
          type="button"
          disabled={!userMenu}
          aria-haspopup={userMenu ? "true" : undefined}
          aria-expanded={userMenu ? open : undefined}
          onClick={toggle}
          className="group flex max-w-full items-center gap-3 rounded-xl border border-gray-200 bg-white py-1.5 pr-3 pl-1.5 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 enabled:cursor-pointer enabled:hover:border-brand-200 enabled:hover:shadow-sm disabled:cursor-default dark:border-slate-700 dark:bg-slate-900"
        >
          <Avatar name={name} />
          <span className="flex min-w-0 flex-col gap-1">
            <span className="truncate text-sm font-semibold text-gray-700 dark:text-gray-100">{name}</span>
            {roleLabel && (
              <span className="inline-flex max-w-full items-center gap-1.5 self-start rounded-full border border-brand-100 bg-brand-50 py-0.5 pr-2 pl-2.5 text-xs font-semibold text-brand-800 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-200">
                <RoleIcon size={12} aria-hidden className="shrink-0" />
                <span className="truncate">{roleLabel}</span>
              </span>
            )}
          </span>
          {userMenu && (
            <ChevronDown
              size={16}
              aria-hidden
              className={clsx("shrink-0 text-gray-400 transition-transform duration-200", open && "rotate-180")}
            />
          )}
        </button>
        {open && userMenu && (
          <div className="absolute top-full left-0 z-50 mt-2 origin-top-left motion-safe:animate-pop-in">{userMenu(close)}</div>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {onToggleTheme && (
          <button
            type="button"
            onClick={onToggleTheme}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-gray-300 bg-gray-100 px-3 py-1 text-sm text-gray-700 transition-colors hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-200"
          >
            {theme === "dark" ? <Moon size={14} aria-hidden /> : <Sun size={14} aria-hidden />}
            {theme === "dark" ? "Oscuro" : "Claro"}
          </button>
        )}
        {onSignOut && (
          <Button
            label="Salir"
            variant="outline"
            iconLeft={<LogOut size={16} aria-hidden />}
            onClick={onSignOut}
            isLoading={signingOut}
            loadingText="Saliendo…"
          />
        )}
      </div>
    </header>
  );
};
