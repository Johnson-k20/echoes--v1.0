import { useEffect, useRef } from "react";

/**
 * CursorGlow — a subtle, warm ambient light that follows the cursor.
 * Creates a sense of "carrying a candle" through the dark space.
 * Very low opacity so it never distracts.
 */
export function CursorGlow({ radius = 300 }: { radius?: number }) {
  const glowRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const targetX = useRef(0);
  const targetY = useRef(0);
  const currentX = useRef(0);
  const currentY = useRef(0);

  useEffect(() => {
    const isTouchDevice = "ontouchstart" in window;
    if (isTouchDevice) return;

    const handleMouseMove = (e: MouseEvent) => {
      targetX.current = e.clientX;
      targetY.current = e.clientY;
    };

    const animate = () => {
      // Smooth lerp for organic lag
      currentX.current += (targetX.current - currentX.current) * 0.08;
      currentY.current += (targetY.current - currentY.current) * 0.08;

      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${currentX.current - radius}px, ${currentY.current - radius}px)`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [radius]);

  return (
    <div
      ref={glowRef}
      className="fixed pointer-events-none z-0 rounded-full"
      style={{
        width: radius * 2,
        height: radius * 2,
        background: "radial-gradient(circle, oklch(0.78 0.14 80 / 0.03) 0%, oklch(0.78 0.14 80 / 0.01) 40%, transparent 70%)",
        filter: "blur(20px)",
      }}
      aria-hidden="true"
    />
  );
}
