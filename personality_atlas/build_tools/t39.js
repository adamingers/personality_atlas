const fs=require('fs'),{JSDOM}=require('jsdom');
const dom=new JSDOM(fs.readFileSync(process.argv[2],'utf8'),{runScripts:'dangerously',pretendToBeVisual:true});
const w=dom.window,d=w.document;const errs=[];w.addEventListener('error',e=>errs.push(e.message));
const CV=['#7b3fa0','#2a8fbd','#e0952a','#b0aca4'];
function tal(){const f={};[...d.querySelectorAll('circle.tnode')].forEach(c=>{const x=c.getAttribute('fill');f[x]=(f[x]||0)+1;});return f;}
function isConv(){const f=tal();return Object.keys(f).every(k=>CV.includes(k));}
setTimeout(()=>{
 const rail=d.getElementById('moderail');
 rail.querySelector('[data-m="conv"]').dispatchEvent(new w.Event('click'));
 console.log('after switching to Convergence, all fills are tier colours:',isConv(),JSON.stringify(tal()));
 w.showTrait(5);
 setTimeout(()=>{
  console.log('after clicking a trait, still tier colours:',isConv());
  w.lightWord('bold');
  console.log('after selecting a word, still tier colours:',isConv());
  d.getElementById('viewH').dispatchEvent(new w.Event('click'));
  setTimeout(()=>{
   console.log('hormone view fills (expected hormone colours):',Object.keys(tal()).length,'distinct');
   d.getElementById('viewT').dispatchEvent(new w.Event('click'));
   setTimeout(()=>{
    console.log('back from hormone view, tier colours restored:',isConv(),JSON.stringify(tal()));
    d.getElementById('rst').dispatchEvent(new w.Event('click'));
    setTimeout(()=>{
     console.log('after reset, tier colours:',isConv(),JSON.stringify(tal()));
     console.log('ERRORS:',errs.length?errs.join('|'):'none');
    },200);
   },200);
  },200);
 },250);
},2600);
