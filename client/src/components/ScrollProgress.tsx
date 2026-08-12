import { useEffect, useState } from "react";

/**
 * ScrollProgress — a thin amber line at the top of the page that
 * indicates scroll progress. Barely visible (2px) but adds a
 * subtle sense of depth and orientation.
 */
export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(scrollPercent);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-[2px] pointer-events-none">
      <div
        className="h-full transition-all duration-150 ease-out"
        style={{
          width: `${progress}%`,
          background: "linear-gradient(90deg, transparent, oklch(0.78 0.14 80 / 0.4), oklch(0.78 0.14 80 / 0.2))",
          boxShadow: "0 0 8px oklch(0.78 0.14 80 / 0.15)",
        }}
      />
    </div>
  );
}
