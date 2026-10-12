import type { ComponentProps } from "react";
import clsx from "clsx";
import { Check } from "lucide-react";

export type CheckboxProps = Omit<ComponentProps<"input">, "type"> & {
  label?: string;
};

export const Checkbox = ({ label, className, disabled, ...props }: CheckboxProps) => (
  <label
    className={clsx(
      "inline-flex select-none items-center gap-2",
      disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
      className,
    )}
  >
    <span className="relative inline-flex h-4 w-4 shrink-0">
      <input
        type="checkbox"
        disabled={disabled}
        className="peer h-4 w-4 cursor-[inherit] appearance-none rounded border border-gray-300 bg-white transition-colors checked:border-brand-600 checked:bg-brand-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 dark:border-slate-600 dark:bg-slate-800 dark:checked:border-brand-500 dark:checked:bg-brand-500 dark:focus-visible:ring-offset-slate-900"
        {...props}
      />
      <Check
        aria-hidden
        strokeWidth={3}
        className="pointer-events-none absolute inset-0 m-auto hidden h-3 w-3 text-white peer-checked:block"
      />
    </span>
    {label && <span className="text-sm text-gray-700 dark:text-gray-200">{label}</span>}
  </label>
);
