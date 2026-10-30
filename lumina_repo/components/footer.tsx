import { Telescope } from "lucide-react";

const links = {
  Platform: ["Pipeline", "Dashboard", "API Access", "Documentation"],
  Research: ["Publications", "Datasets", "Benchmarks", "Collaborations"],
  Community: ["GitHub", "Discord", "Contributing", "Changelog"],
};

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-white">
      <div className="mx-auto max-w-[1200px] px-6 py-10">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded border border-primary/20 bg-primary/5">
                <Telescope className="h-3.5 w-3.5 text-[var(--primary)]" />
              </div>
              <span className="text-sm font-semibold">Lumina</span>
            </div>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              Open-source exoplanet detection with explainable artificial
              intelligence.
            </p>
          </div>

          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="mb-2 text-xs font-semibold">{title}</h4>
              <ul className="space-y-1.5">
                {items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-xs text-[var(--muted-foreground)] transition-colors hover:text-[var(--primary)]"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-2 border-t border-[var(--border)] pt-4 text-[11px] text-[var(--muted-foreground)] sm:flex-row">
          <span>© 2025 Lumina. Built for open science.</span>
          <span>
            Data sourced from{" "}
            <a href="#" className="hover:text-[var(--primary)]">
              NASA Exoplanet Archive
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
