"use client";

import { Sidebar } from "@/components/navigation/sidebar/sidebar";
import { Spinner } from "@/components/ui/primitives/spinner";
import { useAppContext } from "@/context/app-context";
import { CtaSection } from "./_components/landing/cta-section";
import { FeaturesSection } from "./_components/landing/features-section";
import { HeroSection } from "./_components/landing/hero-section";
import { HowItWorksSection } from "./_components/landing/how-it-works-section";
import { ImportSection } from "./_components/landing/import-section";
import { LandingBackground } from "./_components/landing/landing-background";
import { SpecializedSection } from "./_components/landing/specialized-section";
import { TemplatesSection } from "./_components/landing/templates-section";

export default function Home() {
  const { user, isLoading } = useAppContext();

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner size="md" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <h1 className="type-page-title">Welcome back, {user.username}!</h1>
        </main>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col">
      <LandingBackground />
      <HeroSection />
      <SpecializedSection />
      <FeaturesSection />
      <TemplatesSection />
      <HowItWorksSection />
      <ImportSection />
      <CtaSection />
    </div>
  );
}
