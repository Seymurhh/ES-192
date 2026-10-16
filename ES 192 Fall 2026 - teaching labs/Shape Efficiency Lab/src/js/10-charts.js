/* ===================== charts: one plotter for every live chart ===================== */
function niceTicks(lo,hi,n=5){const span=hi-lo||1;const s0=span/n,mag=Math.pow(10,Math.floor(Math.log10(s0))),r=s0/mag;const st=(r<1.5?1:r<3?2:r<7?5:10)*mag;const t=[];for(let v=Math.ceil(lo/st-1e-9)*st;v<=hi+1e-9*st;v+=st)t.push(+v.toFixed(10));return t;}
function logTicks(lo,hi){const t=[];const a=Math.floor(Math.log10(lo)),b=Math.ceil(Math.log10(hi));const few=b-a<=2;for(let e=a;e<=b;e++)for(const m of few?[1,2,5]:[1]){const v=m*Math.pow(10,e);if(v>=lo*0.999&&v<=hi*1.001)t.push(v);}return t;}
const tickLabel=v=>{const a=Math.abs(v);if(a>=1e4)return sig(v,2);if(a>=1)return fmt(v,Number.isInteger(+v.toFixed(6))?0:1);if(a===0)return '0';return String(+v.toPrecision(2));};
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
/* cfg: x/y {min,max,log,label,unit}, series [{pts,c,w,dash,op,label}], hl/vl [{v,c,dash,label,pos}], marks [{x,y,c,r,label,dx,dy,anchor}],
   under(sc) -> svg string drawn under the series, texts [{x,y,t,c,anchor,dx,dy,cls}] */
function plot(svg,cfg){
  const W=Math.max(200,svg.clientWidth||svg.parentNode.clientWidth||400), H=Math.max(140,svg.clientHeight||svg.parentNode.clientHeight||240);
  svg.setAttribute('viewBox',`0 0 ${W} ${H}`);
  const big=document.body.classList.contains('present')||W>700;
  const m={l:big?64:54,r:18,t:12,b:big?46:40};
  const X0=m.l,X1=W-m.r,Y0=H-m.b,Y1=m.t;
  const mk=(ax,a,b)=>ax.log?(v=>a+(Math.log10(Math.max(v,1e-12))-Math.log10(ax.min))/(Math.log10(ax.max)-Math.log10(ax.min))*(b-a)):(v=>a+(v-ax.min)/(ax.max-ax.min)*(b-a));
  const sx=mk(cfg.x,X0,X1), sy=mk(cfg.y,Y0,Y1);
  const fg=css('--fg'),mu=css('--muted'),ln=css('--line'),bg=css('--panel');
  const id=svg.id+'-clip';
  let h=`<defs><clipPath id="${id}"><rect x="${X0}" y="${Y1-2}" width="${X1-X0+2}" height="${Y0-Y1+2}"/></clipPath></defs>`;
  // grid + ticks
  const xt=cfg.x.ticks||(cfg.x.log?logTicks(cfg.x.min,cfg.x.max):niceTicks(cfg.x.min,cfg.x.max,Math.max(3,Math.round((X1-X0)/90))));
  const yt=cfg.y.ticks||(cfg.y.log?logTicks(cfg.y.min,cfg.y.max):niceTicks(cfg.y.min,cfg.y.max,Math.max(3,Math.round((Y0-Y1)/55))));
  for(const v of xt){const x=sx(v);h+=`<line x1="${x}" y1="${Y1}" x2="${x}" y2="${Y0}" stroke="${ln}" stroke-width="1"/><text x="${x}" y="${Y0+15}" text-anchor="middle">${(cfg.x.tf||tickLabel)(v)}</text>`;}
  for(const v of yt){const y=sy(v);h+=`<line x1="${X0}" y1="${y}" x2="${X1}" y2="${y}" stroke="${ln}" stroke-width="1"/><text x="${X0-6}" y="${y+4}" text-anchor="end">${(cfg.y.tf||tickLabel)(v)}</text>`;}
  h+=`<rect x="${X0}" y="${Y1}" width="${X1-X0}" height="${Y0-Y1}" fill="none" stroke="${mu}" stroke-opacity=".55"/>`;
  h+=`<text x="${(X0+X1)/2}" y="${H-6}" text-anchor="middle" class="t-fg">${cfg.x.label}</text>`;
  h+=`<text transform="translate(13,${(Y0+Y1)/2}) rotate(-90)" text-anchor="middle" class="t-fg">${cfg.y.label}</text>`;
  const sc={sx,sy,X0,X1,Y0,Y1,W,H};
  h+=`<g clip-path="url(#${id})">`;
  if(cfg.under)h+=cfg.under(sc);
  for(const L of cfg.hl||[]){const y=sy(L.v);h+=`<line x1="${X0}" y1="${y}" x2="${X1}" y2="${y}" stroke="${L.c||mu}" stroke-width="${L.w||1.4}" stroke-dasharray="${L.dash||'5 4'}"/>`;}
  for(const L of cfg.vl||[]){const x=sx(L.v);h+=`<line x1="${x}" y1="${Y1}" x2="${x}" y2="${Y0}" stroke="${L.c||mu}" stroke-width="${L.w||1.4}" stroke-dasharray="${L.dash||'5 4'}"/>`;}
  for(const s of cfg.series||[]){if(!s.pts.length)continue;const d=s.pts.map((p,i)=>(i?'L':'M')+sx(p[0]).toFixed(1)+','+sy(p[1]).toFixed(1)).join('');
    h+=`<path d="${d}" fill="none" stroke="${s.c}" stroke-width="${s.w||2.4}" stroke-opacity="${s.op==null?1:s.op}" ${s.dash?`stroke-dasharray="${s.dash}"`:''} stroke-linejoin="round" stroke-linecap="round"/>`;}
  h+='</g>';
  for(const L of [...(cfg.hl||[]),...(cfg.vl||[])])if(L.label){const isH=(cfg.hl||[]).includes(L);
    const x=isH?(L.pos==='left'?X0+6:X1-6):sx(L.v)+5, y=isH?sy(L.v)-5:Y1+13;
    h+=`<text x="${x}" y="${y}" text-anchor="${isH&&L.pos!=='left'?'end':'start'}" style="fill:${L.c||mu}" paint-order="stroke" stroke="${bg}" stroke-width="3">${L.label}</text>`;}
  for(const t of cfg.texts||[])h+=`<text x="${sx(t.x)+(t.dx||0)}" y="${sy(t.y)+(t.dy||0)}" text-anchor="${t.anchor||'start'}" style="fill:${t.c||mu}" class="${t.cls||''}" paint-order="stroke" stroke="${bg}" stroke-width="3">${t.t}</text>`;
  for(const p of cfg.marks||[]){const x=sx(p.x),y=sy(p.y);if(!isFinite(x)||!isFinite(y))continue;const cx=clamp(x,X0,X1),cy=clamp(y,Y1,Y0);
    h+=p.sq?`<rect x="${cx-5}" y="${cy-5}" width="10" height="10" fill="${p.c}"/>`:`<circle cx="${cx}" cy="${cy}" r="${p.r||6.5}" fill="${p.c}" stroke="${bg}" stroke-width="2"/>`;
    if(p.label)h+=`<text x="${cx+(p.dx==null?10:p.dx)}" y="${cy+(p.dy==null?4:p.dy)}" text-anchor="${p.anchor||'start'}" style="fill:${p.tc||p.c};font-weight:600" paint-order="stroke" stroke="${bg}" stroke-width="3">${p.label}</text>`;}
  svg.innerHTML=h;return sc;
}
function legend(el,items){el.innerHTML=items.map(i=>`<span><i style="background:${i.c};${i.dash?`background:repeating-linear-gradient(90deg,${i.c} 0 5px,transparent 5px 8px)`:''}"></i>${i.t}</span>`).join('');}

/* ---------- Ashby modulus–density chart (envelopes after Ashby Fig. 3.3) ---------- */
const FAM=[ // name, rho min-max (kg/m3), E min-max (GPa), colour
  ['Foams',20,300,1e-3,0.6,'#d9c58f'],['Elastomers',900,1300,5e-4,0.08,'#c9a0c9'],['Polymers',900,1500,0.3,4,'#8fb4d9'],
  ['Woods (along grain)',350,1000,4,25,'#a8c98a'],['Composites',1500,2100,15,200,'#7bb39b'],['Metals',1700,20000,40,420,'#b3b3bb'],['Ceramics',2200,6000,70,1000,'#e3b07a']];
function ashbyChart(svg,o){
  const cfg={x:{min:10,max:30000,log:true,label:'Density ρ (kg/m³)',ticks:[10,100,1000,10000]},y:{min:1e-4,max:2000,log:true,label:'Young’s modulus E (GPa)',ticks:[1e-4,1e-3,0.01,0.1,1,10,100,1000],tf:v=>v>=1?fmt(v,0):String(+v.toPrecision(1))}};
  cfg.under=sc=>{let h='';const mu=css('--muted');
    for(const f of FAM){const x1=sc.sx(f[1]),x2=sc.sx(f[2]),y1=sc.sy(f[3]),y2=sc.sy(f[4]);
      h+=`<ellipse cx="${(x1+x2)/2}" cy="${(y1+y2)/2}" rx="${Math.abs(x2-x1)/2+4}" ry="${Math.abs(y1-y2)/2+3}" fill="${f[5]}" fill-opacity=".32" stroke="${f[5]}" stroke-width="1.3"/>`;
      h+=`<text x="${(x1+x2)/2}" y="${(y1+y2)/2+4}" text-anchor="middle" style="fill:${mu};font-size:11px">${f[0]}</text>`;}
    for(const L of o.lines){const r0=o.solid[0],E0=o.solid[1],r1=r0*0.01,E1=E0*Math.pow(0.01,L.slope);
      h+=`<line x1="${sc.sx(r0)}" y1="${sc.sy(E0)}" x2="${sc.sx(r1)}" y2="${sc.sy(E1)}" stroke="${L.c}" stroke-width="2.2" stroke-dasharray="7 4"/>`;
      const rl=r0*Math.pow(10,-L.at),El=E0*Math.pow(10,-L.at*L.slope),ang=Math.atan2(sc.sy(E1)-sc.sy(E0),sc.sx(r1)-sc.sx(r0))*180/Math.PI;
      h+=`<text transform="translate(${sc.sx(rl)},${sc.sy(El)}) rotate(${ang+180})" dy="-6" text-anchor="middle" style="fill:${L.c};font-weight:600" paint-order="stroke" stroke="${css('--panel')}" stroke-width="3">${L.label}</text>`;}
    return h;};
  cfg.marks=[{x:o.solid[0],y:o.solid[1],c:css('--fg'),sq:1,label:o.solidLabel,dx:9,dy:-8,tc:css('--fg')},...o.points];
  return plot(svg,cfg);
}
