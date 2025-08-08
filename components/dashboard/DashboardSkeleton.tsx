import { Skeleton } from "@/components/ui/skeleton"
import CardPlantaSkeleton from "./CardPlantaSkeleton"

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-4">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* KPI Cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-20 mb-1" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>

      {/* Main content grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plants grid skeleton */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <CardPlantaSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar skeleton */}
        <div className="space-y-4">
          {/* Quick diary skeleton */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
            <Skeleton className="h-5 w-40 mb-3" />
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="w-4 h-4 rounded" />
                  <Skeleton className="h-4 flex-1" />
                </div>
              ))}
            </div>
          </div>

          {/* Tasks skeleton */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
            <Skeleton className="h-5 w-32 mb-3" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="w-5 h-5 rounded" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
            
            {/* Add task form skeleton */}
            <div className="flex items-center gap-2 mt-4">
              <Skeleton className="h-8 flex-1" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}