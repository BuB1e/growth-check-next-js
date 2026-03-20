import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

/**
 * Skeleton loading state for profile page.
 * Matches the layout of ProfileCard + ProfileEditForm + ChangePasswordForm.
 * Used as Suspense fallback.
 */
export function ProfilePageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Profile Card skeleton */}
      <Card className="overflow-hidden">
        <Skeleton className="h-24 w-full rounded-none sm:h-28" />
        <CardContent className="relative px-6 pb-6 pt-0">
          <div className="flex flex-col items-center -mt-14 sm:flex-row sm:items-end sm:-mt-12 sm:gap-5">
            <Skeleton className="h-24 w-24 rounded-full border-4 border-white sm:h-28 sm:w-28" />
            <div className="mt-3 space-y-2 sm:mt-0 sm:pb-1">
              <Skeleton className="mx-auto h-7 w-40 sm:mx-0" />
              <Skeleton className="mx-auto h-6 w-24 rounded-full sm:mx-0" />
            </div>
          </div>
          <Separator className="my-5" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit form skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-44" />
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-11 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-11 w-full" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-11 w-full" />
          </div>
          <div className="flex justify-end">
            <Skeleton className="h-11 w-[140px]" />
          </div>
        </CardContent>
      </Card>

      {/* Password form skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-36" />
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-11 w-full" />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-11 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-11 w-full" />
            </div>
          </div>
          <div className="flex justify-end">
            <Skeleton className="h-11 w-[140px]" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
