# Categorization audit — chart systems vs. Refined Box (with sources)
Method: parsed all 622 profile blocks from the uploaded document, matched each to its chart trait by combined name + adjective-set score, then flagged any trait whose chart system disagrees with the systems of the blocks surrounding it in the document. Verified every flag by hand against the document's section structure.

## The headline: the Ergs were never missing — they were mis-filed

The document's section **"A — Ergs (Cattell's canonical list — 11 innate drives)"** lists eleven: Curiosity, Sex, Gregariousness, Protection, Self-assertion, Self-submission, Hunger, Security, Anger, Disgust, Appeal.

All eleven are already in the chart. **Only Curiosity carries the label "Cattell's Dynamic traits-Ergs." The other ten are filed under "Cattell's 'style of emotional response'."** That bucket currently holds 21 traits, which decompose cleanly:

- **10 ergs** (Sex, Gregariousness, Protection, Self-assertion, Self-submission, Hunger, Security, Anger, Disgust, Appeal) → belong with Curiosity under Ergs
- **10 temperament styles** (Activity, Emotional reactivity, Sociability, Impulsivity, Dominance, Sensitivity, Vigilance, Tension, Conscientiousness, Openness) → correctly placed; these are the document's lettered A–J list under "2) Temperament traits"
- **1 stray from another system entirely** — see below

This corrects my earlier completeness audit, which reported the ergs as absent from the chart because their document entries use "Single-word descriptors:" rather than "Adjectives:". They were ingested; they landed in the wrong drawer. Cattell's other subdivisions are correct: "Cattell -Ability traits" holds the ten Gf/Gc-style domains, "Cattell- dynamic traits- Sentiments" holds the five sentiments, "Cattell's 16PF" holds its ten (six more pending your sign-off on the drafted entries).

## Other confirmed misassignments

Each of these sits in the middle of another system's run in the document, with an exact name match to that system's entry:

| Trait | Chart says | Document says |
|---|---|---|
| High Trust | Cattell's "style of emotional response" | Costa & McCrae NEO — Agreeableness: Trust |
| Perspective (Wisdom) | Ludwig Klages – Character Types | VIA Character Strengths (#5) |
| Appreciation of Beauty and Excellence | Ludwig Klages – Individual Traits | VIA Character Strengths (#20) |
| Low Aesthetic Appreciation (Pragmatism) | Phrenology Intellectual Faculties | HEXACO (low pole of Aesthetic Appreciation) |
| Aggressiveness | Ludwig Klages – Individual Traits | Eliza Burt Gamble — Men's Enculturated Traits |
| Machiavellianism | VIA Character Strengths | Dark Triad / Tetrad |
| Narcissism | VIA Character Strengths | Dark Triad / Tetrad |
| Psychopathy | BFAS | Dark Triad / Tetrad |
| Sadism (Dark Tetrad addition) | BFAS | Dark Triad / Tetrad |

Aggressiveness is the clearest structural case: it is the **first** entry of Gamble's men's traits in the document, immediately followed by Selfishness / Self-Seeking, Restlessness and Ambition — all three correctly labelled Gamble in the chart. Only the run's opening entry drifted.

The Dark Tetrad four have their own document section ("GG. The Dark Triad and Dark Tetrad"), so they warrant a real system label rather than being split between VIA and BFAS.

## Correction to the earlier completeness audit

Two of the six VIA strengths I previously reported as missing — **Perspective** and **Appreciation of Beauty and Excellence** — are present but mislabelled. Four remain genuinely absent: **Love of Learning, Bravery, Humility (Modesty), Self-Regulation**. VIA is therefore at 22 of 24 once relabelling is done, not 18.

Also newly found missing: **Modesty**, a Gamble women's trait with a full document block (between Patience/Endurance and Self-Denial/Self-Sacrifice) that has no chart trait at all.

## What checked out clean

Every other system's members form a single contiguous run in the document with no interlopers: Reiss, CliftonStrengths, Enneagram, TCI-R, Murray, Theophrastus, Tomkins, FIRO-B, Keirsey, Fisher, Rubin, Hartman, Millman, Kessler, Oldham, GZTS, Jahoda, Adorno's F-scale, SDT, Gray RST, Spranger, Comte, Phrenology (its other fourteen faculties are genuine Gall faculties), Klages (its remaining entries are genuine), the NEO and HEXACO facet sets, BFAS aspects, the cultural inventories (Latin American, SAPI, CPAI), and the three astrology systems.

Two apparent flags proved to be artifacts of my matcher rather than chart errors, and are listed here so they aren't "fixed" by mistake: Phrenology's **Comparison** and **Order** are authentic Gall faculties — they only looked misplaced because the blocks they would match (the F-scale's Rational/Nuanced low pole, and NEO's High Order) are themselves missing from the chart, leaving those document blocks free to be grabbed. Likewise the two **Assertiveness** entries (NEO's and BFAS's) are both correctly labelled; they merely have identical document headings and can cross during matching.

## Proposed fixes, in order of confidence

1. Relabel the 10 ergs → "Cattell — Dynamic Traits (Ergs)" (joins Curiosity; brings the section to 11/11)
2. Relabel the 4 Dark Tetrad traits → "Dark Triad / Tetrad (Paulhus & Williams 2002; Buckels et al. 2013)"
3. Relabel High Trust → NEO; Perspective and Appreciation of Beauty → VIA; Low Aesthetic Appreciation → HEXACO; Aggressiveness → Gamble Men's
4. Add the genuinely missing entries in a later pass: VIA's remaining four, Gamble's Modesty, plus the recoverable blocks and the drafted 16PF/PEN entries

All of these are data-layer edits: the trait's `system` string, the theorist index, and the field index. No re-embedding or re-layout is required, since positions derive from adjectives rather than labels.
