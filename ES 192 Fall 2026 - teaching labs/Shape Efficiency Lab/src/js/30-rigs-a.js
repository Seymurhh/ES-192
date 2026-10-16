/* ===================== rigs: each has a model (shared by 3D, equations, chart, microscope) =====================
   rig = {build(), update(), story(i) -> microscope state, chartTest(svg,leg), chartDesign(svg,leg), view, legend, items, hist} */
const RIG={};
const SER=()=>({a:css('--slate'),b:css('--steel'),c:css('--amber'),cr:css('--crimson'),mu:css('--muted'),fg:css('--fg')});
function secSVG(kind,o={}){const S='stroke="#1c1b1f" stroke-width="1.2"';
  if(kind==='rod')return `<svg viewBox="0 0 26 26"><circle cx="13" cy="13" r="${o.r||7}" fill="#9aa1a9" ${S}/></svg>`;
  if(kind==='tube')return `<svg viewBox="0 0 26 26"><circle cx="13" cy="13" r="11.5" fill="#9aa1a9" ${S}/><circle cx="13" cy="13" r="${o.ri||10.2}" fill="#fff" ${S}/></svg>`;
  if(kind==='sq')return `<svg viewBox="0 0 26 26"><rect x="${13-(o.s||7)}" y="${13-(o.s||7)}" width="${2*(o.s||7)}" height="${2*(o.s||7)}" fill="${o.c||'#6a4524'}" ${S}/></svg>`;
  if(kind==='hex')return `<svg viewBox="0 0 26 26"><rect x="1.5" y="1.5" width="23" height="23" fill="#d2a670" ${S}/>${[0,1,2].map(i=>[0,1,2].map(j=>`<polygon points="${[0,1,2,3,4,5].map(k=>{const a=Math.PI/6+k*Math.PI/3,cx=5.5+j*7.5+(i&1)*3.6,cy=6+i*7;return (cx+2.9*Math.cos(a)).toFixed(1)+','+(cy+2.9*Math.sin(a)).toFixed(1);}).join(' ')}" fill="#fff"/>`).join('')).join('')}</svg>`;
  if(kind==='foam')return `<svg viewBox="0 0 26 26"><rect x="1.5" y="1.5" width="23" height="23" fill="#ece4cf" ${S}/>${[[7,7,3],[16,6,3.5],[11,15,4],[20,16,3],[6,20,2.5],[17,22,2]].map(c=>`<circle cx="${c[0]}" cy="${c[1]}" r="${c[2]}" fill="#c8bc9d"/>`).join('')}</svg>`;
  if(kind==='wave')return `<svg viewBox="0 0 26 26"><path d="M1 13 ${Array.from({length:25},(_,i)=>`L${1+i} ${(13-(o.a||5)*Math.sin(i/24*4*Math.PI)).toFixed(1)}`).join(' ')}" fill="none" stroke="#1c1b1f" stroke-width="2"/></svg>`;
  if(kind==='flat')return `<svg viewBox="0 0 26 26"><path d="M1 13 L25 13" stroke="#1c1b1f" stroke-width="2"/></svg>`;
  return '';}

/* =========================== 1. COLUMNS =========================== */
// S355 steel. EN 10219 tube 60.3 x 2.9 mm vs a solid bar of equal area (25.8 mm). Pinned ends.
// Starting bow = the EN 1993-1-1 equivalent imperfection e0 = alpha (lambda - 0.2) W/A (curve a, alpha 0.21: hot-finished hollow section;
// curve c, alpha 0.49: solid section), so first yield by the Ayrton-Perry formula equals the code buckling resistance N_b = chi A f_y.
const COL={E:210e9,sy:355e6,Fmax:150e3,b0:1/1000,
  items:[{key:'bar',name:'Solid bar',ro:0.0129,ri:0,x:-0.45,side:-1,label:'Ø25.8 mm solid bar',alpha:0.49,curve:'c'},{key:'tube',name:'Tube',ro:0.03015,ri:0.02725,x:0.45,side:1,label:'Ø60.3 × 2.9 mm tube',alpha:0.21,curve:'a'}]};
COL.items.forEach(it=>{it.A=Math.PI*(it.ro**2-it.ri**2);it.I=Math.PI/4*(it.ro**4-it.ri**4);it.phi=12*it.I/it.A**2;});
RIG.column={hist:[0,0],items:COL.items,view:{dir:[0.12,0.22,1],lift:0},legend:['Strain / yield strain','0','yield'],
  F(){const u=+$('c-F').value;return COL.Fmax*u*u;},
  state(it,F,L,pH){const Fc=Math.PI**2*COL.E*it.I/(L*L),Fy=COL.sy*it.A,c=it.ro,lam=Math.sqrt(Fy/Fc),eq=Math.max(0,it.alpha*(lam-0.2))*it.I/(c*it.A),perm=0.07*L*pH,e0=Math.max(eq,L/5000)+perm;
    const sigf=f=>f/it.A*(1+e0*c*it.A/(it.I*(1-f/Fc)));let lo=0,hi=Math.min(Fc,Fy)*0.999999;for(let i=0;i<60;i++){const m=(lo+hi)/2;if(sigf(m)<COL.sy)lo=m;else hi=m;}
    const F1=lo,pl=F>F1?clamp((F-F1)/(0.05*F1),0,1):0;const d1=e0/(1-F1/Fc);
    const bow=pl>0?d1+(0.1*L-d1)*smooth(pl):e0/(1-F/Fc);
    const sface=pl>0?COL.sy:F/it.A+F*bow*c/it.I;
    const ph=0.5*(1+it.alpha*(lam-0.2)+lam*lam),chi=Math.min(1,1/(ph+Math.sqrt(Math.max(0,ph*ph-lam*lam))));
    return {Fc,Fy,F1,pl,bow,sface,stocky:Fc>=Fy,e0,eq,lam,chi,Nb:chi*Fy};},
  model(){const F=this.F(),L=+$('c-L').value;return this.items.map((it,i)=>{const s=this.state(it,F,L,this.hist[i]);this.hist[i]=Math.max(this.hist[i],s.pl);s.pH=this.hist[i];return s;});},
  build(){clearRig();if(!HAS3D)return;const L=+$('c-L').value,y0=0.22;bedPlate(2.1,0.9,0,0);
    for(const it of this.items){const g=new THREE.Group();g.position.x=it.x;rig.add(g);it.g=g;const yTop=y0+L+0.72;
      box(.52,.07,.4,M.paint,0,.075,0,g);for(const sx of [-1,1])for(const sz of [-1,1])hexBolt(.016,sx*.22,.115,sz*.16,g);
      for(const sx of [-1,1]){cyl(.026,yTop-.08,M.chrome,sx*.22,.08+(yTop-.08)/2,-.07,g,24);hexBolt(.042,sx*.22,yTop+.075,-.07,g);hexBolt(.042,sx*.22,yTop-.075,-.07,g);}
      box(.58,.11,.22,M.paint,0,yTop,-.07,g);
      cyl(.075,.34,M.paint,0,yTop-.055-.17,0,g);cyl(.082,.03,M.paintDark,0,yTop-.055-.345,0,g);
      it.ramTop=yTop-.055-.36;it.ram=cyl(.028,1,M.chrome,0,0,0,g);
      it.cell=cyl(.055,.055,M.paintDark,0,0,0,g);it.cellRing=cyl(.058,.012,M.brass,0,0,0,g);
      const clevis=(up)=>{const c=new THREE.Group();box(.13,.03,.13,M.paintDark,0,up?.07:-.07,0,c);for(const z of [-.028,.028])box(.07,.11,.012,M.paintDark,0,up?.02:-.02,z,c);
        const pin=cyl(.0105,.1,M.chrome,0,0,0,c,20);pin.rotation.x=Math.PI/2;g.add(c);return c;};
      it.lower=clevis(false);it.lower.position.y=y0;it.upper=clevis(true);
      it.tangL=box(.05,.08,.04,M.steel,0,y0,0,g);it.tangU=box(.05,.08,.04,M.steel,0,0,0,g);
      it.mesh=track(mesh(new THREE.BufferGeometry(),M.steel),M.steel);g.add(it.mesh);
      it.tF=tag('','force',true);it.tPin=tag('pin','sup',true);it.tPin2=tag('pin','sup',true);it.tState=tag('');
      it.tSec=tag('','sec',true);it.y0=y0;it.yTop=yTop;}
    this.dim=dimLine(new THREE.Vector3(1,0,0));this.tDim=tag('','dim',true);this.update();},
  update(){const F=this.F(),L=+$('c-L').value,S=this.model();this.S=S;const [a,b]=S;
    $('o-cF').textContent=sig(F/1e3)+' kN';$('o-cL').textContent=fmt(L,2)+' m';
    $('c-res').innerHTML=`<span class="big">${sig(a.Nb/1e3)} <span>vs</span> ${sig(b.Nb/1e3)} kN</span><small>Load each column really carries (EN 1993-1-1). Ideal Euler loads: ${sig(a.Fc/1e3)} and ${sig(b.Fc/1e3)} kN, ratio ${fmt(b.Fc/a.Fc,1)} = r/t; real columns start slightly bent, so they fail earlier.</small>`;
    const it=this.items;
    $('eq-c1').innerHTML=`bar: π²·210 GPa·${sci(it[0].I*1e12)} mm⁴/(${fmt(L,2)} m)² = <b>${sig(a.Fc/1e3)} kN</b> · tube: <b>${sig(b.Fc/1e3)} kN</b>`;
    $('eq-c2').innerHTML=`I<sub>bar</sub> = <b>${sci(it[0].I*1e12)} mm⁴</b> · I<sub>tube</sub> = <b>${sci(it[1].I*1e12)} mm⁴</b> · both A = ${fmt(it[0].A*1e6,0)} mm²`;
    $('eq-c3').innerHTML=`φ<sub>bar</sub> = 3/π = <b>${fmt(it[0].phi,2)}</b> · φ<sub>tube</sub> = 3r/πt = <b>${fmt(it[1].phi,1)}</b> → ratio <b>${fmt(it[1].phi/it[0].phi,1)}</b>`;
    $('eq-c4').innerHTML=`bar (curve c): λ̄ = ${fmt(a.lam,2)}, χ = ${fmt(a.chi,3)} → <b>N<sub>b</sub> = ${sig(a.Nb/1e3)} kN</b> · tube (curve a): λ̄ = ${fmt(b.lam,2)}, χ = ${fmt(b.chi,2)} → <b>N<sub>b</sub> = ${sig(b.Nb/1e3)} kN</b> · starting bows ${fmt(a.eq*1000,1)} and ${fmt(b.eq*1000,1)} mm`;
    if(HAS3D&&it[0].g)it.forEach((m,i)=>{const s=S[i],y0=m.y0,h=Math.max(s.pH,s.pl);
      const shape=u=>(1-h)*Math.sin(Math.PI*u)+h*(1-Math.abs(2*u-1));
      const short=(1-h)*Math.PI**2*s.bow**2/(4*L)+h*2*s.bow**2/L, y1=y0+L-short;
      const pf=u=>new THREE.Vector3(m.side*s.bow*shape(u),y0+(y1-y0)*u,0);
      const sf=(u,cx)=>{const bend=F*s.bow*shape(u)*(-cx*m.side)/(COL.E*m.I);let v=Math.abs(F/(COL.E*m.A)+bend)/(COL.sy/COL.E);if(h>0)v=Math.max(v,1.15*h*Math.exp(-Math.pow((u-.5)/.07,2)));return v;};
      m.mesh.geometry.dispose();m.mesh.geometry=memberGeometry(90,36,planarFrame(pf),m.ro,m.ri,null,sf);
      m.upper.position.y=y1;m.tangU.position.y=y1;m.cell.position.y=y1+.125;m.cellRing.position.y=y1+.125;
      const rb=y1+.155,len=Math.max(.02,m.ramTop-rb);m.ram.scale.y=len;m.ram.position.y=rb+len/2;
      const X=m.x;m.tF.pos.set(X+.13,y1+.13,.06);m.tF.el.textContent='F = '+sig(F/1e3)+' kN';
      m.tPin.pos.set(X+.11,y0-.01,.06);m.tPin2.pos.set(X+.11,y1+.01,.06);
      m.tState.pos.set(X,m.yTop-.5,.1);const bad=s.pl>0||s.pH>0;m.tState.el.textContent=s.pl>0?(s.pl>.5?'COLLAPSED':'YIELDING'):s.pH>0?'permanently bent':(F>.5*s.Fc&&!s.stocky?'bowing':'holds');m.tState.el.className='tag '+(bad?'bad':'ok');
      m.tSec.pos.set(X+m.side*.5,.55,0);m.tSec.el.innerHTML=secSVG(i?'tube':'rod',{r:6})+`<span><b>${m.label}</b>I = ${sci(m.I*1e12)} mm⁴ · <i>φ</i> = ${fmt(m.phi,m.phi<2?2:1)}</span>`;
      if(i===0){const xd=X-.33;this.dim.set(new THREE.Vector3(xd,y0,0),new THREE.Vector3(xd,y1,0),.03);this.tDim.pos.set(xd-.02,(y0+y1)/2,0);this.tDim.el.textContent='L = '+fmt(L,2)+' m';}
      m.hot=new THREE.Vector3(X+m.side*(s.bow*shape(.5)-m.ro),y0+(y1-y0)*.5,0);});},
  pick:['Solid bar','Tube'],
  auto(){const S=this.S;const r=S.map(s=>s.pl>0||s.pH>0?2+s.pl:s.sface/COL.sy);return r[1]>r[0]?1:0;},
  story(i){const s=this.S[i],it=this.items[i],F=this.F(),pl=Math.max(s.pl,s.pH);
    const steps=s.stocky?['Elastic','Yield','Plastic hinge']:['Elastic','Buckling','Yield','Plastic hinge'];
    let st,head,why;
    if(s.pl>0.45||(s.pH>0.45&&s.pl>0)){st='Plastic hinge';head='Plastic hinge: the column folds';why='Slip has spread through the whole section at mid-height. Dislocations pile up at grain boundaries, so the steel hardens a little, but not enough: the column folds and sheds load. Finer grains would delay this (Hall–Petch).';}
    else if(s.pl>0){st='Yield';head=s.stocky?'Too short to buckle: the steel yields first':'First yield at mid-height, inner face';why='Here the axial stress and the bending stress add up. Dislocations break free of the carbon atoms that pinned them and glide on {110} planes of the ferrite. Grains tilted near 45° to the load slip first: they feel the most shear.';}
    else if(s.pH>0){st='Plastic hinge';head='Unloaded: the bend stays';why='The elastic strain has gone but the slip steps have not, so the column is permanently bent. Reload it: the extra bow means it now yields at a lower load. Press New specimen to start again.';}
    else if(!s.stocky&&F>.5*s.Fc){st='Buckling';head='Buckling: the shape gives way, the steel does not';why=`The bow grows as 1/(1 − F/F<sub>c</sub>). The inner face is squeezed harder (${sig(s.sface/1e6)} MPa), but every atom is still in its own place: remove the load and the column springs straight.`;}
    else{st='Elastic';head='Elastic: the bonds squeeze, nothing slips';why=`Iron atoms are pushed slightly closer along the column, by ${fmt(s.sface/COL.sy*100,0)}% of the strain needed to yield. Take the load off and they spring back. One dislocation sits pinned by carbon atoms, waiting.`;}
    return {mat:'steel',label:it.name,where:'mid-height, inner face',sign:-1,e:clamp(s.sface/COL.sy,0,1),pl,fr:0,band:0,steps,stage:st,head,why,
      measure:'<b>Measure it:</b> a strain gauge on each face at mid-height. The difference between them is the bending; the load–deflection curve flattens at first yield.'};},
  chartTest(svg,leg){const c=SER(),L=+$('c-L').value,F=this.F(),S=this.S,xmax=Math.max(40,Math.min(150,L*30));
    const ser=[],marks=[],hl=[];this.items.forEach((it,i)=>{const s=this.state(it,0,L,0),col=i?c.b:c.a,pts=[];
      for(let k=0;k<=80;k++){const f=Math.max(1e3,s.F1*k/80);pts.push([1000*s.e0/(1-f/s.Fc),f/1e3]);}
      ser.push({pts,c:col,w:2.6});ser.push({pts:[[1000*s.e0/(1-s.F1/s.Fc),s.F1/1e3],[xmax*1.2,s.F1*0.86/1e3]],c:col,dash:'6 4',w:2});
      hl.push({v:s.Fc/1e3,c:col,dash:'2 4',label:`F<tspan baseline-shift="sub" font-size="9">c</tspan> ${it.key} ${sig(s.Fc/1e3)} kN`,pos:i?'right':'left'});
      marks.push({x:1000*S[i].bow,y:Math.max(1,F/1e3),c:col});});
    plot(svg,{x:{min:0,max:xmax,label:'Sideways bow at mid-height δ (mm)'},y:{min:1,max:300,log:true,label:'Load F (kN), log scale',ticks:[1,2,5,10,20,50,100,200]},series:ser,hl:[...hl,{v:Math.max(1,F/1e3),c:c.cr,dash:'1 0',w:1}],marks});
    legend(leg,[{c:c.a,t:'Solid bar'},{c:c.b,t:'Tube'},{c:c.mu,t:'after first yield: collapse',dash:1},{c:c.cr,t:'applied load'}]);},
  chartDesign(svg,leg){const c=SER(),Lnow=+$('c-L').value,F=this.F();const ser=[],marks=[];
    this.items.forEach((it,i)=>{const col=i?c.b:c.a,e=[],cap=[];for(let k=0;k<=100;k++){const L=0.4+2.8*k/100,s=this.state(it,0,L,0);e.push([L,Math.min(600,s.Fc/1e3)]);cap.push([L,s.F1/1e3]);}
      ser.push({pts:e,c:col,dash:'3 4',w:1.6});ser.push({pts:cap,c:col,w:2.8});const s=this.state(it,0,Lnow,0);marks.push({x:Lnow,y:s.F1/1e3,c:col,label:sig(s.F1/1e3)+' kN',dx:10,dy:i?-8:14});});
    plot(svg,{x:{min:0.4,max:3.2,label:'Length L (m)'},y:{min:0,max:260,label:'Load the column can carry (kN)'},series:ser,
      hl:[{v:COL.sy*this.items[0].A/1e3,c:c.mu,label:'squash load σ<tspan baseline-shift="sub" font-size="9">y</tspan>A = 186 kN'},{v:F/1e3,c:c.cr,dash:'1 0',w:1}],vl:[{v:Lnow,c:c.mu,dash:'2 3'}],marks,
      texts:[{x:0.55,y:250,t:'Euler F<tspan baseline-shift="sub" font-size="9">c</tspan> = π²EI/L²',c:c.mu}]});
    legend(leg,[{c:c.a,t:'Solid bar'},{c:c.b,t:'Tube'},{c:c.mu,t:'Euler load alone',dash:1},{c:c.cr,t:'applied load'}]);},
};

/* =========================== 2. THIN WALLS =========================== */
// 6061-T6 tube cantilever, L = 0.5 m, 150 mm^2 at every r/t. First yield M_y = sigma_y Z; full plastic hinge M_p = (4/pi) M_y (thin tube).
// Wall kinks at sigma_k = 0.18 E t/r: the classical 0.6 E t/r with a typical 0.3 knock-down for imperfections. The hinge and kink
// limits then cross at r/t = 39, phi = 3(r/t)/pi = 37, matching Ashby's 2.3(E/sigma_f)^1/2 = 38 (Eq. 11.15a).
const WALL={E:69e9,sy:250e6,A:150e-6,L:0.5,c:0.18};
const kOf=v=>5*Math.pow(20,v);
function wallCap(k){const r=Math.sqrt(WALL.A*k/(2*Math.PI)),t=r/k,Z=WALL.A*r/2,My=WALL.sy*Z,Mp=4/Math.PI*My,sk=WALL.c*WALL.E/k,Mk=sk*Z;
  return{r,t,Z,My,Mp,Mk,sk,I:Math.PI*r**3*t,M:Math.min(Mp,Mk),mode:Mp<=Mk?'yield':'kink'};}
const WALLX=(()=>{let lo=5,hi=100;for(let i=0;i<60;i++){const m=Math.sqrt(lo*hi),c=wallCap(m);if(c.Mp<c.Mk)lo=m;else hi=m;}return lo;})();
RIG.wall={hist:[0],histY:[0],histF:[0],items:[{name:'Tube'}],view:{dir:[0.42,0.32,1],lift:-0.02},legend:['Bending strain / yield strain','0','yield'],
  model(){const k=kOf(+$('w-k').value),F=+$('w-F').value,c=wallCap(k),Mnow=F*WALL.L,p=Mnow/c.M;
    const yld=c.My<c.M&&Mnow>c.My?clamp((Mnow-c.My)/(c.M-c.My),0,1):0;
    const pl=p>1?clamp((p-1)/0.15,0,1):0,fr=c.mode==='kink'?clamp((p-1.45)/0.4,0,1):0;
    this.histY[0]=Math.max(this.histY[0],yld);this.hist[0]=Math.max(this.hist[0],pl);this.histF[0]=Math.max(this.histF[0],fr);
    const Fe=Math.min(F,c.M/WALL.L),el=Fe*WALL.L**3/(3*WALL.E*c.I)*(1+0.6*yld*yld);
    return {k,F,c,p,yld,pl,fr,yH:this.histY[0],pH:this.hist[0],fH:this.histF[0],el};},
  build(){clearRig();if(!HAS3D)return;bedPlate(1.05,.62,.22,0);
    box(.26,.02,.26,M.paint,-.06,.05,0);box(.012,.62,.11,M.paint,-.06,.37,0);for(const z of [-.055,.055])box(.12,.62,.012,M.paint,-.06,.37,z);
    for(const sx of [-1,1])for(const sz of [-1,1])hexBolt(.012,-.06+sx*.1,.068,sz*.1);
    box(.1,.07,.13,M.paintDark,.03,.42+.035+.012,0);box(.1,.07,.13,M.paintDark,.03,.42-.035-.012,0);box(.04,.2,.13,M.paintDark,-.02,.42,0);
    for(const sx of [-1,1])for(const sz of [-1,1]){const b=cyl(.007,.2,M.chrome,.03+sx*.03,.42,sz*.052);b.castShadow=false;hexBolt(.014,.03+sx*.03,.53,sz*.052);hexBolt(.014,.03+sx*.03,.31,sz*.052);}
    this.mesh=track(mesh(new THREE.BufferGeometry(),M.alu),M.alu);rig.add(this.mesh);this.stub=mesh(new THREE.BufferGeometry(),M.alu);rig.add(this.stub);
    this.arr=arrow(.15,.02);this.ws=weightStack(.16,.042);
    this.tF=tag('','force',true);this.tSup=tag('fixed support (clamped)','sup',true);this.tState=tag('');this.tSec=tag('','sec',true);
    this.dim=dimLine(new THREE.Vector3(0,1,0));this.tDim=tag('','dim',true);this.update();},
  update(){const m=this.model();this.S=[m];const {k,F,c}=m,L=WALL.L;
    $('o-wk').textContent=fmt(k,0);$('o-wF').textContent=fmt(F,0)+' N';
    $('w-res').innerHTML=`<span class="big">${fmt(c.M/L,0)} N</span><small>Tip load at which this tube ${c.mode==='yield'?'forms a plastic hinge':'kinks'}. ${c.My<c.M?`Its surface first yields at ${fmt(c.My/L,0)} N.`:'It kinks before any yield.'} Diameter ${fmt(2*c.r*1000,0)} mm, wall ${fmt(c.t*1000,2)} mm.</small>`;
    const phi=3*k/Math.PI;
    $('eq-w1').innerHTML=`M = ${fmt(F,0)} N × 0.5 m = <b>${fmt(F*L,0)} N·m</b> · Z = ${sig(c.Z*1e9)} mm³ → σ = <b>${sig(F*L/c.Z/1e6)} MPa</b>`;
    $('eq-w2').innerHTML=`M<sub>y</sub> = 250 MPa × ${sig(c.Z*1e9)} mm³ = <b>${sig(c.My)} N·m</b> · M<sub>p</sub> = 1.27 M<sub>y</sub> = <b>${sig(c.Mp)} N·m</b>`;
    $('eq-w3').innerHTML=`σ<sub>k</sub> = 0.18 × 69 GPa / ${fmt(k,0)} = <b>${sig(c.sk/1e6)} MPa</b> → M<sub>k</sub> = <b>${sig(c.Mk)} N·m</b>`;
    $('eq-w4').innerHTML=`Al: 2.3 × (69 000/250)<sup>½</sup> = <b>38</b> (model crossover φ = ${fmt(3*WALLX/Math.PI,0)}) · this tube φ = 3(r/t)/π = <b>${fmt(phi,0)}</b> → ${c.mode==='yield'?'hinges':'kinks'}`;
    if(!HAS3D||!this.mesh)return;
    const pH=m.pH,y0=.42,x0=.08;let rot=0,kink=0;if(c.mode==='yield')rot=0.38*smooth(pH)+0.02*m.yH;else if(pH>0){rot=0.75*smooth(pH);kink=smooth(pH);}
    const sk=c.mode==='kink'?0.06:0,el=m.el;
    const pf=s=>{const x=s*L,e=-el*(3*s*s-s*s*s)/2;let px=x0+x,py=y0+e;
      if(rot>0){const hinge=c.mode==='kink'?sk*L:0,spread=c.mode==='kink'?0.02:0.12,w=clamp((x-hinge)/(spread*L)+0.5,0,1),a=rot*w;if(x>hinge){const dx=x-hinge;px=x0+hinge+dx*Math.cos(a);py=py-dx*Math.sin(a);}}
      return new THREE.Vector3(px,py,0);};
    const gk=s=>Math.exp(-Math.pow((s-sk)/0.03,2));
    const ringMod=kink>0?(s,th)=>{const gg=gk(s)*kink,crease=1-0.55*gg*Math.max(0,-Math.sin(th))**3;return[(1-0.45*gg)*crease,1+0.3*gg];}:null;
    const sf=(s,cx)=>{let v=Math.min(F,c.M/L)*L*(1-s)*Math.abs(cx)/(WALL.E*c.I)/(WALL.sy/WALL.E);if(pH>0)v=Math.max(v,c.mode==='kink'?1.3*gk(s)*kink+v:1.15*Math.exp(-s/0.12)*Math.min(1,pH*4)+v);return v;};
    this.mesh.geometry.dispose();this.mesh.geometry=memberGeometry(120,48,planarFrame(pf),c.r+c.t/2,c.r-c.t/2,ringMod,sf);
    this.stub.geometry.dispose();this.stub.geometry=memberGeometry(4,48,planarFrame(s=>new THREE.Vector3(-.02+s*.1,y0,0)),c.r+c.t/2,c.r-c.t/2,null,null);
    const tip=pf(1);
    this.arr.position.set(tip.x,tip.y+c.r+.006,0);this.ws.position.set(tip.x-.01,tip.y-c.r,0);this.ws.setCount(Math.max(1,F/100));
    this.tF.pos.set(tip.x,tip.y+c.r+.19,0);this.tF.el.textContent='F = '+fmt(F,0)+' N';
    this.tSup.pos.set(.02,y0+.13,.07);this.tState.pos.set(tip.x-.12,tip.y+.1,0);
    const st=c.mode==='yield'?(m.pl>0?'PLASTIC HINGE: collapsing':pH>0?'permanently bent':m.yld>0?'surface yielding':m.yH>0?'slightly bent for good':'elastic'):(m.fH>0?'KINKED and cracking':pH>0?'KINKED: wall buckled':'elastic');
    this.tState.el.textContent=st;this.tState.el.className='tag '+(st==='elastic'?'ok':'bad');
    this.tSec.pos.set(x0+L*.62,y0-.13,.08);this.tSec.el.innerHTML=secSVG('tube',{ri:11.5*(1-2/(k+1))})+`<span><b>Ø${fmt(2*c.r*1000,0)} × ${fmt(c.t*1000,2)} mm</b><i>r</i>/<i>t</i> = ${fmt(k,0)} · I = ${sci(c.I*1e12)} mm⁴</span>`;
    this.dim.set(new THREE.Vector3(x0,y0+c.r+.05,-.0),new THREE.Vector3(x0+L,y0+c.r+.05,0),.015);this.tDim.pos.set(x0+L*.42,y0+c.r+.075,0);this.tDim.el.textContent='L = 0.50 m';
    const hs=c.mode==='kink'?pf(sk):pf(.01);this.hot=c.mode==='kink'?new THREE.Vector3(hs.x,hs.y-c.r,0):new THREE.Vector3(hs.x,hs.y+c.r,0);},
  pick:['Tube'],auto(){return 0;},
  story(){const m=this.S[0],c=m.c,kink=c.mode==='kink',pl=0.35*m.yH+0.65*m.pH;const sigNow=Math.min(m.F*WALL.L,c.My)/c.Z;
    if(!kink){const steps=['Elastic','First yield','Plastic hinge'];let st,head,why;
      if(m.pH>0){st='Plastic hinge';head=m.pl>0?'Plastic hinge: the tube collapses':'Unloaded: the tube stays bent';why=`Slip now runs right through the wall at the clamp: the full plastic moment, M<sub>p</sub> = (4/π)M<sub>y</sub> = ${sig(c.Mp)} N·m. The tube rotates about the clamp like a hinge, and the bend is permanent.`;}
      else if(m.yH>0){st='First yield';head=m.yld>0?'First yield at the surface, core still elastic':'Unloaded: almost straight, slip steps remain';why='The top and bottom faces at the clamp have reached 250 MPa. Dislocations glide on {111} planes until tiny Mg–Si needles (β″ precipitates) hold them back; that is where the T6 temper gets its strength. The rest of the wall is still elastic, so the tube can carry up to 27% more before it hinges.';}
      else{st='Elastic';head='Elastic: top stretches, bottom squeezes';why=`Bending strain is largest at the clamp, on the faces furthest from the tube’s centre: ${sig(sigNow/1e6)} MPa here, ${fmt(sigNow/WALL.sy*100,0)}% of yield. The atoms are only pulled apart a little.`;}
      return {mat:'al',label:'Tube',where:'at the clamp, top face',sign:1,e:clamp(sigNow/WALL.sy,0,1),pl,fr:0,band:0,steps,stage:st,head,why,
        measure:'<b>Measure it:</b> a strain gauge on top at the clamp, and the tip deflection. First yield shows as the curve starting to bend over; the hinge as the load levelling off.'};}
    const steps=['Elastic','Wall kinks','Crack'];let st,head,why,sign=-1;const sk=Math.min(m.F*WALL.L,c.Mk)/c.Z;
    if(m.fH>0){st='Crack';sign=1;head='A crack opens in the fold';why='Slip is intense on the outside of the fold. Small voids open around iron-rich particles in the alloy, grow, and link up into a crack.';}
    else if(m.pH>0){st='Wall kinks';head=c.Mk>c.My?'The surface yielded, then the thin wall wrinkled':'The wall wrinkles before the metal yields';why='A wall this thin buckles locally on the squeezed side, below the full plastic moment. All further bending crowds into that crease, so slip there is many times the average while the rest of the tube stays nearly elastic. The load drops.';}
    else{st='Elastic';head='Elastic, but the thin wall is close to wrinkling';why=`The squeezed underside carries ${sig(sk/1e6)} MPa, ${fmt(sk/c.sk*100,0)}% of the ${sig(c.sk/1e6)} MPa at which this thin wall wrinkles (0.18 E t/r).`;}
    return {mat:'al',label:'Tube',where:'the crease, near the clamp',sign,e:clamp(sk/c.sk,0,1),pl:Math.max(m.pH,0.3*m.yH),fr:m.fH,band:1,steps,stage:st,head,why,
      measure:'<b>Measure it:</b> the load–deflection curve. A kink shows as a sudden drop in load; a plastic hinge as the load levelling off.'};},
  chartTest(svg,leg){const c=SER(),m=this.S[0],L=WALL.L,k=1000*L**3/(3*WALL.E*m.c.I),Fy=m.c.My/L,Fc=m.c.M/L,xmax=Fc*k*3.2;
    const pts=[[0,0]];if(Fy<Fc){pts.push([Fy*k,Fy]);for(let i=1;i<=20;i++){const y=i/20,f=Fy+(Fc-Fy)*y;pts.push([f*k*(1+0.6*y*y),f]);}}else pts.push([Fc*k,Fc]);
    const end=pts[pts.length-1],after=m.c.mode==='yield'?[end,[xmax*1.3,Fc*1.02]]:[end,[end[0]*1.4,Fc*.55],[xmax*1.3,Fc*.45]];
    const dNow=(m.el+Math.sin(m.c.mode==='yield'?0.38*smooth(m.pH):0.75*smooth(m.pH))*L*.9)*1000;
    const tx=[{x:end[0],y:Fc,t:m.c.mode==='yield'?'plastic hinge: load levels off':'kinks: load drops',dx:8,dy:-8,c:c.b}];if(Fy<Fc)tx.push({x:Fy*k,y:Fy,t:'first yield',dx:8,dy:14,c:c.mu});
    plot(svg,{x:{min:0,max:xmax,label:'Tip deflection δ (mm)'},y:{min:0,max:Math.max(Fc*1.35,m.F*1.1,50),label:'Tip load F (N)'},
      series:[{pts,c:c.b,w:2.8},{pts:after,c:c.b,dash:'6 4',w:2}],hl:[{v:m.F,c:c.cr,dash:'1 0',w:1}],marks:[{x:dNow,y:m.F,c:c.b}],texts:tx});
    legend(leg,[{c:c.b,t:'Elastic: δ = FL³/3EI, then yielding'},{c:c.b,t:m.c.mode==='yield'?'after the hinge forms':'after the wall kinks',dash:1},{c:c.cr,t:'applied load'}]);},
  chartDesign(svg,leg){const c=SER(),m=this.S[0],pts=[],py=[],pp=[],pk=[];for(let i=0;i<=120;i++){const k=kOf(i/120),w=wallCap(k);pts.push([k,w.M/WALL.L]);py.push([k,w.My/WALL.L]);pp.push([k,w.Mp/WALL.L]);pk.push([k,Math.min(5000,w.Mk/WALL.L)]);}
    const top=Math.max(...pts.map(p=>p[1]))*1.35;
    plot(svg,{x:{min:5,max:100,log:true,label:'Radius / wall thickness r/t (same metal area)',ticks:[5,10,20,40,100]},y:{min:0,max:top,label:'Tip load it can carry (N)'},
      series:[{pts:py,c:c.mu,dash:'2 4',w:1.4},{pts:pp,c:c.a,dash:'5 4',w:1.8},{pts:pk,c:c.cr,dash:'5 4',w:1.8},{pts,c:c.b,w:3}],vl:[{v:WALLX,c:c.mu,dash:'2 3',label:'crossover ≈ Eq 11.15a'}],hl:[{v:m.F,c:c.cr,dash:'1 0',w:1}],
      marks:[{x:m.k,y:m.c.M/WALL.L,c:c.b,label:fmt(m.c.M/WALL.L,0)+' N'}],texts:[{x:6,y:wallCap(6).Mp/WALL.L,t:'plastic hinge (rises)',dy:-8,c:c.a},{x:95,y:wallCap(95).Mk/WALL.L,t:'kink limit (falls)',anchor:'end',dy:-8,c:c.cr}]});
    legend(leg,[{c:c.b,t:'Capacity: the lower limit'},{c:c.a,t:'Plastic hinge M<sub>p</sub>',dash:1},{c:c.mu,t:'First yield M<sub>y</sub>',dash:1},{c:c.cr,t:'Wall kinks',dash:1},{c:c.cr,t:'applied load'}]);},
};
