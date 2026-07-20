import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SkeletonCard, SkeletonText } from "@/components/ui/skeleton";

export function PlaceholderPage({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink">{title}</h1>
        <p className="text-sm text-ink-soft mt-1">{description}</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <Card className="p-10 flex flex-col items-center text-center gap-3">
        <Icon size={22} className="text-signal" />
        <p className="text-sm font-medium text-ink">{title} is set up next</p>
        <div className="w-full max-w-sm">
          <SkeletonText lines={2} />
        </div>
      </Card>
    </div>
  );
}
