import { Skeleton } from "@/components/ui/primitives/display/skeleton";

export default function StatisticsLoading() {
  return (
    <div className="flex-1 overflow-y-auto scrollbar px-8 py-10">
      <div className="mb-8 flex items-center gap-3">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-64" />
      </div>
      <div className="grid grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-2xl mb-6" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    </div>
  );
}
