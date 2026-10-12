import clsx from "clsx";

export type SegmentedOption<T extends string> = {
  value: T;
  label: string;
};

export type SegmentedToggleProps<T extends string> = {
  value: T;
  options: SegmentedOption<T>[];
  onChange: (value: T) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
};

export function SegmentedToggle<T extends string>({
  value,
  options,
  onChange,
  disabled = false,
  label,
  className,
}: SegmentedToggleProps<T>) {
  const activeIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );

  return (
    <div
      role="group"
      aria-label={label}
      className={clsx(
        "relative flex select-none rounded-xl bg-gray-300 p-1 dark:bg-slate-800",
        disabled && "pointer-events-none opacity-60",
        className,
      )}
    >
      <span
        aria-hidden
        className="absolute top-1 bottom-1 left-1 rounded-lg bg-white shadow-md transition-transform duration-300 ease-out dark:bg-slate-900"
        style={{
          width: `calc((100% - 0.5rem) / ${options.length})`,
          transform: `translateX(${activeIndex * 100}%)`,
        }}
      />
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={option.value === value}
          disabled={disabled}
          onClick={() => onChange(option.value)}
          className={clsx(
            "relative z-10 flex-1 cursor-pointer rounded-lg px-3 py-2 text-sm font-semibold whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950",
            option.value === value
              ? "text-brand-600 dark:text-brand-300"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
