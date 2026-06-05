"use client";

import { Skeleton } from "@/components/ui/primitives/display/skeleton";

export function DashboardHeaderSkeleton() {
  return (
    <header className="sticky top-0 z-50 flex h-14 w-full shrink-0 items-center border-b border-stroke bg-canvas/85 backdrop-blur-md select-none">
      <div className="w-60 shrink-0 flex items-center gap-2.25 px-4 h-full">
        <Skeleton className="w-7 h-7 rounded-lg" />
        <Skeleton className="h-4 w-20 rounded-full" />
      </div>

      <div className="flex flex-1 items-center justify-between px-6 min-w-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <Skeleton className="w-3.5 h-3.5 rounded shrink-0" />
          <Skeleton className="h-2.5 w-14 rounded-full" />
          <Skeleton className="w-3.5 h-3.5 rounded shrink-0" />
          <Skeleton className="w-3.5 h-3.5 rounded shrink-0" />
          <Skeleton className="h-2.5 w-20 rounded-full" />
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <Skeleton className="w-[34px] h-[34px] rounded-lg" />
          <Skeleton className="w-[34px] h-[34px] rounded-lg" />

          <div className="h-4 w-px bg-stroke" />

          <div className="flex items-center gap-2 px-2 py-1.5">
            <Skeleton className="w-[30px] h-[30px] rounded-full shrink-0" />
            <div className="flex flex-col gap-1">
              <Skeleton className="h-3.5 w-20 rounded-full" />
              <Skeleton className="h-2.5 w-28 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
