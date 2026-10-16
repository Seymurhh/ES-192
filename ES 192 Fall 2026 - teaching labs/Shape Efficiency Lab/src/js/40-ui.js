/* ===================== UI: tabs, controls, microscope text, charts, presenter, loop ===================== */
const TABIDS=['column','wall','cells','lattice','sheet'];
let cur='column', chartKind='test', microPick=null;
const tabBtns=[...document.querySelectorAll('nav button')];
const MATNAME={steel:'S355 steel',galv:'galvanized steel',al:'aluminium 6061-T6',ti:'printed Ti-6Al-4V',wood:'wood cell walls',wooddense:'packed cell-wall solid',foam:'foam cell walls'};
const GCAP={steel:'Grains · ferrite and pearlite',galv:'Section · zinc coat on ferrite',al:'Grains · polarized light',ti:'Strut section · α′ needles',wood:'Cell walls · along the grain',wooddense:'Cell walls · packed solid',foam:'Open cells'};
const CHT={test:{column:'Load vs sideways bow',wall:'Load vs tip deflection',cells:'Load vs tip deflection',lattice:'Stress vs strain',sheet:'Load vs tip deflection'},
  design:{column:'What the column can carry vs length',wall:'What the tube can carry vs r/t',cells:'Modulus–density chart',lattice:'Modulus–density chart',sheet:'Shape factor vs wave height'}};

function resetView(){if(!HAS3D)return;const v=RIG[cur].view;fitView(new THREE.Vector3(...v.dir),v.lift);}
function setLegend(){const L=RIG[cur].legend;$('legend').hidden=!strainOn||!HAS3D;$('lg-title').textContent=L[0];$('lg-lo').textContent=L[1];$('lg-hi').textContent=L[2];}
function renderMicro(){const Rg=RIG[cur];const i=microPick==null?Rg.auto():Math.min(microPick,Rg.pick.length-1);const s=Rg.story(i);
  MIC.set({mat:s.mat,sign:s.sign,e:s.e,pl:s.pl,fr:s.fr,band:s.band});
  $('m-title').innerHTML=`Inside the ${s.label.toLowerCase()}<small>${MATNAME[s.mat]} · ${s.where}</small>`;
  const k=s.steps.indexOf(s.stage);$('m-steps').innerHTML=s.steps.map((t,j)=>`<span class="${j===k?'on':j<k?'done':''}">${t}</span>`).join('');
  $('w-hd').innerHTML=s.head;$('w-p').innerHTML=s.why;$('w-ms').innerHTML=s.measure;
  $('mg-cap').textContent=GCAP[s.mat];$('ma-cap').textContent=['wood','wooddense','foam'].includes(s.mat)?'Molecules · cellulose chains':'Atoms · one slip plane';
  const names=Rg.pick.map((n,j)=>(Rg.items[j]&&Rg.items[j].name)||n),pk=$('m-pick');
  if(pk.dataset.names!==names.join('|')){pk.dataset.names=names.join('|');pk.innerHTML=names.map((n,j)=>`<button type="button" data-i="${j}">${n}</button>`).join('');}
  pk.hidden=names.length<2;[...pk.children].forEach((b,j)=>b.setAttribute('aria-pressed',j===i));
  zoomPos=(Rg.items[i]&&Rg.items[i].hot)||Rg.hot||null;}
function renderChart(){if(!RIG[cur].S)return;const Rg=RIG[cur],fn=chartKind==='test'?Rg.chartTest:Rg.chartDesign,t=CHT[chartKind][cur];
  $('ch-title').textContent=t;fn.call(Rg,$('ch-svg'),$('ch-leg'));
  if(!$('stagechart').hidden){$('sc-title').textContent=t;fn.call(Rg,$('sc-svg'),$('sc-leg'));}}
function refresh(){RIG[cur].update();renderMicro();renderChart();}
function clearHist(Rg){for(const k of Object.keys(Rg))if(/^hist/.test(k)&&Array.isArray(Rg[k]))Rg[k]=Rg[k].map(()=>0);}
function newSpecimen(){clearHist(RIG[cur]);refresh();MIC.snap();}

function show(id){stopPlay();cur=id;microPick=null;tabBtns.forEach(b=>b.setAttribute('aria-selected',b.dataset.tab===id));
  document.querySelectorAll('[data-panel]').forEach(el=>el.hidden=el.dataset.panel!==id);
  RIG[id].build();RIG[id].update();resetView();setLegend();renderMicro();renderChart();MIC.snap();
  try{history.replaceState(null,'','#'+id);}catch(e){}}
tabBtns.forEach(b=>b.addEventListener('click',()=>show(b.dataset.tab)));

/* sliders: geometry sliders make a new specimen and rebuild; load sliders only update */
const GEOM={'c-L':'column','w-k':'wall','m-r':'cells','l-r':'lattice','s-a':'sheet'};
const LOADS={'c-F':'column','w-F':'wall','m-P':'cells','l-P':'lattice','s-P':'sheet'};
for(const id in GEOM)$(id).addEventListener('input',e=>{if(e.isTrusted)stopPlay();if(cur!==GEOM[id])return;const Rg=RIG[cur];clearHist(Rg);
  if(id==='c-L'||id==='w-k'||id==='l-r')Rg.build();refresh();});
for(const id in LOADS)$(id).addEventListener('input',e=>{if(e.isTrusted)stopPlay();if(cur===LOADS[id])refresh();});
$('m-type').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;RIG.cells.mtype=b.dataset.t;document.querySelectorAll('#m-type button').forEach(x=>x.setAttribute('aria-pressed',x===b));
  clearHist(RIG.cells);if(cur==='cells'){RIG.cells.build();refresh();MIC.snap();}});
$('m-pick').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;microPick=+b.dataset.i;renderMicro();MIC.snap();});
$('ch-pick').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;chartKind=b.dataset.c;document.querySelectorAll('#ch-pick button').forEach(x=>x.setAttribute('aria-pressed',x===b));renderChart();});
function growChart(on){$('stagechart').hidden=!on;$('b-grow').setAttribute('aria-pressed',on);$('b-grow').textContent=on?'Back to the rig':'Enlarge';renderChart();}
$('b-grow').addEventListener('click',()=>growChart($('stagechart').hidden));$('b-shrink').addEventListener('click',()=>growChart(false));

/* toggles */
function toggleStrain(){if(!HAS3D)return;strainOn=!strainOn;$('b-strain').setAttribute('aria-pressed',strainOn);applyMaterials();setLegend();refresh();}
function toggleLabels(){labelsOn=!labelsOn;$('b-labels').setAttribute('aria-pressed',labelsOn);if(anno)anno.visible=labelsOn;}
$('b-strain').addEventListener('click',toggleStrain);$('b-labels').addEventListener('click',toggleLabels);$('b-reset').addEventListener('click',resetView);$('b-new').addEventListener('click',newSpecimen);
function togglePresent(){const on=!document.body.classList.contains('present');document.body.classList.toggle('present',on);$('b-present').setAttribute('aria-pressed',on);
  try{if(on&&document.documentElement.requestFullscreen)document.documentElement.requestFullscreen().catch(()=>{});else if(!on&&document.fullscreenElement)document.exitFullscreen().catch(()=>{});}catch(e){}
  setTimeout(()=>{resize();renderChart();},80);}
$('b-present').addEventListener('click',togglePresent);
document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement&&document.body.classList.contains('present')){document.body.classList.remove('present');$('b-present').setAttribute('aria-pressed',false);setTimeout(()=>{resize();renderChart();},80);}});
/* theme: light / dark, remembered on this device */
function themeNow(){const t=document.documentElement.getAttribute('data-theme');if(t)return t;return matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}
function applyTheme(t){if(t)document.documentElement.setAttribute('data-theme',t);stageColour();renderChart();$('b-theme').textContent=themeNow()==='dark'?'Light':'Dark';}
try{const t=localStorage.getItem('shape-lab-theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t);}catch(e){}
$('b-theme').addEventListener('click',()=>{const t=themeNow()==='dark'?'light':'dark';try{localStorage.setItem('shape-lab-theme',t);}catch(e){}applyTheme(t);});
try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>applyTheme());}catch(e){}
/* sources sheet */
const openSrc=on=>{$('sources').hidden=!on;if(on)$('b-src-close').focus();};
$('b-src').addEventListener('click',()=>openSrc(true));$('b-src-close').addEventListener('click',()=>openSrc(false));$('sources').addEventListener('click',e=>{if(e.target.id==='sources')openSrc(false);});

/* play: ramps the tab's load slider to its maximum */
let play=null;
const PLAYS={column:'c-F',wall:'w-F',cells:'m-P',lattice:'l-P',sheet:'s-P'};
function setPlayIcons(){document.querySelectorAll('.play').forEach(b=>{const on=play&&play.id===b.dataset.for;b.textContent=on?'❚❚':'▶';b.setAttribute('aria-label',on?'Pause load':'Play load');});}
function stopPlay(){if(play){play=null;setPlayIcons();}}
function startPlay(id){const s=$(id),mn=+s.min,mx=+s.max;let v=+s.value;if(v>=mx-1e-9)v=mn;s.value=v;play={id,t0:performance.now(),v0:v,mn,mx};setPlayIcons();}
function togglePlay(){const id=PLAYS[cur];if(play&&play.id===id)stopPlay();else startPlay(id);}
document.querySelectorAll('.play').forEach(b=>b.addEventListener('click',()=>{if(play&&play.id===b.dataset.for)stopPlay();else startPlay(b.dataset.for);}));
function stepPlay(now){if(!play)return;const s=$(play.id),dur=7000*(play.mx-play.v0)/(play.mx-play.mn||1);const f=Math.min(1,(now-play.t0)/Math.max(500,dur));
  s.value=play.v0+(play.mx-play.v0)*f;s.dispatchEvent(new Event('input'));if(f>=1)stopPlay();}
document.addEventListener('keydown',e=>{if(e.metaKey||e.ctrlKey||e.altKey)return;if(e.target.closest&&e.target.closest('input[type=text],textarea'))return;const k=e.key.toLowerCase();
  if(k==='escape'&&!$('sources').hidden){openSrc(false);return;}
  if(k>='1'&&k<='5'){show(TABIDS[+k-1]);e.preventDefault();}
  else if(k===' '){if(e.target.tagName==='BUTTON')return;togglePlay();e.preventDefault();}
  else if(k==='r')resetView();else if(k==='s')toggleStrain();else if(k==='l')toggleLabels();else if(k==='p')togglePresent();else if(k==='n')newSpecimen();});

/* sizing + loop */
function resize(){if(!HAS3D)return;const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;R.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
let rzT=0;new ResizeObserver(()=>{resize();cancelAnimationFrame(rzT);rzT=requestAnimationFrame(()=>{renderChart();});}).observe(stage);
new ResizeObserver(()=>{cancelAnimationFrame(rzT);rzT=requestAnimationFrame(renderChart);}).observe($('ch-svg').parentNode);
stageColour();resize();applyTheme();
const h0=(location.hash||'').slice(1);show(TABIDS.includes(h0)?h0:'column');
(function loop(now){requestAnimationFrame(loop);now=now||performance.now();stepPlay(now);
  if(HAS3D){controls.update();R.render(scene,camera);placeTags();}
  if(!document.hidden)MIC.frame(now);})();
