import { useEffect, useRef } from "react";

/**
 * Ambient light orbs — soft, drifting radial gradients that create
 * a sense of depth and warmth in the background.
 */
export function AmbientOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      <div className="orb orb-amber w-96 h-96 top-[-10%] left-[10%] opacity-40" />
      <div className="orb orb-blue w-80 h-80 bottom-[20%] right-[-5%] opacity-30" style={{ animationDelay: "-4s" }} />
      <div className="orb orb-warm w-64 h-64 top-[40%] left-[60%] opacity-20" style={{ animationDelay: "-8s" }} />
    </div>
  );
}

/**
 * Floating dust-mote particles — tiny luminous specks drifting upward.
 */
export function ParticleField({ count = 30 }: { count?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear existing
    container.innerHTML = "";

    for (let i = 0; i < count; i++) {
      const particle = document.createElement("div");
      particle.className = "particle";
      const left = Math.random() * 100;
      const size = Math.random() * 2 + 1;
      const duration = Math.random() * 15 + 10;
      const delay = Math.random() * 15;
      const opacity = Math.random() * 0.4 + 0.1;

      particle.style.cssText = `
        left: ${left}%;
        width: ${size}px;
        height: ${size}px;
        animation-duration: ${duration}s;
        animation-delay: ${delay}s;
        opacity: ${opacity};
      `;

      container.appendChild(particle);
    }

    return () => {
      container.innerHTML = "";
    };
  }, [count]);

  return <div ref={containerRef} className="particle-field" aria-hidden="true" />;
}
