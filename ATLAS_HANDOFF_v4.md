# Personality Semantic Atlas — Handoff v4
Supersedes ATLAS_HANDOFF_v2/v3. Current state as of this session. Read §0 and §1 first; the rest is reference.

---

## 0. What this is

Two single-file, zero-dependency interactive HTML charts of the same 779 personality trait-profiles:

- **Cooked** — traits forced onto a *designed* structure: six family squares (four classical humors + Competence + Mystical), hand-chosen axes inside each square, transition bands and a hub between them.
- **Harvested** — the same traits with *no imposed structure*: PPMI over the trait×adjective graph → 120-d SVD → UMAP to 2-D, rotated so axes align with the corpus's strongest meaning dimensions. Communities, axis words, density blobs and valley lines are all derived.

Source of truth for content: **Refined Box** (Apple Pages / .docx), a compendium of ~721 profile blocks. Each block gives a trait a Definition, an adjective list, phrases, motivation, permanence, behaviors, strengths/downsides and developmental origins.

**Live site**: adamshiva.com (CNAME in repo root) — repo `adamingers/personality-atlas`.
**IMPORTANT**: the served folder is `personalitygraph1_package/personalitygraph1/`, **not** `personalitychart/` as v2 of this handoff claimed. Verify before publishing.

---

## 1. Current numbers

| | |
|---|---|
| Traits | **779** |
| Adjectives | **926** |
| Distinct systems (bodies of work) | **77** |
| Theorists / traditions (grouped) | **66** |
| Convergence clusters | 86 |
| Masters | `atlas_cooked_v12.json`, `atlas_harvested8.json` |
| Charts | `cooked.html`, `harvested.html`, `index.html` |

Family distribution and layout are derived, not hand-set. Hub holds exactly 3 traits; 0 traits fall outside their family boxes.

---

## 2. Build pipeline (all scripts in `build_tools/`)

1. **`parse_pages2.py` / docx parse → `rb_blocks3.json`** — extracts profile blocks from the source document. **Critical**: blocks come in two formats; some use `Definition:` and some use `Single-word adjectives:` / `Single-word descriptors:`. A parser that only looks for `Definition:` silently misses ~100 blocks (this caused two wrong audits — see §6).
2. **`ingest_patch.py`** — pulls the chosen blocks into `newtraits2.json` with all profile fields.
3. **`ingest_patch2.py`** — the main build. Rebuilds the embedding over the *combined* corpus (PPMI → `TruncatedSVD(120, random_state=42)` on the transpose → L2 normalise; trait vector = L2-normalised mean of its word vectors), places new traits by kin-anchoring to their nearest same-family neighbours, de-overlaps, then regenerates **every** derived layer: `trait_corr`, `allfit`/`comfit`, adjective coordinates, `word_index`, `adj_corr`/`adj_syn`, `conf`, `theorists`, `theorist_index`, `theorist_groups`, `field_index`, `conv_meta` + per-trait `cv`/`cvc`, `twins`, and `counts`.
4. **`rebuild_harvest_artifacts.py`** — harvested-only: convex hulls (×1.13), density blobs, axis ticks, valley watershed.
5. **Re-embed + inject** — `inject.py` regex-replaces `const DATA={...};` in the base charts (escape `</` as `<\/`, dotall regex, then `node --check`), then appends `features.js` and patches CSS/markup.
6. **Test** — `smoke2.js` (base), plus `t8/t11/t13/t14/t15/t17/t19.js` for the added features. All must report `ERRORS: none`.

**Do not** hand-edit the HTML. Everything flows from the masters through `inject.py`.

---

## 3. Chart features (all added on top of the base charts by `features.js`)

- **🔓 Lock** — freezes the current profile; map clicks stop changing it so you can trace a thread across the chart. Panel navigation, zoom and pan still work. Esc unlocks. (Replaced the old Confidence toggle, which is now hidden.)
- **⇆ Compare** — two side-by-side full profiles. Entering compare **keeps the profile you were reading** as the left card. Each side has its own *replace this side* button; whichever shows ◉ receives your next pick. Swap exchanges the two. Accepts **traits or lassoed regions on either side**, mixed freely. Shows shared adjectives (violet), overlap %, and **near matches** — semantically equivalent word pairs the two don't literally share.
- **◌ Lasso** — freehand selection; region report lists cumulative adjectives sorted by **distinctiveness** (lift vs atlas base rate) or plain frequency. Clicking a word routes by occurrence count: **1 → that trait's profile, 2 → both sides of compare, 3+ → the word's profile**. Tap traits to add/remove. *Compare this region* button feeds the selection into compare.
- **◈ Convergence** — recolours by how many independent systems describe a trait the same way (cosine ≥ 0.80 across different systems, union-find): purple core (4+ systems), blue triple, amber pair, grey outlier. Every profile names its cluster and can light the whole cluster up.
- **Semantic word links** — tapping a word draws dashed teal links to its nearest words by meaning and lists them in *Nearest in meaning*, one row per link. Row count always equals line count.
- **Twins** — 53 traits share a name with another theorist's trait. Each carries a *Same name, other theorists* panel linking to its namesakes.
- **Hormone view** — chips per neurochemical family with counts; tap to isolate that region.
- **Theorist grouping** — one row per person; multi-section theorists (Cattell 5, Klages 3, Phrenology 3, Gamble 2, Spranger 2, Ayurveda 2) expand into their bodies of work.
- **View bounds** — cannot zoom out past the whole chart or pan into empty margin. Implemented by wrapping the single `applyVB()` that every zoom/pan path calls.
- **Layout** — toolbar is the first element in `<body>` (not inside the map), opaque, full width. Panels are padded 34px so the tab row clears the bar. Mobile breakpoint at 820px stacks the columns.

---

## 4. Data schema notes (things that will bite you)

- `word_index[word]` is an **array of trait ids**, never a scalar index. A scalar breaks `showTrait`.
- `trait_cluster_fit` is `{"cluster": id, "all": {cid: int}}`.
- `allfit`/`comfit` are normalised **per trait** (min-max across that trait's family similarities), not per family. Getting this backwards breaks the fit filter's ranges.
- New traits must never be assigned to `SEAM` or `HUB` — those bands are for multi-family combiners only.
- Escape `</` as `<\/` when embedding JSON into HTML.
- `conv_meta[i].systems` is truncated to 12 for display.

---

## 5. Content corrections applied this session

**Relabels** (single profile, wrong system label — verified no same-name twin existed first):
- 10 Cattell **ergs** were filed under "style of emotional response"; moved to *Cattell — Dynamic Traits (Ergs)*, which is now complete at 11/11. That bucket now correctly holds only its 10 temperament styles.
- **Perspective (Wisdom)** and **Appreciation of Beauty and Excellence** → VIA (were Klages).
- **Low Aesthetic Appreciation** → HEXACO (was Phrenology).
- **High Trust** → NEO (was Cattell).
- **Machiavellianism, Narcissism, Psychopathy, Sadism** → new *Dark Triad / Tetrad* system (were split between VIA and BFAS).
- **Happiness (Subjective Well-Being)** had an empty system string → *Positive Psychology — Subjective Well-Being*. **Verify this attribution against the document.**

**34 traits ingested**: Gamble's Aggressiveness and Modesty; Klages' Independence, Moral Laxity, Modesty, 4 compound character types and the 5-entry Sanguine Hunger/Thirst sub-section; 16PF factors N, O, Q1–Q4 (now 16/16); PEN High/Low Extraversion and Neuroticism (now 6/6); Jahoda's Autonomy; GZTS and SAPI Emotional Stability; Pearson's The Creator; F-scale Rational/Nuanced; Gray's Revised BIS; VIA's Love of Learning, Bravery, Humility, Self-Regulation (now 24/24).

---

## 6. Two lessons that cost real time

1. **Never dedupe by name alone.** In this corpus the same word is routinely used by different theorists with different meanings. Klages' *Aggressiveness* and Gamble's are distinct profiles; so are Klages' and Reiss's *Independence* (cosine 0.44 — they land 98 units apart on the map, in different regions). Dedupe on **name + adjective list**, and keep twins as separate traits. An earlier audit wrongly recommended relabelling Klages' Aggressiveness to Gamble, which would have destroyed a correct entry and left the real gap.
2. **Parse both block formats** (see §2.1). The first audit reported the ergs and several VIA strengths as missing when they were present but invisible to the parser, or present but mislabelled.

---

## 7. Known open items

- **Refined Box has a duplicated CPAI block** — Renqing, Face, Harmony, Relationship Orientation, Defensiveness, Traditionalism appear twice with identical adjective lists (once after the Latin American section, once after SAPI). The chart correctly holds one copy each; the document should be cleaned.
- **Still absent from the chart**: Gendered Cultural Patterns (a Mead/Murray composite block covering three cultures — needs splitting before it can be ingested), and any source-library batches 3–5 not yet processed.
- **59 profileless traits** remain (was 182). See §9.
- **Missing theorist overviews**: de Pizan, Ian Leslie.
- **Mobile layout** has been implemented but never tested on a real device.
- Base label font size in the chart is small at low zoom; current mitigation is the browser-zoom instruction at the end of the intro. A direct base-size bump is a one-line change if wanted.

---

## 8. Publishing

The site serves from `personalitygraph1_package/personalitygraph1/`. Publishing = replacing **three** files there: `index.html`, `cooked.html`, `harvested.html`. The `index.html` carries the trait count in its two description strings (currently 779) — update it whenever the trait count changes. Nothing else in the repo needs to move. GitHub Pages serves the root; `CNAME` maps it to adamshiva.com.


---

## 9. The two source documents — both are needed

There are **two** versions of the compendium and neither is a superset of the other:

- **Clean Box (digital, .docx)** — the earlier version. 726 blocks. Fields are written as a label line followed by the value on the *next* line (`Definition:` ⏎ text), and phrases are one per line in quotes.
- **Refined Box (with sources, .docx)** — the later version. 809 blocks. Adds the astrology systems, the 16PF/PEN entries, source citations, and much else — but **prose was dropped from many entries during the rewrite**, especially Permanence and Developmental Origins.

Parsing them needs two different readers (see the field-format difference above). A merge pass in this session pulled **1,121 field values** out of Clean Box that Refined Box no longer had, filling gaps on **534 traits** and giving **123 traits their first profile**. Profileless count fell 182 → **59**.

Fields recovered: permanence 413, origins 349, strengths 143, phrases 123, behaviors 48, motivation 25, definition 19, downsides 1. Nothing existing was overwritten — the merge only fills empty fields, verified by diff.

**When ingesting in future, check both documents for every trait.** If only Refined Box is consulted, prose that exists in Clean Box will be silently missing.

The 59 still profileless: Phrenology's 31 faculties across its three groups, Cattell's 10 ability traits and 8 temperament styles, the 4 hormone-based poles, and 6 singletons. These have no prose in *either* document and would need authoring or an outside source.
