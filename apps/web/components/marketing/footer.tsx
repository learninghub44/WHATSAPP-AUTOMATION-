export function Footer() {
  return (
    <footer className="border-t border-line py-10">
      <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="font-display font-semibold text-ink">CHRIS TECH</p>
        <p className="text-sm text-ink-faint">
          © {new Date().getFullYear()} CHRIS TECH. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
