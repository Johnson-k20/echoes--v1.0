import { useRef, useCallback, type ReactNode } from "react";

interface LiquidRippleProps {
  children: ReactNode;
  className?: string;
  /** Called on press — merges with the element's own onClick if both are provided */
  onClick?: (e: React.MouseEvent) => void;
  /** Ripple color, defaults to warm amber */
  color?: string;
  as?: "button" | "div";
}

/**
 * LiquidRipple — an organic "liquid ripple" on button press.
 * Unlike Material's geometric ripple, this one blooms from the exact press
 * point as an expanding, soft-edged, fading ring — like a drop hitting still water.
 * Applied directly to real interactive controls.
 */
export function LiquidRipple({
  children,
  className = "",
  onClick,
  color = "245, 158, 11", // amber
  as = "button",
}: LiquidRippleProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      const el = containerRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        const ripple = document.createElement("span");
        ripple.className = "liquid-ripple";
        ripple.style.cssText = `
          position: absolute;
          left: ${x}px;
          top: ${y}px;
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(${color} / 0.35) 0%, rgba(${color} / 0.1) 55%, transparent 70%);
          transform: scale(0);
          opacity: 1;
          pointer-events: none;
          animation: liquidRipple 0.7s cubic-bezier(0.23, 1, 0.32, 1) forwards;
        `;
        el.appendChild(ripple);
        setTimeout(() => ripple.remove(), 700);
      }
      onClick?.(e);
    },
    [onClick, color]
  );

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      className={`relative overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
}
