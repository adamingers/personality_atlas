const fs=require('fs'),{JSDOM}=require('jsdom');
const dom=new JSDOM(fs.readFileSync(process.argv[2],'utf8'),{runScripts:'dangerously',pretendToBeVisual:true});
const w=dom.window,d=w.document;const errs=[];w.addEventListener('error',e=>errs.push(e.message));
setTimeout(()=>{
 const key=d.getElementById('key'),kc=d.getElementById('keyClose'),kb=d.getElementById('keyBtn'),map=d.getElementById('map');
 let mapHits=0; map.addEventListener('pointerdown',()=>mapHits++); map.addEventListener('click',()=>mapHits++);
 // tap inside the key body (a legend bullet) — must not reach the map
 const bullet=key.querySelector('.kb')||key.querySelector('li')||key;
 bullet.dispatchEvent(new w.Event('pointerdown',{bubbles:true}));
 bullet.dispatchEvent(new w.Event('click',{bubbles:true}));
 console.log('taps inside key that reached the map:',mapHits,'(expect 0)');
 // hide works
 kc.dispatchEvent(new w.Event('click',{bubbles:true}));
 const hidden=key.style.display==='none'||w.getComputedStyle(key).display==='none';
 console.log('key hidden after pressing hide:',hidden);
 // and reopens
 kb.dispatchEvent(new w.Event('click',{bubbles:true}));
 setTimeout(()=>{
  console.log('key reopens from the key button:',w.getComputedStyle(key).display!=='none');
  // note behaves the same
  const note=d.getElementById('note'),nc=d.getElementById('noteClose');
  let nh=0; map.addEventListener('pointerdown',()=>nh++);
  note.dispatchEvent(new w.Event('pointerdown',{bubbles:true}));
  console.log('taps inside note reaching map:',nh,'(expect 0)');
  nc.dispatchEvent(new w.Event('click',{bubbles:true}));
  console.log('note hides:',w.getComputedStyle(note).display==='none');
  console.log('ERRORS:',errs.length?errs.join('|'):'none');
 },60);
},2600);
