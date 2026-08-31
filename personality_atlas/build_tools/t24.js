const fs=require('fs'),{JSDOM}=require('jsdom');
const dom=new JSDOM(fs.readFileSync(process.argv[2],'utf8'),{runScripts:'dangerously',pretendToBeVisual:true});
const w=dom.window,d=w.document;const errs=[];w.addEventListener('error',e=>errs.push(e.message));
setTimeout(()=>{
 const pb=d.getElementById('pbody'),key=d.getElementById('key'),map=d.getElementById('map');
 w.showTrait(0);
 setTimeout(()=>{
  const before=(pb.querySelector('h2')||{}).textContent;
  let pd=0; map.addEventListener('pointerdown',()=>pd++);
  let hits=0; const h0=w.hit; w.hit=function(){hits++;return h0.apply(this,arguments);};
  const bullet=key.querySelector('.kb')||key;
  ['pointerdown','pointerup','click'].forEach(ev=>bullet.dispatchEvent(new w.Event(ev,{bubbles:true})));
  setTimeout(()=>{
   console.log('map pointerdown from key tap:',pd,'(expect 0)');
   console.log('hit() called by key tap:',hits,'(expect 0)');
   console.log('profile unchanged:',(pb.querySelector('h2')||{}).textContent===before,'|',before);
   const kc=d.getElementById('keyClose');
   kc.dispatchEvent(new w.Event('click',{bubbles:true}));
   console.log('hide works:',w.getComputedStyle(key).display==='none');
   d.getElementById('keyBtn').dispatchEvent(new w.Event('click',{bubbles:true}));
   setTimeout(()=>{
    console.log('reopen works:',w.getComputedStyle(key).display!=='none');
    console.log('ERRORS:',errs.length?errs.join('|'):'none');
   },60);
  },80);
 },260);
},2600);
