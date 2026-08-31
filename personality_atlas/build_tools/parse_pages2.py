import json, re

runs0 = json.load(open("runs.json"))
# split on U+2028/U+2029 and newlines into lines
runs = []
for s in runs0:
    for part in re.split(r'[\u2028\u2029\n\r]+', s):
        part = part.strip()
        if len(part) >= 2:
            runs.append(part)
print("lines after split:", len(runs))
json.dump(runs, open("lines.json","w"), ensure_ascii=False)

LABEL_RE = re.compile(
    r'^(Definition|Adjectives|Single[\u2010-\u2015\-\u2011 ]word adjectives|Single[\u2010-\u2015\-\u2011 ]word descriptors|'
    r'High adjectives|Low adjectives|'
    r'Phrases variants|Phrase variants|Phrases|Short phrases|3[\u2013\u2010-\u2015\-]4[\u2010-\u2015\-\u2011 ][Ww]ord [Pp]hrases|'
    r'Underlying Motivation|Motivation|Permanence|Observable Behaviors|Behaviors|Strengths & Downsides|Strengths/Downsides|'
    r'Strengths|Downsides|Developmental Notes|Developmental Note|Developmental Origins|Origins)'
    r'(\s*\([^)]{1,20}\))?\s*:\s*(.*)$')
DEF_RE = re.compile(r'^Definition\s*:\s*(.*)$')

def_idx = [i for i, s in enumerate(runs) if DEF_RE.match(s)]
print("Definition lines:", len(def_idx))

def norm_label(lab):
    import re as _re
    if lab.startswith("Phrase") or lab == "Short phrases" or _re.match(r'^3.4.[Ww]ord', lab): return "Phrases variants"
    if lab.startswith("Developmental") or lab == "Origins": return "Developmental Notes"
    if lab.startswith("Single"): return "Descriptors"          # not adjset source
    if lab in ("High adjectives","Low adjectives"): return lab  # not adjset source
    if lab == "Motivation": return "Underlying Motivation"
    if lab == "Behaviors": return "Observable Behaviors"
    if lab == "Strengths/Downsides": return "Strengths & Downsides"
    return lab

blocks = []
for bi, di in enumerate(def_idx):
    end = def_idx[bi+1] if bi+1 < len(def_idx) else len(runs)
    ctx = []
    j = di - 1
    prev_end = def_idx[bi-1] if bi > 0 else -1
    while j > prev_end and len(ctx) < 4:
        s = runs[j]
        if LABEL_RE.match(s):
            break
        ctx.append(s)
        j -= 1
    ctx.reverse()
    fields = {}
    cur = None
    # limit accumulation so next block's backward-ctx lines don't bleed into fields
    end_eff = end
    if bi+1 < len(def_idx):
        ndi = def_idx[bi+1]
        j2 = ndi - 1; nctx = 0
        while j2 > di and nctx < 4 and not LABEL_RE.match(runs[j2]):
            nctx += 1; j2 -= 1
        end_eff = ndi - nctx
    STOP_RE = re.compile(r'^(Author|Authors|Introduction|Note on sources[^:]*)\s*:')
    for k in range(di, end_eff):
        s = runs[k]
        if STOP_RE.match(s):
            cur = None
            continue
        m = LABEL_RE.match(s)
        if m:
            cur = norm_label(m.group(1))
            val = m.group(3).strip()
            if cur in fields and val:
                fields[cur] = (fields[cur] + " | " + val).strip(" |")
            else:
                fields[cur] = val
        elif cur:
            fields[cur] = (fields.get(cur,"") + " " + s).strip()
    adjline = fields.get("Adjectives", "")
    # strip trailing period, split
    adjset = set(a.strip().lower().rstrip('.') for a in re.split(r'[,;]', adjline) if a.strip())
    adjset.discard('')
    blocks.append({"order": bi, "di": di, "ctx": ctx, "fields": fields, "adjset": sorted(adjset)})

print("blocks:", len(blocks))
json.dump(blocks, open("blocks.json","w"), ensure_ascii=False)

n_adj = sum(1 for b in blocks if b["adjset"])
print("blocks with adjectives:", n_adj)
# tail systems
for b in blocks[576:640]:
    nm = b["ctx"][-1][:55] if b["ctx"] else "(none)"
    print(b["order"], "|", nm, "| adjs", len(b["adjset"]))
