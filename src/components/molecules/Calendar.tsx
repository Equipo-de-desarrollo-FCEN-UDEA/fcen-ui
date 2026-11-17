import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";
import {
  WEEKDAYS,
  addDays,
  addMonths,
  clampDate,
  dayLabel,
  monthDays,
  monthLabel,
  todayIso,
  weekdayIndex,
} from "../../utils/dates";

export type CalendarProps = {
  start: string;
  end: string;
  preview: string;
  initial: string;
  min?: string;
  max?: string;
  onSelect: (day: string) => void;
  onPreview?: (day: string) => void;
};

const GRID_CELLS = 42;

const navClass =
  "grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 aria-disabled:cursor-not-allowed aria-disabled:opacity-40 aria-disabled:hover:bg-transparent aria-disabled:hover:text-gray-500 dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-brand-300 dark:focus-visible:ring-brand-400";

function weeksOf(day: string): string[][] {
  const days = monthDays(day);
  const cells = [...Array<string>(weekdayIndex(days[0])).fill(""), ...days];
  while (cells.length < GRID_CELLS) cells.push("");
  const weeks: string[][] = [];
  for (let index = 0; index < cells.length; index += 7) weeks.push(cells.slice(index, index + 7));
  return weeks;
}

function moveBy(day: string, key: string): string | null {
  switch (key) {
    case "ArrowLeft":
      return addDays(day, -1);
    case "ArrowRight":
      return addDays(day, 1);
    case "ArrowUp":
      return addDays(day, -7);
    case "ArrowDown":
      return addDays(day, 7);
    case "PageUp":
      return addMonths(day, -1);
    case "PageDown":
      return addMonths(day, 1);
    case "Home":
      return addDays(day, -weekdayIndex(day));
    case "End":
      return addDays(day, 6 - weekdayIndex(day));
    default:
      return null;
  }
}

export function Calendar({ start, end, preview, initial, min, max, onSelect, onPreview }: CalendarProps) {
  const headingId = useId();
  const [focused, setFocused] = useState(() => clampDate(initial, min, max));
  const moveFocus = useRef(true);
  const grid = useRef<HTMLTableElement>(null);
  const today = todayIso();
  const firstOfMonth = `${focused.slice(0, 8)}01`;
  const canGoBack = !min || addDays(firstOfMonth, -1) >= min;
  const canGoForward = !max || addMonths(firstOfMonth, 1) <= max;
  const tentative = start && !end && preview > start ? preview : "";
  const last = start && (end || tentative);

  useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    const button = (grid.current as HTMLTableElement).querySelector<HTMLButtonElement>(`[data-day="${focused}"]`);
    (button as HTMLButtonElement).focus({ preventScroll: true });
  }, [focused]);

  const goToMonth = (amount: number, allowed: boolean) => {
    if (allowed) setFocused(clampDate(addMonths(focused, amount), min, max));
  };

  const choose = (day: string) => {
    setFocused(day);
    onSelect(day);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTableElement>) => {
    const next = moveBy(focused, event.key);
    if (!next) return;
    event.preventDefault();
    const target = clampDate(next, min, max);
    moveFocus.current = target !== focused;
    setFocused(target);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          aria-label="Mes anterior"
          aria-disabled={!canGoBack || undefined}
          onClick={() => goToMonth(-1, canGoBack)}
          className={navClass}
        >
          <ChevronLeft size={16} aria-hidden />
        </button>
        <p id={headingId} aria-live="polite" className="text-sm font-semibold text-gray-900 dark:text-gray-50">
          {monthLabel(focused)}
        </p>
        <button
          type="button"
          aria-label="Mes siguiente"
          aria-disabled={!canGoForward || undefined}
          onClick={() => goToMonth(1, canGoForward)}
          className={navClass}
        >
          <ChevronRight size={16} aria-hidden />
        </button>
      </div>
      <table
        ref={grid}
        role="grid"
        aria-labelledby={headingId}
        onKeyDown={onKeyDown}
        onMouseLeave={() => onPreview?.("")}
        className="border-separate border-spacing-x-0 border-spacing-y-0.5"
      >
        <thead>
          <tr>
            {WEEKDAYS.map((name) => (
              <th key={name} scope="col" className="h-8 w-9 p-0 text-xs font-medium text-gray-500 dark:text-gray-400">
                <span aria-hidden>{name.slice(0, 2)}</span>
                <span className="sr-only">{name}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeksOf(focused).map((week, row) => (
            <tr key={row}>
              {week.map((day, index) => {
                if (!day) return <td key={index} role="gridcell" className="h-9 w-9 p-0" />;
                const selected = day === start || day === end;
                const inBand = Boolean(last) && day >= start && day <= last;
                const outside = Boolean((min && day < min) || (max && day > max));
                const isToday = day === today;
                return (
                  <td
                    key={day}
                    role="gridcell"
                    aria-selected={selected}
                    className={clsx(
                      "h-9 w-9 p-0",
                      inBand && "bg-brand-50 dark:bg-brand-500/15",
                      inBand && (day === start || index === 0 || day.endsWith("-01")) && "rounded-l-full",
                      inBand && (day === last || index === 6 || addDays(day, 1).endsWith("-01")) && "rounded-r-full",
                    )}
                  >
                    <button
                      type="button"
                      data-day={day}
                      tabIndex={day === focused ? 0 : -1}
                      disabled={outside}
                      aria-label={dayLabel(day)}
                      aria-current={isToday ? "date" : undefined}
                      onClick={() => choose(day)}
                      onMouseEnter={() => onPreview?.(day)}
                      onFocus={() => onPreview?.(day)}
                      className={clsx(
                        "relative grid h-9 w-9 place-items-center rounded-full text-sm tabular-nums transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1 dark:focus-visible:ring-brand-400 dark:focus-visible:ring-offset-slate-900",
                        selected && "bg-brand-600 font-semibold text-white dark:bg-brand-500",
                        !selected && outside && "cursor-not-allowed text-gray-300 dark:text-slate-600",
                        !selected &&
                          !outside &&
                          "cursor-pointer text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-slate-800",
                        !selected && !outside && inBand && "hover:bg-brand-100 dark:hover:bg-brand-500/30",
                        !selected && isToday && "font-semibold text-brand-700 dark:text-brand-300",
                        day === tentative && "ring-1 ring-brand-600 ring-inset dark:ring-brand-400",
                      )}
                    >
                      {Number(day.slice(8))}
                      {isToday && (
                        <span
                          aria-hidden
                          className={clsx(
                            "absolute bottom-1 h-1 w-1 rounded-full",
                            selected ? "bg-white" : "bg-brand-600 dark:bg-brand-400",
                          )}
                        />
                      )}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
