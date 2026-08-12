import { useRef, type ReactNode } from "react";

interface ParallaxTiltProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
}

/**
 * Subtle card tilt on hover — max 1-2 degrees rotation.
 * Tracks mouse position relative to the card center and applies
 * a gentle perspective tilt. Very subtle, not gimmicky.
 */
export function ParallaxTilt({ children, className = "", maxTilt = 1.5 }: ParallaxTiltProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;
    el.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.005, 1.005, 1.005)`;
  };

  const handleMouseLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
  };

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transition: "transform 0.15s cubic-bezier(0.23, 1, 0.32, 1)", willChange: "transform" }}
    >
      {children}
    </div>
  );
}
