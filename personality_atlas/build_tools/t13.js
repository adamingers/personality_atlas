const fs=require('fs'),{JSDOM}=require('jsdom');
const dom=new JSDOM(fs.readFileSync(process.argv[2],'utf8'),{runScripts:'dangerously',pretendToBeVisual:true});
const w=dom.window,d=w.document;const errs=[];w.addEventListener('error',e=>errs.push(e.message));
setTimeout(()=>{try{
 const pb=d.getElementById('pbody');
 // counts in the note
 const cl=d.getElementById('atlascount');
 console.log('count line:',cl?cl.textContent.trim():'MISSING');
 // theorist tab
 const tabs=[...d.querySelectorAll('.tab')];
 (tabs.find(t=>/theor/i.test(t.textContent))||tabs[1]).dispatchEvent(new w.Event('click'));
 const rows=[...pb.querySelectorAll('.theog')];
 console.log('theorist rows:',rows.length,'(expect 66)');
 console.log('first 6:',rows.slice(0,6).map(r=>r.textContent.trim().slice(0,34)));
 const klages=rows.filter(r=>/Klages/.test(r.textContent));
 console.log('Klages entries:',klages.length,'|',klages.map(r=>r.textContent.trim().slice(0,42)));
 const cattell=rows.filter(r=>/Cattell/.test(r.textContent));
 console.log('Cattell entries:',cattell.length,'|',cattell.map(r=>r.textContent.trim().slice(0,42)));
 // drill in
 klages[0].dispatchEvent(new w.Event('click'));
 console.log('opened:',(pb.querySelector('h2')||{}).textContent,'| section rows:',pb.querySelectorAll('.secrow').length,'| lit traits:',d.querySelectorAll('circle.lit').length);
 console.log('   sections:',[...pb.querySelectorAll('.secrow')].map(e=>e.textContent.trim().slice(0,40)));
 pb.querySelector('.secrow').dispatchEvent(new w.Event('click'));
 console.log('after section click:',(pb.querySelector('h2')||{}).textContent,'| lit:',d.querySelectorAll('circle.lit').length);
 // single-system theorist goes straight in
 (tabs.find(t=>/theor/i.test(t.textContent))||tabs[1]).dispatchEvent(new w.Event('click'));
 const single=[...pb.querySelectorAll('.theog')].find(r=>!/sections/.test(r.textContent));
 single.dispatchEvent(new w.Event('click'));
 console.log('single-system opens directly:',(pb.querySelector('h2')||{}).textContent,'| secrows:',pb.querySelectorAll('.secrow').length);
 console.log('ERRORS:',errs.length?errs.join('|'):'none');
}catch(e){console.log('THREW:',e.message);}},2500);
