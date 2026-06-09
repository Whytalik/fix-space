import { getMeServer } from "@/lib/auth-server";
import { DashboardView } from "./_components/dashboard-view";
import DashboardLayout from "./(dashboard)/layout";
import { MarketingPage } from "./_components/marketing-page";

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

  return <MarketingPage locale={locale} />;
}
