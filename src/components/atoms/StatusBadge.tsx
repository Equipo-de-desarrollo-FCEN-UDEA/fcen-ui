import clsx from "clsx";
import { tones, type Tone } from "../../theme/tones";

export type StatusBadgeProps = {
  label: string;
  tone?: Tone;
  size?: "sm" | "md";
  className?: string;
};

export const StatusBadge = ({ label, tone = "neutral", size = "sm", className }: StatusBadgeProps) => (
  <span
    className={clsx(
      "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border font-medium",
      tones[tone].badge,
      size === "md" ? "px-3 py-1 text-sm" : "px-2.5 py-0.5 text-xs",
      className,
    )}
  >
    <span className={clsx("h-1.5 w-1.5 shrink-0 rounded-full", tones[tone].dot)} />
    {label || "—"}
  </span>
);
