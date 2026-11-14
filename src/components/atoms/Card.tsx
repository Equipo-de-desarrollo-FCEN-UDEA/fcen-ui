import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import clsx from "clsx";

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export const Card = forwardRef<HTMLDivElement, CardProps>(({ children, className, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx(
      "rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900",
      className,
    )}
    {...props}
  >
    {children}
  </div>
));
Card.displayName = "Card";

export const CardHeader = forwardRef<HTMLDivElement, CardProps>(({ children, className, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx("border-b border-gray-200 px-6 py-4 dark:border-slate-700", className)}
    {...props}
  >
    {children}
  </div>
));
CardHeader.displayName = "CardHeader";

export type CardTitleProps = HTMLAttributes<HTMLHeadingElement> & {
  children: ReactNode;
};

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(({ children, className, ...props }, ref) => (
  <h3
    ref={ref}
    className={clsx("text-lg font-semibold text-gray-900 dark:text-white", className)}
    {...props}
  >
    {children}
  </h3>
));
CardTitle.displayName = "CardTitle";

export const CardContent = forwardRef<HTMLDivElement, CardProps>(({ children, className, ...props }, ref) => (
  <div ref={ref} className={clsx("p-6", className)} {...props}>
    {children}
  </div>
));
CardContent.displayName = "CardContent";
