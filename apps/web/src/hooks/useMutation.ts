import { parseApiError } from "@/lib/api/client";
import { useState } from "react";

export function useMutation(fn: () => Promise<unknown>) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function mutate(): Promise<boolean> {
    setIsLoading(true);
    setError(null);
    try {
      await fn();
      return true;
    } catch (err) {
      setError(parseApiError(err));
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  return { mutate, isLoading, error };
}
