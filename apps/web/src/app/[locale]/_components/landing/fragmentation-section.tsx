import { BrainCircuit, CopyX, SearchX } from "lucide-react";
import { useTranslations } from "next-intl";
import { SectionHeader } from "./section-header";

export function FragmentationSection() {
  const t = useTranslations("Landing");
  const tNav = useTranslations("LandingNav");

  const blocks = [
    {
      key: "focus",
      icon: <CopyX size={24} className="text-accent" />,
    },
    {
      key: "analysis",
      icon: <SearchX size={24} className="text-accent" />,
    },
    {
      key: "patterns",
      icon: <BrainCircuit size={24} className="text-accent" />,
    },
  ];

  return (
    <>
      <SectionHeader
        eyebrow={tNav("problem")}
        title={t("fragmentation.title")}
        description={t("fragmentation.description")}
        descriptionClassName="mt-4 max-w-140"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-12">
        {blocks.map((block) => (
          <div key={block.key} className="flex flex-col items-center text-center p-6">
            <div className="bg-accent/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-5">{block.icon}</div>
            <h3 className="type-landing-h3 mb-2">{t(`fragmentation.${block.key}.title`)}</h3>
            <p className="type-landing-body">{t(`fragmentation.${block.key}.description`)}</p>
          </div>
        ))}
      </div>
    </>
  );
}
