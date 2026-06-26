<!-- SEED: re-run /impeccable document once there's code to capture the actual tokens and components. -->

---
name: Credit Card Customer Segmentation Dashboard
description: Analyst-facing cluster exploration and segment inference for FinTech risk teams.
---

# Design System: Credit Card Customer Segmentation Dashboard

## 1. Overview

**Creative North Star: "The Segment Console"**

A risk analyst sits at a dual-monitor desk on a bright operations floor, mid-morning, toggling between segment health, policy notes, and a cluster map. The interface should feel like **Stripe's clarity**, **Linear's density without noise**, and **Bloomberg Terminal's seriousness** — but without terminal ugliness. Data leads; chrome recedes. The tool disappears into the task of validating personas and recommended actions.

This system explicitly rejects cliché fintech branding (navy-and-gold palettes, gold accent lines, stock-photo trust badges) and generic SaaS dashboard templates (cream backgrounds, purple gradients, oversized hero metrics). It is a **product** surface: earned familiarity over decorative novelty.

**Key Characteristics:**

- **Restrained color** — pure white canvas; slate-teal primary used sparingly for actions and selection
- **Humanist sans throughout** — one family for headings, labels, body, and data; no display fonts in UI chrome
- **Analyst-first density** — tables, metrics, and charts prioritized over decorative cards
- **Responsive motion** — state feedback and transitions (150–250ms); no orchestrated page-load sequences
- **Artifact-grounded** — segment colors and persona copy sync with `metadata.json`, not invented in the UI layer

## 2. Colors

**Palette character:** Cool slate instrument on pure white — confident teal accents for primary actions, distinct semantic hues for the three customer personas.

### Primary
- **Slate Teal** `[to be resolved during implementation — target oklch hue 200–220, chroma ≤0.18, L ~0.45–0.55]`: Primary buttons, active nav item, focus rings, selected table row indicator. Used on ≤10% of any screen.

### Secondary (optional)
- Omitted at seed — single accent discipline. Segment persona colors carry categorical meaning; they are not a second brand accent.

### Tertiary (optional)
- Omitted at seed.

### Neutral
- **Pure Canvas** `[oklch(1.000 0.000 0)]`: Page background. Literal white — not warm cream, not tinted paper.
- **Panel Surface** `[to be resolved — bg mixed 10–15% toward ink, cool hue ~220, chroma 0.005–0.012]`: Sidebars, table headers, filter bars, model-metadata drawer.
- **Ink** `[to be resolved — L ~0.20–0.24, chroma ~0.02, hue ~220]`: Body text, chart axes, primary labels. Must hit ≥7:1 vs Pure Canvas.
- **Muted Ink** `[to be resolved — ink pulled 40% toward bg]`: Secondary labels, column headers, helper text. Must hit ≥4.5:1 vs Pure Canvas.

### Data / Segment (Full palette role — categorical only)
- **Active Transactor** `[to be resolved — green-teal, hue ~165, distinct from primary]`: Cluster 1 / "The Active Transactors"
- **Revolver Risk** `[to be resolved — warm coral-rose, hue ~25, not gold]`: Cluster 2 / "The Revolvers (High-Risk)"
- **Dormant** `[to be resolved — desaturated slate-blue, hue ~250, low chroma]`: Cluster 0 / "The Dormant/Inactive"

### Named Rules
**The Pure Canvas Rule.** Background is literal white (`oklch(1.000 0.000 0)`). Warmth and brand live in primary, accent, and typography — never in a cream or sand body surface.

**The One Accent Rule.** Slate teal is the only brand accent on chrome. Persona colors appear only on data marks (scatter points, chips, chart series) — never on navigation chrome or hero strips.

**The No-Gold Rule.** Risk and warning states use coral or rose hues. Gold, amber metallic, and navy-and-gold pairings are prohibited.

## 3. Typography

**Display Font:** `[font pairing to be chosen at implementation]` — humanist sans, single family (e.g. IBM Plex Sans, Source Sans 3, or similar). No separate display face.

**Body Font:** Same family as UI chrome.

**Label/Mono Font:** Optional tabular figures on the same family; dedicated mono only for raw feature values or API payloads if needed.

**Character:** Warm enough to feel approachable (Stripe lane), precise enough for dense tables (Bloomberg lane). Never decorative.

### Hierarchy
- **Display** `[to be chosen — max clamp 2.5rem, weight 600, line-height 1.15]`: Page title only ("Segment Console", "Cluster Map"). `text-wrap: balance`.
- **Headline** `[1.5rem / 24px, weight 600, line-height 1.25]`: Section headers ("Persona Profiles", "Model Metadata").
- **Title** `[1.125rem / 18px, weight 600, line-height 1.3]`: Card-less panel titles, table group headers.
- **Body** `[0.9375rem / 15px, weight 400, line-height 1.5]`: Prose, descriptions, persona action copy. Max 65–75ch in text blocks.
- **Label** `[0.75rem / 12px, weight 500, letter-spacing 0.01em]`: Column headers, filter labels, badge text. Sentence case — not uppercase tracking eyebrows.

### Named Rules
**The One Family Rule.** Headings, buttons, labels, body, and table data use one humanist sans. No serif display in the app shell.

**The Fixed Scale Rule.** Use a fixed rem type scale (ratio ~1.125–1.2). No fluid clamp on UI labels or table text.

## 4. Elevation

Flat-by-default with tonal layering. Depth comes from **surface color steps** (Pure Canvas → Panel Surface) and **1px hairline borders** (`ink` at ~8–12% opacity), not drop shadows on every card.

Responsive motion energy allows subtle elevation on interaction: a soft ambient shadow may appear on hover for floating panels (cluster detail drawer, segment lookup results) — never at rest on static content.

### Shadow Vocabulary (if applicable)
- **Panel lift** `[to be resolved — e.g. 0 4px 16px rgba(15, 23, 42, 0.08)]`: Open drawers, popovers, command palette only.
- **Focus ring** `[to be resolved — 2px solid primary at 40% opacity, offset 2px]`: Keyboard focus on inputs and buttons.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest. Shadows appear only as a response to state (hover, open overlay, focus) — not as default card decoration.

## 5. Components

No components implemented yet. Re-run `/impeccable document` after the React dashboard exists to document buttons, inputs, navigation, tables, persona chips, and the cluster-map panel.

## 6. Do's and Don'ts

### Do:
- **Do** use pure white (`oklch(1.000 0.000 0)`) as the page background and let slate-teal primary carry brand on actions and selection only.
- **Do** show persona names and recommended actions at the point of segment assignment (lookup result, cluster detail, table row).
- **Do** keep model metadata (k=3, K-Means++, silhouette, feature list) in a dedicated drawer or panel — accessible, not splashy.
- **Do** use fixed 150–250ms ease-out transitions for hover, focus, and panel open/close; respect `prefers-reduced-motion`.
- **Do** align cluster colors and persona labels with `artifacts/metadata.json` persona_map.

### Don't:
- **Don't** use cliché fintech branding: navy-and-gold palettes, gold accent lines, stock-photo trust badges, "enterprise security" hero strips.
- **Don't** ship generic SaaS dashboard templates: cream backgrounds, purple gradients, oversized hero metrics with tiny labels.
- **Don't** build overloaded BI layouts: equal-weight widget grids, rainbow chart defaults, no visual hierarchy.
- **Don't** paste notebook-export aesthetic: raw Plotly `plotly_white` or Matplotlib styling into production UI without intentional design.
- **Don't** use border-left greater than 1px as a colored stripe on cards, alerts, or table rows.
- **Don't** put tiny uppercase tracked eyebrows above every section heading.
- **Don't** use gold or amber for "high risk" — use coral/rose semantic hues instead.
