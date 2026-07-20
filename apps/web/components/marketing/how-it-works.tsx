const steps = [
  {
    n: "01",
    title: "Connect your WhatsApp Business number",
    body: "Link your existing number through the WhatsApp Business API in a few minutes.",
  },
  {
    n: "02",
    title: "Build your first automation",
    body: "Set a trigger, add actions, and let the assistant respond to common questions.",
  },
  {
    n: "03",
    title: "Invite your team",
    body: "Assign conversations, set roles, and route conversations to the right agent.",
  },
  {
    n: "04",
    title: "Go live and measure results",
    body: "Watch response time and conversion improve from your analytics dashboard.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 border-t border-line bg-surface">
      <div className="container">
        <div className="max-w-xl mb-14">
          <p className="text-sm font-medium text-signal mb-3">How it works</p>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-ink">
            Live in an afternoon, not a quarter
          </h2>
        </div>
        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((s) => (
            <div key={s.n}>
              <p className="font-display text-3xl font-semibold text-signal-soft mb-4">
                {s.n}
              </p>
              <h3 className="font-display font-semibold text-ink mb-2">{s.title}</h3>
              <p className="text-sm text-ink-soft leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
