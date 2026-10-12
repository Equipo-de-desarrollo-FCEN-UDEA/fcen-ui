import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";

export type TooltipPosition = "top" | "bottom" | "left" | "right";

export type TooltipProps = {
  content: ReactNode;
  children: ReactNode;
  position?: TooltipPosition;
  disabled?: boolean;
  className?: string;
};

const GAP = 8;

type Placement = { top: number; left: number; position: TooltipPosition };

function placeAround(trigger: DOMRect, tip: DOMRect, position: TooltipPosition): Placement {
  const centerLeft = trigger.left + trigger.width / 2 - tip.width / 2;
  const centerTop = trigger.top + trigger.height / 2 - tip.height / 2;
  const candidates: Record<TooltipPosition, Placement> = {
    top: { top: trigger.top - tip.height - GAP, left: centerLeft, position: "top" },
    bottom: { top: trigger.bottom + GAP, left: centerLeft, position: "bottom" },
    left: { top: centerTop, left: trigger.left - tip.width - GAP, position: "left" },
    right: { top: centerTop, left: trigger.right + GAP, position: "right" },
  };
  let placement = candidates[position];
  if (placement.top < GAP) placement = candidates.bottom;
  if (placement.top + tip.height > window.innerHeight - GAP) placement = candidates.top;
  if (placement.left < GAP) placement = candidates.right;
  if (placement.left + tip.width > window.innerWidth - GAP) placement = candidates.left;
  return placement;
}

const arrowClasses: Record<TooltipPosition, string> = {
  top: "-bottom-1 left-1/2 -translate-x-1/2 border-b border-r",
  bottom: "-top-1 left-1/2 -translate-x-1/2 border-t border-l",
  left: "-right-1 top-1/2 -translate-y-1/2 border-t border-r",
  right: "-left-1 top-1/2 -translate-y-1/2 border-b border-l",
};

export const Tooltip = ({ content, children, position = "top", disabled = false, className }: TooltipProps) => {
  const [visible, setVisible] = useState(false);
  const [placement, setPlacement] = useState<Placement>({ top: 0, left: 0, position });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const reposition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;
    setPlacement(
      placeAround(triggerRef.current.getBoundingClientRect(), tooltipRef.current.getBoundingClientRect(), position),
    );
  }, [position]);

  useEffect(() => {
    if (!visible) return;
    reposition();
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [reposition, visible]);

  if (disabled || !content) return <>{children}</>;

  const show = () => setVisible(true);
  const hide = () => setVisible(false);

  return (
    <>
      <span
        ref={triggerRef}
        className="relative inline-flex"
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        {children}
      </span>
      {createPortal(
        <div
          ref={tooltipRef}
          role="tooltip"
          aria-hidden={!visible}
          style={{ position: "fixed", top: placement.top, left: placement.left, zIndex: 9999 }}
          className={clsx(
            "pointer-events-none transition-opacity duration-100",
            visible ? "opacity-100" : "opacity-0",
            className,
          )}
        >
          <div className="relative max-w-xs rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-center text-xs font-bold text-white shadow-xl dark:border-slate-200 dark:bg-white dark:text-slate-900">
            {content}
            <span
              data-position={placement.position}
              className={clsx("absolute h-2 w-2 rotate-45 border-inherit bg-inherit", arrowClasses[placement.position])}
            />
          </div>
        </div>,
        document.body,
      )}
    </>
  );
};
