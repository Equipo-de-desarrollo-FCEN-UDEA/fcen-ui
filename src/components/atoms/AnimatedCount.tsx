import clsx from "clsx";
import { useCountUp } from "../../hooks/useCountUp";

export type AnimatedCountProps = {
  value: number;
  className?: string;
};

export const AnimatedCount = ({ value, className }: AnimatedCountProps) => {
  const shown = useCountUp(value);
  return <span className={clsx("tabular-nums", className)}>{shown.toLocaleString("es-CO")}</span>;
};
