import { useEffect, useRef } from "react";

/**
 * AnimatedGrain — a barely-perceptible shifting film grain overlay.
 * Creates organic texture that makes the dark background feel alive
 * rather than flat. Uses CSS filter with animated noise displacement.
 */
export function AnimatedGrain({ opacity = 0.035 }: { opacity?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Small canvas for performance, scaled up by CSS
    canvas.width = 150;
    canvas.height = 150;

    let frame = 0;
    const imageData = ctx.createImageData(150, 150);
    const data = imageData.data;

    const animate = () => {
      frame++;
      // Only update every 4th frame for performance (still smooth enough)
      if (frame % 4 === 0) {
        for (let i = 0; i < data.length; i += 4) {
          const noise = Math.random() * 255;
          data[i] = noise;
          data[i + 1] = noise;
          data[i + 2] = noise;
          data[i + 3] = 255;
        }
        ctx.putImageData(imageData, 0, 0);
      }
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-50 mix-blend-overlay"
      style={{ opacity }}
      aria-hidden="true"
    />
  );
}
