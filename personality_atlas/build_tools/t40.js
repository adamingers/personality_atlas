const fs=require('fs'),{JSDOM}=require('jsdom');
const dom=new JSDOM(fs.readFileSync(process.argv[2],'utf8'),{runScripts:'dangerously',pretendToBeVisual:true});
const w=dom.window,d=w.document;const errs=[];w.addEventListener('error',e=>errs.push(e.message));
const tal=()=>{const f={};[...d.querySelectorAll('circle.tnode')].forEach(c=>{const x=c.getAttribute('fill');f[x]=(f[x]||0)+1;});return f;};
setTimeout(()=>{try{
 const rail=d.getElementById('moderail'), pick=m=>rail.querySelector('[data-m="'+m+'"]').dispatchEvent(new w.Event('click'));
 console.log('rail:',[...d.querySelectorAll('.modebtn')].map(b=>b.textContent).join(' | '));
 // labels survive zoom changes
 const find=n=>[...d.querySelectorAll('.tlabel')].map(t=>t.textContent).filter(x=>x.includes(n));
 console.log('long label before zoom:',find('Charismatic').length,'| short present:',find('RED-YELLOW').length);
 const BB=w._bb().BB;
 for(const k of [1.5,3,6,10]) w.zoomTo(BB.x+BB.w/2,BB.y+BB.h/2,k);
 console.log('after zooming, unshortened labels:',find('Charismatic').length,'| Contentment:',find('Contentment').length);
 console.log('sample labels now:',w._labels().sample);
 // community mode
 pick('com'); const c=tal();
 console.log('COMMUNITY distinct fills:',Object.keys(c).length,'(expect 16)');
 console.log('  comkey rows:',d.getElementById('comkey').querySelectorAll('li').length,'visible:',d.getElementById('comkey').style.display!=='none');
 pick('humor');
 console.log('TEMPERAMENT distinct:',Object.keys(tal()).length,'| basekey visible:',d.getElementById('basekey').style.display!=='none');
 // hormone key
 d.getElementById('viewH').dispatchEvent(new w.Event('click'));
 setTimeout(()=>{
  const hk=d.getElementById('hormkey');
  console.log('hormone view -> hormkey visible:',hk.style.display!=='none','rows:',hk.querySelectorAll('li').length);
  console.log('  other keys hidden:',d.getElementById('basekey').style.display==='none');
  d.getElementById('viewT').dispatchEvent(new w.Event('click'));
  setTimeout(()=>{
   console.log('back to temperament -> hormkey hidden:',d.getElementById('hormkey').style.display==='none',
     '| basekey back:',d.getElementById('basekey').style.display!=='none');
   console.log('ERRORS:',errs.length?errs.join('|'):'none');
  },150);
 },150);
}catch(e){console.log('THREW:',e.message);}},2600);
