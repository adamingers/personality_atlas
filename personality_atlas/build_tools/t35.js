const fs=require('fs'),{JSDOM}=require('jsdom');
const dom=new JSDOM(fs.readFileSync(process.argv[2],'utf8'),{runScripts:'dangerously',pretendToBeVisual:true});
const w=dom.window,d=w.document;const errs=[];w.addEventListener('error',e=>errs.push(e.message));
setTimeout(()=>{
 // 1. are short labels actually on the map?
 const SL=(function(){try{return w._names(4);}catch(e){return null;}})();
 console.log('names hook:',JSON.stringify(SL));
 const labs=[...d.querySelectorAll('.tlabel')].map(t=>t.textContent);
 console.log('label count:',labs.length,'| mean len:',(labs.reduce((s,x)=>s+x.length,0)/labs.length).toFixed(1));
 console.log('sample labels:',labs.slice(0,8));
 console.log('short_labels in DATA:',(function(){try{return Object.keys(w._names(4)).length&&!!w._names(4).short;}catch(e){return 'err';}})());
 // 2. convergence colours after clicking the rail button
 const rail=d.getElementById('moderail');
 rail.querySelector('[data-m="conv"]').dispatchEvent(new w.Event('click'));
 const f={};[...d.querySelectorAll('circle.tnode')].forEach(c=>{const x=c.getAttribute('fill');f[x]=(f[x]||0)+1;});
 console.log('conv fills:',JSON.stringify(f));
 console.log('ERRORS:',errs.length?errs.join('|'):'none');
},2600);
