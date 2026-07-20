import { Card } from "@/components/ui/card";

const cases = [
  { title: "Ecommerce", body: "Order updates, delivery status, and abandoned cart recovery over WhatsApp." },
  { title: "Financial services", body: "Verified alerts, statements, and support without leaving the chat." },
  { title: "Healthcare", body: "Appointment reminders and intake, handled by automated flows." },
  { title: "Education", body: "Admissions questions and enrollment status answered instantly." },
  { title: "Logistics", body: "Shipment tracking updates sent automatically as status changes." },
  { title: "Hospitality", body: "Booking confirmations, check-in details, and guest requests." },
];

export function UseCases() {
  return (
    <section id="use-cases" className="py-24 border-t border-line">
      <div className="container">
        <div className="max-w-xl mb-14">
          <p className="text-sm font-medium text-signal mb-3">Business use cases</p>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-ink">
            Built for how your industry actually messages customers
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {cases.map((c) => (
            <Card key={c.title} className="p-6 bg-surface border-transparent shadow-none">
              <h3 className="font-display font-semibold text-ink mb-2">{c.title}</h3>
              <p className="text-sm text-ink-soft leading-relaxed">{c.body}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
