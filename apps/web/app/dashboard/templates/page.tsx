import { FileText } from "lucide-react";
import { PlaceholderPage } from "@/components/dashboard/placeholder-page";

export default function TemplatesPage() {
  return (
    <PlaceholderPage
      title="Templates"
      description="Manage WhatsApp message templates and approvals."
      icon={FileText}
    />
  );
}
