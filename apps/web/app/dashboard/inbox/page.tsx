import { Card } from "@/components/ui/card";
import { SkeletonConversationList, SkeletonChatWindow, SkeletonText } from "@/components/ui/skeleton";

export default function InboxPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_260px] gap-4 h-[calc(100vh-8rem)]">
      <Card className="overflow-hidden overflow-y-auto">
        <SkeletonConversationList />
      </Card>
      <Card className="overflow-hidden">
        <SkeletonChatWindow />
      </Card>
      <Card className="p-4 hidden lg:block">
        <p className="text-sm font-medium text-ink mb-4">Customer details</p>
        <SkeletonText lines={4} />
      </Card>
    </div>
  );
}
