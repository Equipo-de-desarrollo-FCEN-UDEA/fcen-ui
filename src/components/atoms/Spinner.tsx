import clsx from "clsx";

export type SpinnerProps = {
  size?: number;
  className?: string;
  label?: string;
};

export const Spinner = ({ size = 18, className, label = "Cargando" }: SpinnerProps) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    role="status"
    aria-label={label}
    className={clsx("animate-spin text-brand-600 dark:text-brand-300", className)}
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
  </svg>
);
