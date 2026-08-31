# Same-name / different-theorist audit — corrections to the previous report

You were right, and the previous audit was wrong in a way worth stating plainly: **when the same word is used by two theorists, the chart usually holds one of them and drops the other.** What I earlier called "misassignment" was in several cases a *collision* — the chart's copy is correctly labelled; its twin is simply absent. Deleting or relabelling would have destroyed a correct entry and left the real gap in place.

Method: re-parsed the document with a general block detector that also catches entries using "Single-word adjectives:" / "Single-word descriptors:" instead of "Definition:" — that raised the profile count from 622 to **721**, and is exactly why the earlier pass mis-read Klages and the Cattell ergs. Then compared each chart trait's adjective list against every candidate document profile of the same name.

## The Aggressiveness case — I had it backwards

The document contains **two** Aggressiveness profiles:

- **William James / Gamble men's-traits region** — combative, forceful, violent, domineering, belligerent
- **Klages, Individual Trait #23** — combative, forceful, pushy, assertive, hostile

The chart's Aggressiveness matches the **Klages** list at 1.00 and the other at only 0.40. So the chart's entry is **correctly labelled Klages**, and the missing one is the men's-enculturated-traits profile. My earlier recommendation to relabel it to Gamble would have been a real error. Retracted.

## Confirmed collisions where one twin is missing

| Name | In the chart | Absent |
|---|---|---|
| Aggressiveness | Klages #23 | James/Gamble men's traits |
| Modesty | *neither* | Klages #40 **and** Gamble women's traits |
| Independence | Reiss (16 Basic Desires) | Klages #25 |
| Autonomy | Deci & Ryan (SDT) | Jahoda, Positive Mental Health #4 |
| The Creator | Buckingham's StandOut | Carol Pearson's Archetypal System #7 |
| Emotional Stability | 16PF Factor C, BFAS | GZTS #5, SAPI |
| Agreeableness — Trust | *absent* | NEO facet #19 |

## Collisions that are correctly handled — do not touch

Both twins are present and properly separated: Anger (Cattell erg / Tomkins affect), Disgust (erg / Tomkins), Curiosity (four distinct ones — Cattell erg, Reiss, VIA, Ian Leslie), Compassion (TCI-R / BFAS), Dependence (Klages / TCI-R), Disorderliness (Klages / TCI-R), Imagination (Klages / BFAS), Impulsiveness (Klages / TCI-R), Orderliness (Klages / BFAS), Sensitivity (16PF Factor I / Klages), Sex (Murray nSex / Cattell erg), Order (three: Phrenology faculty, Murray nOrd, Reiss), Empathy (TCI-R / CliftonStrengths), Responsibility (TCI-R / CliftonStrengths), Harmony (CliftonStrengths / CPAI), and the full Big-Five facet families where NEO and HEXACO share domain words (Agreeableness, Conscientiousness, Extraversion, Openness, Emotionality, Neuroticism, Honesty–Humility).

## A document problem, not a chart problem

**Six CPAI entries appear twice in Refined Box** — Renqing, Face, Harmony, Relationship Orientation, Defensiveness, Traditionalism — once at the end of the Latin American section and again after SAPI, with byte-identical adjective lists. The chart correctly holds one copy of each. The duplicate paste should be removed from the document, not added to the chart.

## What still stands from the previous audit

These were verified again and remain true misassignments (single profile, wrong label):

- **The ten Cattell ergs** filed under "Cattell's 'style of emotional response'" instead of Ergs (Curiosity alone carries the right label)
- **Perspective (Wisdom)** → labelled Klages Character Types; it is VIA #5
- **Appreciation of Beauty and Excellence** → labelled Klages Individual Traits; it is VIA #20
- **Low Aesthetic Appreciation (Pragmatism)** → labelled Phrenology; it is the HEXACO low pole
- **High Trust** → labelled Cattell; it belongs to the NEO high/low pole series
- **The Dark Tetrad four** split between VIA and BFAS

For each of these I checked for a same-name twin first: none exists, so relabelling is safe.

## Complete list of genuinely absent profiles (18)

After excluding duplicate copies and profiles already represented under another name:

- **Klages — Sanguine Type Profiles (5)**: Strong/Weak Hunger Drive, Strong/Weak Thirst Drive, Hunger–Thirst Correlation Type — an entire sub-section never ingested
- **Klages — Character Types (4)**: Apollonian–Dionysian, Apollonian–Faustian, Heroic–Faustian, Realist–Philistine (compound types)
- **Klages — Individual Traits (3)**: Independence, Moral Laxity, Modesty
- **Cattell 16PF (3)**: Privateness (N), Apprehension (O), Perfectionism (Q3) — from the entries drafted for this edition
- **Aggressiveness** (James/Gamble), **Autonomy** (Jahoda), **Gendered Cultural Patterns** (Murray/Mead composite)

Plus the four VIA strengths and the other recoverable blocks noted previously — Love of Learning and Self-Regulation surfaced again here; Bravery and Humility are represented closely enough by existing entries to fall below the threshold, so they need a manual look.

## Recommended sequence

1. Apply the six safe relabels (ergs, VIA pair, HEXACO pole, NEO trust pole, Dark Tetrad) — no twins exist, no risk
2. Ingest the 18 absent profiles, keeping same-name twins as **separate traits** with distinct system labels
3. Remove the duplicated CPAI block from Refined Box
4. Adopt a standing rule for future ingests: never dedupe by name — only by name *and* adjective list, since identical names across theorists are the norm here, not the exception
