import { useMemo, useState } from "react";
import { Chip } from "../atoms/Chip";
import { SearchableSelect } from "../atoms/SearchableSelect";

export type MultiSelectChipsOption = {
  value: string;
  label: string;
};

export type MultiSelectChipsProps = {
  options: MultiSelectChipsOption[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  label?: string;
  helperText?: string;
  className?: string;
};

export const MultiSelectChips = ({
  options,
  selected,
  onChange,
  placeholder = "Seleccionar...",
  label,
  helperText,
  className,
}: MultiSelectChipsProps) => {
  const [selectValue, setSelectValue] = useState("");
  const available = useMemo(() => options.filter((option) => !selected.includes(option.value)), [options, selected]);
  const selectedOptions = useMemo(() => options.filter((option) => selected.includes(option.value)), [options, selected]);

  const add = (value: string) => {
    if (!selected.includes(value)) onChange([...selected, value]);
    setSelectValue("");
  };
  const remove = (value: string) => onChange(selected.filter((item) => item !== value));

  return (
    <div className={className}>
      <SearchableSelect
        label={label}
        options={available}
        value={selectValue}
        onChange={add}
        placeholder={placeholder}
        helperText={helperText}
      />
      {selectedOptions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {selectedOptions.map((option) => (
            <Chip key={option.value} label={option.label} onRemove={() => remove(option.value)} />
          ))}
        </div>
      )}
    </div>
  );
};
