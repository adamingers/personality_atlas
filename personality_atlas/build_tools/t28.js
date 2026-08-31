const fs=require('fs'),{JSDOM}=require('jsdom');
const dom=new JSDOM(fs.readFileSync(process.argv[2],'utf8'),{runScripts:'dangerously',pretendToBeVisual:true});
const w=dom.window,d=w.document;const errs=[];w.addEventListener('error',e=>errs.push(e.message));
setTimeout(()=>{try{
 // short labels + leaders
 const labs=[...d.querySelectorAll('.tlabel')].map(t=>t.textContent);
 const avg=labs.reduce((s,x)=>s+x.length,0)/labs.length;
 console.log('labels:',labs.length,'| mean length %s'%0===0?'':'','avg',avg.toFixed(1));
 console.log('   truncated with ellipsis:',labs.filter(x=>x.endsWith('\u2026')).length);
 console.log('   leaders drawn:',d.querySelectorAll('.leader').length);
 console.log('   sample:',labs.slice(0,6));
 // field colour
 const F=w._field, btn=d.getElementById('fieldBtn'), fk=d.getElementById('fieldkey');
 btn.dispatchEvent(new w.Event('click'));
 console.log('field view on:',F.on(),'| key visible:',fk.style.display!=='none');
 const fills=[...d.querySelectorAll('circle.tnode')].map(c=>c.getAttribute('fill'));
 console.log('   distinct fills:',new Set(fills).size,'(hue x era)');
 console.log('   sample fills:',[...new Set(fills)].slice(0,4));
 console.log('   key rows:',fk.querySelectorAll('li').length);
 // era shading actually varies within one field
 const T=w.DATA.traits;
 const west=T.filter(t=>t.fld==='Western historical');
 const old=west.filter(t=>t.yr<0)[0], recent=west.filter(t=>t.yr>1900)[0];
 if(old&&recent)console.log('   same field, different era:',F.color(old),'vs',F.color(recent));
 btn.dispatchEvent(new w.Event('click'));
 console.log('toggled off, key hidden:',fk.style.display==='none');
 console.log('ERRORS:',errs.length?errs.join('|'):'none');
}catch(e){console.log('THREW:',e.message);}},2600);
