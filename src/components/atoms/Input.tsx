import type { ComponentProps, ReactNode } from "react";
import clsx from "clsx";
import { colors } from "../../theme/colors";

export type FieldState = "default" | "error";
export type InputSize = "sm" | "md";

export type InputProps = Omit<ComponentProps<"input">, "size"> & {
  state?: FieldState;
  size?: InputSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

const sizes: Record<InputSize, string> = {
  sm: "h-9 text-sm",
  md: "h-10 text-base",
};

export const Input = ({ state = "default", size = "md", leftIcon, rightIcon, className, ...props }: InputProps) => (
  <div className="relative w-full">
    {leftIcon && (
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400 dark:text-gray-500">
        {leftIcon}
      </span>
    )}
    <input
      aria-invalid={state === "error" || undefined}
      className={clsx(
        "w-full",
        colors.field.base,
        state === "error" ? colors.field.error : colors.field.idle,
        colors.field.disabled,
        sizes[size],
        leftIcon ? "pl-10" : "pl-3.5",
        rightIcon ? "pr-10" : "pr-3.5",
        className,
      )}
      {...props}
    />
    {rightIcon && (
      <span className="absolute inset-y-0 right-3 flex items-center text-gray-400 dark:text-gray-500">{rightIcon}</span>
    )}
  </div>
);
