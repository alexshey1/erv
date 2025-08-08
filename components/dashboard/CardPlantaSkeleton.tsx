import { Skeleton } from "@/components/ui/skeleton"

export default function CardPlantaSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex flex-col items-center w-full max-w-xs">
      {/* Image skeleton */}
      <Skeleton className="w-24 h-24 rounded-lg mb-2" />
      
      <div className="w-full text-center space-y-2">
        {/* Strain name skeleton */}
        <Skeleton className="h-4 w-20 mx-auto" />
        
        {/* Plant name skeleton */}
        <Skeleton className="h-5 w-24 mx-auto" />
        
        {/* Age and phase skeleton */}
        <Skeleton className="h-3 w-32 mx-auto" />
        
        {/* Progress bar skeleton */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
          <Skeleton className="h-3 rounded-full w-3/5" />
        </div>
      </div>
    </div>
  )
}