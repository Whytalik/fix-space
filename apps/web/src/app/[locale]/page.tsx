import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header/header";
import { getMeServer } from "@/lib/auth-server";
import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import DashboardLayout from "./(dashboard)/layout";
import { DashboardView } from "./_components/dashboard-view";
import { FeaturesSection } from "./_components/landing/features-section";
import { FragmentationSection } from "./_components/landing/fragmentation-section";
import { HeroSection } from "./_components/landing/hero-section";
import { InstrumentTypesSection } from "./_components/landing/instrument-types-section";
import { LandingBackground } from "./_components/landing/landing-background";
import { LandingJsonLd } from "./_components/landing/landing-json-ld";
import { LandingSection } from "./_components/landing/landing-section";
import { SolutionSection } from "./_components/landing/solution-section";
import { SpecializedSection } from "./_components/landing/specialized-section";

const TemplatesSection = dynamic(() =>
  import("./_components/landing/templates-section").then((mod) => mod.TemplatesSection),
);
const HowItWorksSection = dynamic(() =>
  import("./_components/landing/how-it-works-section").then((mod) => mod.HowItWorksSection),
);
const ImportSection = dynamic(() => import("./_components/landing/import-section").then((mod) => mod.ImportSection));
const FaqSection = dynamic(() => import("./_components/landing/faq-section").then((mod) => mod.FaqSection));
const CtaSection = dynamic(() => import("./_components/landing/cta-section").then((mod) => mod.CtaSection));

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await getMeServer();

  if (user) {
    return (
      <DashboardLayout>
        <DashboardView />
      </DashboardLayout>
    );
  }

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
