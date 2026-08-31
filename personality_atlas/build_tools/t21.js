const fs=require('fs'),{JSDOM}=require('jsdom');
const dom=new JSDOM(fs.readFileSync(process.argv[2],'utf8'),{runScripts:'dangerously',pretendToBeVisual:true});
const w=dom.window,d=w.document;const errs=[];w.addEventListener('error',e=>errs.push(e.message));
setTimeout(()=>{try{
 const pb=d.getElementById('pbody');
 // #1 BFAS / IPIP
 const T=w.DATA?w.DATA.traits:null;
 // #4 convergence browser
 const rows=[...pb.querySelectorAll('.convrow')];
 console.log('convergence rows in Guide:',rows.length,'(expect 86)');
 console.log('   first:',rows[0]?rows[0].textContent.trim().slice(0,52):'none');
 console.log('   named (no raw comma labels):',rows.slice(0,5).every(r=>r.querySelector('b').textContent.includes('·')||!r.querySelector('b').textContent.includes(',')));
 rows[0].dispatchEvent(new w.Event('click'));
 setTimeout(()=>{
  console.log('after click -> panel h2:',(pb.querySelector('h2')||{}).textContent);
  console.log('   lit traits:',d.querySelectorAll('circle.lit').length);
  console.log('   row marked on:',rows[0].classList.contains('on')||[...d.querySelectorAll('.convrow.on')].length>0);
  // #3 key hide + tap-through
  const key=d.getElementById('key'),kc=d.getElementById('keyClose');
  let mapHits=0; d.getElementById('map').addEventListener('pointerdown',()=>mapHits++);
  const ev=new w.PointerEvent?new w.PointerEvent('pointerdown',{bubbles:true}):new w.Event('pointerdown',{bubbles:true});
  key.dispatchEvent(ev);
  console.log('tap on key reaches map:',mapHits,'(expect 0)');
  kc.dispatchEvent(new w.Event('click',{bubbles:true}));
  console.log('key hidden after close:',key.style.display==='none'||w.getComputedStyle(key).display==='none');
  console.log('ERRORS:',errs.length?errs.join('|'):'none');
 },260);
}catch(e){console.log('THREW:',e.message);}},2600);
