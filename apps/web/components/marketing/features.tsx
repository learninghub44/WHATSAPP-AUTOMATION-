import { Inbox, Workflow, Bot, Megaphone, FileText, BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Inbox,
    title: "Unified inbox",
    body: "Every conversation in one place, with agent assignment, tags, and internal notes so nothing gets lost.",
  },
  {
    icon: Workflow,
    title: "Visual automation",
    body: "Build reply flows with triggers, conditions, and actions. No code required to launch a workflow.",
  },
  {
    icon: Bot,
    title: "AI assistant",
    body: "Train an assistant on your FAQs, documents, and product catalog to answer customers instantly.",
  },
  {
    icon: Megaphone,
    title: "Broadcast campaigns",
    body: "Reach segmented audiences with approved templates and track delivery, reads, and replies.",
  },
  {
    icon: FileText,
    title: "Message templates",
    body: "Manage and submit WhatsApp templates with approval status tracked in one dashboard.",
  },
  {
    icon: BarChart3,
    title: "Reporting",
    body: "Response time, conversion, and campaign performance, visible at a glance.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 border-t border-line">
      <div className="container">
        <div className="max-w-xl mb-14">
          <p className="text-sm font-medium text-signal mb-3">Features</p>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-ink">
            Everything a support team needs on WhatsApp
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <Card key={f.title} className="p-6">
              <f.icon size={20} className="text-signal mb-4" />
              <h3 className="font-display font-semibold text-ink mb-2">{f.title}</h3>
              <p className="text-sm text-ink-soft leading-relaxed">{f.body}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
