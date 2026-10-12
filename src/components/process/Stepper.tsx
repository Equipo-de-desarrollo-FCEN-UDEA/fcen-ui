import { Check, Undo2, X } from "lucide-react";
import clsx from "clsx";
import { PingDot } from "../atoms/PingDot";

export type StepState = "done" | "current" | "upcoming" | "warning" | "danger";

export type StepperStep = {
  label: string;
  state: StepState;
};

export type StepperProps = {
  steps: StepperStep[];
  accent?: "success" | "brand";
  size?: "sm" | "md";
  label?: string;
  className?: string;
};

const accents = {
  success: {
    filled: "border-emerald-500 bg-emerald-500 text-white",
    ring: "border-emerald-500 bg-white text-emerald-600 dark:bg-slate-900",
    line: "bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-300",
  },
  brand: {
    filled: "border-brand-600 bg-brand-600 text-white dark:border-brand-500 dark:bg-brand-500",
    ring: "border-brand-600 bg-white text-brand-600 shadow-focus dark:bg-slate-900 dark:text-brand-300",
    line: "bg-brand-600 dark:bg-brand-500",
    text: "text-brand-800 dark:text-brand-200",
  },
};

function isReached(state: StepState): boolean {
  return state !== "upcoming";
}

export const Stepper = ({ steps, accent = "success", size = "sm", label, className }: StepperProps) => {
  const colors = accents[accent];
  const dotSize = size === "md" ? "h-8 w-8 text-sm" : "h-7 w-7 text-xs";
  const iconSize = size === "md" ? 16 : 14;

  return (
    <ol aria-label={label} className={clsx("flex w-full", className)}>
      {steps.map((step, index) => {
        const next = steps[index + 1];
        const dotClass = {
          done: colors.filled,
          current: colors.ring,
          upcoming: "border-slate-200 bg-white text-gray-400 dark:border-slate-700 dark:bg-slate-900",
          warning: "border-amber-500 bg-amber-50 text-amber-600 dark:bg-amber-500/10",
          danger: "border-rose-500 bg-rose-500 text-white",
        }[step.state];
        const labelClass = {
          done: "font-medium text-gray-700 dark:text-gray-200",
          current: clsx("font-semibold", colors.text),
          upcoming: "font-medium text-gray-400 dark:text-gray-500",
          warning: "font-semibold text-amber-700 dark:text-amber-300",
          danger: "font-semibold text-rose-700 dark:text-rose-300",
        }[step.state];

        return (
          <li
            key={step.label}
            aria-current={step.state === "current" ? "step" : undefined}
            data-state={step.state}
            className="relative flex flex-1 flex-col items-center gap-2"
          >
            {next && (
              <span
                aria-hidden
                className={clsx(
                  "absolute left-1/2 h-0.5 w-full bg-slate-200 dark:bg-slate-700",
                  size === "md" ? "top-[15px]" : "top-[13px]",
                )}
              >
                {isReached(next.state) && (
                  <span
                    style={{ animationDelay: `${index * 120}ms` }}
                    className={clsx("absolute inset-0 origin-left motion-safe:animate-grow-x", colors.line)}
                  />
                )}
              </span>
            )}
            <span
              className={clsx(
                "relative z-10 grid shrink-0 place-items-center rounded-full border-2 font-semibold transition-colors",
                dotSize,
                dotClass,
              )}
            >
              {step.state === "done" && <Check size={iconSize} strokeWidth={3} aria-hidden />}
              {step.state === "warning" && <Undo2 size={iconSize} aria-hidden />}
              {step.state === "danger" && <X size={iconSize} strokeWidth={3} aria-hidden />}
              {step.state === "current" && accent === "success" && <PingDot tone="success" />}
              {(step.state === "upcoming" || (step.state === "current" && accent === "brand")) && index + 1}
            </span>
            <span className={clsx("px-1 text-center text-xs", labelClass)}>{step.label}</span>
          </li>
        );
      })}
    </ol>
  );
};
