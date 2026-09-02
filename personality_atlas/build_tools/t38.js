const fs=require('fs'),{JSDOM}=require('jsdom');
const dom=new JSDOM(fs.readFileSync(process.argv[2],'utf8'),{runScripts:'dangerously',pretendToBeVisual:true});
const w=dom.window,d=w.document;const errs=[];w.addEventListener('error',e=>errs.push(e.message));
setTimeout(()=>{
 const ax=w._ax,pl=d.getElementById('plbody'),pb=d.getElementById('pbody');
 console.log('rail labels:',[...d.querySelectorAll('.modebtn')].map(b=>b.textContent));
 w.showTrait(5);
 setTimeout(()=>{ w.showTrait(9);
  setTimeout(()=>{
   d.getElementById('cmpBtn').dispatchEvent(new w.Event('click'));
   let s=ax.state(); console.log('seeded A=',s.cmpA,'B=',s.cmpB,'target=',ax.tgt());
   const rows=[...pl.querySelectorAll('.corr-row[data-t]')];
   console.log('correlate rows in left card:',rows.length);
   const target=+rows[0].dataset.t;
   rows[0].dispatchEvent(new w.Event('click',{bubbles:true}));
   setTimeout(()=>{
    let s2=ax.state();
    console.log('clicked correlate',target,'-> A=',s2.cmpA,'B=',s2.cmpB);
    // aim left, click another correlate
    [...d.querySelectorAll('.tgtb')].find(b=>b.dataset.tgt==='L').dispatchEvent(new w.Event('click'));
    const rows2=[...pb.querySelectorAll('.corr-row[data-t]')];
    if(rows2.length){const t2=+rows2[0].dataset.t;
     rows2[0].dispatchEvent(new w.Event('click',{bubbles:true}));
     setTimeout(()=>{const s3=ax.state();
      console.log('aimed LEFT, clicked correlate',t2,'-> A=',s3.cmpA,'B=',s3.cmpB);
      console.log('ERRORS:',errs.length?errs.join('|'):'none');},250);}
   },250);
  },300);
 },300);
},2600);
