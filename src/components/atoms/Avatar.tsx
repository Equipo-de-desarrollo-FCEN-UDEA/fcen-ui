import clsx from "clsx";

export type AvatarProps = {
  name?: string;
  size?: "sm" | "md";
  className?: string;
};

function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = words.length > 0 ? words[0][0] : "";
  const last = words.length > 1 ? words[words.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export const Avatar = ({ name, size = "md", className }: AvatarProps) => {
  const initials = name ? initialsOf(name) : "";

  return (
    <span
      role="img"
      aria-label={name || "Sin nombre"}
      className={clsx(
        "inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold",
        size === "sm" ? "h-7 w-7 text-[11px]" : "h-9 w-9 text-xs",
        initials
          ? "bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-200"
          : "bg-slate-100 text-gray-400 dark:bg-slate-800 dark:text-gray-500",
        className,
      )}
    >
      {initials || "—"}
    </span>
  );
};
