type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  descriptionClassName?: string;
  mb?: string;
  align?: "center" | "left";
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  descriptionClassName,
  mb = "mb-10",
  align = "center",
}: SectionHeaderProps) {
  const alignClass = align === "left" ? "text-left" : "text-center";
  const marginClass = align === "left" ? "" : "mx-auto";

  return (
    <div className={`${alignClass} ${mb}`}>
      {eyebrow && (
        <p className="type-landing-eyebrow mb-2 animate-fade-up">
          {eyebrow}
        </p>
      )}
      <h2 className="type-landing-title animate-fade-up">{title}</h2>
      <p
        className={`mt-3 type-landing-body animate-fade-up ${marginClass} ${descriptionClassName ?? "max-w-120"}`}
        style={{ animationDelay: "100ms", animationFillMode: "both" }}
      >
        {description}
      </p>
    </div>
  );
}
