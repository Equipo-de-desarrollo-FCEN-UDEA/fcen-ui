import type { ReactNode } from "react";
import clsx from "clsx";
import { Avatar } from "../atoms/Avatar";

export type TablePersonProps = {
  name: string;
  detail?: string;
};

export type TableTitleProps = {
  title: string;
  subtitle?: string;
  muted?: boolean;
};

export type TableTextProps = {
  children: ReactNode;
};

export const TablePerson = ({ name, detail }: TablePersonProps) => (
  <span className="flex min-w-0 basis-full items-center gap-2.5 @5xl:basis-auto">
    <Avatar name={name} />
    <span className="flex min-w-0 flex-col gap-0.5">
      <span className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{name}</span>
      {detail && <span className="truncate text-xs text-gray-500 dark:text-gray-400">{detail}</span>}
    </span>
  </span>
);

export const TableTitle = ({ title, subtitle, muted = false }: TableTitleProps) => (
  <span className="flex min-w-0 basis-full flex-col gap-0.5 @5xl:basis-auto">
    <span
      className={clsx(
        "truncate text-sm font-semibold",
        muted ? "text-gray-500 dark:text-gray-400" : "text-gray-900 dark:text-gray-100",
      )}
    >
      {title}
    </span>
    {subtitle && <span className="truncate text-xs text-gray-500 dark:text-gray-400">{subtitle}</span>}
  </span>
);

export const TableText = ({ children }: TableTextProps) => (
  <span className="text-sm text-gray-700 dark:text-gray-300">{children}</span>
);
