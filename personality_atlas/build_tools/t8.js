const fs=require('fs'),{JSDOM}=require('jsdom');
const dom=new JSDOM(fs.readFileSync(process.argv[2],'utf8'),{runScripts:'dangerously',pretendToBeVisual:true});
const w=dom.window,d=w.document;const errs=[];w.addEventListener('error',e=>errs.push(e.message));
setTimeout(()=>{try{
 const ax=w._ax,pb=d.getElementById('pbody');
 // 1 layout
 const bar=w.getComputedStyle(d.getElementById('bar'));
 console.log('bar position:',bar.position,'| bg:',bar.background.slice(0,20),'| zIndex:',bar.zIndex);
 // 4 zoom tip
 const zt=d.getElementById('zoomtip');
 console.log('zoom tip present:',!!zt,'| text:',zt?zt.textContent.slice(0,58):'','| is last child of note:',zt&&zt.parentNode.lastElementChild===zt);
 // 6 instant feedback
 w.showTrait(87);
 console.log('instant header:',(pb.querySelector('h2')||{}).textContent,'| placeholder:',pb.textContent.includes('loading'));
 setTimeout(()=>{
  console.log('after defer, full profile:',(pb.querySelector('h2')||{}).textContent,'| has convbox:',!!pb.querySelector('.convbox'));
  // 2 cluster button in compare card
  const cid=ax.core();
  ax.setCmp(true); ax.click(cid); ax.click(cid+1);
  const btns=d.querySelectorAll('.clbtn');
  console.log('cluster buttons in compare cards:',btns.length,'| have data-cvc:',[...btns].every(b=>b.dataset.cvc!==undefined));
  if(btns.length){btns[0].dispatchEvent(new w.Event('click'));
   const s=ax.state();console.log('  click in compare -> anchor:',s.cmpA,'(region expected)');}
  ax.setCmp(false);
  // 5 smart routing
  const T=ax.traits(),sub=T.filter(t=>t.q===T[0].q).slice(0,14);
  const xs=sub.map(t=>t.x),ys=sub.map(t=>t.y);
  ax.setLasso(true);
  ax.finishLasso([[Math.min(...xs)-1,Math.min(...ys)-1],[Math.max(...xs)+1,Math.min(...ys)-1],[Math.max(...xs)+1,Math.max(...ys)+1],[Math.min(...xs)-1,Math.max(...ys)+1]]);
  const rows=[...d.querySelectorAll('.regw')];
  const one=rows.find(r=>r.textContent.includes('×1')), two=rows.find(r=>r.textContent.includes('×2'));
  console.log('region rows:',rows.length,'| found ×1:',!!one,'| found ×2:',!!two);
  if(one){one.dispatchEvent(new w.Event('click'));
   setTimeout(()=>{
    console.log('  single-occurrence click -> profile:',(pb.querySelector('h2')||{}).textContent);
    ax.setLasso(true);
    ax.finishLasso([[Math.min(...xs)-1,Math.min(...ys)-1],[Math.max(...xs)+1,Math.min(...ys)-1],[Math.max(...xs)+1,Math.max(...ys)+1],[Math.min(...xs)-1,Math.max(...ys)+1]]);
    const t2=[...d.querySelectorAll('.regw')].find(r=>r.textContent.includes('×2'));
    if(t2){t2.dispatchEvent(new w.Event('click'));
      const s=ax.state();
      console.log('  double-occurrence click -> cmpOn:',s.cmpOn,'A:',s.cmpA,'B:',s.cmpB);}
    console.log('ERRORS:',errs.length?errs.join('|'):'none');
   },300);}
 },200);
}catch(e){console.log('THREW:',e.message);}},2500);
