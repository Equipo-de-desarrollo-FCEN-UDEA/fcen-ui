export const colors = {
  primary: {
    base: "bg-brand-600 text-white disabled:bg-brand-300 disabled:text-white/70 dark:bg-brand-500 dark:text-white dark:disabled:bg-brand-800/60 dark:disabled:text-slate-300/80",
    hover: "enabled:hover:bg-brand-700 dark:enabled:hover:bg-brand-400",
    hoverSolid: "enabled:hover:bg-brand-600 dark:enabled:hover:bg-brand-500",
    text: "text-brand-600 dark:text-brand-300",
    ring: "focus-visible:ring-brand-600 dark:focus-visible:ring-brand-400",
    border: "border-brand-600 dark:border-brand-400",
  },
  secondary: {
    base: "bg-gray-600 text-white disabled:bg-gray-300 disabled:text-white/70 dark:bg-slate-600 dark:text-slate-50 dark:disabled:bg-slate-700/60 dark:disabled:text-slate-400/80",
    hover: "enabled:hover:bg-gray-700 dark:enabled:hover:bg-slate-500",
    text: "text-gray-600 dark:text-gray-300",
    ring: "focus-visible:ring-gray-600 dark:focus-visible:ring-slate-400",
  },
  danger: {
    base: "bg-red-600 text-white dark:bg-rose-600 dark:text-slate-50",
    hover: "enabled:hover:bg-red-700 dark:enabled:hover:bg-rose-500",
    text: "text-red-600 dark:text-rose-300",
    ring: "focus-visible:ring-red-600 dark:focus-visible:ring-rose-400",
    border: "border-red-600 dark:border-rose-500",
  },
  neutral: {
    text: "text-gray-700 dark:text-gray-200",
    subtext: "text-gray-500 dark:text-gray-400",
    border: "border-gray-300 dark:border-slate-700",
    bg: "bg-white dark:bg-slate-900",
  },
  field: {
    base: "rounded-xl border bg-white text-gray-700 outline-none transition-[border-color,box-shadow] placeholder:text-gray-400 dark:bg-slate-900 dark:text-gray-100 dark:placeholder:text-gray-500",
    idle: "border-gray-300 focus:border-brand-600 focus:shadow-focus dark:border-slate-700 dark:focus:border-brand-400",
    error: "border-red-600 focus:shadow-focus-danger dark:border-rose-500",
    disabled: "disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 dark:disabled:bg-slate-800",
  },
};
