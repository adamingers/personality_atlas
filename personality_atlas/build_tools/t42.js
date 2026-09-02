const fs=require('fs'),{JSDOM}=require('jsdom');
const dom=new JSDOM(fs.readFileSync(process.argv[2],'utf8'),{runScripts:'dangerously',pretendToBeVisual:true});
const w=dom.window,d=w.document;
setTimeout(()=>{
 const key=d.getElementById('key');
 console.log('key children:',[...key.children].map(c=>(c.tagName+(c.id?'#'+c.id:'')+(c.className?'.'+c.className:''))).join(' | '));
 const rail=d.getElementById('moderail');
 ['humor','com','conv','field'].forEach(m=>{
  rail.querySelector('[data-m="'+m+'"]').dispatchEvent(new w.Event('click'));
  const vis=[...key.children].filter(c=>w.getComputedStyle(c).display!=='none'&&c.style.display!=='none')
    .map(c=>c.id||c.tagName+'.'+c.className);
  console.log(m,'-> visible key blocks:',vis.join(', '));
 });
},2600);
