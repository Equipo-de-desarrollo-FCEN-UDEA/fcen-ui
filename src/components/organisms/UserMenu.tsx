import type { LucideIcon } from "lucide-react";
import { Check } from "lucide-react";
import clsx from "clsx";
import { Avatar } from "../atoms/Avatar";

export type UserMenuOption = {
  value: string;
  label: string;
  detail?: string;
  icon: LucideIcon;
};

export type UserMenuLink = {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
};

export type UserMenuProps = {
  name: string;
  username?: string;
  heading?: string;
  options?: UserMenuOption[];
  value?: string;
  onChange?: (value: string) => void;
  links?: UserMenuLink[];
  className?: string;
};

export const UserMenu = ({
  name,
  username,
  heading = "Calidad activa",
  options = [],
  value,
  onChange,
  links = [],
  className,
}: UserMenuProps) => (
  <div
    className={clsx(
      "flex w-80 flex-col gap-1 rounded-xl border border-gray-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900",
      className,
    )}
  >
    <div className="flex items-center gap-3 px-2 pt-2 pb-3">
      <Avatar name={name} />
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">{name}</span>
        {username && <span className="truncate text-xs text-gray-500 dark:text-gray-400">{username}</span>}
      </div>
    </div>
    {options.length > 0 && (
      <>
        <div aria-hidden className="h-px bg-gray-200 dark:bg-slate-700" />
        <p className="px-3 pt-2 pb-1 text-xs font-semibold text-gray-500 dark:text-gray-400">{heading}</p>
        <div role="group" aria-label={heading} className="flex flex-col gap-1">
          {options.map((option) => {
            const active = option.value === value;
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                onClick={() => onChange?.(option.value)}
                className={clsx(
                  "flex w-full cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600",
                  active
                    ? "border-brand-200 bg-brand-50 dark:border-brand-500/30 dark:bg-brand-500/10"
                    : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-800",
                )}
              >
                <span
                  className={clsx(
                    "grid h-8 w-8 shrink-0 place-items-center rounded-[10px]",
                    active ? "bg-white text-brand-600 dark:bg-slate-900 dark:text-brand-300" : "bg-slate-50 text-gray-500 dark:bg-slate-800",
                  )}
                >
                  <Icon size={16} aria-hidden />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span
                    className={clsx(
                      "truncate text-sm font-semibold",
                      active ? "text-brand-800 dark:text-brand-200" : "text-gray-900 dark:text-gray-100",
                    )}
                  >
                    {option.label}
                  </span>
                  {option.detail && <span className="truncate text-xs text-gray-500 dark:text-gray-400">{option.detail}</span>}
                </span>
                {active && <Check size={16} aria-hidden className="shrink-0 text-brand-600 dark:text-brand-300" />}
              </button>
            );
          })}
        </div>
      </>
    )}
    {links.length > 0 && (
      <>
        <div aria-hidden className="my-1 h-px bg-gray-200 dark:bg-slate-700" />
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <button
              key={link.label}
              type="button"
              onClick={link.onClick}
              className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-slate-50 hover:text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 dark:text-gray-200 dark:hover:bg-slate-800"
            >
              <Icon size={18} aria-hidden className="shrink-0 text-gray-500" />
              {link.label}
            </button>
          );
        })}
      </>
    )}
  </div>
);
