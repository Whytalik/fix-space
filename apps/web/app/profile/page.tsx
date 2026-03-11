"use client";

import { useAppContext } from "@/context/app-context";
import { Avatar } from "@/components/ui/primitives/avatar";
import { Card } from "@/components/ui/primitives/card";

export default function Profile() {
  const { user, isLoading } = useAppContext();

  if (isLoading || !user) return null;

  return (
    <main className="flex flex-col items-center flex-1 px-6 py-12">
      <Avatar initial={user.username[0] ?? ""} size="lg" />
      <h1 className="mt-4 text-xl font-bold tracking-tight text-ink">{user.username}</h1>

      <Card className="mt-8 w-full max-w-lg text-center text-sm text-ink-secondary">
        Statistics will be implemented later.
      </Card>
    </main>
  );
}
