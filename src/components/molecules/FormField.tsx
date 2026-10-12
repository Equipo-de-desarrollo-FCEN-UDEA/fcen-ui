import { useId, type ReactNode } from "react";
import clsx from "clsx";
import type { FieldState } from "../atoms/Input";

export type FieldControlProps = {
  id: string;
  state: FieldState;
  "aria-describedby"?: string;
  "aria-required"?: boolean;
};

export type FormFieldProps = {
  label: string;
  children: (control: FieldControlProps) => ReactNode;
  helperText?: string;
  error?: string;
  required?: boolean;
  id?: string;
  className?: string;
};

export const FormField = ({ label, children, helperText, error, required, id, className }: FormFieldProps) => {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const messageId = `${controlId}-message`;
  const message = error || helperText;

  return (
    <div className={clsx("flex w-full flex-col gap-1.5", className)}>
      <label htmlFor={controlId} className="text-sm font-bold text-slate-600 dark:text-slate-300">
        {label}
        {required && (
          <span aria-hidden className="ml-1 text-red-600 dark:text-rose-400">
            *
          </span>
        )}
      </label>
      {children({
        id: controlId,
        state: error ? "error" : "default",
        "aria-describedby": message ? messageId : undefined,
        "aria-required": required || undefined,
      })}
      {message && (
        <p
          id={messageId}
          className={clsx(
            "text-xs motion-safe:animate-fade-in",
            error ? "text-red-600 dark:text-rose-400" : "text-gray-500 dark:text-gray-400",
          )}
        >
          {message}
        </p>
      )}
    </div>
  );
};
