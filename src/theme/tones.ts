export type Tone = "info" | "review" | "warning" | "success" | "danger" | "neutral";

export type ToneStyles = {
  badge: string;
  dot: string;
  halo: string;
  soft: string;
  softBorder: string;
  softText: string;
  solid: string;
  tile: string;
};

export const tones: Record<Tone, ToneStyles> = {
  info: {
    badge: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/30",
    dot: "bg-sky-500",
    halo: "bg-sky-400",
    soft: "bg-sky-50/70 dark:bg-sky-500/5",
    softBorder: "border-sky-200 dark:border-sky-500/30",
    softText: "text-sky-700 dark:text-sky-300",
    solid: "bg-sky-500",
    tile: "bg-gradient-to-br from-sky-400 to-sky-500 shadow-sky-500/30 hover:ring-sky-200 dark:hover:ring-sky-500/30",
  },
  review: {
    badge:
      "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-500/30",
    dot: "bg-violet-500",
    halo: "bg-violet-400",
    soft: "bg-violet-50/70 dark:bg-violet-500/5",
    softBorder: "border-violet-200 dark:border-violet-500/30",
    softText: "text-violet-700 dark:text-violet-300",
    solid: "bg-violet-500",
    tile: "bg-gradient-to-br from-violet-400 to-violet-500 shadow-violet-500/30 hover:ring-violet-200 dark:hover:ring-violet-500/30",
  },
  warning: {
    badge:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30",
    dot: "bg-amber-500",
    halo: "bg-amber-400",
    soft: "bg-amber-50/70 dark:bg-amber-500/5",
    softBorder: "border-amber-200 dark:border-amber-500/30",
    softText: "text-amber-700 dark:text-amber-300",
    solid: "bg-amber-500",
    tile: "bg-gradient-to-br from-amber-300 to-amber-500 shadow-amber-500/30 hover:ring-amber-200 dark:hover:ring-amber-500/30",
  },
  success: {
    badge:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30",
    dot: "bg-emerald-500",
    halo: "bg-emerald-400",
    soft: "bg-emerald-50/70 dark:bg-emerald-500/5",
    softBorder: "border-emerald-200 dark:border-emerald-500/30",
    softText: "text-emerald-700 dark:text-emerald-300",
    solid: "bg-emerald-500",
    tile: "bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-600/30 hover:ring-emerald-200 dark:hover:ring-emerald-500/30",
  },
  danger: {
    badge: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/30",
    dot: "bg-rose-500",
    halo: "bg-rose-400",
    soft: "bg-rose-50/70 dark:bg-rose-500/5",
    softBorder: "border-rose-200 dark:border-rose-500/30",
    softText: "text-rose-700 dark:text-rose-300",
    solid: "bg-rose-500",
    tile: "bg-gradient-to-br from-rose-500 to-rose-600 shadow-rose-600/30 hover:ring-rose-200 dark:hover:ring-rose-500/30",
  },
  neutral: {
    badge:
      "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700/40 dark:text-slate-300 dark:border-slate-600/50",
    dot: "bg-slate-400",
    halo: "bg-slate-300",
    soft: "bg-slate-50 dark:bg-slate-800/50",
    softBorder: "border-slate-200 dark:border-slate-700",
    softText: "text-slate-600 dark:text-slate-300",
    solid: "bg-slate-400",
    tile: "bg-gradient-to-br from-slate-400 to-slate-500 shadow-slate-500/30 hover:ring-slate-200 dark:hover:ring-slate-500/30",
  },
};
