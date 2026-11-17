import { Calendar } from "./Calendar";
import { DateField } from "./DateField";
import { formatDate, todayIso } from "../../utils/dates";

export type DatePickerProps = {
  value: string;
  onChange: (value: string) => void;
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

export const DatePicker = ({
  value,
  onChange,
  placeholder = "Seleccionar fecha",
  min,
  max,
  ...field
}: DatePickerProps) => {
  const text = formatDate(value);
  const selected = text ? value : "";

  return (
    <DateField {...field} text={text} placeholder={placeholder} clearLabel="Borrar fecha" onClear={() => onChange("")}>
      {(close) => (
        <Calendar
          start={selected}
          end=""
          preview=""
          initial={selected || todayIso()}
          min={min}
          max={max}
          onSelect={(day) => {
            onChange(day);
            close();
          }}
        />
      )}
    </DateField>
  );
};
