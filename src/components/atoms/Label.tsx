import clsx from "clsx";

export type LabelProps = {
  text: string;
  htmlFor?: string;
  required?: boolean;
  className?: string;
};

export const Label = ({ text, htmlFor, required, className }: LabelProps) => (
  <label htmlFor={htmlFor} className={clsx("block text-sm font-medium text-gray-700 dark:text-gray-200", className)}>
    {text}
    {required && (
      <span aria-hidden className="ml-1 text-red-600 dark:text-rose-400">
        *
      </span>
    )}
  </label>
);
