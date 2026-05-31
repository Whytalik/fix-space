import { getTranslations } from "next-intl/server";

export async function LandingJsonLd({ locale }: { locale: string }) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://fixspace.app";
  const t = await getTranslations({ locale, namespace: "Landing" });

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "FIX Space",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    description: t("hero.description"),
    url: `${baseUrl}/${locale}`,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  const categories = [
    { key: "0", items: [0, 1, 2] },
    { key: "1", items: [0, 1, 2, 3] },
    { key: "2", items: [0, 1, 2] },
  ];

  const faqItems: { "@type": "Question"; name: string; acceptedAnswer: { "@type": "Answer"; text: string } }[] = [];
  categories.forEach((cat) => {
    cat.items.forEach((itemIdx) => {
      faqItems.push({
        "@type": "Question",
        name: t(`faq.categories.${cat.key}.items.${itemIdx}.q`),
        acceptedAnswer: {
          "@type": "Answer",
          text: t(`faq.categories.${cat.key}.items.${itemIdx}.a`),
        },
      });
    });
  });

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify([softwareSchema, faqSchema]) }}
    />
  );
}
