export const WEEKDAYS = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];

const MONTHS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function pad(value: number, length = 2): string {
  return String(value).padStart(length, "0");
}

function fromIso(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
}

function toIso(date: Date): string {
  return `${pad(date.getFullYear(), 4)}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function isIsoDate(value: string): boolean {
  return ISO_DATE.test(value) && toIso(fromIso(value)) === value;
}

export function todayIso(): string {
  return toIso(new Date());
}

export function formatDate(value: string): string {
  if (!isIsoDate(value)) return "";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

export function addDays(value: string, amount: number): string {
  const date = fromIso(value);
  date.setDate(date.getDate() + amount);
  return toIso(date);
}

export function addMonths(value: string, amount: number): string {
  const date = fromIso(value);
  const target = new Date(date.getFullYear(), date.getMonth() + amount, 1, 12);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0, 12).getDate();
  target.setDate(Math.min(date.getDate(), lastDay));
  return toIso(target);
}

export function clampDate(value: string, min?: string, max?: string): string {
  if (min && value < min) return min;
  if (max && value > max) return max;
  return value;
}

export function weekdayIndex(value: string): number {
  return (fromIso(value).getDay() + 6) % 7;
}

export function monthDays(value: string): string[] {
  const first = `${value.slice(0, 8)}01`;
  const count = fromIso(addDays(addMonths(first, 1), -1)).getDate();
  return Array.from({ length: count }, (_, index) => `${value.slice(0, 8)}${pad(index + 1)}`);
}

export function monthLabel(value: string): string {
  const date = fromIso(value);
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function dayLabel(value: string): string {
  const date = fromIso(value);
  return `${WEEKDAYS[weekdayIndex(value)]}, ${date.getDate()} de ${MONTHS[date.getMonth()]} de ${date.getFullYear()}`;
}
