"use client";

import { verifyEmail } from "@/lib/api/auth";
import { parseApiErrors } from "@/lib/api/client";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Header } from "@/components/layout/header/landing/header";
import { Footer } from "@/components/layout/footer";
import { Card } from "@/components/ui/primitives/display/card";
import { ResendVerificationForm } from "./_components/resend-verification-form";
import { Check, X } from "lucide-react";

function VerifyContent() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const t = useTranslations("Verify");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setError(t("missingToken"));
      setLoading(false);
      return;
    }

    async function doVerify() {
      try {
        await verifyEmail(token!);
        window.location.href = "/login";
      } catch (err) {
        const errors = parseApiErrors(err);
        setError(errors[0] || t("failedGeneric"));
        setLoading(false);
      }
    }

    doVerify();
  }, [searchParams, t]);

  return (
    <div className="flex flex-col h-screen overflow-y-auto scrollbar bg-canvas">
      <Header hideNav />
      <main className="flex-1 flex items-center justify-center p-6">
        <Card className="flex flex-col items-center justify-center w-full max-w-md p-8 text-center">
          {loading ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-5 h-5 border-2 rounded-full border-stroke border-t-accent animate-spin" />
              <p className="text-ink-secondary">{t("verifying")}</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-6 w-full">
              <div className="flex items-center justify-center w-12 h-12 border rounded-full bg-error-bg border-error text-error">
                <X size={20} className="stroke-[2.5]" />
              </div>
              <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-ink">{t("failedTitle")}</h1>
                <p className="text-sm text-ink-secondary">{error}</p>
              </div>
              <div className="w-full pt-6 border-t border-stroke">
                <ResendVerificationForm />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 border rounded-full bg-success-bg border-success text-success">
                <Check size={20} className="stroke-[2.5]" />
              </div>
              <h1 className="text-2xl font-bold text-ink">{t("successTitle")}</h1>
              <p className="text-ink-secondary">{t("redirecting")}</p>
            </div>
          )}
        </Card>
      </main>
      <Footer />
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyContent />
    </Suspense>
  );
}
