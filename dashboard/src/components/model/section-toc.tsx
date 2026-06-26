"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export const MODEL_SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "dataset", label: "Dataset" },
  { id: "features", label: "Features" },
  { id: "eda", label: "EDA highlights" },
  { id: "k-selection", label: "K selection" },
  { id: "validation", label: "Algorithm comparison" },
  { id: "personas", label: "Personas" },
  { id: "pipeline", label: "Inference pipeline" },
] as const;

type SectionTocProps = {
  className?: string;
};

export function SectionToc({ className }: SectionTocProps) {
  const [active, setActive] = useState<string>(MODEL_SECTIONS[0].id);

  useEffect(() => {
    const sections = MODEL_SECTIONS.map((s) => document.getElementById(s.id)).filter(
      Boolean,
    ) as HTMLElement[];

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.25, 0.5] },
    );

    for (const el of sections) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      className={cn("space-y-1 text-sm", className)}
      aria-label="Page sections"
    >
      <p className="mb-3 text-xs font-medium text-muted">On this page</p>
      <ul className="space-y-0.5">
        {MODEL_SECTIONS.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className={cn(
                "block rounded-md px-2.5 py-1.5 transition-colors duration-200",
                active === section.id
                  ? "bg-surface font-medium text-ink"
                  : "text-muted hover:bg-surface hover:text-ink",
              )}
              aria-current={active === section.id ? "location" : undefined}
            >
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
