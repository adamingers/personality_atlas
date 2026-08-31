const fs=require('fs'),{JSDOM}=require('jsdom');
const dom=new JSDOM(fs.readFileSync(process.argv[2],'utf8'),{runScripts:'dangerously',pretendToBeVisual:true});
const w=dom.window,d=w.document;
setTimeout(()=>{
 const pb=d.getElementById('pbody');
 console.log('pbody h4s:',[...pb.querySelectorAll('h4')].map(x=>x.textContent.slice(0,32)));
 console.log('convBrowser defined:',typeof w.convBrowser);
 console.log('conv_meta len:',w.DATA?w.DATA.conv_meta.length:'no DATA');
 console.log('meta[0] name:',w.DATA?w.DATA.conv_meta[0].name:'-');
 const tabs=[...d.querySelectorAll('.tab')].map(t=>t.textContent.trim());
 console.log('tabs:',tabs);
 // force guide re-render
 if(typeof w.renderInfo==='function'){w.renderInfo();
  console.log('after renderInfo, convrows:',pb.querySelectorAll('.convrow').length);
  console.log('h4s now:',[...pb.querySelectorAll('h4')].map(x=>x.textContent.slice(0,30)));}
},2600);
