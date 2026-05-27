import { AuthenticatedHome } from "./_components/auth-home";
import { CtaSection } from "./_components/landing/cta-section";
import { FeaturesSection } from "./_components/landing/features-section";
import { HeroSection } from "./_components/landing/hero-section";
import { HowItWorksSection } from "./_components/landing/how-it-works-section";
import { ImportSection } from "./_components/landing/import-section";
import { LandingBackground } from "./_components/landing/landing-background";
import { SpecializedSection } from "./_components/landing/specialized-section";
import { TemplatesSection } from "./_components/landing/templates-section";
import { Header } from "@/components/layout/header/header";
import { Footer } from "@/components/layout/footer";
import { getMeServer } from "@/lib/auth-server";
import DashboardLayout from "./(dashboard)/layout";

export default async function Home() {
  const user = await getMeServer();

  if (user) {
    return (
      <DashboardLayout>
        <AuthenticatedHome />
      </DashboardLayout>
    );
  }

  return (
    <div className="relative flex flex-col w-full bg-canvas overflow-x-hidden h-screen overflow-y-auto scrollbar">
      <Header />
      <div className="flex-1 relative">
        <LandingBackground />

        <div className="relative z-10 w-full flex flex-col">
          <HeroSection />
          <SpecializedSection />
          <FeaturesSection />
          <TemplatesSection />
          <HowItWorksSection />
          <ImportSection />
          <CtaSection />
        </div>
      </div>
      <Footer />
    </div>
  );
}
