"use client";

import { MessageSquare, Users2, Workflow, TrendingUp } from "lucide-react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";

const messagesOverTime = [
  { day: "Mon", messages: 320 },
  { day: "Tue", messages: 410 },
  { day: "Wed", messages: 380 },
  { day: "Thu", messages: 512 },
  { day: "Fri", messages: 460 },
  { day: "Sat", messages: 290 },
  { day: "Sun", messages: 240 },
];

const campaignPerformance = [
  { name: "Sent", value: 4200 },
  { name: "Delivered", value: 4050 },
  { name: "Read", value: 3120 },
  { name: "Replied", value: 980 },
];

export default function DashboardOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink">Overview</h1>
        <p className="text-sm text-ink-soft mt-1">Your workspace at a glance.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Messages today"
          value={1284}
          icon={MessageSquare}
          trend={{ value: "+12% vs yesterday", positive: true }}
        />
        <StatCard
          label="Customers"
          value={9042}
          icon={Users2}
          trend={{ value: "+3.4% this week", positive: true }}
        />
        <StatCard
          label="Active automations"
          value={14}
          icon={Workflow}
        />
        <StatCard
          label="Conversion rate"
          value={24}
          suffix="%"
          icon={TrendingUp}
          trend={{ value: "-1.2% vs last week", positive: false }}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="p-6 lg:col-span-2">
          <p className="text-sm font-medium text-ink mb-4">Messages over time</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={messagesOverTime}>
                <defs>
                  <linearGradient id="messagesFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0E8F6F" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#0E8F6F" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#E3E6EA" vertical={false} />
                <XAxis dataKey="day" stroke="#8A93A3" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#8A93A3" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 10, borderColor: "#E3E6EA", fontSize: 12 }} />
                <Area type="monotone" dataKey="messages" stroke="#0E8F6F" strokeWidth={2} fill="url(#messagesFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <p className="text-sm font-medium text-ink mb-4">Campaign performance</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={campaignPerformance}>
                <CartesianGrid stroke="#E3E6EA" vertical={false} />
                <XAxis dataKey="name" stroke="#8A93A3" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#8A93A3" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 10, borderColor: "#E3E6EA", fontSize: 12 }} />
                <Bar dataKey="value" fill="#0E8F6F" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
