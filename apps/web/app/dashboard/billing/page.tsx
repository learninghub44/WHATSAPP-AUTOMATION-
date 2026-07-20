import { CreditCard } from "lucide-react";
import { PlaceholderPage } from "@/components/dashboard/placeholder-page";

export default function BillingPage() {
  return (
    <PlaceholderPage
      title="Billing"
      description="Manage your subscription and plan."
      icon={CreditCard}
    />
  );
}
