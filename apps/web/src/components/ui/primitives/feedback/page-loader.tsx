import { Spinner } from "./spinner";

type PageLoaderProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
};

export function PageLoader({ className = "", size = "lg" }: PageLoaderProps) {
  return (
    <div className={`flex w-full items-center justify-center p-12 animate-fade-up ${className}`}>
      <Spinner size={size} />
    </div>
  );
}
