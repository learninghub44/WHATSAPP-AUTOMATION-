import { Card } from "@/components/ui/card";
import { SkeletonWorkflow } from "@/components/ui/skeleton";

export default function AutomationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink">Automation</h1>
        <p className="text-sm text-ink-soft mt-1">Build reply flows with triggers and actions.</p>
      </div>
      <Card>
        <SkeletonWorkflow />
      </Card>
    </div>
  );
}
