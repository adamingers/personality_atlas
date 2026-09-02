const fs=require('fs'),{JSDOM}=require('jsdom');
const dom=new JSDOM(fs.readFileSync(process.argv[2],'utf8'),{runScripts:'dangerously',pretendToBeVisual:true});
const w=dom.window,d=w.document;const errs=[];w.addEventListener('error',e=>errs.push(e.message));
setTimeout(()=>{try{
 const ax=w._ax,pl=d.getElementById('plbody'),pb=d.getElementById('pbody');
 d.getElementById('cmpBtn').dispatchEvent(new w.Event('click'));
 ax.click(11);
 console.log('one side filled: right card heading:',(pb.querySelector('.ccard h2')||{}).textContent,
   '| left still shows slot:',pl.textContent.includes('Empty left'),'| target buttons:',d.querySelectorAll('.tgtb').length);
 ax.click(3);
 console.log('both filled: left:',(pl.querySelector('h2')||{}).textContent,'| right:',(pb.querySelector('.ccard h2')||{}).textContent);
 console.log('  stats present:',!!d.querySelector('.cmpstats'),'| swap present:',!!d.getElementById('cmpSwap'),'| cmpline:',d.querySelectorAll('.cmpline').length);
 // correlate click still replaces aimed side
 const rows=[...pl.querySelectorAll('.corr-row[data-t]')];
 console.log('  correlate rows:',rows.length);
 rows[0].dispatchEvent(new w.Event('click',{bubbles:true}));
 setTimeout(()=>{
  const s=ax.state(); console.log('after correlate click: A=',s.cmpA,'B=',s.cmpB);
  d.getElementById('cmpSwap').dispatchEvent(new w.Event('click'));
  const s2=ax.state(); console.log('swap -> A=',s2.cmpA,'B=',s2.cmpB);
  console.log('ERRORS:',errs.length?errs.join('|'):'none');
 },250);
}catch(e){console.log('THREW:',e.message);}},2600);
