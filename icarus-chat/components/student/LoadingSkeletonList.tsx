import { Skeleton } from "@/components/ui/skeleton";

export function LoadingSkeletonList() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, index) => (
        <Skeleton key={index} className="h-28 w-full" />
      ))}
    </div>
  );
}
