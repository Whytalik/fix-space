"use client";

import { useAppContext } from "@/context/app-context";
import { Avatar } from "@/components/ui/primitives/display/avatar";
import { Card } from "@/components/ui/primitives/display/card";
import { API_BASE_URL } from "@/utils/constants";
import { useTranslations } from "next-intl";

export default function Profile() {
  const { user, isLoading } = useAppContext();
  const t = useTranslations("ProfilePage");

  if (isLoading || !user) return null;

  const avatarUrl = user.icon ? `${API_BASE_URL}${user.icon}` : null;

  return (
    <div className="flex-1 overflow-y-auto px-8 py-10">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-ink">{t("title")}</h1>
          <p className="text-sm text-ink-secondary mt-1">{t("subtitle")}</p>
        </header>

        <section className="flex flex-col items-center py-6 border-b border-stroke mb-8">
          <Avatar initial={user.username[0] ?? ""} image={avatarUrl} size="lg" />
          <h2 className="mt-4 text-xl font-bold tracking-tight text-ink">{user.username}</h2>
          <p className="text-sm text-ink-muted">{user.email}</p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-ink mb-4">{t("accountInfo")}</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-ink-muted uppercase tracking-wider">{t("username")}</label>
                <p className="text-sm text-ink mt-1">{user.username}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-ink-muted uppercase tracking-wider">
                  {t("emailAddress")}
                </label>
                <p className="text-sm text-ink mt-1">{user.email}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 flex flex-col items-center justify-center text-center">
            <p className="text-sm text-ink-secondary">{t("statsComingSoon")}</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
