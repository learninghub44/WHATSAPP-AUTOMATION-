import { UsersRound } from "lucide-react";
import { PlaceholderPage } from "@/components/dashboard/placeholder-page";

export default function TeamPage() {
  return (
    <PlaceholderPage
      title="Team"
      description="Manage roles and permissions for your workspace."
      icon={UsersRound}
    />
  );
}
