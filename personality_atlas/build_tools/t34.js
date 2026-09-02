const fs=require('fs'),{JSDOM}=require('jsdom');
const dom=new JSDOM(fs.readFileSync(process.argv[2],'utf8'),{runScripts:'dangerously',pretendToBeVisual:true});
const w=dom.window,d=w.document;const errs=[];w.addEventListener('error',e=>errs.push(e.message));
setTimeout(()=>{try{
 const rail=d.getElementById('moderail');
 const fills=()=>[...d.querySelectorAll('circle.tnode')].map(c=>c.getAttribute('fill'));
 const tally=a=>{const m={};a.forEach(x=>m[x]=(m[x]||0)+1);return m;};
 const pick=m=>rail.querySelector('[data-m="'+m+'"]').dispatchEvent(new w.Event('click'));
 pick('humor');
 let t=tally(fills());
 console.log('HUMOR fills:',JSON.stringify(t));
 console.log('   distinct:',Object.keys(t).length,'(expect 6 families + seam/hub)');
 pick('conv');
 t=tally(fills());
 console.log('CONVERGENCE fills:',JSON.stringify(t));
 console.log('   distinct:',Object.keys(t).length,'(expect 4 tiers)');
 pick('field');
 t=tally(fills());
 console.log('FIELD distinct fills:',Object.keys(t).length,'(hue x era)');
 pick('humor');
 t=tally(fills());
 console.log('back to HUMOR distinct:',Object.keys(t).length);
 // key contents
 const bk=d.getElementById('basekey');
 console.log('humor key rows:',bk.querySelectorAll('li').length,'|',[...bk.querySelectorAll('li')].slice(0,3).map(l=>l.textContent.trim()));
 console.log('ERRORS:',errs.length?errs.join('|'):'none');
}catch(e){console.log('THREW:',e.message);}},2600);
