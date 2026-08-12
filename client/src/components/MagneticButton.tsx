import { useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { type VariantProps } from "class-variance-authority";
import { buttonVariants } from "@/components/ui/button";

type MagneticButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

/**
 * MagneticButton — wraps any button with a subtle magnetic pull effect.
 * When the cursor approaches, the button gently shifts 2-3px toward it.
 * The effect is barely perceptible but makes the UI feel alive and tactile.
 */
export function MagneticButton({
  children,
  className,
  onClick,
  style,
  ...props
}: MagneticButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const rafRef = useRef<number>(0);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = btnRef.current;
    if (!btn) return;

    cancelAnimationFrame(rafRef.current);

    rafRef.current = requestAnimationFrame(() => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      // Subtle pull: max 3px
      const pullX = Math.max(-3, Math.min(3, x * 0.05));
      const pullY = Math.max(-3, Math.min(3, y * 0.05));

      btn.style.transform = `translate(${pullX}px, ${pullY}px)`;
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    const btn = btnRef.current;
    if (!btn) return;
    cancelAnimationFrame(rafRef.current);
    btn.style.transform = "translate(0, 0)";
    btn.style.transition = "transform 0.3s cubic-bezier(0.23, 1, 0.32, 1)";
    setTimeout(() => {
      if (btn) btn.style.transition = "";
    }, 300);
  }, []);

  const handleMouseDown = useCallback(() => {
    const btn = btnRef.current;
    if (btn) {
      btn.style.transform = `translate(${btn.style.transform || "0,0"}) scale(0.97)`;
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    const btn = btnRef.current;
    if (btn) {
      btn.style.transform = "";
    }
  }, []);

  return (
    <button
      ref={btnRef}
      className={className}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      style={{ transition: "transform 0.15s cubic-bezier(0.23, 1, 0.32, 1)", ...style }}
      {...props}
    >
      {children}
    </button>
  );
}
