"use client";

import { Skeleton } from "@/components/ui/primitives/display/skeleton";

interface SidebarSkeletonProps {
  collapsed: boolean;
}

export function SidebarSkeleton({ collapsed }: SidebarSkeletonProps) {
  return (
    <div className="relative shrink-0 h-full">
      <aside
        className={`${collapsed ? "w-14" : "w-[250px]"} border-r border-stroke px-3 pt-3 pb-6 flex flex-col gap-4 overflow-hidden h-full`}
      >
        {collapsed ? (
          <div className="flex justify-center pb-3 -mx-3 border-b border-stroke">
            <Skeleton className="w-8 h-8 rounded-lg" />
          </div>
        ) : (
          <div className="-mx-3 px-3 pb-3 border-b border-stroke">
            <div className="-mx-3 px-3 pb-3 border-b border-stroke">
              <div className="flex items-center w-full px-2 py-2 rounded-lg bg-surface">
                <div className="flex items-center gap-1.5 flex-1">
                  <Skeleton className="w-4 h-4 rounded shrink-0" />
                  <Skeleton className="h-2.5 w-24 rounded-full" />
                </div>
                <Skeleton className="w-3.5 h-3.5 rounded shrink-0" />
              </div>
            </div>
            <div className="pt-3 flex flex-col gap-0.5">
              <div className="flex items-center gap-2 px-2 py-1.5">
                <Skeleton className="w-3.5 h-3.5 rounded shrink-0" />
                <Skeleton className="h-2.5 w-20 rounded-full" />
              </div>
              <div className="flex items-center gap-2 px-2 py-1.5">
                <Skeleton className="w-3.5 h-3.5 rounded shrink-0" />
                <Skeleton className="h-2.5 w-24 rounded-full" />
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4 flex-1 min-h-0 overflow-hidden">
          {collapsed ? (
            <div className="flex flex-col items-center gap-0.5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex items-center justify-center py-1 px-2 rounded-lg">
                  <Skeleton className="w-3.5 h-3.5 rounded shrink-0" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {[1, 2].map((section) => (
                <div key={section} className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1 px-2 py-1">
                    <Skeleton className="w-3.5 h-3.5 rounded shrink-0" />
                    <Skeleton className="w-4 h-4 rounded shrink-0 ml-0.5" />
                    <Skeleton className="h-2 w-24 rounded-full ml-0.5" />
                    <Skeleton className="w-[26px] h-[26px] rounded-lg ml-auto shrink-0" />
                  </div>
                  <div className="flex flex-col gap-0.5 mt-0.5">
                    {[1, 2].map((db) => (
                      <div key={db} className="flex items-center gap-2 py-1 pl-5 pr-2">
                        <Skeleton className="w-3.5 h-3.5 rounded shrink-0" />
                        <Skeleton className="h-2.5 w-20 rounded-full" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex flex-col gap-0.5 mt-2">
                <div className="flex items-center gap-2 py-1 px-2">
                  <Skeleton className="w-3.5 h-3.5 rounded shrink-0" />
                  <Skeleton className="h-2.5 w-24 rounded-full" />
                </div>
                <div className="flex items-center gap-2 py-1 px-2">
                  <Skeleton className="w-3.5 h-3.5 rounded shrink-0" />
                  <Skeleton className="h-2.5 w-16 rounded-full" />
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
