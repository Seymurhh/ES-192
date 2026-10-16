/* ===================== core: helpers, renderer, materials, fixtures ===================== */
const $=id=>document.getElementById(id);
const css=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const lerp=(a,b,t)=>a+(b-a)*t;
const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
const fmt=(x,d=1)=>Number(x).toLocaleString('en-US',{maximumFractionDigits:d,minimumFractionDigits:d});
/* 3 significant figures, thousands separator, never scientific */
const sig=(x,n=3)=>{if(!isFinite(x))return '–';if(x===0)return '0';const d=Math.max(0,n-1-Math.floor(Math.log10(Math.abs(x))));return fmt(x,Math.min(d,4));};
/* a×10ⁿ for big/small second moments */
const SUP={'-':'⁻','0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'};
const sci=(x,n=2)=>{if(x===0)return '0';const e=Math.floor(Math.log10(Math.abs(x)));const m=x/Math.pow(10,e);if(e>=-2&&e<=4)return sig(x,n+1);return fmt(m,n-1)+'×10'+String(e).split('').map(c=>SUP[c]).join('');};
function rng(seed){let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}

let HAS3D=!!(window.THREE&&THREE.OrbitControls);
const stage=$('stage'), canvas=$('cv'), tagLayer=$('tags');
let R=null, scene=null, camera=null, controls=null, key=null;
try{
  if(!HAS3D)throw new Error('no three');
  R=new THREE.WebGLRenderer({canvas,antialias:true});
  R.setPixelRatio(Math.min(2,window.devicePixelRatio||1));
  R.shadowMap.enabled=true; R.shadowMap.type=THREE.PCFSoftShadowMap;
  R.outputEncoding=THREE.sRGBEncoding; R.toneMapping=THREE.ACESFilmicToneMapping; R.toneMappingExposure=0.85;
}catch(e){HAS3D=false;}
if(!HAS3D){canvas.remove();const f=document.createElement('div');f.id='fallback';f.innerHTML='<p>The 3D rig needs WebGL, which this browser has turned off.<br>The microscope, equations and chart below still work.</p>';stage.appendChild(f);$('hint').hidden=true;document.querySelector('.tools').hidden=true;}

/* ---------- scene, studio lighting ---------- */
if(HAS3D){
  scene=new THREE.Scene();
  camera=new THREE.PerspectiveCamera(32,16/10,0.01,60);
  controls=new THREE.OrbitControls(camera,canvas);
  controls.enableDamping=true; controls.enablePan=true; controls.screenSpacePanning=true; controls.minDistance=0.3; controls.maxDistance=14; controls.maxPolarAngle=Math.PI*0.495;
  // soft-box studio for reflections
  const pm=new THREE.PMREMGenerator(R), es=new THREE.Scene();
  es.add(new THREE.Mesh(new THREE.BoxGeometry(12,7,12),new THREE.MeshBasicMaterial({color:0x7c7b80,side:THREE.BackSide})));
  const panel=(w,h,x,y,z,ry,rx,c)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:c,side:THREE.DoubleSide}));m.position.set(x,y,z);m.rotation.set(rx||0,ry||0,0);es.add(m);};
  panel(7,1.4,0,3.4,0,0,Math.PI/2,0xffffff); panel(2.4,3.2,-5.9,1.2,0,Math.PI/2,0,0xf4f0e8); panel(2.4,3.2,5.9,1.2,1,-Math.PI/2,0,0xdfe7f1);
  panel(5,1,0,1.6,-5.9,0,0,0xe9e9ee); panel(12,2,0,-3.4,0,0,-Math.PI/2,0x333337);
  scene.environment=pm.fromScene(es,0.035).texture; pm.dispose();
  scene.add(new THREE.HemisphereLight(0xffffff,0x5b5650,0.32));
  key=new THREE.DirectionalLight(0xfff5ea,1.15); key.castShadow=true;
  key.shadow.mapSize.set(2048,2048); key.shadow.bias=-0.0004; key.shadow.normalBias=0.012;
  scene.add(key,key.target);
  const fill=new THREE.DirectionalLight(0xdfe8ff,0.25); fill.position.set(-3,2,-2); scene.add(fill);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(40,40),new THREE.ShadowMaterial({opacity:.26}));
  floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; scene.add(floor);
}
function stageColour(){if(scene)scene.background=new THREE.Color(css('--stage')||'#cfccc7');}

/* ---------- textures (procedural, so the page works offline) ---------- */
function canvasTex(w,h,draw,rep,srgb=true){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);
  if(!HAS3D)return null;const t=new THREE.CanvasTexture(c);if(srgb)t.encoding=THREE.sRGBEncoding;t.wrapS=t.wrapT=THREE.RepeatWrapping;if(rep)t.repeat.set(rep[0],rep[1]);t.anisotropy=8;return t;}
const r0=rng(7);
const brushed=(base,streak)=>(g,w,h)=>{g.fillStyle=base;g.fillRect(0,0,w,h);for(let i=0;i<1400;i++){const y=r0()*h,l=40+r0()*260,x=r0()*w,a=.03+r0()*.07;g.strokeStyle=`rgba(${streak},${a})`;g.lineWidth=.6+r0();g.beginPath();g.moveTo(x,y);g.lineTo(x+l,y+(r0()-.5)*.6);g.stroke();}};
function noiseTex(base,amp,size=256,grain=1){return (g,w,h)=>{g.fillStyle=base;g.fillRect(0,0,w,h);const d=g.getImageData(0,0,w,h),p=d.data;for(let i=0;i<p.length;i+=4){const n=(r0()-.5)*amp;p[i]+=n;p[i+1]+=n;p[i+2]+=n;}g.putImageData(d,0,0);};}
function spangle(g,w,h){ // hot-dip zinc spangle: large faceted crystals in slightly different greys
  const S=[];for(let i=0;i<46;i++)S.push([r0()*w,r0()*h,150+r0()*55,r0()*Math.PI]);
  const d=g.createImageData(w,h),p=d.data;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){let b=1e9,k=0;for(let s=0;s<S.length;s++){let dx=Math.abs(x-S[s][0]),dy=Math.abs(y-S[s][1]);dx=Math.min(dx,w-dx);dy=Math.min(dy,h-dy);const q=dx*dx+dy*dy;if(q<b){b=q;k=s;}}
    const s=S[k],ang=Math.sin((x*Math.cos(s[3])+y*Math.sin(s[3]))*.9)*5,v=s[2]+ang+(r0()-.5)*6,i=4*(y*w+x);p[i]=v;p[i+1]=v+3;p[i+2]=v+7;p[i+3]=255;}
  g.putImageData(d,0,0);}

const M={};
if(HAS3D){
  const S=THREE.MeshStandardMaterial;
  M.steel=new S({color:0xb9bec4,metalness:.92,roughness:.3,side:THREE.DoubleSide,map:canvasTex(512,128,brushed('#c9cdd2','60,62,68'),[2,1])});
  M.millscale=new S({color:0x6f747b,metalness:.7,roughness:.48,side:THREE.DoubleSide,map:canvasTex(256,256,noiseTex('#8d9298',26),[3,3])});
  M.chrome=new S({color:0xeef0f2,metalness:1,roughness:.08});
  M.paint=new S({color:0x2f4a66,metalness:.25,roughness:.42});           // machine frame, blue-grey enamel
  M.paintDark=new S({color:0x26292e,metalness:.35,roughness:.5});
  M.castIron=new S({color:0x3a3c40,metalness:.55,roughness:.62,map:canvasTex(256,256,noiseTex('#55585e',30),[4,4])});
  M.slot=new S({color:0x17181a,metalness:.3,roughness:.8});
  M.alu=new S({color:0xd8dbdf,metalness:.9,roughness:.24,side:THREE.DoubleSide,map:canvasTex(512,128,brushed('#dfe2e6','90,94,100'),[2,1])});
  M.ti=new S({color:0x8f8c86,metalness:.8,roughness:.58,map:canvasTex(256,256,noiseTex('#a29f98',46),[6,6])});
  M.galv=new S({color:0xc7ccd1,metalness:.85,roughness:.34,side:THREE.DoubleSide,map:canvasTex(256,256,spangle,[3,3])});
  M.wood=new S({color:0xd2a670,metalness:0,roughness:.72});
  M.woodDense=new S({color:0x5a3a1c,metalness:0,roughness:.6});
  M.foam=new S({color:0xece4cf,metalness:0,roughness:.95});
  M.load=new S({color:0xa51c30,metalness:.1,roughness:.45});
  M.weight=new S({color:0x2a2b2e,metalness:.45,roughness:.55});
  M.brass=new S({color:0xb08d57,metalness:.9,roughness:.35});
  M.concrete=new S({color:0x8a8783,metalness:0,roughness:.95,map:canvasTex(256,256,noiseTex('#9a9792',34),[3,3])});
  M.strain=new S({vertexColors:true,metalness:.05,roughness:.55,side:THREE.DoubleSide});
  M.strainInst=new S({color:0xffffff,metalness:.05,roughness:.55});
  M.dim=new THREE.LineBasicMaterial({color:0x2a2a30});
  M.wood.map=canvasTex(512,64,(g,w,h)=>{g.fillStyle='#cfa269';g.fillRect(0,0,w,h);for(let i=0;i<80;i++){g.strokeStyle=`rgba(${110+r0()*40|0},${70+r0()*25|0},${30+r0()*20|0},${.14+r0()*.26})`;g.lineWidth=.5+r0()*1.6;const y=r0()*h;g.beginPath();g.moveTo(0,y);for(let x=0;x<=w;x+=32)g.lineTo(x,y+Math.sin(x*.01+i)*2);g.stroke();}});
  M.woodDense.map=canvasTex(512,64,(g,w,h)=>{g.fillStyle='#6a4524';g.fillRect(0,0,w,h);for(let i=0;i<90;i++){g.strokeStyle=`rgba(30,15,5,${.15+r0()*.3})`;g.lineWidth=.5+r0()*1.2;const y=r0()*h;g.beginPath();g.moveTo(0,y);g.lineTo(w,y+(r0()-.5)*3);g.stroke();}});
  M.foam.map=canvasTex(512,512,(g,w,h)=>{g.fillStyle='#efe7d4';g.fillRect(0,0,w,h);for(let i=0;i<900;i++){const x=r0()*w,y=r0()*h,r=3+r0()*9;const gr=g.createRadialGradient(x,y,r*.2,x,y,r);gr.addColorStop(0,'rgba(150,140,115,.5)');gr.addColorStop(.75,'rgba(190,182,160,.22)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,7);g.fill();}},[2,2]);
  M.ti.bumpMap=M.ti.map; M.ti.bumpScale=0.0015;
}

/* ---------- strain colour map (value 1 = yield/failure) ---------- */
const STOPS=[[0,'#2b4c7e'],[.35,'#2a9d8f'],[.65,'#e9c46a'],[.92,'#e76f51'],[1.0,'#b5172f']];
const LUT=[];(function(){if(!HAS3D)return;const cs=STOPS.map(s=>[s[0],new THREE.Color(s[1]).convertSRGBToLinear()]);for(let i=0;i<=256;i++){const v=i/256;let k=0;while(k<cs.length-2&&v>cs[k+1][0])k++;const a=cs[k],b=cs[k+1],f=clamp((v-a[0])/(b[0]-a[0]),0,1);LUT.push(a[1].clone().lerp(b[1],f));}})();
const cmap=v=>LUT[Math.round(clamp(v,0,1)*256)];
function cmapCSS(v){v=clamp(v,0,1);let k=0;while(k<STOPS.length-2&&v>STOPS[k+1][0])k++;const a=STOPS[k],b=STOPS[k+1],f=clamp((v-a[0])/(b[0]-a[0]),0,1);
  const h=s=>[1,3,5].map(i=>parseInt(s.slice(i,i+2),16));const A=h(a[1]),B=h(b[1]);return `rgb(${A.map((x,i)=>Math.round(x+(B[i]-x)*f)).join(',')})`;}
let strainOn=false, labelsOn=true;
const swappables=[];
function track(mesh,base){swappables.push({mesh,base});mesh.material=strainOn?(mesh.isInstancedMesh?M.strainInst:M.strain):base;return mesh;}
function untrack(mesh){const i=swappables.findIndex(s=>s.mesh===mesh);if(i>=0)swappables.splice(i,1);}
function applyMaterials(){for(const s of swappables)s.mesh.material=strainOn?(s.mesh.isInstancedMesh?M.strainInst:M.strain):s.base;}

/* ---------- rig container, tags, annotations ---------- */
let rig=HAS3D?new THREE.Group():null, anno=HAS3D?new THREE.Group():null; if(HAS3D)scene.add(rig,anno);
const tags=[];
function clearRig(){tags.length=0;tagLayer.innerHTML='';swappables.length=0;if(!HAS3D)return;
  for(const g of [rig,anno]){g.traverse(o=>{if(o.geometry)o.geometry.dispose();});scene.remove(g);}
  rig=new THREE.Group();anno=new THREE.Group();anno.visible=labelsOn;scene.add(rig,anno);}
function mesh(geo,mat,cast=true){const m=new THREE.Mesh(geo,mat);m.castShadow=cast;m.receiveShadow=true;return m;}
function box(w,h,d,mat,x,y,z,parent){const m=mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);(parent||rig).add(m);return m;}
function cyl(r,h,mat,x,y,z,parent,seg=32,rt){const m=mesh(new THREE.CylinderGeometry(rt==null?r:rt,r,h,seg),mat);m.position.set(x,y,z);(parent||rig).add(m);return m;}
/* tag(text, cls, isAnno): isAnno tags hide with the Labels toggle */
function tag(text,cls='',isAnno=false){const el=document.createElement('div');el.className='tag '+cls;el.innerHTML=text;tagLayer.appendChild(el);
  const t={el,pos:HAS3D?new THREE.Vector3():null,anno:isAnno,show:true};tags.push(t);return t;}
/* labels never sit on top of each other: each one is nudged up or down (whichever is shorter) past the ones already placed */
function placeTags(){if(!HAS3D)return;const w=stage.clientWidth,h=stage.clientHeight,placed=[];
  const z=$('zoom');if(zoomPos&&$('stagechart').hidden){const p=zoomPos.clone().project(camera);z.hidden=p.z>1;const zx=(p.x+1)/2*w,zy=(1-p.y)/2*h;z.style.left=zx+'px';z.style.top=zy+'px';
    if(!z.hidden)placed.push({x:zx-25,y:zy-25,w:50,h:50});}else z.hidden=true;
  const tb=document.querySelector('.tools');if(tb&&!tb.hidden)placed.push({x:tb.offsetLeft,y:tb.offsetTop,w:tb.offsetWidth,h:tb.offsetHeight});
  for(const t of tags){const p=t.pos.clone().project(camera);const vis=t.show&&p.z<1&&(!t.anno||labelsOn);t.el.style.display=vis?'':'none';if(!vis)continue;
    const tw=t.el.offsetWidth,th=t.el.offsetHeight;let x=clamp((p.x+1)/2*w-tw/2,4,Math.max(4,w-tw-4)),y=clamp((1-p.y)/2*h-th/2,4,Math.max(4,h-th-4));const y0=y;
    const free=yy=>!placed.some(r=>x<r.x+r.w+3&&x+tw+3>r.x&&yy<r.y+r.h+3&&yy+th+3>r.y);
    if(!free(y)){for(let k=1;k<14;k++){const s=k*(th/2+3);if(free(y0+s)){y=y0+s;break;}if(free(y0-s)){y=y0-s;break;}}}
    placed.push({x,y,w:tw,h:th});t.el.style.left=(x+tw/2)+'px';t.el.style.top=(y+th/2)+'px';}}
let zoomPos=null;

/* force arrow pointing -y with its tip at the group origin */
function arrow(len,rad,parent){const g=new THREE.Group();const sh=mesh(new THREE.CylinderGeometry(rad*.42,rad*.42,len*.68,20),M.load);sh.position.y=len*.66;const hd=mesh(new THREE.ConeGeometry(rad,len*.32,24),M.load);hd.rotation.x=Math.PI;hd.position.y=len*.16;g.add(sh,hd);(parent||anno).add(g);return g;}
/* dimension line between two points with end ticks; returns {set(p0,p1)} */
function dimLine(tickDir){const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(18),3));
  const ln=new THREE.LineSegments(geo,M.dim);anno.add(ln);const td=tickDir.clone().normalize();
  return {set(a,b,tk=0.03){const p=geo.attributes.position.array,q=[a,b,a.clone().addScaledVector(td,-tk),a.clone().addScaledVector(td,tk),b.clone().addScaledVector(td,-tk),b.clone().addScaledVector(td,tk)];q.forEach((v,i)=>{p[3*i]=v.x;p[3*i+1]=v.y;p[3*i+2]=v.z;});geo.attributes.position.needsUpdate=true;geo.computeBoundingSphere();}};}
function hexBolt(r,x,y,z,parent,axis='y'){const b=cyl(r,r*.7,M.paintDark,x,y,z,parent,6);if(axis==='z')b.rotation.x=Math.PI/2;if(axis==='x')b.rotation.z=Math.PI/2;return b;}
/* cast-iron T-slot bed plate, top at y = 0.04 */
function bedPlate(w,d,x=0,z=0){box(w,.04,d,M.castIron,x,.02,z);const n=Math.max(2,Math.round(d/.16));for(let i=0;i<n;i++){const zz=z-d/2+(i+.5)*d/n;box(w*.98,.004,.022,M.slot,x,.0405,zz).castShadow=false;}}
/* hanging weight stack: hook rod + discs; origin = hook point; returns group with .setCount(n) */
function weightStack(rod=0.18,discR=0.05){const g=new THREE.Group();
  const hook=mesh(new THREE.TorusGeometry(.016,.004,10,24),M.chrome);hook.rotation.y=Math.PI/2;hook.position.y=-.012;g.add(hook);
  const r=mesh(new THREE.CylinderGeometry(.005,.005,rod,10),M.chrome);r.position.y=-rod/2-.02;g.add(r);
  const discs=[];const plate=mesh(new THREE.CylinderGeometry(discR*.55,discR*.55,.006,24),M.chrome);plate.position.y=-rod-.02;g.add(plate);
  g.setCount=n=>{n=clamp(Math.round(n),0,14);while(discs.length<n){const d=mesh(new THREE.CylinderGeometry(discR,discR,.014,36),M.weight);g.add(d);discs.push(d);}
    discs.forEach((d,i)=>{d.visible=i<n;d.position.y=-rod-.02+.01+i*.0155;});};
  rig.add(g);return g;}

/* ---------- deformable round member (solid or hollow) ---------- */
function memberGeometry(N,Mr,frame,ro,ri,ringMod,strainFn){
  const pos=[],col=[],idx=[];
  const ring=(i,r)=>{const s=i/N,f=frame(s),base=pos.length/3;
    for(let j=0;j<Mr;j++){const th=2*Math.PI*j/Mr,m=ringMod?ringMod(s,th):[1,1],cx=Math.cos(th)*r*m[0],cz=Math.sin(th)*r*m[1];
      pos.push(f.p.x+f.n.x*cx+f.b.x*cz,f.p.y+f.n.y*cx+f.b.y*cz,f.p.z+f.n.z*cx+f.b.z*cz);
      const c=cmap(strainFn?strainFn(s,cx,th):0);col.push(c.r,c.g,c.b);}return base;};
  const outer=[],inner=[];for(let i=0;i<=N;i++)outer.push(ring(i,ro));
  if(ri>0)for(let i=0;i<=N;i++)inner.push(ring(i,ri));
  for(let i=0;i<N;i++)for(let j=0;j<Mr;j++){const j1=(j+1)%Mr;const a=outer[i]+j,b=outer[i]+j1,c=outer[i+1]+j,d=outer[i+1]+j1;idx.push(a,c,b,b,c,d);
    if(ri>0){const A=inner[i]+j,B=inner[i]+j1,C=inner[i+1]+j,D=inner[i+1]+j1;idx.push(A,B,C,B,D,C);}}
  [0,N].forEach((i,k)=>{if(ri>0){for(let j=0;j<Mr;j++){const j1=(j+1)%Mr;const o=outer[i],n=inner[i];if(k===0)idx.push(o+j,o+j1,n+j,o+j1,n+j1,n+j);else idx.push(o+j,n+j,o+j1,o+j1,n+j,n+j1);}}
    else{const f=frame(i/N);const c=pos.length/3;pos.push(f.p.x,f.p.y,f.p.z);const cc=cmap(strainFn?strainFn(i/N,0,0):0);col.push(cc.r,cc.g,cc.b);for(let j=0;j<Mr;j++){const j1=(j+1)%Mr;const o=outer[i];if(k===0)idx.push(c,o+j1,o+j);else idx.push(c,o+j,o+j1);}}});
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();return g;
}
function planarFrame(pf){return s=>{const e=1e-3;const q=pf(Math.min(1,s+e)),r=pf(Math.max(0,s-e));const t=q.clone().sub(r).normalize();return {p:pf(s),n:new THREE.Vector3(-t.y,t.x,0),b:new THREE.Vector3(0,0,1)};};}
/* cantilever bend of an extruded (+z, length L) geometry: elastic tip drop plus an optional plastic hinge at zh (rotation rot, radians).
   strainFn(s, y) -> colour value */
function bendExtrude(geo,L,tip,strainFn,rot=0,zh=0.02){const p=geo.attributes.position, base=geo.userData.base||(geo.userData.base=p.array.slice());
  let c=geo.attributes.color; if(!c){c=new THREE.Float32BufferAttribute(new Float32Array(p.count*3),3);geo.setAttribute('color',c);}
  const yc=z=>{const s=clamp(z/L,0,1);return -tip*(3*s*s-s*s*s)/2;};
  const hy=yc(zh), co=Math.cos(rot), si=Math.sin(rot);
  for(let i=0;i<p.count;i++){const x=base[3*i],y=base[3*i+1],z=base[3*i+2],s=clamp(z/L,0,1);
    let Y=y+yc(z), Z=z;
    if(rot>0&&z>zh){const dz=z-zh,dy=Y-hy;Z=zh+dz*co+dy*si;Y=hy-dz*si+dy*co;}
    p.array[3*i]=x;p.array[3*i+1]=Y;p.array[3*i+2]=Z;
    const cc=cmap(strainFn?strainFn(s,y):0);c.array[3*i]=cc.r;c.array[3*i+1]=cc.g;c.array[3*i+2]=cc.b;}
  p.needsUpdate=true;c.needsUpdate=true;geo.computeVertexNormals();}
/* where a material point of a bent extrusion ends up (same mapping as bendExtrude) */
function bentPoint(L,tip,rot,zh,y,z){const yc=zz=>{const s=clamp(zz/L,0,1);return -tip*(3*s*s-s*s*s)/2;};let Y=y+yc(z),Z=z;if(rot>0&&z>zh){const hy=yc(zh),dz=z-zh,dy=Y-hy;Z=zh+dz*Math.cos(rot)+dy*Math.sin(rot);Y=hy-dz*Math.sin(rot)+dy*Math.cos(rot);}return [Y,Z];}

/* ---------- camera fit: frame the rig's bounding sphere from a chosen direction ---------- */
let viewDir=null, viewLift=0;
function fitView(dir,lift=0,margin=1.1){if(!HAS3D)return;viewDir=dir.clone().normalize();viewLift=lift;
  // instanced struts report their template's size, not the lattice's, so frame the ordinary meshes only
  const bb=new THREE.Box3();rig.updateMatrixWorld(true);rig.traverse(o=>{if(o.isMesh&&!o.isInstancedMesh&&o.geometry){o.geometry.computeBoundingBox();bb.union(o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld));}});if(bb.isEmpty())return;const sph=bb.getBoundingSphere(new THREE.Sphere());
  // distance at which all eight box corners fit inside the view (with a margin), looking along -viewDir at the box centre
  const tv=Math.tan(camera.fov*Math.PI/360)/margin, th=tv*camera.aspect, ctr=bb.getCenter(new THREE.Vector3());ctr.y+=lift*sph.radius;
  const fwd=viewDir.clone().negate(), right=new THREE.Vector3().crossVectors(fwd,new THREE.Vector3(0,1,0)).normalize(), upv=new THREE.Vector3().crossVectors(right,fwd);
  let d=0;for(let i=0;i<8;i++){const p=new THREE.Vector3(i&1?bb.max.x:bb.min.x,i&2?bb.max.y:bb.min.y,i&4?bb.max.z:bb.min.z).sub(ctr);const along=p.dot(viewDir);
    d=Math.max(d,Math.abs(p.dot(right))/th+along,Math.abs(p.dot(upv))/tv+along);}
  const tgt=ctr;controls.target.copy(tgt);camera.position.copy(tgt).addScaledVector(viewDir,d);
  camera.near=d/50;camera.far=d*8;camera.updateProjectionMatrix();controls.update();
  // shadows follow the rig
  key.position.copy(sph.center).add(new THREE.Vector3(2.2,4,2.8).multiplyScalar(Math.max(.6,sph.radius)));key.target.position.copy(sph.center);
  const s=sph.radius*1.4;Object.assign(key.shadow.camera,{left:-s,right:s,top:s,bottom:-s,near:.1,far:sph.radius*12});key.shadow.camera.updateProjectionMatrix();}
