"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  suffix = "",
  icon: Icon,
  trend,
}: {
  label: string;
  value: number;
  suffix?: string;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
}) {
  const [display, setDisplay] = useState(0);
  const motionVal = useMotionValue(0);

  useEffect(() => {
    const controls = animate(motionVal, value, {
      duration: 1.1,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [value]);

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-ink-soft">{label}</p>
        <Icon size={16} className="text-signal" />
      </div>
      <p className="font-display text-2xl font-semibold text-ink">
        {display.toLocaleString()}
        {suffix}
      </p>
      {trend && (
        <p
          className={cn(
            "text-xs mt-2",
            trend.positive ? "text-signal" : "text-amber"
          )}
        >
          {trend.value}
        </p>
      )}
    </Card>
  );
}
