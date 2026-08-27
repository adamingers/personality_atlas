import json, re, numpy as np
from sklearn.decomposition import TruncatedSVD
from collections import defaultdict
rng=np.random.default_rng(42)

NEW=json.load(open("newtraits2.json"))
ERG_SYS="Cattell — Dynamic Traits (Ergs)"
DARK="Dark Triad / Tetrad (Paulhus & Williams 2002; Buckels et al. 2013)"
ERGS=["Sex (sexual/ mating drive","Gregariousness (social‑affiliative drive)","Protection (parental/guardian drive)",
 "Self‑assertion (dominance / achievement drive)","Self‑submission (compliance / affiliative surrender)",
 "Hunger (physiological drive for food/energy)","Security (safety / attachment drive)","Anger (aggressive/defensive drive)",
 "Disgust (avoidance / contamination drive)","Appeal (attraction / aesthetic / mating‑signal drive)"]
RELABEL={"Perspective (Wisdom)":"Peterson & Seligman - VIA Character Strengths (2004)",
 "Appreciation of Beauty and Excellence":"Peterson & Seligman - VIA Character Strengths (2004)",
 "Low Aesthetic Appreciation (Pragmatism)":"The HEXACO Model of Personality",
 "High Trust":"Costa & McCrae – NEO-PI-R / NEO-PI-3 Facets (1985 / 2010 update)",
 "Machiavellianism":DARK,"Narcissism":DARK,"Psychopathy":DARK,"Sadism (Dark Tetrad addition)":DARK,
 "Curiosity (erg: exploration / epistemic)":ERG_SYS}
for e in ERGS: RELABEL[e]=ERG_SYS

def norm_name(s):
    s=s.lower(); s=re.sub(r'\s*\(.*?\)','',s); return re.sub(r'[^a-z0-9 ]','',s).strip()
def slug(s): return re.sub(r'[^a-z0-9]+','-',s.lower()).strip('-')

# ---------- vocabulary & embedding over the combined corpus ----------
C=json.load(open("atlas_cooked_v10.json"))
base_vocab=[a["word"].lower() for a in C["adjectives"]]
newwords=[]
for t in NEW:
    for w in t["adjectives"]:
        if w not in base_vocab and w not in newwords: newwords.append(w)
vocab=base_vocab+newwords
widx={w:i for i,w in enumerate(vocab)}
NE=len(C["traits"])                      # existing count
alladj=[[a.lower() for a in t["adjectives"]] for t in C["traits"]]+[t["adjectives"] for t in NEW]
N=len(alladj); V=len(vocab)
M=np.zeros((N,V))
for i,adjs in enumerate(alladj):
    for w in adjs:
        if w in widx: M[i,widx[w]]+=1
tot=M.sum(); rs=M.sum(1,keepdims=True); cs=M.sum(0,keepdims=True)
with np.errstate(divide='ignore',invalid='ignore'): pmi=np.log((M*tot)/(rs@cs))
ppmi=np.where(np.isfinite(pmi)&(pmi>0),pmi,0.0)
WV=TruncatedSVD(120,random_state=42).fit_transform(ppmi.T)
WV/=np.maximum(np.linalg.norm(WV,axis=1,keepdims=True),1e-12)
TV=np.zeros((N,120))
for i,adjs in enumerate(alladj):
    v=[WV[widx[w]] for w in adjs if w in widx]
    if v:
        m=np.mean(v,axis=0); n=np.linalg.norm(m)
        TV[i]=m/n if n>0 else m
np.save("TV_779.npy",TV)
S=TV@TV.T
print("embedding ok", TV.shape)

def place(D, chartname):
    traits=D["traits"]
    for t in traits:
        if t["name"] in RELABEL: t["system"]=RELABEL[t["name"]]
    isC = chartname=="cooked"
    keyq = "q" if isC else "com"
    # group key for existing
    grp=defaultdict(list)
    for i,t in enumerate(traits):
        g=t["q"] if isC else t.get("com", t.get("cluster"))
        grp[g].append(i)
    cent={g:(TV[v].mean(0)/max(np.linalg.norm(TV[v].mean(0)),1e-9)) for g,v in grp.items() if v}
    gk=[g for g in cent if not (isC and g in ("SEAM","HUB"))]
    Cm=np.array([cent[g] for g in gk])
    added=[]
    for n,rec in enumerate(NEW):
        gi=int(np.argmax(Cm@TV[NE+n])); g=gk[gi]
        members=grp[g]
        sims=np.array([S[NE+n,m] for m in members])
        top=np.argsort(-sims)[:6]
        w=np.maximum(sims[top],0)**2
        if w.sum()<=0: w=np.ones(len(top))
        xs=np.array([traits[members[j]]["x"] for j in top]); ys=np.array([traits[members[j]]["y"] for j in top])
        x=float((xs*w).sum()/w.sum())+float(rng.normal(0,18)); y=float((ys*w).sum()/w.sum())+float(rng.normal(0,18))
        added.append({"g":g,"x":x,"y":y,"fit":float(sims.max())})
    # de-overlap against everything
    pts=[[t["x"],t["y"]] for t in traits]+[[a["x"],a["y"]] for a in added]
    fixed=len(traits)
    for _ in range(220):
        moved=False
        for i in range(fixed,len(pts)):
            for j in range(len(pts)):
                if i==j: continue
                dx=pts[i][0]-pts[j][0]; dy=pts[i][1]-pts[j][1]
                d=(dx*dx+dy*dy)**0.5
                if d<16:
                    if d<1e-6: dx,dy,d=rng.normal(),rng.normal(),1.0
                    f=(16-d)/2/d
                    pts[i][0]+=dx*f; pts[i][1]+=dy*f; moved=True
        if not moved: break
    for n,a in enumerate(added):
        a["x"],a["y"]=pts[fixed+n][0],pts[fixed+n][1]
    return added

def build(masterfile, chartname, outfile):
    D=json.load(open(masterfile))
    added=place(D, chartname)
    traits=D["traits"]
    isC = chartname=="cooked"
    hulls=(D.get("harvest") or {}).get("hulls") or []
    # ---- append trait records
    for n,rec in enumerate(NEW):
        a=added[n]; tid=NE+n
        col = None; clus=""
        if isC:
            col=(D.get("hum") or {}).get(a["g"], "#777777")
        else:
            h=next((h for h in hulls if h.get("id")==a["g"] or h.get("com")==a["g"]), None)
            col=(h or {}).get("color","#777777"); clus=(h or {}).get("label","")
        t={"id":tid,"name":rec["name"],"system":rec["system"],"adjectives":rec["adjectives"],
           "x":round(a["x"],1),"y":round(a["y"],1),"r":6,"deg":len(rec["adjectives"]),
           "color":col,"hcol":"#999999","role":"family","_k":slug(rec["name"])}
        if isC: t["q"]=a["g"]; t["cluster"]=clus
        else:
            t["com"]=a["g"]; t["q"]=a["g"] if isinstance(a["g"],str) else "A"; t["cluster"]=clus
        for f in ("definition","motivation","permanence","behaviors","strengths","downsides","origins","phrases"):
            if rec.get(f): t[f]=rec[f]
        traits.append(t)
    # keep q consistent on harvested (cross-ref letter from cooked later)
    # ---- correlates for every trait (top 8)
    tc={}
    for i in range(len(traits)):
        o=np.argsort(-S[i]); rows=[]
        for j in o:
            if j==i: continue
            rows.append({"id":int(j),"name":traits[j]["name"],"q":traits[j].get("q","A"),
                         "r":round(float(S[i,j]),3),
                         "shared":sorted(set(a.lower() for a in traits[i]["adjectives"])&set(a.lower() for a in traits[j]["adjectives"]))[:6]})
            if len(rows)>=8: break
        tc[str(i)]=rows
    D["trait_corr"]=tc
    # ---- fit percentiles
    grp=defaultdict(list)
    for i,t in enumerate(traits): grp[t["q"] if isC else t.get("com")].append(i)
    cent={g:(TV[v].mean(0)/max(np.linalg.norm(TV[v].mean(0)),1e-9)) for g,v in grp.items() if v}
    key="allfit" if isC else "comfit"
    gks=list(cent); Cm2=np.array([cent[g] for g in gks])
    sims_all=TV@Cm2.T
    fits={}
    for i in range(len(traits)):
        row=sims_all[i]; lo,hi=row.min(),row.max()
        fits[str(i)]={str(gks[j]):int(round(100*(row[j]-lo)/max(hi-lo,1e-9))) for j in range(len(gks))}
    D[key]=fits
    # ---- adjective layer
    byw={a["word"].lower():a for a in D["adjectives"]}
    for n,rec in enumerate(NEW):
        for w in rec["adjectives"]:
            if w in byw:
                if NE+n not in byw[w]["traits"]: byw[w]["traits"].append(NE+n)
            else:
                byw[w]={"word":w,"traits":[NE+n],"deg":1,"x":0,"y":0,"cross":False}
                D["adjectives"].append(byw[w])
    for a in D["adjectives"]:
        mem=[traits[i] for i in a["traits"] if i<len(traits)]
        a["deg"]=len(mem)
        if mem:
            a["x"]=round(sum(m["x"] for m in mem)/len(mem),1); a["y"]=round(sum(m["y"] for m in mem)/len(mem),1)
        if isC:
            qs={m["q"] for m in mem if m.get("q") not in ("SEAM","HUB")}
            a["cross"]=len(qs)>1
        else:
            a["cross"]=len({m.get("com") for m in mem})>1
    D["word_index"]={a["word"].lower():sorted(a["traits"]) for a in D["adjectives"]}
    # ---- semantic word neighbours for the new words
    S_w=WV@WV.T
    for a in D["adjectives"]:
        w=a["word"].lower()
        if w in D["adj_corr"] and D["adj_corr"][w]: continue
        i=widx.get(w)
        if i is None: continue
        o=np.argsort(-S_w[i]); rows=[]
        for j in o:
            if j==i: continue
            r=float(S_w[i,j])
            if r<0.35 or len(rows)>=8: break
            rows.append({"w":vocab[j],"r":round(r,2)})
        D["adj_corr"][w]=rows
        D["adj_syn"].setdefault(w,[])
    # ---- confidence
    K=15
    P=np.array([[t["x"],t["y"]] for t in traits])
    conf=[]
    for i in range(len(traits)):
        emb=set(np.argsort(-S[i])[1:K+1])
        d=((P-P[i])**2).sum(1); lay=set(np.argsort(d)[1:K+1])
        conf.append(len(emb&lay)/K)
    conf=np.array(conf); lo,hi=conf.min(),conf.max()
    for i,t in enumerate(traits): t["conf"]=int(round(100*(conf[i]-lo)/max(hi-lo,1e-9)))
    # ---- theorists / indexes
    systems=sorted({t["system"] for t in traits})
    D["theorists"]=systems
    ti=defaultdict(list)
    for t in traits: ti[t["system"]].append(t["id"])
    D["theorist_index"]={k:v for k,v in ti.items()}
    fi=D.get("field_index") or []
    known=set()
    for f in fi:
        for sub in f.get("subs",[]): known.update(sub.get("systems",[]))
    orphan=[s for s in systems if s not in known]
    if orphan:
        fi.append({"field":"Additions & corrections","subs":[{"sub":"","systems":orphan}]})
    D["field_index"]=fi
    # ---- convergence tiers
    par=list(range(len(traits)))
    def find(a):
        while par[a]!=a: par[a]=par[par[a]]; a=par[a]
        return a
    ii,jj=np.where(np.triu(S,1)>=0.80)
    for a,b in zip(ii,jj):
        if traits[a]["system"]!=traits[b]["system"]:
            ra,rb=find(int(a)),find(int(b))
            if ra!=rb: par[ra]=rb
    comp=defaultdict(list)
    for i in range(len(traits)): comp[find(i)].append(i)
    cl=[]
    for v in comp.values():
        ss=sorted({traits[i]["system"] for i in v})
        if len(ss)>=2: cl.append((v,ss))
    cl.sort(key=lambda c:-len(c[1]))
    meta=[]
    for ci,(mem,ss) in enumerate(cl):
        cnt=defaultdict(int)
        for i in mem:
            for w in set(a.lower() for a in traits[i]["adjectives"]): cnt[w]+=1
        lab=", ".join(w for w,_ in sorted(cnt.items(),key=lambda kv:(-kv[1],kv[0]))[:3])
        meta.append({"id":ci,"tier":"core" if len(ss)>=4 else ("trip" if len(ss)==3 else "duo"),
                     "nsys":len(ss),"n":len(mem),"label":lab,"systems":ss[:12]})
        for i in mem: traits[i]["cv"]=meta[ci]["tier"]; traits[i]["cvc"]=ci
    for t in traits:
        t.setdefault("cv","out"); t.setdefault("cvc",-1)
        if t["cvc"]==-1: t["cv"]="out"
    D["conv_meta"]=meta
    # ---- twins: same name, different theorist
    g=defaultdict(list)
    for t in traits: g[norm_name(t["name"])].append(t)
    for t in traits: t.pop("twins",None)
    ntw=0
    for k,v in g.items():
        if len(v)<2: continue
        for t in v:
            t["twins"]=[{"id":o["id"],"name":o["name"],"system":o["system"]} for o in v if o["id"]!=t["id"]]
            ntw+=1
    json.dump(D,open(outfile,"w"),ensure_ascii=False)
    print(f"{outfile}: traits {len(traits)}, adjectives {len(D['adjectives'])}, systems {len(systems)}, twins {ntw}, clusters {len(meta)}")

build("atlas_cooked_v10.json","cooked","atlas_cooked_v11.json")
build("atlas_harvested6.json","harvested","atlas_harvested7.json")
