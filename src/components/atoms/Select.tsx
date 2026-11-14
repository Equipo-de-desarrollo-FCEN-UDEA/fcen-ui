import { useId, useState, type ChangeEvent, type ComponentProps, type FC } from "react";
import clsx from "clsx";
import { ChevronDown, X } from "lucide-react";
import { colors } from "../../theme/colors";

export type SelectState = "default" | "error" | "success";
export type SelectSize = "sm" | "md" | "lg";
export type SelectOption = { value: string; label: string };

type NativeProps = Omit<ComponentProps<"select">, "size" | "onChange" | "value" | "defaultValue">;

export interface SelectProps extends NativeProps {
  label?: string;
  state?: SelectState;
  size?: SelectSize;
  options: SelectOption[];
  helperText?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
  onClear?: () => void;
  clearLabel?: string;
}

const sizeClasses: Record<SelectSize, string> = {
  sm: "h-9 text-sm px-3",
  md: "h-10 text-base px-3.5",
  lg: "h-12 text-lg px-4",
};

export const Select: FC<SelectProps> = ({
  label,
  state = "default",
  size = "md",
  options,
  helperText,
  placeholder = "Seleccionar...",
  className,
  id,
  value,
  defaultValue,
  onChange,
  onClear,
  clearLabel = "Limpiar selección",
  disabled,
  required,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  ...props
}) => {
  const generatedId = useId();
  const helperId = useId();
  const controlId = id ?? generatedId;
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? "");
  const isControlled = value !== undefined;
  const selectedValue = isControlled ? value : uncontrolledValue;
  const stateClass = state === "error" ? colors.field.error : state === "success" ? colors.field.success : colors.field.idle;
  const describedBy = [ariaDescribedBy, helperText ? helperId : undefined].filter(Boolean).join(" ") || undefined;
  const hasEmptyOption = options.some((option) => option.value === "");

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    if (!isControlled) setUncontrolledValue(event.currentTarget.value);
    onChange?.(event);
  };

  const handleClear = () => {
    if (!isControlled) setUncontrolledValue("");
    onClear?.();
  };

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={controlId} className={clsx("text-sm font-medium", colors.neutral.text)}>
          {label}
        </label>
      )}

      <div className="relative">
        <select
          id={controlId}
          aria-describedby={describedBy}
          aria-invalid={state === "error" ? true : ariaInvalid}
          disabled={disabled}
          required={required}
          className={clsx(
            "w-full appearance-none rounded-xl outline-none transition-[border-color,box-shadow] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950",
            colors.field.base,
            stateClass,
            colors.field.disabled,
            sizeClasses[size],
            "pr-16",
            className,
          )}
          value={selectedValue}
          onChange={handleChange}
          {...props}
        >
          {!hasEmptyOption && (
            <option value="" disabled={required} hidden={required}>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {selectedValue && onClear && (
          <button
            type="button"
            aria-label={clearLabel}
            disabled={disabled}
            onClick={handleClear}
            className="absolute inset-y-0 right-8 grid w-7 place-items-center text-gray-400 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-500 dark:hover:text-gray-200"
          >
            <X size={14} aria-hidden />
          </button>
        )}

        <span aria-hidden className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400 dark:text-gray-500">
          <ChevronDown size={16} />
        </span>
      </div>

      {helperText && (
        <p id={helperId} className={clsx("text-xs", state === "error" ? "text-red-600 dark:text-rose-400" : state === "success" ? "text-emerald-700 dark:text-emerald-300" : "text-gray-500 dark:text-gray-400")}>
          {helperText}
        </p>
      )}
    </div>
  );
};
