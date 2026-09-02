
/* ===== Atlas extensions: Compare (traits OR regions) + Lasso region harvest + semantic links ===== */
(function(){
'use strict';
const $=i=>document.getElementById(i);
const gX=el('g',{});
const CA='#0a6ebd', CB='#d97706', CS='#0a9d8e';
let cmpOn=false, cmpA=null, cmpB=null, tgt='R', lastT=null, hist=[];          // entities: {k:'t',...} or {k:'r',...}
let lasOn=false, lasPts=null, lasPath=null, SEL=[], SELNAME=null, sortMode='dist';
const ATOT={};DATA.traits.forEach(t=>new Set(t.adjectives).forEach(w=>ATOT[w]=(ATOT[w]||0)+1));
const TN=DATA.traits.length;

function oClear(){while(gX.firstChild)gX.removeChild(gX.firstChild);}
const clearL0=clearL;
clearL=function(){oClear();lasPath=null;clearL0();};
function ring(t,color,wd){return el('circle',{cx:t.x,cy:t.y,r:(t.r||6)+5,fill:'none',stroke:color,'stroke-width':wd||3,class:'oring'},gX);}
function undim(id){if(tEl[id]){tEl[id].forEach(e=>e.classList.remove('dim'));}}
function F(s){return (typeof fmt==='function')?fmt(s):String(s).split('<').join('&lt;');}
function pathD(pts,close){return 'M'+pts.map(p=>p[0].toFixed(1)+' '+p[1].toFixed(1)).join('L')+(close?'Z':'');}

/* ---------------- NOTE: overlay above the panel, own scroll ---------------- */
(function(){
 const note=document.getElementById('note'), nb=document.getElementById('noteBtn'), nc=document.getElementById('noteClose');
 const sync=()=>document.body.classList.toggle('noteopen', getComputedStyle(note).display!=='none');
 [nb,nc].forEach(b=>{ if(b)b.addEventListener('click',()=>setTimeout(sync,0)); });
 note.addEventListener('wheel',e=>{e.stopPropagation();},{passive:false,capture:true});
 note.addEventListener('pointerdown',e=>e.stopPropagation(),true);
 note.addEventListener('pointermove',e=>e.stopPropagation(),true);
 note.addEventListener('touchmove',e=>e.stopPropagation(),{passive:true,capture:true});
 sync();
})();

/* ---------------- OVERLAY GUARD: taps on key/note must not reach the map ---------------- */
(function(){
 ['key','note'].forEach(id=>{
  const el2=document.getElementById(id); if(!el2)return;
  // guard only the map-driving events; never 'click', or the panel's own buttons break
  ['pointerdown','pointerup','pointermove','wheel','touchstart','touchmove'].forEach(ev=>{
   el2.addEventListener(ev,e=>{e.stopPropagation();},{capture:true,passive:ev.indexOf('touch')===0});
  });
 });
 // hide buttons must actually toggle, and report state for tests
 const pairs=[['keyBtn','key','keyClose'],['noteBtn','note','noteClose']];
 pairs.forEach(([b,box,close])=>{
  const B=document.getElementById(b),X=document.getElementById(box),C=document.getElementById(close);
  if(!B||!X)return;
  if(C)C.addEventListener('click',()=>{X.style.display='none';});
  // the base chart already toggles these; only step in if its handler left it hidden
  B.addEventListener('click',()=>{
   const was=getComputedStyle(X).display==='none';
   setTimeout(()=>{
    const now=getComputedStyle(X).display==='none';
    if(was&&now)X.style.display='';        // base handler didn't reopen it
   },0);
  });
 });
})();

/* ---------------- #5 SHORT LABELS + LEADER LINES ---------------- */
const SHORT=DATA.short_labels||{};
function relabel(){
 // the base chart rewrites label text whenever the zoom band changes; re-assert ours
 DATA.traits.forEach(t=>{
  const e=tEl[t.id]; if(!e||!e[1])return;
  const lb=e[1];
  const txt = SHORT[t.id]||t.name;                 // short at every zoom; profiles keep the full name
  const out = txt.length>26 ? txt.slice(0,25)+'\u2026' : txt;
  if(lb.textContent!==out)lb.textContent=out;
  // leader from the label to its own node, on whichever side the label sits
  const y=parseFloat(lb.getAttribute('y')), r=(t.r||6);
  let ld=e[2];
  if(!ld){ld=el('line',{class:'leader'});lb.parentNode.insertBefore(ld,lb);e[2]=ld;}
  const below=y>t.y;
  ld.setAttribute('x1',t.x); ld.setAttribute('x2',t.x);
  ld.setAttribute('y1', below ? t.y+r+0.5 : t.y-r-0.5);
  ld.setAttribute('y2', below ? y-4.5 : y+2.5);
 });
}
relabel();

/* ---------------- #5b COLOUR BY FIELD (hue = field, lightness = era) ---------------- */
const FLD=DATA.field_colors||{};
const YRS=DATA.traits.map(t=>t.yr).filter(y=>typeof y==='number');
const Y0=Math.min.apply(null,YRS), Y1=Math.max.apply(null,YRS);
function shade(hex,t){                                   // t 0=oldest(pale) .. 1=newest(deep)
 const n=parseInt(hex.slice(1),16), r=n>>16, g=(n>>8)&255, b=n&255;
 const k=0.62-0.60*t;                                    // mix toward white
 const m=(c)=>Math.round(c+(255-c)*k);
 return 'rgb('+m(r)+','+m(g)+','+m(b)+')';
}
function eraT(y){
 // rank-based so the ancient tail doesn't crush the modern range
 const idx=ERAS.indexOf(y);
 return ERAS.length>1?idx/(ERAS.length-1):0.5;
}
const ERAS=Array.from(new Set(DATA.traits.map(t=>t.yr))).sort((a,b)=>a-b);
let fieldOn=false;
function fieldColor(t){ const base=FLD[t.fld]||'#8a8578'; return shade(base,eraT(t.yr)); }
function setField(on){
 fieldOn=on; const b=$('fieldBtn'); if(b)b.classList.toggle('on',on);
 const k=$('fieldkey'); if(k)k.style.display=on?'':'none';
 if(typeof paintNodes==='function')paintNodes();
}
(function(){
 const k=$('fieldkey');
 if(k){k.innerHTML='<b>By field &amp; era</b><ul class="klist">'
  +Object.keys(FLD).map(f=>'<li><span class="kb fill" style="background:'+shade(FLD[f],0.15)+'"></span>'
    +'<span class="kb fill" style="background:'+shade(FLD[f],1)+';margin-left:-4px"></span>'+f+'</li>').join('')
  +'</ul><span class="d">pale = earlier work \u00b7 deep = later work</span>';}
 const b=$('fieldBtn'); if(b)b.addEventListener('click',()=>setField(!fieldOn));
})();
window._field={set:setField,on:()=>fieldOn,color:t=>fieldColor(t)};

/* ---------------- COLOUR MODE (mutually exclusive) + matching key ---------------- */
function baseKeyHTML(){
 const hum=DATA.hum||{};
 const NAMES={A:'A Sanguine',B:'B Choleric',C:'C Phlegmatic',D:'D Melancholic',E:'E Competence',F:'F Mystical'};
 const cnt={};DATA.traits.forEach(t=>{cnt[t.q]=(cnt[t.q]||0)+1;});
 return '<b>Temperament \u2014 families</b><ul class="klist">'
  +Object.keys(NAMES).map(q=>'<li><span class="kb fill" style="background:'+(hum[q]||'#888')+'"></span>'
    +NAMES[q]+' <span class="d">'+(cnt[q]||0)+'</span></li>').join('')
  +(cnt.SEAM?'<li><span class="kb fill" style="background:#2b2b2b"></span>transition band <span class="d">'+cnt.SEAM+'</span></li>':'')
  +(cnt.HUB?'<li><span class="kb fill" style="background:#111111"></span>hub <span class="d">'+cnt.HUB+'</span></li>':'')
  +'</ul><span class="d">the same six families on both charts</span>';
}
let colourMode='humor';
const HUM=DATA.hum||{A:'#D9A521',B:'#CC3333',C:'#4F9E7F',D:'#3E6DB5',E:'#7A7A88',F:'#8E5FBF'};
function humColor(t){
 const q=t.q;
 if(q==='SEAM')return '#2b2b2b';
 if(q==='HUB')return '#111111';
 return HUM[q]||'#8a8578';
}
const COMS=DATA.communities||[];
function comColor(t){const c=COMS[t.com]; return c?c.color:'#8a8578';}
function paintNodes(){
 if(typeof viewMode!=='undefined'&&viewMode==='viewH'){
  DATA.traits.forEach(t=>{const c=tEl[t.id][0]; if(c)c.setAttribute('fill',t.hcol);});
  return;
 }
 DATA.traits.forEach(t=>{
  const c=tEl[t.id][0]; if(!c)return;
  let f;
  if(colourMode==='conv')f=CVC[t.cv||'out'];
  else if(colourMode==='field')f=fieldColor(t);
  else if(colourMode==='com')f=comColor(t);
  else f=humColor(t);
  c.setAttribute('fill',f);
 });
}
function comKeyHTML(){
 const cnt={};DATA.traits.forEach(t=>{cnt[t.com]=(cnt[t.com]||0)+1;});
 return '<b>Communities</b><ul class="klist">'
  +COMS.map((c,i)=>'<li><span class="kb fill" style="background:'+c.color+'"></span>'
    +F(c.label)+' <span class="d">'+(cnt[i]||0)+'</span></li>').join('')
  +'</ul><span class="d">groups the layout found on its own \u2014 same on both charts</span>';
}
function hormKeyHTML(){
 const HC=DATA.horm_colors||{}, N=DATA.horm_counts||{};
 return '<b>Hormone signature</b><ul class="klist">'
  +Object.keys(HC).map(h=>'<li><span class="kb fill" style="background:'+HC[h]+'"></span>'
    +h+' <span class="d">'+(N[h]||0)+'</span></li>').join('')
  +'</ul><span class="d">each family\u2019s dominant neurochemistry</span>';
}
function setMode(m){
 colourMode=m;
 document.querySelectorAll('.modebtn').forEach(b=>b.classList.toggle('on',b.dataset.m===m));
 if(typeof convOn!=='undefined')convOn=(m==='conv');
 fieldOn=(m==='field');
 const cb=$('convBtn'); if(cb)cb.classList.toggle('on',m==='conv');
 const fb=$('fieldBtn'); if(fb)fb.classList.toggle('on',m==='field');
 paintNodes();
 const bk=$('basekey'), ck=$('convkey'), fk=$('fieldkey'), sk=$('symkey'), mk=$('comkey'), hk=$('hormkey');
 const inH=(typeof viewMode!=='undefined'&&viewMode==='viewH');
 if(bk)bk.style.display=(m==='humor'&&!inH)?'':'none';
 if(mk)mk.style.display=(m==='com'&&!inH)?'':'none';
 if(ck)ck.style.display=(m==='conv'&&!inH)?'':'none';
 if(fk)fk.style.display=(m==='field'&&!inH)?'':'none';
 if(hk)hk.style.display=inH?'':'none';
 if(sk)sk.style.display='';
}
function initModes(){
 const key=$('key');
 if(key&&!$('comkey')){
  const mk=document.createElement('div'); mk.id='comkey'; mk.style.display='none'; mk.innerHTML=comKeyHTML();
  const hk=document.createElement('div'); hk.id='hormkey'; hk.style.display='none'; hk.innerHTML=hormKeyHTML();
  key.insertBefore(hk,key.firstChild); key.insertBefore(mk,key.firstChild);
 }
 if(key&&!$('basekey')){
  const bk=document.createElement('div'); bk.id='basekey'; bk.innerHTML=baseKeyHTML();
  const first=key.querySelector(':scope > .klist');
  if(first){
   // drop the chart's original static legend (its <b> heading and list) — basekey supersedes it
   let p=first.previousElementSibling;
   while(p&&p.tagName==='B'){const q=p.previousElementSibling;p.remove();p=q;}
   key.replaceChild(bk,first);
  } else key.insertBefore(bk,key.querySelector('#convkey')||null);
 }
 document.querySelectorAll('.modebtn').forEach(b=>{
  if(b._wired)return; b._wired=1; b.addEventListener('click',()=>setMode(b.dataset.m));});
 setMode('humor');
}
window._mode={set:setMode,get:()=>colourMode};
(function(){const a=applyVB; applyVB=function(){a(); if(typeof relabel==='function')relabel();};})();
window._labels=()=>({sample:DATA.traits.slice(0,6).map(t=>tEl[t.id][1].textContent)});
window._names=(id)=>({full:tby[id].name,short:(DATA.short_labels||{})[id]||null});

/* ---------------- RELATEDNESS: rank a set of traits by cohesion ---------------- */
function corrOf(a,b){
 const r=(DATA.trait_corr[a]||[]).find(c=>c.id===b);
 if(r)return r.r;
 const q=(DATA.trait_corr[b]||[]).find(c=>c.id===a);
 return q?q.r:null;
}
function jac(a,b){
 const A=new Set(tby[a].adjectives.map(x=>x.toLowerCase()));
 const B=tby[b].adjectives.map(x=>x.toLowerCase());
 let i=0; B.forEach(w=>{if(A.has(w))i++;});
 return i/Math.max(A.size+B.length-i,1);
}
function relate(ids){
 // mean similarity of each trait to the rest of the set
 const out=ids.map(id=>{
  let s=0,n=0;
  ids.forEach(o=>{ if(o===id)return;
   const r=corrOf(id,o); s+=(r!=null?r:jac(id,o)); n++; });
  return {id:id,score:n?s/n:0};
 });
 const vals=out.map(o=>o.score).sort((a,b)=>a-b);
 const med=vals.length?vals[Math.floor(vals.length/2)]:0;
 out.forEach(o=>{ o.band = o.score>=med*1.25?'core' : (o.score>=med*0.6?'near':'outlier'); });
 out.sort((a,b)=>b.score-a.score);
 return out;
}
function bandChip(b){
 const L={core:'core',near:'adjacent',outlier:'outlier'};
 return '<span class="rband r-'+b+'">'+L[b]+'</span>';
}

/* ---------------- GRID: shared A1-style reference across both charts ---------------- */
const GRID=(function(){
 const CELL=250;                                  // world units per cell — same on both charts
 const PFX=(DATA.harvest?'H':'C');
 return {cell:CELL,pfx:PFX,
  col:x=>Math.floor((x-BB.x)/CELL),
  row:y=>Math.floor((y-BB.y)/CELL),
  name:function(x,y){
   const c=this.col(x), r=this.row(y);
   let s='',n=c;
   do{ s=String.fromCharCode(65+(n%26))+s; n=Math.floor(n/26)-1; }while(n>=0);
   return this.pfx+'-'+s+(r+1);
  }};
})();
let gridOn=false;
const gGrid=el('g',{class:'gridlayer'});
function drawGrid(){
 while(gGrid.firstChild)gGrid.removeChild(gGrid.firstChild);
 if(!gridOn)return;
 const C=GRID.cell;
 const c0=GRID.col(BB.x), c1=GRID.col(BB.x+BB.w), r0=GRID.row(BB.y), r1=GRID.row(BB.y+BB.h);
 for(let c=c0;c<=c1+1;c++){const x=BB.x+c*C;
  el('line',{x1:x,y1:BB.y,x2:x,y2:BB.y+BB.h,class:'gridline'},gGrid);}
 for(let r=r0;r<=r1+1;r++){const y=BB.y+r*C;
  el('line',{x1:BB.x,y1:y,x2:BB.x+BB.w,y2:y,class:'gridline'},gGrid);}
 // cell labels, one per cell, scaled so they stay legible at any zoom
 const fs=Math.max(11*(vb.w/map.clientWidth||1),C*0.055);
 for(let c=c0;c<=c1;c++)for(let r=r0;r<=r1;r++){
  const x=BB.x+c*C, y=BB.y+r*C;
  if(x+C<BB.x||x>BB.x+BB.w||y+C<BB.y||y>BB.y+BB.h)continue;
  const t=el('text',{x:x+C*0.5,y:y+C*0.5,'text-anchor':'middle','dominant-baseline':'middle',
    class:'gridlab','font-size':fs},gGrid);
  t.textContent=GRID.name(x+1,y+1);
 }
}
function setGrid(on){
 gridOn=on; const b=$('gridBtn'); if(b)b.classList.toggle('on',on);
 const hud=$('gridhud'); if(hud)hud.style.display=on?'':'none';
 drawGrid(); updHud();
}
function updHud(){
 const hud=$('gridhud'); if(!hud||!gridOn)return;
 const cx=vb.x+vb.w/2, cy=vb.y+(vb.h||vb.w)/2;
 const tl=GRID.name(vb.x+1,vb.y+1), br=GRID.name(vb.x+vb.w-1,vb.y+(vb.h||vb.w)-1);
 hud.innerHTML='<b>'+GRID.name(cx,cy)+'</b>'+(tl!==br?' <span class="d">'+tl+' \u2013 '+br+'</span>':'');
}
const applyVB1=applyVB;
applyVB=function(){ applyVB1(); if(gridOn){drawGrid();updHud();} };
(function(){const b=$('gridBtn'); if(b)b.addEventListener('click',()=>setGrid(!gridOn));})();
window._grid={set:setGrid,name:(x,y)=>GRID.name(x,y),on:()=>gridOn,cell:GRID.cell,pfx:GRID.pfx};

/* ---------------- LOCK: keep the current profile while tracing lines ---------------- */
let locked=false;
const hit0=hit;
hit=function(cx,cy){ if(locked)return; hit0(cx,cy); };
function setLock(on){
 locked=on;
 $('lockBtn').classList.toggle('on',on);
 $('lockBtn').innerHTML=on?'\uD83D\uDD12 locked':'\uD83D\uDD13 lock';
 map.classList.toggle('locked',on);
}
$('lockBtn').addEventListener('click',()=>setLock(!locked));

/* ---------------- VIEW BOUNDS: no zooming past the whole chart, no panning into empty margin ---------------- */
const BB=(function(){
 let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
 const eat=(x,y)=>{if(typeof x!=='number'||typeof y!=='number')return;
  if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y;};
 DATA.traits.forEach(t=>eat(t.x,t.y));
 DATA.adjectives.forEach(a=>eat(a.x,a.y));
 const hv=(DATA.harvest||{});
 (hv.hulls||[]).forEach(h=>(h.pts||[]).forEach(p=>eat(p[0],p[1])));
 const px=(x1-x0)*0.04, py=(y1-y0)*0.04;
 return {x:x0-px,y:y0-py,w:(x1-x0)+2*px,h:(y1-y0)+2*py};
})();
const applyVB0=applyVB;
applyVB=function(){
 if(vb.w>0){
  const r=Math.min(BB.w/vb.w, vb.h>0?BB.h/vb.h:Infinity);
  if(r<1){const cx=vb.x+vb.w/2, cy=vb.y+vb.h/2; vb.w*=r; vb.h*=r; vb.x=cx-vb.w/2; vb.y=cy-vb.h/2;}
  vb.x = vb.w>=BB.w ? BB.x+BB.w/2-vb.w/2 : Math.min(Math.max(vb.x,BB.x),BB.x+BB.w-vb.w);
  const hh = vb.h>0 ? vb.h : vb.w*(BB.h/BB.w);
  vb.y = hh>=BB.h ? BB.y+BB.h/2-hh/2 : Math.min(Math.max(vb.y,BB.y),BB.y+BB.h-hh);
 }
 applyVB0();
};
applyVB();
window._bb=()=>({BB:BB,vb:{x:vb.x,y:vb.y,w:vb.w,h:vb.h}});

/* ---------------- SEARCH: ranked suggestions ---------------- */
(function(){
 const q=$('q'); if(!q)return;
 const box=document.createElement('div'); box.id='sugg'; box.style.display='none';
 (q.parentNode||document.body).appendChild(box);
 let items=[],sel=-1;
 const norm=s=>s.toLowerCase();
 function rank(s){
  s=norm(s); if(!s)return [];
  const out=[];
  DATA.traits.forEach(t=>{
   const n=norm(t.name); let sc=null;
   if(n===s)sc=0; else if(n.startsWith(s))sc=1;
   else if(n.split(/[\s(–—/,-]+/).some(w=>w.startsWith(s)))sc=2;
   else if(n.includes(s))sc=3;
   if(sc!==null)out.push({k:'t',id:t.id,label:t.name,sub:t.system,sc:sc});
  });
  Object.keys(DATA.word_index||{}).forEach(w=>{
   const n=norm(w); let sc=null;
   if(n===s)sc=0.5; else if(n.startsWith(s))sc=1.5; else if(n.includes(s))sc=3.5;
   if(sc!==null)out.push({k:'w',word:w,label:'\u201c'+w+'\u201d',
     sub:(DATA.word_index[w]||[]).length+' traits',sc:sc});
  });
  out.sort((a,b)=>a.sc-b.sc||a.label.length-b.label.length||a.label.localeCompare(b.label));
  return out.slice(0,7);
 }
 function paint(){
  if(!items.length){box.style.display='none';return;}
  box.innerHTML=items.map((it,i)=>'<div class="sgrow'+(i===sel?' on':'')+'" data-i="'+i+'">'
   +'<span class="sgk">'+(it.k==='t'?'trait':'word')+'</span>'+F(it.label)
   +'<span class="d"> '+F(it.sub||'')+'</span></div>').join('');
  box.style.display='';
  box.querySelectorAll('.sgrow').forEach(r=>r.addEventListener('mousedown',e=>{e.preventDefault();go(items[+r.dataset.i]);}));
 }
 function go(it){
  if(!it)return;
  box.style.display='none'; q.value='';
  if(it.k==='t'){const t=tby[it.id];zoomTo(t.x,t.y,5);showTrait(t.id);}
  else {const ids=DATA.word_index[it.word]||[]; if(ids.length){const t=tby[ids[0]];zoomTo(t.x,t.y,3);} lightWord(it.word);}
 }
 q.addEventListener('input',()=>{items=rank(q.value.trim());sel=items.length?0:-1;paint();});
 q.addEventListener('keydown',e=>{
  if(e.key==='ArrowDown'){sel=Math.min(sel+1,items.length-1);paint();e.preventDefault();}
  else if(e.key==='ArrowUp'){sel=Math.max(sel-1,0);paint();e.preventDefault();}
  else if(e.key==='Enter'){ if(items.length){e.stopPropagation();go(items[sel<0?0:sel]);} }
  else if(e.key==='Escape'){box.style.display='none';}
 },true);
 q.addEventListener('blur',()=>setTimeout(()=>{box.style.display='none';},120));
 window._search={rank:rank,items:()=>items};
})();

/* ---------------- #6 BRANCHING VALLEYS (zoom-gated) ---------------- */
(function(){
 const hv=DATA.harvest; if(!hv||!hv.valleys_b1)return;
 const host=document.querySelector('.valley')&&document.querySelector('.valley').parentNode;
 if(!host)return;
 const b1=el('path',{d:hv.valleys_b1,class:'valley vb1'},host);
 const b2=el('path',{d:hv.valleys_b2,class:'valley vb2'},host);
 function gate(){
  const shown=host.style.display!=='none'&&getComputedStyle(host).display!=='none';
  const z=BB.w/Math.max(vb.w,1);                    // 1 = whole chart, higher = zoomed in
  b1.style.display=(shown&&z>=1.8)?'':'none';
  b2.style.display=(shown&&z>=3.2)?'':'none';
 }
 const applyVB2=applyVB;
 applyVB=function(){applyVB2();gate();};
 const vb_=$('viewV'); if(vb_)vb_.addEventListener('click',()=>setTimeout(gate,0));
 gate();
 window._valley={tiers:()=>({shown:host.style.display!=='none',b1:host.style.display!=='none'&&b1.style.display!=='none',b2:host.style.display!=='none'&&b2.style.display!=='none',
   z:BB.w/Math.max(vb.w,1)}),gate:gate};
})();

/* ---------------- SEMANTIC WORD LINKS ---------------- */
const ABW={};DATA.adjectives.forEach(a=>ABW[a.word]=a);
const lightWord0=lightWord;
lightWord=function(w){
 lightWord0(w);
 const me=ABW[w]; if(!me)return;
 const nb=[],seen=new Set([w]);
 (DATA.adj_corr[w]||[]).forEach(c=>{if(!seen.has(c.w)){seen.add(c.w);nb.push([c.w,c.r,0]);}});
 (DATA.adj_syn[w]||[]).forEach(x=>{if(!seen.has(x)){seen.add(x);nb.push([x,null,1]);}});
 const kill=[];let mode=null;
 [...pbody.children].forEach(e2=>{
  if(e2.tagName==='H4'){const t=e2.textContent;
   if(t.indexOf('Synonyms')===0||t.indexOf('Correlated adjectives')===0){mode='k';kill.push(e2);return;}
   mode=null;return;}
  if(mode==='k')kill.push(e2);
 });
 let anchor=kill.length?kill[kill.length-1].nextElementSibling:null;
 if(!anchor)anchor=[...pbody.querySelectorAll('h4')].find(h=>h.textContent.indexOf('Traits with')===0)||null;
 kill.forEach(e=>e.remove());
 let rows='';
 nb.forEach(p=>{const nw=p[0],r=p[1];
  const o=ABW[nw]; if(!o)return;
  if(adjByW[nw]){adjByW[nw].forEach(e=>e.classList.remove('dim'));adjByW[nw][0].classList.add('lit2');adjByW[nw][1].classList.add('lensvis');}
  el('line',{x1:me.x,y1:me.y,x2:o.x,y2:o.y,class:'semline'},gX);
  if(r!=null){const t=el('text',{x:(me.x+o.x)/2,y:(me.y+o.y)/2-3,'text-anchor':'middle',class:'semlab'},gX);t.textContent=r.toFixed(2);}
  rows+='<div class="corr-row semrow" data-w="'+nw+'"><span class="semdash"></span>'+(r!=null?'<span class="n">'+r.toFixed(2)+'</span> ':'<span class="synb">syn</span> ')+nw+'</div>';
 });
 if(cmpOn&&cmpA!==null){
  const chip=document.createElement('button');chip.className='mini backchip';
  chip.textContent='\u21a9 back to comparison';
  chip.addEventListener('click',()=>renderCmp());
  pbody.insertBefore(chip,pbody.firstChild);
 }
 // rank this word's traits by how related they are to each other
 (function(){
  const ids=(DATA.word_index[w]||[]).filter(i=>tby[i]);
  if(ids.length<2)return;
  const R=relate(ids);
  const h=[...pbody.querySelectorAll('h4')].find(x=>x.textContent.indexOf('Traits with')===0);
  if(!h)return;
  let n=h.nextElementSibling; const kill=[];
  while(n&&n.tagName!=='H4'){kill.push(n);n=n.nextElementSibling;}
  kill.forEach(k=>k.remove());
  h.innerHTML='Traits with this adjective <span class="d">ranked by how alike they are</span>';
  const box=document.createElement('div');
  box.innerHTML='<div class="chead"><button class="mini wsort on" data-s="rel">by relatedness</button>'
   +'<button class="mini wsort" data-s="az">A\u2013Z</button>'
   +'<button class="mini" id="wlasso">lasso these '+ids.length+'</button></div>'
   +'<div id="wtraits">'+R.map(r=>'<span class="row wrow" data-t="'+r.id+'">'+bandChip(r.band)
     +F(tby[r.id].name)+' <span class="d">'+r.score.toFixed(2)+'</span></span>').join('')+'</div>';
  h.parentNode.insertBefore(box,h.nextSibling);
  const paint=(mode)=>{
   const list=mode==='az'?R.slice().sort((a,b)=>tby[a.id].name.localeCompare(tby[b.id].name)):R;
   box.querySelector('#wtraits').innerHTML=list.map(r=>'<span class="row wrow" data-t="'+r.id+'">'+bandChip(r.band)
     +F(tby[r.id].name)+' <span class="d">'+r.score.toFixed(2)+'</span></span>').join('');
   bindW();
  };
  const bindW=()=>box.querySelectorAll('.wrow').forEach(e=>e.addEventListener('click',()=>{
    const t=tby[+e.dataset.t]; zoomTo(t.x,t.y,5); showTrait(t.id);}));
  box.querySelectorAll('.wsort').forEach(b=>b.addEventListener('click',()=>{
   box.querySelectorAll('.wsort').forEach(x=>x.classList.remove('on')); b.classList.add('on'); paint(b.dataset.s);}));
  const wl=box.querySelector('#wlasso');
  if(wl)wl.addEventListener('click',()=>{SEL=ids.slice();SELNAME='\u201c'+w+'\u201d';setLasso(false);renderRegion();});
  bindW();
 })();
 if(rows){
  const box=document.createElement('div');
  box.innerHTML='<h4 class="semh">Nearest in meaning <span class="d">— the teal links on the map</span></h4>'+rows;
  if(anchor&&anchor.parentNode===pbody)pbody.insertBefore(box,anchor);else pbody.appendChild(box);
  box.querySelectorAll('.semrow').forEach(e=>e.addEventListener('click',()=>lightWord(e.dataset.w)));
 }
};

/* ---------------- ENTITIES (trait or region) ---------------- */
function entW(word){
 const ids=(DATA.word_index[word]||[]).filter(i=>tby[i]);
 const nb=[];const seen=new Set([word]);
 (DATA.adj_corr[word]||[]).forEach(c=>{if(!seen.has(c.w)){seen.add(c.w);nb.push([c.w,c.r]);}});
 (DATA.adj_syn[word]||[]).forEach(x=>{if(!seen.has(x)){seen.add(x);nb.push([x,null]);}});
 return {k:'w',word:word,name:'\u201c'+word+'\u201d',ids:ids,nb:nb,
         words:[word].concat(nb.slice(0,8).map(n=>n[0]))};
}
function entT(id){const t=tby[id];return {k:'t',id:id,name:t.name,words:[...new Set(t.adjectives)],t:t};}
function entR(ids,pts){
 const words=new Set();ids.forEach(i=>new Set(tby[i].adjectives).forEach(w=>words.add(w)));
 return {k:'r',ids:ids.slice(),name:'Region · '+ids.length+' traits',words:[...words],pts:pts||null};
}
function entC(e){ // centroid
 if(e.k==='t')return [e.t.x,e.t.y];
 if(e.k==='w'){const a=ABW[e.word]; if(a)return [a.x,a.y];
  let x=0,y=0;e.ids.forEach(i=>{x+=tby[i].x;y+=tby[i].y;});return [x/Math.max(e.ids.length,1),y/Math.max(e.ids.length,1)];}
 let x=0,y=0;e.ids.forEach(i=>{x+=tby[i].x;y+=tby[i].y;});return [x/e.ids.length,y/e.ids.length];
}
function same(e1,e2){if(!e1||!e2||e1.k!==e2.k)return false;
 if(e1.k==='w')return e1.word===e2.word;
 if(e1.k==='t')return e1.id===e2.id;
 return e1.ids.length===e2.ids.length&&e1.ids.every((v,i)=>v===e2.ids[i]);}
function topDistinct(ids,n){
 const cnt={};ids.forEach(i=>new Set(tby[i].adjectives).forEach(w=>cnt[w]=(cnt[w]||0)+1));
 const N=ids.length;
 return Object.keys(cnt).map(w=>({w:w,c:cnt[w],lift:(cnt[w]/N)/((ATOT[w]||1)/TN)}))
  .sort((a,b)=>((b.c>=Math.min(2,N))-(a.c>=Math.min(2,N)))||(b.lift-a.lift)||(b.c-a.c)).slice(0,n);
}
function nearMatches(A,B){
 const Bs=new Set(B.words),out=[],seen=new Set();
 A.words.forEach(w=>{ if(Bs.has(w))return;
  (DATA.adj_corr[w]||[]).forEach(c=>{if(Bs.has(c.w)&&c.r>=0.55&&!seen.has(w+'|'+c.w)){seen.add(w+'|'+c.w);out.push([w,c.w,c.r]);}});
  (DATA.adj_syn[w]||[]).forEach(x=>{if(Bs.has(x)&&!seen.has(w+'|'+x)){seen.add(w+'|'+x);out.push([w,x,null]);}});
 });
 out.sort((x,y)=>((y[2]==null?1.01:y[2])-(x[2]==null?1.01:x[2])));
 return out.slice(0,8);
}

/* ---------------- COMPARE MODE ---------------- */
let showTrait0=showTrait;
showTrait=function(id){
 if(cmpOn){cmpClick(entT(id));return;}
 const t=tby[id];
 if(t&&tEl[id]){                       // immediate acknowledgement of the tap
  try{ dimAll(); undim(id); tEl[id][0].classList.add('lit'); }catch(e){}
  pbody.innerHTML='<div class="sys">'+F(t.system)+'</div><h2>'+F(t.name)+'</h2><p class="hint">loading\u2026</p>';
 }
 if(showTrait._p)clearTimeout(showTrait._p);
 lastT=id; if(hist[0]!==id){hist.unshift(id); hist=hist.slice(0,8);}
 showTrait._p=setTimeout(()=>{showTrait._p=null;showTrait0(id);},0);
};
function cmpClick(e){
 if(tgt==='L'){ if(same(e,cmpB))cmpB=null; cmpA=e; if(cmpB===null)tgt='R'; }
 else { if(same(e,cmpA))cmpA=null; cmpB=e; if(cmpA===null)tgt='L'; }
 renderCmp();
}
function setTgt(t){tgt=t;
 document.querySelectorAll('.tgtb').forEach(b=>{const a=(b.dataset.tgt===t);
  b.classList.toggle('on',a);b.textContent=(a?'◉ replacing this side':'○ replace this side');});}
function lightCluster(cvc){
 const ids=DATA.traits.filter(x=>x.cvc===cvc).map(x=>x.id);
 if(!ids.length)return;
 const m=(DATA.conv_meta||[])[cvc];
 if(cmpOn){const e=entR(ids,null); if(m)e.name=m.name+' (cluster)'; cmpClick(e); return;}
 SEL=ids; SELNAME=m?m.name:null; setLasso(false); renderRegion();
}
function fullProfile(id){
 const stash=pbody.innerHTML;
 showTrait0(id);                       // real renderer: every section, incl. convergence box
 const html=pbody.innerHTML;
 pbody.innerHTML=stash;
 return html;
}
function card(e,accent,shared,side){
 const sset=new Set(shared||[]);
 let inner;
 if(e.k==='t'){
  inner=fullProfile(e.id);
 } else if(e.k==='w'){
  const R=e.ids.length>1?relate(e.ids):[];
  const def=(DATA.adj_defs||{})[e.word];
  inner='<div class="sys">adjective</div><h2>\u201c'+F(e.word)+'\u201d</h2>'
   +(def?'<p class="hint">'+F(def)+'</p>':'')
   +'<p class="hint"><b>'+e.ids.length+'</b> traits use it \u00b7 '
   +(Math.round(1000*e.ids.length/DATA.traits.length)/10)+'% of the atlas</p>'
   +(e.nb.length?'<h4>Nearest in meaning</h4><p>'+e.nb.slice(0,8).map(n=>'<span class="adj'+(sset.has(n[0])?' cshare':'')+'" data-w="'+n[0]+'">'+n[0]+(n[1]!=null?' <span class="d">'+n[1].toFixed(2)+'</span>':' <span class="d">syn</span>')+'</span>').join('')+'</p>':'')
   +'<h4>Traits using it <span class="d">ranked by likeness</span></h4>'
   +(R.length?R.slice(0,24).map(r=>'<span class="row" data-t="'+r.id+'">'+bandChip(r.band)+F(tby[r.id].name)+'</span>').join('')
     :e.ids.map(i=>'<span class="row" data-t="'+i+'">'+F(tby[i].name)+'</span>').join(''))
   +(e.ids.length>24?'<p class="hint">\u2026 and '+(e.ids.length-24)+' more</p>':'');
 } else {
  const td=topDistinct(e.ids,14);
  inner='<div class="sys">lassoed selection</div><h2>'+e.name+'</h2>'
   +'<h4>Most distinctive adjectives</h4><p>'+td.map(r=>'<span class="adj'+(sset.has(r.w)?' cshare':'')+'" data-w="'+r.w+'">'+r.w+' <span class="d">×'+r.c+'</span></span>').join('')+'</p>'
   +'<p class="hint">'+e.words.length+' distinct words overall</p>'
   +'<h4>Traits</h4>'+e.ids.slice(0,30).map(i=>tby[i]).map(t=>'<span class="row" data-t="'+t.id+'">● '+F(t.name)+' <span class="d">('+t.q+')</span></span>').join('')
   +(e.ids.length>30?'<p class="hint">… and '+(e.ids.length-30)+' more</p>':'');
 }
 const head=slotHead(side);
 return '<div class="ccard" style="border-top:4px solid '+accent+'">'+head+inner+'</div>';
}
function markShared(root,shared){
 const ss=new Set(shared||[]);
 root.querySelectorAll('.backchip').forEach(b=>b.remove());
 root.querySelectorAll('.adj[data-w]').forEach(e=>{if(ss.has(e.dataset.w))e.classList.add('cshare');});
}
function bindCard(root){
 // correlated-trait rows use .corr-row in the base chart; make them fill the aimed side
 root.querySelectorAll('.corr-row[data-t]').forEach(e=>{
  e.classList.add('cmpable');
  e.addEventListener('click',ev=>{ev.stopPropagation();
   const id=+e.dataset.t;
   if(cmpOn){cmpClick(entT(id));}
   else {const t=tby[id];zoomTo(t.x,t.y,5);showTrait(id);}
  });
 });
 root.querySelectorAll('.adj[data-w]').forEach(e=>{
  const w=e.dataset.w;
  const send=document.createElement('span');
  send.className='sendw'; send.title='compare this adjective on the '+(tgt==='L'?'left':'right');
  send.textContent='\u21c6';
  send.addEventListener('click',ev=>{ev.stopPropagation();cmpClick(entW(w));});
  e.appendChild(send);
 });
 root.querySelectorAll('.clbtn').forEach(e=>e.addEventListener('click',()=>lightCluster(+e.dataset.cvc)));
 root.querySelectorAll('.twinrow').forEach(e=>e.addEventListener('click',()=>{const o=tby[+e.dataset.t];zoomTo(o.x,o.y,5);showTrait(o.id);}));
 root.querySelectorAll('.adj[data-w]').forEach(e=>e.addEventListener('click',()=>lightWord(e.dataset.w)));
 root.querySelectorAll('.row[data-t]').forEach(e=>e.addEventListener('click',()=>{
  const id=+e.dataset.t;
  if(cmpOn){cmpClick(entT(id));return;}
  const t=tby[id];zoomTo(t.x,t.y,4);showTrait(t.id);}));
}
function lightEnt(e,color){
 if(e.k==='w'){
  e.ids.forEach(i=>{undim(i);tEl[i][0].classList.add('lit');ring(tby[i],color,1.5);});
  const a=ABW[e.word];
  if(a&&adjByW[e.word]){adjByW[e.word].forEach(x=>x.classList.remove('dim'));adjByW[e.word][0].classList.add('lit');}
  return;
 }
 if(e.k==='t'){undim(e.id);tEl[e.id][0].classList.add('lit');ring(e.t,color);}
 else {
  e.ids.forEach(i=>{undim(i);tEl[i][0].classList.add('lit');ring(tby[i],color,1.8);});
  if(e.pts)el('path',{d:pathD(e.pts,true),class:'laspath sidep',style:'stroke:'+color},gX);
 }
}
function markRelation(){
 // in compare, classify each listed trait against the other side
 if(!cmpOn||cmpA===null||cmpB===null)return;
 const setIds=e=>e.k==='t'?[e.id]:(e.ids||[]);
 const A=new Set(setIds(cmpA)), B=new Set(setIds(cmpB));
 document.querySelectorAll('#panelL .row[data-t], #panel .row[data-t]').forEach(el2=>{
  const id=+el2.dataset.t; if(isNaN(id))return;
  const inA=A.has(id), inB=B.has(id);
  el2.classList.remove('ov-both','ov-near','ov-only');
  if(inA&&inB){el2.classList.add('ov-both');return;}
  const other=inA?B:A;
  let best=0;
  other.forEach(o=>{const r=corrOf(id,o); const v=(r!=null?r:jac(id,o)); if(v>best)best=v;});
  el2.classList.add(best>=0.30?'ov-near':'ov-only');
 });
}
function slotHead(side){
 const act=(tgt===side);
 return '<div class="chead"><button class="mini tgtb'+(act?' on':'')+'" data-tgt="'+side+'" title="the next trait, adjective or lasso you pick lands here">'
  +(act?'\u25c9 replacing this side':'\u25cb replace this side')+'</button>'
  +(side==='R'&&cmpA&&cmpB?'<button class="mini" id="cmpSwap" title="swap the two sides">\u21c4 swap</button>':'')
  +'</div>';
}
function emptySlot(side){
 const recent=hist.filter(i=>tby[i]).slice(0,6);
 const picks=recent.length?'<h4>Recently viewed</h4>'
   +recent.map(i=>'<span class="row recpick" data-t="'+i+'">'+F(tby[i].name)+' <span class="d">'+F(tby[i].system)+'</span></span>').join('')
   :'<p class="hint">Open a trait or two and they will appear here for one-tap loading.</p>';
 return slotHead(side)
  +'<p class="hint">Empty '+(side==='L'?'left':'right')+' slot. Aim here with <i>replace this side</i>, then pick a trait on the map, an adjective, or draw a lasso.</p>'
  +picks;
}
function renderCmp(){
 const L=$('plbody');
 const htmlA = cmpA ? card(cmpA,CA,null,'L') : null;   // snapshot before lighting
 const htmlB = cmpB ? card(cmpB,CB,null,'R') : null;
 clearL();
 if(!cmpA&&!cmpB){
  if(typeof tab==='function')tab('info');
  L.innerHTML=emptySlot('L'); pbody.innerHTML=emptySlot('R');
  bindCmpHead(); bindRecent(); return;
 }
 dimAll();
 if(cmpA)lightEnt(cmpA,CA);
 if(cmpB)lightEnt(cmpB,CB);
 let stats='';
 if(cmpA&&cmpB){
  const As=new Set(cmpA.words), sh=cmpB.words.filter(w=>As.has(w));
  const un=cmpA.words.length+cmpB.words.length-sh.length;
  sh.forEach(w=>{if(adjByW[w]){adjByW[w].forEach(e=>e.classList.remove('dim'));adjByW[w][0].classList.add('lit');}});
  const p1=entC(cmpA),p2=entC(cmpB);
  el('line',{x1:p1[0],y1:p1[1],x2:p2[0],y2:p2[1],class:'cmpline'},gX);
  const lb=el('text',{x:(p1[0]+p2[0])/2,y:(p1[1]+p2[1])/2-4,'text-anchor':'middle',class:'cmplab'},gX);
  lb.textContent=sh.length+' shared \u00b7 '+Math.round(100*sh.length/Math.max(un,1))+'%';
  const NM=nearMatches(cmpA,cmpB);
  stats='<div class="cmpstats"><b>'+sh.length+'</b> shared adjective'+(sh.length==1?'':'s')
   +' \u00b7 overlap <b>'+Math.round(100*sh.length/Math.max(un,1))+'%</b>'
   +(sh.length?'<div class="hint" style="margin-top:3px">'+sh.join(', ')+'</div>':'<div class="hint">no shared vocabulary</div>')
   +(NM.length?'<div class="hint" style="margin-top:4px"><b>near matches:</b> '+NM.map(m=>'<span class="adj nm" data-w="'+m[0]+'">'+m[0]+'</span>\u2248<span class="adj nm" data-w="'+m[1]+'">'+m[1]+'</span><span class="d"> '+(m[2]==null?'syn':m[2].toFixed(2))+'</span>').join(' \u00b7 ')+'</div>':'')
   +'</div>';
  const SH=new Set(sh);
  L.innerHTML=htmlA; pbody.innerHTML=stats+htmlB;
  markShared(L,sh); markShared(pbody,sh);
 } else {
  L.innerHTML = cmpA ? htmlA : emptySlot('L');
  pbody.innerHTML = cmpB ? htmlB : emptySlot('R');
  markShared(L,null); markShared(pbody,null);
 }
 bindCard(L); bindCard(pbody); bindCmpHead(); bindRecent();
 pbody.querySelectorAll('.adj.nm').forEach(e=>e.addEventListener('click',()=>lightWord(e.dataset.w)));
 markRelation();
}
function bindRecent(){
 document.querySelectorAll('.recpick').forEach(e=>e.addEventListener('click',()=>cmpClick(entT(+e.dataset.t))));
}
function bindCmpHead(){
 document.querySelectorAll('.tgtb').forEach(b=>b.addEventListener('click',()=>setTgt(b.dataset.tgt)));
 const s=$('cmpSwap');
 if(s)s.addEventListener('click',()=>{if(cmpB!==null){const x=cmpA;cmpA=cmpB;cmpB=x;renderCmp();}});
}
function setCmp(on){
 cmpOn=on; $('cmpBtn').classList.toggle('on',on); $('panelL').classList.toggle('on',on);
 if(on){
  if(cmpA===null&&hist.length>=2&&tby[hist[0]]&&tby[hist[1]]){cmpA=entT(hist[1]);cmpB=entT(hist[0]);tgt='R';}
  else if(cmpA===null&&lastT!==null&&tby[lastT]){cmpA=entT(lastT);tgt='R';}
  renderCmp();
 }
 else {cmpA=cmpB=null; tgt='R'; clearL();}
 if(typeof applyVB==='function')applyVB();
}
$('cmpBtn').addEventListener('click',()=>setCmp(!cmpOn));

/* ---------------- CONVERGENCE VIEW ---------------- */
const CVC={core:'#7b3fa0',trip:'#2a8fbd',duo:'#e0952a',out:'#b0aca4'};
const CVN={core:'convergent core (4+ systems)',trip:'triple (3 systems)',duo:'pair (2 systems)',out:'outlier (no cross-system match)'};
let convOn=false;
function setConv(on){
 convOn=on;
 const cb=$('convBtn'); if(cb)cb.classList.toggle('on',on);
 const kb=$('convkey'); if(kb)kb.style.display=on?'':'none';
 if(typeof paintNodes==='function')paintNodes();
}
$('convBtn').addEventListener('click',()=>setConv(!convOn));
['viewT','viewH'].forEach(id=>{const b=$(id); if(b)b.addEventListener('click',()=>{setTimeout(()=>{if(typeof setMode==='function')setMode(colourMode);},0);});});
const showTraitP=showTrait0;
showTrait0=function(id){
 showTraitP(id);
 const t=tby[id];
 const m=(DATA.conv_meta||[])[t.cvc];
 const box=document.createElement('div');
 box.className='convbox';
 box.innerHTML='<h4 class="convh">Cross-system convergence</h4>'
  +'<p class="hint"><span class="cvdot" style="background:'+CVC[t.cv||'out']+'"></span>'
  +(m?'<b>'+CVN[t.cv]+'</b><br>Cluster “'+F(m.label)+'” — '+m.n+' traits from '+m.nsys+' systems.<br><span class="d">'+F(m.systems.slice(0,6).join(' · '))+(m.systems.length>6?' …':'')+'</span>'
     :'<b>'+CVN.out+'</b><br><span class="d">No other system describes this trait closely enough to converge (cosine ≥ 0.80).</span>')
  +'</p>';
 const h4=[...pbody.querySelectorAll('h4')].find(h=>h.textContent.indexOf('Adjectives')===0);
 if(h4)pbody.insertBefore(box,h4); else pbody.appendChild(box);
 if(t.twins&&t.twins.length){
  const tw=document.createElement('div');tw.className='twinbox';
  tw.innerHTML='<h4 class="twinh">Same name, other theorists</h4>'
   +t.twins.map(o=>'<span class="row twinrow" data-t="'+o.id+'">'+F(o.name)+' <span class="d">'+F(o.system)+'</span></span>').join('');
  pbody.insertBefore(tw,box.nextSibling);
  tw.querySelectorAll('.twinrow').forEach(e=>e.addEventListener('click',()=>{const o=tby[+e.dataset.t];zoomTo(o.x,o.y,5);showTrait(o.id);}));
 }
 if(m){const btn=document.createElement('button');btn.className='mini clbtn';btn.dataset.cvc=t.cvc;
  btn.textContent='light up this cluster';
  box.appendChild(btn);
  btn.addEventListener('click',()=>lightCluster(t.cvc));}
};

/* ---------------- THEORISTS: grouped by person ---------------- */
const renderTheo0=renderTheo;
renderTheo=function(){
 const G=DATA.theorist_groups;
 if(!G){renderTheo0();return;}
 pbody.innerHTML='<p class="hint" style="margin-bottom:6px">'+G.length+' theorists and traditions \u2014 tap a name to light up all their traits'
  +'<br><span class="d">names with several bodies of work open into their sections</span></p>'
  +G.map((g,i)=>'<span class="row theog" data-g="'+i+'">'+F(g.name)
    +(g.systems.length>1?' <span class="secbadge">'+g.systems.length+' sections</span>':'')
    +' <span class="d">'+g.n+'</span></span>').join('');
 pbody.querySelectorAll('.theog').forEach(e=>e.addEventListener('click',()=>openGroup(+e.dataset.g)));
};
function openGroup(gi){
 const g=DATA.theorist_groups[gi];
 clearL(); dimAll();
 const ids=[];g.systems.forEach(s=>(DATA.theorist_index[s]||[]).forEach(i=>ids.push(i)));
 ids.forEach(i=>{if(tEl[i]){tEl[i].forEach(e=>e.classList.remove('dim'));tEl[i][0].classList.add('lit');}});
 if(typeof tab==='function')tab('theo');
 if(g.systems.length===1){filterTheorist(g.systems[0]);return;}
 const ov=DATA.theorist_overviews||{};
 const first=g.systems.find(s=>ov[s]);
 pbody.innerHTML='<h2>'+F(g.name)+'</h2>'
  +(first?'<p class="hint" style="line-height:1.45;margin:6px 0 8px">'+ov[first]+'</p>':'')
  +'<p class="hint">'+ids.length+' traits across '+g.systems.length+' bodies of work \u2014 tap one to see it alone:</p>'
  +g.systems.map(s=>'<span class="row secrow" data-s="'+encodeURIComponent(s)+'">'+F(s)+' <span class="d">'+(DATA.theorist_index[s]||[]).length+'</span></span>').join('')
  +'<h4>All traits</h4>'
  +ids.map(i=>tby[i]).map(t=>'<span class="row" data-t="'+t.id+'">\u25cf '+F(t.name)+' <span class="d">('+t.q+')</span></span>').join('');
 pbody.querySelectorAll('.secrow').forEach(e=>e.addEventListener('click',ev=>{ev.stopPropagation();filterTheorist(decodeURIComponent(e.dataset.s));}));
 pbody.querySelectorAll('.row[data-t]').forEach(e=>e.addEventListener('click',()=>{const t=tby[+e.dataset.t];zoomTo(t.x,t.y,5);showTrait(t.id);}));
}
/* live counts in the intro */
(function(){const c=DATA.counts;if(!c)return;
 const el2=document.getElementById('atlascount');
 if(el2)el2.innerHTML='<b>'+c.traits+'</b> traits \u00b7 <b>'+c.adjectives+'</b> adjectives \u00b7 <b>'+c.theorists+'</b> theorists and traditions <span class="d">('+c.systems+' distinct bodies of work)</span>';
})();

/* ---------------- GUIDE TAB: view-aware panels ---------------- */
const HN={A:'dopamine',B:'testosterone',C:'oxytocin',D:'cortisol',E:'acetylcholine',F:'serotonin'};
function hormList(){const m={};DATA.traits.forEach(t=>{if(t.horm)(m[t.horm]=m[t.horm]||[]).push(t.id);});return m;}
function blobEls(){return [...document.querySelectorAll('.horm-blob')];}
function hormHighlight(h){
 const m=hormList(),ids=m[h]||[];
 clearL(); dimAll();
 ids.forEach(id=>{undim(id);tEl[id][0].classList.add('lit');});
 blobEls().forEach(e=>{const f=(e.getAttribute('fill')||'')+(e.textContent||'');
  e.style.opacity=(h===null||f.indexOf('hb'+h.replace(/[^a-z]/gi,''))>=0||e.textContent===h)?'':'0.12';});
 document.querySelectorAll('.hchip').forEach(b=>b.classList.toggle('on',b.dataset.h===h));
}
function hormPanel(){
 const m=hormList();
 const keys=Object.keys(m).sort();
 return '<h4>Hormone code</h4><p class="hint">Each family&#8217;s dominant neurochemical signature. Tap one to isolate its region:</p>'
  +'<div class="hchips">'+keys.map(h=>{const c=(DATA.horm_colors||{})[h]||'#888';
    const lt=Object.keys(HN).find(k=>HN[k]===h||h.toLowerCase().indexOf(HN[k])>=0);
    return '<button class="mini hchip" data-h="'+h+'"><span class="kb fill" style="background:'+c+'"></span>'+h
      +(lt?' <span class="d">'+lt+'</span>':'')+' <span class="d">'+m[h].length+'</span></button>';}).join('')
  +'</div><button class="mini" id="hclear">show all regions</button>';
}
function convBrowser(){
 const M=DATA.conv_meta||[];
 const order=['core','trip','duo'];
 const rows=M.slice().sort((a,b)=>order.indexOf(a.tier)-order.indexOf(b.tier)||b.nsys-a.nsys||b.n-a.n);
 return '<h4>Cross-system convergence <span class="d">'+M.length+' clusters</span></h4>'
  +'<p class="hint">Groups of traits that different systems describe the same way. Tap a name to light its members; tap again anywhere to clear.</p>'
  +'<div id="convlist">'+rows.map(m=>'<div class="convrow" data-c="'+m.id+'">'
    +'<span class="cvdot" style="background:'+CVC[m.tier]+'"></span>'
    +'<b>'+F(m.name)+'</b> <span class="d">'+m.n+' traits · '+m.nsys+' systems</span></div>').join('')
  +'</div>';
}
function bindConvBrowser(root){
 root.querySelectorAll('.convrow').forEach(e=>e.addEventListener('click',()=>{
  root.querySelectorAll('.convrow').forEach(x=>x.classList.remove('on'));
  e.classList.add('on'); lightCluster(+e.dataset.c);
 }));
}
const renderInfo0=renderInfo;
renderInfo=function(){
 renderInfo0();
 const isFam=(typeof viewMode==='undefined')||viewMode==='viewT';
 // gate the fit controls: they describe family/community membership, meaningless in hormone view
 const heads=[...pbody.querySelectorAll('h4')];
 const fitH=heads.filter(x=>/^(Fit filter|Community fit|Sub-cluster fit|Convergence-cluster fit)/.test(x.textContent));
 if(isFam){
  const cb=document.createElement('div'); cb.innerHTML=convBrowser();
  pbody.appendChild(cb); bindConvBrowser(cb);
 }
 if(!isFam){
  fitH.forEach(x=>{let n=x;const kill=[x];
   while((n=n.nextElementSibling)&&n.tagName!=='H4')kill.push(n);
   kill.forEach(k=>k.remove());});
  const box=document.createElement('div');
  box.innerHTML=hormPanel();
  pbody.insertBefore(box,pbody.firstChild);
  box.querySelectorAll('.hchip').forEach(b=>b.addEventListener('click',()=>hormHighlight(b.dataset.h)));
  const hc=$('hclear'); if(hc)hc.addEventListener('click',()=>{hormHighlight(null);clearL();});
 }
};
try{ if(typeof tab==='function'){const cur=document.querySelector('.tab.on[data-t]'); if(!cur||cur.dataset.t==='info')renderInfo(); } }catch(e){}
['viewT','viewH'].forEach(id=>{const b=$(id);
 if(b)b.addEventListener('click',()=>{if(id==='viewT')hormHighlight(null);
  const t=document.querySelector('.tab.on[data-t]');
  if(!t||t.dataset.t==='info')renderInfo();});});

/* ---------------- LASSO ---------------- */
function setLasso(on){
 lasOn=on; $('lassoBtn').classList.toggle('on',on); map.classList.toggle('lassoing',on);
 if(!on){lasPts=null;}
}
$('lassoBtn').addEventListener('click',()=>setLasso(!lasOn));
function pip(px,py,poly){let inside=false;
 for(let i=0,j=poly.length-1;i<poly.length;j=i++){
  const xi=poly[i][0],yi=poly[i][1],xj=poly[j][0],yj=poly[j][1];
  if(((yi>py)!==(yj>py))&&(px<(xj-xi)*(py-yi)/(yj-yi)+xi))inside=!inside;
 }return inside;}
map.addEventListener('pointerdown',e=>{ if(!lasOn)return; e.stopPropagation(); e.preventDefault();
 lasPts=[toW(e.clientX,e.clientY)];
 if(lasPath&&!cmpOn)lasPath.remove();
 lasPath=el('path',{d:pathD(lasPts),class:'laspath'},gX);
},true);
map.addEventListener('pointermove',e=>{ if(!lasOn||!lasPts)return; e.stopPropagation();
 const p=toW(e.clientX,e.clientY),q=lasPts[lasPts.length-1];
 if(Math.hypot(p[0]-q[0],p[1]-q[1])>vb.w/300){lasPts.push(p);lasPath.setAttribute('d',pathD(lasPts));}
},true);
function lasUp(e){ if(!lasOn||!lasPts)return; e.stopPropagation();
 const pts=lasPts; lasPts=null;
 const per=pts.reduce((s,p,i)=>i?s+Math.hypot(p[0]-pts[i-1][0],p[1]-pts[i-1][1]):0,0);
 if(pts.length<3||per<vb.w/60){ if(lasPath){lasPath.remove();lasPath=null;} tapNear(pts[0]); return; }
 lasPath.setAttribute('d',pathD(pts,true));
 finishLasso(pts);
}
map.addEventListener('pointerup',lasUp,true);
map.addEventListener('pointercancel',lasUp,true);
function tapNear(p){
 let bt=null,bd=1e9;
 for(const t of DATA.traits){const dd=(t.x-p[0])**2+(t.y-p[1])**2,rr=((t.r||6)+6)**2;if(dd<rr&&dd<bd){bd=dd;bt=t;}}
 if(!bt)return;
 if(cmpOn){cmpClick(entT(bt.id));return;}
 const k=SEL.indexOf(bt.id);
 SELNAME=null;
 if(k>=0)SEL.splice(k,1); else SEL.push(bt.id);
 renderRegion();
}
function finishLasso(poly){
 SELNAME=null;
 const ids=DATA.traits.filter(t=>pip(t.x,t.y,poly)).map(t=>t.id);
 if(cmpOn){ if(lasPath){lasPath.remove();lasPath=null;}
  if(!ids.length)return;
  cmpClick(entR(ids,poly)); return; }
 SEL=ids; renderRegion();
}
function regWordClick(w){
 const hits=SEL.filter(id=>tby[id].adjectives.indexOf(w)>=0);
 if(hits.length===1){const t=tby[hits[0]];zoomTo(t.x,t.y,5);showTrait0(t.id);return;}
 if(hits.length===2){
  if(!cmpOn)setCmp(true);
  cmpA=entT(hits[0]); cmpB=entT(hits[1]); tgt='R'; renderCmp();
  return;
 }
 lightWord(w);
}
function renderRegion(){
 const keep=lasPath;
 clearL(); if(keep){gX.appendChild(keep);lasPath=keep;}
 if(!SEL.length){pbody.innerHTML='<h2>Region</h2><p class="hint">Nothing selected. Draw a lasso around a group of traits, or tap traits to add them one by one.</p>';return;}
 dimAll();
 SEL.forEach(id=>{undim(id);tEl[id][0].classList.add('lit');ring(tby[id],CS,1.8);});
 const N=SEL.length,cnt={};
 SEL.forEach(id=>new Set(tby[id].adjectives).forEach(w=>cnt[w]=(cnt[w]||0)+1));
 const rows=Object.keys(cnt).map(w=>({w:w,c:cnt[w],tot:ATOT[w]||1,lift:(cnt[w]/N)/((ATOT[w]||1)/TN)}));
 const minc=Math.min(2,N);
 if(sortMode==='dist')rows.sort((a,b)=>((b.c>=minc)-(a.c>=minc))||(b.lift-a.lift)||(b.c-a.c));
 else rows.sort((a,b)=>(b.c-a.c)||(b.lift-a.lift));
 if(typeof tab==='function')tab('info');
 let h='<h2>'+(SELNAME?F(SELNAME):'Region')+' · '+N+' trait'+(N==1?'':'s')+'</h2>'
  +'<p class="hint">'+rows.length+' distinct adjectives · tap traits to add/remove · <span class="row" style="display:inline;border:0" id="regClear"><u>clear</u></span></p>'
  +'<div class="chead"><button class="mini" id="regCmp">\u21c6 compare this region</button></div>'
  +'<div class="chead"><button class="mini srt'+(sortMode=='dist'?' on':'')+'" data-s="dist">distinctive</button><button class="mini srt'+(sortMode=='com'?' on':'')+'" data-s="com">common</button></div>'
  +'<div id="regwords">'
  +rows.slice(0,80).map(r=>'<div class="regw" data-w="'+r.w+'"><b>'+r.w+'</b> <span class="cbadge">×'+r.c+'</span><span class="d"> of '+r.tot+' atlas-wide · '+r.lift.toFixed(1)+'× expected</span></div>').join('')
  +'</div><h4>Traits in region</h4>'
  +SEL.map(id=>tby[id]).map(t=>'<span class="row" data-t="'+t.id+'">● '+F(t.name)+' <span class="d">('+t.q+')</span></span>').join('');
 pbody.innerHTML=h;
 pbody.querySelectorAll('.srt').forEach(b=>b.addEventListener('click',()=>{sortMode=b.dataset.s;renderRegion();}));
 const rcm=$('regCmp');
 if(rcm)rcm.addEventListener('click',()=>{const ids=SEL.slice();if(!cmpOn)setCmp(true);cmpClick(entR(ids,null));});
 const rc=$('regClear');if(rc)rc.addEventListener('click',()=>{SEL=[];clearL();renderRegion();});
 pbody.querySelectorAll('.regw').forEach(e=>{
  e.addEventListener('click',()=>regWordClick(e.dataset.w));
  e.addEventListener('mouseenter',()=>{SEL.forEach(id=>{if(tby[id].adjectives.indexOf(e.dataset.w)>=0)tEl[id][0].classList.add('lit2');});});
  e.addEventListener('mouseleave',()=>{document.querySelectorAll('.lit2').forEach(x=>x.classList.remove('lit2'));});
 });
 pbody.querySelectorAll('.row[data-t]').forEach(e=>e.addEventListener('click',()=>{const t=tby[+e.dataset.t];zoomTo(t.x,t.y,5);showTrait0(t.id);}));
}

document.addEventListener('keydown',e=>{ if(e.key!=='Escape')return;
 if(locked){setLock(false);}
 else if(lasOn){setLasso(false);}
 else if(cmpOn){setCmp(false);}
});

/* ---------------- MODE RAIL: Humor / Convergence / Field + the key ---------------- */
(function(){
 const bar=$('bar'), key=$('key'), ctrl=$('ctrl');
 // move "how this atlas works" to the far left of the view buttons
 const nb=$('noteBtn'), vT=$('viewT');
 if(nb&&vT&&vT.parentNode)vT.parentNode.insertBefore(nb,vT);
 // move home to the right of reset
 const hb=$('homeBtn'), rst=$('rst');
 if(hb&&rst&&rst.parentNode)rst.parentNode.insertBefore(hb,rst.nextSibling);
 // build the rail
 const rail=document.createElement('div'); rail.id='moderail';
 rail.innerHTML='<div class="railbtns">'
  +'<button class="modebtn on" data-m="humor">Temperament</button>'
  +'<button class="modebtn" data-m="com">Community</button>'
  +'<button class="modebtn" data-m="conv">Convergence</button>'
  +'<button class="modebtn" data-m="field">Field</button></div>';
 (map||document.body).appendChild(rail);
 // the "key" toggle button belongs directly under the three mode buttons
 const kb=$('keyBtn');
 if(kb)rail.querySelector('.railbtns').appendChild(kb);
 if(key){rail.appendChild(key);key.classList.add('inrail');}
 window._rail=rail;
 initModes();
})();


window._ax={setLock:setLock,locked:()=>locked,setTgt:setTgt,tgt:()=>tgt,core:()=>(DATA.traits.find(t=>t.cv==="core")||{}).id,setConv:setConv,convState:()=>convOn,traits:()=>DATA.traits.map(t=>({id:t.id,x:t.x,y:t.y,q:t.q})),
 setCmp:setCmp,setLasso:setLasso,finishLasso:finishLasso,
 state:()=>({cmpOn:cmpOn,cmpA:cmpA&&(cmpA.k==='t'?cmpA.id:'R'+cmpA.ids.length),cmpB:cmpB&&(cmpB.k==='t'?cmpB.id:'R'+cmpB.ids.length),lasOn:lasOn,sel:SEL.slice(),sort:sortMode}),
 click:id=>showTrait(id)};
})();
