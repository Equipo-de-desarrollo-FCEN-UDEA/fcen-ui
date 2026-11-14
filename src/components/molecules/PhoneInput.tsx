import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import clsx from "clsx";
import type { CountryCode } from "libphonenumber-js/min";
import { Input } from "../atoms/Input";
import { CountryFlag } from "../atoms/CountryFlag";
import { SearchableSelect } from "../atoms/SearchableSelect";
import {
  countryOptions,
  groupDigits,
  joinPhone,
  maxNationalDigits,
  onlyDigits,
  phoneError,
  splitPhone,
} from "../../utils/phone";

export type PhoneInputProps = {
  defaultValue?: string | null;
  disabled?: boolean;
  className?: string;
  label?: string;
  countryLabel?: string;
  onChange: (phone: string) => void;
};

const digitPosition = (formatted: string, digitsBefore: number) => {
  let seen = 0;
  let position = 0;
  while (position < formatted.length && seen < digitsBefore) {
    if (/\d/.test(formatted[position])) seen += 1;
    position += 1;
  }
  return position;
};

export const PhoneInput = ({
  defaultValue,
  disabled = false,
  className,
  label,
  countryLabel = "País",
  onChange,
}: PhoneInputProps) => {
  const initial = useMemo(() => splitPhone(defaultValue), [defaultValue]);
  const [country, setCountry] = useState<CountryCode>(initial.country);
  const [national, setNational] = useState(initial.national);
  const inputRef = useRef<HTMLInputElement>(null);
  const caretDigits = useRef<number | null>(null);
  const options = useMemo(
    () => countryOptions.map((option) => ({
      value: option.country,
      label: `${option.name} +${option.callingCode}`,
      selectedLabel: `+${option.callingCode}`,
      icon: <CountryFlag country={option.country} />,
    })),
    [],
  );

  useEffect(() => {
    inputRef.current?.setCustomValidity(phoneError(initial) ?? "");
  }, [initial]);

  useLayoutEffect(() => {
    const input = inputRef.current;
    if (!input || caretDigits.current === null) return;
    const position = digitPosition(input.value, caretDigits.current);
    input.setSelectionRange(position, position);
    caretDigits.current = null;
  }, [national]);

  const update = (nextCountry: CountryCode, nextNational: string) => {
    const next = {
      country: nextCountry,
      national: nextNational.slice(0, maxNationalDigits(nextCountry)),
    };
    inputRef.current?.setCustomValidity(phoneError(next) ?? "");
    setCountry(next.country);
    setNational(next.national);
    onChange(joinPhone(next));
  };

  const handleNationalChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value, selectionStart } = event.target;
    const caret = selectionStart ?? value.length;
    let digits = onlyDigits(value);
    let digitsBefore = onlyDigits(value.slice(0, caret)).length;
    const removedOnlySpace = digits === national && value.length < groupDigits(national).length;
    if (removedOnlySpace && digitsBefore > 0) {
      digits = digits.slice(0, digitsBefore - 1) + digits.slice(digitsBefore);
      digitsBefore -= 1;
    }
    caretDigits.current = digitsBefore;
    update(country, digits);
  };

  const handleCountryChange = (value: string) => {
    const next = countryOptions.find((option) => option.country === value);
    if (next) update(next.country, national);
  };

  return (
    <div className={clsx("flex w-full flex-col gap-1.5", className)}>
      {label && <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{label}</span>}
      <div className="flex flex-col gap-2 sm:flex-row">
        <SearchableSelect
          className="w-full shrink-0 sm:w-32"
          inputClassName="border-slate-200 dark:border-slate-700"
          options={options}
          value={country}
          placeholder={countryLabel}
          aria-label={countryLabel}
          dropdownMinWidth={280}
          disabled={disabled}
          onChange={handleCountryChange}
        />
        <Input
          ref={inputRef}
          aria-label={label ?? "Teléfono"}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="Ej: 305 245 1024"
          value={groupDigits(national)}
          onChange={handleNationalChange}
          disabled={disabled}
          className="border-slate-200 dark:border-slate-700"
        />
      </div>
    </div>
  );
};
