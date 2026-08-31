import json, re, numpy as np
from sklearn.decomposition import TruncatedSVD
from collections import defaultdict

ps=json.load(open("rb.json")); B=json.load(open("rb_blocks3.json"))

SPEC=[
 (84,"Aggressiveness","Eliza Burt Gamble-Men’s Enculturated Traits"),
 (89,"Modesty","Eliza Burt Gamble-Women’s Enculturated Traits"),
 (155,"Rational/Nuanced (Low Pole)","Theodor W. Adorno’s F-scale"),
 (166,"High Extraversion (High E)","Hans Eysenck’s PEN Model (1947+)"),
 (167,"Low Extraversion (Introversion) (Low E)","Hans Eysenck’s PEN Model (1947+)"),
 (168,"High Neuroticism (High N)","Hans Eysenck’s PEN Model (1947+)"),
 (169,"Low Neuroticism (Emotional Stability) (Low N)","Hans Eysenck’s PEN Model (1947+)"),
 (174,"Emotional Stability","The Guilford–Zimmerman Temperament Survey (GZTS)"),
 (190,"Privateness (Factor N)","Cattell’s 16PF"),
 (191,"Apprehension (Factor O)","Cattell’s 16PF"),
 (192,"Openness to Change (Factor Q1)","Cattell’s 16PF"),
 (193,"Self-Reliance (Factor Q2)","Cattell’s 16PF"),
 (194,"Perfectionism (Factor Q3)","Cattell’s 16PF"),
 (195,"Tension (Factor Q4)","Cattell’s 16PF"),
 (235,"Autonomy","Marie Jahoda and Positive Mental Health"),
 (268,"Independence","Ludwig Klages – Individual Traits"),
 (277,"Moral Laxity","Ludwig Klages – Individual Traits"),
 (283,"Modesty","Ludwig Klages – Individual Traits"),
 (302,"Apollonian–Dionysian Type","Ludwig Klages –  Character Types"),
 (303,"Apollonian–Faustian Type","Ludwig Klages –  Character Types"),
 (308,"Heroic–Faustian Type","Ludwig Klages –  Character Types"),
 (311,"Realist–Philistine Type","Ludwig Klages –  Character Types"),
 (332,"Strong Hunger Drive","Klages — Sanguine Type Profiles"),
 (333,"Weak Hunger Drive","Klages — Sanguine Type Profiles"),
 (334,"Strong Thirst Drive","Klages — Sanguine Type Profiles"),
 (335,"Weak Thirst Drive","Klages — Sanguine Type Profiles"),
 (336,"Hunger–Thirst Correlation Type","Klages — Sanguine Type Profiles"),
 (349,"Revised BIS (post-2000)","Jeffrey Gray and Reinforcement Sensitivity Theory"),
 (488,"Love of Learning","Peterson & Seligman - VIA Character Strengths (2004)"),
 (490,"Bravery (Courage, Valor)","Peterson & Seligman - VIA Character Strengths (2004)"),
 (501,"Humility (Modesty)","Peterson & Seligman - VIA Character Strengths (2004)"),
 (503,"Self-Regulation (Self-Control)","Peterson & Seligman - VIA Character Strengths (2004)"),
 (681,"Emotional Stability","South African Personality Inventory (SAPI)"),
 (714,"The Creator","Carol Pearson's Archetypal System"),
]

ERGS=["Sex (sexual/ mating drive","Gregariousness (social‑affiliative drive)","Protection (parental/guardian drive)",
 "Self‑assertion (dominance / achievement drive)","Self‑submission (compliance / affiliative surrender)",
 "Hunger (physiological drive for food/energy)","Security (safety / attachment drive)","Anger (aggressive/defensive drive)",
 "Disgust (avoidance / contamination drive)","Appeal (attraction / aesthetic / mating‑signal drive)"]
ERG_SYS="Cattell — Dynamic Traits (Ergs)"
DARK="Dark Triad / Tetrad (Paulhus & Williams 2002; Buckels et al. 2013)"
RELABEL={"Perspective (Wisdom)":"Peterson & Seligman - VIA Character Strengths (2004)",
 "Appreciation of Beauty and Excellence":"Peterson & Seligman - VIA Character Strengths (2004)",
 "Low Aesthetic Appreciation (Pragmatism)":"The HEXACO Model of Personality",
 "High Trust":"Costa & McCrae – NEO-PI-R / NEO-PI-3 Facets (1985 / 2010 update)",
 "Machiavellianism":DARK,"Narcissism":DARK,"Psychopathy":DARK,"Sadism (Dark Tetrad addition)":DARK,
 "Curiosity (erg: exploration / epistemic)":ERG_SYS}
for e in ERGS: RELABEL[e]=ERG_SYS

FIELD=[("definition",r'^Definition\s*:\s*(.+)'),("motivation",r'^(?:Underlying Motivation|Motivation)\s*:\s*(.+)'),
 ("permanence",r'^Permanence\s*:\s*(.+)'),("behaviors",r'^(?:Observable Behaviors|Behaviors)\s*:\s*(.+)'),
 ("strengths",r'^Strengths\s*(?:&|and)?\s*(?:Downsides)?\s*:\s*(.+)'),("downsides",r'^Downsides\s*:\s*(.+)'),
 ("origins",r'^(?:Developmental Origins|Developmental Notes|Origins)\s*:\s*(.+)'),
 ("phrases",r'^(?:Short phrases|3[–‑-]4[‑ ]?word phrases|3[–‑-]4 Word Phrases)\s*:\s*(.+)')]

def fields(k):
    b=B[k]; out={}
    stop=B[k+1]["i"] if k+1<len(B) else len(ps)
    for j in range(b["i"], min(stop, b["i"]+30)):
        t=ps[j]["t"]
        for name,pat in FIELD:
            m=re.match(pat,t,re.I)
            if m and name not in out: out[name]=m.group(1).strip()
    return out

def slug(s): return re.sub(r'[^a-z0-9]+','-',s.lower()).strip('-')

new=[]
for k,name,sysname in SPEC:
    f=fields(k)
    adjs=[]
    for a in B[k]["adj"]:
        a=a.strip().lower()
        if a and a not in adjs: adjs.append(a)
    new.append({"name":name,"system":sysname,"adjectives":adjs[:12],**f})
print("new traits:",len(new),"| avg adjectives:",sum(len(t['adjectives']) for t in new)/len(new))
json.dump(new,open("newtraits2.json","w"),ensure_ascii=False)
