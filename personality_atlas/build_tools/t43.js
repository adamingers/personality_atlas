const fs=require('fs'),{JSDOM}=require('jsdom');
const dom=new JSDOM(fs.readFileSync(process.argv[2],'utf8'),{runScripts:'dangerously',pretendToBeVisual:true});
const w=dom.window,d=w.document;const errs=[];w.addEventListener('error',e=>errs.push(e.message));
setTimeout(()=>{try{
 const ax=w._ax,pl=d.getElementById('plbody'),pb=d.getElementById('pbody');
 // enter compare with NO history at all
 d.getElementById('cmpBtn').dispatchEvent(new w.Event('click'));
 let s=ax.state();
 console.log('cold start: A=',s.cmpA,'B=',s.cmpB);
 console.log('  target buttons present:',d.querySelectorAll('.tgtb').length,'(expect 2)');
 console.log('  left text:',pl.textContent.trim().slice(0,60));
 console.log('  right text:',pb.textContent.trim().slice(0,60));
 // aim right, click a trait on the map
 [...d.querySelectorAll('.tgtb')].find(b=>b.dataset.tgt==='R').dispatchEvent(new w.Event('click'));
 ax.click(11); s=ax.state();
 console.log('aimed R then picked 11 -> A=',s.cmpA,'B=',s.cmpB);
 [...d.querySelectorAll('.tgtb')].find(b=>b.dataset.tgt==='L').dispatchEvent(new w.Event('click'));
 ax.click(3); s=ax.state();
 console.log('aimed L then picked 3  -> A=',s.cmpA,'B=',s.cmpB,'| both loaded:',s.cmpA!==null&&s.cmpB!==null);
 ax.setCmp(false);
 // now with history: recent picks should be offered
 w.showTrait(5);
 setTimeout(()=>{ w.showTrait(9);
  setTimeout(()=>{
   ax.setCmp(false);
   d.getElementById('cmpBtn').dispatchEvent(new w.Event('click'));
   const s2=ax.state();
   console.log('with history, auto-seeded: A=',s2.cmpA,'B=',s2.cmpB);
   console.log('ERRORS:',errs.length?errs.join('|'):'none');
  },300);
 },300);
}catch(e){console.log('THREW:',e.message);}},2600);
