const fs=require('fs'),{JSDOM}=require('jsdom');
const dom=new JSDOM(fs.readFileSync(process.argv[2],'utf8'),{runScripts:'dangerously',pretendToBeVisual:true});
const w=dom.window,d=w.document;const errs=[];w.addEventListener('error',e=>errs.push(e.message));
setTimeout(()=>{try{
 const pb=d.getElementById('pbody');
 w.lightWord('bold');
 const rows=[...pb.querySelectorAll('.wrow')];
 console.log('word "bold" traits ranked:',rows.length);
 console.log('   top 3:',rows.slice(0,3).map(r=>r.textContent.trim().slice(0,44)));
 console.log('   bottom 2:',rows.slice(-2).map(r=>r.textContent.trim().slice(0,44)));
 const bands={};[...pb.querySelectorAll('.rband')].forEach(b=>bands[b.textContent]=(bands[b.textContent]||0)+1);
 console.log('   bands:',bands);
 // A-Z toggle
 const az=[...pb.querySelectorAll('.wsort')].find(b=>b.dataset.s==='az');
 az.dispatchEvent(new w.Event('click'));
 const names=[...pb.querySelectorAll('.wrow')].map(r=>r.textContent.replace(/^(core|adjacent|outlier)/,'').trim());
 const sorted=names.slice().sort((a,b)=>a.localeCompare(b));
 console.log('A-Z sort correct:',JSON.stringify(names)===JSON.stringify(sorted));
 console.log('   first 3:',names.slice(0,3));
 // lasso these
 d.getElementById('wlasso').dispatchEvent(new w.Event('click'));
 setTimeout(()=>{
  console.log('lasso-these -> header:',(pb.querySelector('h2')||{}).textContent);
  console.log('   selected:',w._ax.state().sel.length);
  console.log('ERRORS:',errs.length?errs.join('|'):'none');
 },200);
}catch(e){console.log('THREW:',e.message);}},2600);
