import clsx from "clsx";

export type CodePillProps = {
  code: string;
  className?: string;
};

export const CodePill = ({ code, className }: CodePillProps) => (
  <code
    className={clsx(
      "inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200",
      className,
    )}
  >
    {code}
  </code>
);
