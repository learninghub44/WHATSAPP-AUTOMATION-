import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-6">
      <div className="w-full max-w-sm bg-paper border border-line rounded-2xl shadow-card p-8">
        <Link href="/" className="font-display font-semibold text-ink block mb-8">
          CHRIS TECH
        </Link>
        <h1 className="font-display text-xl font-semibold text-ink mb-1">Sign in</h1>
        <p className="text-sm text-ink-soft mb-6">
          Access your organization&apos;s workspace.
        </p>
        <form className="space-y-4">
          <div>
            <label className="text-xs font-medium text-ink-soft block mb-1.5">Email</label>
            <input
              type="email"
              className="w-full h-10 rounded-lg border border-line px-3 text-sm outline-none focus:ring-2 focus:ring-signal/40"
              placeholder="you@company.com"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-ink-soft block mb-1.5">Password</label>
            <input
              type="password"
              className="w-full h-10 rounded-lg border border-line px-3 text-sm outline-none focus:ring-2 focus:ring-signal/40"
              placeholder="••••••••"
            />
          </div>
          <Button variant="signal" className="w-full" type="submit">
            Sign in
          </Button>
        </form>
        <p className="text-xs text-ink-faint text-center mt-6">
          Authentication will connect to Supabase Auth.
        </p>
      </div>
    </div>
  );
}
