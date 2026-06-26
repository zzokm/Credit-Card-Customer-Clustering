# Product

## Register

product

## Users

Risk and data analysts at a credit card issuer (or equivalent FinTech operations team). They work in focused analysis sessions — reviewing segment health, validating cluster definitions against business policy, and preparing recommendations for credit-limit, micro-loan, and risk-mitigation workflows. They are comfortable with metrics, distributions, and model metadata; they need fast orientation, not onboarding hand-holding.

## Product Purpose

Turn the completed clustering pipeline (K-Means++ on CC GENERAL behavioral data) into an analyst-facing React dashboard backed by FastAPI/Streamlit inference. The UI makes three customer personas actionable:

- **The Active Transactors** — limit increases, loyalty micro-loan eligibility
- **The Revolvers (High-Risk)** — limit holds, higher APR tiers, cash-advance monitoring
- **The Dormant/Inactive** — re-engagement campaigns, dormancy risk profiling

Success means an analyst can explore the cluster map, inspect segment profiles, look up a customer's predicted segment, and see the recommended business action — all grounded in the saved `artifacts/` model, scaler, and `metadata.json`.

## Brand Personality

Modern and approachable — Stripe/Linear clarity without feeling cold. Expert confidence: the interface reads as a serious internal instrument, not a consumer marketing site. Calm, legible, and direct; data leads, chrome recedes.

## Anti-references

- Cliché fintech branding: navy-and-gold palettes, gold accent lines, stock-photo trust badges, "enterprise security" hero strips
- Generic SaaS dashboard templates: cream backgrounds, purple gradients, oversized hero metrics with tiny labels
- Overloaded BI layouts: equal-weight widget grids, rainbow chart defaults, no visual hierarchy
- Notebook-export aesthetic: raw Plotly `plotly_white` or Matplotlib styling dropped into production UI without intentional design

## Design Principles

1. **Answer the business question first** — Every view maps to a stated segmentation question (credit-limit policy, micro-loan eligibility, dormant risk, cash-advance exposure). Metrics earn their pixels.
2. **Personas at the point of decision** — Segment names and recommended actions appear where analysts assign or validate a label, not buried in documentation.
3. **Model transparency without clutter** — Deployment metadata (k=3, K-Means++, feature list, validation metrics) is accessible in a dedicated panel or drawer, not splashed across every screen.
4. **Analyst-first density** — Information-rich layouts with clear typographic hierarchy; scannable tables and charts over decorative cards.
5. **Artifact-grounded truth** — UI state reflects `artifacts/` and `metadata.json`; cluster colors, persona copy, and inference paths stay in sync with the notebook pipeline.

## Accessibility & Inclusion

Sensible defaults: readable contrast, keyboard-accessible controls, and `prefers-reduced-motion` respected for any transitions. No additional WCAG tier or color-vision requirements specified beyond standard good practice.
