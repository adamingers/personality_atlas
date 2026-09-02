const fs=require('fs'),{JSDOM}=require('jsdom');
const dom=new JSDOM(fs.readFileSync(process.argv[2],'utf8'),{runScripts:'dangerously',pretendToBeVisual:true});
const w=dom.window,d=w.document;
setTimeout(()=>{
 const BB=w._bb().BB;
 const labs=()=>[...d.querySelectorAll('.tlabel')].map(t=>t.textContent);
 const bad=()=>labs().filter(x=>/Charismatic|Contentment|Energetic Producer|— The/.test(x));
 console.log('at rest, long labels:',bad().length);
 for(const k of [1.2,2,4,8,12]){ w.zoomTo(BB.x+BB.w/2,BB.y+BB.h/2,k);
   console.log('  zoom',k,'-> long labels:',bad().length,'| mean len',(labs().reduce((s,x)=>s+x.length,0)/779).toFixed(1)); }
 const s=labs();
 console.log('samples:',s.filter(x=>x.includes('YELLOW')||x.includes('Inquisit')).slice(0,4));
},2600);
