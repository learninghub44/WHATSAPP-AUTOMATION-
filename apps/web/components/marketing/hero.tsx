"use client";

import { motion } from "framer-motion";
import { Check, Zap, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/card";

const incoming = [
  { from: "customer", text: "Do you deliver to Nairobi?" },
];

const nodes = [
  { label: "Message received", icon: Zap },
  { label: "AI drafts a reply", icon: Zap },
  { label: "Sent to customer", icon: Check },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="container grid lg:grid-cols-2 gap-16 items-center pt-20 pb-24 lg:pt-28 lg:pb-32">
        <div>
          <Badge tone="signal" className="mb-6">
            Built for WhatsApp Business API
          </Badge>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.4rem] leading-[1.08] tracking-tight font-semibold text-ink">
            Automate WhatsApp conversations. Grow your business.
          </h1>
          <p className="mt-6 text-lg text-ink-soft max-w-lg leading-relaxed">
            Connect WhatsApp, automate customer support, manage conversations,
            and scale your business with intelligent workflows.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Button variant="signal" size="lg">
              Start free
            </Button>
            <Button variant="outline" size="lg">
              Book demo
            </Button>
          </div>
          <div className="mt-10 flex items-center gap-6 text-sm text-ink-soft">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-signal" />
              Trusted by growing support teams
            </div>
          </div>
        </div>

        <div className="relative h-[440px]">
          {/* conversation panel */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute left-0 top-4 w-[300px] rounded-2xl border border-line bg-paper shadow-card p-4"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-full bg-signal-soft" />
              <div>
                <p className="text-sm font-medium text-ink">Amara K.</p>
                <p className="text-xs text-ink-faint">online</p>
              </div>
            </div>
            <div className="space-y-2">
              {incoming.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-surface rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-sm text-ink w-fit max-w-[85%]"
                >
                  {m.text}
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.6 }}
                className="bg-signal text-paper rounded-2xl rounded-tr-sm px-3.5 py-2.5 text-sm w-fit max-w-[85%] ml-auto flex items-center gap-1.5"
              >
                Yes — same-day delivery in Nairobi.
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 2.1 }}
                >
                  <Check size={13} />
                </motion.span>
              </motion.div>
            </div>
          </motion.div>

          {/* automation workflow chip */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="absolute right-0 top-0 w-[220px] rounded-2xl border border-line bg-paper shadow-card p-4 animate-float"
          >
            <p className="text-xs font-medium text-ink-soft mb-3">Automation</p>
            <div className="space-y-2">
              {nodes.map((n, i) => (
                <motion.div
                  key={n.label}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 + i * 0.35 }}
                  className="flex items-center gap-2 rounded-lg bg-surface px-2.5 py-2 text-xs text-ink"
                >
                  <n.icon size={13} className="text-signal shrink-0" />
                  {n.label}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* analytics card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="absolute right-4 bottom-0 w-[230px] rounded-2xl border border-line bg-paper shadow-card p-4"
          >
            <p className="text-xs text-ink-soft mb-1">Avg. response time</p>
            <p className="font-display text-2xl font-semibold text-ink">
              38<span className="text-base text-ink-soft"> sec</span>
            </p>
            <div className="mt-3 h-8 flex items-end gap-1">
              {[6, 10, 7, 14, 9, 16, 12].map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: h * 2 }}
                  transition={{ delay: 1 + i * 0.06 }}
                  className="w-3 rounded-t bg-signal-soft"
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
