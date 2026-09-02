const fs=require('fs'),path=require('path'),{JSDOM}=require('jsdom');
const dir=process.argv[2];
// 1. landing page: links resolve to files that exist
const idx=fs.readFileSync(path.join(dir,'index.html'),'utf8');
const links=[...idx.matchAll(/href="([^"]+)"/g)].map(m=>m[1]).filter(h=>!h.startsWith('http')&&!h.startsWith('#'));
console.log('landing links:',links.join(', '));
links.forEach(l=>console.log('   ',l,fs.existsSync(path.join(dir,l))?'OK':'MISSING'));
// 2. each chart boots and has a working home link
let done=0;
['cooked.html','harvested.html'].forEach(f=>{
 const dom=new JSDOM(fs.readFileSync(path.join(dir,f),'utf8'),{runScripts:'dangerously',pretendToBeVisual:true});
 const w=dom.window,d=w.document;const errs=[];w.addEventListener('error',e=>errs.push(e.message));
 setTimeout(()=>{
  const hb=d.getElementById('homeBtn');
  console.log(f,'| traits',w._ax?w._ax.traits().length:'?',
   '| home link',hb?hb.getAttribute('href'):'MISSING',
   '| target exists',hb?fs.existsSync(path.join(dir,hb.getAttribute('href'))):false,
   '| home is first in ctrl',hb?d.getElementById('ctrl').firstElementChild===hb:false,
   '| ERRORS:',errs.length?errs.join('|'):'none');
  if(++done===2)process.exit(0);
 },2600);
});
