const fs=require('fs'),{JSDOM}=require('jsdom');
const dom=new JSDOM(fs.readFileSync(process.argv[2],'utf8'),{runScripts:'dangerously',pretendToBeVisual:true});
const w=dom.window,d=w.document;const errs=[];w.addEventListener('error',e=>errs.push(e.message));
setTimeout(()=>{try{
 const ax=w._ax,pb=d.getElementById('pbody'),pl=d.getElementById('plbody');
 // open a profile, then hit compare -> should keep it as anchor
 w.showTrait(0);
 setTimeout(()=>{
  const name=(pb.querySelector('h2')||{}).textContent;
  d.getElementById('cmpBtn').dispatchEvent(new w.Event('click'));
  console.log('was on:',name);
  console.log('after compare, left card:',(pl.querySelector('h2')||{}).textContent,'| matches:',(pl.querySelector('h2')||{}).textContent===name);
  console.log('state:',JSON.stringify(ax.state().cmpA),'target side:',ax.tgt());
  // click a correlated trait from the right pane hint area? use map click
  ax.click(7);
  const s=ax.state();
  console.log('after clicking another trait: A=',s.cmpA,'B=',s.cmpB);
  // symmetric buttons, no clear
  const tg=[...d.querySelectorAll('.tgtb')];
  console.log('target buttons:',tg.length,'sides:',tg.map(b=>b.dataset.tgt).join(','));
  console.log('clear button present:',!!d.getElementById('cmpClearA'),'(expect false)');
  console.log('swap present:',!!d.getElementById('cmpSwap'));
  // both sides replaceable
  tg.find(b=>b.dataset.tgt==='L').dispatchEvent(new w.Event('click'));
  ax.click(12); let s2=ax.state(); console.log('aim L -> A=',s2.cmpA,'B=',s2.cmpB);
  [...d.querySelectorAll('.tgtb')].find(b=>b.dataset.tgt==='R').dispatchEvent(new w.Event('click'));
  ax.click(20); s2=ax.state(); console.log('aim R -> A=',s2.cmpA,'B=',s2.cmpB);
  d.getElementById('cmpSwap').dispatchEvent(new w.Event('click')); s2=ax.state();
  console.log('swap -> A=',s2.cmpA,'B=',s2.cmpB);
  // note overlay
  d.getElementById('cmpBtn').dispatchEvent(new w.Event('click'));
  const note=d.getElementById('note'), cs=w.getComputedStyle(note);
  console.log('note z-index:',cs.zIndex,'| overflowY:',cs.overflowY,'| maxWidth:',cs.maxWidth);
  console.log('lock explained in note:',note.textContent.includes('Leave it unlocked'));
  console.log('ERRORS:',errs.length?errs.join('|'):'none');
 },300);
}catch(e){console.log('THREW:',e.message);}},2500);
