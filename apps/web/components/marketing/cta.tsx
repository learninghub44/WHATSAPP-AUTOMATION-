import { Button } from "@/components/ui/button";

export function Cta() {
  return (
    <section className="py-24 border-t border-line">
      <div className="container">
        <div className="rounded-2xl bg-ink px-8 py-16 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-paper max-w-xl mx-auto">
            Put your WhatsApp conversations on autopilot
          </h2>
          <p className="mt-4 text-paper/70 max-w-md mx-auto">
            Start free. No credit card required to try your first automation.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button variant="signal" size="lg">
              Start free
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-paper/30 text-paper hover:border-paper"
            >
              Book demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
