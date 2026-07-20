import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Starter",
    price: "$29",
    period: "/month",
    body: "For a single team getting started with automation.",
    features: ["1 WhatsApp number", "1,000 conversations/mo", "Basic automation", "Email support"],
  },
  {
    name: "Business",
    price: "$99",
    period: "/month",
    body: "For growing teams running campaigns and AI replies.",
    features: [
      "3 WhatsApp numbers",
      "10,000 conversations/mo",
      "AI assistant",
      "Campaigns & templates",
      "Priority support",
    ],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    body: "For organizations with multiple teams and compliance needs.",
    features: [
      "Unlimited numbers",
      "Unlimited conversations",
      "Custom roles & permissions",
      "Dedicated account manager",
    ],
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 border-t border-line bg-surface">
      <div className="container">
        <div className="max-w-xl mb-14">
          <p className="text-sm font-medium text-signal mb-3">Pricing</p>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-ink">
            Straightforward plans that scale with you
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <Card
              key={p.name}
              className={cn(
                "p-7 flex flex-col",
                p.highlighted && "border-signal ring-1 ring-signal"
              )}
            >
              <h3 className="font-display font-semibold text-ink mb-1">{p.name}</h3>
              <p className="text-sm text-ink-soft mb-6">{p.body}</p>
              <div className="mb-6">
                <span className="font-display text-3xl font-semibold text-ink">{p.price}</span>
                <span className="text-sm text-ink-soft">{p.period}</span>
              </div>
              <ul className="space-y-2.5 mb-8 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-ink-soft">
                    <Check size={15} className="text-signal shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button variant={p.highlighted ? "signal" : "outline"} className="w-full">
                {p.name === "Enterprise" ? "Contact sales" : "Start free"}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
