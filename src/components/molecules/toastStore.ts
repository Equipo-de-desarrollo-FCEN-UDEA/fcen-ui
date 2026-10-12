import type { ToastTone } from "./Toast";

export type ToastItem = {
  id: number;
  tone: ToastTone;
  title: string;
  message?: string;
  duration: number;
};

export type ToastOptions = {
  message?: string;
  duration?: number;
};

type Listener = () => void;

export const DEFAULT_TOAST_DURATION = 4000;
const MAX_TOASTS = 4;

let items: ToastItem[] = [];
let nextId = 1;
const listeners = new Set<Listener>();

function emit() {
  for (const listener of listeners) listener();
}

export function subscribeToasts(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getToasts() {
  return items;
}

function push(tone: ToastTone, title: string, options: ToastOptions = {}) {
  const id = nextId++;
  const item: ToastItem = {
    id,
    tone,
    title,
    message: options.message,
    duration: options.duration ?? DEFAULT_TOAST_DURATION,
  };
  items = [...items, item].slice(-MAX_TOASTS);
  emit();
  return id;
}

function dismiss(id: number) {
  const remaining = items.filter((item) => item.id !== id);
  if (remaining.length === items.length) return;
  items = remaining;
  emit();
}

function clear() {
  items = [];
  emit();
}

export const toast = {
  success: (title: string, options?: ToastOptions) => push("success", title, options),
  error: (title: string, options?: ToastOptions) => push("error", title, options),
  warning: (title: string, options?: ToastOptions) => push("warning", title, options),
  info: (title: string, options?: ToastOptions) => push("info", title, options),
  dismiss,
  clear,
};
