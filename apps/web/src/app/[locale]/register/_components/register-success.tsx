"use client";

import { Button } from "@/components/ui/primitives/button";
import { devVerifyUser } from "@/lib/api/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";

type RegisterSuccessProps = {
  email: string;
};

export function RegisterSuccess({ email }: RegisterSuccessProps) {
  const t = useTranslations("Auth");
  const router = useRouter();
  const [devVerifying, setDevVerifying] = useState(false);

  const isDev = process.env.NODE_ENV === "development";

  async function handleDevVerify() {
    setDevVerifying(true);
    try {
      await devVerifyUser(email);
      window.location.href = "/";
    } finally {
      setDevVerifying(false);
    }
  }

  return (
    <div className="flex items-center justify-center flex-1 p-6">
      <div className="flex flex-col items-center w-full gap-4 text-center max-w-100">
        <div className="flex items-center justify-center text-2xl border rounded-full w-14 h-14 bg-success-bg border-success">
          ✓
        </div>
        <h2 className="text-xl font-bold tracking-[-0.03em] text-ink">{t("checkEmail")}</h2>
        <p className="text-sm text-ink-secondary leading-relaxed max-w-[320px]">
          {t("checkEmailDesc")} <strong className="text-ink">{email}</strong>
          {t("clickToActivate")}
        </p>
        {isDev && (
          <Button onClick={handleDevVerify} loading={devVerifying} className="mt-2">
            {devVerifying ? t("verifyingDev") : t("verifyInstantlyDev")}
          </Button>
        )}
        <Button variant="secondary" onClick={() => router.push("/login")}>
          {t("goToSignIn")}
        </Button>
      </div>
    </div>
  );
}
