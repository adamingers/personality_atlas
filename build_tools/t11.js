const fs=require('fs'),{JSDOM}=require('jsdom');
const dom=new JSDOM(fs.readFileSync(process.argv[2],'utf8'),{runScripts:'dangerously',pretendToBeVisual:true});
const w=dom.window,d=w.document;const errs=[];w.addEventListener('error',e=>errs.push(e.message));
setTimeout(()=>{
 const ax=w._ax,pb=d.getElementById('pbody');
 const T=ax.traits(),sub=T.filter(t=>t.q===T[0].q).slice(0,3);
 const xs=sub.map(t=>t.x),ys=sub.map(t=>t.y);
 const poly=[[Math.min(...xs)-1,Math.min(...ys)-1],[Math.max(...xs)+1,Math.min(...ys)-1],[Math.max(...xs)+1,Math.max(...ys)+1],[Math.min(...xs)-1,Math.max(...ys)+1]];
 const cnt=r=>{const m=/\u00d7(\d+)/.exec(r.querySelector('.cbadge').textContent);return m?+m[1]:0;};
 const pick=n=>{ax.setLasso(true);ax.finishLasso(poly);return [...d.querySelectorAll('.regw')].find(r=>cnt(r)===n);};
 const r1=pick(1);
 console.log('single-occurrence word:',r1.dataset.w);
 r1.dispatchEvent(new w.Event('click'));
 setTimeout(()=>{
  console.log('   -> opened:',JSON.stringify((pb.querySelector('h2')||{}).textContent),'| trait profile:',!!pb.querySelector('.convbox'));
  const r2=pick(2);
  console.log('two-occurrence word:',r2.dataset.w);
  r2.dispatchEvent(new w.Event('click'));
  const s=ax.state();
  console.log('   -> compare on:',s.cmpOn,'A:',s.cmpA,'B:',s.cmpB);
  ax.setCmp(false);
  const r3=pick(4)||pick(3);
  console.log('many-occurrence word:',r3.dataset.w);
  r3.dispatchEvent(new w.Event('click'));
  console.log('   -> opened:',JSON.stringify((pb.querySelector('h2')||{}).textContent),'| word profile:',!!pb.querySelector('.semh'));
  console.log('ERRORS:',errs.length?errs.join('|'):'none');
 },400);
},2500);
