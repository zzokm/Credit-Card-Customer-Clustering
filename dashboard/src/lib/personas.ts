export const PERSONA_COLORS: Record<number, string> = {
  0: "oklch(0.55 0.06 250)",
  1: "oklch(0.62 0.14 165)",
  2: "oklch(0.58 0.16 25)",
};

/** Higher-chroma fills for map lookup pin (more visible over scatter points). */
export const PERSONA_HIGHLIGHT_COLORS: Record<number, string> = {
  0: "oklch(0.50 0.22 255)",
  1: "oklch(0.56 0.24 158)",
  2: "oklch(0.54 0.26 28)",
};

export const PERSONA_BG: Record<number, string> = {
  0: "oklch(0.94 0.02 250)",
  1: "oklch(0.94 0.04 165)",
  2: "oklch(0.94 0.04 25)",
};

export function personaColor(clusterId: number | null | undefined): string {
  if (clusterId === null || clusterId === undefined) {
    return "oklch(0.45 0.03 220)";
  }
  return PERSONA_COLORS[clusterId] ?? "oklch(0.45 0.03 220)";
}

export function personaHighlightColor(clusterId: number | null | undefined): string {
  if (clusterId === null || clusterId === undefined) {
    return "oklch(0.48 0.18 220)";
  }
  return PERSONA_HIGHLIGHT_COLORS[clusterId] ?? "oklch(0.48 0.18 220)";
}

export function personaBg(clusterId: number | null | undefined): string {
  if (clusterId === null || clusterId === undefined) {
    return "oklch(0.97 0.008 220)";
  }
  return PERSONA_BG[clusterId] ?? "oklch(0.97 0.008 220)";
}
