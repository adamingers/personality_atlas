import json, numpy as np
from collections import defaultdict
from scipy.ndimage import gaussian_filter
from skimage.segmentation import watershed, find_boundaries
from sklearn.cluster import KMeans

H = json.load(open('atlas_harvested9.json'))
traits = H['traits']
X = np.array([[t['x'], t['y']] for t in traits])
coms = np.array([t['com'] for t in traits])
NC = len(H['harvest']['hulls'])

G = 340
xmin, ymin = X.min(0) - 120
xmax, ymax = X.max(0) + 120
gx = np.linspace(xmin, xmax, G)
gy = np.linspace(ymin, ymax, G)
Hst, _, _ = np.histogram2d(X[:, 1], X[:, 0], bins=[gy, gx])
dens = gaussian_filter(Hst, 7)


def wx(i): return round(xmin + i / (G - 1) * (xmax - xmin), 0)
def wy(j): return round(ymin + j / (G - 1) * (ymax - ymin), 0)


def path_from(bound):
    ys, xs = np.where(bound)
    pts = set(zip(xs.tolist(), ys.tolist()))
    segs = []
    for (px, py) in pts:
        for dx, dy in ((1, 0), (0, 1), (1, 1), (1, -1)):
            if (px + dx, py + dy) in pts:
                segs.append(((px, py), (px + dx, py + dy)))
    return ' '.join(f'M{wx(a[0])} {wy(a[1])}L{wx(b[0])} {wy(b[1])}' for a, b in segs), len(segs)


def seeds_from(labels_pts):
    m = np.zeros_like(dens, dtype=int)
    for k, P in enumerate(labels_pts):
        ix = int(np.clip((P[0] - xmin) / (xmax - xmin) * (G - 1), 0, G - 2))
        iy = int(np.clip((P[1] - ymin) / (ymax - ymin) * (G - 1), 0, G - 2))
        m[iy, ix] = k + 1
    return m


# --- TRUNK: existing community boundaries (unchanged) ---
trunk_seeds = [X[coms == c].mean(0) for c in range(NC)]
lab0 = watershed(-dens, seeds_from(trunk_seeds))
b0 = find_boundaries(lab0, mode='thin') & (dens > dens.max() * 0.015)
trunk, n0 = path_from(b0)

# --- BRANCH tiers: split each community into sub-groups and take the new boundaries ---
def branch_tier(splits_per_com, exclude):
    seeds = []
    for c in range(NC):
        P = X[coms == c]
        k = max(1, min(splits_per_com, len(P) // 6))
        if k < 2:
            seeds.append(P.mean(0))
            continue
        km = KMeans(k, n_init=4, random_state=42).fit(P)
        for j in range(k):
            Q = P[km.labels_ == j]
            if len(Q):
                seeds.append(Q.mean(0))
    lab = watershed(-dens, seeds_from(seeds))
    b = find_boundaries(lab, mode='thin') & (dens > dens.max() * 0.015)
    b = b & ~exclude                      # only the boundaries the trunk doesn't already draw
    return b, path_from(b)


grow0 = b0.copy()
for _ in range(2):                        # dilate the trunk so branches don't hug it
    grow0 = grow0 | np.roll(grow0, 1, 0) | np.roll(grow0, -1, 0) | np.roll(grow0, 1, 1) | np.roll(grow0, -1, 1)

b1, (branch1, n1) = branch_tier(2, grow0)

grow1 = grow0 | b1
for _ in range(1):
    grow1 = grow1 | np.roll(grow1, 1, 0) | np.roll(grow1, -1, 0) | np.roll(grow1, 1, 1) | np.roll(grow1, -1, 1)

b2, (branch2, n2) = branch_tier(4, grow1)

H['harvest']['valleys'] = trunk
H['harvest']['valleys_b1'] = branch1
H['harvest']['valleys_b2'] = branch2
json.dump(H, open('atlas_harvested9.json', 'w'), ensure_ascii=False)
print(f'trunk {n0} segs | branch tier 1 {n1} segs | branch tier 2 {n2} segs')
