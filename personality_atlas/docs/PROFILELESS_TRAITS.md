# The profileless traits — what they are and what can be done

Recomputed against the current master (`atlas_cooked_v11.json`, 779 traits). The old `missing_profiles.txt` listed 169 and was based on the 621-trait build; the current figure is **182**.

## What "profileless" means

Every trait has a name, a system, an adjective list, coordinates, correlates and convergence data — that's what puts it on the map. A *profile* is the prose layer: Definition, Underlying Motivation, Permanence, Observable Behaviors, Strengths, Downsides, Developmental Origins. These 182 traits have **none of those fields**, so clicking one shows its adjectives, correlates, convergence cluster and twins, but no descriptive text.

They are fully functional as map positions — placement is computed from adjectives, not prose — they're just thin when you open them.

## Where they are concentrated

| System | Profileless | of total |
|---|---|---|
| Ludwig Klages – Individual Traits | 39 | 47 |
| Klages — Sanguine Type Profiles | 25 | 25 |
| Ludwig Klages – Character Types | 18 | 20 |
| Phrenology Intellectual Faculties | 12 | 14 |
| Cattell — Dynamic Traits (Ergs) | 11 | 11 |
| Phrenology Sentiments | 10 | 10 |
| Cattell — Ability traits | 10 | 10 |
| Cattell's 16PF | 9 | 16 |
| Phrenology Propensities | 9 | 9 |
| Cattell's "style of emotional response" | 8 | 10 |
| FIRO-B | 6 | 6 |
| Spranger's Types of Men | 6 | 6 |
| Cattell — Sentiments | 5 | 5 |
| Self-Determination Theory | 4 | 7 |
| Hormone based types | 4 | 4 |
| Gray RST | 3 | 4 |
| Spranger's Mixed Types | 2 | 2 |
| GZTS (Masculinity) | 1 | 10 |

Klages alone accounts for 82 — nearly half. Phrenology contributes 31, Cattell 43 across his five subdivisions.

## Three different situations, three different fixes

**1. Recoverable right now — 24 traits.** The document already has full prose for these; the ingest simply never picked it up. Includes nine 16PF factors (Warmth A, Reasoning B, Dominance E, Liveliness F, Rule-Consciousness G, Social Boldness H, Sensitivity I, Vigilance L, Abstractedness M), all six FIRO-B scales, Gray's BAS/BIS, GZTS Masculinity, SDT's Relatedness and Competence, and Phrenology's Order. **This is a pipeline fix, not authoring** — a re-run of the field extractor against these blocks would fill them.

**2. Adjectives-only in the source — 94 traits.** The document entry itself provides only "Single-word adjectives:" and "3–4-word phrases:" and no Definition. This is most of Klages (his individual traits and the entire Sanguine/temperament-variant section), Spranger's types, the Cattell ergs and ability traits. Nothing exists to recover; these would have to be **authored**, the way the 16PF and PEN entries were drafted earlier. The good news is the phrase lines give a strong starting point — each entry has 3–4 evocative phrases that can seed a definition.

**3. Not in the document under that name — 64 traits.** Phrenology's faculties (Amativeness, Benevolence, Mirthfulness, Veneration, Adhesiveness, Philoprogenitiveness, Language…), the hormone-based poles, and Cattell's "style of emotional response" list. These entered the chart from an earlier source than Refined Box, or under different headings. They need either a source hunt or authoring from scratch.

## Suggested order of work

1. **Re-run field extraction for the 24 recoverable ones** — cheap, purely mechanical, and it fixes the most-visited traits in the atlas (the 16PF factors are among the best-known items in the whole chart).
2. **Author Klages** — 82 traits is the single biggest block, and his sections are internally consistent enough to draft in batches, seeded by the existing phrase lines. His compound types (Apollonian–Dionysian and the rest) can be composed from their two component types.
3. **Trace the 64 unmatched** — decide per group whether to add them to Refined Box or author fresh. Phrenology's 31 faculties are well documented historically, so these are straightforward to write.

None of this affects positions, correlations, convergence tiers or any existing feature — the prose layer is purely additive, so it can be done in batches without a re-layout.
