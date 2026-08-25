import json, numpy as np
from collections import defaultdict
from scipy.ndimage import gaussian_filter
from skimage.segmentation import watershed, find_boundaries
from sklearn.cluster import KMeans
from scipy.spatial import ConvexHull

H = json.load(open('atlas_harvested7.json'))
traits = H['traits']; n = len(traits)
X = np.array([[t['x'], t['y']] for t in traits])
coms = np.array([t['com'] for t in traits])
NC = len(H['harvest']['hulls'])
print("traits:", n, "communities:", NC)

# ---- hull pts/centroids (convex hull, x1.13 expansion) ----
for c in range(NC):
    P = X[coms == c]
    h = H['harvest']['hulls'][c]
    cx, cy = P.mean(0)
    hull = ConvexHull(P)
    pts = P[hull.vertices]
    pts = (pts - [cx, cy]) * 1.13 + [cx, cy]
    h['pts'] = [[round(float(a), 1), round(float(b), 1)] for a, b in pts]
    h['cx'], h['cy'] = round(float(cx), 1), round(float(cy), 1)
    h['n'] = int((coms == c).sum())
print("hulls updated; sizes:", [h['n'] for h in H['harvest']['hulls']])

# ---- density blobs ----
blobs = []
for c in range(NC):
    P = X[coms == c]
    k = max(1, min(3, len(P) // 8))
    km = KMeans(k, n_init=4, random_state=42).fit(P)
    for j in range(k):
        Q = P[km.labels_ == j]
        if len(Q) < 2: continue
        r = float(np.linalg.norm(Q - Q.mean(0), axis=1).mean() * 1.7 + 40)
        blobs.append({'x': round(float(Q[:, 0].mean()), 1), 'y': round(float(Q[:, 1].mean()), 1),
                      'r': round(r, 0), 'c': H['harvest']['hulls'][c]['color']})
H['harvest']['blobs'] = blobs
print('density blobs:', len(blobs))

# ---- recompute word coords = mean of member trait positions ----
tb = {t['id']: (t['x'], t['y']) for t in traits}
for a in H['adjectives']:
    pts = [tb[i] for i in a['traits'] if i in tb]
    if pts:
        a['x'] = round(float(np.mean([p[0] for p in pts])), 1)
        a['y'] = round(float(np.mean([p[1] for p in pts])), 1)

# ---- axis tick words ----
pos = defaultdict(list)
for t in traits:
    for w in t['adjectives']: pos[w.lower()].append((t['x'], t['y']))
W = [(w, np.mean([p[0] for p in v]), np.mean([p[1] for p in v]), len(v)) for w, v in pos.items() if len(v) >= 6]
def ticks(axis_idx):
    lo = X[:, axis_idx].min(); hi = X[:, axis_idx].max()
    out = []; used = set()
    for frac in (0.25, 0.5, 0.75):
        m = lo + (hi - lo) * frac
        cand = sorted(W, key=lambda r: abs(r[1 + axis_idx] - m))
        pick = [w for w, *_ in cand if w not in used][:2]
        used.update(pick)
        out.append({'p': round(float(m), 0), 'w': ' · '.join(pick)})
    return out
H['harvest']['ticks'] = {'x': ticks(0), 'y': ticks(1)}
print('ticks:', H['harvest']['ticks'])

# ---- valleys ----
G = 340
xmin, ymin = X.min(0) - 120; xmax, ymax = X.max(0) + 120
gx = np.linspace(xmin, xmax, G); gy = np.linspace(ymin, ymax, G)
Hst, _, _ = np.histogram2d(X[:, 1], X[:, 0], bins=[gy, gx])
dens = gaussian_filter(Hst, 7)
markers = np.zeros_like(dens, dtype=int)
for c in range(NC):
    P = X[coms == c].mean(0)
    ix = int(np.clip((P[0] - xmin) / (xmax - xmin) * (G - 1), 0, G - 2))
    iy = int(np.clip((P[1] - ymin) / (ymax - ymin) * (G - 1), 0, G - 2))
    markers[iy, ix] = c + 1
lab = watershed(-dens, markers)
bound = find_boundaries(lab, mode='thin') & (dens > dens.max() * 0.015)
ys, xs = np.where(bound)
pts2 = set(zip(xs.tolist(), ys.tolist()))
segs = []
for (px, py) in pts2:
    for dx, dy in ((1, 0), (0, 1), (1, 1), (1, -1)):
        if (px + dx, py + dy) in pts2:
            segs.append(((px, py), (px + dx, py + dy)))
def wx(i): return round(xmin + i / (G - 1) * (xmax - xmin), 0)
def wy(j): return round(ymin + j / (G - 1) * (ymax - ymin), 0)
d = ' '.join(f'M{wx(a[0])} {wy(a[1])}L{wx(b[0])} {wy(b[1])}' for a, b in segs)
H['harvest']['valleys'] = d
print('valley segments:', len(segs))

json.dump(H, open('atlas_harvested7.json', 'w'), ensure_ascii=False, separators=(',', ':'))
print('rewrote atlas_harvested7.json')
