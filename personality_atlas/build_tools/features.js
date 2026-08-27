
/* ===== Atlas extensions: Compare (traits OR regions) + Lasso region harvest + semantic links ===== */
(function(){
'use strict';
const $=i=>document.getElementById(i);
const gX=el('g',{});
const CA='#0a6ebd', CB='#d97706', CS='#0a9d8e';
let cmpOn=false, cmpA=null, cmpB=null, tgt='R', lastT=null;          // entities: {k:'t',...} or {k:'r',...}
let lasOn=false, lasPts=null, lasPath=null, SEL=[], sortMode='dist';
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
 if(rows){
  const box=document.createElement('div');
  box.innerHTML='<h4 class="semh">Nearest in meaning <span class="d">— the teal links on the map</span></h4>'+rows;
  if(anchor&&anchor.parentNode===pbody)pbody.insertBefore(box,anchor);else pbody.appendChild(box);
  box.querySelectorAll('.semrow').forEach(e=>e.addEventListener('click',()=>lightWord(e.dataset.w)));
 }
};

/* ---------------- ENTITIES (trait or region) ---------------- */
function entT(id){const t=tby[id];return {k:'t',id:id,name:t.name,words:[...new Set(t.adjectives)],t:t};}
function entR(ids,pts){
 const words=new Set();ids.forEach(i=>new Set(tby[i].adjectives).forEach(w=>words.add(w)));
 return {k:'r',ids:ids.slice(),name:'Region · '+ids.length+' traits',words:[...words],pts:pts||null};
}
function entC(e){ // centroid
 if(e.k==='t')return [e.t.x,e.t.y];
 let x=0,y=0;e.ids.forEach(i=>{x+=tby[i].x;y+=tby[i].y;});return [x/e.ids.length,y/e.ids.length];
}
function same(e1,e2){if(!e1||!e2||e1.k!==e2.k)return false;
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
 lastT=id;
 showTrait._p=setTimeout(()=>{showTrait._p=null;showTrait0(id);},0);
};
function cmpClick(e){
 if(tgt==='L'){ if(same(e,cmpB))cmpB=null; cmpA=e; if(cmpB===null)tgt='R'; }
 else { if(same(e,cmpA))return; cmpB=e; }
 renderCmp();
}
function setTgt(t){tgt=t;
 document.querySelectorAll('.tgtb').forEach(b=>{const a=(b.dataset.tgt===t);
  b.classList.toggle('on',a);b.textContent=(a?'◉ replacing this side':'○ replace this side');});}
function lightCluster(cvc){
 const ids=DATA.traits.filter(x=>x.cvc===cvc).map(x=>x.id);
 if(!ids.length)return;
 if(cmpOn){cmpClick(entR(ids,null));}else{SEL=ids;setLasso(false);renderRegion();}
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
 } else {
  const td=topDistinct(e.ids,14);
  inner='<div class="sys">lassoed selection</div><h2>'+e.name+'</h2>'
   +'<h4>Most distinctive adjectives</h4><p>'+td.map(r=>'<span class="adj'+(sset.has(r.w)?' cshare':'')+'" data-w="'+r.w+'">'+r.w+' <span class="d">×'+r.c+'</span></span>').join('')+'</p>'
   +'<p class="hint">'+e.words.length+' distinct words overall</p>'
   +'<h4>Traits</h4>'+e.ids.slice(0,30).map(i=>tby[i]).map(t=>'<span class="row" data-t="'+t.id+'">● '+F(t.name)+' <span class="d">('+t.q+')</span></span>').join('')
   +(e.ids.length>30?'<p class="hint">… and '+(e.ids.length-30)+' more</p>':'');
 }
 const act=(tgt===side);
 const head='<div class="chead"><button class="mini tgtb'+(act?' on':'')+'" data-tgt="'+side+'" title="the next trait or lasso you pick lands on this side">'
  +(act?'◉ replacing this side':'○ replace this side')+'</button>'
  +(side==='R'?'<button class="mini" id="cmpSwap" title="swap the two sides">⇄ swap</button>':'')
  +'</div>';
 return '<div class="ccard" style="border-top:4px solid '+accent+'">'+head+inner+'</div>';
}
function markShared(root,shared){
 const ss=new Set(shared||[]);
 root.querySelectorAll('.backchip').forEach(b=>b.remove());
 root.querySelectorAll('.adj[data-w]').forEach(e=>{if(ss.has(e.dataset.w))e.classList.add('cshare');});
}
function bindCard(root){
 root.querySelectorAll('.clbtn').forEach(e=>e.addEventListener('click',()=>lightCluster(+e.dataset.cvc)));
 root.querySelectorAll('.twinrow').forEach(e=>e.addEventListener('click',()=>{const o=tby[+e.dataset.t];zoomTo(o.x,o.y,5);showTrait(o.id);}));
 root.querySelectorAll('.adj[data-w]').forEach(e=>e.addEventListener('click',()=>lightWord(e.dataset.w)));
 root.querySelectorAll('.row[data-t]').forEach(e=>e.addEventListener('click',()=>{const t=tby[+e.dataset.t];zoomTo(t.x,t.y,4);showTrait(t.id);}));
}
function lightEnt(e,color){
 if(e.k==='t'){undim(e.id);tEl[e.id][0].classList.add('lit');ring(e.t,color);}
 else {
  e.ids.forEach(i=>{undim(i);tEl[i][0].classList.add('lit');ring(tby[i],color,1.8);});
  if(e.pts)el('path',{d:pathD(e.pts,true),class:'laspath sidep',style:'stroke:'+color},gX);
 }
}
function renderCmp(){
 const L=$('plbody'); clearL();
 if(cmpA===null){
  L.innerHTML='<p class="hint" style="padding-top:8px">Compare mode is on.<br><br><b>Click a trait</b> — or <b>draw a lasso</b> with the ◌ tool — to fill a side. Each side has its own <i>replace this side</i> button: whichever is marked ◉ receives what you pick next.</p>';
  if(typeof tab==='function')tab('info');pbody.innerHTML='<p class="hint">…traits and regions can be mixed freely: trait vs trait, region vs region, or trait vs region.</p>';return;
 }
 const htmlA=card(cmpA,CA,null,'L');
 clearL(); dimAll(); lightEnt(cmpA,CA);
 if(cmpB===null){
  L.innerHTML=htmlA; markShared(L,null); bindCard(L);
  pbody.innerHTML='<div class="chead"><button class="mini tgtb'+(tgt==='R'?' on':'')+'" data-tgt="R">'+(tgt==='R'?'◉ replacing this side':'○ replace this side')+'</button></div>'
   +'<p class="hint" style="padding:8px 0">Comparing against <b>'+F(cmpA.name)+'</b>.<br>Pick anything — a correlated trait in its profile, a trait on the map, or a lasso — and it lands on the side marked ◉.</p>';
  bindCmpHead();
  return;
 }
 const As=new Set(cmpA.words),sh=cmpB.words.filter(w=>As.has(w));
 const htmlB=card(cmpB,CB,sh,'R');
 clearL(); dimAll(); lightEnt(cmpA,CA); lightEnt(cmpB,CB);
 const un=cmpA.words.length+cmpB.words.length-sh.length;
 sh.forEach(w=>{ if(adjByW[w]){adjByW[w].forEach(e=>e.classList.remove('dim'));adjByW[w][0].classList.add('lit');}});
 const p1=entC(cmpA),p2=entC(cmpB);
 el('line',{x1:p1[0],y1:p1[1],x2:p2[0],y2:p2[1],class:'cmpline'},gX);
 const lb=el('text',{x:(p1[0]+p2[0])/2,y:(p1[1]+p2[1])/2-4,'text-anchor':'middle',class:'cmplab'},gX);
 lb.textContent=sh.length+' shared · '+Math.round(100*sh.length/Math.max(un,1))+'%';
 const NM=nearMatches(cmpA,cmpB);
 L.innerHTML=htmlA; markShared(L,sh); bindCard(L);
 pbody.innerHTML='<div class="cmpstats"><b>'+sh.length+'</b> shared adjective'+(sh.length==1?'':'s')+' · overlap <b>'+Math.round(100*sh.length/Math.max(un,1))+'%</b>'
  +(sh.length?'<div class="hint" style="margin-top:3px">'+sh.join(', ')+'</div>':'<div class="hint">no shared vocabulary</div>')
  +(NM.length?'<div class="hint" style="margin-top:4px"><b>near matches:</b> '+NM.map(m=>'<span class="adj nm" data-w="'+m[0]+'">'+m[0]+'</span>≈<span class="adj nm" data-w="'+m[1]+'">'+m[1]+'</span><span class="d"> '+(m[2]==null?'syn':m[2].toFixed(2))+'</span>').join(' · ')+'</div>':'')
  +'</div>'
  +htmlB;
 markShared(pbody,sh); bindCard(pbody); bindCmpHead();
 pbody.querySelectorAll('.adj.nm').forEach(e=>e.addEventListener('click',()=>lightWord(e.dataset.w)));
}
function bindCmpHead(){
 document.querySelectorAll('.tgtb').forEach(b=>b.addEventListener('click',()=>setTgt(b.dataset.tgt)));
 const s=$('cmpSwap');
 if(s)s.addEventListener('click',()=>{if(cmpB!==null){const x=cmpA;cmpA=cmpB;cmpB=x;renderCmp();}});
}
function setCmp(on){
 cmpOn=on; $('cmpBtn').classList.toggle('on',on); $('panelL').classList.toggle('on',on);
 if(on){ if(cmpA===null&&lastT!==null&&tby[lastT]){cmpA=entT(lastT);tgt='R';} renderCmp(); }
 else {cmpA=cmpB=null; tgt='R'; clearL();}
 if(typeof applyVB==='function')applyVB();
}
$('cmpBtn').addEventListener('click',()=>setCmp(!cmpOn));

/* ---------------- CONVERGENCE VIEW ---------------- */
const CVC={core:'#7b3fa0',trip:'#2a8fbd',duo:'#e0952a',out:'#b0aca4'};
const CVN={core:'convergent core (4+ systems)',trip:'triple (3 systems)',duo:'pair (2 systems)',out:'outlier (no cross-system match)'};
let convOn=false;
function setConv(on){
 convOn=on; $('convBtn').classList.toggle('on',on); const kb=$('convkey'); if(kb)kb.style.display=on?'':'none';
 DATA.traits.forEach(t=>{const c=tEl[t.id][0];
  if(on)c.setAttribute('fill',CVC[t.cv||'out']);
  else c.setAttribute('fill',(typeof viewMode!=='undefined'&&viewMode==='viewH')?t.hcol:t.color);});
}
$('convBtn').addEventListener('click',()=>setConv(!convOn));
['viewT','viewH'].forEach(id=>{const b=$(id); if(b)b.addEventListener('click',()=>{if(convOn)setConv(false);});});
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
const renderInfo0=renderInfo;
renderInfo=function(){
 renderInfo0();
 const isFam=(typeof viewMode==='undefined')||viewMode==='viewT';
 // gate the fit controls: they describe family/community membership, meaningless in hormone view
 const heads=[...pbody.querySelectorAll('h4')];
 const fitH=heads.filter(x=>/^(Fit filter|Community fit|Sub-cluster fit|Convergence-cluster fit)/.test(x.textContent));
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
 if(k>=0)SEL.splice(k,1); else SEL.push(bt.id);
 renderRegion();
}
function finishLasso(poly){
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
 let h='<h2>Region · '+N+' trait'+(N==1?'':'s')+'</h2>'
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

window._ax={setLock:setLock,locked:()=>locked,setTgt:setTgt,tgt:()=>tgt,core:()=>(DATA.traits.find(t=>t.cv==="core")||{}).id,setConv:setConv,convState:()=>convOn,traits:()=>DATA.traits.map(t=>({id:t.id,x:t.x,y:t.y,q:t.q})),
 setCmp:setCmp,setLasso:setLasso,finishLasso:finishLasso,
 state:()=>({cmpOn:cmpOn,cmpA:cmpA&&(cmpA.k==='t'?cmpA.id:'R'+cmpA.ids.length),cmpB:cmpB&&(cmpB.k==='t'?cmpB.id:'R'+cmpB.ids.length),lasOn:lasOn,sel:SEL.slice(),sort:sortMode}),
 click:id=>showTrait(id)};
})();
