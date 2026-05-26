"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RecordPage() {
  const router = useRouter();
  const params = useParams();
  const recordId = params.recordId as string;

  useEffect(() => {
    if (recordId) {
      router.replace(`/record/${recordId}`);
    }
  }, [recordId, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-5 h-5 rounded-full border-2 border-stroke border-t-accent animate-spin" />
    </div>
  );
}
