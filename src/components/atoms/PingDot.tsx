import clsx from "clsx";
import { tones, type Tone } from "../../theme/tones";

export type PingDotProps = {
  tone?: Tone;
  pulse?: boolean;
  className?: string;
};

export const PingDot = ({ tone = "danger", pulse = true, className }: PingDotProps) => (
  <span className={clsx("relative flex h-2.5 w-2.5 shrink-0", className)} aria-hidden>
    {pulse && (
      <span
        data-testid="ping-halo"
        className={clsx(
          "absolute inline-flex h-full w-full rounded-full opacity-75 motion-safe:animate-ping",
          tones[tone].halo,
        )}
      />
    )}
    <span className={clsx("relative inline-flex h-2.5 w-2.5 rounded-full", tones[tone].dot)} />
  </span>
);
