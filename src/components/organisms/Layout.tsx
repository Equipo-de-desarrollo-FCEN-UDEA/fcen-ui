import { useLayoutEffect, useRef, type ReactNode } from "react";
import clsx from "clsx";
import { SHELL_CONTAINER, SHELL_TOP_BAR_HEIGHT } from "./shellContainer";

export type PageHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
};

export const PageHeader = ({ title, subtitle, actions, className }: PageHeaderProps) => (
  <div
    className={clsx(
      "flex flex-col gap-4 motion-safe:animate-fade-up sm:flex-row sm:items-center sm:justify-between",
      className,
    )}
  >
    <div className="flex min-w-0 flex-col gap-1">
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50">{title}</h1>
      {subtitle && <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

export type FooterProps = {
  text?: string;
  year?: number;
  className?: string;
};

export const Footer = ({
  text = "Equipo de desarrollo de la Facultad de Ciencias Exactas y Naturales",
  year = new Date().getFullYear(),
  className,
}: FooterProps) => (
  <footer className={clsx("bg-brand-800 px-6 py-4 text-center text-sm text-white dark:bg-brand-900", className)}>
    © {year} {text}
  </footer>
);

export type AppShellProps = {
  topBar: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export const AppShell = ({ topBar, children, footer = <Footer />, className }: AppShellProps) => {
  const shellRef = useRef<HTMLDivElement>(null);
  const topBarRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const shell = shellRef.current as HTMLDivElement;
    const bar = topBarRef.current as HTMLDivElement;
    const publish = () => shell.style.setProperty(SHELL_TOP_BAR_HEIGHT, `${bar.offsetHeight}px`);
    publish();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(publish);
    observer.observe(bar);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={shellRef}
      className="flex min-h-screen flex-col bg-gray-50 text-gray-900 dark:bg-slate-950 dark:text-gray-50"
    >
      <div ref={topBarRef} className="sticky top-0 z-40">
        {topBar}
      </div>
      <main className={clsx(SHELL_CONTAINER, "flex flex-1 flex-col gap-6 pt-8 pb-16", className)}>
        {children}
      </main>
      {footer}
    </div>
  );
};
