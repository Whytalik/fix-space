import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as (typeof routing.locales)[number])) {
    locale = routing.defaultLocale;
  }

  const namespaces = ["auth", "landing", "dashboard", "settings", "database", "components", "legal", "space-switcher", "record"];

  const messages = (
    await Promise.all(
      namespaces.map(async (ns) => {
        try {
          const nsModule = await import(`../../messages/${locale}/${ns}.json`);
          return nsModule.default;
        } catch (e) {
          console.error(`Failed to load namespace ${ns} for locale ${locale}`, e);
          return {};
        }
      }),
    )
  ).reduce((merged, curr) => ({ ...merged, ...curr }), {});

  return {
    locale,
    messages,
  };
});
