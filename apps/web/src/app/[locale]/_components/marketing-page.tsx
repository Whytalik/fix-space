import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header/landing/header";
import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import { FeaturesSection } from "./landing/features-section";
import { FragmentationSection } from "./landing/fragmentation-section";
import { HeroSection } from "./landing/hero-section";
import { InstrumentTypesSection } from "./landing/instrument-types-section";
import { LandingBackground } from "./landing/landing-background";
import { LandingJsonLd } from "./landing/landing-json-ld";
import { LandingSection } from "./landing/landing-section";
import { SolutionSection } from "./landing/solution-section";
import { SpecializedSection } from "./landing/specialized-section";

const TemplatesSection = dynamic(() => import("./landing/templates-section").then((mod) => mod.TemplatesSection));
const HowItWorksSection = dynamic(() => import("./landing/how-it-works-section").then((mod) => mod.HowItWorksSection));
const ImportSection = dynamic(() => import("./landing/import-section").then((mod) => mod.ImportSection));
const FaqSection = dynamic(() => import("./landing/faq-section").then((mod) => mod.FaqSection));
const CtaSection = dynamic(() => import("./landing/cta-section").then((mod) => mod.CtaSection));

type MarketingPageProps = {
  locale: string;
};

export function MarketingPage({ locale }: MarketingPageProps) {
  const sections: { id: string; component: ComponentType; noBorder?: boolean }[] = [
    { id: "problem", component: FragmentationSection },
    { id: "data-types", component: InstrumentTypesSection },
    { id: "market-analysis", component: SpecializedSection },
    { id: "solution", component: SolutionSection },
    { id: "features", component: FeaturesSection },
    { id: "templates", component: TemplatesSection },
    { id: "workflow", component: HowItWorksSection },
    { id: "import", component: ImportSection },
    { id: "faq", component: FaqSection },
    { id: "cta", component: CtaSection },
  ];

  return (
    <div className="relative flex flex-col w-full bg-canvas overflow-x-hidden h-screen overflow-y-auto scrollbar">
      <LandingJsonLd locale={locale} />
      <Header />
      <div className="flex-1 relative">
        <LandingBackground />

        <div className="relative z-10 w-full flex flex-col">
          <HeroSection />

          {sections.map(({ id, component: Component, noBorder }, index) => {
            const variant = index % 2 === 0 ? "surface" : "canvas";
            return (
              <LandingSection key={id} id={id} variant={variant} noBorder={noBorder}>
                <Component />
              </LandingSection>
            );
          })}
        </div>
      </div>
      <Footer />
    </div>
  );
}
