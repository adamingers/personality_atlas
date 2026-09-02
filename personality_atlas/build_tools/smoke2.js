const fs = require('fs');
const { JSDOM } = require('jsdom');

const file = process.argv[2];
const html = fs.readFileSync(file, 'utf-8');
const errors = [];
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true });
const { window } = dom;
window.SVGElement.prototype.getBBox = () => ({ x: 0, y: 0, width: 10, height: 10 });
window.addEventListener('error', e => errors.push(e.message));

setTimeout(() => {
  const doc = window.document;
  const $ = s => doc.querySelectorAll(s);
  const counts = {
    tnodes: $('.tnode').length,
    anodes: $('.anode').length,
    threads: $('.thread').length,
    dividers: $('.divider').length,
    bandtints: $('.bandtint').length,
    hubframes: $('.hubframe').length,
    transition: [...$('text')].filter(t => t.textContent === 'Transition').length,
    unity: [...$('text')].filter(t => t.textContent === 'Unity').length,
  };
  console.log(counts);

  // exercise tabs
  ['conn', 'theo', 'field', 'info'].forEach(t => {
    const b = [...$('.tab')].find(b => b.dataset.t === t);
    if (b) b.dispatchEvent(new window.Event('click', { bubbles: true }));
  });
  console.log('field rows:', $('#pbody .row').length ? 'rendered' : 'MISSING');

  // fit filters
  const fitgo = doc.getElementById('fitgo');
  doc.getElementById('fitfam').value = 'A';
  fitgo.dispatchEvent(new window.Event('click', { bubbles: true }));
  console.log('fitFilter rows:', $('#pbody .row').length);
  // back to info to get cluster filter controls
  [...$('.tab')].find(b => b.dataset.t === 'info').dispatchEvent(new window.Event('click', { bubbles: true }));
  const clgo = doc.getElementById('clgo');
  console.log('cluster options:', doc.getElementById('clsel').options.length);
  clgo.dispatchEvent(new window.Event('click', { bubbles: true }));
  console.log('clusterFitFilter rows:', $('#pbody .row').length);

  // NEW: confidence toggle
  const vc = doc.getElementById('viewC');
  vc.dispatchEvent(new window.Event('click', { bubbles: true }));
  const faded = [...$('.tnode')].filter(n => n.hasAttribute('fill-opacity')).length;
  const lowconf = $('.tnode.lowconf').length;
  console.log('confidence ON: faded =', faded, 'lowconf rings =', lowconf);
  vc.dispatchEvent(new window.Event('click', { bubbles: true }));
  console.log('confidence OFF: faded =', [...$('.tnode')].filter(n => n.hasAttribute('fill-opacity')).length);

  // NEW: lens mode via showTrait (click first trait circle path: use eval in page)
  window.eval('showTrait(0)');
  console.log('lens spokes:', $('.lens').length, 'lens labels:', $('.lenslab').length,
              'lit2 correlates:', $('.lit2').length, 'lensvis labels:', $('.lensvis').length);
  const conf_in_panel = doc.getElementById('pbody').textContent.includes('placement confidence');
  console.log('conf shown in profile:', conf_in_panel);
  window.eval('clearL()');
  console.log('after clearL, lens spokes:', $('.lens').length);

  // thread widths now variable for cross words
  const widths = new Set([...$('.thread')].map(t => t.getAttribute('stroke-width')));
  console.log('distinct thread widths:', [...widths].sort().join(', '));


  // §16 step-4 additions
  try {
    // hub occupants
    const hub = window.eval('DATA.traits.filter(t=>t.q==="HUB").length');
    console.log('hub occupants:', hub);
    // traits outside their family box (cooked only)
    if (window.eval('typeof DATA.boxes')!=='undefined' && window.eval('DATA.boxes && DATA.boxes.A ? 1 : 0')) {
      const out = window.eval(`(()=>{let n=0;for(const t of DATA.traits){const b=DATA.boxes[t.q];if(!b)continue;if(t.x<b[0]||t.x>b[0]+b[2]||t.y<b[1]||t.y>b[1]+b[2])n++}return n})()`);
      console.log('traits outside boxes:', out);
    }
    // zodiac trait lens
    const zid = window.eval('DATA.traits.find(t=>t.system && t.system.indexOf("Western Zodiac")===0).id');
    window.eval('showTrait('+zid+')');
    console.log('zodiac lens spokes:', doc.querySelectorAll('.lens').length,
                '| profile has def:', doc.getElementById('pbody').textContent.length > 200);
    window.eval('clearL()');
    // theorist overview + rows for Western Zodiac
    const rows = window.eval('DATA.theorist_index["Western Zodiac (Tropical Signs)"].length');
    const ov = window.eval('(DATA.theorist_overviews["Western Zodiac (Tropical Signs)"]||"").length');
    console.log('WZ theorist rows:', rows, '| overview chars:', ov);
    const astro = window.eval('DATA.field_index.some(f=>f.field==="Astrology & Cosmology")');
    console.log('Astrology field present:', astro);
    const nd = window.eval('DATA.adj_defs["iterative"] ? 1 : 0');
    console.log('new-word def present (iterative):', nd);
    // harvested extras
    if (window.eval('typeof DATA.harvest')!=='undefined' && window.eval('DATA.harvest?1:0')) {
      console.log('polygons at rest:', doc.querySelectorAll('#gLens polygon, polygon').length);
      window.eval('typeof highlightCommunity==="function" && highlightCommunity(0)');
      console.log('after spotlight polygons:', doc.querySelectorAll('polygon').length);
      console.log('valley paths:', doc.querySelectorAll('.valley').length);
      console.log('blob circles:', window.eval('DATA.harvest.blobs.length'));
    }
  } catch(e){ console.log('EXTRA-ERR', e.message); }

  console.log('ERRORS:', errors.length ? errors : 'none');
}, 300);
