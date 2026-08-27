const fs=require('fs'),{JSDOM}=require('jsdom');
const f=process.argv[2];
const dom=new JSDOM(fs.readFileSync(f,'utf8'),{runScripts:'dangerously',pretendToBeVisual:true});
const w=dom.window,d=w.document;const errs=[];w.addEventListener('error',e=>errs.push(e.message));
setTimeout(()=>{
 console.log(f.split('/').pop(),
  '| traits',d.querySelectorAll('.tn').length||w._ax.traits().length,
  '| lock',!!d.getElementById('lockBtn'),
  '| compare',!!d.getElementById('cmpBtn'),
  '| lasso',!!d.getElementById('lassoBtn'),
  '| conv',!!d.getElementById('convBtn'),
  '| counts',!!d.getElementById('atlascount'),
  '| ERRORS:',errs.length?errs.join('|'):'none');
},2500);
