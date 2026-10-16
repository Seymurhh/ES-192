/* =========================== 3. CELLS =========================== */
// Equal-mass cantilevers, L = 0.8 m. Solid bar b0 = 40 mm of cell-wall solid (E_s 35 GPa, rho_s 1500 kg/m3); expanded beam b = b0 (rho_s/rho)^1/2.
// Stiffness gain psi: aligned cells rho_s/rho (Eq. 11.38); foam 1 (E = rel^2 E_s, Eq. 13.18).
// Breaking load relative to the solid bar: aligned cells (sigma = rel sigma_s) -> 1/rel^1/2; foam (Eq. 13.20, 0.3 rel^3/2 sigma_s) -> 0.3, at any density.
const CEL={L:0.8,b0:0.04,drop:0.12,Es:35,rs:1500};
function honeycombShape(b,rel){
  const sh=new THREE.Shape();sh.moveTo(-b/2,-b/2);sh.lineTo(b/2,-b/2);sh.lineTo(b/2,b/2);sh.lineTo(-b/2,b/2);sh.closePath();
  const ncell=Math.max(4,Math.round(b/0.016)),Rc=b/(ncell*Math.sqrt(3)),Rh=Rc*Math.sqrt(Math.max(0.02,1-rel)),lim=b/2-(Rc-Rh)*0.9;
  for(let row=-ncell*2;row<=ncell*2;row++)for(let c=-ncell*2;c<=ncell*2;c++){const cx=c*Math.sqrt(3)*Rc+(row&1?Math.sqrt(3)*Rc/2:0),cy=row*1.5*Rc;
    if(Math.abs(cx)+Rh*0.87>lim||Math.abs(cy)+Rh>lim)continue;const h=new THREE.Path();for(let i=0;i<6;i++){const a=Math.PI/6+i*Math.PI/3,x=cx+Rh*Math.cos(a),y=cy+Rh*Math.sin(a);i?h.lineTo(x,y):h.moveTo(x,y);}h.closePath();sh.holes.push(h);}
  return sh;}
RIG.cells={hist:[0,0],histF:[0,0],mtype:'prism',items:[{name:'Solid bar'},{name:'Cells'}],view:{dir:[0.95,0.62,1.25],lift:-0.03},legend:['Bending strain / failure strain','0','fails'],
  model(){const rel=+$('m-r').value,P=+$('m-P').value,pr=this.mtype==='prism',b=CEL.b0/Math.sqrt(rel),psi=[1,pr?1/rel:1],Pf=[1,pr?1/Math.sqrt(rel):0.3];
    const S=[0,1].map(i=>{const pl=P>Pf[i]?clamp((P-Pf[i])/(0.12*Pf[i]),0,1):0,fr=(i===1&&!pr)?(P>Pf[i]?clamp((P-Pf[i])/(0.6*Pf[i]),0,1):0):(P>1.2*Pf[i]?clamp((P-1.2*Pf[i])/(0.15*Pf[i]),0,1):0);
      this.hist[i]=Math.max(this.hist[i],pl);this.histF[i]=Math.max(this.histF[i],fr);const pH=this.hist[i],fH=this.histF[i];
      return {pl,fr,pH,fH,psi:psi[i],Pf:Pf[i],drop:CEL.drop*Math.min(P,Pf[i])/psi[i],rot:0.42*smooth(pH)+0.25*smooth(fH),e:Math.min(1,P/Pf[i])};});
    return {rel,P,b,pr,S};},
  build(){clearRig();if(!HAS3D)return;const m=this.model();this.b=m.b;
    box(.8,1.0,.14,M.concrete,.02,.5,-.07);box(.66,.3,.018,M.paint,.02,.64,.009);for(const sx of [-1,1])for(const sy of [-1,1])hexBolt(.016,.02+sx*.29,.64+sy*.11,.022,null,'z');
    this.xs=-.17;this.xc=.07+m.b/2+.02;
    const solidG=new THREE.BoxGeometry(CEL.b0,CEL.b0,CEL.L,1,1,48);solidG.translate(0,0,CEL.L/2);
    this.solid=track(mesh(solidG,M.woodDense),M.woodDense);this.solid.position.set(this.xs,.64,0);rig.add(this.solid);
    let geo;if(m.pr)geo=new THREE.ExtrudeGeometry(honeycombShape(m.b,m.rel),{depth:CEL.L,steps:48,bevelEnabled:false,curveSegments:1});else{geo=new THREE.BoxGeometry(m.b,m.b,CEL.L,1,1,48);geo.translate(0,0,CEL.L/2);}
    const base=m.pr?M.wood:M.foam;this.cell=track(mesh(geo,base),base);this.cell.position.set(this.xc,.64,0);rig.add(this.cell);
    for(const [x,b] of [[this.xs,CEL.b0],[this.xc,m.b]]){box(b+.03,.012,.06,M.paintDark,x,.64+b/2+.006,.048);box(b+.03,.012,.06,M.paintDark,x,.64-b/2-.006,.048);for(const s of [-1,1])box(.012,b+.036,.06,M.paintDark,x+s*(b/2+.015),.64,.048);}
    this.arr=[arrow(.12,.016),arrow(.12,.016)];this.ws=[weightStack(.12,.032),weightStack(.12,.032)];
    this.tF=[tag('','force',true),tag('','force',true)];this.tSup=tag('fixed support (clamped)','sup',true);
    this.tSec=[tag('','sec',true),tag('','sec',true)];this.tState=[tag(''),tag('')];this.dim=dimLine(new THREE.Vector3(1,0,0));this.tDim=tag('','dim',true);
    this.update();},
  update(){const m=this.model();this.S=m.S;const {rel,P,b,pr}=m;
    this.items[1].name=pr?'Aligned cells':'Foam';
    $('o-mr').textContent=fmt(rel,2);$('o-mP').textContent=fmt(P,2)+' × F'+'₀';
    const sR=m.S[1].Pf;
    $('m-res').innerHTML=`<span class="big">${fmt(m.S[1].psi,1)}× <span>stiffer</span></span><small>${pr?`and it carries ${fmt(sR,2)}× the load that breaks the solid bar, at the same mass.`:`Same stiffness as the solid bar, but it breaks at ${fmt(sR,2)}× the load.`} F₀ = load that breaks the solid bar.</small>`;
    $('eq-m1').innerHTML=`b = 40 mm × (1/${fmt(rel,2)})<sup>½</sup> = <b>${fmt(b*1000,0)} mm</b> square, same mass as the 40 mm bar`;
    $('eq-m2').innerHTML=`E = ${fmt(rel,2)} × 35 GPa = <b>${sig(rel*CEL.Es)} GPa</b> · ψ = 1/${fmt(rel,2)} = <b>${fmt(1/rel,1)}</b>`;
    $('eq-m3').innerHTML=`E = ${fmt(rel,2)}² × 35 GPa = <b>${sig(rel*rel*CEL.Es)} GPa</b> · ψ = <b>1</b>`;
    $('eq-m4').innerHTML=`= <b>${sig(0.3*Math.pow(rel,1.5),2)} σ<sub>s</sub></b>; in the bigger foam beam the stress is ${sig(Math.pow(rel,1.5),2)}× lower, so it breaks at <b>0.30 F₀</b>`;
    if(!HAS3D||!this.solid)return;if(Math.abs(b-this.b)>1e-9){this.build();return;}
    const L=CEL.L,objs=[[this.solid,CEL.b0,this.xs],[this.cell,b,this.xc]];
    objs.forEach(([o,bb,x],i)=>{const s=m.S[i],hv=i===1&&!pr?1.5:1;
      bendExtrude(o.geometry,L,s.drop,(u,y)=>{let v=s.e*hv*(1-u)*Math.abs(y)/(bb/2);if(s.pH>0)v=Math.max(v,1.2*Math.exp(-u/.05)*(Math.abs(y)>bb*.2?1:.6));return v;},s.rot,.015);
      const [yt,zt]=bentPoint(L,s.drop,s.rot,.015,bb/2,L),[yb,zb]=bentPoint(L,s.drop,s.rot,.015,-bb/2,L);
      this.arr[i].position.set(x,.64+yt+.004,zt-.012);this.ws[i].position.set(x,.64+yb,zb-.012);this.ws[i].setCount(1+P*4);
      this.tF[i].pos.set(x,.64+yt+.17,zt);this.tF[i].el.textContent='F = '+fmt(P,2)+' F₀';
      this.tState[i].pos.set(x,.64+yb-.17,zb);const bad=s.pH>0;this.tState[i].el.className='tag '+(bad?'bad':'ok');
      this.tState[i].el.textContent=!bad?'elastic':(i===1&&!pr)?(s.fH>.3?'CELLS COLLAPSED':'CELLS HINGING'):(s.fH>0?'BROKEN: splintered':'KINK BAND on the squeezed face');
      this.tSec[i].pos.set(x,.64+bb/2+.07,.06);
      this.tSec[i].el.innerHTML=i===0?secSVG('sq',{s:5})+`<span><b>Solid bar 40 × 40 mm</b>E<sub>s</sub> = 35 GPa · I = b⁴/12</span>`:secSVG(pr?'hex':'foam')+`<span><b>${pr?'Aligned cells':'Foam'} ${fmt(b*1000,0)} × ${fmt(b*1000,0)} mm</b>ρ/ρ<sub>s</sub> = ${fmt(rel,2)} · ψ = ${fmt(s.psi,1)}</span>`;
      const hy=(i===1&&!pr)||s.fH<=0?-bb/2:bb/2,[Y,Z]=bentPoint(L,s.drop,s.rot,.015,hy,.03);this.items[i].hot=new THREE.Vector3(x,.64+Y,Z);});
    const yd=.64-Math.max(CEL.b0,b)/2-.07;this.dim.set(new THREE.Vector3(this.xs-.06,.64-CEL.b0/2-.05,0),new THREE.Vector3(this.xs-.06,.64-CEL.b0/2-.05,L),.02);
    this.dim.set(new THREE.Vector3(this.xs-.07,.5,0),new THREE.Vector3(this.xs-.07,.5,L),.02);this.tDim.pos.set(this.xs-.07,.5,L*.55);this.tDim.el.textContent='L = 0.80 m';},
  pick:['Solid bar','Cells'],auto(){const s=this.S;const r=s.map(x=>x.pH>0?2+x.fH:x.e);return r[1]>=r[0]?1:0;},
  story(i){const s=this.S[i],pr=this.mtype==='prism',foam=i===1&&!pr;
    if(foam){const steps=['Elastic','Hinges','Collapse'];let st,head,why;
      if(s.fH>0){st='Collapse';head='Cells collapse, one layer at a time';why='Once the joints have hinged, a layer of cells folds flat. The foam keeps squashing at almost constant stress, which is why foams absorb energy so well.';}
      else if(s.pH>0){st='Hinges';head='Plastic hinges where the walls meet';why='Bending moment in each wall is largest at its ends, where it joins the next cells. The wall material yields there first: σ<sub>pl</sub> = 0.3(ρ/ρ<sub>s</sub>)<sup>3/2</sup>σ<sub>s</sub>.';}
      else{st='Elastic';head='Elastic: the walls bend like tiny beams';why='The walls meet at angles, so the load bends them instead of stretching them. Bending is soft, so stiffness falls as (ρ/ρ<sub>s</sub>)² and the spreading-out gains nothing.';}
      return {mat:'foam',label:'Foam',where:'squeezed (lower) face, near the clamp',sign:-1,e:s.e,pl:s.pH,fr:s.fH,band:0,steps,stage:st,head,why,
        measure:'<b>Measure it:</b> a compression test on a foam block shows a straight elastic line, a long flat plateau (collapse), then a steep rise when the cells are flat.'};}
    const steps=['Elastic','Kink band','Splinters'];let st,head,why,sign=-1,where='squeezed (lower) face, at the clamp';
    if(s.fH>0){st='Splinters';sign=1;where='stretched (upper) face, at the clamp';head='The stretched face splinters';why='Fibres now break on the top face. Cellulose chains snap and fibres pull out of the lignin around them at different places, which leaves the long, splintered break typical of wood.';}
    else if(s.pH>0){st='Kink band';head='The squeezed face fails first: a kink band';why='Along the grain, wood is only about half as strong in compression as in tension. The cell walls buckle together in a narrow inclined band. Inside the walls, hydrogen bonds between cellulose chains break and re-form as the chains slide.';}
    else{st='Elastic';head=i===0?'Elastic: the solid bar bends':'Elastic: walls along the beam stretch and shorten';why=i===0?'All of the wall solid is packed into a small section, close to the centre line, where bending does little.':'The walls run along the beam, so they carry load by stretching like the solid does. Spreading the same mass over a bigger section keeps E falling only as ρ/ρ<sub>s</sub>, while I grows much faster.';}
    return {mat:i===0?'wooddense':'wood',label:i===0?'Solid bar':'Aligned cells',where,sign,e:s.e,pl:s.pH,fr:s.fH,band:0,steps,stage:st,head,why,
      measure:'<b>Measure it:</b> a three-point bending test. Watch the squeezed face: a wrinkle (compression crease) appears before the stretched face breaks.'};},
  chartTest(svg,leg){const c=SER(),m=this.model(),cols=[c.a,m.pr?c.b:c.c],ser=[],marks=[];
    m.S.forEach((s,i)=>{const dF=CEL.drop*s.Pf/s.psi*1000;ser.push({pts:[[0,0],[dF,s.Pf]],c:cols[i],w:2.8});ser.push({pts:[[dF,s.Pf],[1e4,s.Pf*(i===1&&!m.pr?1.03:0.6)]],c:cols[i],dash:'6 4',w:2});
      marks.push({x:s.drop*1000+s.rot*CEL.L*1000*.8,y:m.P,c:cols[i]});});
    plot(svg,{x:{min:0,max:240,label:'Tip deflection δ (mm), to the drawing’s scale'},y:{min:0,max:2.05,label:'Tip load F / F₀'},series:ser,marks,hl:[{v:m.P,c:c.cr,dash:'1 0',w:1},{v:1,c:c.a,dash:'2 4',label:'solid bar breaks (F₀)'}]});
    legend(leg,[{c:c.a,t:'Solid bar'},{c:cols[1],t:m.pr?'Aligned cells':'Foam'},{c:c.mu,t:'after failure',dash:1},{c:c.cr,t:'applied load'}]);},
  chartDesign(svg,leg){const c=SER(),m=this.model(),E=m.pr?m.rel*CEL.Es:m.rel*m.rel*CEL.Es;
    ashbyChart(svg,{solid:[CEL.rs,CEL.Es],solidLabel:'cell-wall solid',lines:[{slope:1,c:c.b,label:'aligned cells: E ~ ρ',at:.8},{slope:2,c:c.c,label:'foam: E ~ ρ²',at:.9}],
      points:[{x:m.rel*CEL.rs,y:E,c:m.pr?c.b:c.c,label:(m.pr?'aligned':'foam')+' '+sig(E)+' GPa',dx:-10,anchor:'end'}]});
    legend(leg,[{c:c.b,t:'Slope 1: walls stretch',dash:1},{c:c.c,t:'Slope 2: walls bend',dash:1},{c:c.fg,t:'Solid ■ and expanded ●'}]);},
};

/* =========================== 4. LATTICES =========================== */
// Ti-6Al-4V (printed): E_s 115 GPa, sigma_s ~1000 MPa. Octet: E = rel/3 E_s (13.27), sigma = min(rel/3 sigma_s (13.28), 0.2 rel^2 E_s (13.29)).
// Open BCC lattice (M < 0): E = rel^2 E_s (13.18), sigma_pl = 0.3 rel^1.5 sigma_s (13.20). Elastic squash drawn 8x; ratio true.
const LAT={c:0.09,n:3,Es:115e3,ss:1000,rs:4430,X:8,smax:120};
class SCurve extends THREE_Curve(){constructor(a){super();this.a=a;}getPoint(t,o){o=o||new THREE.Vector3();return o.set(this.a*(3*t*t-2*t*t*t-t),t-0.5,0);}}
function THREE_Curve(){return window.THREE?THREE.Curve:class{};}
function latticeNodesStruts(type){const c=LAT.c,n=LAT.n,key=p=>p.map(v=>Math.round(v*1e4)).join(',');const nodes=[],idx=new Map(),struts=[];
  const add=p=>{const k=key(p);if(!idx.has(k)){idx.set(k,nodes.length);nodes.push(p);}return idx.get(k);};
  if(type==='octet'){for(let i=0;i<=2*n;i++)for(let j=0;j<=2*n;j++)for(let k=0;k<=2*n;k++)if((i+j+k)%2===0)add([i*c/2,j*c/2,k*c/2]);const l=c/Math.SQRT2;
    for(let a=0;a<nodes.length;a++)for(let b=a+1;b<nodes.length;b++){const d=Math.hypot(nodes[a][0]-nodes[b][0],nodes[a][1]-nodes[b][1],nodes[a][2]-nodes[b][2]);if(Math.abs(d-l)<1e-6)struts.push([a,b,0]);}}
  else{for(let i=0;i<n;i++)for(let j=0;j<n;j++)for(let k=0;k<n;k++){const ce=add([(i+.5)*c,(j+.5)*c,(k+.5)*c]);for(const dx of[0,1])for(const dy of[0,1])for(const dz of[0,1])struts.push([ce,add([(i+dx)*c,(j+dy)*c,(k+dz)*c]),j]);}}
  return {nodes,struts};}
RIG.lattice={hist:[0,0],histF:[0,0],items:[{type:'octet',x:-0.3,name:'Octet truss'},{type:'bcc',x:0.3,name:'Open lattice'}],view:{dir:[0.5,0.42,1.25],lift:-0.02},legend:['Strut strain (relative)','low','high'],
  sigma(){const u=+$('l-P').value;return LAT.smax*u*u;},
  model(){const rel=+$('l-r').value,s=this.sigma(),Eo=rel/3*LAT.Es,Eb=rel*rel*LAT.Es,so=Math.min(rel/3*LAT.ss,0.2*rel*rel*LAT.Es),sb=0.3*Math.pow(rel,1.5)*LAT.ss;
    const o={E:Eo,sf:so,buck:0.2*rel*rel*LAT.Es<rel/3*LAT.ss},b={E:Eb,sf:sb};
    o.pl=s>so?clamp((s-so)/(0.05*so),0,1):0;o.fr=s>1.03*so?clamp((s-1.03*so)/(0.12*so),0,1):0;
    b.pl=s>sb?clamp((s-sb)/(0.12*sb),0,1):0;b.crush=s>sb?clamp((s-sb)/(1.3*sb),0,1):0;b.fr=clamp((b.crush-.55)/.45,0,1);
    [o,b].forEach((x,i)=>{this.hist[i]=Math.max(this.hist[i],x.pl);this.histF[i]=Math.max(this.histF[i],i?x.crush:x.fr);x.pH=this.hist[i];x.fH=this.histF[i];x.e=Math.min(1,s/x.sf);x.eps=Math.min(s,x.sf)/x.E;});
    b.cH=this.histF[1];b.frH=clamp((b.cH-.55)/.45,0,1);return {rel,s,S:[o,b]};},
  build(){clearRig();if(!HAS3D)return;const H=LAT.c*LAT.n;bedPlate(1.25,.6,0,0);
    for(const it of this.items){Object.assign(it,latticeNodesStruts(it.type));const g=new THREE.Group();g.position.x=it.x;rig.add(g);it.g=g;
      box(.42,.05,.42,M.chrome,0,.065,0,g);it.top=box(.42,.05,.42,M.chrome,0,0,0,g);const yTop=.09+H+.3;
      for(const sx of [-1,1]){cyl(.022,yTop,M.chrome,sx*.25,yTop/2+.04,-.16,g,20);}box(.6,.09,.12,M.paint,0,yTop,-.12,g);box(.16,.09,.22,M.paint,0,yTop,-.02,g);
      cyl(.06,.14,M.paint,0,yTop-.115,0,g);it.ramTop=yTop-.19;it.ram=cyl(.026,1,M.chrome,0,0,0,g);
      if(it.type==='octet'){const tg=new THREE.CylinderGeometry(1,1,1,10,1);it.inst=[new THREE.InstancedMesh(tg,M.ti,it.struts.length*2)];}
      else it.inst=[0,1,2].map(()=>new THREE.InstancedMesh(new THREE.TubeGeometry(new SCurve(0),14,1,8,false),M.ti,it.struts.filter(s=>s[2]===0).length));
      for(const im of it.inst){im.frustumCulled=false;im.castShadow=true;im.receiveShadow=true;im.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(im.count*3),3);track(im,M.ti);g.add(im);}
      it.tF=tag('','force',true);it.tSup=tag('rigid platens','sup',true);it.tSec=tag('','sec',true);it.tState=tag('');}
    this.update();},
  update(){const m=this.model();this.S=m.S;const {rel,s}=m,[o,b]=m.S;
    $('o-lr').textContent=fmt(rel,3);$('o-lP').textContent=sig(s,2)+' MPa';
    $('l-res').innerHTML=`<span class="big">${fmt(o.E/b.E,1)}× <span>stiffer</span></span><small>and ${fmt(o.sf/b.sf,1)}× stronger: octet truss vs open lattice at the same density.</small>`;
    $('eq-l1').innerHTML=`octet cell: b = 36, j = 14 → <b>M = 0</b> (rigid: struts stretch) · open cell: b = 8, j = 9 → <b>M = −13</b> (struts bend)`;
    $('eq-l2').innerHTML=`E = ⅓ × ${fmt(rel,3)} × 115 GPa = <b>${sig(o.E/1000)} GPa</b> · σ = <b>${sig(o.sf)} MPa</b>${o.buck?' (struts buckle first, Eq 13.29)':''}`;
    $('eq-l3').innerHTML=`E = ${fmt(rel,3)}² × 115 GPa = <b>${sig(b.E/1000)} GPa</b> · σ<sub>pl</sub> = <b>${sig(b.sf)} MPa</b>`;
    if(!HAS3D||!this.items[0].inst)return;const c=LAT.c,H=c*LAT.n,mtx=new THREE.Matrix4(),up=new THREE.Vector3(0,1,0),white=new THREE.Color(1,1,1),zero=new THREE.Matrix4().makeScale(0,0,0);
    this.items.forEach((it,ii)=>{const st=m.S[ii],oct=it.type==='octet',x0=-H/2,z0=-H/2,y0=.09;
      const epsD=LAT.X*st.eps;let r=oct?(c/Math.SQRT2)*Math.sqrt(rel/(6*Math.SQRT2*Math.PI)):c*Math.sqrt(rel/(4*Math.sqrt(3)*Math.PI));
      let nodeP;const q=[0,0,0];
      if(oct){const slide=.6*c*smooth(st.fH>0?Math.max(st.fH,.15):st.pH*.15);
        nodeP=p=>{let x=p[0],y=p[1]*(1-epsD);const side=-(p[0]-H/2)+(p[1]-H/2)>1e-6;if(side){x-=slide/Math.SQRT2;y-=slide/Math.SQRT2;}return new THREE.Vector3(x0+x,y0+y,z0+p[2]);};
        it.side=p=>-(p[0]-H/2)+(p[1]-H/2)>1e-6;}
      else{const cr=st.cH!=null?st.cH:0;[1,0,2].forEach((l,k)=>{q[l]=0.6*clamp(cr*3-k,0,1);});
        const hs=[0,1,2].map(l=>c*(1-epsD)*(1-q[l]));nodeP=p=>{const l=Math.min(2,Math.floor(p[1]/c+1e-6)),f=p[1]/c-l;let y=0;for(let k=0;k<l;k++)y+=hs[k];y+=(l<3?hs[Math.min(2,l)]*f:0);return new THREE.Vector3(x0+p[0],y0+y,z0+p[2]);};}
      if(oct){const im=it.inst[0];let n=0;const broken=st.fH>.25;
        const put=(p,qq,v)=>{const d=qq.clone().sub(p),len=d.length(),yv=d.clone().normalize();let xv=up.clone().sub(yv.clone().multiplyScalar(up.dot(yv)));if(xv.lengthSq()<1e-8)xv.set(1,0,0);xv.normalize();const zv=new THREE.Vector3().crossVectors(xv,yv);
          mtx.makeBasis(xv.multiplyScalar(r),yv.multiplyScalar(len),zv.multiplyScalar(r));mtx.setPosition(p.clone().add(qq).multiplyScalar(.5));im.setMatrixAt(n,mtx);im.setColorAt(n,strainOn?cmap(v):white);n++;};
        for(const [a,bb] of it.struts){const A=it.nodes[a],B=it.nodes[bb],p=nodeP(A),qq=nodeP(B),d=qq.clone().sub(p),cos2=(d.y/d.length())**2;const cross=it.side(A)!==it.side(B);
          let v=st.e*.85*cos2;if(cross&&st.pH>0)v=Math.max(v,.95+.2*st.fH);
          if(cross&&broken){put(p,p.clone().lerp(qq,.38),1.1);put(qq,qq.clone().lerp(p,.38),1.1);}else put(p,qq,v);}
        while(n<im.count){im.setMatrixAt(n,zero);n++;}im.instanceMatrix.needsUpdate=true;im.instanceColor.needsUpdate=true;}
      else{const lb=c*Math.sqrt(3)/2;it.inst.forEach((im,l)=>{const amp=0.9*epsD*lb+q[l]*0.55*lb;im.geometry.dispose();const g=new THREE.TubeGeometry(new SCurve(amp),14,r,8,false);
          const col=new Float32Array(g.attributes.position.count*3);for(let i=0;i<g.attributes.position.count;i++){const u=Math.floor(i/9)/14;let v=strainOn?Math.min(1.2,(.25+.75*st.e)*Math.pow(Math.abs(1-2*u),1.5)):0;if(strainOn&&(st.pH>0||q[l]>0))v=Math.max(v,Math.pow(Math.abs(1-2*u),3)*(1+q[l]));const cc=cmap(v);col[3*i]=cc.r;col[3*i+1]=cc.g;col[3*i+2]=cc.b;}
          g.setAttribute('color',new THREE.BufferAttribute(col,3));im.geometry=g;let n=0;
          for(const [a,bb,lay] of it.struts){if(lay!==l)continue;const p=nodeP(it.nodes[a]),qq=nodeP(it.nodes[bb]),d=qq.clone().sub(p),len=d.length(),yv=d.clone().normalize();let xv=up.clone().sub(yv.clone().multiplyScalar(up.dot(yv)));if(xv.lengthSq()<1e-8)xv.set(1,0,0);xv.normalize();const zv=new THREE.Vector3().crossVectors(xv,yv);
            mtx.makeBasis(xv,yv.multiplyScalar(len),zv);mtx.setPosition(p.clone().add(qq).multiplyScalar(.5));im.setMatrixAt(n,mtx);im.setColorAt(n,white);n++;}
          im.instanceMatrix.needsUpdate=true;im.instanceColor.needsUpdate=true;im.material=strainOn?M.strain:M.ti;});}
      if(oct)it.inst[0].material=strainOn?M.strainInst:M.ti;
      let topY=0;for(const p of it.nodes)topY=Math.max(topY,nodeP(p).y);it.top.position.y=topY+.025;const rb=topY+.05,len=Math.max(.02,it.ramTop-rb);it.ram.scale.y=len;it.ram.position.y=rb+len/2;
      const X=it.x;it.tF.pos.set(X+.15,topY+.09,.2);it.tF.el.textContent='σ = F/A = '+sig(s,2)+' MPa';it.tSup.pos.set(X-.15,.04,.24);
      it.tSec.pos.set(X,.02,.26);it.tSec.el.innerHTML=`<span><b>${it.name}</b>ρ/ρ<sub>s</sub> = ${fmt(rel,3)} · E = ${sig(st.E/1000)} GPa · strut d/c = ${fmt(2*r/c,2)}</span>`;
      it.tState.pos.set(X,topY+.2,0);const bad=st.pH>0;it.tState.el.className='tag '+(bad?'bad':'ok');it.tState.el.textContent=!bad?'elastic':oct?(st.fH>.25?'SHEAR BAND: struts snapped':'YIELDING'):(st.cH>.3?'LAYERS COLLAPSING':'HINGES AT JOINTS');
      const hn=oct?[1.5*c,1.5*c,3*c]:[c,2*c,3*c];it.hot=nodeP(hn).add(new THREE.Vector3(X,0,0));});},
  pick:['Octet truss','Open lattice'],auto(){const s=this.S;const r=s.map(x=>x.pH>0?2+(x.fH||0):x.e);return r[1]>=r[0]?1:0;},
  story(i){const s=this.S[i];
    if(i===0){const steps=['Elastic','Yield','Struts snap'];let st,head,why,sign=-1;
      if(s.fH>0){st='Struts snap';sign=1;head='Struts snap along a 45° band';why='Printed struts carry bumps of half-melted powder and small pores. Cracks start at these flaws and run across the fine α′ needles. Once a band of struts has broken, the lattice shears along it and the load drops.';}
      else if(s.pH>0){st='Yield';head='The struts yield in compression';why='Slip starts inside the α′ martensite needles of the printed alloy. Titanium’s hexagonal crystal has few easy slip planes, so the struts harden very little and soon run out of ductility.';}
      else{st='Elastic';head='Elastic: struts stretch and shorten';why='Triangulated struts cannot rotate without changing length, so they carry the load along their axes. That is why stiffness falls only in proportion to density: E ≈ ⅓(ρ/ρ<sub>s</sub>)E<sub>s</sub>.';}
      return {mat:'ti',label:'Octet truss',where:'a strut in the middle of the block',sign,e:s.e,pl:s.pH,fr:s.fH,band:0,steps,stage:st,head,why,
        measure:'<b>Measure it:</b> a compression test. A stretch-dominated lattice shows a high peak stress, then a sharp drop when the shear band forms.'};}
    const steps=['Elastic','Hinges','Layers collapse'];let st,head,why;
    if(s.frH>0||s.cH>.3){st='Layers collapse';head='One layer folds flat, then the next';why='Hinged layers collapse while the stress stays almost constant. In the printed alloy the joints are the roughest, most strained spots, so small cracks open there as the struts fold.';}
    else if(s.pH>0){st='Hinges';head='Plastic hinges at the joints';why='Bending is largest at the ends of each strut, where it meets the joint. Dislocations glide in the α′ needles there first, and the strut ends rotate like hinges.';}
    else{st='Elastic';head='Elastic: struts bend into S-shapes';why='The open lattice has too few struts to be rigid (Maxwell M &lt; 0). The joints rotate and the struts bend, so stiffness falls as (ρ/ρ<sub>s</sub>)². The strain is highest at the strut ends.';}
    return {mat:'ti',label:'Open lattice',where:'a strut end at a joint',sign:1,e:s.e,pl:s.pH,fr:s.frH,band:0,steps,stage:st,head,why,
      measure:'<b>Measure it:</b> a compression test. A bending-dominated lattice shows a low yield stress followed by a long, flat plateau as layers collapse.'};},
  chartTest(svg,leg){const c=SER(),m=this.model(),[o,b]=m.S,eyb=b.sf/b.E*100,xmax=Math.max(3*eyb,1.6*o.sf/o.E*100);
    plot(svg,{x:{min:0,max:xmax,label:'Strain ε (%)'},y:{min:0,max:Math.max(o.sf*1.3,m.s*1.1),label:'Stress σ (MPa)'},
      series:[{pts:[[0,0],[o.sf/o.E*100,o.sf]],c:c.b,w:2.8},{pts:[[o.sf/o.E*100,o.sf],[o.sf/o.E*100*1.15,o.sf*.45],[xmax*1.2,o.sf*.5]],c:c.b,dash:'6 4',w:2},
        {pts:[[0,0],[eyb,b.sf]],c:c.c,w:2.8},{pts:[[eyb,b.sf],[xmax*1.2,b.sf*1.12]],c:c.c,dash:'6 4',w:2}],
      hl:[{v:m.s,c:c.cr,dash:'1 0',w:1}],
      marks:[{x:Math.min(m.s,o.sf)/o.E*100+(o.pH>0?o.sf/o.E*100*.5*o.fH:0),y:m.s,c:c.b},{x:Math.min(m.s,b.sf)/b.E*100+(b.cH||0)*xmax,y:m.s,c:c.c}],
      texts:[{x:o.sf/o.E*100,y:o.sf,t:'peak, then shear band',dx:8,dy:-6,c:c.b},{x:xmax,y:b.sf*1.1,t:'plateau: layers collapse',anchor:'end',dy:-8,c:c.c}]});
    legend(leg,[{c:c.b,t:'Octet truss (stretch)'},{c:c.c,t:'Open lattice (bend)'},{c:c.mu,t:'after failure',dash:1},{c:c.cr,t:'applied load'}]);},
  chartDesign(svg,leg){const c=SER(),m=this.model(),[o,b]=m.S;
    ashbyChart(svg,{solid:[LAT.rs,LAT.Es/1000],solidLabel:'Ti-6Al-4V',lines:[{slope:1,c:c.b,label:'stretch: E ~ ρ',at:.7},{slope:2,c:c.c,label:'bend: E ~ ρ²',at:.85}],
      points:[{x:m.rel*LAT.rs,y:o.E/1000,c:c.b,label:'octet',dx:-10,anchor:'end'},{x:m.rel*LAT.rs,y:b.E/1000,c:c.c,label:'open',dx:-10,anchor:'end'}]});
    legend(leg,[{c:c.b,t:'Slope 1: struts stretch',dash:1},{c:c.c,t:'Slope 2: struts bend',dash:1}]);},
};

/* =========================== 5. CORRUGATION =========================== */
// Galvanized S280GD sheet cantilevers 0.7 m x 0.3 m, t = 2 mm. phi_e = (2a+t)^2/t^2 (Eq. 12.8), phi_f = (2a+t)/t (Eq. 12.9), ideal.
const SHT={L:0.7,W:0.3,t:0.002,lam:0.06,E:210e9,sy:280e6,Fmax:1000};SHT.I0=SHT.W*SHT.t**3/12;SHT.Z0=SHT.W*SHT.t**2/6;SHT.Fy0=SHT.sy*SHT.Z0/SHT.L;
function sheetShape(a){const n=240,pts=[],W=SHT.W,t=SHT.t;for(let i=0;i<=n;i++){const x=-W/2+W*i/n;pts.push([x,a*Math.sin(2*Math.PI*(x+W/2)/SHT.lam)]);}
  const sh=new THREE.Shape();sh.moveTo(pts[0][0],pts[0][1]+t/2);for(const q of pts)sh.lineTo(q[0],q[1]+t/2);for(let i=pts.length-1;i>=0;i--)sh.lineTo(pts[i][0],pts[i][1]-t/2);sh.closePath();return sh;}
RIG.sheet={hist:[0,0],histF:[0,0],items:[{name:'Flat sheet',x:-.2},{name:'Corrugated',x:.2}],view:{dir:[0.85,0.75,1.35],lift:-0.05},legend:['Bending strain / yield strain','0','yield'],
  F(){const u=+$('s-P').value;return SHT.Fmax*u*u;},
  model(){const at=+$('s-a').value,a=at*SHT.t,F=this.F(),pe=(2*at+1)**2,pf=2*at+1,phis=[[1,1],[pe,pf]];
    const S=phis.map(([e,f],i)=>{const Fy=SHT.Fy0*f,pl=F>Fy?clamp((F-Fy)/(0.25*Fy),0,1):0,fr=F>1.5*Fy?clamp((F-1.5*Fy)/(0.5*Fy),0,1):0;this.hist[i]=Math.max(this.hist[i],pl);this.histF[i]=Math.max(this.histF[i],fr);
      const Fe=Math.min(F,Fy);return {phe:e,phf:f,Fy,pl,fr,pH:this.hist[i],fH:this.histF[i],drop:Fe*SHT.L**3/(3*SHT.E*SHT.I0*e),rot:0.62*smooth(this.hist[i]),e:Math.min(1,F/Fy)};});
    return {at,a,F,pe,pf,S};},
  build(){clearRig();if(!HAS3D)return;box(1.0,.62,.16,M.concrete,0,.31,-.13);box(.92,.03,.16,M.paint,0,.645,-.05);
    for(const x of [-.4,-.2,0,.2,.4])hexBolt(.016,x,.677,-.05);this.clampTop=box(.92,.03,.07,M.paint,0,.69,-.015);
    this.flat=track(mesh(new THREE.ExtrudeGeometry(sheetShape(0),{depth:SHT.L,steps:60,bevelEnabled:false}),M.galv),M.galv);this.flat.position.set(-.2,.666,0);rig.add(this.flat);
    this.cor=null;this.lastA=-1;this.arr=[arrow(.12,.016),arrow(.12,.016)];this.ws=[weightStack(.12,.04),weightStack(.12,.04)];this.bar=[box(.3,.008,.016,M.paintDark,0,0,0),box(.3,.008,.016,M.paintDark,0,0,0)];
    this.tF=[tag('','force',true),tag('','force',true)];this.tSup=tag('fixed support (clamped edge)','sup',true);this.tSec=[tag('','sec',true),tag('','sec',true)];this.tState=[tag(''),tag('')];
    this.dim=dimLine(new THREE.Vector3(1,0,0));this.tDim=tag('','dim',true);this.update();},
  update(){const m=this.model();this.S=m.S;const {at,a,F}=m;
    $('o-sa').textContent=fmt(at,2);$('o-sP').textContent=sig(F,3)+' N';
    $('s-res').innerHTML=`<span class="big">${fmt(m.pe,m.pe<10?1:0)}× <span>stiffer</span></span><small>and ${fmt(m.pf,1)}× stronger than the flat sheet (ideal, Eqs 12.8–12.9). Flat yields at ${fmt(SHT.Fy0,0)} N; corrugated at ${sig(SHT.Fy0*m.pf)} N.</small>`;
    $('eq-s1').innerHTML=`I<sub>0</sub> = 0.3 m × (2 mm)³/12 = <b>2.0×10⁻¹⁰ m⁴</b> · flat tip drop now <b>${fmt(m.S[0].drop*1000,0)} mm</b>, corrugated <b>${fmt(m.S[1].drop*1000,1)} mm</b>`;
    $('eq-s2').innerHTML=`a = ${fmt(a*1000,1)} mm: φ<sub>e</sub> = (2×${fmt(a*1000,1)} + 2)²/2² = <b>${fmt(m.pe,m.pe<10?1:0)}</b>`;
    $('eq-s3').innerHTML=`φ<sub>f</sub> = (2×${fmt(a*1000,1)} + 2)/2 = <b>${fmt(m.pf,1)}</b> → yields at φ<sub>f</sub> × ${fmt(SHT.Fy0,0)} N = <b>${sig(SHT.Fy0*m.pf)} N</b>`;
    if(!HAS3D||!this.flat)return;
    if(this.lastA!==a){if(this.cor){rig.remove(this.cor);this.cor.geometry.dispose();untrack(this.cor);}this.cor=track(mesh(new THREE.ExtrudeGeometry(sheetShape(a),{depth:SHT.L,steps:60,bevelEnabled:false,curveSegments:1}),M.galv),M.galv);this.cor.position.set(.2,.666,0);rig.add(this.cor);this.lastA=a;}
    const L=SHT.L;[[this.flat,0],[this.cor,a]].forEach(([o,amp],i)=>{const s=m.S[i],x=this.items[i].x,half=amp+SHT.t/2;
      bendExtrude(o.geometry,L,s.drop,(u,y)=>{let v=s.e*(1-u)*Math.abs(y)/half;if(s.pH>0)v=Math.max(v,1.2*Math.exp(-u/.04)*Math.abs(y)/half);return v;},s.rot,.012);
      const [yt,zt]=bentPoint(L,s.drop,s.rot,.012,half,L),[yb,zb]=bentPoint(L,s.drop,s.rot,.012,-half,L);
      this.arr[i].position.set(x,.666+yt+.004,zt-.02);this.bar[i].position.set(x,.666+yb-.006,zb-.02);this.bar[i].rotation.x=-s.rot;this.ws[i].position.set(x,.666+yb-.012,zb-.02);this.ws[i].setCount(Math.max(1,F/80));
      this.tF[i].pos.set(x,.666+yt+.17,zt);this.tF[i].el.textContent='F = '+sig(F,3)+' N';
      this.tState[i].pos.set(x+.08,.666+yb-.2,zb);const bad=s.pH>0;this.tState[i].el.className='tag '+(bad?'bad':'ok');this.tState[i].el.textContent=!bad?'elastic':s.pl>0?(s.fH>0?'FOLDED: zinc cracking':'YIELDED at the clamp'):'permanently bent';
      this.tSec[i].pos.set(x,.666+.1,.1);this.tSec[i].el.innerHTML=secSVG(i?'wave':'flat',{a:Math.min(9,2+at*1.5)})+`<span><b>${i?'Corrugated, a = '+fmt(amp*1000,1)+' mm':'Flat, t = 2 mm'}</b>φ<sub>e</sub> = ${fmt(s.phe,s.phe<10?1:0)} · φ<sub>f</sub> = ${fmt(s.phf,1)}</span>`;
      const xc=i?-SHT.W/2+SHT.lam/4+SHT.lam*Math.round((SHT.W/2-SHT.lam/4)/SHT.lam):0;const [Y,Z]=bentPoint(L,s.drop,s.rot,.012,half,.02);this.items[i].hot=new THREE.Vector3(x+xc,.666+Y,Z);});
    this.tSup.pos.set(0,.74,-.02);this.dim.set(new THREE.Vector3(-.39,.62,0),new THREE.Vector3(-.39,.62,L),.02);this.tDim.pos.set(-.39,.62,L*.5);this.tDim.el.textContent='L = 0.70 m';},
  pick:['Flat sheet','Corrugated'],auto(){const s=this.S;const r=s.map(x=>x.pH>0?2+x.fH:x.e);return r[1]>r[0]?1:0;},
  story(i){const s=this.S[i],steps=['Elastic','Yield at surface','Fold','Zinc cracks'];let st,head,why;
    if(s.fH>0){st='Zinc cracks';head='The zinc coating cracks across the fold';why='Zinc is much less ductile than the steel under it. Where the fold stretches the top surface, fine cracks open across the coating. The steel is still whole, but it will now rust along these cracks.';}
    else if(s.pH>.45){st='Fold';head=s.pl>0?'Fold line: slip right through the thickness':'Unloaded: the fold stays';why='The whole section at the clamp has yielded, so the sheet rotates there like a hinge. Removing the load takes away only the small elastic part of the bend.';}
    else if(s.pH>0){st='Yield at surface';head='Yield starts at the top and bottom faces';why='Bending strain is largest at the surfaces at the clamp. Slip starts in the ferrite grains there, while the middle of the sheet is still elastic.';}
    else{st='Elastic';head='Elastic: top stretches, bottom squeezes';why=i?'The wave moves steel far from the middle of the section, so the same load gives far less strain: φ<sub>f</sub> = (2a + t)/t.':'All of the steel sits within 1 mm of the middle of the section, so it bends easily and the surface strain climbs fast.';}
    return {mat:'galv',label:this.items[i].name,where:'top face, at the clamp',sign:1,e:s.e,pl:s.pH,fr:s.fH,band:0,steps,stage:st,head,why,
      measure:'<b>Measure it:</b> hang known weights and read the tip drop with a ruler or dial gauge; the slope of load vs drop gives EI.'};},
  chartTest(svg,leg){const c=SER(),m=this.model(),cols=[c.a,c.b],ser=[],marks=[];let xmax=0;
    m.S.forEach((s,i)=>{const dY=s.Fy*SHT.L**3/(3*SHT.E*SHT.I0*s.phe)*1000;xmax=Math.max(xmax,dY*1.6);ser.push({pts:[[0,0],[dY,s.Fy]],c:cols[i],w:2.8},{pts:[[dY,s.Fy],[1e5,s.Fy*1.04]],c:cols[i],dash:'6 4',w:2});
      marks.push({x:s.drop*1000+Math.sin(s.rot)*SHT.L*1000,y:m.F,c:cols[i]});});
    plot(svg,{x:{min:0,max:Math.min(xmax,420),label:'Tip deflection δ (mm)'},y:{min:0,max:Math.max(m.S[1].Fy*1.15,m.F*1.1,120),label:'Tip load F (N)'},series:ser,marks,
      hl:[{v:m.F,c:c.cr,dash:'1 0',w:1}],texts:[{x:Math.min(xmax,420),y:m.S[0].Fy,t:'flat yields',anchor:'end',dy:-7,c:c.a}]});
    legend(leg,[{c:c.a,t:'Flat sheet'},{c:c.b,t:'Corrugated'},{c:c.mu,t:'after yield',dash:1},{c:c.cr,t:'applied load'}]);},
  chartDesign(svg,leg){const c=SER(),m=this.model(),pe=[],pf=[];for(let i=0;i<=100;i++){const x=5*i/100;pe.push([x,(2*x+1)**2]);pf.push([x,2*x+1]);}
    plot(svg,{x:{min:0,max:5,label:'Wave amplitude / thickness a/t'},y:{min:1,max:150,log:true,label:'Gain over the flat sheet φ',ticks:[1,2,5,10,20,50,100]},
      series:[{pts:pe,c:c.b,w:2.8},{pts:pf,c:c.c,w:2.8}],vl:[{v:m.at,c:c.mu,dash:'2 3'}],
      marks:[{x:m.at,y:m.pe,c:c.b,label:'φ<tspan baseline-shift="sub" font-size="9">e</tspan> = '+fmt(m.pe,m.pe<10?1:0),dx:-10,anchor:'end'},{x:m.at,y:m.pf,c:c.c,label:'φ<tspan baseline-shift="sub" font-size="9">f</tspan> = '+fmt(m.pf,1),dx:10}]});
    legend(leg,[{c:c.b,t:'Stiffness φ<sub>e</sub> = (2a+t)²/t² (Eq 12.8)'},{c:c.c,t:'Strength φ<sub>f</sub> = (2a+t)/t (Eq 12.9)'}]);},
};
