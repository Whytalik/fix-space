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
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
          maskImage: "radial-gradient(ellipse 100% 100% at 50% 0%, #000 20%, transparent 90%)",
          WebkitMaskImage: "radial-gradient(ellipse 100% 100% at 50% 0%, #000 20%, transparent 90%)",
          transform: "perspective(600px) rotateX(45deg) translateY(-10%) scale(2)",
          transformOrigin: "top",
          opacity: 0.8,
        }}
      />
    </div>
  );
}
