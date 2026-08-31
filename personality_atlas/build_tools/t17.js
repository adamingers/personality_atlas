const fs=require('fs'),{JSDOM}=require('jsdom');
const dom=new JSDOM(fs.readFileSync(process.argv[2],'utf8'),{runScripts:'dangerously',pretendToBeVisual:true});
const w=dom.window,d=w.document;const errs=[];w.addEventListener('error',e=>errs.push(e.message));
setTimeout(()=>{try{
 const ax=w._ax,pb=d.getElementById('pbody');
 // spacing above the tabs
 const panel=d.getElementById('panel');
 console.log('panel padding-top:',w.getComputedStyle(panel).paddingTop,'| panelL:',w.getComputedStyle(d.getElementById('panelL')).paddingTop);
 const firstTab=d.querySelector('#panel .tab');
 console.log('first element in panel:',panel.firstElementChild.tagName+'.'+panel.firstElementChild.className,'| tabs inside panel:',!!firstTab);
 // confidence button gone, lock present
 const vc=d.getElementById('viewC'), lb=d.getElementById('lockBtn');
 console.log('confidence hidden:',w.getComputedStyle(vc).display,'| lock button:',lb?lb.textContent.trim():'MISSING');
 // lock behaviour
 w.showTrait(5);
 setTimeout(()=>{
  const before=(pb.querySelector('h2')||{}).textContent;
  lb.dispatchEvent(new w.Event('click'));
  console.log('locked state:',ax.locked(),'| label now:',lb.textContent.trim(),'| btn on:',lb.classList.contains('on'));
  // simulate a map click on a different trait
  const t=ax.traits()[40];
  w.hit(0,0);                       // map-origin click -> should be ignored
  console.log('after map click while locked, profile still:',(pb.querySelector('h2')||{}).textContent===before);
  // panel navigation still works while locked
  const row=pb.querySelector('.row[data-t]');
  if(row){row.dispatchEvent(new w.Event('click'));
   setTimeout(()=>{
    console.log('panel row still navigates while locked:',(pb.querySelector('h2')||{}).textContent);
    lb.dispatchEvent(new w.Event('click'));
    console.log('unlocked:',!ax.locked(),'| label:',lb.textContent.trim());
    w.hit(0,0);
    console.log('map clicks work again (no throw)');
    console.log('ERRORS:',errs.length?errs.join('|'):'none');
   },260);}
 },260);
}catch(e){console.log('THREW:',e.message);}},2500);
