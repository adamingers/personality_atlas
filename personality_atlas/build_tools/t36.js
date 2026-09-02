const fs=require('fs'),{JSDOM}=require('jsdom');
const dom=new JSDOM(fs.readFileSync(process.argv[2],'utf8'),{runScripts:'dangerously',pretendToBeVisual:true});
const w=dom.window,d=w.document;const errs=[];w.addEventListener('error',e=>errs.push(e.message));
setTimeout(()=>{
 const ax=w._ax,pb=d.getElementById('pbody'),pl=d.getElementById('plbody');
 // which labels are visible at rest?
 const vis=[...d.querySelectorAll('.tlabel')].filter(t=>!t.classList.contains('lp'));
 console.log('labels always visible (r>=7.5):',vis.length,'| sample:',vis.slice(0,6).map(t=>t.textContent));
 // COMPARE: click a correlated trait row
 w.showTrait(5);
 setTimeout(()=>{ w.showTrait(9);
  setTimeout(()=>{
   d.getElementById('cmpBtn').dispatchEvent(new w.Event('click'));
   let s=ax.state(); console.log('seeded A=',s.cmpA,'B=',s.cmpB,'| target=',ax.tgt());
   const rows=[...pl.querySelectorAll('.row[data-t]')];
   console.log('correlate rows in LEFT card:',rows.length);
   if(rows.length){
    const target=+rows[0].dataset.t;
    console.log('clicking correlate id',target);
    rows[0].dispatchEvent(new w.Event('click',{bubbles:true}));
    setTimeout(()=>{
     const s2=ax.state();
     console.log('after click: A=',s2.cmpA,'B=',s2.cmpB,'(expected one side ==',target,')');
     console.log('  still in compare:',s2.cmpOn);
     console.log('ERRORS:',errs.length?errs.join('|'):'none');
    },250);
   } else { console.log('NO correlate rows to click'); }
  },300);
 },300);
},2600);
