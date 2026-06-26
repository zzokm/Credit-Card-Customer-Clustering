"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { personaBg, personaColor } from "@/lib/personas";
import { CardChip, ContactlessIcon } from "@/components/lookup/card-chip";

type VisaCardProps = {
  clusterId?: number | null;
  segmentName?: string | null;
  loading?: boolean;
  pulseTick?: number;
  className?: string;
};

type CardMotion = {
  rotateX: number;
  rotateY: number;
  shineX: number;
  shineY: number;
  glareAngle: number;
};

const IDLE_MOTION: CardMotion = {
  rotateX: 0,
  rotateY: 0,
  shineX: 50,
  shineY: 50,
  glareAngle: 135,
};

export function VisaCard({
  clusterId = null,
  segmentName,
  loading = false,
  pulseTick = 0,
  className,
}: VisaCardProps) {
  const tint = personaBg(clusterId);
  const accent = personaColor(clusterId);
  const shellRef = useRef<HTMLDivElement>(null);
  const [motion, setMotion] = useState<CardMotion>(IDLE_MOTION);
  const [hovering, setHovering] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [pulsing, setPulsing] = useState(false);

  useEffect(() => {
    if (pulseTick < 1 || loading || reduceMotion) return;
    setPulsing(true);
    const t = window.setTimeout(() => setPulsing(false), 1400);
    return () => window.clearTimeout(t);
  }, [pulseTick, loading, reduceMotion]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const handleMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (reduceMotion || loading) return;
      const el = shellRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      const rotateY = (x - 0.5) * 14;
      const rotateX = (0.5 - y) * 12;
      const glareAngle = Math.atan2(y - 0.5, x - 0.5) * (180 / Math.PI) + 90;
      setMotion({
        rotateX,
        rotateY,
        shineX: x * 100,
        shineY: y * 100,
        glareAngle,
      });
    },
    [reduceMotion, loading],
  );

  const handleLeave = useCallback(() => {
    setHovering(false);
    if (!reduceMotion) setMotion(IDLE_MOTION);
  }, [reduceMotion]);

  const tiltStyle =
    reduceMotion || loading
      ? undefined
      : {
          transform: `rotateX(${motion.rotateX}deg) rotateY(${motion.rotateY}deg)`,
          transition: hovering
            ? "transform 120ms var(--ease-out)"
            : "transform 450ms var(--ease-out)",
        };

  return (
    <div
      className={cn("relative mx-auto w-full max-w-[340px]", className)}
      aria-hidden={loading}
    >
      <div
        ref={shellRef}
        className="group/card [perspective:1100px]"
        onMouseEnter={() => setHovering(true)}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
      >
        <div
          className={cn(
            "relative aspect-[1.586/1] overflow-hidden rounded-2xl border border-border p-6 shadow-[0_8px_32px_oklch(0.22_0.02_220_/_0.1)] will-change-transform",
            loading && "animate-pulse",
            pulsing && "visa-persona-pulse",
            !reduceMotion && !loading && "group-hover/card:shadow-[0_16px_48px_oklch(0.22_0.02_220_/_0.14)]",
          )}
          style={{
            ...tiltStyle,
            background: `linear-gradient(148deg, ${tint} 0%, oklch(0.99 0.004 220) 48%, ${tint} 100%)`,
            ["--visa-pulse-color" as string]: pulsing ? `${accent}99` : undefined,
            transition: tiltStyle?.transition
              ? `${tiltStyle.transition}, background 300ms var(--ease-out), box-shadow 300ms var(--ease-out)`
              : undefined,
          }}
        >
          {/* Persona ambient */}
          <div
            className={cn(
              "pointer-events-none absolute -right-10 -top-10 size-44 rounded-full opacity-25 blur-2xl transition-all duration-300",
              pulsing && !reduceMotion && "scale-110 opacity-40",
            )}
            style={{ background: accent }}
          />

          {/* Mouse-follow shine */}
          {!reduceMotion && !loading && (
            <>
              <div
                className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-200 group-hover/card:opacity-100"
                style={{
                  background: `radial-gradient(circle at ${motion.shineX}% ${motion.shineY}%, oklch(1 0 0 / 0.42) 0%, oklch(1 0 0 / 0.08) 28%, transparent 58%)`,
                }}
              />
              <div
                className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 mix-blend-soft-light transition-opacity duration-200 group-hover/card:opacity-100"
                style={{
                  background: `linear-gradient(${motion.glareAngle}deg, transparent 38%, oklch(1 0 0 / 0.28) 50%, transparent 62%)`,
                }}
              />
            </>
          )}

          <div className="relative flex h-full flex-col">
            {/* Segment badge — top right */}
            <div className="absolute right-0 top-0 z-[1]">
              {segmentName ? (
                <span
                  className="inline-block rounded-full px-2.5 py-1 text-xs font-medium text-white"
                  style={{ background: accent }}
                >
                  {segmentName.replace(/^The /, "")}
                </span>
              ) : (
                <span className="text-xs text-muted">Awaiting segment</span>
              )}
            </div>

            {/* Chip, contactless, and card number — lowered together */}
            <div className="mt-10 pr-24">
              <div className="flex items-center gap-2">
                <CardChip className="h-[1.85rem] w-[2.45rem] drop-shadow-[0_2px_5px_oklch(0.35_0.04_70_/_0.22)]" />
                <ContactlessIcon className="size-6 shrink-0" />
              </div>
              <p className="mt-4 whitespace-nowrap font-mono text-[1.0625rem] tracking-[0.15em] text-ink/90 sm:text-lg sm:tracking-[0.17em]">
                ••••&nbsp;••••&nbsp;••••&nbsp;0067
              </p>
            </div>

            {/* Footer — cardholder aligns with logo baseline */}
            <div className="relative mt-auto min-h-[3.75rem]">
              <div className="absolute bottom-0 left-0">
                <p className="text-[10px] font-medium text-muted">Cardholder</p>
                <p className="truncate text-sm font-medium text-ink">Customer profile</p>
              </div>

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/visa.svgz"
                alt="Visa"
                className="absolute -bottom-3.5 -right-3.5 h-[3.9rem] w-auto max-w-[9.5rem] object-contain object-bottom"
                width={152}
                height={48}
                draggable={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
