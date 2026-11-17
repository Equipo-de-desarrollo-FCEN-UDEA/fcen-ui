import { useState } from "react";
import { Calendar } from "./Calendar";
import { DateField } from "./DateField";
import { formatDate, isIsoDate, todayIso } from "../../utils/dates";

export type DateRange = { from: string; to: string };

export type DateRangePickerProps = {
  from: string;
  to: string;
  onChange: (range: DateRange) => void;
  label?: string;
  "aria-label"?: string;
  placeholder?: string;
  min?: string;
  max?: string;
  invalid?: boolean;
  "aria-describedby"?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
};

type RangeCalendarProps = {
  range: DateRange;
  min?: string;
  max?: string;
  onComplete: (range: DateRange) => void;
};

function rangeText(from: string, to: string): string {
  if (!from && !to) return "";
  return `${from ? formatDate(from) : "…"} – ${to ? formatDate(to) : "…"}`;
}

function RangeCalendar({ range, min, max, onComplete }: RangeCalendarProps) {
  const [draft, setDraft] = useState(range);
  const [preview, setPreview] = useState("");
  const picking = Boolean(draft.from) && !draft.to;

  const pick = (day: string) => {
    if (picking && day >= draft.from) onComplete({ from: draft.from, to: day });
    else setDraft({ from: day, to: "" });
  };

  return (
    <Calendar
      start={draft.from}
      end={draft.to}
      preview={picking ? preview : ""}
      initial={draft.from || draft.to || todayIso()}
      min={min}
      max={max}
      onSelect={pick}
      onPreview={setPreview}
    />
  );
}

export const DateRangePicker = ({
  from,
  to,
  onChange,
  placeholder = "Seleccionar fechas",
  min,
  max,
  ...field
}: DateRangePickerProps) => {
  const range = { from: isIsoDate(from) ? from : "", to: isIsoDate(to) ? to : "" };

  return (
    <DateField
      {...field}
      text={rangeText(range.from, range.to)}
      placeholder={placeholder}
      clearLabel="Borrar fechas"
      onClear={() => onChange({ from: "", to: "" })}
    >
      {(close) => (
        <RangeCalendar
          range={range}
          min={min}
          max={max}
          onComplete={(next) => {
            onChange(next);
            close();
          }}
        />
      )}
    </DateField>
  );
};
