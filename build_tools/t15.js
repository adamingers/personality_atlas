const fs=require('fs'),{JSDOM}=require('jsdom');
const dom=new JSDOM(fs.readFileSync(process.argv[2],'utf8'),{runScripts:'dangerously',pretendToBeVisual:true});
const w=dom.window,d=w.document;const errs=[];w.addEventListener('error',e=>errs.push(e.message));
setTimeout(()=>{try{
 const st=w._bb(); const BB=st.BB;
 console.log('content bounds:',JSON.stringify({x:Math.round(BB.x),y:Math.round(BB.y),w:Math.round(BB.w),h:Math.round(BB.h)}));
 const zout=d.getElementById('zout'), zin=d.getElementById('zin');
 for(let i=0;i<25;i++) zout.dispatchEvent(new w.Event('click'));
 let v=w._bb().vb;
 console.log('after 25 zoom-outs: w=',Math.round(v.w),'h=',Math.round(v.h),'| capped at bounds:',v.w<=Math.round(BB.w)+1&&v.h<=Math.round(BB.h)+1);
 console.log('   centred:',Math.abs((v.x+v.w/2)-(BB.x+BB.w/2))<2&&Math.abs((v.y+v.h/2)-(BB.y+BB.h/2))<2);
 // zoom in, then try to pan far outside
 w.zoomTo(BB.x+BB.w/2, BB.y+BB.h/2, 6);
 v=w._bb().vb; console.log('zoomed in: w=',Math.round(v.w));
 w.zoomTo(BB.x-99999, BB.y-99999, 6);
 v=w._bb().vb;
 const inside = v.x>=BB.x-1 && v.y>=BB.y-1 && v.x+v.w<=BB.x+BB.w+1 && v.y+v.h<=BB.y+BB.h+1;
 console.log('pan far top-left clamped inside bounds:',inside,'| x=',Math.round(v.x),'y=',Math.round(v.y));
 w.zoomTo(BB.x+BB.w+99999, BB.y+BB.h+99999, 6);
 v=w._bb().vb;
 console.log('pan far bottom-right clamped:',v.x+v.w<=BB.x+BB.w+1 && v.y+v.h<=BB.y+BB.h+1);
 // still zoomable in
 for(let i=0;i<6;i++) zin.dispatchEvent(new w.Event('click'));
 v=w._bb().vb; console.log('zoom-in still works: w=',Math.round(v.w));
 // panel spacing
 console.log('pbody padding-top:',w.getComputedStyle(d.getElementById('pbody')).paddingTop,
             '| plbody:',w.getComputedStyle(d.getElementById('plbody')).paddingTop);
 console.log('ERRORS:',errs.length?errs.join('|'):'none');
}catch(e){console.log('THREW:',e.message);}},2500);
