/* ===================== microscope: what the material does, at two scales =====================
   Grains pane: a light-microscope view of the hot spot (grains, slip lines, pile-ups, kink bands, cracks).
   Atoms pane: one slip plane side-on (metals: edge dislocations glide; cellulose: chains and hydrogen bonds).
   State: {mat, sign (+1 tension / -1 compression), e (elastic strain / yield strain, 0..1), pl (plastic, 0..1), fr (fracture/collapse, 0..1), band (localised in a crease)}.
   These are drawings of the mechanisms with exaggerated strain, not simulations. */
const MIC=(function(){
  const gc=$('mg'), ac=$('ma'), G=gc.getContext('2d'), A=ac.getContext('2d');
  let GW=300,GH=200,AW=300,AH=200,dpr=1;
  const tgt={mat:'steel',sign:-1,e:0,pl:0,fr:0,band:0};
  const cur={e:0,pl:0,fr:0};
  const cache={};
  function size(){dpr=Math.min(2,window.devicePixelRatio||1);
    for(const c of [gc,ac]){const r=c.getBoundingClientRect();c.width=Math.max(2,Math.round(r.width*dpr));c.height=Math.max(2,Math.round(r.height*dpr));}
    GW=gc.width/dpr;GH=gc.height/dpr;AW=ac.width/dpr;AH=ac.height/dpr;for(const k in cache)delete cache[k];}
  new ResizeObserver(size).observe(gc); new ResizeObserver(size).observe(ac); size();

  /* ---------- geometry helpers ---------- */
  function clipHalf(poly,nx,ny,c){const out=[];for(let i=0;i<poly.length;i++){const P=poly[i],Q=poly[(i+1)%poly.length];const dp=nx*P[0]+ny*P[1]-c,dq=nx*Q[0]+ny*Q[1]-c;
    if(dp<=0)out.push(P);if((dp<0&&dq>0)||(dp>0&&dq<0)){const t=dp/(dp-dq);out.push([P[0]+(Q[0]-P[0])*t,P[1]+(Q[1]-P[1])*t]);}}return out;}
  function voronoi(seeds,W,H,sx=1,sy=1){return seeds.map((s,i)=>{let poly=[[-2,-2],[W+2,-2],[W+2,H+2],[-2,H+2]];
    for(let j=0;j<seeds.length&&poly.length;j++){if(j===i)continue;const t=seeds[j];if(Math.abs(t[0]-s[0])/sx>140||Math.abs(t[1]-s[1])/sy>140)continue;
      poly=clipHalf(poly,(t[0]-s[0])/(sx*sx),(t[1]-s[1])/(sy*sy),((t[0]*t[0]-s[0]*s[0])/(sx*sx)+(t[1]*t[1]-s[1]*s[1])/(sy*sy))/2);}return poly;});}
  function seedsGrid(R,W,H,cw,ch,jit=.8){const s=[];for(let y=-ch;y<H+ch;y+=ch)for(let x=-cw;x<W+cw;x+=cw)s.push([x+cw/2+(R()-.5)*cw*jit,y+ch/2+(R()-.5)*ch*jit]);return s;}
  function centroid(p){let x=0,y=0;for(const q of p){x+=q[0];y+=q[1];}return [x/p.length,y/p.length];}
  function pathPoly(ctx,p){ctx.beginPath();p.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.closePath();}
  function rayExit(p,c,d){let best=1e9;for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length];const ex=b[0]-a[0],ey=b[1]-a[1];const den=d[0]*ey-d[1]*ex;if(Math.abs(den)<1e-9)continue;
    const t=((a[0]-c[0])*ey-(a[1]-c[1])*ex)/den,u=((a[0]-c[0])*d[1]-(a[1]-c[1])*d[0])/den;if(t>0&&u>=0&&u<=1)best=Math.min(best,t);}return best;}
  function grainsOf(R,seeds,W,H,sx,sy){return voronoi(seeds,W,H,sx,sy).filter(p=>p.length>2).map(p=>{const c=centroid(p);let rad=0;for(const q of p)rad=Math.max(rad,Math.hypot(q[0]-c[0],q[1]-c[1]));
    return {poly:p,c,rad,th:R()*Math.PI,tone:R(),jit:[R()-.5,R()-.5,R()-.5,R()-.5,R()-.5]};});}

  /* ---------- builders (cached per material and size) ---------- */
  function build(mat){const key=mat;if(cache[key])return cache[key];const R=rng(91+mat.length*131),W=GW,H=GH,S={};
    if(mat==='steel'){S.grains=grainsOf(R,seedsGrid(R,W,H,34,30),W,H,1,1);S.grains.forEach(g=>{g.pearl=R()<.27;g.lam=R()*Math.PI;});
      S.inc=[];for(let i=0;i<5;i++)S.inc.push([R()*W,R()*H,4+R()*7]);S.um=260;}
    if(mat==='galv'){S.zt=Math.round(H*.15);S.zinc=grainsOf(R,seedsGrid(R,W,S.zt,70,S.zt*1.6,.9),W,S.zt,1.6,1);
      S.grains=grainsOf(R,seedsGrid(R,W,H,24,22),W,H,1,1).filter(g=>g.c[1]>S.zt-6);S.grains.forEach(g=>{g.pearl=R()<.06;g.lam=R()*Math.PI;});
      S.cracks=[];for(let x=22+R()*20;x<W-10;x+=38+R()*22)S.cracks.push(x);S.um=140;}
    if(mat==='al'){S.grains=grainsOf(R,seedsGrid(R,W,H,78,26,.85),W,H,2.8,1);const hues=[205,214,250,262,42,30,192,330,18];
      S.grains.forEach(g=>{g.col=`hsl(${hues[Math.floor(R()*hues.length)]},${32+R()*16}%,${60+R()*16}%)`;});
      S.part=[];for(let i=0;i<34;i++){const y=R()*H,x=R()*W;S.part.push([x,y,1.4+R()*2.2,R()]);if(R()<.4)S.part.push([x+6+R()*8,y+(R()-.5)*2,1.2+R()*1.6,R()]);}S.um=420;}
    if(mat==='ti'){S.surf=x=>H*.17+4*Math.sin(x/13)+3*Math.sin(x/5.3+1)+2*Math.sin(x/2.7);
      S.grains=grainsOf(R,seedsGrid(R,W,H,46,120,.7),W,H,1,3.2);
      S.grains.forEach(g=>{g.nd=[];const n=Math.round(g.rad*g.rad/34);const base=R()*Math.PI;for(let i=0;i<n;i++){const ang=base+[0,Math.PI/3,2*Math.PI/3][i%3]+(R()-.5)*.08;
        g.nd.push([g.c[0]+(R()-.5)*2*g.rad,g.c[1]+(R()-.5)*2*g.rad,ang,6+R()*20]);}});
      S.powder=[];for(let x=18+R()*14;x<W-10;x+=46+R()*40){const r=6+R()*6;S.powder.push([x,r]);}
      S.pore={x:W*.64,y:H*.62,r:Math.min(W,H)*.05};S.notch=S.powder.length>1?S.powder[1][0]+S.powder[1][1]+3:W*.4;S.um=160;}
    if(mat==='wood'||mat==='wooddense'){const dense=mat==='wooddense';S.rows=[];let y=-4;let k=0;
      while(y<H+20){const late=(k%9)>=6;const h=dense?7+R()*2:(late?9+R()*2:15+R()*5);const cells=[];let x=-R()*180;
        while(x<W+40){const l=110+R()*170;cells.push([x,x+l,R()<.5]);x+=l+2;}S.rows.push({y:y+h/2,h,late,cells,brk:W*.5+(R()-.5)*70});y+=h;k++;}S.dense=dense;S.um=dense?300:520;}
    if(mat==='foam'){const sd=seedsGrid(R,W,H,58,52,.95);const polys=voronoi(sd,W,H,1,1);const E=new Map(),N=new Map();const kk=p=>Math.round(p[0]*2)+','+Math.round(p[1]*2);
      const node=p=>{const k=kk(p);if(!N.has(k))N.set(k,{x:p[0],y:p[1],id:N.size});return N.get(k);};
      for(const p of polys)for(let i=0;i<p.length;i++){const a=node(p[i]),b=node(p[(i+1)%p.length]);if(a===b)continue;const k=a.id<b.id?a.id+'-'+b.id:b.id+'-'+a.id;if(!E.has(k))E.set(k,{a,b,s:R()<.5?1:-1});}
      S.nodes=[...N.values()];S.edges=[...E.values()].filter(e=>Math.hypot(e.a.x-e.b.x,e.a.y-e.b.y)>3);S.um=2400;}
    cache[key]=S;return S;}

  /* ---------- shared drawing bits ---------- */
  const CR='#c0283f';
  function loadArrows(ctx,W,H,sign,lab='σ'){ctx.save();ctx.strokeStyle=CR;ctx.fillStyle=CR;ctx.lineWidth=2.4;
    const y=H/2,L=22;for(const side of [-1,1]){const x0=side<0?6:W-6;const dir=sign>0?side:-side;const xs=sign>0?x0-side*L:x0,xe=sign>0?x0:x0-side*L;
      ctx.beginPath();ctx.moveTo(xs,y);ctx.lineTo(xe,y);ctx.stroke();const tip=dir>0?Math.max(xs,xe):Math.min(xs,xe);ctx.beginPath();ctx.moveTo(tip,y);ctx.lineTo(tip-dir*8,y-5);ctx.lineTo(tip-dir*8,y+5);ctx.closePath();ctx.fill();}
    ctx.font='italic 600 15px "STIX Two Text",serif';ctx.textAlign='center';ctx.fillText(lab,13,y-10);ctx.fillText(lab,W-13,y-10);ctx.restore();}
  function scaleBar(ctx,W,H,px,txt,dark){ctx.save();const x1=W-12,x0=x1-px,y=H-12;ctx.fillStyle=dark?'#fff':'#1c1b1f';ctx.globalAlpha=.9;ctx.fillRect(x0,y,px,3);
    ctx.font='600 11px "IBM Plex Sans",system-ui,sans-serif';ctx.textAlign='center';ctx.fillText(txt,(x0+x1)/2,y-5);ctx.restore();}
  function perp(ctx,x,y,ang,s,col){ctx.save();ctx.translate(x,y);ctx.rotate(ang);ctx.strokeStyle=col;ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(-s,0);ctx.lineTo(s,0);ctx.moveTo(0,0);ctx.lineTo(0,-s*1.5);ctx.stroke();ctx.restore();}
  /* Schmid: slip trace at angle th to the load axis (x) gets shear m = |sin 2th|/2; grains near 45° slip first */
  function slipLevel(th,pl){const m=Math.abs(Math.sin(2*th))/2;const thr=(0.5-m)/0.5*0.72;return clamp((pl-thr)/0.28,0,1);}
  function slipLines(ctx,g,ang,k,col){if(k<=0)return;const n=Math.round(1+10*k),[cx,cy]=g.c,R=g.rad,dx=Math.cos(ang),dy=Math.sin(ang),nx=-dy,ny=dx;
    ctx.save();pathPoly(ctx,g.poly);ctx.clip();ctx.strokeStyle=col;ctx.globalAlpha=.25+.55*k;ctx.lineWidth=1;
    for(let i=0;i<n;i++){const off=(i-(n-1)/2)*(1.8*R/(n+1))+g.jit[i%5]*2.5;ctx.beginPath();ctx.moveTo(cx+nx*off-dx*R,cy+ny*off-dy*R);ctx.lineTo(cx+nx*off+dx*R,cy+ny*off+dy*R);ctx.stroke();}ctx.restore();}
  function pileUp(ctx,g,ang,k){if(k<.35)return;const d=[Math.cos(ang),Math.sin(ang)],t=rayExit(g.poly,g.c,d);if(!isFinite(t)||t>1e8)return;const n=k>.75?4:3;
    for(const s of [4,9,15,23].slice(0,n)){if(t-s<4)continue;perp(ctx,g.c[0]+d[0]*(t-s),g.c[1]+d[1]*(t-s),ang,3.6,CR);}}

  /* ---------- grains pane ---------- */
  function drawGrains(){const st=tgt,W=GW,H=GH,ctx=G;ctx.setTransform(dpr,0,0,dpr,0,0);const mat=st.mat,S=build(mat);
    const e=cur.e,pl=cur.pl,fr=cur.fr,sg=st.sign;
    ctx.fillStyle={steel:'#e6e1d8',galv:'#e6e1d8',al:'#cfd6e2',ti:'#d9d6cf',wood:'#f1e6cf',wooddense:'#e2cfa9',foam:'#2e2a25'}[mat]||'#e6e1d8';ctx.fillRect(0,0,W,H);
    // overall deformation (exaggerated): elastic + plastic stretch along the load axis, volume kept roughly constant
    const ex=sg*(0.012*e+(mat==='foam'||mat.startsWith('wood')?0:0.05*pl)),ey=-ex*(mat==='foam'?0.1:0.45);
    ctx.save();ctx.translate(W/2,H/2);ctx.scale(1+ex,1+ey);ctx.translate(-W/2,-H/2);
    if(mat==='steel'||mat==='galv'||mat==='al'){
      const band=st.band?(x=>Math.exp(-Math.pow((x-W/2)/(W*.13),2))):null;
      for(const g of S.grains){pathPoly(ctx,g.poly);
        if(mat==='al')ctx.fillStyle=g.col;else ctx.fillStyle=g.pearl?`hsl(28,9%,${44+g.tone*8}%)`:`hsl(38,10%,${84+g.tone*8}%)`;ctx.fill();
        if(g.pearl){ctx.save();pathPoly(ctx,g.poly);ctx.clip();ctx.strokeStyle='rgba(40,30,24,.75)';ctx.lineWidth=1.1;const dx=Math.cos(g.lam),dy=Math.sin(g.lam);
          for(let o=-g.rad;o<g.rad;o+=2.6){ctx.beginPath();ctx.moveTo(g.c[0]-dy*o-dx*g.rad,g.c[1]+dx*o-dy*g.rad);ctx.lineTo(g.c[0]-dy*o+dx*g.rad,g.c[1]+dx*o+dy*g.rad);ctx.stroke();}ctx.restore();}}
      // slip: by Schmid factor; galvanized sheet: strain is largest at the surface, so slip starts there; kink crease: slip crowds into the fold
      for(const g of S.grains){if(g.pearl)continue;let p=pl;if(mat==='galv')p=pl*clamp(1.25-(g.c[1]-S.zt)/(H-S.zt)*(1.3-pl),0,1.2);if(band)p=pl*(0.35+1.4*band(g.c[0]));
        const k=slipLevel(g.th,clamp(p,0,1));slipLines(ctx,g,g.th,k,'#2a2018');if(p>.62)slipLines(ctx,g,g.th+(mat==='al'?Math.PI/3:1.23),clamp((p-.62)/.38,0,1)*k,'#2a2018');}
      ctx.strokeStyle=mat==='al'?'rgba(30,30,40,.55)':'rgba(45,38,32,.8)';ctx.lineWidth=1.15;for(const g of S.grains){pathPoly(ctx,g.poly);ctx.stroke();}
      for(const g of S.grains){if(g.pearl)continue;let p=pl;if(band)p=pl*(0.35+1.4*band(g.c[0]));if(mat==='galv')p=pl*clamp(1.25-(g.c[1]-S.zt)/(H-S.zt)*(1.3-pl),0,1.2);pileUp(ctx,g,g.th,slipLevel(g.th,clamp(p,0,1)));}
      if(mat==='steel'){ctx.fillStyle='rgba(70,70,80,.75)';for(const q of S.inc){ctx.beginPath();ctx.ellipse(q[0],q[1],q[2],1.6,0,0,7);ctx.fill();}}
      if(mat==='al'){for(const q of S.part){const inB=band?band(q[0]):0,vr=fr*inB*9*(0.5+q[3]);
          if(vr>.5){ctx.fillStyle='#14161b';ctx.beginPath();ctx.ellipse(q[0],q[1],q[2]+vr*1.3,q[2]*.8+vr*.8,0,0,7);ctx.fill();}
          ctx.fillStyle='#3b3a40';ctx.beginPath();ctx.ellipse(q[0],q[1],q[2],q[2]*.7,0,0,7);ctx.fill();}
        if(band&&pl>0){const gr=ctx.createLinearGradient(W*.3,0,W*.7,0);gr.addColorStop(0,'rgba(20,20,30,0)');gr.addColorStop(.5,`rgba(20,20,30,${.18*pl})`);gr.addColorStop(1,'rgba(20,20,30,0)');ctx.fillStyle=gr;ctx.fillRect(0,0,W,H);}
        if(band&&fr>0){ // voids link into a crack running down the crease
          const R=rng(5);ctx.strokeStyle='#0d0e12';ctx.lineWidth=2+3*fr;ctx.lineJoin='round';ctx.beginPath();let x=W/2,y=-2;ctx.moveTo(x,y);const yEnd=H*fr*.95;while(y<yEnd){y+=8+R()*8;x=W/2+(R()-.5)*16;ctx.lineTo(x,Math.min(y,yEnd));}ctx.stroke();}}
      if(mat==='galv'){ // zinc layer (spangle), then the thin Fe-Zn alloy layer
        ctx.save();ctx.beginPath();ctx.rect(0,0,W,S.zt);ctx.clip();for(const g of S.zinc){pathPoly(ctx,g.poly);ctx.fillStyle=`hsl(210,8%,${74+g.tone*14}%)`;ctx.fill();ctx.strokeStyle='rgba(60,66,76,.35)';ctx.lineWidth=1;ctx.stroke();}ctx.restore();
        ctx.fillStyle='#8c8e93';ctx.fillRect(0,S.zt-4,W,4);
        if(fr>0){ctx.fillStyle='#16171b';for(const x of S.cracks){const w=1+fr*5;ctx.beginPath();ctx.moveTo(x-w,0);ctx.lineTo(x+w,0);ctx.lineTo(x+.6,S.zt-3);ctx.lineTo(x-.6,S.zt-3);ctx.closePath();ctx.fill();}}
        ctx.fillStyle='rgba(28,27,31,.75)';ctx.font='600 10.5px "IBM Plex Sans",sans-serif';ctx.fillText('zinc coating',8,S.zt+15);}
    }
    else if(mat==='ti'){const surf=S.surf;
      for(const g of S.grains){pathPoly(ctx,g.poly);ctx.fillStyle=`hsl(36,7%,${70+g.tone*12}%)`;ctx.fill();
        ctx.save();pathPoly(ctx,g.poly);ctx.clip();ctx.strokeStyle='rgba(50,48,52,.6)';ctx.lineWidth=1.25;for(const n of g.nd){const dx=Math.cos(n[2])*n[3]/2,dy=Math.sin(n[2])*n[3]/2;ctx.beginPath();ctx.moveTo(n[0]-dx,n[1]-dy);ctx.lineTo(n[0]+dx,n[1]+dy);ctx.stroke();}
        // slip inside the needles: short bright traces along the needle directions
        const k=slipLevel(g.th,pl);if(k>0){ctx.strokeStyle=`rgba(192,40,63,${.35+.45*k})`;ctx.lineWidth=1;for(const n of g.nd.slice(0,Math.round(g.nd.length*k*.5))){const dx=Math.cos(n[2])*n[3]/2,dy=Math.sin(n[2])*n[3]/2;ctx.beginPath();ctx.moveTo(n[0]-dx,n[1]-dy+1.4);ctx.lineTo(n[0]+dx,n[1]+dy+1.4);ctx.stroke();}}
        ctx.restore();}
      ctx.strokeStyle='rgba(40,38,42,.8)';ctx.lineWidth=1.4;for(const g of S.grains){pathPoly(ctx,g.poly);ctx.stroke();}
      // pore and the printed surface with half-melted powder
      ctx.fillStyle='#202227';ctx.beginPath();const p=S.pore;for(let i=0;i<=24;i++){const a=i/24*Math.PI*2,r=p.r*(1+.35*Math.sin(3*a+1)+.2*Math.sin(5*a));i?ctx.lineTo(p.x+r*Math.cos(a)*1.5,p.y+r*Math.sin(a)):ctx.moveTo(p.x+r*1.5,p.y);}ctx.fill();
      ctx.fillStyle='#2c3036';ctx.beginPath();ctx.moveTo(-5,-5);for(let x=-5;x<=W+5;x+=2)ctx.lineTo(x,surf(x));ctx.lineTo(W+5,-5);ctx.closePath();ctx.fill();
      for(const q of S.powder){const y=surf(q[0])-q[1]*.55;ctx.fillStyle='#c9c4ba';ctx.beginPath();ctx.arc(q[0],y,q[1],0,7);ctx.fill();ctx.strokeStyle='rgba(40,38,42,.7)';ctx.lineWidth=1;ctx.stroke();}
      ctx.fillStyle='rgba(255,255,255,.85)';ctx.font='600 10.5px "IBM Plex Sans",sans-serif';ctx.fillText('strut surface',8,13);
      if(fr>0){const R=rng(3);ctx.fillStyle='#0d0e12';const x0=S.notch,y0=surf(x0);const pts=[[x0,y0]];let x=x0,y=y0;const yEnd=y0+(H-y0)*fr*.95;let s=1;while(y<yEnd){y+=9+R()*6;x+=s*(4+R()*5);s=-s;pts.push([x,Math.min(y,yEnd)]);}
        const w=1+fr*3.5;ctx.beginPath();pts.forEach((q,i)=>i?ctx.lineTo(q[0]-w*(1-i/pts.length),q[1]):ctx.moveTo(q[0]-w,q[1]));for(let i=pts.length-1;i>=0;i--)ctx.lineTo(pts[i][0]+w*(1-i/pts.length),pts[i][1]);ctx.closePath();ctx.fill();}
    }
    else if(mat==='wood'||mat==='wooddense'){
      // kink band on the squeezed face: fibres tilt inside an inclined band; splinters on the stretched face
      const kinkA=(sg<0?pl:0)*0.62, bw=13, b=Math.PI/3, cx=W*.52, cy=H/2, cot=1/Math.tan(b);
      const def=(x,y)=>{if(kinkA<=0)return [x,y];const xb=x-(cx+(y-cy)*cot);return [x,y+Math.tan(kinkA)*clamp(xb,-bw,bw)];};
      const gap=(sg>0?fr:0)*12;
      for(const r of S.rows){const wall=S.dense?r.h-2:(r.late?r.h-1:r.h-1),lum=S.dense?1.2:Math.max(2,r.h-1-(r.late?7:4.5));
        for(const c of r.cells){const segs=[];if(gap>0&&c[0]<r.brk&&c[1]>r.brk){segs.push([c[0],r.brk-1,0]);segs.push([r.brk+1,c[1],gap]);}else segs.push([c[0],c[1],gap>0&&c[0]>=r.brk?gap:0]);
          for(const sgm of segs){const pts=[];for(let x=sgm[0];x<=sgm[1];x+=6)pts.push(def(x+sgm[2],r.y));pts.push(def(sgm[1]+sgm[2],r.y));
            const line=w=>{ctx.lineWidth=w;ctx.beginPath();pts.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.stroke();};
            ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=S.dense?'#7a4f27':'#9c6a38';line(wall);ctx.strokeStyle=S.dense?'#c9a774':'#f4ead6';line(lum);
            if(c[2]&&!S.dense&&!r.late){ctx.strokeStyle='rgba(120,80,40,.6)';ctx.lineWidth=1;const m=pts[Math.floor(pts.length/2)];ctx.beginPath();ctx.arc(m[0],m[1],Math.min(3,lum/2),0,7);ctx.stroke();}}}}
      if(gap>0){ctx.strokeStyle='#6b4520';ctx.lineWidth=1.2;const R=rng(9);for(const r of S.rows){for(let i=0;i<3;i++){const x=r.brk+(R()-.5)*3,y=r.y+(R()-.5)*r.h*.6;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+(R()-.5)*7+gap*.5,y+(R()-.5)*5);ctx.stroke();}}}
    }
    else if(mat==='foam'){
      // open cells: walls bend (elastic), hinge at the joints (plastic), then a layer of cells folds flat (collapse)
      const col=fr, bandX=W/2, bw=W*.16;
      const mv=n=>{let x=n.x;if(col>0){const d=x-bandX;x=Math.abs(d)<bw?bandX+d*(1-.72*col):x-Math.sign(d)*bw*.72*col;}return [x,n.y];};
      const bowK=(4+10*e)*(1+2.2*pl+2*col);
      ctx.lineCap='round';
      const hinges=[];
      for(const pass of [0,1])for(const ed of S.edges){const a=mv(ed.a),b=mv(ed.b),dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy)||1;const th=Math.atan2(dy,dx);
        const inBand=col>0&&Math.abs((a[0]+b[0])/2-bandX)<bw;const bow=ed.s*bowK*Math.abs(Math.sin(2*th))*(L/40)*(e>0||pl>0?1:0.15)*(inBand?1+3*col:1);
        const mx=(a[0]+b[0])/2-dy/L*bow,my=(a[1]+b[1])/2+dx/L*bow;
        ctx.strokeStyle=pass?'#e9dcbb':'#7b6a4c';ctx.lineWidth=pass?4.2:6.6;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.quadraticCurveTo(mx,my,b[0],b[1]);ctx.stroke();
        if(pass&&pl>0&&Math.abs(Math.sin(2*th))>.55)hinges.push(a,b);}
      ctx.fillStyle='#e9dcbb';for(const n of S.nodes){const p=mv(n);ctx.beginPath();ctx.arc(p[0],p[1],3.6,0,7);ctx.fill();}
      if(pl>0){ctx.fillStyle=CR;for(const h of hinges){ctx.globalAlpha=clamp(pl*1.6,0,1);ctx.beginPath();ctx.arc(h[0],h[1],3.2,0,7);ctx.fill();}ctx.globalAlpha=1;}
    }
    ctx.restore();
    loadArrows(ctx,W,H,sg);
    const um=S.um,bar=um>1000?1000:um>300?100:50;scaleBar(ctx,W,H,W*bar/um,bar>=1000?'1 mm':bar+' µm',mat==='foam');
  }

  /* ---------- atoms pane ---------- */
  const SPR={};
  function sprite(col,r){const k=col+r.toFixed(1);if(SPR[k])return SPR[k];const c=document.createElement('canvas'),s=Math.ceil(r*2+4)*2;c.width=c.height=s;const g=c.getContext('2d');g.scale(2,2);
    const gr=g.createRadialGradient(s/4-r*.35,s/4-r*.4,r*.1,s/4,s/4,r);gr.addColorStop(0,'#fff');gr.addColorStop(.25,col);gr.addColorStop(1,shade(col,-.45));g.fillStyle=gr;g.beginPath();g.arc(s/4,s/4,r,0,7);g.fill();SPR[k]=c;return c;}
  function shade(hex,f){const n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const t=f<0?0:255,p=Math.abs(f);r=Math.round((t-r)*p+r);g=Math.round((t-g)*p+g);b=Math.round((t-b)*p+b);return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);}
  const SPEC={steel:{base:'#a9b4c2',nm:.248,name:'Fe',extra:[['C','#3a3a3a']],carbon:1},galv:{base:'#a9b4c2',nm:.248,name:'Fe',extra:[]},
    al:{base:'#d9dde3',nm:.286,name:'Al',extra:[['Mg','#82c487'],['Si','#a48ad9']],prec:1},ti:{base:'#bdb4a6',nm:.29,name:'Ti',extra:[['Al','#eeeeee'],['V','#7f9cc8']],alloy:1}};
  function latt(mat){const key='A'+mat;if(cache[key])return cache[key];const W=AW,H=AH,a=clamp(Math.min(H/8.6,W/12),15,30),h=a*Math.sqrt(3)/2,R=rng(33+mat.length);
    const J=Math.max(2,Math.floor((H-64)/(2*h))),xL=W*.09,xR=W*.91,cy=H/2+4,atoms=[];
    for(let j=-J;j<=J;j++){const y=cy-j*h,off=(j&1)?a/2:0;for(let x=xL+off;x<=xR;x+=a){let sp=0;atoms.push({x,y,j,sp,ph:R()*7,w:2+R()*2});}}
    const L={a,h,J,xL,xR,cy,ys:cy+h/2,atoms,top:cy-J*h,bot:cy+J*h};
    const sp=SPEC[mat]||SPEC.steel;
    if(sp.prec){L.xp=xL+(xR-xL)*.58;for(const at of atoms){const dx=(at.x-L.xp)/(a*2.1),dy=(at.y-L.ys)/(a*1.5);if(dx*dx+dy*dy<1)at.sp=((at.j+Math.round(at.x/a))&1)?1:2;}}
    if(sp.alloy){for(const at of atoms){const r=R();at.sp=r<.08?1:r<.12?2:0;}}
    if(sp.carbon){L.xs=xL+(xR-xL)*.26;L.C=[];for(let k=0;k<5;k++)L.C.push([L.xs+(k-2)*a*.9+a*.25,L.ys+h*(.25+.5*(k&1))]);}
    else L.xs=xL-3*a;
    cache[key]=L;return L;}
  /* displacement of an edge dislocation (isotropic elasticity, nu = 0.3) with core at (xd, ys) and Burgers vector b along +x */
  function edgeU(x,y,xd,ys,b){const dx=x-xd,dy=ys-y,r2=dx*dx+dy*dy+1e-6,nu=.3;
    const ux=b/(2*Math.PI)*(Math.atan2(dy,dx)+dx*dy/(2*(1-nu)*r2));const uy=-b/(2*Math.PI)*((1-2*nu)/(4*(1-nu))*Math.log(r2/(r2+b*b*16))+(dx*dx-dy*dy)/(4*(1-nu)*r2));return [ux,-uy];}
  function drawMetalAtoms(t){const ctx=A,W=AW,H=AH,st=tgt,mat=st.mat,sp=SPEC[mat]||SPEC.steel,L=latt(mat),a=L.a;
    const e=cur.e,pl=cur.pl,fr=cur.fr,sg=st.sign;
    // dislocations: four pass through as plastic strain grows; steel's first one starts pinned in its carbon cloud, 6061's are held at the precipitate
    const N=4,P=pl*N,xe=L.xR+3*a,cores=[];
    for(let k=0;k<N;k++){const f=clamp(P-k,0,1);let xs=(sp.carbon&&k===0)?L.xs:L.xL-3*a,x;
      if(sp.prec){const xh=L.xp-2.4*a;x=f<.4?lerp(xs,xh,f/.4):f<.62?xh:lerp(xh,xe,(f-.62)/.38);}else if(sp.carbon&&k===0)x=f<.18?xs:lerp(xs,xe,(f-.18)/.82);else x=lerp(xs,xe,f);
      if(sp.carbon&&k===0||f>0)cores.push(x);}
    const ex=sg*0.075*e,ey=-0.35*ex,cx=W/2,cyy=L.cy;
    const crackX=L.xL+(L.xR-L.xL)*.44,tipY=L.top+(L.bot-L.top)*.78*fr;
    const pos=L.atoms.map(at=>{let x=at.x,y=at.y;for(const xd of cores){const u=edgeU(at.x,at.y,xd,L.ys,a);x+=u[0];y+=u[1];}
      x=cx+(x-cx)*(1+ex);y=cyy+(y-cyy)*(1+ey);
      if(fr>0&&at.y<tipY){const d=a*2.1*fr*Math.sqrt((tipY-at.y)/Math.max(1,tipY-L.top));x+=at.x>crackX?d/2:-d/2;}
      return [x+Math.sin(t*at.w+at.ph)*a*.035,y+Math.cos(t*at.w*1.13+at.ph)*a*.035];});
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle='#14161b';ctx.fillRect(0,0,W,H);
    // bonds, coloured by stretch (blue squeezed, red stretched)
    const byRow=new Map();L.atoms.forEach((at,i)=>{if(!byRow.has(at.j))byRow.set(at.j,[]);byRow.get(at.j).push(i);});
    ctx.lineWidth=2;
    for(const [j,ids] of byRow){const up=byRow.get(j+1)||[];for(const i of ids){const p=pos[i];for(const k of [...ids,...up]){if(k===i)continue;if(L.atoms[k].j===j&&k<i)continue;const q=pos[k],d=Math.hypot(q[0]-p[0],q[1]-p[1]);if(d>1.3*a||d<.5*a)continue;
      const s=d/a-1;ctx.strokeStyle=s>0?`rgba(${Math.round(110+145*clamp(s*9,0,1))},${Math.round(120-50*clamp(s*9,0,1))},${Math.round(135-75*clamp(s*9,0,1))},.85)`:`rgba(${Math.round(110-70*clamp(-s*9,0,1))},${Math.round(120+40*clamp(-s*9,0,1))},${Math.round(135+100*clamp(-s*9,0,1))},.85)`;
      ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(q[0],q[1]);ctx.stroke();}}}
    if(pl>0.01||cores.length){ctx.save();ctx.setLineDash([4,5]);ctx.strokeStyle='rgba(255,255,255,.22)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(L.xL-a,L.ys);ctx.lineTo(L.xR+a,L.ys);ctx.stroke();ctx.restore();}
    const cols=[sp.base,...sp.extra.map(x=>x[1])];const rr=a*.4;
    L.atoms.forEach((at,i)=>{const r=at.sp&&sp.alloy&&at.sp===1?rr*.8:rr;const im=sprite(cols[at.sp]||sp.base,r);ctx.drawImage(im,pos[i][0]-im.width/4,pos[i][1]-im.height/4,im.width/2,im.height/2);});
    if(sp.carbon){const im=sprite('#3a3a3a',a*.2);for(const c of L.C){let x=c[0],y=c[1];x=cx+(x-cx)*(1+ex);y=cyy+(y-cyy)*(1+ey);ctx.drawImage(im,x-im.width/4,y-im.height/4,im.width/2,im.height/2);}}
    for(const xd of cores)if(xd>L.xL-a&&xd<L.xR+a){ctx.save();ctx.shadowColor='rgba(0,0,0,.6)';ctx.shadowBlur=3;perp(ctx,xd,L.ys,0,a*.42,'#ff5a6e');ctx.restore();}
    // load: shear on the slip plane while slipping, otherwise the axial stress
    if(pl>0.02&&fr<=0){ctx.save();ctx.strokeStyle=CR;ctx.fillStyle=CR;ctx.lineWidth=2.4;const yT=L.top-12,yB=L.bot+14,x0=W*.36,x1=W*.64;
      const arr=(y,d)=>{ctx.beginPath();ctx.moveTo(d>0?x0:x1,y);ctx.lineTo(d>0?x1:x0,y);ctx.stroke();const tx=d>0?x1:x0;ctx.beginPath();ctx.moveTo(tx,y);ctx.lineTo(tx-d*8,y-5);ctx.lineTo(tx-d*8,y+5);ctx.closePath();ctx.fill();};
      if(yT>4)arr(yT,1);if(yB<H-4)arr(yB,-1);ctx.font='italic 600 15px "STIX Two Text",serif';ctx.fillText('τ',x1+6,Math.max(14,yT+5));ctx.restore();}
    else loadArrows(ctx,W,H,sg);
    const out=cores.filter(x=>x>=xe-1e-6).length;
    if(out>0){ctx.save();ctx.font='600 11px "IBM Plex Sans",sans-serif';const txt=`slip step = ${out} b`,tw=ctx.measureText(txt).width,bx=L.xR-tw-14,by=L.ys+L.h*1.6;
      ctx.fillStyle='rgba(20,22,27,.85)';ctx.fillRect(bx-6,by-12,tw+12,17);ctx.fillStyle='#ffd166';ctx.fillText(txt,bx,by);ctx.strokeStyle='#ffd166';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(bx+tw+6,by-4);ctx.lineTo(L.xR+a*.6,L.ys);ctx.stroke();ctx.restore();}
    // key
    ctx.font='500 10.5px "IBM Plex Sans",sans-serif';ctx.textAlign='left';let kx=10;const ky=H-9;
    const keyItem=(c,txt,r)=>{const im=sprite(c,r||5);ctx.drawImage(im,kx,ky-8,im.width/2,im.height/2);ctx.fillStyle='rgba(255,255,255,.8)';ctx.fillText(txt,kx+14,ky);kx+=ctx.measureText(txt).width+24;};
    keyItem(sp.base,sp.name);for(const x of sp.extra)keyItem(x[1],x[0],x[0]==='C'?3.5:5);
    if(cores.length){ctx.save();perp(ctx,kx+5,ky-3,0,4.5,'#ff5a6e');ctx.restore();ctx.fillStyle='rgba(255,255,255,.8)';ctx.fillText('dislocation',kx+14,ky);}
    scaleBar(ctx,W,H,a*0.5/sp.nm,'0.5 nm',true);
  }
  /* cellulose: chains of glucose rings (covalent along the chain) held side by side by hydrogen bonds */
  function drawChains(t){const ctx=A,W=AW,H=AH,st=tgt,sg=st.sign,e=cur.e,pl=cur.pl,fr=cur.fr;
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle='#14161b';ctx.fillRect(0,0,W,H);
    const s=clamp(W/13,16,26),rows=Math.max(3,Math.floor((H-46)/(s*1.15))),y0=H/2-(rows-1)*s*1.15/2-4,x0=W*.06,n=Math.ceil((W*.88)/s);
    const foam=st.mat==='foam'||st.mat==='foamc';
    const kinkA=(!foam&&sg<0)?pl*0.7:0,bw=s*1.1,cx=W*.5,cy=H/2,cot=1/Math.tan(Math.PI/3),inBand=(x,y)=>Math.abs(x-(cx+(y-cy)*cot))<bw*1.6;
    const slip=foam?pl*2*s:0,mid=Math.floor(rows/2);
    const gap=(!foam&&sg>0)?fr*s*1.5:0;
    const P=[];for(let j=0;j<rows;j++){const R=rng(100+j),brk=Math.floor(n*.45+(R()-.5)*n*.3);const row=[];
      for(let i=0;i<=n;i++){let x=x0+i*s+(j&1?s*.5:0),y=y0+j*s*1.15;x=W/2+(x-W/2)*(1+sg*.05*e);
        if(sg<0&&!foam)y+=e*.12*s*Math.sin(x/(2.3*s)+j);
        if(kinkA>0){const xb=x-(cx+(y-cy)*cot);y+=Math.tan(kinkA)*clamp(xb,-bw,bw);}
        if(slip&&j>=mid)x+=slip;if(gap&&i>brk)x+=gap;
        row.push([x+Math.sin(t*2.3+i+j)*s*.03,y+Math.cos(t*2.1+i*1.3+j)*s*.03]);}P.push({row,brk});}
    // hydrogen bonds between neighbouring chains
    ctx.setLineDash([3,3]);ctx.lineWidth=1.3;
    for(let j=0;j<rows-1;j++)for(let i=0;i<=n;i++){const a=P[j].row[i];let b=null,bd=1e9;for(const q of P[j+1].row){const d=Math.hypot(q[0]-a[0],q[1]-a[1]);if(d<bd){bd=d;b=q;}}
      const broken=(bd>s*1.05&&(!kinkA||inBand(a[0],a[1])||bd>s*1.4))||(slip&&j===mid-1&&((slip/s)%1)>.15&&((slip/s)%1)<.85)||(gap&&Math.abs(i-P[j].brk)<2);
      if(broken){if(bd<s*2.2&&(slip||gap||(kinkA&&inBand(a[0],a[1])))){ctx.setLineDash([]);ctx.strokeStyle='rgba(255,90,110,.9)';ctx.lineWidth=1.6;const mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2;ctx.beginPath();ctx.moveTo(mx-3,my-3);ctx.lineTo(mx+3,my+3);ctx.moveTo(mx+3,my-3);ctx.lineTo(mx-3,my+3);ctx.stroke();ctx.setLineDash([3,3]);ctx.lineWidth=1.3;}continue;}
      ctx.strokeStyle='rgba(110,190,235,.75)';ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();}
    ctx.setLineDash([]);
    for(const {row,brk} of P){for(let i=0;i<row.length-1;i++){if(gap&&i===brk)continue;const a=row[i],b=row[i+1],d=Math.hypot(b[0]-a[0],b[1]-a[1])/s-1;
        ctx.strokeStyle=d>0?`rgb(${Math.round(200+55*clamp(d*12,0,1))},${Math.round(190-110*clamp(d*12,0,1))},${Math.round(150-80*clamp(d*12,0,1))})`:`rgb(${Math.round(200-120*clamp(-d*12,0,1))},${Math.round(190+10*clamp(-d*12,0,1))},${Math.round(150+90*clamp(-d*12,0,1))})`;
        ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();
        const o=sprite('#e46a5a',s*.12);ctx.drawImage(o,(a[0]+b[0])/2-o.width/4,(a[1]+b[1])/2-o.height/4,o.width/2,o.height/2);}
      for(const p of row){ctx.fillStyle='#14161b';ctx.strokeStyle='#ead9a7';ctx.lineWidth=2;ctx.beginPath();for(let k=0;k<6;k++){const an=k*Math.PI/3,r=s*.28;k?ctx.lineTo(p[0]+r*Math.cos(an),p[1]+r*Math.sin(an)):ctx.moveTo(p[0]+r,p[1]);}ctx.closePath();ctx.fill();ctx.stroke();}
      if(gap){ctx.fillStyle='#ff5a6e';for(const k of [brk,brk+1]){const p=row[k];if(p){ctx.beginPath();ctx.arc(p[0]+(k===brk?s*.35:-s*.35),p[1],2.6,0,7);ctx.fill();}}}}
    loadArrows(ctx,W,H,sg);
    ctx.font='500 10.5px "IBM Plex Sans",sans-serif';ctx.fillStyle='rgba(255,255,255,.8)';ctx.strokeStyle='#ead9a7';ctx.lineWidth=1.5;const ky=H-9;
    ctx.beginPath();for(let k=0;k<6;k++){const an=k*Math.PI/3;k?ctx.lineTo(16+5*Math.cos(an),ky-4+5*Math.sin(an)):ctx.moveTo(21,ky-4);}ctx.closePath();ctx.stroke();ctx.fillText('glucose ring',26,ky);
    ctx.save();ctx.setLineDash([3,3]);ctx.strokeStyle='rgba(110,190,235,.9)';ctx.beginPath();ctx.moveTo(110,ky-4);ctx.lineTo(128,ky-4);ctx.stroke();ctx.restore();ctx.fillText('hydrogen bond',133,ky);
    scaleBar(ctx,W,H,s*2/1.04,'1 nm',true);
  }

  let last=performance.now()/1000;
  function frame(now){const t=now/1000,dt=Math.min(.1,t-last);last=t;
    const k1=1-Math.exp(-dt/.18),k2=1-Math.exp(-dt/.45);cur.e+=(tgt.e-cur.e)*k1;cur.pl+=(tgt.pl-cur.pl)*k2;cur.fr+=(tgt.fr-cur.fr)*k2;
    if(GW<4||AW<4)return;
    drawGrains();
    if(['wood','wooddense','foam'].includes(tgt.mat))drawChains(t);else drawMetalAtoms(t);}
  function set(s){Object.assign(tgt,s);}
  function snap(){cur.e=tgt.e;cur.pl=tgt.pl;cur.fr=tgt.fr;}
  return {set,frame,snap,size};
})();
