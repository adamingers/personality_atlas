const fs=require('fs'),{JSDOM}=require('jsdom');
const dom=new JSDOM(fs.readFileSync(process.argv[2],'utf8'),{runScripts:'dangerously',pretendToBeVisual:true});
const w=dom.window,d=w.document;
setTimeout(()=>{
 const pb=d.getElementById('pbody'),pl=d.getElementById('plbody');
 w.showTrait(5);
 setTimeout(()=>{
  console.log('NORMAL profile rows[data-t]:',pb.querySelectorAll('.row[data-t]').length);
  console.log('  h4s:',[...pb.querySelectorAll('h4')].map(x=>x.textContent.slice(0,26)));
  const any=pb.querySelector('.row');
  console.log('  first .row html:',any?any.outerHTML.slice(0,120):'none');
  w.showTrait(9);
  setTimeout(()=>{
   d.getElementById('cmpBtn').dispatchEvent(new w.Event('click'));
   console.log('LEFT card h4s:',[...pl.querySelectorAll('h4')].map(x=>x.textContent.slice(0,26)));
   console.log('LEFT .row total:',pl.querySelectorAll('.row').length,'| with data-t:',pl.querySelectorAll('.row[data-t]').length);
   const r=pl.querySelector('.row');
   console.log('LEFT first .row html:',r?r.outerHTML.slice(0,160):'none');
  },250);
 },250);
},2600);
