import clsx from "clsx";
import type { CountryCode } from "libphonenumber-js/min";
import { countryName } from "../../utils/phone";

const FLAGS_DIR = "/node_modules/country-flag-icons/3x2";
const flags = import.meta.glob<string>("/node_modules/country-flag-icons/3x2/*.svg", {
  eager: true,
  query: "?url",
  import: "default",
});

export type CountryFlagProps = {
  country: CountryCode;
  className?: string;
};

export const CountryFlag = ({ country, className }: CountryFlagProps) => {
  const src = flags[`${FLAGS_DIR}/${country}.svg`];
  if (!src) return null;
  return (
    <img
      src={src}
      alt=""
      title={countryName(country)}
      loading="lazy"
      className={clsx("h-4 w-6 shrink-0 rounded-sm object-cover shadow-sm ring-1 ring-black/10", className)}
    />
  );
};
