const fs=require('fs'),{JSDOM}=require('jsdom');
const dom=new JSDOM(fs.readFileSync(process.argv[2],'utf8'),{runScripts:'dangerously',pretendToBeVisual:true});
const w=dom.window,d=w.document;const errs=[];w.addEventListener('error',e=>errs.push(e.message));
setTimeout(()=>{try{
 const ax=w._ax,pb=d.getElementById('pbody'),pl=d.getElementById('plbody');
 // view two traits, then open compare -> should seed both from history
 w.showTrait(5);
 setTimeout(()=>{ w.showTrait(9);
  setTimeout(()=>{
   d.getElementById('cmpBtn').dispatchEvent(new w.Event('click'));
   const s=ax.state();
   console.log('compare seeded from history: A=',s.cmpA,'B=',s.cmpB,'(expect 5 and 9)');
   console.log('   left:',(pl.querySelector('h2')||{}).textContent,'| right:',(pb.querySelector('.ccard h2')||{}).textContent);
   console.log('   both target buttons:',d.querySelectorAll('.tgtb').length);
   // adjective -> compare side
   const send=pl.querySelector('.sendw');
   console.log('   send-to-compare arrows on adjectives:',pl.querySelectorAll('.sendw').length);
   if(send){send.dispatchEvent(new w.Event('click',{bubbles:true}));
    const s2=ax.state();
    console.log('after sending an adjective: A=',s2.cmpA,'B=',s2.cmpB);
    const h2=(pb.querySelector('.ccard h2')||{}).textContent;
    console.log('   right card is the adjective:',h2);
    console.log('   shows count/def/nearest:',pb.innerHTML.includes('% of the atlas'),pb.querySelectorAll('.ccard .adj').length>0);
    console.log('   trait list ranked with bands:',pb.querySelectorAll('.ccard .rband').length>0);
    console.log('   overlap classes applied:',d.querySelectorAll('.ov-both,.ov-near,.ov-only').length);
   }
   console.log('ERRORS:',errs.length?errs.join('|'):'none');
  },300);
 },300);
}catch(e){console.log('THREW:',e.message);}},2600);
