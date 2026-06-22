export function LandingBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" style={{ backgroundColor: "var(--color-canvas)" }}>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 50% at 50% -20%, rgba(37, 99, 235, 0.15), transparent 80%),
            radial-gradient(circle at 50% 50%, transparent 0%, var(--color-canvas) 90%)
          `,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 0%, black 20%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 0%, black 20%, transparent 100%)",
          transform: "perspective(800px) rotateX(45deg) translateY(-5%) scale(1.8)",
          transformOrigin: "top",
          willChange: "transform",
          opacity: 0.6,
        }}
      />
    </div>
  );
}
