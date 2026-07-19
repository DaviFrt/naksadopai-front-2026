import type { CSSProperties } from "react";

const PARTICLE_COUNT = 24;

const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
  // Determinístico (função de i) em vez de Math.random() direto, pra o servidor
  // e o cliente renderizarem exatamente igual na primeira passada.
  const left = (i * 41) % 100;
  const size = 2 + (i % 3);
  const duration = 10 + (i % 7);
  const delay = (i * 0.7) % duration;
  const drift = ((i % 5) - 2) * 20;

  return { left, size, duration, delay, drift };
});

export function GlowBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -left-40 top-1/3 h-96 w-96 rounded-full bg-primary/10 blur-3xl animate-[glow-float_7s_ease-in-out_infinite]" />
      <div className="absolute -right-32 top-10 h-80 w-80 rounded-full bg-primary/10 blur-3xl animate-[glow-float_9s_ease-in-out_infinite] [animation-delay:2s]" />
      <div className="absolute left-1/2 bottom-0 h-72 w-72 -translate-x-1/2 rounded-full bg-secondary/10 blur-3xl animate-[glow-float_10s_ease-in-out_infinite] [animation-delay:3.5s]" />

      {particles.map((p, i) => (
        <span
          key={i}
          className="absolute bottom-0 rounded-full bg-primary/70 animate-[particle-rise_linear_infinite]"
          style={
            {
              left: `${p.left}%`,
              width: p.size,
              height: p.size,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              "--drift": `${p.drift}px`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
