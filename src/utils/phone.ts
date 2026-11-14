import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
  validatePhoneNumberLength,
  type CountryCode,
} from "libphonenumber-js/min";
import metadata from "libphonenumber-js/min/metadata";

export const DEFAULT_COUNTRY: CountryCode = "CO";

const LOCAL_LENGTH = 10;
const MIN_DIGITS = 10;
const MAX_DIGITS = 15;
const regionNames = new Intl.DisplayNames(["es"], { type: "region" });

export type CountryOption = {
  country: CountryCode;
  name: string;
  callingCode: string;
};

export type SplitPhone = {
  country: CountryCode;
  national: string;
};

export const countryName = (country: CountryCode) => regionNames.of(country) ?? country;

export const countryOptions: CountryOption[] = getCountries()
  .map((country) => ({
    country,
    name: countryName(country),
    callingCode: getCountryCallingCode(country),
  }))
  .sort((a, b) => {
    if (a.country === DEFAULT_COUNTRY) return -1;
    if (b.country === DEFAULT_COUNTRY) return 1;
    return a.name.localeCompare(b.name, "es");
  });

export const onlyDigits = (value: string) => value.replace(/\D/g, "");

export const maxNationalDigits = (country: CountryCode) =>
  MAX_DIGITS - getCountryCallingCode(country).length;

export const splitPhone = (phone: string | null | undefined): SplitPhone => {
  const digits = onlyDigits(phone ?? "");
  if (digits.length <= LOCAL_LENGTH) {
    return { country: DEFAULT_COUNTRY, national: digits };
  }

  const parsed = parsePhoneNumberFromString(`+${digits}`);
  const country = parsed?.country ?? metadata.country_calling_codes[parsed?.countryCallingCode ?? ""]?.[0];
  if (!parsed || !country) return { country: DEFAULT_COUNTRY, national: digits };
  return { country, national: parsed.nationalNumber };
};

export const joinPhone = ({ country, national }: SplitPhone) =>
  national ? `${getCountryCallingCode(country)}${national}` : "";

export const groupDigits = (digits: string) =>
  [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6)].filter(Boolean).join(" ");

export const formatPhone = (phone: string | null | undefined) => {
  const parsed = splitPhone(phone);
  if (!parsed.national) return "";
  return `${getCountryCallingCode(parsed.country)} ${groupDigits(parsed.national)}`;
};

export const phoneError = ({ country, national }: SplitPhone) => {
  if (!national) return null;
  const total = getCountryCallingCode(country).length + national.length;
  const fitsBackend = total >= MIN_DIGITS && total <= MAX_DIGITS;
  if (fitsBackend && !validatePhoneNumberLength(national, country)) return null;
  return `El número no tiene la cantidad de dígitos de un teléfono de ${countryName(country)}`;
};
