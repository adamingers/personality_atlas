const fs=require('fs'),{JSDOM}=require('jsdom');
const dom=new JSDOM(fs.readFileSync(process.argv[2],'utf8'),{runScripts:'dangerously',pretendToBeVisual:true});
const w=dom.window,d=w.document;const errs=[];w.addEventListener('error',e=>errs.push(e.message));
setTimeout(()=>{try{
 const g=w._grid, btn=d.getElementById('gridBtn'), hud=d.getElementById('gridhud');
 console.log('prefix:',g.pfx,'| cell size:',g.cell);
 console.log('grid off at start:',!g.on(),'| lines:',d.querySelectorAll('.gridline').length);
 btn.dispatchEvent(new w.Event('click'));
 console.log('after toggle: on',g.on(),'| lines',d.querySelectorAll('.gridline').length,'| labels',d.querySelectorAll('.gridlab').length);
 console.log('hud visible:',hud.style.display!=='none','| hud text:',hud.textContent.trim());
 const labs=[...d.querySelectorAll('.gridlab')].slice(0,6).map(t=>t.textContent);
 console.log('sample cells:',labs.join(', '));
 // same world point must give the same code shape on both charts
 console.log('name at (0,0):',g.name(0,0),'| at (600,-400):',g.name(600,-400));
 // zoom updates the hud
 const BB=w._bb().BB;
 w.zoomTo(BB.x+BB.w*0.25,BB.y+BB.h*0.25,6);
 console.log('after zoom, hud:',hud.textContent.trim());
 btn.dispatchEvent(new w.Event('click'));
 console.log('toggled off: lines',d.querySelectorAll('.gridline').length,'| hud hidden',hud.style.display==='none');
 console.log('ERRORS:',errs.length?errs.join('|'):'none');
}catch(e){console.log('THREW:',e.message);}},2600);
