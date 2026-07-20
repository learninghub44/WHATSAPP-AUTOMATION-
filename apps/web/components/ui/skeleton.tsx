import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("skeleton", className)} {...props} />;
}

export function SkeletonText({ lines = 1, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-3", i === lines - 1 && lines > 1 ? "w-2/3" : "w-full")}
        />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-line bg-paper p-5 shadow-card">
      <Skeleton className="h-3 w-24 mb-3" />
      <Skeleton className="h-7 w-16" />
    </div>
  );
}

export function SkeletonConversationList() {
  return (
    <div className="divide-y divide-line">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-4">
          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonChatWindow() {
  return (
    <div className="flex flex-col gap-3 p-6">
      <Skeleton className="h-14 w-2/3 rounded-2xl" />
      <Skeleton className="h-10 w-1/2 rounded-2xl self-end" />
      <Skeleton className="h-16 w-3/5 rounded-2xl" />
      <Skeleton className="h-10 w-2/5 rounded-2xl self-end" />
    </div>
  );
}

export function SkeletonWorkflow() {
  return (
    <div className="flex flex-col items-center gap-3 py-10">
      <Skeleton className="h-10 w-40 rounded-xl" />
      <div className="h-6 w-px bg-line" />
      <Skeleton className="h-10 w-40 rounded-xl" />
      <div className="h-6 w-px bg-line" />
      <Skeleton className="h-10 w-40 rounded-xl" />
    </div>
  );
}
