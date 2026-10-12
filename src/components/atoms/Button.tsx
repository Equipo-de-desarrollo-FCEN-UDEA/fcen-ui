import type { ComponentProps, ReactNode } from "react";
import clsx from "clsx";
import { Spinner } from "./Spinner";
import { colors } from "../../theme/colors";

export type ButtonVariant = "primary" | "secondary" | "outline" | "text" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = ComponentProps<"button"> & {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: string;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
};

const base =
  "inline-flex items-center justify-center rounded-xl font-semibold cursor-pointer transition-all enabled:hover:scale-[1.02] enabled:active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed";

const variants: Record<ButtonVariant, string> = {
  primary: clsx(colors.primary.base, colors.primary.hover, colors.primary.ring),
  secondary: clsx(colors.secondary.base, colors.secondary.hover, colors.secondary.ring),
  danger: clsx(colors.danger.base, colors.danger.hover, colors.danger.ring),
  outline: clsx(
    "border bg-transparent",
    colors.primary.border,
    colors.primary.text,
    colors.primary.ring,
    colors.primary.hoverSolid,
    "enabled:hover:text-white",
  ),
  text: clsx("bg-transparent enabled:hover:underline", colors.primary.text, colors.primary.ring),
  ghost:
    "bg-transparent text-gray-600 enabled:hover:bg-gray-100 enabled:hover:text-brand-600 focus-visible:ring-gray-300 dark:text-gray-400 dark:enabled:hover:bg-slate-800 dark:enabled:hover:text-brand-300",
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
};

const spinnerSizes: Record<ButtonSize, number> = { sm: 14, md: 18, lg: 20 };

export const Button = ({
  label,
  variant = "primary",
  size = "md",
  isLoading = false,
  loadingText,
  iconLeft,
  iconRight,
  className,
  type = "button",
  disabled,
  ...props
}: ButtonProps) => {
  const text = isLoading ? (loadingText ?? label) : label;
  const hasText = text.trim().length > 0;

  return (
    <button
      type={type}
      {...props}
      aria-busy={isLoading || undefined}
      disabled={isLoading || disabled}
      className={clsx(base, hasText ? "gap-2" : "gap-0", variants[variant], sizes[size], className)}
    >
      {isLoading && <Spinner size={spinnerSizes[size]} label={loadingText ?? "Cargando"} className="text-current" />}
      {iconLeft && !isLoading && <span className="shrink-0">{iconLeft}</span>}
      {hasText && <span className={clsx("truncate", isLoading && "opacity-90")}>{text}</span>}
      {iconRight && !isLoading && <span className="shrink-0">{iconRight}</span>}
    </button>
  );
};
