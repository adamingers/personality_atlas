const fs=require('fs'),{JSDOM}=require('jsdom');
const dom=new JSDOM(fs.readFileSync(process.argv[2],'utf8'),{runScripts:'dangerously',pretendToBeVisual:true});
const w=dom.window,d=w.document;const errs=[];w.addEventListener('error',e=>errs.push(e.message));
setTimeout(()=>{
 const bar=d.getElementById('bar'), wrap=d.getElementById('wrap'), map=d.getElementById('map');
 console.log('bar parent:',bar.parentNode.tagName+(bar.parentNode.id?'#'+bar.parentNode.id:''));
 console.log('bar is first body child:',d.body.firstElementChild===bar);
 console.log('bar before wrap:',!!(bar.compareDocumentPosition(wrap)&w.Node.DOCUMENT_POSITION_FOLLOWING));
 console.log('map still inside wrap:',map.parentNode.id);
 const cs=w.getComputedStyle(bar);
 console.log('bar position:',cs.position,'| order:',cs.order,'| bg:',cs.backgroundColor);
 console.log('buttons in bar:',bar.querySelectorAll('button').length,'| ids:',[...bar.querySelectorAll('button')].map(b=>b.id).filter(Boolean).join(','));
 console.log('note top:',w.getComputedStyle(d.getElementById('note')).top);
 // functionality still wired
 w.showTrait(5);
 setTimeout(()=>{
  console.log('profile renders:',(d.getElementById('pbody').querySelector('h2')||{}).textContent);
  d.getElementById('viewH').dispatchEvent(new w.Event('click'));
  console.log('hormone view toggles:',d.getElementById('viewH').classList.contains('on'),'| chips:',d.querySelectorAll('.hchip').length);
  d.getElementById('viewT').dispatchEvent(new w.Event('click'));
  console.log('ERRORS:',errs.length?errs.join('|'):'none');
 },250);
},2500);
