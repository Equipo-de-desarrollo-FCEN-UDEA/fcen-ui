import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { Toast } from "./Toast";
import { getToasts, subscribeToasts, toast, type ToastItem } from "./toastStore";

export type ToasterProps = {
  label?: string;
  className?: string;
};

function ToasterItem({ item }: { item: ToastItem }) {
  const close = () => toast.dismiss(item.id);
  return (
    <Toast
      tone={item.tone}
      title={item.title}
      message={item.message}
      duration={item.duration}
      onClose={close}
      onExpire={close}
      className="motion-safe:animate-toast-in"
    />
  );
}

export const Toaster = ({ label = "Avisos", className }: ToasterProps) => {
  const items = useSyncExternalStore(subscribeToasts, getToasts, getToasts);

  return createPortal(
    <section
      aria-label={label}
      aria-live="polite"
      className={clsx(
        "pointer-events-none fixed top-4 right-4 left-4 z-[60] flex flex-col items-end gap-3 sm:left-auto sm:w-96",
        className,
      )}
    >
      {items.map((item) => (
        <ToasterItem key={item.id} item={item} />
      ))}
    </section>,
    document.body,
  );
};
