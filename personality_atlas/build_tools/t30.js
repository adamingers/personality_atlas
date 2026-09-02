const fs=require('fs'),{JSDOM}=require('jsdom');
const dom=new JSDOM(fs.readFileSync(process.argv[2],'utf8'),{runScripts:'dangerously',pretendToBeVisual:true});
const w=dom.window,d=w.document;const errs=[];w.addEventListener('error',e=>errs.push(e.message));
setTimeout(()=>{try{
 // junk text
 const bar=d.getElementById('bar');
 console.log('junk escapes in bar:',/\\x[0-9a-f]{2}/i.test(bar.textContent));
 console.log('grid btn label:',JSON.stringify(d.getElementById('gridBtn').textContent));
 console.log('field btn exists in bar:',!!d.getElementById('fieldBtn'));
 // button order
 const kids=[...bar.querySelectorAll('button,a,input')].map(x=>x.id||x.textContent.trim().slice(0,10));
 console.log('bar order:',kids.join(' | '));
 // rail
 const rail=d.getElementById('moderail');
 console.log('rail present:',!!rail,'| mode buttons:',rail.querySelectorAll('.modebtn').length,
   '| key inside rail:',rail.contains(d.getElementById('key')));
 console.log('   labels:',[...rail.querySelectorAll('.modebtn')].map(b=>b.textContent));
 // mode exclusivity + key swap
 const M=w._mode, bk=d.getElementById('basekey'),ck=d.getElementById('convkey'),fk=d.getElementById('fieldkey');
 const vis=e=>e&&e.style.display!=='none';
 console.log('humor: base',vis(bk),'conv',vis(ck),'field',vis(fk));
 rail.querySelector('[data-m="conv"]').dispatchEvent(new w.Event('click'));
 console.log('conv:  base',vis(bk),'conv',vis(ck),'field',vis(fk),'| convOn',w._ax?'':'','fieldOn',w._field.on());
 rail.querySelector('[data-m="field"]').dispatchEvent(new w.Event('click'));
 console.log('field: base',vis(bk),'conv',vis(ck),'field',vis(fk),'| fieldOn',w._field.on());
 rail.querySelector('[data-m="humor"]').dispatchEvent(new w.Event('click'));
 console.log('back to humor: base',vis(bk),'| fieldOn',w._field.on());
 console.log('base key rows:',bk?bk.querySelectorAll('li').length:0);
 console.log('ERRORS:',errs.length?errs.join('|'):'none');
}catch(e){console.log('THREW:',e.message);}},2600);
