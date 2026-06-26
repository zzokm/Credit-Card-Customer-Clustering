"use client";

import { useId } from "react";

const PAD_STROKE = "oklch(0.38 0.04 62 / 0.55)";

/** EMV chip — classic 4 | center bar | 3 pad contact layout. */
export function CardChip({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, "");
  const face = `chip-face-${uid}`;
  const shine = `chip-shine-${uid}`;
  const edge = `chip-edge-${uid}`;

  // Inset contact area
  const ix = 5;
  const iy = 5;
  const iw = 42;
  const ih = 28;
  const gap = 0.9;

  // Column widths: left pads | center bar | right pads
  const leftW = 11.5;
  const midW = 9.5;
  const rightW = iw - leftW - midW - gap * 2;

  const leftX = ix;
  const midX = ix + leftW + gap;
  const rightX = midX + midW + gap;

  // Left: 4 equal horizontal pads
  const leftPadH = (ih - gap * 3) / 4;

  // Right: 3 pads (top, mid, bottom — bottom slightly taller like reference)
  const rightTopH = (ih - gap * 2) * 0.28;
  const rightMidH = (ih - gap * 2) * 0.24;
  const rightBotH = ih - rightTopH - rightMidH - gap * 2;

  return (
    <svg
      viewBox="0 0 52 38"
      className={className}
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={face} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="oklch(0.9 0.07 88)" />
          <stop offset="40%" stopColor="oklch(0.78 0.09 80)" />
          <stop offset="100%" stopColor="oklch(0.62 0.07 72)" />
        </linearGradient>
        <linearGradient id={shine} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="oklch(1 0.03 95 / 0.7)" />
          <stop offset="50%" stopColor="oklch(1 0.02 90 / 0)" />
        </linearGradient>
        <linearGradient id={edge} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="oklch(0.42 0.04 65 / 0.4)" />
          <stop offset="100%" stopColor="oklch(1 0.02 90 / 0.12)" />
        </linearGradient>
      </defs>

      <rect
        x="1"
        y="1"
        width="50"
        height="36"
        rx="4.5"
        fill={`url(#${face})`}
        stroke="oklch(0.5 0.05 70 / 0.45)"
        strokeWidth="0.7"
      />
      <rect
        x="1"
        y="1"
        width="50"
        height="36"
        rx="4.5"
        fill={`url(#${edge})`}
        opacity="0.45"
      />

      {/* Left column — 4 pads */}
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={`l-${i}`}
          x={leftX}
          y={iy + i * (leftPadH + gap)}
          width={leftW}
          height={leftPadH}
          rx="0.6"
          fill="oklch(0.72 0.07 78 / 0.35)"
          stroke={PAD_STROKE}
          strokeWidth="0.55"
        />
      ))}

      {/* Center — full-height bar */}
      <rect
        x={midX}
        y={iy}
        width={midW}
        height={ih}
        rx="0.6"
        fill="oklch(0.7 0.07 76 / 0.3)"
        stroke={PAD_STROKE}
        strokeWidth="0.55"
      />

      {/* Right column — 3 pads */}
      <rect
        x={rightX}
        y={iy}
        width={rightW}
        height={rightTopH}
        rx="0.6"
        fill="oklch(0.72 0.07 78 / 0.35)"
        stroke={PAD_STROKE}
        strokeWidth="0.55"
      />
      <rect
        x={rightX}
        y={iy + rightTopH + gap}
        width={rightW}
        height={rightMidH}
        rx="0.6"
        fill="oklch(0.72 0.07 78 / 0.35)"
        stroke={PAD_STROKE}
        strokeWidth="0.55"
      />
      <rect
        x={rightX}
        y={iy + rightTopH + gap + rightMidH + gap}
        width={rightW}
        height={rightBotH}
        rx="0.6"
        fill="oklch(0.72 0.07 78 / 0.35)"
        stroke={PAD_STROKE}
        strokeWidth="0.55"
      />

      {/* Specular */}
      <rect
        x="2"
        y="2"
        width="24"
        height="12"
        rx="3"
        fill={`url(#${shine})`}
        opacity="0.85"
      />
    </svg>
  );
}

/** Contactless mark — served from public/contactless.svg as provided. */
export function ContactlessIcon({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/contactless.svg"
      alt=""
      aria-hidden
      className={className}
      width={24}
      height={24}
      draggable={false}
    />
  );
}
