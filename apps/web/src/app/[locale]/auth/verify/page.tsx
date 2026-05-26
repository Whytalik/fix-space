"use client";

import { verifyEmail } from "@/lib/api/auth";
import { parseApiErrors } from "@/lib/api/client";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useTranslations } from "next-intl";

function VerifyContent() {
  const router = useRouter();
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
        // Cookies are set by the backend interceptor
        window.location.href = "/";
      } catch (err) {
        const errors = parseApiErrors(err);
        setError(errors[0] || t("failedGeneric"));
        setLoading(false);
      }
    }

    doVerify();
  }, [searchParams, router, t]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      {loading ? (
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 rounded-full border-accent border-t-transparent animate-spin" />
          <p className="text-ink-secondary">{t("verifying")}</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-4 max-w-md">
          <div className="flex items-center justify-center w-12 h-12 text-xl border rounded-full bg-error-bg border-error">
            ✕
          </div>
          <h1 className="text-xl font-bold text-ink">{t("failedTitle")}</h1>
          <p className="text-ink-secondary">{error}</p>
          <button
            onClick={() => router.push("/login")}
            className="px-4 py-2 mt-2 text-sm font-medium transition-colors border rounded-md hover:bg-surface-hover border-border"
          >
            {t("goToLogin")}
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 text-xl border rounded-full bg-success-bg border-success">
            ✓
          </div>
          <h1 className="text-xl font-bold text-ink">{t("successTitle")}</h1>
          <p className="text-ink-secondary">{t("redirecting")}</p>
        </div>
      )}
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
