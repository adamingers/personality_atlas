const fs=require('fs'),{JSDOM}=require('jsdom');
const dom=new JSDOM(fs.readFileSync(process.argv[2],'utf8'),{runScripts:'dangerously',pretendToBeVisual:true});
const w=dom.window,d=w.document;const errs=[];w.addEventListener('error',e=>errs.push(e.message));
setTimeout(()=>{try{
 const q=d.getElementById('q'),S=w._search;
 function type(v){q.value=v;q.dispatchEvent(new w.Event('input'));return S.items();}
 for(const term of ['psychot','Psychoticism','teacher','liveli','bold']){
  const it=type(term);
  console.log('\n"'+term+'" ->',it.length,'suggestions');
  it.forEach(x=>console.log('    ['+x.k+'] '+x.label+'  —  '+(x.sub||'')));
 }
 // selecting one navigates
 type('psychot');
 const row=d.querySelectorAll('.sgrow')[1];
 console.log('\nrows rendered:',d.querySelectorAll('.sgrow').length);
 row.dispatchEvent(new w.MouseEvent('mousedown',{bubbles:true}));
 setTimeout(()=>{
  console.log('after picking row 2 ->',(d.getElementById('pbody').querySelector('h2')||{}).textContent);
  console.log('ERRORS:',errs.length?errs.join('|'):'none');
 },250);
}catch(e){console.log('THREW:',e.message);}},2600);
