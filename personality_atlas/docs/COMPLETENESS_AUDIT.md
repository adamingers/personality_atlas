# Completeness Audit — chart (745) vs Clean Box doc vs canonical inventories
Date: 2026-08-04. Method: every system's chart membership was compared against (a) the parsed Clean Box block list (612 blocks — ground truth for what the doc contains) and (b) the published inventory it describes.

## Category A — LOST BEFORE CLEAN BOX (absent from the doc; new entries must be authored)

**Cattell's 16PF — 6 of 16 factors missing.** The doc's sequence runs 1–10 and stops at "10. Abstractedness (Factor M)". Missing: **Privateness (N), Apprehension (O), Openness to Change (Q1), Self-Reliance (Q2), Perfectionism (Q3), Tension (Q4)** — the alphabetical tail, consistent with a truncation. (The two "Openness to Change" strings elsewhere in the doc are a BFAS Liberalism block and a strengths line — unrelated.)

**Eysenck PEN — 2 of 3 dimensions missing.** The doc has only the High/Low Psychoticism pair. **Extraversion and Neuroticism** have no PEN blocks. (Both constructs are covered under other systems, so this may have been a deliberate choice rather than a loss — but as PEN entries they don't exist.)

That is the full extent of Category A. No other system shows the truncation pattern.

## Category B — IN THE DOC but never made it into the chart (recoverable by ingest, no authoring needed)

These are among the ~140 blocks the trait-matching left unused because the original 621-trait chart never had them, and the approved ingest covered only astrology + low poles:

- **VIA (18/24 in chart): Love of Learning, Perspective (Wisdom), Bravery, Humility (Modesty), Self-Regulation, Appreciation of Beauty and Excellence** — all six exist as full blocks (#314–316, 327, 329, 330).
- **Cattell Ergs (1/11 in chart): Sex, Gregariousness, Protection, Self-assertion, Self-submission, Hunger, Security, Anger, Disgust, Appeal** — the doc contains all 11 with full adjective lists (lines 2085–2119), but they use "Single-word descriptors:" formatting instead of "Adjectives:", so only Curiosity ever became a trait. Biggest single recovery.
- **Carol Pearson (11/12): The Creator** — full block #540.
- **GZTS (9/10): Emotional Stability** — block #136; the doc has all ten.
- **Jahoda Positive Mental Health (5/6): Autonomy** — block #155.
- **SAPI (7/9): Emotional Stability** — block #507. (Doc's SAPI "Traditionalism" is a duplicate of the CPAI entry already charted.)
- **NEO (29/30 facets): Agreeableness — Trust** — the High Trust block #415 exists; the 621 chart simply never had it.
- **Adorno F-scale (17/18): Low Pole (Rational/Nuanced)** — block #121, the low pole of Superstition & Stereotypy; skipped by the dedup guard during the low-pole ingest.
- **Guard-skipped low poles from the last ingest** (all in doc, skipped for ≥0.7 overlap with existing traits — recoverable if literal completeness is wanted): NEO Low Impulsiveness, Low Warmth, Low Fantasy, Low Trust, Low Modesty, Low Order; BFAS Low Volatility, Low Imagination, Low Emotional Stability; HEXACO Low Flexibility, Low Aesthetic Appreciation, Low Modesty.
- Minor: Gray RST "Revised BIS (post-2000)" block #176 (arguably a footnote, not a trait).

## Verified complete against canon

Reiss 16/16 · CliftonStrengths 34/34 · Enneagram 9/9 · TCI-R 29/29 · Murray needs 20/20 · Theophrastus 30/30 · Tomkins affects 9/9 · FIRO-B 6/6 · Keirsey 4/4 · Fisher 4/4 · Rubin 4/4 · Hartman 16/16 · Millman 12/12 · Kessler 5/5 · HEXACO facets 24/24 · BFAS aspects 10/10 · SDT full continuum incl. both Extrinsic subtypes (the doc's "5→6" numbering jump is a parse artifact, not a loss) · Chinese/Western Zodiac 12/12 · Planets 10/10 · Doshas, Gunas, Five Elements, Stoic/Epicurean, de Pizan 11, Comte 6, Spranger 6+2, Phrenology 34.

Not errors but worth knowing: Jung is stored as 6 components (2 attitudes + 4 functions) rather than the 8 compound types — matches the doc's design. Oldham has 15 styles + 2 ADD types, one more than the canonical 14 ("Retiring") — extra, not missing, and matches the doc.

## Labeling flag

The doc's Dark Tetrad section (blocks #335–338) is split oddly in the chart: **Machiavellianism and Narcissism carry the VIA system label** (pre-existing in the 621), while Psychopathy and Sadism were given BFAS during the low-pole ingest. All four arguably belong under a proper "Dark Tetrad (Paulhus & Williams, 2002; Buckels et al., 2013)" system.

## Repair plan (pending approval)

1. **Author 8 new Clean Box–format entries** (16PF ×6, PEN ×2): Definition, Adjectives (10), 3–4 Word Phrases, Underlying Motivation, Permanence, Observable Behaviors, Strengths & Downsides, Developmental Notes — drawn from the published factor descriptions.
2. **Ingest the ~21 Category B blocks** (VIA 6, Ergs 10, Pearson 1, GZTS 1, Jahoda 1, SAPI 1, NEO Trust 1) through the existing pipeline; user to decide on the 12 guard-skipped low poles, F-scale Rational/Nuanced, and Revised BIS.
3. Optional: re-system the Dark Tetrad four.
