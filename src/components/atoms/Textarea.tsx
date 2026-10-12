import type { ComponentProps } from "react";
import clsx from "clsx";
import { colors } from "../../theme/colors";
import type { FieldState } from "./Input";

export type TextareaProps = ComponentProps<"textarea"> & {
  state?: FieldState;
};

export const Textarea = ({ state = "default", rows = 4, className, ...props }: TextareaProps) => (
  <textarea
    rows={rows}
    aria-invalid={state === "error" || undefined}
    className={clsx(
      "block min-h-30 w-full resize-y px-3.5 py-2.5 text-base",
      colors.field.base,
      state === "error" ? colors.field.error : colors.field.idle,
      colors.field.disabled,
      className,
    )}
    {...props}
  />
);
