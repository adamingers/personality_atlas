const fs=require('fs'),{JSDOM}=require('jsdom');
const dom=new JSDOM(fs.readFileSync(process.argv[2],'utf8'),{runScripts:'dangerously',pretendToBeVisual:true});
const w=dom.window,d=w.document;const errs=[];w.addEventListener('error',e=>errs.push(e.message));
setTimeout(()=>{
 const rail=d.getElementById('moderail'), btns=rail.querySelector('.railbtns');
 console.log('rail button order:',[...btns.children].map(b=>b.id||b.textContent.trim()).join(' | '));
 console.log('keyBtn is last in the button stack:',btns.lastElementChild.id==='keyBtn');
 console.log('key panel is below the buttons:',rail.lastElementChild.id==='key');
 console.log('keyBtn still in the bar?',!!d.getElementById('bar').querySelector('#keyBtn'));
 // toggle still works
 const key=d.getElementById('key'), kb=d.getElementById('keyBtn');
 kb.dispatchEvent(new w.Event('click',{bubbles:true}));
 setTimeout(()=>{
  const hidden=w.getComputedStyle(key).display==='none';
  console.log('key hides from the rail button:',hidden);
  kb.dispatchEvent(new w.Event('click',{bubbles:true}));
  setTimeout(()=>{
   console.log('and reopens:',w.getComputedStyle(key).display!=='none');
   console.log('ERRORS:',errs.length?errs.join('|'):'none');
  },60);
 },60);
},2600);
