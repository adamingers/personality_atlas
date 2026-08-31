import re, sys

CSS = '''
/* --- compare + lasso extensions --- */
#panelL{width:300px;background:#fff;border-right:1px solid #ddd;overflow-y:auto;font-size:13px;display:none}
#panelL.on{display:block}
#plbody{padding:8px 12px}
.chead{display:flex;gap:6px;align-items:center;margin:6px 0}
.mini{border:1px solid #ccc;border-radius:6px;background:#fff;cursor:pointer;font-size:11px;padding:1px 7px}
.mini.on{background:#0a6ebd;color:#fff;border-color:#0a6ebd}
#cmpBtn.on,#lassoBtn.on{background:#0a6ebd;color:#fff}
#map.lassoing{cursor:crosshair}
.laspath{fill:rgba(10,157,142,.07);stroke:#0a9d8e;stroke-width:2;stroke-dasharray:6 4;vector-effect:non-scaling-stroke;pointer-events:none}
.cmpline{stroke:#8b5cf6;stroke-width:2;stroke-dasharray:2 3;vector-effect:non-scaling-stroke;pointer-events:none}
.cmplab{font-size:10px;fill:#6d28d9;paint-order:stroke;stroke:#fff;stroke-width:3px;pointer-events:none}
.oring{vector-effect:non-scaling-stroke;pointer-events:none}
.adj.cshare{background:#ede9fe;border-color:#8b5cf6}
.ccard{margin-bottom:10px}
.cmpstats{background:#f6f4ee;border:1px solid #e6e2d8;border-radius:8px;padding:6px 9px;margin:6px 0 10px;font-size:12.5px}
.regw{cursor:pointer;padding:2px 0;border-bottom:1px dotted #eee;font-size:12.5px}
.regw:hover{background:#f6f4ee}

.semline{stroke:#0a9d8e;stroke-width:1.6;stroke-dasharray:5 4;vector-effect:non-scaling-stroke;pointer-events:none}




.hchips{display:flex;flex-wrap:wrap;gap:4px;margin:4px 0}
.hchip{display:flex;align-items:center;gap:4px}
.hchip.on{background:#0a6ebd;color:#fff;border-color:#0a6ebd}
.klist{list-style:none;margin:4px 0 0;padding:0}
.klist li{display:flex;align-items:center;gap:7px;line-height:1.55;white-space:nowrap}
.kb{flex:0 0 14px;display:inline-block}
.kb.line{height:4px;border-radius:2px}
.kb.dash{height:0;border-top:2px dashed}
.kb.ring{width:12px;height:12px;border-radius:50%;border:2px solid}
.kb.ring.dashed{border-style:dashed}
.kb.fill{width:12px;height:12px;border-radius:50%}
#symkey,#convkey{margin-top:7px;border-top:1px solid #eee;padding-top:6px}
.sw{display:inline-block;width:16px;height:4px;border-radius:2px;vertical-align:middle;margin-right:3px}
.sw.dash{height:0;border-top:2px dashed;background:none}
.ringk{display:inline-block;width:11px;height:11px;border-radius:50%;border:2px solid;vertical-align:middle;margin-right:3px}
.backchip{display:block;margin:4px 0 8px}
.twinbox{background:#fffdf5;border:1px solid #efe6cc;border-radius:8px;padding:6px 9px;margin:8px 0}
.twinh{color:#8a6d1f;margin-top:0}
.twinrow{cursor:pointer}

body{display:flex;flex-direction:column;height:100vh;margin:0;overflow:hidden;box-sizing:border-box}
#bar{position:static!important;background:#fff!important;z-index:60;flex:0 0 auto;width:auto;order:-1;box-shadow:0 1px 3px rgba(0,0,0,.07)}
#wrap{flex:1 1 auto;height:auto!important;min-height:0}
#note{top:42px!important;max-height:calc(100vh - 96px);overflow-y:auto;overscroll-behavior:contain;z-index:120;max-width:760px!important;right:14px!important}
body.noteopen #wrap{overflow:hidden}
#zoomtip{margin-top:10px;padding:9px 12px;background:#fff6db;border:1px solid #e6d49a;border-radius:8px;font-size:17px;line-height:1.45}
#zoomtip b{font-size:18px}
 #panel{padding-top:34px!important}
#panelL{padding-top:34px!important}
@media (max-width:820px){#panel,#panelL{padding-top:6px!important}}
#viewC{display:none!important}
#lockBtn.on{background:#b8860b;color:#fff;border-color:#b8860b}
#map.locked{cursor:default}
.countline{background:#f2f6fa;border:1px solid #d8e4ee;border-radius:8px;padding:7px 11px;font-size:15px;margin:0 0 8px}
.secbadge{display:inline-block;background:#efe9dc;color:#6b5e42;border-radius:8px;font-size:10.5px;padding:0 6px}
.secrow{border-left:3px solid #c9bfa4;padding-left:7px}
#key,#note{pointer-events:auto;touch-action:auto}
#key *,#note *{pointer-events:auto}
#key{z-index:130}
@media (max-width:820px){
 #key{left:8px;right:8px;bottom:8px;max-height:56vh;overflow-y:auto;overscroll-behavior:contain;background:#fff;box-shadow:0 -2px 14px rgba(0,0,0,.14)}
 #key .close,#note .close{font-size:15px;padding:6px 12px;min-height:34px;display:inline-flex;align-items:center}
}
.convrow{display:flex;align-items:center;gap:6px;padding:3px 4px;border-bottom:1px dotted #eee;cursor:pointer;font-size:12.5px}
.convrow:hover{background:#f6f4ee}
.convrow.on{background:#f3ecf8;border-left:3px solid #7b3fa0;padding-left:5px}
#convlist{max-height:none}
.convh{color:#7b3fa0}
.convbox{background:#faf8fc;border:1px solid #ece4f2;border-radius:8px;padding:6px 9px;margin:8px 0}
.cvdot{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:5px;vertical-align:middle}
#convkey{margin-top:6px;border-top:1px solid #eee;padding-top:5px;line-height:1.7}
.tgtb.on{background:#0a6ebd;color:#fff;border-color:#0a6ebd}
@media (max-width:820px){
 #wrap{flex-direction:column;height:100dvh}
 #map{flex:1 1 52vh;min-height:46vh}
 #panel{width:auto;border-left:0;border-top:1px solid #ddd;flex:0 0 auto;max-height:44vh}
 #panelL{width:auto;border-right:0;border-bottom:1px solid #ddd;max-height:32vh;order:-1}
 #bar{flex-wrap:wrap;height:auto;padding:2px 4px;gap:2px}
 #bar button,#bar input{font-size:11px;padding:1px 5px}
 #note{max-width:none;right:8px;max-height:52vh;overflow-y:auto}
 #key{left:8px;right:8px;bottom:4px;font-size:11px}
 .adj{font-size:13px;padding:3px 9px}
 .row,.regw,.semrow,.corr-row{padding-top:4px;padding-bottom:4px}
}
.semh{color:#067a6e}
.semrow{display:flex;align-items:center;gap:5px}
.semdash{display:inline-block;width:14px;border-top:2px dashed #0a9d8e}
.synb{display:inline-block;background:#e0f2f0;color:#067a6e;border-radius:6px;font-size:10px;padding:0 5px}
.semlab{font-size:9px;fill:#067a6e;paint-order:stroke;stroke:#fff;stroke-width:3px;pointer-events:none}
.adj.nm{padding:0 5px;font-size:11px}
.cbadge{display:inline-block;background:#0a9d8e;color:#fff;border-radius:8px;font-size:10.5px;padding:0 6px;margin-left:3px}
'''

BTNS = '<button id="lockBtn" title="lock this profile — map clicks stop changing it, so you can trace lines freely">&#128275; lock</button><button id="convBtn" title="colour every trait by whether other systems converge on it">◈ convergence</button><button id="cmpBtn" title="anchor one trait on the left, cycle candidates on the right">⇆ compare</button><button id="lassoBtn" title="draw around an area to harvest its adjectives">◌ lasso</button>'
PANEL = '<div id="panelL"><div id="plbody"></div></div>'
ZOOMTIP = """<div id="zoomtip"><b>Text too small?</b> Use your browser\u2019s own zoom \u2014 <b>View \u203a Zoom In</b> (or Ctrl/\u2318 and +) \u2014 until everything is a size you can read comfortably. The whole atlas scales with it.</div>"""
HARVNOTE = """<p><b>The background shapes</b>: the soft grey clouds are <b>density blobs</b> &#8212; where traits in a community bunch most tightly, drawn from the layout itself, not from any theory. Spotlighting a community outlines it with a <b>hull</b>, the smallest boundary containing its members. Neither carries meaning beyond &#8220;these sit close together here.&#8221;</p>"""
SYMKEY = """<div id="symkey"><b>What the marks mean</b><ul class="klist">
<li><span class="kb line" style="background:#e08a2e"></span>spokes &#8212; a trait&#8217;s eight nearest traits</li>
<li><span class="kb line" style="background:#c9a227"></span>threads &#8212; traits sharing a tapped word</li>
<li><span class="kb dash" style="border-color:#0a9d8e"></span>teal dashes &#8212; nearest words by meaning</li>
<li><span class="kb dash" style="border-color:#8b5cf6"></span>violet dashes &#8212; the compare link</li>
<li><span class="kb ring" style="border-color:#0a6ebd"></span>compare anchor (left card)</li>
<li><span class="kb ring" style="border-color:#d97706"></span>compare candidate (right card)</li>
<li><span class="kb ring" style="border-color:#0a9d8e"></span>lassoed region</li>
<li><span class="kb ring dashed" style="border-color:#c0392b"></span>low-confidence placement</li>
<li><span class="kb fill" style="background:#ede9fe;border:1px solid #8b5cf6"></span>shared adjective pill</li>
</ul></div>"""
KEYADD = """<div id="convkey" style="display:none"><b>Convergence view</b><ul class="klist">
<li><span class="kb fill" style="background:#7b3fa0"></span>convergent core &#8212; four or more systems agree</li>
<li><span class="kb fill" style="background:#2a8fbd"></span>triple &#8212; three systems</li>
<li><span class="kb fill" style="background:#e0952a"></span>pair &#8212; two systems</li>
<li><span class="kb fill" style="background:#b0aca4"></span>outlier &#8212; no cross-system match</li>
</ul></div>"""
COOKNOTE = """<p><b>Reading a square&#8217;s axes</b>: the italic edge labels are that family&#8217;s two designed dimensions &#8212; in B, for instance, further right = more dominant, further down = more image-hungry.</p>"""
NOTEADD = """<p id="atlascount" class="countline"></p><p><b>Jumping around</b>: the correlated-trait rows inside any profile take you straight to that trait, and tapping a theorist name (&#9656;) lights every trait they described.</p><p><b>Adjective pills</b>: in any profile, <b>blue</b> pills are words whose traits all sit inside one family/community; <b>orange</b> pills are bridge words used by traits in two or more regions — the connective tissue of the map. Tap any pill to light its full reach.</p><p><b>Meaning links</b>: tapping a word also shows its <b>nearest words by meaning</b> — dashed teal links on the map and a matching &#8220;Nearest in meaning&#8221; list in the panel (each row = one teal link, with its similarity, or <i>syn</i> for a dictionary synonym) — computed from semantic distance in the underlying embedding, plus dictionary synonyms in &#8220;Synonyms (in chart)&#8221;. This connects near-identical words (empathic &#8776; empathetic) even when no single trait uses both.</p><p><b>&#128274; Lock</b>: freezes the profile you are reading so clicks on the map stop changing it &#8212; useful when you want to trace a thread or a spoke across the chart without losing your place. Everything inside the panel still works, and zoom and pan are unaffected. <b>Leave it unlocked unless you specifically want that</b>, since while it is on the map will not respond to clicks at all.</p><p><b>Same name, different theorist</b>: many words are used by more than one system &#8212; Klages and Reiss both describe an &#8220;Independence,&#8221; Cattell and Tomkins both an &#8220;Anger.&#8221; Each keeps its own profile and its own position, so twins that mean the same thing sit almost on top of each other while twins that don&#8217;t sit far apart. Any profile with a namesake lists it under <i>Same name, other theorists</i>.</p><p><b>&#9672; Convergence</b>: recolours every trait by how many <i>independent systems</i> describe it the same way &#8212; <span style="color:#7b3fa0">purple</span> = convergent core (four or more systems agree), <span style="color:#2a8fbd">blue</span> = triple, <span style="color:#e0952a">amber</span> = pair, <span style="color:#8a857c">grey</span> = outlier (no other system matches it closely). Every profile now names its cluster, the systems in it, and can light the whole cluster up.</p><p><b>&#8646; Compare</b>: click a trait &#8212; or lasso a whole area with the &#9676; tool &#8212; to set an anchor (blue); each later click or lasso fills whichever side is marked &#9673; &#8212; use the <i>replace this side</i> buttons to aim at the left or right card. Traits and regions mix freely: trait vs trait, region vs region, or trait vs region. Shared adjectives highlight in violet, and <b>near matches</b> lists semantically equivalent word pairs the two traits don&#8217;t literally share. <b>&#9676; Lasso</b>: draw around any area to harvest its cumulative adjective list, sorted by how <b>distinctive</b> each word is for that region versus the whole atlas (or toggle to plain frequency); while the tool is on, tap traits to add or remove them.</p>"""

JS = open("features.js").read().replace("</", "<\\/")

def inject(fin, fout):
    h = open(fin, encoding="utf-8").read()
    assert '#panelL' not in h, "already injected"
    h = h.replace('</style>', CSS + '</style>', 1)
    h = h.replace('<div id="wrap">', '<div id="wrap">' + PANEL, 1)
    h = h.replace('<span id="ctrl">', '<span id="ctrl">' + BTNS, 1)
    assert h.count('</p></div><div id="key">')==1
    h = h.replace('</div><div id="key">', '</div><div id="key">', 1)
    extra = NOTEADD + (HARVNOTE if 'harvested' in fout else COOKNOTE) + ZOOMTIP
    h = h.replace('</p></div><div id="key">', '</p>' + extra + '</div><div id="key">', 1)


    # --- lift the toolbar out of the map and make it the page's first row ---
    import re as _r3
    bi = h.index('<div id="bar">')
    depth=0; bj=bi
    while True:
        mm=_r3.compile(r'<div\b|</div>').search(h,bj)
        tag=mm.group(0); bj=mm.end()
        depth += 1 if tag=='<div' else -1
        if depth==0: break
    barblock = h[bi:bj]
    h = h[:bi] + h[bj:]
    h = h.replace('<body><div id="wrap">', '<body>' + barblock + '<div id="wrap">', 1)
    # --- tap reliability: drift tolerance + minimum screen-space hit radius ---
    a = "if(dxy&&Math.hypot(e.clientX-dxy[0],e.clientY-dxy[1])>5)moved=true;"
    b = "if(dxy&&Math.hypot(e.clientX-dxy[0],e.clientY-dxy[1])>9)moved=true;"
    assert h.count(a) == 1, "move-threshold anchor"
    h = h.replace(a, b, 1)
    a = "if(single&&!moved&&p0)hit(p0.x,p0.y);"
    b = "if(single&&p0&&(!moved||(pan&&Math.hypot(p0.x-pan.x,p0.y-pan.y)<10)))hit(p0.x,p0.y);"
    assert h.count(a) == 1, "endp anchor"
    h = h.replace(a, b, 1)
    a = "for(const t of DATA.traits){const dx=t.x-wx,dy=t.y-wy,dd=dx*dx+dy*dy,rr=((t.r||6)+4)**2;"
    b = "const _hs=vb.w/map.clientWidth;for(const t of DATA.traits){const dx=t.x-wx,dy=t.y-wy,dd=dx*dx+dy*dy,rr=Math.max(((t.r||6)+6)**2,(13*_hs)**2);"
    assert h.count(a) == 1, "hit-radius anchor"
    h = h.replace(a, b, 1)

    # --- strip Guide-tab prose that duplicates "How this atlas works" ---
    import re as _r2
    mm = _r2.search(r"(function renderInfo\(\)\{)pbody\.innerHTML='<h2>.*?(\+?'<h4>(?:Fit filter|Community fit)</h4>)", h, _r2.S)
    assert mm, "guide prose anchor"
    h = h[:mm.start()] + mm.group(1) + "pbody.innerHTML=" + mm.group(2).lstrip('+') + h[mm.end():]

    # --- relabel the note button ---
    a = '<button id="noteBtn">?</button>'
    assert h.count(a) == 1, "noteBtn anchor"
    h = h.replace(a, '<button id="noteBtn">how this atlas works</button>', 1)

    # --- rebuild the Key box ---
    mk = _r2.search(r'<div id="key">.*?</div>\s*\n<div id="err">', h, _r2.S)
    assert mk, "key anchor"
    fam = ('<ul class="klist">'
      + ''.join('<li><span class="kb fill" style="background:%s"></span>%s</li>' % (c, n) for c, n in [
        ('#D9A521','A Sanguine'),('#CC3333','B Choleric'),('#4F9E7F','C Phlegmatic'),
        ('#3E6DB5','D Melancholic'),('#7A7A88','E Competence'),('#8E5FBF','F Mystical'),
        ('#2b2b2b','black = transition band or hub')])
      + '</ul>') if 'harvested' not in fout else (
      '<ul class="klist"><li><span class="kb fill" style="background:linear-gradient(90deg,#76B7B2,#E15759)"></span>'
      'node colour = derived community (16)</li>'
      '<li><span class="kb fill" style="background:#cfd8d6"></span>faint cloud = where that community concentrates</li>'
      '<li><span class="kb line" style="background:#9a3b2e"></span>rust lines = valleys (emptiest corridors)</li></ul>')
    h = h[:mk.start()] + '<div id="key"><span class="close" id="keyClose">hide \u25bc</span><b>Key</b>' + fam \
        + KEYADD + SYMKEY + '</div>\n<div id="err">' + h[mk.end():]
    # append JS at end of the app script (before final </script>)
    k = h.rfind('</script>')
    h = h[:k] + '\n' + JS + '\n' + h[k:]
    open(fout, 'w', encoding='utf-8').write(h)
    print(fout, len(h))

inject("out_cooked.html", "v2_cooked.html")
inject("out_harvested.html", "v2_harvested.html")
