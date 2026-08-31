const fs=require('fs'),{JSDOM}=require('jsdom');
const dom=new JSDOM(fs.readFileSync(process.argv[2],'utf8'),{runScripts:'dangerously',pretendToBeVisual:true});
const w=dom.window,d=w.document;const errs=[];w.addEventListener('error',e=>errs.push(e.message));
setTimeout(()=>{try{
 console.log('valley paths total:',d.querySelectorAll('.valley').length,'(expect 3)');
 const V=w._valley;
 d.getElementById('viewV').dispatchEvent(new w.Event('click'));
 setTimeout(()=>{
  console.log('valleys shown; zoomed out ->',JSON.stringify(V.tiers()));
  const BB=w._bb().BB;
  w.zoomTo(BB.x+BB.w/2,BB.y+BB.h/2,2.2); V.gate();
  console.log('mid zoom ->',JSON.stringify(V.tiers()));
  w.zoomTo(BB.x+BB.w/2,BB.y+BB.h/2,5); V.gate();
  console.log('deep zoom ->',JSON.stringify(V.tiers()));
  d.getElementById('viewV').dispatchEvent(new w.Event('click'));
  setTimeout(()=>{
   console.log('valleys off, branches hidden:',JSON.stringify(V.tiers()));
   console.log('ERRORS:',errs.length?errs.join('|'):'none');
  },60);
 },80);
}catch(e){console.log('THREW:',e.message);}},2600);
