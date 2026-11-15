import { useMemo, useState } from "react";
import { Dropdown, type DropdownOption } from "./Dropdown";

export type AcademicUnitOption = {
  id: string;
  name: string;
  children?: AcademicUnitOption[];
};

export type DropdownAcademicUnitProps = {
  units: AcademicUnitOption[];
  value: string;
  onSelect: (id: string) => void;
  placeholder?: string;
  selectedLabel?: string;
  onSelectWithLabel?: (id: string, label: string) => void;
  disabled?: boolean;
  className?: string;
};

const toOptions = (units: AcademicUnitOption[]): DropdownOption<string>[] =>
  units.map((unit) => ({
    value: unit.id,
    label: unit.name,
    children: unit.children?.length ? toOptions(unit.children) : undefined,
  }));

const findLabel = (options: DropdownOption<string>[], value: string): string | undefined => {
  for (const option of options) {
    if (option.value === value) return option.label;
    const nested = option.children && findLabel(option.children, value);
    if (nested) return nested;
  }
  return undefined;
};

export const DropdownAcademicUnit = ({
  units,
  value,
  onSelect,
  placeholder,
  selectedLabel,
  onSelectWithLabel,
  disabled,
  className,
}: DropdownAcademicUnitProps) => {
  const [cachedSelection, setCachedSelection] = useState<{ id: string; label: string } | null>(null);
  const options = useMemo(() => toOptions(units), [units]);
  const currentLabel = findLabel(options, value);
  const handleSelect = (id: string, option?: DropdownOption<string>) => {
    const label = option?.label ?? findLabel(options, id);
    if (label) {
      setCachedSelection({ id, label });
      onSelectWithLabel?.(id, label);
    }
    onSelect(id);
  };

  return (
    <Dropdown
      title={currentLabel || (cachedSelection?.id === value ? cachedSelection.label : "") || selectedLabel || placeholder || "Seleccionar Unidad"}
      options={options}
      onSelect={handleSelect}
      disabled={disabled}
      className={className}
    />
  );
};
