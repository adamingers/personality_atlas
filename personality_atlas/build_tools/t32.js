const fs=require('fs'),{JSDOM}=require('jsdom');
const dom=new JSDOM(fs.readFileSync(process.argv[2],'utf8'),{runScripts:'dangerously',pretendToBeVisual:true});
const w=dom.window,d=w.document;
setTimeout(()=>{
 const pb=d.getElementById('pbody');
 // profiles must keep FULL names while map labels are short

 const id=(function(){for(let i=0;i<779;i++){const n=w._names(i);if(n.short)return i;}return 0;})();
 w.showTrait(+id);
 setTimeout(()=>{
  const N=w._names(+id), full=N.full, short=N.short;
  console.log('trait',id,'| full:',JSON.stringify(full),'| short:',JSON.stringify(short));
  console.log('profile shows FULL name:',(pb.querySelector('h2')||{}).textContent===full);
  const lab=[...d.querySelectorAll('.tlabel')].find(t=>t.textContent===short);
  console.log('map label shows SHORT name:',!!lab);
  // correlate rows and lists use full names
  const rows=[...pb.querySelectorAll('.row[data-t]')].slice(0,3).map(r=>r.textContent.trim());
  console.log('correlate rows use full names:',rows.some(r=>r.length>0),rows.slice(0,2));
 },250);
},2600);
