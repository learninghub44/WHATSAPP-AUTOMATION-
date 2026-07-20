import { ShieldCheck, Lock, Building2 } from "lucide-react";

const points = [
  { icon: Building2, title: "Organization isolation", body: "Every account, contact, and message is scoped to your organization." },
  { icon: Lock, title: "Encrypted in transit and at rest", body: "Data is protected end to end using industry-standard encryption." },
  { icon: ShieldCheck, title: "Role-based access", body: "Owners, admins, and agents each see only what they need to." },
];

export function Security() {
  return (
    <section id="security" className="py-24 border-t border-line">
      <div className="container">
        <div className="max-w-xl mb-14">
          <p className="text-sm font-medium text-signal mb-3">Security</p>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-ink">
            Enterprise-grade protection by default
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {points.map((p) => (
            <div key={p.title}>
              <p.icon size={20} className="text-signal mb-4" />
              <h3 className="font-display font-semibold text-ink mb-2">{p.title}</h3>
              <p className="text-sm text-ink-soft leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
