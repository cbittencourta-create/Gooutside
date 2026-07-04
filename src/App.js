import React, { useState, useEffect, useMemo } from "react";

const SUPA_URL = "https://hbzldrnrbxvnkrbnntoe.supabase.co";
const SUPA_KEY = "sb_publishable_Jr804JmMgoUU3x3pf5wW7g_yRPZaCYi";

// E-mails autorizados a se cadastrar
const INVITED_EMAILS = [];

const supaAuth = {
  async signUp(email, password, name) {
    const r = await fetch(`${SUPA_URL}/auth/v1/signup`, {
      method: "POST",
      headers: {"apikey": SUPA_KEY, "Content-Type": "application/json"},
      body: JSON.stringify({email, password, data: {name}})
    });
    return r.json();
  },
  async signIn(email, password) {
    const r = await fetch(`${SUPA_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {"apikey": SUPA_KEY, "Content-Type": "application/json"},
      body: JSON.stringify({email, password})
    });
    return r.json();
  },
  async signOut(token) {
    await fetch(`${SUPA_URL}/auth/v1/logout`, {
      method: "POST",
      headers: {"apikey": SUPA_KEY, "Authorization": `Bearer ${token}`}
    });
  }
};

async function supaGet(key, userId) {
  try {
    const r = await fetch(`${SUPA_URL}/rest/v1/velara_data?key=eq.${userId}_${key}&select=value`, {
      headers: {"apikey": SUPA_KEY, "Authorization": `Bearer ${SUPA_KEY}`}
    });
    const d = await r.json();
    return d?.[0]?.value ?? null;
  } catch { return null; }
}

async function supaSet(key, value, userId) {
  try {
    await fetch(`${SUPA_URL}/rest/v1/velara_data`, {
      method: "POST",
      headers: {"apikey": SUPA_KEY, "Authorization": `Bearer ${SUPA_KEY}`, "Content-Type": "application/json", "Prefer": "resolution=merge-duplicates"},
      body: JSON.stringify({key: `${userId}_${key}`, value, updated_at: new Date().toISOString()})
    });
  } catch {}
}

function useLS(key, init, userId) {
  const storageKey = userId ? `${userId}_${key}` : key;
  const [v, sv] = useState(() => { 
    try { const s = localStorage.getItem(storageKey); return s ? JSON.parse(s) : init; } 
    catch { return init; } 
  });

  // Load from Supabase on mount
  useEffect(() => {
    if (!userId) return;
    supaGet(key, userId).then(remote => {
      if (remote !== null) {
        sv(remote);
        try { localStorage.setItem(storageKey, JSON.stringify(remote)); } catch {}
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Simple setter
  function setV(newVal) {
    sv(newVal);
    try { localStorage.setItem(storageKey, JSON.stringify(newVal)); } catch {}
    if (userId) supaSet(key, newVal, userId);
  }

  return [v, setV];
}
// ── Paleta glass olive/burgundy ───────────────────────────────────────────────
const C = {
  text:"#1A1209", textSub:"rgba(26,18,9,0.65)", textMuted:"rgba(26,18,9,0.45)",
  textDark:"#1A1209", textDarkSub:"#5A4A3A",
  glass:"rgba(255,255,255,0.14)", glassMed:"rgba(255,255,255,0.20)", glassStrong:"rgba(255,255,255,0.28)",
  border:"rgba(255,255,255,0.22)", borderMed:"rgba(255,255,255,0.35)",
  magenta:"#E8205F", magentaGlass:"rgba(232,32,95,0.35)", magentaDark:"rgba(232,32,95,0.6)",
  green:"#8FC43A",   greenGlass:"rgba(143,196,58,0.3)",
  gold:"#D4A843",    goldGlass:"rgba(212,168,67,0.3)",
  red:"#E05252",     redGlass:"rgba(224,82,82,0.25)",
  blue:"#5BA3D4",    blueGlass:"rgba(91,163,212,0.25)",
  amber:"#D4A843",   amberGlass:"rgba(212,168,67,0.25)",
  modalBg:"rgba(245,240,228,0.97)", modalText:"#1A1209", modalSub:"#5A4A3A",
  inputBg:"#F5F0E8", inputBorder:"#DDD5C8",
};

const DEST_COLORS = {
  investimento: {color:"#A8E063", bg:"rgba(168,224,99,0.15)",  icon:"📈"},
  objetivo:     {color:"#7BC8F0", bg:"rgba(123,200,240,0.15)", icon:"🎯"},
  divida:       {color:"#FF8A80", bg:"rgba(255,138,128,0.15)", icon:"💳"},
  fundo_divida: {color:"#FFB347", bg:"rgba(255,179,71,0.15)",  icon:"🏦"},
  livre:        {color:"#FFD580", bg:"rgba(255,213,128,0.15)", icon:"💰"},
};

const CHART_COLORS = ["#E8205F","#8FC43A","#5BA3D4","#D4A843","#A07BC8","#E05252","#38B2AC","#ED8936","#48BB78"];

const TARTAN_CSS = `background-color:#C4A96A;background-image:repeating-linear-gradient(0deg,transparent 0px,transparent 18px,rgba(80,72,20,0.55) 18px,rgba(80,72,20,0.55) 26px,transparent 26px,transparent 44px,rgba(80,72,20,0.55) 44px,rgba(80,72,20,0.55) 52px,transparent 52px,transparent 68px,rgba(100,20,20,0.5) 68px,rgba(100,20,20,0.5) 72px,transparent 72px,transparent 88px,rgba(80,72,20,0.55) 88px,rgba(80,72,20,0.55) 96px,transparent 96px,transparent 114px,rgba(80,72,20,0.55) 114px,rgba(80,72,20,0.55) 122px,transparent 122px,transparent 138px,rgba(100,20,20,0.5) 138px,rgba(100,20,20,0.5) 142px,transparent 142px,transparent 160px),repeating-linear-gradient(90deg,transparent 0px,transparent 18px,rgba(80,72,20,0.55) 18px,rgba(80,72,20,0.55) 26px,transparent 26px,transparent 44px,rgba(80,72,20,0.55) 44px,rgba(80,72,20,0.55) 52px,transparent 52px,transparent 68px,rgba(100,20,20,0.5) 68px,rgba(100,20,20,0.5) 72px,transparent 72px,transparent 88px,rgba(80,72,20,0.55) 88px,rgba(80,72,20,0.55) 96px,transparent 96px,transparent 114px,rgba(80,72,20,0.55) 114px,rgba(80,72,20,0.55) 122px,transparent 122px,transparent 138px,rgba(100,20,20,0.5) 138px,rgba(100,20,20,0.5) 142px,transparent 142px,transparent 160px);background-size:160px 160px;`;

const LISTRAS_CSS = `background-color:#F3B8C4;background-image:repeating-linear-gradient(90deg,#F3B8C4 0px,#F3B8C4 26px,#B5182A 26px,#B5182A 52px);background-size:52px 100%;`;

const SOL_STRIPES_CSS = `background-color:#FAF6ED;background-image:repeating-linear-gradient(90deg,#FAF6ED 0px,#FAF6ED 18px,#F0D89A 18px,#F0D89A 60px,#FAF6ED 60px,#FAF6ED 78px,#A9C4DE 78px,#A9C4DE 84px);background-size:84px 100%;`;

const BG_OPTIONS = [
  { id:"tartan",    label:"Xadrez",   emoji:"🟫", isCss:true, css:TARTAN_CSS },
  { id:"listras",   label:"Listras",  emoji:"🎀", isCss:true, css:LISTRAS_CSS },
  { id:"sol",       label:"Sol",      emoji:"☀️", isCss:true, css:SOL_STRIPES_CSS },
  { id:"cachorro",  label:"Dálmata",  emoji:"🐶", url:"/wallpapers/bg-cachorro-azul.jpg", contain:true, bgColor:"#2E4C82", position:"left bottom", containSize:"auto 90%" },
];

function bgToStyle(bg) {
  if(!bg) return {};
  if(bg.isCss) {
    const s={}; bg.css.split(";").filter(Boolean).forEach(r=>{const[k,...v]=r.split(":");if(k&&v.length)s[k.trim().replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=v.join(":").trim();});
    return s;
  }
  if(bg.contain) {
    return {backgroundColor:bg.bgColor||"#fff",backgroundImage:`url(${bg.url})`,backgroundSize:bg.containSize||"contain",backgroundPosition:bg.position||"center",backgroundRepeat:"no-repeat"};
  }
  return {backgroundImage:`url(${bg.url})`,backgroundSize:"cover",backgroundPosition:bg.position||"center",backgroundRepeat:"no-repeat"};
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const R = v => new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(v||0);
const fd = d => d ? new Date(d+"T12:00:00").toLocaleDateString("pt-BR",{day:"2-digit",month:"short"}) : "—";
const fdFull = d => d ? new Date(d+"T12:00:00").toLocaleDateString("pt-BR",{day:"2-digit",month:"short",year:"numeric"}) : "—";
const today = () => new Date().toISOString().slice(0,10);
const addDays = (ds,n) => { const d=new Date(ds+"T12:00:00"); d.setDate(d.getDate()+n); return d.toISOString().slice(0,10); };
const daysUntil = ds => ds ? Math.ceil((new Date(ds+"T12:00:00")-new Date())/86400000) : null;
const isPast = ds => ds && new Date(ds+"T23:59:59")<new Date();
const monthKey = ds => ds ? ds.slice(0,7) : "";
const months8 = () => { const a=[]; const d=new Date(); for(let i=0;i<8;i++){const dd=new Date(d);dd.setMonth(dd.getMonth()+i);a.push(dd.toISOString().slice(0,7));} return a; };
const monthLabel = ym => { const [y,m]=ym.split("-"); return ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"][+m-1]+" "+y.slice(2); };
const uid = () => Date.now()+Math.random().toString(36).slice(2);
const CATS_OUT = ["🍔 Alimentação","🚗 Transporte","🏠 Moradia","💊 Saúde","🎭 Lazer","👕 Vestuário","📚 Educação","💡 Contas","📦 Outros"];
const CATS_IN  = ["🏥 Plantão","💼 Consultório","🎓 Ensino","💰 Investimento","🎁 Presente","📦 Outros"];
const INVEST_T = ["CDB","LCI/LCA","Tesouro Direto","Ações","FIIs","Poupança","Previdência","Criptomoedas","Outro"];

async function fetchCDI() {
  try {
    const cached = JSON.parse(localStorage.getItem("velara_cdi")||"null");
    const hoje = today();
    if(cached && cached.data===hoje) return cached.valor;
    const r = await fetch("https://api.bcb.gov.br/dados/serie/bcdata.sgs.4389/dados/ultimos/1?formato=json");
    const d = await r.json();
    const valor = parseFloat(d?.[0]?.valor);
    if(valor>0){
      localStorage.setItem("velara_cdi", JSON.stringify({valor, data:hoje}));
      return valor;
    }
    return cached?.valor || null;
  } catch { 
    const cached = JSON.parse(localStorage.getItem("velara_cdi")||"null");
    return cached?.valor || null;
  }
}

// ── SVG Donut ──────────────────────────────────────────────────────────────────
function Donut({data,size=110,thick=15}) {
  const total=data.reduce((s,d)=>s+d.v,0);
  if(!total) return <div style={{width:size,height:size,borderRadius:"50%",background:C.glass,flexShrink:0}}/>;
  let cum=-90;
  const arcs=data.map(d=>{
    const angle=(d.v/total)*360, r=(size-thick)/2, cx=size/2, cy=size/2;
    const s1=(cum*Math.PI)/180, e1=((cum+angle)*Math.PI)/180;
    const path=`M ${cx+r*Math.cos(s1)} ${cy+r*Math.sin(s1)} A ${r} ${r} 0 ${angle>180?1:0} 1 ${cx+r*Math.cos(e1)} ${cy+r*Math.sin(e1)}`;
    cum+=angle; return {...d,path};
  });
  return (
    <svg width={size} height={size} style={{flexShrink:0}}>
      <circle cx={size/2} cy={size/2} r={(size-thick)/2} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth={thick}/>
      {arcs.map((a,i)=><path key={i} d={a.path} fill="none" stroke={a.color} strokeWidth={thick} strokeLinecap="round"/>)}
    </svg>
  );
}

// ── Bar horizontal ─────────────────────────────────────────────────────────────
function HBar({label,value,max,color,sub,dark=false}) {
  const pct=max>0?Math.min(value/max*100,100):0;
  return (
    <div style={{marginBottom:11}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
        <span style={{fontSize:12,fontFamily:"'DM Sans',sans-serif",color:"#1A1209",fontWeight:500}}>{label}</span>
        <span style={{fontSize:12,fontFamily:"'DM Sans',sans-serif",color,fontWeight:700}}>{sub||R(value)}</span>
      </div>
      <div style={{background:"rgba(0,0,0,0.1)",borderRadius:99,height:7,overflow:"hidden"}}>
        <div style={{width:`${pct}%`,height:"100%",background:color,borderRadius:99,transition:"width .7s",boxShadow:`0 0 8px ${color}66`}}/>
      </div>
    </div>
  );
}

function Bar({value,max,color=C.green,h=6}) {
  const pct=max>0?Math.min(value/max*100,100):0;
  return <div style={{background:"rgba(0,0,0,0.1)",borderRadius:99,height:h,overflow:"hidden"}}><div style={{width:`${pct}%`,height:"100%",background:color,borderRadius:99,transition:"width .7s",boxShadow:`0 0 6px ${color}55`}}/></div>;
}

function Badge({label,color,bg}) {
  return <span style={{fontSize:10,fontWeight:700,letterSpacing:".05em",padding:"3px 8px",borderRadius:99,color,background:bg,textTransform:"uppercase",backdropFilter:"blur(8px)"}}>{label}</span>;
}

// ── Calendário 6 meses ────────────────────────────────────────────────────────
function MultiCalendar({plantoes, movs, onAddWithDate}) {
  const [selMonth, setSelMonth] = useState(0);
  const [selDay, setSelDay] = useState(null);
  const now = new Date();
  const base = new Date(now.getFullYear(), now.getMonth()+selMonth, 1);
  const year = base.getFullYear(), month = base.getMonth();
  const daysInMonth = new Date(year,month+1,0).getDate();
  const firstDay = new Date(year,month,1).getDay();
  const todayD = now.getDate(), todayM = now.getMonth(), todayY = now.getFullYear();

  const payDays=new Set(), recDays=new Set(), atrasoDays=new Set();
  plantoes.forEach(p=>{
    if(p.previsao){const d=new Date(p.previsao+"T12:00:00");if(d.getFullYear()===year&&d.getMonth()===month)payDays.add(d.getDate());}
    if(p.dataRecebimento){const d=new Date(p.dataRecebimento+"T12:00:00");if(d.getFullYear()===year&&d.getMonth()===month)recDays.add(d.getDate());}
    if(p.status!=="recebido"&&isPast(p.previsao)){const d=new Date(p.previsao+"T12:00:00");if(d.getFullYear()===year&&d.getMonth()===month)atrasoDays.add(d.getDate());}
  });

  const weeks=[]; let week=Array(firstDay===0?6:firstDay-1).fill(null);
  for(let d=1;d<=daysInMonth;d++){week.push(d);if(week.length===7){weeks.push(week);week=[];}}
  if(week.length) weeks.push([...week,...Array(7-week.length).fill(null)]);

  const MONTHS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

  return (
    <div>
      {/* Month nav */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
        <button onClick={()=>setSelMonth(m=>Math.max(0,m-1))} disabled={selMonth===0}
          style={{background:selMonth===0?"transparent":C.glass,border:`1px solid ${C.border}`,borderRadius:8,color:selMonth===0?C.textMuted:C.text,width:28,height:28,cursor:selMonth===0?"default":"pointer",fontSize:14,fontFamily:"inherit"}}>‹</button>
        <div style={{fontSize:13,fontWeight:600,color:C.text,fontFamily:"'DM Sans',sans-serif",textAlign:"center"}}>
          {MONTHS[month]} {year}
        </div>
        <button onClick={()=>setSelMonth(m=>Math.min(5,m+1))} disabled={selMonth===5}
          style={{background:selMonth===5?"transparent":C.glass,border:`1px solid ${C.border}`,borderRadius:8,color:selMonth===5?C.textMuted:C.text,width:28,height:28,cursor:selMonth===5?"default":"pointer",fontSize:14,fontFamily:"inherit"}}>›</button>
      </div>
      {/* Pills mês */}
      <div style={{display:"flex",gap:4,marginBottom:10,flexWrap:"wrap"}}>
        {[0,1,2,3,4,5].map(i=>{
          const d=new Date(now.getFullYear(),now.getMonth()+i,1);
          const isSel=i===selMonth;
          return <button key={i} onClick={()=>setSelMonth(i)} style={{background:isSel?C.magentaGlass:C.glass,border:`1px solid ${isSel?C.magenta:C.border}`,borderRadius:99,padding:"2px 9px",fontSize:9,fontWeight:700,color:isSel?"#fff":C.textSub,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>{MONTHS[d.getMonth()]}</button>;
        })}
      </div>
      {/* Grid */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:1,marginBottom:4}}>
        {["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"].map((d,i)=><div key={i} style={{fontSize:7,textAlign:"center",color:C.textMuted,fontFamily:"'DM Sans',sans-serif",fontWeight:700,paddingBottom:3}}>{d}</div>)}
      </div>
      {weeks.map((w,wi)=>(
        <div key={wi} style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:1,marginBottom:1}}>
          {w.map((d,di)=>{
            if(!d) return <div key={di}/>;
            const isToday=d===todayD&&month===todayM&&year===todayY;
            const isPay=payDays.has(d), isRec=recDays.has(d), isAtr=atrasoDays.has(d);
            const dotColor=isAtr?C.red:isRec?C.green:isPay?C.gold:null;
            const ds=`${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
            const isSel=selDay===ds;
            return (
              <div key={di} onClick={()=>setSelDay(selDay===ds?null:ds)} style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"2px 0",cursor:"pointer"}}>
                <div style={{width:22,height:22,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontFamily:"'DM Sans',sans-serif",fontWeight:isToday||isSel?700:400,background:isToday?C.magenta:isSel?"rgba(232,32,95,0.15)":"transparent",color:isToday?"#fff":"#1A1209",border:isSel&&!isToday?`1.5px solid ${C.magenta}`:dotColor?`1px solid ${dotColor}44`:"none"}}>{d}</div>
                {dotColor&&<div style={{width:4,height:4,borderRadius:"50%",background:dotColor,marginTop:1}}/>}
              </div>
            );
          })}
        </div>
      ))}
      <div style={{display:"flex",gap:10,marginTop:8,flexWrap:"wrap"}}>
        {[[C.gold,"Pgto previsto"],[C.green,"Recebido"],[C.red,"Atrasado"]].map(([c,l])=>(
          <div key={l} style={{display:"flex",alignItems:"center",gap:3}}><div style={{width:6,height:6,borderRadius:"50%",background:c}}/><span style={{fontSize:8,color:"rgba(26,18,9,0.5)",fontFamily:"'DM Sans',sans-serif"}}>{l}</span></div>
        ))}
      </div>
      {selDay&&(()=>{
        const MNAMES=["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
        const [,dm]=selDay.split("-");
        const pltDia=plantoes.filter(p=>p.data===selDay||p.previsao===selDay||p.dataRecebimento===selDay);
        const movDia=(movs||[]).filter(m=>m.data===selDay);
        return(
          <div style={{marginTop:10,background:"rgba(0,0,0,0.04)",borderRadius:12,padding:"10px 12px",border:"1px solid rgba(0,0,0,0.08)"}}>
            <div style={{fontSize:11,fontWeight:700,color:"rgba(26,18,9,0.5)",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif",marginBottom:8}}>{selDay.slice(8)} de {MNAMES[+dm-1]}</div>
            {pltDia.map(p=><div key={p.id} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid rgba(0,0,0,0.05)"}}><span style={{fontSize:11,fontWeight:600,color:"#1A1209",fontFamily:"'DM Sans',sans-serif"}}>🏥 {p.empresa}</span><span style={{fontSize:11,fontWeight:700,color:"#2D5A10",fontFamily:"'DM Sans',sans-serif"}}>{R(p.valorTotal)}</span></div>)}
            {movDia.map(m=><div key={m.id} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid rgba(0,0,0,0.05)"}}><span style={{fontSize:11,color:"#1A1209",fontFamily:"'DM Sans',sans-serif"}}>{m.categoria.split(" ")[0]} {m.descricao}</span><span style={{fontSize:11,fontWeight:700,color:m.tipo==="entrada"?"#2D5A10":"#8B1A1A",fontFamily:"'DM Sans',sans-serif"}}>{m.tipo==="entrada"?"+":"-"}{R(m.valor)}</span></div>)}
            {pltDia.length===0&&movDia.length===0&&<div style={{fontSize:11,color:"rgba(26,18,9,0.4)",fontFamily:"'DM Sans',sans-serif",marginBottom:6}}>Nenhum registro neste dia</div>}
            <div style={{display:"flex",gap:5,marginTop:8}}>
              <button onClick={()=>onAddWithDate&&onAddWithDate("entrada",selDay)} style={{flex:1,background:"rgba(45,90,16,0.1)",border:"1px solid rgba(45,90,16,0.25)",borderRadius:8,padding:"6px",fontSize:10,fontWeight:700,color:"#2D5A10",cursor:"pointer",fontFamily:"inherit"}}>+ Entrada</button>
              <button onClick={()=>onAddWithDate&&onAddWithDate("saida",selDay)} style={{flex:1,background:"rgba(139,26,26,0.1)",border:"1px solid rgba(139,26,26,0.25)",borderRadius:8,padding:"6px",fontSize:10,fontWeight:700,color:"#8B1A1A",cursor:"pointer",fontFamily:"inherit"}}>+ Saída</button>
              <button onClick={()=>onAddWithDate&&onAddWithDate("plantao",selDay)} style={{flex:1,background:"rgba(232,32,95,0.1)",border:"1px solid rgba(232,32,95,0.25)",borderRadius:8,padding:"6px",fontSize:10,fontWeight:700,color:"#E8205F",cursor:"pointer",fontFamily:"inherit"}}>+ Plantão</button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ── Modal ──────────────────────────────────────────────────────────────────────
function Modal({open,onClose,title,children}) {
  if(!open) return null;
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",backdropFilter:"blur(8px)",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.modalBg,borderRadius:"24px 24px 0 0",width:"100%",maxWidth:520,padding:"28px 22px 40px",maxHeight:"92vh",overflowY:"auto",boxShadow:"0 -12px 60px rgba(0,0,0,.2)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
          <div style={{fontSize:16,fontWeight:700,color:C.modalText,letterSpacing:"-.02em"}}>{title}</div>
          <button onClick={onClose} style={{background:"rgba(0,0,0,0.07)",border:"1px solid rgba(0,0,0,0.12)",color:C.modalSub,borderRadius:10,width:32,height:32,cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const Inp = ({label,...p}) => (
  <div>
    {label&&<div style={{fontSize:11,fontWeight:600,color:C.modalSub,letterSpacing:".06em",textTransform:"uppercase",marginBottom:5}}>{label}</div>}
    <input style={{background:C.inputBg,border:`1.5px solid ${C.inputBorder}`,borderRadius:10,padding:"11px 13px",color:C.modalText,fontSize:14,outline:"none",width:"100%",fontFamily:"inherit",transition:"border-color .15s"}}
      onFocus={e=>e.target.style.borderColor=C.magenta} onBlur={e=>e.target.style.borderColor=C.inputBorder} {...p}/>
  </div>
);
const Sel = ({label,children,...p}) => (
  <div>
    {label&&<div style={{fontSize:11,fontWeight:600,color:C.modalSub,letterSpacing:".06em",textTransform:"uppercase",marginBottom:5}}>{label}</div>}
    <select style={{background:C.inputBg,border:`1.5px solid ${C.inputBorder}`,borderRadius:10,padding:"11px 13px",color:C.modalText,fontSize:14,outline:"none",width:"100%",fontFamily:"inherit",appearance:"none",cursor:"pointer"}} {...p}>{children}</select>
  </div>
);
const G2=({children,gap=10})=><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap}}>{children}</div>;
const Btn=({variant="primary",children,...p})=>{
  const styles={
    primary:  {background:C.magentaDark,color:"#fff",border:`1px solid ${C.magenta}`,boxShadow:`0 2px 12px ${C.magenta}44`},
    secondary:{background:"rgba(0,0,0,0.06)",color:C.modalText,border:"1.5px solid rgba(0,0,0,0.12)"},
    green:    {background:"rgba(143,196,58,0.7)",color:"#fff",border:"1px solid rgba(143,196,58,0.5)"},
    danger:   {background:"rgba(224,82,82,0.12)",color:"#C0392B",border:"1.5px solid rgba(224,82,82,0.3)"},
    blue:     {background:"rgba(91,163,212,0.6)",color:"#fff",border:"1px solid rgba(91,163,212,0.4)"},
  };
  return <button style={{...styles[variant],borderRadius:12,fontSize:14,fontWeight:600,padding:"11px 16px",cursor:"pointer",transition:"all .15s",fontFamily:"inherit",...p.style}} {...p}>{children}</button>;
};
const SL=({children,style:st})=><div style={{fontSize:11,fontWeight:700,color:"rgba(26,18,9,0.55)",letterSpacing:".08em",textTransform:"uppercase",marginBottom:10,...st}}>{children}</div>;


// ── Alocação Modal ────────────────────────────────────────────────────────────
function AlocacaoModal({open,onClose,plantao,regras,invests,objetivos,dividas,onConfirm}) {
  const [alocs,setAlocs]=useState([]);
  useEffect(()=>{if(!open||!plantao)return;setAlocs(regras.map(r=>({...r,valorEdit:(plantao.valorTotal*parseFloat(r.pct||0)/100).toFixed(2)})));},[open,plantao,regras]);
  if(!open||!plantao) return null;
  const totalAloc=alocs.reduce((s,a)=>s+parseFloat(a.valorEdit||0),0);
  const livre=plantao.valorTotal-totalAloc;
  const getNome=a=>{
    if(a.tipo==="investimento"){const i=invests.find(x=>x.id===a.destinoId);return i?`${i.nome}${i.banco?" · "+i.banco:""}`:a.destinoNome||"—";}
    if(a.tipo==="objetivo") return objetivos.find(x=>x.id===a.destinoId)?.nome||a.destinoNome||"—";
    if(a.tipo==="divida") return dividas.find(x=>x.id===a.destinoId)?.credor||a.destinoNome||"—";
    return "Livre";
  };
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",backdropFilter:"blur(8px)",zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.modalBg,borderRadius:"24px 24px 0 0",width:"100%",maxWidth:520,padding:"28px 22px 40px",maxHeight:"92vh",overflowY:"auto",boxShadow:"0 -12px 60px rgba(0,0,0,.2)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <div style={{fontSize:16,fontWeight:700,color:C.modalText}}>Distribuir Recebimento</div>
          <button onClick={onClose} style={{background:"rgba(0,0,0,0.07)",border:"1px solid rgba(0,0,0,0.12)",color:C.modalSub,borderRadius:10,width:32,height:32,cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>
        <div style={{background:"rgba(143,196,58,0.12)",borderRadius:14,padding:"14px 16px",marginBottom:16,border:"1px solid rgba(143,196,58,0.25)"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
            {[["Total Recebido",R(plantao.valorTotal),C.green],["Alocado",R(totalAloc),C.magenta],["Livre",R(livre),livre>=0?C.gold:C.red]].map(([l,v,c])=>(
              <div key={l} style={{textAlign:"center"}}>
                <div style={{fontSize:9,fontWeight:700,letterSpacing:".06em",textTransform:"uppercase",color:C.modalSub,fontFamily:"'DM Sans',sans-serif",marginBottom:3}}>{l}</div>
                <div style={{fontSize:14,fontWeight:700,color:c,fontFamily:"'DM Sans',sans-serif"}}>{v}</div>
              </div>
            ))}
          </div>
        </div>
        {alocs.map((a,i)=>{
          const dc=DEST_COLORS[a.tipo]||DEST_COLORS.livre;
          const inv=a.tipo==="investimento"?invests.find(x=>x.id===a.destinoId):null;
          return (
            <div key={i} style={{background:"rgba(0,0,0,0.04)",border:`1px solid rgba(0,0,0,0.08)`,borderRadius:14,padding:"14px 16px",marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:18}}>{dc.icon}</span>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:dc.color,fontFamily:"'DM Sans',sans-serif"}}>{getNome(a)}</div>
                    {inv?.banco&&<div style={{fontSize:10,color:C.modalSub,fontFamily:"'DM Sans',sans-serif"}}>{inv.banco} · {inv.tipo}</div>}
                    <div style={{fontSize:9,color:C.modalSub,fontFamily:"'DM Sans',sans-serif",textTransform:"uppercase",letterSpacing:".05em"}}>{a.pct}% do recebimento</div>
                  </div>
                </div>
                <input type="number" value={a.valorEdit} onChange={e=>setAlocs(alocs.map((x,j)=>j===i?{...x,valorEdit:e.target.value}:x))}
                  style={{background:C.inputBg,border:`1.5px solid ${C.inputBorder}`,borderRadius:8,padding:"6px 10px",width:90,fontSize:13,fontWeight:700,color:dc.color,outline:"none",textAlign:"right",fontFamily:"inherit"}}/>
              </div>
            </div>
          );
        })}
        {livre<0&&<div style={{background:"rgba(224,82,82,0.1)",border:"1px solid rgba(224,82,82,0.3)",borderRadius:10,padding:"10px 14px",marginBottom:14,fontSize:13,color:C.red,fontFamily:"'DM Sans',sans-serif"}}>⚠ Excede em {R(Math.abs(livre))}</div>}
        <Btn variant="green" style={{width:"100%",marginTop:8}} onClick={()=>onConfirm(alocs)}>✓ Confirmar e distribuir</Btn>
      </div>
    </div>
  );
}

// ── Regras Modal ──────────────────────────────────────────────────────────────
function RegrasModal({open,onClose,regras,setRegras,invests,objetivos,dividas}) {
  const [local,setLocal]=useState([]);
  useEffect(()=>{if(open)setLocal(JSON.parse(JSON.stringify(regras)));},[open,regras]);
  const totalPct=local.reduce((s,r)=>s+parseFloat(r.pct||0),0);
  const getOpts=tipo=>tipo==="investimento"?invests.map(i=>({id:i.id,nome:`${i.nome}${i.banco?" · "+i.banco:""}`})):tipo==="objetivo"?objetivos.map(o=>({id:o.id,nome:o.nome})):tipo==="divida"||tipo==="fundo_divida"?dividas.map(d=>({id:d.id,nome:d.credor})):[];
  const save=()=>{setRegras(local);onClose();};
  return (
    <Modal open={open} onClose={onClose} title="Regras de Alocação">
      <div style={{marginBottom:14,fontSize:13,color:C.modalSub,fontFamily:"'DM Sans',sans-serif"}}>Defina como distribuir cada recebimento automaticamente.</div>
      {local.map((r,i)=>{
        const dc=DEST_COLORS[r.tipo]||DEST_COLORS.livre; const opts=getOpts(r.tipo);
        return (
          <div key={r.id||i} style={{background:"rgba(0,0,0,0.04)",border:"1px solid rgba(0,0,0,0.08)",borderRadius:12,padding:"12px 14px",marginBottom:10}}>
            <div style={{display:"flex",gap:8,alignItems:"flex-end",marginBottom:8}}>
              <Sel label="Tipo" value={r.tipo} onChange={e=>{const l=[...local];l[i]={...l[i],tipo:e.target.value,destinoId:""};setLocal(l);}} style={{flex:1}}>
                <option value="investimento">📈 Investimento</option>
                <option value="objetivo">🎯 Objetivo</option>
                <option value="fundo_divida">🏦 Fundo de Dívida</option>
                <option value="divida">💳 Dívida Ativa</option>
                <option value="livre">💰 Livre</option>
              </Sel>
              <div style={{width:75}}>
                <div style={{fontSize:11,fontWeight:600,color:C.modalSub,letterSpacing:".06em",textTransform:"uppercase",marginBottom:5}}>%</div>
                <input type="number" value={r.pct} onChange={e=>{const l=[...local];l[i]={...l[i],pct:e.target.value};setLocal(l);}}
                  style={{background:C.inputBg,border:`1.5px solid ${C.inputBorder}`,borderRadius:10,padding:"11px 10px",color:dc.color,fontSize:14,fontWeight:700,width:"100%",outline:"none",fontFamily:"inherit",textAlign:"center"}}/>
              </div>
              <button onClick={()=>setLocal(local.filter((_,j)=>j!==i))} style={{background:"none",border:"none",color:"#999",fontSize:20,cursor:"pointer",padding:"0 4px 2px",lineHeight:1}}>×</button>
            </div>
            {r.tipo!=="livre"&&opts.length>0&&(
              <Sel label="Destino" value={r.destinoId} onChange={e=>{const o=opts.find(x=>x.id===e.target.value);const l=[...local];l[i]={...l[i],destinoId:e.target.value,destinoNome:o?.nome||""};setLocal(l);}}>
                <option value="">Selecione...</option>{opts.map(o=><option key={o.id} value={o.id}>{o.nome}</option>)}
              </Sel>
            )}
            {r.tipo!=="livre"&&opts.length===0&&<div style={{fontSize:12,color:C.red,marginTop:4,fontFamily:"'DM Sans',sans-serif"}}>Cadastre {r.tipo==="investimento"?"investimentos":r.tipo==="objetivo"?"objetivos":"dívidas"} primeiro.</div>}
          </div>
        );
      })}
      <button onClick={()=>setLocal([...local,{id:uid(),tipo:"investimento",destinoId:"",destinoNome:"",pct:"10"}])} style={{width:"100%",background:"none",border:`1.5px dashed rgba(0,0,0,0.15)`,borderRadius:12,padding:"11px",fontSize:13,color:C.modalSub,cursor:"pointer",marginBottom:14,fontFamily:"inherit"}}>+ Adicionar destino</button>
      <div style={{background:totalPct>100?"rgba(224,82,82,0.1)":totalPct===100?"rgba(143,196,58,0.1)":"rgba(212,168,67,0.1)",borderRadius:10,padding:"10px 14px",marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:13,color:C.modalSub,fontFamily:"'DM Sans',sans-serif"}}>Total alocado</span>
        <span style={{fontSize:15,fontWeight:700,color:totalPct>100?C.red:totalPct===100?C.green:C.gold,fontFamily:"'DM Sans',sans-serif"}}>{totalPct.toFixed(1)}%</span>
      </div>
      <Btn variant="primary" style={{width:"100%"}} onClick={save}>Salvar regras</Btn>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════
// MÓDULO 1 — CATEGORIAS CUSTOMIZÁVEIS
// ═══════════════════════════════════════════════════════════════════

const DEFAULT_CATS = {
  despesa: [
    {id:"cat_alim",  nome:"Alimentação",  emoji:"🍔", subcats:[{id:"sub_rest",nome:"Restaurante"},{id:"sub_merc",nome:"Mercado"},{id:"sub_cafe",nome:"Café"}]},
    {id:"cat_trans", nome:"Transporte",   emoji:"🚗", subcats:[{id:"sub_comb",nome:"Combustível"},{id:"sub_uber",nome:"Uber/Táxi"},{id:"sub_est",nome:"Estacionamento"}]},
    {id:"cat_mor",   nome:"Moradia",      emoji:"🏠", subcats:[{id:"sub_alug",nome:"Aluguel"},{id:"sub_cond",nome:"Condomínio"},{id:"sub_luz",nome:"Energia"},{id:"sub_agua",nome:"Água"}]},
    {id:"cat_saude", nome:"Saúde",        emoji:"💊", subcats:[{id:"sub_plano",nome:"Plano de saúde"},{id:"sub_farm",nome:"Farmácia"},{id:"sub_acad",nome:"Academia"}]},
    {id:"cat_laz",   nome:"Lazer",        emoji:"🎭", subcats:[{id:"sub_viag",nome:"Viagem"},{id:"sub_ent",nome:"Entretenimento"},{id:"sub_assin",nome:"Assinaturas"}]},
    {id:"cat_vest",  nome:"Vestuário",    emoji:"👕", subcats:[]},
    {id:"cat_educ",  nome:"Educação",     emoji:"📚", subcats:[{id:"sub_curso",nome:"Cursos"},{id:"sub_livro",nome:"Livros"}]},
    {id:"cat_cont",  nome:"Contas",       emoji:"💡", subcats:[{id:"sub_int",nome:"Internet"},{id:"sub_tel",nome:"Telefone"},{id:"sub_strem",nome:"Streaming"}]},
    {id:"cat_out",   nome:"Outros",       emoji:"📦", subcats:[]},
  ],
  receita: [
    {id:"cat_plant", nome:"Plantão",      emoji:"🏥", subcats:[]},
    {id:"cat_cons",  nome:"Consultório",  emoji:"💼", subcats:[]},
    {id:"cat_ens",   nome:"Ensino",       emoji:"🎓", subcats:[]},
    {id:"cat_inv_r", nome:"Investimento", emoji:"💰", subcats:[]},
    {id:"cat_out_r", nome:"Outros",       emoji:"📦", subcats:[]},
  ]
};

function GerenciarCategorias({cats, setCats, onClose}) {
  const [tipo, setTipo] = useState("despesa");
  const [selCat, setSelCat] = useState(null);
  const [editMode, setEditMode] = useState(null); // null | 'cat' | 'subcat'
  const [editVal, setEditVal] = useState({nome:"", emoji:""});
  const [editId, setEditId] = useState(null);

  const lista = (cats[tipo] || []);

  const addCat = () => {
    const nova = {id:uid(), nome:"Nova Categoria", emoji:"📦", subcats:[]};
    setCats({...cats, [tipo]: [...lista, nova]});
    setSelCat(nova.id);
    setEditMode("cat"); setEditId(nova.id); setEditVal({nome:"Nova Categoria", emoji:"📦"});
  };

  const addSubcat = () => {
    if(!selCat) return;
    const nova = {id:uid(), nome:"Nova Subcategoria"};
    setCats({...cats, [tipo]: lista.map(c => c.id===selCat ? {...c, subcats:[...c.subcats, nova]} : c)});
    setEditMode("subcat"); setEditId(nova.id); setEditVal({nome:"Nova Subcategoria"});
  };

  const saveEdit = () => {
    if(editMode==="cat") {
      setCats({...cats, [tipo]: lista.map(c => c.id===editId ? {...c, nome:editVal.nome, emoji:editVal.emoji||c.emoji} : c)});
    } else if(editMode==="subcat") {
      setCats({...cats, [tipo]: lista.map(c => c.id===selCat ? {...c, subcats:c.subcats.map(s => s.id===editId ? {...s, nome:editVal.nome} : s)} : c)});
    }
    setEditMode(null);
  };

  const delCat = (id) => { setCats({...cats, [tipo]: lista.filter(c => c.id!==id)}); if(selCat===id) setSelCat(null); };
  const delSubcat = (catId, subId) => { setCats({...cats, [tipo]: lista.map(c => c.id===catId ? {...c, subcats:c.subcats.filter(s=>s.id!==subId)} : c)}); };

  const catSel = lista.find(c=>c.id===selCat);

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      {/* Toggle Despesa/Receita */}
      <div style={{display:"flex",background:"#EDE8E0",borderRadius:12,padding:4}}>
        {["despesa","receita"].map(t=>(
          <button key={t} onClick={()=>{setTipo(t);setSelCat(null);setEditMode(null);}}
            style={{flex:1,background:tipo===t?(t==="despesa"?"#E8205F":"#4A7A1A"):"transparent",color:tipo===t?"#fff":"#5A4A3A",border:"none",borderRadius:10,padding:"8px",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",transition:"all .15s"}}>
            {t==="despesa"?"Despesa":"Receita"}
          </button>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {/* Categorias */}
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{fontSize:11,fontWeight:700,color:"#5A4A3A",letterSpacing:".06em",textTransform:"uppercase"}}>Categoria</div>
            <button onClick={addCat} style={{background:"none",border:"none",color:"#E8205F",fontSize:18,cursor:"pointer",lineHeight:1,padding:"0 2px"}}>+</button>
          </div>
          <div style={{maxHeight:200,overflowY:"auto",display:"flex",flexDirection:"column",gap:4}}>
            {lista.map(c=>(
              <div key={c.id} onClick={()=>setSelCat(c.id)}
                style={{display:"flex",alignItems:"center",gap:7,padding:"8px 10px",borderRadius:9,background:selCat===c.id?"rgba(232,32,95,0.1)":"rgba(0,0,0,0.03)",border:`1px solid ${selCat===c.id?"rgba(232,32,95,0.3)":"transparent"}`,cursor:"pointer"}}>
                <span style={{fontSize:15}}>{c.emoji}</span>
                <span style={{flex:1,fontSize:12,fontWeight:500,color:"#1A1209"}}>{c.nome}</span>
                <button onClick={e=>{e.stopPropagation();setEditMode("cat");setEditId(c.id);setEditVal({nome:c.nome,emoji:c.emoji});setSelCat(c.id);}}
                  style={{background:"none",border:"none",color:"#aaa",fontSize:12,cursor:"pointer",padding:"0 2px"}}>✏️</button>
                <button onClick={e=>{e.stopPropagation();delCat(c.id);}}
                  style={{background:"none",border:"none",color:"#aaa",fontSize:12,cursor:"pointer",padding:"0 2px"}}>🗑</button>
              </div>
            ))}
          </div>
        </div>

        {/* Subcategorias */}
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{fontSize:11,fontWeight:700,color:"#5A4A3A",letterSpacing:".06em",textTransform:"uppercase"}}>Subcategoria</div>
            {selCat&&<button onClick={addSubcat} style={{background:"none",border:"none",color:"#E8205F",fontSize:18,cursor:"pointer",lineHeight:1,padding:"0 2px"}}>+</button>}
          </div>
          <div style={{maxHeight:200,overflowY:"auto",display:"flex",flexDirection:"column",gap:4}}>
            {catSel?.subcats.map(s=>(
              <div key={s.id} style={{display:"flex",alignItems:"center",gap:7,padding:"8px 10px",borderRadius:9,background:"rgba(0,0,0,0.03)"}}>
                <span style={{flex:1,fontSize:12,color:"#1A1209"}}>{s.nome}</span>
                <button onClick={()=>{setEditMode("subcat");setEditId(s.id);setEditVal({nome:s.nome});}}
                  style={{background:"none",border:"none",color:"#aaa",fontSize:12,cursor:"pointer",padding:"0 2px"}}>✏️</button>
                <button onClick={()=>delSubcat(selCat,s.id)}
                  style={{background:"none",border:"none",color:"#aaa",fontSize:12,cursor:"pointer",padding:"0 2px"}}>🗑</button>
              </div>
            ))}
            {catSel && catSel.subcats.length===0 && <div style={{fontSize:11,color:"#aaa",padding:"8px 0",fontFamily:"'DM Sans',sans-serif"}}>Nenhuma subcategoria</div>}
            {!catSel && <div style={{fontSize:11,color:"#aaa",padding:"8px 0",fontFamily:"'DM Sans',sans-serif"}}>Selecione uma categoria</div>}
          </div>
        </div>
      </div>

      {/* Editor inline */}
      {editMode && (
        <div style={{background:"rgba(232,32,95,0.06)",border:"1px solid rgba(232,32,95,0.2)",borderRadius:12,padding:"14px"}}>
          <div style={{fontSize:12,fontWeight:700,color:"#5A4A3A",marginBottom:10,fontFamily:"'DM Sans',sans-serif"}}>
            Editar {editMode==="cat"?"Categoria":"Subcategoria"}
          </div>
          <div style={{display:"flex",gap:8,marginBottom:10}}>
            {editMode==="cat"&&<input value={editVal.emoji} onChange={e=>setEditVal({...editVal,emoji:e.target.value})}
              style={{background:"#F5F0E8",border:"1.5px solid #DDD5C8",borderRadius:8,padding:"8px",width:50,fontSize:18,textAlign:"center",outline:"none"}}/>}
            <input value={editVal.nome} onChange={e=>setEditVal({...editVal,nome:e.target.value})}
              style={{background:"#F5F0E8",border:"1.5px solid #DDD5C8",borderRadius:8,padding:"8px 12px",flex:1,fontSize:13,color:"#1A1209",outline:"none"}}
              onKeyDown={e=>e.key==="Enter"&&saveEdit()}/>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setEditMode(null)} style={{flex:1,background:"rgba(0,0,0,0.06)",border:"1px solid rgba(0,0,0,0.12)",borderRadius:10,padding:"8px",fontSize:13,fontWeight:600,cursor:"pointer",color:"#5A4A3A",fontFamily:"inherit"}}>Cancelar</button>
            <button onClick={saveEdit} style={{flex:2,background:"#E8205F",border:"none",borderRadius:10,padding:"8px",fontSize:13,fontWeight:700,cursor:"pointer",color:"#fff",fontFamily:"inherit"}}>Salvar</button>
          </div>
        </div>
      )}

      <button onClick={onClose} style={{background:"#E8205F",border:"none",borderRadius:12,padding:"12px",fontSize:14,fontWeight:700,cursor:"pointer",color:"#fff",fontFamily:"inherit",marginTop:4}}>
        Fechar
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MÓDULO 2 — PLANEJAMENTO ORÇAMENTÁRIO
// ═══════════════════════════════════════════════════════════════════

function OrcamentoTab({movs, plantoes, cats, orcamento, setOrcamento, selMes}) {
  const [viewMode, setViewMode] = useState("planejado"); // 'planejado' | 'recebimento'
  const [editCat, setEditCat] = useState(null);
  const [editVal, setEditVal] = useState("");

  const recebimentoPrevMes = plantoes
    .filter(p => monthKey(p.previsao)===selMes)
    .reduce((s,p)=>s+p.valorTotal,0);

  const movsM = movs.filter(m=>monthKey(m.data)===selMes);
  const totalReceitaReal = movsM.filter(m=>m.tipo==="entrada").reduce((s,m)=>s+m.valor,0);

  const baseCalc = viewMode==="recebimento" ? recebimentoPrevMes : null;

  const categorias = cats?.despesa || DEFAULT_CATS.despesa;

  const gastosPorCat = {};
  movsM.filter(m=>m.tipo==="saida").forEach(m=>{
    // Agrupa pela categoria pai (antes do "·") para bater com o orçamento
    const cat = m.categoria.includes("·") ? m.categoria.split("·")[0].trim() : m.categoria;
    gastosPorCat[cat] = (gastosPorCat[cat]||0)+m.valor;
  });

  const totalPlanejado = categorias.reduce((s,c)=>{
    const orc = orcamento[selMes]?.[c.id] || 0;
    return s+orc;
  },0);

  const totalGasto = Object.values(gastosPorCat).reduce((s,v)=>s+v,0);

  return (
    <div>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div>
          <div style={{fontSize:22,fontWeight:300,color:"#1A1209"}}>{monthLabel(selMes)}</div>
          <div style={{fontSize:11,color:"rgba(26,18,9,0.6)",fontFamily:"'DM Sans',sans-serif",marginTop:1}}>Planejamento orçamentário</div>
        </div>
      </div>

      {/* Resumo */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
        {[
          {l:"Planejado",v:totalPlanejado,c:"#E8205F"},
          {l:"Realizado",v:totalGasto,c:"#FF8A80"},
          {l:"Saldo",v:totalPlanejado-totalGasto,c:totalPlanejado-totalGasto>=0?"#A8E063":"#FF8A80"},
        ].map(x=>(
          <div key={x.l} className="card" style={{padding:"10px 12px",textAlign:"center"}}>
            <div style={{fontSize:9,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",color:"rgba(26,18,9,0.5)",fontFamily:"'DM Sans',sans-serif",marginBottom:3}}>{x.l}</div>
            <div style={{fontSize:13,fontWeight:700,color:x.c,fontFamily:"'DM Sans',sans-serif",letterSpacing:"-.01em"}}>{R(x.v)}</div>
          </div>
        ))}
      </div>

      {/* Toggle % */}
      <div style={{display:"flex",background:"rgba(255,255,255,0.12)",borderRadius:12,padding:3,marginBottom:12,border:"1px solid rgba(255,255,255,0.2)"}}>
        <button onClick={()=>setViewMode("planejado")}
          style={{flex:1,background:viewMode==="planejado"?"#E8205F":"transparent",color:viewMode==="planejado"?"#fff":"rgba(26,18,9,0.6)",border:"none",borderRadius:10,padding:"7px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",transition:"all .15s"}}>
          % do Planejado
        </button>
        <button onClick={()=>setViewMode("recebimento")}
          style={{flex:1,background:viewMode==="recebimento"?"#E8205F":"transparent",color:viewMode==="recebimento"?"#fff":"rgba(26,18,9,0.6)",border:"none",borderRadius:10,padding:"7px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",transition:"all .15s"}}>
          % do Recebimento Previsto
        </button>
      </div>

      {viewMode==="recebimento"&&recebimentoPrevMes===0&&(
        <div style={{background:"rgba(212,168,67,0.2)",border:"1px solid rgba(212,168,67,0.4)",borderRadius:10,padding:"10px 14px",marginBottom:10,fontSize:12,color:"#8B6000",fontFamily:"'DM Sans',sans-serif"}}>
          ⚠ Nenhum plantão com previsão para {monthLabel(selMes)}. Cadastre plantões para ver a % do recebimento.
        </div>
      )}

      {viewMode==="recebimento"&&recebimentoPrevMes>0&&(
        <div style={{background:"rgba(168,224,99,0.15)",border:"1px solid rgba(168,224,99,0.3)",borderRadius:10,padding:"10px 14px",marginBottom:10,fontSize:12,color:"#2D5A10",fontFamily:"'DM Sans',sans-serif"}}>
          Base: {R(recebimentoPrevMes)} previstos para {monthLabel(selMes)}
        </div>
      )}

      {/* Tabela por categoria */}
      <div className="card">
        <div style={{display:"grid",gridTemplateColumns:"1fr auto auto auto",gap:8,marginBottom:10,paddingBottom:8,borderBottom:"1px solid rgba(255,255,255,0.1)"}}>
          {["Categoria","Planejado","Realizado","%"].map(h=>(
            <div key={h} style={{fontSize:10,fontWeight:700,color:"rgba(26,18,9,0.45)",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif",textAlign:h!=="Categoria"?"right":"left"}}>{h}</div>
          ))}
        </div>
        {categorias.map(c=>{
          const gasto = gastosPorCat[`${c.emoji} ${c.nome}`] || 
                        Object.entries(gastosPorCat).filter(([k])=>k.includes(c.nome)).reduce((s,[,v])=>s+v,0);
          const plan = orcamento[selMes]?.[c.id] || 0;
          const base = viewMode==="recebimento" ? recebimentoPrevMes : plan;
          const pct = base>0 ? (gasto/base*100) : 0;
          const over = plan>0 && gasto>plan;
          return (
            <div key={c.id} style={{display:"grid",gridTemplateColumns:"1fr auto auto auto",gap:8,alignItems:"center",marginBottom:8}}>
              <div>
                <div style={{fontSize:12,fontWeight:600,color:"#1A1209",fontFamily:"'DM Sans',sans-serif"}}>{c.emoji} {c.nome}</div>
                <div style={{marginTop:3}}>
                  <div style={{background:"rgba(0,0,0,0.2)",borderRadius:99,height:4,overflow:"hidden"}}>
                    <div style={{width:`${Math.min(pct,100)}%`,height:"100%",background:over?"#FF8A80":"#A8E063",borderRadius:99,transition:"width .5s"}}/>
                  </div>
                </div>
              </div>
              <div style={{textAlign:"right"}}>
                {editCat===c.id ? (
                  <input type="number" value={editVal} onChange={e=>setEditVal(e.target.value)}
                    onBlur={()=>{setOrcamento({...orcamento,[selMes]:{...(orcamento[selMes]||{}),[c.id]:+editVal}});setEditCat(null);}}
                    onKeyDown={e=>e.key==="Enter"&&(setOrcamento({...orcamento,[selMes]:{...(orcamento[selMes]||{}),[c.id]:+editVal}}),setEditCat(null))}
                    autoFocus style={{background:"#F5F0E8",border:"1.5px solid #DDD5C8",borderRadius:6,padding:"3px 6px",width:70,fontSize:11,color:"#1A1209",outline:"none",textAlign:"right",fontFamily:"inherit"}}/>
                ) : (
                  <button onClick={()=>{setEditCat(c.id);setEditVal(plan||"");}}
                    style={{background:"none",border:"none",color:plan>0?"#1A1209":"rgba(26,18,9,0.35)",fontSize:11,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:plan>0?600:400}}>
                    {plan>0?R(plan):"+ planejar"}
                  </button>
                )}
              </div>
              <div style={{textAlign:"right",fontSize:11,color:"rgba(26,18,9,0.75)",fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>{R(gasto)}</div>
              <div style={{textAlign:"right",fontSize:11,fontWeight:700,color:over?"#8B1A1A":pct>80?"#8B6000":"#2D5A10",fontFamily:"'DM Sans',sans-serif"}}>{pct.toFixed(0)}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MÓDULO 3 — BALANÇO MENSAL COM GRÁFICOS
// ═══════════════════════════════════════════════════════════════════

function BalancoTab({movs, plantoes, ccMovs, cartoes, selMes}) {
  // Últimos 12 meses
  const meses = Array.from({length:12},(_,i)=>{const d=new Date();d.setMonth(d.getMonth()-11+i);return d.toISOString().slice(0,7);});

  const dataLinha = meses.map(ym=>({
    ym,
    label: monthLabel(ym).split(" ")[0],
    ent: movs.filter(m=>m.tipo==="entrada"&&monthKey(m.data)===ym).reduce((s,m)=>s+m.valor,0),
    sai: movs.filter(m=>m.tipo==="saida"&&monthKey(m.data)===ym).reduce((s,m)=>s+m.valor,0)
        + ccMovs.filter(m=>monthKey(m.data)===ym).reduce((s,m)=>s+m.valor,0),
  }));

  const maxVal = Math.max(...dataLinha.map(d=>Math.max(d.ent,d.sai)),1);
  const H = 100;

  // Gastos por categoria do mês selecionado
  const movsM = movs.filter(m=>monthKey(m.data)===selMes&&m.tipo==="saida");
  const byCat = {};
  movsM.forEach(m=>{
    const cat = m.categoria.includes("·") ? m.categoria.split("·")[0].trim() : m.categoria;
    byCat[cat]=(byCat[cat]||0)+m.valor;
  });
  const catData = Object.entries(byCat).sort((a,b)=>b[1]-a[1]);
  const totalGastos = catData.reduce((s,[,v])=>s+v,0);
  const maxCat = catData.length ? catData[0][1] : 1;

  // Cartões do mês
  const cartaoData = cartoes.map(c=>{
    const usado = ccMovs.filter(m=>m.cartao===c.id&&monthKey(m.data)===selMes).reduce((s,m)=>s+m.valor,0);
    const pct = c.limite>0 ? usado/c.limite*100 : 0;
    return {...c, usado, pct};
  }).filter(c=>c.usado>0).sort((a,b)=>b.pct-a.pct);

  const entM = dataLinha.find(d=>d.ym===selMes)?.ent||0;
  const saiM = dataLinha.find(d=>d.ym===selMes)?.sai||0;

  return (
    <div>
      {/* Resumo topo */}
      <div style={{display:"flex",gap:10,marginBottom:14}}>
        {[{l:"↑ Receitas",v:entM,c:"#A8E063"},{l:"↓ Despesas",v:saiM,c:"#FF8A80"},{l:"= Saldo",v:entM-saiM,c:entM-saiM>=0?"#A8E063":"#FF8A80"}].map(x=>(
          <div key={x.l} className="card" style={{flex:1,padding:"10px 12px",textAlign:"center"}}>
            <div style={{fontSize:9,fontWeight:700,color:"rgba(26,18,9,0.6)",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif",marginBottom:3}}>{x.l}</div>
            <div style={{fontSize:13,fontWeight:700,color:x.c,fontFamily:"'DM Sans',sans-serif",letterSpacing:"-.01em"}}>{R(x.v)}</div>
          </div>
        ))}
      </div>

      {/* Gráfico de linha */}
      <div className="card" style={{marginBottom:12}}>
        <div style={{fontSize:11,fontWeight:700,color:"rgba(26,18,9,0.5)",letterSpacing:".07em",textTransform:"uppercase",marginBottom:12}}>Receitas vs Despesas — 12 meses</div>
        <svg width="100%" height={H+30} viewBox={`0 0 ${meses.length*40} ${H+30}`} style={{overflow:"visible"}}>
          {/* Grid lines */}
          {[0,25,50,75,100].map(y=>(
            <line key={y} x1={0} y1={H-y} x2={meses.length*40} y2={H-y} stroke="rgba(255,255,255,0.06)" strokeWidth={1}/>
          ))}
          {/* Área entradas */}
          <polyline
            points={dataLinha.map((d,i)=>`${i*40+20},${H-(d.ent/maxVal*H)}`).join(" ")}
            fill="none" stroke="#A8E063" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
          {/* Área saídas */}
          <polyline
            points={dataLinha.map((d,i)=>`${i*40+20},${H-(d.sai/maxVal*H)}`).join(" ")}
            fill="none" stroke="#FF8A80" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
          {/* Pontos e labels mês */}
          {dataLinha.map((d,i)=>(
            <g key={d.ym}>
              <circle cx={i*40+20} cy={H-(d.ent/maxVal*H)} r={3} fill="#A8E063"/>
              <circle cx={i*40+20} cy={H-(d.sai/maxVal*H)} r={3} fill="#FF8A80"/>
              <text x={i*40+20} y={H+20} textAnchor="middle" fontSize={8} fill={d.ym===selMes?"#1A1209":"rgba(26,18,9,0.35)"} fontFamily="DM Sans">{d.label}</text>
            </g>
          ))}
        </svg>
        <div style={{display:"flex",gap:12,justifyContent:"center",marginTop:6}}>
          {[["#A8E063","Receitas"],["#FF8A80","Despesas"]].map(([c,l])=>(
            <div key={l} style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:8,height:8,borderRadius:99,background:c}}/><span style={{fontSize:10,color:"rgba(26,18,9,0.55)",fontFamily:"'DM Sans',sans-serif"}}>{l}</span></div>
          ))}
        </div>
      </div>

      {/* Gastos por categoria — barras horizontais */}
      {catData.length>0&&(
        <div className="card" style={{marginBottom:12}}>
          <div style={{fontSize:11,fontWeight:700,color:"rgba(26,18,9,0.5)",letterSpacing:".07em",textTransform:"uppercase",marginBottom:12}}>% por categoria · {monthLabel(selMes)}</div>
          {catData.map(([cat,val],i)=>{
            const pct = totalGastos>0 ? val/totalGastos*100 : 0;
            return (
              <div key={cat} style={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{fontSize:12,color:"#1A1209",fontFamily:"'DM Sans',sans-serif"}}>{cat}</span>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <span style={{fontSize:11,color:"rgba(26,18,9,0.55)",fontFamily:"'DM Sans',sans-serif"}}>{R(val)}</span>
                    <span style={{fontSize:11,fontWeight:700,color:CHART_COLORS[i%CHART_COLORS.length],fontFamily:"'DM Sans',sans-serif",minWidth:35,textAlign:"right"}}>{pct.toFixed(1)}%</span>
                  </div>
                </div>
                <div style={{background:"rgba(0,0,0,0.2)",borderRadius:99,height:6,overflow:"hidden"}}>
                  <div style={{width:`${pct}%`,height:"100%",background:CHART_COLORS[i%CHART_COLORS.length],borderRadius:99,transition:"width .5s",boxShadow:`0 0 6px ${CHART_COLORS[i%CHART_COLORS.length]}66`}}/>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cartões */}
      {cartaoData.length>0&&(
        <div className="card">
          <div style={{fontSize:11,fontWeight:700,color:"rgba(26,18,9,0.5)",letterSpacing:".07em",textTransform:"uppercase",marginBottom:12}}>Gastos com cartões · {monthLabel(selMes)}</div>
          {cartaoData.map(c=>(
            <div key={c.id} style={{marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <span style={{fontSize:12,fontWeight:600,color:"#1A1209",fontFamily:"'DM Sans',sans-serif"}}>▭ {c.nome}</span>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <span style={{fontSize:11,fontWeight:700,color:c.pct>100?"#FF8A80":c.pct>80?"#FFD580":"rgba(255,255,255,0.7)",fontFamily:"'DM Sans',sans-serif"}}>{c.pct.toFixed(1)}%</span>
                  <span style={{fontSize:11,color:"rgba(26,18,9,0.55)",fontFamily:"'DM Sans',sans-serif"}}>{R(c.usado)}</span>
                </div>
              </div>
              <div style={{background:"rgba(0,0,0,0.2)",borderRadius:99,height:6,overflow:"hidden"}}>
                <div style={{width:`${Math.min(c.pct,100)}%`,height:"100%",background:c.pct>100?"#FF8A80":c.pct>80?"#FFD580":"#E8205F",borderRadius:99,transition:"width .5s"}}/>
              </div>
              <div style={{fontSize:10,color:"rgba(26,18,9,0.45)",marginTop:3,fontFamily:"'DM Sans',sans-serif"}}>Limite: {R(c.limite)} · Disponível: {R(Math.max(c.limite-c.usado,0))}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Gráfico de subcategorias ── */}
      {(()=>{
        // Montar mapa: categoria pai → {total, subs: {nome→valor}}
        const mapa = {};
        movsM.filter(m=>m.tipo==="saida"&&m.categoria.includes("·")).forEach(m=>{
          const [pai, sub] = m.categoria.split("·").map(s=>s.trim());
          if(!mapa[pai]) mapa[pai] = {total:0, subs:{}};
          mapa[pai].total += m.valor;
          mapa[pai].subs[sub] = (mapa[pai].subs[sub]||0) + m.valor;
        });
        const cats = Object.entries(mapa).sort((a,b)=>b[1].total-a[1].total);
        if(!cats.length) return null;
        return (
          <div className="card" style={{marginBottom:12}}>
            <div style={{fontSize:11,fontWeight:700,color:"rgba(26,18,9,0.5)",letterSpacing:".07em",textTransform:"uppercase",marginBottom:14}}>Detalhamento por subcategoria · {monthLabel(selMes)}</div>
            {cats.map(([pai, {total, subs}])=>{
              const subList = Object.entries(subs).sort((a,b)=>b[1]-a[1]);
              const maxSub = subList[0]?.[1]||1;
              return (
                <div key={pai} style={{marginBottom:16}}>
                  {/* Header categoria pai */}
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,paddingBottom:6,borderBottom:"1px solid rgba(0,0,0,0.07)"}}>
                    <span style={{fontSize:13,fontWeight:700,color:"#1A1209",fontFamily:"'DM Sans',sans-serif"}}>{pai}</span>
                    <span style={{fontSize:12,fontWeight:700,color:"#8B1A1A",fontFamily:"'DM Sans',sans-serif"}}>{R(total)}</span>
                  </div>
                  {/* Subcategorias */}
                  {subList.map(([sub, val],idx)=>{
                    const pct = total>0 ? val/total*100 : 0;
                    const alerta = pct >= 60;
                    const color = alerta ? "#C0392B" : idx===0 ? "#E8205F" : "#5BA3D4";
                    return (
                      <div key={sub} style={{marginBottom:8}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                          <div style={{display:"flex",alignItems:"center",gap:6}}>
                            {alerta&&<span style={{fontSize:12}}>🔴</span>}
                            <span style={{fontSize:12,color:"#1A1209",fontFamily:"'DM Sans',sans-serif",fontWeight:alerta?700:400}}>{sub}</span>
                          </div>
                          <div style={{display:"flex",gap:8,alignItems:"center"}}>
                            <span style={{fontSize:11,color:"rgba(26,18,9,0.55)",fontFamily:"'DM Sans',sans-serif"}}>{R(val)}</span>
                            <span style={{fontSize:11,fontWeight:700,color,fontFamily:"'DM Sans',sans-serif",minWidth:35,textAlign:"right"}}>{pct.toFixed(0)}%</span>
                          </div>
                        </div>
                        <div style={{background:"rgba(0,0,0,0.08)",borderRadius:99,height:5,overflow:"hidden"}}>
                          <div style={{width:`${pct}%`,height:"100%",background:color,borderRadius:99,transition:"width .5s",boxShadow:alerta?`0 0 8px ${color}66`:"none"}}/>
                        </div>
                        {alerta&&<div style={{fontSize:10,color:"#C0392B",fontFamily:"'DM Sans',sans-serif",marginTop:2,fontWeight:600}}>⚠ Representa {pct.toFixed(0)}% de todos os gastos com {pai.split(" ").slice(1).join(" ")}</div>}
                      </div>
                    );
                  })}
                </div>
              );
            })}
            {/* Legenda de alertas */}
            <div style={{background:"rgba(192,57,43,0.07)",border:"1px solid rgba(192,57,43,0.2)",borderRadius:10,padding:"8px 12px",marginTop:4}}>
              <div style={{fontSize:11,fontWeight:700,color:"#C0392B",fontFamily:"'DM Sans',sans-serif",marginBottom:2}}>🔴 Como interpretar os alertas</div>
              <div style={{fontSize:10,color:"rgba(26,18,9,0.6)",fontFamily:"'DM Sans',sans-serif",lineHeight:1.5}}>Uma subcategoria em vermelho significa que ela concentra mais de 60% dos gastos da categoria. Pode indicar um padrão de consumo que merece atenção.</div>
            </div>
          </div>
        );
      })()}

      {catData.length===0&&cartaoData.length===0&&(
        <div className="card" style={{textAlign:"center",padding:36,color:"rgba(26,18,9,0.4)",fontSize:14,fontFamily:"'DM Sans',sans-serif"}}>
          Nenhum gasto registrado em {monthLabel(selMes)}
        </div>
      )}
    </div>
  );
}



// ── Importação de Extrato ────────────────────────────────────────────────────
const KEYWORD_CATS = [
  {cat:"🍔 Alimentação", keys:["ifood","rappi","uber eat","delivery","restaur","lanchon","mcdonalds","burger","subway","pizza","padaria","mercado","supermercado","pao de acucar","carrefour","atacadao","hortifruti","acougue","sushi","churrasco"]},
  {cat:"🚗 Transporte",  keys:["uber","99app","taxi","táxi","gasolina","combustiv","posto ","shell","ipiranga","br distribu","estacionam","pedágio","pedagio","metro","ônibus","onibus","trem","brt"]},
  {cat:"🏠 Moradia",     keys:["aluguel","condomin","iptu","água","agua","sabesp","celesc","copel","cemig","coelba","energia","luz ","esgoto"]},
  {cat:"💊 Saúde",       keys:["farmácia","farmacia","drogaria","droga raia","hospital","clínica","clinica","médico","medico","plano de saude","unimed","hapvida","amil","sulamerica","academia","smart fit","bio ritmo","bodytech","consultorio"]},
  {cat:"🎭 Lazer",       keys:["netflix","spotify","amazon prime","disney","hbo","deezer","youtube","cinema","teatro","ingresso","airbnb","booking"]},
  {cat:"👕 Vestuário",   keys:["renner","riachuelo","c&a","zara","h&m","roupas","calçados","calcados","sapatos","americanas","marisa"]},
  {cat:"📚 Educação",    keys:["escola","faculdade","universidade","curso","livro","saraiva","estácio","estacio","anhanguera","unip"]},
  {cat:"💡 Contas",      keys:["claro","vivo","tim ","oi ","net ","giga","internet","celular","telefone","google ","apple ","icloud","microsoft","recarga"]},
];

const TRANSFER_KEYS = ["aplicação em fundo","aplicacao em fundo","aplicacao fundo","invest","resgate fundo","cdb","lci","lca","tesouro","poupança","poupanca","fundo de invest","pagamento fatura","pagamento de fatura","fatura cartao","fatura cartão","transferencia entre contas","transferência entre contas"];

function isTransfer(desc) {
  const d = (desc||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  return TRANSFER_KEYS.some(k=>d.includes(k));
}

function guessCat(desc) {
  const d = (desc||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  for(const {cat, keys} of KEYWORD_CATS) {
    if(keys.some(k=>d.includes(k))) return cat;
  }
  return "📦 Outros";
}

function parseOFX(text) {
  const txns = [];
  const blocks = text.split(/<STMTTRN>/i).slice(1);
  blocks.forEach(block => {
    const get = tag => { const m=block.match(new RegExp(`<${tag}>([^<\\n]+)`,"i")); return m?m[1].trim():""; };
    const amt = parseFloat(get("TRNAMT")||"0");
    const memo = get("MEMO")||get("NAME")||"Sem descrição";
    const dtRaw = get("DTPOSTED")||get("DTAVAIL")||"";
    let data = "";
    if(dtRaw.length>=8) data=`${dtRaw.slice(0,4)}-${dtRaw.slice(4,6)}-${dtRaw.slice(6,8)}`;
    if(amt!==0) txns.push({desc:memo, valor:Math.abs(amt), tipo:isTransfer(memo)?"transferencia":amt>0?"entrada":"saida", data, categoria:isTransfer(memo)?"🔄 Transferência":guessCat(memo)});
  });
  return txns;
}

function parseCSV(text) {
  const txns = [];
  const linhas = text.split(/\r?\n/).filter(l=>l.trim());
  if(linhas.length<2) return txns;
  const sep = linhas[0].includes(";") ? ";" : ",";
  const cols = linhas[0].split(sep).map(c=>c.trim().toLowerCase().replace(/"/g,""));
  const iData  = cols.findIndex(c=>c.includes("data")||c==="date");
  const iDesc  = cols.findIndex(c=>c.includes("descri")||c.includes("histór")||c.includes("histor")||c.includes("title")||c.includes("memo")||c.includes("lançamento")||c.includes("lancamento"));
  const iValor = cols.findIndex(c=>c==="valor"||c==="amount"||c.includes("vlr"));
  const iCred  = cols.findIndex(c=>c.includes("crédit")||c.includes("credit"));
  const iDeb   = cols.findIndex(c=>c.includes("débit")||c.includes("debit"));
  for(let i=1;i<linhas.length;i++){
    const parts = linhas[i].split(sep).map(p=>p.trim().replace(/^"|"$/g,""));
    if(parts.length<2) continue;
    let desc = iDesc>=0 ? parts[iDesc] : parts[1]||"";
    if(!desc||desc.toLowerCase().includes("saldo")) continue;
    let data="";
    if(iData>=0){const raw=parts[iData]||"";if(raw.includes("/")){const[d,m,y]=raw.split("/");data=`${y.length===2?"20"+y:y}-${m.padStart(2,"0")}-${d.padStart(2,"0")}`;}else if(raw.includes("-")){data=raw.slice(0,10);}}
    let valor=0,tipo="saida";
    if(iValor>=0){const v=(parts[iValor]||"").replace(/[R$\s]/g,"").replace(".","").replace(",",".");valor=Math.abs(parseFloat(v)||0);tipo=parseFloat(v)>0?"entrada":"saida";}
    else if(iCred>=0||iDeb>=0){const cred=parseFloat((parts[iCred]||"").replace(".","").replace(",","."))||0;const deb=parseFloat((parts[iDeb]||"").replace(".","").replace(",","."))||0;if(cred>0){valor=cred;tipo="entrada";}else if(deb>0){valor=deb;tipo="saida";}}
    if(valor>0) txns.push({desc,valor,tipo:isTransfer(desc)?"transferencia":tipo,data,categoria:isTransfer(desc)?"🔄 Transferência":guessCat(desc)});
  }
  return txns;
}

async function loadPDFJS() {
  if(window.pdfjsLib) return window.pdfjsLib;
  return new Promise((resolve,reject)=>{
    const s=document.createElement("script");
    s.src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    s.onload=()=>{window.pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";resolve(window.pdfjsLib);};
    s.onerror=reject;
    document.head.appendChild(s);
  });
}

async function extractPDFText(arrayBuffer, password) {
  const pdfjs = await loadPDFJS();
  const pdf = await pdfjs.getDocument({data:arrayBuffer.slice(0), password:password||undefined}).promise;
  let text = "";
  for(let i=1;i<=pdf.numPages;i++){
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map(it=>it.str).join(" ") + "\n";
  }
  return text;
}

async function extractFromImage(base64, mediaType) {
  const apiKey = localStorage.getItem("velara_gemini_key")||"";
  if(!apiKey) throw new Error("SEM_CHAVE");
  const prompt = `Analise este extrato bancário brasileiro. Extraia TODAS as transações visíveis. Retorne SOMENTE array JSON sem markdown: [{"desc":"descrição","valor":25.90,"tipo":"saida","data":"2025-06-01"}]. tipo: entrada=credito/PIX recebido, saida=debito/compra/PIX enviado. valor positivo. data YYYY-MM-DD ou null.`;
  const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({contents:[{parts:[{inline_data:{mime_type:mediaType,data:base64}},{text:prompt}]}]})
  });
  const data = await resp.json();
  if(data.error) throw new Error(data.error.message||"Erro na API Gemini");
  const txt = data.candidates?.[0]?.content?.parts?.[0]?.text||"[]";
  return JSON.parse(txt.replace(/```json|```/g,"").trim());
}

function parseTextoBancario(text) {
  // Parser para texto extraído de PDF de extratos brasileiros
  const txns = [];
  const lines = text.split(/\n/).filter(l=>l.trim().length>4);
  lines.forEach(line=>{
    // Buscar data DD/MM/YYYY ou DD/MM/YY
    const dateMatch = line.match(/(\d{2})[\/-](\d{2})[\/-](\d{2,4})/);
    if(!dateMatch) return;
    const [,dd,mm,yy] = dateMatch;
    const year = yy.length===2?"20"+yy:yy;
    const data = `${year}-${mm}-${dd}`;
    // Buscar valores monetários
    const vals = [...line.matchAll(/[\-+]?\s*R?\$?\s*(\d{1,3}(?:\.\d{3})*,\d{2}|\d+,\d{2})/g)];
    if(!vals.length) return;
    const lastVal = vals[vals.length-1];
    const raw = lastVal[1].replace(/\./g,"").replace(",",".");
    const valor = Math.abs(parseFloat(raw)||0);
    if(valor<0.01) return;
    // Descrição = linha sem data e sem valores
    let desc = line.replace(dateMatch[0],"").replace(/[\-+]?\s*R?\$?\s*\d{1,3}(?:\.\d{3})*,\d{2}/g,"").replace(/\s+/g," ").trim();
    if(desc.length<2) return;
    // Tipo: crédito ou débito
    const credKeys = /pix receb|crédito|credit|depósit|salário|pagamento receb|transferência receb/i;
    const tipo = credKeys.test(line)?"entrada":"saida";
    txns.push({desc,valor,tipo:isTransfer(desc)?"transferencia":tipo,data,categoria:isTransfer(desc)?"🔄 Transferência":guessCat(desc)});
  });
  return txns;
}

function ImportacaoModal({open, onClose, onImport, cats}) {
  const [step,     setStep]     = useState(1);
  const [modo,     setModo]     = useState("arquivo"); // arquivo | foto
  const [loading,  setLoading]  = useState(false);
  const [loadMsg,  setLoadMsg]  = useState("");
  const [pdfFile,  setPdfFile]  = useState(null);
  const [pdfSenha, setPdfSenha] = useState("");
  const [pedeSenha,setPedeSenha]= useState(false);
  const [txns,     setTxns]     = useState([]);
  const [erro,     setErro]     = useState("");

  const CATS_DESP = (cats?.despesa||[]).map(c=>`${c.emoji} ${c.nome}`);
  const CATS_REC  = (cats?.receita||[]).map(c=>`${c.emoji} ${c.nome}`);

  const reset = () => {setStep(1);setTxns([]);setErro("");setLoading(false);setPdfFile(null);setPdfSenha("");setPedeSenha(false);};

  const applyTxns = parsed => {
    setTxns(parsed.map((t,i)=>({...t,id:i,selected:true,categoria:t.categoria||guessCat(t.desc||"")})));
    setStep(2);
  };

  const handleFile = async e => {
    const file = e.target.files[0]; if(!file) return;
    setErro(""); setLoading(true);
    try {
      const name = file.name.toLowerCase();
      if(name.endsWith(".png")||name.endsWith(".jpg")||name.endsWith(".jpeg")||name.endsWith(".webp")) {
        setLoadMsg("📸 Claude está lendo o print...");
        const b64 = await new Promise(res=>{const r=new FileReader();r.onload=ev=>res(ev.target.result.split(",")[1]);r.readAsDataURL(file);});
        const mt = name.endsWith(".png")?"image/png":"image/jpeg";
        const parsed = await extractFromImage(b64, mt);
        applyTxns(parsed);
      } else if(name.endsWith(".pdf")) {
        setLoadMsg("📄 Lendo PDF...");
        setPdfFile(file);
        try {
          const buf = await file.arrayBuffer();
          const text = await extractPDFText(buf, "");
          setLoadMsg("📊 Analisando transações...");
          const parsed = parseTextoBancario(text);
          if(parsed.length===0) throw new Error("Não encontrei transações. Tente CSV ou OFX.");
          applyTxns(parsed);
        } catch(err) {
          if(err.name==="PasswordException"||err.message?.includes("password")||err.message?.includes("Password")) {
            setPedeSenha(true); setLoading(false); return;
          }
          throw err;
        }
      } else if(name.endsWith(".ofx")||name.endsWith(".txt")) {
        const text = await file.text();
        const parsed = parseOFX(text);
        if(parsed.length===0){setErro("Arquivo OFX sem transações.");setLoading(false);return;}
        applyTxns(parsed);
      } else {
        const text = await file.text();
        const parsed = parseCSV(text);
        if(parsed.length===0){setErro("Não foi possível ler o CSV. Tente OFX ou print.");setLoading(false);return;}
        applyTxns(parsed);
      }
    } catch(err) {
      if(err.message==="SEM_CHAVE") setErro("Salve sua chave Gemini gratuita acima para importar prints.");
      else setErro("Erro: "+err.message);
    }
    setLoading(false);
  };

  const handleSenha = async () => {
    if(!pdfFile||!pdfSenha) return;
    setLoading(true); setLoadMsg("🔓 Desbloqueando PDF...");
    try {
      const buf = await pdfFile.arrayBuffer();
      const text = await extractPDFText(buf, pdfSenha);
      setLoadMsg("📊 Analisando transações...");
      const parsed = parseTextoBancario(text);
      if(parsed.length===0) throw new Error("Não encontrei transações. Tente CSV ou OFX.");
      const parsed2 = parsed;
      setPedeSenha(false);
      applyTxns(parsed2||parsed);
    } catch(err) {
      if(err.name==="PasswordException"||err.message?.includes("password")) setErro("Senha incorreta. Tente novamente.");
      else setErro("Erro ao ler PDF: "+err.message);
    }
    setLoading(false);
  };

  const toggleAll = sel => setTxns(txns.map(t=>({...t,selected:sel})));
  const total    = txns.filter(t=>t.selected).length;
  const totalEnt = txns.filter(t=>t.selected&&t.tipo==="entrada").reduce((s,t)=>s+t.valor,0);
  const totalSai = txns.filter(t=>t.selected&&t.tipo==="saida").reduce((s,t)=>s+t.valor,0);

  const confirmar = () => {
    const selecionados = txns.filter(t=>t.selected).map(t=>({
      id:Date.now()+Math.random(), tipo:t.tipo, descricao:t.desc, valor:t.valor, categoria:t.categoria, data:t.data||today(),
    }));
    onImport(selecionados); reset(); onClose();
  };

  if(!open) return null;

  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",backdropFilter:"blur(8px)",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#F5F0E8",borderRadius:"24px 24px 0 0",width:"100%",maxWidth:520,padding:"28px 22px 40px",maxHeight:"92vh",overflowY:"auto",boxShadow:"0 -12px 60px rgba(0,0,0,.2)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div style={{fontSize:16,fontWeight:700,color:"#1A1209"}}>📥 Importar Extrato</div>
          <button onClick={()=>{reset();onClose();}} style={{background:"rgba(0,0,0,0.07)",border:"1px solid rgba(0,0,0,0.12)",color:"#5A4A3A",borderRadius:10,width:32,height:32,cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>

        {step===1&&!loading&&!pedeSenha&&(
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {/* Tipo de importação */}
            <div style={{display:"flex",background:"#EDE8E0",borderRadius:12,padding:3}}>
              {[["arquivo","📄 Arquivo"],["foto","📸 Print/Foto"]].map(([v,l])=>(
                <button key={v} onClick={()=>setModo(v)} style={{flex:1,background:modo===v?"#E8205F":"transparent",color:modo===v?"#fff":"#5A4A3A",border:"none",borderRadius:10,padding:"9px",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",transition:"all .15s"}}>{l}</button>
              ))}
            </div>

            {modo==="arquivo"&&(
              <>
                <div style={{fontSize:13,color:"#5A4A3A",fontFamily:"'DM Sans',sans-serif",lineHeight:1.5}}>
                  Aceita <strong>PDF</strong> (com ou sem senha), <strong>OFX</strong> e <strong>CSV</strong> do C6 Bank e Itaú.
                </div>
                <label style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10,background:"rgba(232,32,95,0.06)",border:"2px dashed rgba(232,32,95,0.3)",borderRadius:16,padding:"28px 20px",cursor:"pointer"}}>
                  <span style={{fontSize:36}}>📂</span>
                  <span style={{fontSize:13,fontWeight:600,color:"#E8205F",fontFamily:"'DM Sans',sans-serif"}}>Clique para selecionar arquivo</span>
                  <span style={{fontSize:11,color:"#5A4A3A",fontFamily:"'DM Sans',sans-serif"}}>PDF · OFX · CSV</span>
                  <input type="file" accept=".pdf,.ofx,.csv,.txt" onChange={handleFile} style={{display:"none"}}/>
                </label>
              </>
            )}

            {modo==="foto"&&(
              <>
                <div style={{fontSize:13,color:"#5A4A3A",fontFamily:"'DM Sans',sans-serif",lineHeight:1.5}}>
                  Tire um <strong>print do app</strong> do C6 ou Itaú. O Claude AI extrai todas as transações automaticamente. 🤖
                </div>
                {!localStorage.getItem("velara_gemini_key")&&(
                  <div style={{background:"rgba(212,168,67,0.15)",border:"1px solid rgba(212,168,67,0.4)",borderRadius:12,padding:"12px 14px"}}>
                    <div style={{fontSize:12,fontWeight:700,color:"#8B6000",fontFamily:"'DM Sans',sans-serif",marginBottom:4}}>🔑 Chave Gemini (gratuita)</div>
                    <div style={{fontSize:11,color:"#5A4A3A",fontFamily:"'DM Sans',sans-serif",marginBottom:8}}>Acesse <strong>aistudio.google.com</strong> → Get API Key → criar chave gratuita (sem cartão).</div>
                    <div style={{display:"flex",gap:6}}>
                      <input id="gemini_key_input" placeholder="AIza..." style={{flex:1,background:"#F5F0E8",border:"1.5px solid #DDD5C8",borderRadius:8,padding:"8px 10px",fontSize:12,color:"#1A1209",outline:"none",fontFamily:"inherit"}}/>
                      <button onClick={()=>{const v=document.getElementById("gemini_key_input").value;if(v.length>10){localStorage.setItem("velara_gemini_key",v);setErro("");}}} style={{background:"#E8205F",border:"none",borderRadius:8,padding:"8px 12px",fontSize:12,fontWeight:700,color:"#fff",cursor:"pointer",fontFamily:"inherit"}}>Salvar</button>
                    </div>
                  </div>
                )}
                <label style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10,background:"rgba(91,163,212,0.08)",border:"2px dashed rgba(91,163,212,0.4)",borderRadius:16,padding:"28px 20px",cursor:"pointer"}}>
                  <span style={{fontSize:36}}>📸</span>
                  <span style={{fontSize:13,fontWeight:600,color:"#5BA3D4",fontFamily:"'DM Sans',sans-serif"}}>Clique para enviar print ou foto</span>
                  <span style={{fontSize:11,color:"#5A4A3A",fontFamily:"'DM Sans',sans-serif"}}>PNG · JPG — qualquer banco</span>
                  <input type="file" accept=".png,.jpg,.jpeg,.webp" onChange={handleFile} style={{display:"none"}}/>
                </label>
                {localStorage.getItem("velara_gemini_key")&&(
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"rgba(45,90,16,0.08)",border:"1px solid rgba(45,90,16,0.2)",borderRadius:10,padding:"8px 12px"}}>
                    <span style={{fontSize:11,color:"#2D5A10",fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>✅ Chave Gemini salva</span>
                    <button onClick={()=>{localStorage.removeItem("velara_gemini_key");setErro("");}} style={{background:"none",border:"none",color:"#E8205F",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Trocar chave</button>
                  </div>
                )}
                
              </>
            )}

            {erro&&<div style={{background:"rgba(224,82,82,0.1)",border:"1px solid rgba(224,82,82,0.3)",borderRadius:10,padding:"10px 14px",fontSize:13,color:"#C0392B",fontFamily:"'DM Sans',sans-serif"}}>⚠ {erro}</div>}
          </div>
        )}

        {loading&&(
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 20px",gap:16}}>
            <div style={{fontSize:40,animation:"spin 1s linear infinite"}}>⏳</div>
            <div style={{fontSize:14,fontWeight:600,color:"#1A1209",fontFamily:"'DM Sans',sans-serif",textAlign:"center"}}>{loadMsg}</div>
            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {pedeSenha&&!loading&&(
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={{textAlign:"center",padding:"16px 0"}}>
              <div style={{fontSize:40,marginBottom:10}}>🔒</div>
              <div style={{fontSize:15,fontWeight:700,color:"#1A1209",fontFamily:"'DM Sans',sans-serif",marginBottom:6}}>PDF protegido por senha</div>
              <div style={{fontSize:13,color:"#5A4A3A",fontFamily:"'DM Sans',sans-serif"}}>Digite a senha para desbloquear o extrato</div>
            </div>
            <input type="password" placeholder="Senha do PDF" value={pdfSenha} onChange={e=>setPdfSenha(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&handleSenha()}
              autoFocus
              style={{background:"#F5F0E8",border:"1.5px solid #DDD5C8",borderRadius:10,padding:"12px 14px",fontSize:14,color:"#1A1209",outline:"none",width:"100%",fontFamily:"inherit"}}/>
            {erro&&<div style={{background:"rgba(224,82,82,0.1)",border:"1px solid rgba(224,82,82,0.3)",borderRadius:10,padding:"10px 14px",fontSize:13,color:"#C0392B",fontFamily:"'DM Sans',sans-serif"}}>⚠ {erro}</div>}
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>{setPedeSenha(false);setErro("");}} style={{flex:1,background:"rgba(0,0,0,0.06)",border:"1px solid rgba(0,0,0,0.12)",borderRadius:12,padding:"12px",fontSize:14,fontWeight:600,color:"#5A4A3A",cursor:"pointer",fontFamily:"inherit"}}>Cancelar</button>
              <button onClick={handleSenha} style={{flex:2,background:"#E8205F",border:"none",borderRadius:12,padding:"12px",fontSize:14,fontWeight:700,color:"#fff",cursor:"pointer",fontFamily:"inherit"}}>🔓 Desbloquear</button>
            </div>
          </div>
        )}

        {step===2&&(
          <div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
              {[[`${total} transações`,"selecionadas","#1A1209"],[`+ ${R(totalEnt)}`,"entradas","#2D5A10"],[`- ${R(totalSai)}`,"saídas","#8B1A1A"]].map(([v,l,c])=>(
                <div key={l} style={{background:"rgba(0,0,0,0.05)",borderRadius:12,padding:"10px",textAlign:"center"}}>
                  <div style={{fontSize:12,fontWeight:700,color:c,fontFamily:"'DM Sans',sans-serif"}}>{v}</div>
                  <div style={{fontSize:9,color:"#5A4A3A",fontFamily:"'DM Sans',sans-serif"}}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:6,marginBottom:10}}>
              <button onClick={()=>toggleAll(true)} style={{flex:1,background:"rgba(45,90,16,0.1)",border:"1px solid rgba(45,90,16,0.25)",borderRadius:8,padding:"6px",fontSize:11,fontWeight:700,color:"#2D5A10",cursor:"pointer",fontFamily:"inherit"}}>Selecionar tudo</button>
              <button onClick={()=>toggleAll(false)} style={{flex:1,background:"rgba(0,0,0,0.06)",border:"1px solid rgba(0,0,0,0.12)",borderRadius:8,padding:"6px",fontSize:11,fontWeight:700,color:"#5A4A3A",cursor:"pointer",fontFamily:"inherit"}}>Desmarcar tudo</button>
              <button onClick={reset} style={{background:"rgba(0,0,0,0.06)",border:"1px solid rgba(0,0,0,0.12)",borderRadius:8,padding:"6px 10px",fontSize:11,color:"#5A4A3A",cursor:"pointer",fontFamily:"inherit"}}>← Voltar</button>
            </div>
            <div style={{maxHeight:340,overflowY:"auto",display:"flex",flexDirection:"column",gap:6,marginBottom:14}}>
              {txns.map((t,i)=>(
                <div key={t.id} style={{background:t.selected?"rgba(255,255,255,0.9)":"rgba(0,0,0,0.04)",border:`1px solid ${t.selected?"rgba(0,0,0,0.1)":"rgba(0,0,0,0.06)"}`,borderRadius:12,padding:"10px 12px",opacity:t.selected?1:0.5}}>
                  <div style={{display:"flex",alignItems:"flex-start",gap:8}}>
                    <input type="checkbox" checked={t.selected} onChange={()=>setTxns(txns.map((x,j)=>j===i?{...x,selected:!x.selected}:x))} style={{marginTop:2,cursor:"pointer",accentColor:"#E8205F"}}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                        <span style={{fontSize:12,fontWeight:600,color:"#1A1209",fontFamily:"'DM Sans',sans-serif",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"60%"}}>{t.desc}</span>
                        <span style={{fontSize:12,fontWeight:700,color:t.tipo==="entrada"?"#2D5A10":"#8B1A1A",fontFamily:"'DM Sans',sans-serif",flexShrink:0}}>{t.tipo==="entrada"?"+":"-"}{R(t.valor)}</span>
                      </div>
                      <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
                        <span style={{fontSize:10,color:"#5A4A3A",fontFamily:"'DM Sans',sans-serif"}}>{t.data||"—"}</span>
                        <select value={t.tipo} onChange={e=>setTxns(txns.map((x,j)=>j===i?{...x,tipo:e.target.value}:x))}
                          style={{fontSize:10,border:"1px solid rgba(0,0,0,0.12)",borderRadius:6,padding:"1px 4px",background:"transparent",color:t.tipo==="entrada"?"#2D5A10":t.tipo==="transferencia"?"#5BA3D4":"#8B1A1A",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                          <option value="entrada">↑ Entrada</option>
                          <option value="saida">↓ Saída</option>
                          <option value="transferencia">🔄 Transfer.</option>
                        </select>
                        <select value={t.categoria} onChange={e=>setTxns(txns.map((x,j)=>j===i?{...x,categoria:e.target.value}:x))}
                          style={{fontSize:10,border:"1px solid rgba(0,0,0,0.12)",borderRadius:6,padding:"1px 4px",background:"transparent",color:"#1A1209",cursor:"pointer",fontFamily:"inherit",flex:1,minWidth:0}}>
                          <optgroup label="Despesas">{CATS_DESP.map(c=><option key={c} value={c}>{c}</option>)}</optgroup>
                          <optgroup label="Receitas">{CATS_REC.map(c=><option key={c} value={c}>{c}</option>)}</optgroup>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={confirmar} disabled={total===0} style={{width:"100%",background:total===0?"rgba(0,0,0,0.1)":"#E8205F",border:"none",borderRadius:14,padding:"14px",fontSize:14,fontWeight:700,color:"#fff",cursor:total===0?"default":"pointer",fontFamily:"inherit"}}>
              ✓ Importar {total} transação{total!==1?"ões":""}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


// ── Bloco de Notas (papel com clipe) ──────────────────────────────────────────
function NotepadWidget({value, onChange}) {
  return (
    <div style={{position:"relative",width:150,flexShrink:0}}>
      <div style={{position:"absolute",top:8,left:14,width:126,height:96,background:"#A31621",transform:"rotate(-5deg)",borderRadius:3,boxShadow:"0 5px 14px rgba(0,0,0,0.22)"}}/>
      <div style={{position:"relative",background:"linear-gradient(135deg,#EFE8DC,#E6DDCE)",borderRadius:"2px 2px 5px 5px",transform:"rotate(3deg)",boxShadow:"0 6px 16px rgba(0,0,0,0.2)",padding:"14px 9px 8px",minHeight:100}}>
        <div style={{position:"absolute",top:-9,right:16,width:11,height:15,border:"2px solid #8a8580",borderRadius:"50% 50% 0 0",borderBottom:"none",background:"transparent",zIndex:2}}/>
        <div style={{position:"absolute",top:-6,right:10,width:24,height:13,background:"linear-gradient(135deg,#C4202E,#8E1620)",borderRadius:2,boxShadow:"0 2px 5px rgba(0,0,0,0.35)",zIndex:3}}/>
        <textarea
          value={value}
          onChange={e=>onChange(e.target.value)}
          placeholder="Notas rápidas..."
          style={{width:"100%",minHeight:82,background:"transparent",border:"none",outline:"none",resize:"none",fontFamily:"'DM Sans',sans-serif",fontSize:10.5,lineHeight:1.5,color:"#3A2F22"}}
        />
      </div>
    </div>
  );
}

// ── Login Screen ─────────────────────────────────────────────────────────────
function LoginScreen({onLogin}) {
  const [mode, setMode]       = useState("login"); // login | signup
  const [email, setEmail]     = useState("");
  const [password, setPass]   = useState("");
  const [name, setName]       = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(""); setLoading(true);
    if (!email || !password) { setError("Preencha e-mail e senha."); setLoading(false); return; }
    try {
      if (mode === "signup") {
        if (INVITED_EMAILS.length > 0 && !INVITED_EMAILS.includes(email.toLowerCase())) {
          setError("Este e-mail não está na lista de convidados."); setLoading(false); return;
        }
        const r = await supaAuth.signUp(email, password, name);
        if (r.error) { setError(r.error.message||r.error_description||"Erro ao criar conta."); setLoading(false); return; }
        setError("Conta criada! Faça login agora."); setMode("login"); setLoading(false); return;
      }
      const r = await supaAuth.signIn(email, password);
      const token = r.access_token;
      if (!token) {
        const msg = r.error_description || r.msg || r.error?.message || (typeof r.error==="string"?r.error:null) || r.message || "";
        if(/confirm/i.test(msg)) setError("Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.");
        else if(/invalid/i.test(msg)) setError("E-mail ou senha incorretos.");
        else setError(msg ? "Erro: "+msg : "Erro ao conectar. Tente novamente.");
        setLoading(false); return;
      }
      // Usar o e-mail como identificador (compatível com dados já salvos)
      const userId = email;
      const userName = r.user?.user_metadata?.name || email.split("@")[0];
      localStorage.setItem("velara_token", token);
      localStorage.setItem("velara_user_id", userId);
      localStorage.setItem("velara_user_name", userName);
      onLogin({token, id: userId || email, name: userName, email});
      setLoading(false);
    } catch(err) {
      setError("Erro de conexão: "+(err.message||"tente novamente")); setLoading(false);
    }
  };

  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Cormorant Garamond','Georgia',serif",position:"relative"}}>
      <div className="wallpaper-bg"/>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        input,button{font-family:'DM Sans',sans-serif}
        body,#root{background:#C4A96A;min-height:100vh}
        .wallpaper-bg{position:fixed;inset:0;z-index:0;pointer-events:none;background-color:#C4A96A;background-image:repeating-linear-gradient(0deg,transparent 0px,transparent 18px,rgba(80,72,20,0.55) 18px,rgba(80,72,20,0.55) 26px,transparent 26px,transparent 44px,rgba(80,72,20,0.55) 44px,rgba(80,72,20,0.55) 52px,transparent 52px,transparent 68px,rgba(100,20,20,0.5) 68px,rgba(100,20,20,0.5) 72px,transparent 72px,transparent 88px,rgba(80,72,20,0.55) 88px,rgba(80,72,20,0.55) 96px,transparent 96px,transparent 114px,rgba(80,72,20,0.55) 114px,rgba(80,72,20,0.55) 122px,transparent 122px,transparent 138px,rgba(100,20,20,0.5) 138px,rgba(100,20,20,0.5) 142px,transparent 142px,transparent 160px),repeating-linear-gradient(90deg,transparent 0px,transparent 18px,rgba(80,72,20,0.55) 18px,rgba(80,72,20,0.55) 26px,transparent 26px,transparent 44px,rgba(80,72,20,0.55) 44px,rgba(80,72,20,0.55) 52px,transparent 52px,transparent 68px,rgba(100,20,20,0.5) 68px,rgba(100,20,20,0.5) 72px,transparent 72px,transparent 88px,rgba(80,72,20,0.55) 88px,rgba(80,72,20,0.55) 96px,transparent 96px,transparent 114px,rgba(80,72,20,0.55) 114px,rgba(80,72,20,0.55) 122px,transparent 122px,transparent 138px,rgba(100,20,20,0.5) 138px,rgba(100,20,20,0.5) 142px,transparent 142px,transparent 160px);background-size:160px 160px}
        input::placeholder{color:rgba(26,18,9,0.4)}
      `}</style>
      <div style={{background:"rgba(255,255,255,0.88)",backdropFilter:"blur(24px)",borderRadius:24,padding:"36px 32px",width:"100%",maxWidth:380,margin:16,boxShadow:"0 8px 40px rgba(0,0,0,0.15)",position:"relative",zIndex:1}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:".2em",textTransform:"uppercase",color:"rgba(26,18,9,0.4)",fontFamily:"'DM Sans',sans-serif",marginBottom:6}}>Velara Finance</div>
          <div style={{fontSize:28,fontWeight:300,letterSpacing:"-.02em",color:"#1A1209"}}>{mode==="login"?"Bem-vinda":"Criar conta"}</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {mode==="signup"&&(
            <input placeholder="Seu nome" value={name} onChange={e=>setName(e.target.value)}
              style={{background:"#F5F0E8",border:"1.5px solid #DDD5C8",borderRadius:10,padding:"12px 14px",fontSize:14,color:"#1A1209",outline:"none",width:"100%"}}/>
          )}
          <input placeholder="E-mail" type="email" value={email} onChange={e=>setEmail(e.target.value)}
            style={{background:"#F5F0E8",border:"1.5px solid #DDD5C8",borderRadius:10,padding:"12px 14px",fontSize:14,color:"#1A1209",outline:"none",width:"100%"}}/>
          <input placeholder="Senha" type="password" value={password} onChange={e=>setPass(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&submit()}
            style={{background:"#F5F0E8",border:"1.5px solid #DDD5C8",borderRadius:10,padding:"12px 14px",fontSize:14,color:"#1A1209",outline:"none",width:"100%"}}/>
          {error&&<div style={{fontSize:12,color:error.includes("criada")?"#2D6E20":"#C0392B",fontFamily:"'DM Sans',sans-serif",textAlign:"center"}}>{error}</div>}
          <button onClick={submit} disabled={loading}
            style={{background:"#E8205F",color:"#fff",border:"none",borderRadius:12,padding:"13px",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",marginTop:4,opacity:loading?0.7:1}}>
            {loading?"Aguarde...":(mode==="login"?"Entrar":"Criar conta")}
          </button>
          <div style={{textAlign:"center",fontSize:12,color:"rgba(26,18,9,0.55)",fontFamily:"'DM Sans',sans-serif"}}>
            {mode==="login"?"Não tem conta?":"Já tem conta?"}{" "}
            <button onClick={()=>{setMode(mode==="login"?"signup":"login");setError("");}}
              style={{background:"none",border:"none",color:"#E8205F",fontWeight:700,cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>
              {mode==="login"?"Cadastrar":"Fazer login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props){super(props);this.state={hasError:false,error:null};}
  static getDerivedStateFromError(error){return{hasError:true,error};}
  componentDidCatch(error,info){console.error("Erro capturado:",error,info);}
  render(){
    if(this.state.hasError){
      return (
        <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"#F5F0E8",padding:24,fontFamily:"'DM Sans',sans-serif",textAlign:"center"}}>
          <div style={{fontSize:40,marginBottom:16}}>⚠️</div>
          <div style={{fontSize:18,fontWeight:700,color:"#1A1209",marginBottom:10}}>Algo deu errado</div>
          <div style={{fontSize:13,color:"#5A4A3A",marginBottom:20,maxWidth:400,wordBreak:"break-word"}}>{String(this.state.error?.message||this.state.error||"Erro desconhecido")}</div>
          <button onClick={()=>{localStorage.clear();window.location.reload();}}
            style={{background:"#E8205F",color:"#fff",border:"none",borderRadius:12,padding:"12px 24px",fontSize:14,fontWeight:700,cursor:"pointer"}}>
            🔄 Limpar dados e recarregar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("velara_token");
    const id    = localStorage.getItem("velara_user_id");
    const name  = localStorage.getItem("velara_user_name");
    const email = localStorage.getItem("velara_user_email");
    console.log("Stored user id:", id);
    return token && id && id !== "undefined" && id !== "null" ? {token, id, name, email} : null;
  });

  if (!user) return <LoginScreen onLogin={u=>{localStorage.setItem("velara_user_email",u.email);setUser(u);}}/>;

  return (
    <ErrorBoundary>
      <AppMain user={user} onLogout={()=>{supaAuth.signOut(user.token);localStorage.removeItem("velara_token");localStorage.removeItem("velara_user_id");localStorage.removeItem("velara_user_name");localStorage.removeItem("velara_user_email");setUser(null);}}/>
    </ErrorBoundary>
  );
}

function AppMain({user, onLogout}) {
  const userId = user.id;
  const [bgId,      setBgId]      = useLS("v4_bg",     "tartan", userId);
  const [cats,      setCats]      = useLS("v4_cats",   DEFAULT_CATS, userId);
  const [orcamento, setOrcamento] = useLS("v4_orc",    {}, userId);
  const [movs,      setMovs]      = useLS("v4_movs",   [], userId);
  const [empresas,  setEmpresas]  = useLS("v4_emp",    [], userId);
  const [plantoes,  setPlantoes]  = useLS("v4_plt",    [], userId);
  const [invests,   setInvests]   = useLS("v4_inv",    [], userId);
  const [objetivos, setObjetivos] = useLS("v4_obj",    [], userId);
  const [dividas,   setDividas]   = useLS("v4_div",    [], userId);
  const [cartoes,   setCartoes]   = useLS("v4_cart",   [], userId);
  const [ccMovs,    setCCMovs]    = useLS("v4_ccm",    [], userId);
  const [regras,    setRegras]    = useLS("v4_regras", [], userId);
  const [alocacoes, setAlocacoes] = useLS("v4_aloc",   [], userId);
  const [saldoIni,  setSaldoIni]  = useLS("v4_saldo_ini2", {valor:"0", data:today().slice(0,7)}, userId);

  const [tab,setTab]=useState("dashboard");
  const [modal,setModal]=useState(null);
  const [edit,setEdit]=useState(null);
  const [extra,setExtra]=useState(null);
  const [selMes,setSelMes]=useState(today().slice(0,7));
  const [sideOpen,setSideOpen]=useState(false);
  const [cdiAtual,setCdiAtual]=useState(()=>{try{return JSON.parse(localStorage.getItem("velara_cdi")||"null")?.valor||null;}catch{return null;}});
  useEffect(()=>{fetchCDI().then(v=>{if(v)setCdiAtual(v);});},[]);
  const [alocExpanded,setAlocExpanded]=useState(false);
  const [importOpen,setImportOpen]=useState(false);
  const [notas,setNotas]=useLS("v4_notas","",userId);
  const [pltDist,setPltDist]=useState(null);
  const [movDist,setMovDist]=useState(null);

  const [fMov,setFMov]=useState({tipo:"saida",descricao:"",valor:"",categoria:CATS_OUT[0],data:today()});
  const [fEmp,setFEmp]=useState({nome:"",contato:"",prazo:"30",cor:"#E8205F"});
  const [fPlt,setFPlt]=useState({empresa:"",data:"",horas:"",valorH:"",valorTotal:"",prazo:"30",previsao:"",status:"pendente",obs:""});
  const [fInv,setFInv]=useState({nome:"",tipo:"CDB",banco:"",aporte:"",taxa:"",taxaModo:"fixo",percCDI:"",data:today(),obs:""});
  const [fObj,setFObj]=useState({nome:"",meta:"",atual:"0",prazo:"",cor:C.green,obs:"",investId:""});
  const [fDiv,setFDiv]=useState({credor:"",total:"",pago:"0",prazo:"",parcelas:"",obs:""});
  const [fCart,setFCart]=useState({nome:"",bandeira:"",limite:"",fechamento:"",vencimento:""});
  const [fCCMov,setFCCMov]=useState({cartao:"",descricao:"",valor:"",categoria:CATS_OUT[0],data:today()});
  const [fAporte,setFAporte]=useState({valor:"",data:today()});
  const [fPgto,setFPgto]=useState({valor:"",data:today()});

  useEffect(()=>{const h=parseFloat(fPlt.horas),v=parseFloat(fPlt.valorH);if(h&&v)setFPlt(f=>({...f,valorTotal:(h*v).toFixed(2)}));},[fPlt.horas,fPlt.valorH]);
  useEffect(()=>{if(fPlt.data&&fPlt.prazo)setFPlt(f=>({...f,previsao:addDays(f.data,parseInt(f.prazo)||30)}));},[fPlt.data,fPlt.prazo]);

  const openM=(m,item=null,ex=null)=>{
    setEdit(item);setExtra(ex);setModal(m);
    if(m==="mov")   setFMov(item?{...item}:{tipo:"saida",descricao:"",valor:"",categoria:CATS_OUT[0],data:today()});
    if(m==="emp")   setFEmp(item?{...item}:{nome:"",contato:"",prazo:"30",cor:"#E8205F"});
    if(m==="plt")   setFPlt(item?{...item}:{empresa:"",data:"",horas:"",valorH:"",valorTotal:"",prazo:"30",previsao:"",status:"pendente",obs:""});
    if(m==="inv")   setFInv(item?{...item,taxaModo:item.taxaModo||"fixo"}:{nome:"",tipo:"CDB",banco:"",aporte:"",taxa:"",taxaModo:"fixo",percCDI:"",data:today(),obs:""});
    if(m==="obj")   setFObj(item?{...item}:{nome:"",meta:"",atual:"0",prazo:"",cor:C.green,obs:"",investId:""});
    if(m==="div")   setFDiv(item?{...item}:{credor:"",total:"",pago:"0",prazo:"",parcelas:"",obs:""});
    if(m==="cart")  setFCart(item?{...item}:{nome:"",bandeira:"",limite:"",fechamento:"",vencimento:""});
    if(m==="ccmov") setFCCMov(item?{...item}:{cartao:ex||"",descricao:"",valor:"",categoria:CATS_OUT[0],data:today()});
    if(m==="aporte"||m==="pgto"){setFAporte({valor:"",data:today()});setFPgto({valor:"",data:today()});}
  };
  const closeM=()=>{setModal(null);setEdit(null);setExtra(null);};
  const upsert=(list,setList,item)=>{if(edit)setList(list.map(i=>i.id===edit.id?{...item,id:edit.id}:i));else setList([{...item,id:uid()},...list]);closeM();};
  const remove=(list,setList,id)=>setList(list.filter(i=>i.id!==id));

  const importarMovs=items=>{setMovs([...items,...movs]);};
  const saveMov=()=>{if(!fMov.descricao||!fMov.valor)return;upsert(movs,setMovs,{...fMov,valor:+String(fMov.valor).replace(",",".")});};
  const saveEmp=()=>{if(!fEmp.nome)return;upsert(empresas,setEmpresas,fEmp);};
  const savePlt=()=>{if(!fPlt.empresa||!fPlt.data||!fPlt.valorTotal)return;upsert(plantoes,setPlantoes,{...fPlt,valorTotal:+fPlt.valorTotal});};
  const saveInv=()=>{
    if(!fInv.nome||!fInv.aporte)return;
    upsert(invests,setInvests,{...fInv,aporte:+String(fInv.aporte).replace(",","."),percCDI:fInv.taxaModo==="cdi"?+String(fInv.percCDI||0).replace(",","."):"",taxa:fInv.taxaModo==="fixo"?fInv.taxa:""});
  };
  const taxaEfetiva=inv=>inv.taxaModo==="cdi"&&inv.percCDI?(cdiAtual?cdiAtual*(+inv.percCDI)/100:0):(parseFloat(inv.taxa)||0);
  const saveObj=()=>{if(!fObj.nome||!fObj.meta)return;upsert(objetivos,setObjetivos,{...fObj,meta:+String(fObj.meta).replace(",","."),atual:+String(fObj.atual||0).replace(",",".")});};
  const saveDiv=()=>{if(!fDiv.credor||!fDiv.total)return;upsert(dividas,setDividas,{...fDiv,tipo:fDiv.tipo||"ativa",total:+String(fDiv.total).replace(",","."),pago:+String(fDiv.pago||0).replace(",",".")});};
  const saveCart=()=>{if(!fCart.nome||!fCart.limite)return;upsert(cartoes,setCartoes,{...fCart,limite:+String(fCart.limite).replace(",",".")});};
  const saveCCMov=()=>{if(!fCCMov.descricao||!fCCMov.valor||!fCCMov.cartao)return;upsert(ccMovs,setCCMovs,{...fCCMov,valor:+String(fCCMov.valor).replace(",",".")});};
  const saveAporte=()=>{
    if(!fAporte.valor||!extra)return;
    const v=+String(fAporte.valor).replace(",",".");
    const obj=objetivos.find(o=>o.id===extra);
    setObjetivos(objetivos.map(o=>o.id===extra?{...o,atual:+o.atual+v}:o));
    if(obj?.investId) setInvests(invests.map(i=>i.id===obj.investId?{...i,aporte:i.aporte+v}:i));
    closeM();
  };
  const savePgto=()=>{if(!fPgto.valor||!extra)return;const v=+String(fPgto.valor).replace(",",".");setDividas(dividas.map(d=>d.id===extra?{...d,pago:Math.min(+d.pago+v,+d.total)}:d));closeM();};

  const getPltStatus=p=>{if(p.status==="recebido")return"recebido";if(p.status==="cancelado")return"cancelado";if(isPast(p.previsao))return"atrasado";return"pendente";};

  const marcarRecebido=id=>{
    const p=plantoes.find(x=>x.id===id); if(!p)return;
    if(regras.length>0){setPltDist(p);}
    else{
      setPlantoes(plantoes.map(x=>x.id===id?{...x,status:"recebido",dataRecebimento:today()}:x));
      setMovs([{id:uid(),tipo:"entrada",descricao:`Plantão - ${p.empresa}`,valor:p.valorTotal,categoria:"🏥 Plantão",data:today()},...movs]);
    }
  };

  const confirmarDistribuicao=(p,alocs,isMov=false)=>{
    if(!isMov){
      setPlantoes(plantoes.map(x=>x.id===p.id?{...x,status:"recebido",dataRecebimento:today()}:x));
      setMovs([{id:uid(),tipo:"entrada",descricao:`Plantão - ${p.empresa}`,valor:p.valorTotal,categoria:"🏥 Plantão",data:today()},...movs]);
    }
    let nInv=[...invests],nObj=[...objetivos],nDiv=[...dividas];
    const reg={id:uid(),plantaoId:p.id,data:today(),empresa:p.empresa,totalRecebido:p.valorTotal,itens:[]};
    alocs.forEach(a=>{
      const val=parseFloat(a.valorEdit||0); if(val<=0)return;
      const inv=a.tipo==="investimento"?invests.find(x=>x.id===a.destinoId):null;
      const getNome=()=>{if(a.tipo==="investimento"){const i=invests.find(x=>x.id===a.destinoId);return i?`${i.nome}${i.banco?" · "+i.banco:""}`:a.destinoNome||"—";}if(a.tipo==="objetivo")return objetivos.find(x=>x.id===a.destinoId)?.nome||a.destinoNome||"—";if(a.tipo==="divida"||a.tipo==="fundo_divida")return dividas.find(x=>x.id===a.destinoId)?.credor||a.destinoNome||"—";return"Livre";};
      reg.itens.push({tipo:a.tipo,destinoId:a.destinoId,destinoNome:a.tipo==="livre"?"Livre":getNome(),banco:inv?.banco||"",valor:val});
      if(a.tipo==="investimento"&&a.destinoId)nInv=nInv.map(i=>i.id===a.destinoId?{...i,aporte:i.aporte+val}:i);
      if(a.tipo==="objetivo"&&a.destinoId){
        nObj=nObj.map(o=>o.id===a.destinoId?{...o,atual:+o.atual+val}:o);
        const objVinc=objetivos.find(o=>o.id===a.destinoId);
        if(objVinc?.investId) nInv=nInv.map(i=>i.id===objVinc.investId?{...i,aporte:i.aporte+val}:i);
      }
      if((a.tipo==="divida"||a.tipo==="fundo_divida")&&a.destinoId){
        nDiv=nDiv.map(d=>d.id===a.destinoId?{...d,pago:Math.min(+d.pago+val,+d.total)}:d);
        const divVinc=dividas.find(d=>d.id===a.destinoId);
        if(a.tipo==="fundo_divida"&&divVinc?.investId) nInv=nInv.map(i=>i.id===divVinc.investId?{...i,aporte:i.aporte+val}:i);
      }
    });
    setInvests(nInv);setObjetivos(nObj);setDividas(nDiv);
    setAlocacoes([reg,...alocacoes]);
    if(!isMov) setPltDist(null);
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  const plantoesEfetivos=useMemo(()=>plantoes.map(p=>({...p,se:getPltStatus(p)})),[plantoes]);
  const movsDoMes=useMemo(()=>movs.filter(m=>monthKey(m.data)===selMes),[movs,selMes]);
  const entradas=movsDoMes.filter(m=>m.tipo==="entrada").reduce((s,m)=>s+m.valor,0);
  const saidas=movsDoMes.filter(m=>m.tipo==="saida").reduce((s,m)=>s+m.valor,0);
  const transferencias=movsDoMes.filter(m=>m.tipo==="transferencia").reduce((s,m)=>s+m.valor,0);
  // Transferências acumuladas até o mês selecionado (total investido)
  const transferenciasAcumuladas=movs
    .filter(m=>m.tipo==="transferencia"&&m.data&&monthKey(m.data)<=selMes)
    .reduce((s,m)=>s+m.valor,0);
  // Saldo mensal puro
  const saldo=entradas-saidas;
  const totalAlocadoMes=alocacoes.filter(a=>monthKey(a.data)===selMes).reduce((s,a)=>s+a.totalRecebido,0);

  // Saldo acumulado: saldo inicial + tudo desde a data inicial até o mês selecionado
  // Se o mês for ANTES da data inicial: mostra só o saldo do mês (sem fantasmas)
  const saldoIniValor=parseFloat(String(saldoIni.valor||0).replace(",","."))||0;
  const saldoIniData=saldoIni.data||today().slice(0,7);
  const saldoAcumulado=selMes>=saldoIniData
    ? saldoIniValor+movs
        .filter(m=>m.data&&monthKey(m.data)>=saldoIniData&&monthKey(m.data)<=selMes&&m.tipo!=="transferencia")
        .reduce((s,m)=>m.tipo==="entrada"?s+m.valor:s-m.valor,0)
    : saldo;
  // Saldo livre = saldo inicial + livre alocado - despesas reais
  const totalLivreAlocado=alocacoes
    .filter(a=>a.data&&monthKey(a.data)>=saldoIniData&&monthKey(a.data)<=selMes)
    .flatMap(a=>a.itens.filter(it=>it.tipo==="livre"))
    .reduce((s,it)=>s+it.valor,0);
  const totalSaidasPeriodo=movs
    .filter(m=>m.tipo==="saida"&&m.data&&monthKey(m.data)>=saldoIniData&&monthKey(m.data)<=selMes)
    .reduce((s,m)=>s+m.valor,0);
  const saldoReal=saldoIniValor+totalLivreAlocado-totalSaidasPeriodo;
  const totalInvestido=invests.reduce((s,i)=>s+i.aporte,0);
  const totalFundoDivida=dividas.filter(d=>d.tipo==="fundo"&&!d.investId).reduce((s,d)=>s+(+d.pago||0),0);
  const totalObjetivos=objetivos.filter(o=>!o.investId).reduce((s,o)=>s+(+o.atual||0),0);
  const totalPatrimonio=totalInvestido+totalFundoDivida+totalObjetivos;
  const totalDividas=dividas.reduce((s,d)=>s+(+d.total-+d.pago),0);
  const totalPendPlant=plantoesEfetivos.filter(p=>["pendente","atrasado"].includes(p.se)).reduce((s,p)=>s+p.valorTotal,0);
  const empNome=n=>empresas.find(e=>e.nome===n)||{nome:n,cor:C.magenta};
  const ccGastosMes=cid=>ccMovs.filter(m=>m.cartao===cid&&monthKey(m.data)===selMes).reduce((s,m)=>s+m.valor,0);

  // Donut gastos
  const donutGastos=useMemo(()=>{
    const byCat={};movsDoMes.filter(m=>m.tipo==="saida"&&m.tipo!=="transferencia").forEach(m=>{byCat[m.categoria]=(byCat[m.categoria]||0)+m.valor;});
    return Object.entries(byCat).sort((a,b)=>b[1]-a[1]).map(([k,v],i)=>({label:k,v,color:CHART_COLORS[i%CHART_COLORS.length]}));
  },[movsDoMes]);
  const totalGastos=donutGastos.reduce((s,d)=>s+d.v,0);

  // Análise empresas — TODOS os plantões (não só do mês)
  const empAnalise=useMemo(()=>{
    const map={};
    plantoes.forEach(p=>{
      const empC=empresas.find(e=>e.nome===p.empresa);
      if(!map[p.empresa])map[p.empresa]={nome:p.empresa,total:0,count:0,atrasos:0,recebido:0,pendente:0,cor:empC?.cor||C.magenta};
      map[p.empresa].total+=p.valorTotal;
      map[p.empresa].count+=1;
      const se=getPltStatus(p);
      if(se==="atrasado")map[p.empresa].atrasos+=1;
      if(se==="recebido")map[p.empresa].recebido+=p.valorTotal;
      if(["pendente","atrasado"].includes(se))map[p.empresa].pendente+=p.valorTotal;
    });
    return Object.values(map).sort((a,b)=>b.total-a.total);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[plantoes,empresas]);

  const maxEmpTotal=empAnalise.length?Math.max(...empAnalise.map(e=>e.total)):1;
  const maxEmpCount=empAnalise.length?Math.max(...empAnalise.map(e=>e.count)):1;
  const maxEmpAtraso=empAnalise.length?Math.max(...empAnalise.map(e=>e.atrasos),1):1;

  // Donut por empresa
  const donutEmpresas=useMemo(()=>empAnalise.map((e,i)=>({label:e.nome,v:e.total,color:e.cor||CHART_COLORS[i%CHART_COLORS.length]})),[empAnalise]);

  // Alocação resumo
  const resumoAloc=useMemo(()=>{const m={investimento:0,objetivo:0,divida:0,livre:0};alocacoes.forEach(a=>a.itens.forEach(it=>{m[it.tipo]=(m[it.tipo]||0)+it.valor;}));return m;},[alocacoes]);

  // Forecast
  const forecast=useMemo(()=>months8().map(ym=>({
    ym,
    entradas:movs.filter(m=>m.tipo==="entrada"&&monthKey(m.data)===ym).reduce((s,m)=>s+m.valor,0)+plantoes.filter(p=>monthKey(p.previsao)===ym).reduce((s,p)=>s+p.valorTotal,0),
    saidas:movs.filter(m=>m.tipo==="saida"&&monthKey(m.data)===ym).reduce((s,m)=>s+m.valor,0)+ccMovs.filter(m=>monthKey(m.data)===ym).reduce((s,m)=>s+m.valor,0),
    rendimentos:invests.reduce((s,i)=>s+(i.aporte*taxaEfetiva(i)/100/12),0),
  })).map(f=>({...f,saldo:f.entradas-f.saidas+f.rendimentos})),[movs,plantoes,invests,ccMovs]);
  const maxFc=Math.max(...forecast.map(f=>Math.max(f.entradas,f.saidas,1)));

  const statusDiv=d=>{if(!d.prazo)return{label:"Em aberto",color:"rgba(26,18,9,0.5)",bg:"rgba(0,0,0,0.06)"};if(isPast(d.prazo)&&d.pago<d.total)return{label:"Atrasada",color:C.red,bg:C.redGlass};if(daysUntil(d.prazo)<=30)return{label:"Vence em breve",color:C.gold,bg:C.goldGlass};return{label:"Em dia",color:C.green,bg:C.greenGlass};};

  const TABS=[
    {id:"dashboard",icon:"◈",label:"Início"},
    {id:"balanco",icon:"◈",label:"Balanço"},
    {id:"orcamento",icon:"◎",label:"Orçamento"},
    {id:"movimentos",icon:"⇅",label:"Movimentos"},
    {id:"plantoes",icon:"✚",label:"Plantões"},
    {id:"analise",icon:"◎",label:"Análise"},
    {id:"investimentos",icon:"◎",label:"Invest."},
    {id:"objetivos",icon:"◉",label:"Objetivos"},
    {id:"dividas",icon:"◷",label:"Dívidas"},
    {id:"cartoes",icon:"▭",label:"Cartões"},
    {id:"previsao",icon:"◈",label:"Previsão"},
    {id:"categorias",icon:"☰",label:"Categorias"},
  ];
  const navTo=id=>{setTab(id);setSideOpen(false);};

  const CARD="card"; // className shorthand
  const TXT="#1A1209";
  const TSUB="rgba(26,18,9,0.65)";
  const TMUT="rgba(26,18,9,0.45)";

  return (
    <div style={{minHeight:"100vh",color:TXT,fontFamily:"'Cormorant Garamond','Georgia',serif",position:"relative"}}>
      <div className="wallpaper-bg" style={bgToStyle(BG_OPTIONS.find(b=>b.id===bgId)||BG_OPTIONS[0])}/>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        input,select,textarea,button{font-family:'DM Sans','Segoe UI',sans-serif}
        .num{font-family:'DM Sans',sans-serif}
        ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.2);border-radius:2px}
        body,#root{background:#C4A96A;min-height:100vh}
        .wallpaper-bg{
  position:fixed;inset:0;z-index:0;pointer-events:none;
  background-color:#C4A96A;
  background-image:
    repeating-linear-gradient(0deg,
      transparent 0px, transparent 18px,
      rgba(80,72,20,0.55) 18px, rgba(80,72,20,0.55) 26px,
      transparent 26px, transparent 44px,
      rgba(80,72,20,0.55) 44px, rgba(80,72,20,0.55) 52px,
      transparent 52px, transparent 68px,
      rgba(100,20,20,0.5) 68px, rgba(100,20,20,0.5) 72px,
      transparent 72px, transparent 88px,
      rgba(80,72,20,0.55) 88px, rgba(80,72,20,0.55) 96px,
      transparent 96px, transparent 114px,
      rgba(80,72,20,0.55) 114px, rgba(80,72,20,0.55) 122px,
      transparent 122px, transparent 138px,
      rgba(100,20,20,0.5) 138px, rgba(100,20,20,0.5) 142px,
      transparent 142px, transparent 160px
    ),
    repeating-linear-gradient(90deg,
      transparent 0px, transparent 18px,
      rgba(80,72,20,0.55) 18px, rgba(80,72,20,0.55) 26px,
      transparent 26px, transparent 44px,
      rgba(80,72,20,0.55) 44px, rgba(80,72,20,0.55) 52px,
      transparent 52px, transparent 68px,
      rgba(100,20,20,0.5) 68px, rgba(100,20,20,0.5) 72px,
      transparent 72px, transparent 88px,
      rgba(80,72,20,0.55) 88px, rgba(80,72,20,0.55) 96px,
      transparent 96px, transparent 114px,
      rgba(80,72,20,0.55) 114px, rgba(80,72,20,0.55) 122px,
      transparent 122px, transparent 138px,
      rgba(100,20,20,0.5) 138px, rgba(100,20,20,0.5) 142px,
      transparent 142px, transparent 160px
    );
  background-size:160px 160px;
}
        .card{background:rgba(255,255,255,0.88);border:1px solid rgba(255,255,255,0.98);border-radius:18px;padding:18px;backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);box-shadow:0 4px 24px rgba(0,0,0,0.12),0 1px 0 rgba(255,255,255,1) inset;color:#1A1209}.card *{color:inherit}.card span,.card div,.card p{color:#1A1209}
        .card *{color:inherit}
        select option{background:#3d1a10;color:#fff}
        .fade{animation:fd .2s ease} @keyframes fd{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}
        .scr::-webkit-scrollbar{display:none}
        .sidebar{position:fixed;top:0;left:0;height:100vh;width:240px;background:rgba(30,15,10,0.94);backdrop-filter:blur(28px) saturate(180%);-webkit-backdrop-filter:blur(28px) saturate(180%);border-right:1px solid rgba(255,255,255,0.15);z-index:100;transform:translateX(-100%);transition:transform .3s cubic-bezier(.4,0,.2,1);box-shadow:4px 0 32px rgba(0,0,0,.3)}
        .sidebar.open{transform:translateX(0)}
        .overlay-side{position:fixed;inset:0;background:rgba(0,0,0,.35);backdrop-filter:blur(2px);z-index:99;display:none}
        .overlay-side.open{display:block}
        .navitem{display:flex;align-items:center;gap:10px;padding:12px 18px;border-radius:10px;cursor:pointer;font-size:14px;font-weight:500;color:rgba(255,255,255,0.7);transition:all .15s;margin:2px 8px;font-family:'DM Sans',sans-serif;letter-spacing:.01em}
        .navitem:hover{background:rgba(255,255,255,0.1);color:#fff}
        .navitem.active{background:rgba(232,32,95,0.4);color:#fff;font-weight:700;border:1px solid rgba(232,32,95,0.5);box-shadow:0 2px 12px rgba(232,32,95,0.2)}
        .navitem .nav-icon{font-size:16px;width:20px;text-align:center}
        input::placeholder{color:rgba(26,18,9,0.4)!important}
        .card button{font-family:'DM Sans',sans-serif}
        /* Force all card content to be dark */
        .card, .card div, .card span, .card p, .card label, .card small { color: #1A1209 !important; }
        /* Exception: colored value numbers keep their accent color via inline style - override below */
        .card svg text { fill: #1A1209 !important; }
      `}</style>

      {/* SIDEBAR */}
      <div className={`overlay-side ${sideOpen?"open":""}`} onClick={()=>setSideOpen(false)}/>
      <div className={`sidebar ${sideOpen?"open":""}`}>
        <div style={{padding:"22px 16px 14px",borderBottom:"1px solid rgba(255,255,255,0.12)"}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:".2em",textTransform:"uppercase",color:"rgba(255,255,255,0.4)",fontFamily:"'DM Sans',sans-serif",marginBottom:4}}>Velara Finance</div>
          <div style={{fontSize:20,fontWeight:300,letterSpacing:"-.02em",color:"#fff"}}>Menu</div>
        </div>
        <div style={{padding:"8px 0",overflowY:"auto",maxHeight:"calc(100vh - 160px)"}}>
          {TABS.map(t=>(
            <div key={t.id} className={`navitem ${tab===t.id?"active":""}`} onClick={()=>navTo(t.id)}>
              <span className="nav-icon">{t.icon}</span>
              <span>{t.label}</span>
            </div>
          ))}
        </div>
        <div style={{padding:"12px 16px",borderTop:"1px solid rgba(255,255,255,0.1)"}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:".07em",textTransform:"uppercase",color:"rgba(255,255,255,0.4)",fontFamily:"'DM Sans',sans-serif",marginBottom:7}}>Fundo</div>
          <div style={{display:"flex",gap:6,marginBottom:12}}>
            {BG_OPTIONS.map(bg=>(
              <button key={bg.id} onClick={()=>setBgId(bg.id)}
                style={{flex:1,background:bgId===bg.id?"rgba(232,32,95,0.5)":"rgba(255,255,255,0.08)",border:`2px solid ${bgId===bg.id?"#E8205F":"rgba(255,255,255,0.15)"}`,borderRadius:10,padding:0,cursor:"pointer",overflow:"hidden",display:"flex",flexDirection:"column",alignItems:"center"}}>
                <div style={{width:"100%",height:36,...bgToStyle(bg)}}/>
                <div style={{fontSize:8,fontWeight:600,color:"#fff",padding:"3px 0"}}>{bg.emoji} {bg.label}</div>
              </button>
            ))}
          </div>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.55)",fontFamily:"'DM Sans',sans-serif",marginBottom:8}}>👤 {user.name||user.email}</div>
          <button onClick={onLogout} style={{background:"rgba(232,32,95,0.3)",border:"1px solid rgba(232,32,95,0.4)",borderRadius:10,color:"#fff",fontSize:12,fontWeight:600,padding:"8px 14px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",width:"100%"}}>Sair</button>
        </div>
      </div>

      {/* TOP BAR */}
      <div style={{background:"rgba(255,255,255,0.78)",backdropFilter:"blur(24px) saturate(180%)",WebkitBackdropFilter:"blur(24px) saturate(180%)",borderBottom:"1px solid rgba(0,0,0,0.08)",padding:"14px 16px 12px",position:"sticky",top:0,zIndex:50,boxShadow:"0 2px 20px rgba(0,0,0,0.1)"}}>
        <div style={{maxWidth:1100,margin:"0 auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <button onClick={()=>setSideOpen(true)} style={{background:"rgba(0,0,0,0.07)",border:"1px solid rgba(0,0,0,0.12)",borderRadius:10,width:38,height:38,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4.5,flexShrink:0,backdropFilter:"blur(8px)"}}>
                <div style={{width:16,height:1.5,background:"rgba(0,0,0,0.75)",borderRadius:1}}/>
                <div style={{width:16,height:1.5,background:"rgba(0,0,0,0.75)",borderRadius:1}}/>
                <div style={{width:11,height:1.5,background:"rgba(0,0,0,0.75)",borderRadius:1}}/>
              </button>
              <div>
                <div style={{fontSize:10,fontWeight:600,letterSpacing:".15em",textTransform:"uppercase",color:"rgba(0,0,0,0.5)",fontFamily:"'DM Sans',sans-serif",marginBottom:1}}>{TABS.find(t=>t.id===tab)?.label||"Velara Finance"}</div>
                <div style={{fontSize:24,fontWeight:300,letterSpacing:"-.03em",lineHeight:1,color:"#1A1209"}}>{R(saldoAcumulado)}</div>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <div style={{fontSize:10,color:"rgba(0,0,0,0.5)",fontFamily:"'DM Sans',sans-serif"}}>saldo · {monthLabel(selMes)}</div>
                  <button onClick={()=>setModal("saldoini")} style={{background:"rgba(0,0,0,0.07)",border:"none",borderRadius:6,padding:"1px 6px",fontSize:9,color:"rgba(0,0,0,0.5)",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>⚙ inicial</button>
                </div>
              </div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:12,color:"#2D6E20",fontFamily:"'DM Sans',sans-serif",fontWeight:700}}>▲ {R(entradas)}</div>
              <div style={{fontSize:12,color:"#B22222",fontFamily:"'DM Sans',sans-serif",fontWeight:700}}>▼ {R(saidas)}</div>
              {totalPendPlant>0&&<div style={{fontSize:10,color:"#8B6914",fontFamily:"'DM Sans',sans-serif",marginTop:1,fontWeight:600}}>⏳ {R(totalPendPlant)}</div>}
              {totalPatrimonio>0&&<div style={{fontSize:10,color:"#5BA3D4",fontFamily:"'DM Sans',sans-serif",marginTop:1,fontWeight:600}}>📈 {R(totalPatrimonio)} patrimônio</div>}
              <div style={{fontSize:10,color:"#2D5A10",fontFamily:"'DM Sans',sans-serif",marginTop:1,fontWeight:700}}>💵 {R(saldoReal)} livre</div>
            </div>
          </div>
          <div className="scr" style={{display:"flex",gap:5,overflowX:"auto",paddingBottom:2}}>
            {Array.from({length:20},(_,i)=>{const d=new Date();d.setMonth(d.getMonth()-12+i);const ym=d.toISOString().slice(0,7);const isSel=ym===selMes;
              return <button key={ym} onClick={()=>setSelMes(ym)} style={{flexShrink:0,background:isSel?"#E8205F":"rgba(0,0,0,0.08)",color:isSel?"#fff":"rgba(26,18,9,0.7)",border:isSel?"1px solid #E8205F":"1px solid rgba(0,0,0,0.12)",borderRadius:99,padding:"4px 12px",fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all .15s",boxShadow:isSel?"0 2px 8px rgba(232,32,95,0.3)":"none"}}>{monthLabel(ym)}</button>;
            })}
          </div>
        </div>
      </div>

      <div style={{maxWidth:1100,margin:"0 auto",padding:"14px 24px 80px",position:"relative",zIndex:1}}>

        {/* ══ DASHBOARD ══ */}
        {tab==="dashboard"&&(
          <div className="fade">
            <div style={{display:"flex",justifyContent:"flex-end",alignItems:"flex-start",gap:14,marginBottom:16}}>
              <button onClick={()=>setImportOpen(true)} style={{background:"rgba(255,255,255,0.88)",border:"1px solid rgba(0,0,0,0.12)",borderRadius:12,padding:"8px 14px",fontSize:12,fontWeight:700,color:"#1A1209",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:6,boxShadow:"0 2px 8px rgba(0,0,0,0.08)",marginTop:14}}>📥 Importar Extrato</button>
              <NotepadWidget value={notas} onChange={setNotas}/>
            </div>

            {/* ── Linha 1: Cards resumo ── */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
              {[
                {label:"A Receber", val:totalPendPlant, color:"#FFD580",  bg:"rgba(0,0,0,0.35)", bdr:"rgba(212,168,67,0.5)"},
                {label:"Patrimônio", val:totalPatrimonio, color:"#2D5A10", bg:"rgba(143,196,58,0.18)", bdr:"rgba(143,196,58,0.4)"},
                {label:"Em Dívidas", val:totalDividas,   color:"#8B1A1A",  bg:"rgba(224,82,82,0.15)", bdr:"rgba(224,82,82,0.4)"},
              ].map(c=>(
                <div key={c.label} className={CARD} style={{padding:"10px 10px",background:c.bg,border:`1px solid ${c.bdr}`,textAlign:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.08)",borderRadius:12}}>
                  <div style={{fontSize:8,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",color:c.color,fontFamily:"'DM Sans',sans-serif",marginBottom:3,opacity:0.8}}>{c.label}</div>
                  <div className="num" style={{fontSize:14,fontWeight:700,color:c.color}}>{R(c.val)}</div>
                </div>
              ))}
            </div>

            {/* ── Linha 2: Gráficos lado a lado ── */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>

              {/* Pizza gastos */}
              <div className={CARD} style={{padding:14}}>
                <SL>Gastos</SL>
                {donutGastos.length>0 ? (
                  <>
                    <div style={{display:"flex",justifyContent:"center",marginBottom:10}}>
                      <div style={{position:"relative"}}>
                        <Donut data={donutGastos} size={90} thick={13}/>
                        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                          <div className="num" style={{fontSize:8,fontWeight:700,color:TXT,textAlign:"center",lineHeight:1.3}}>{R(totalGastos)}</div>
                        </div>
                      </div>
                    </div>
                    {donutGastos.slice(0,4).map(d=>(
                      <div key={d.label} style={{display:"flex",alignItems:"center",gap:5,marginBottom:4}}>
                        <div style={{width:6,height:6,borderRadius:99,background:d.color,flexShrink:0}}/>
                        <span style={{fontSize:10,color:"rgba(26,18,9,0.85)",fontFamily:"'DM Sans',sans-serif",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.label.split(" ").slice(1).join(" ")}</span>
                        <span className="num" style={{fontSize:10,fontWeight:700,color:TXT,flexShrink:0}}>{totalGastos>0?(d.v/totalGastos*100).toFixed(0):0}%</span>
                      </div>
                    ))}
                  </>
                ):(
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"16px 0",gap:8}}>
                    <div style={{width:70,height:70,borderRadius:"50%",border:"2px dashed rgba(255,255,255,0.35)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <span style={{fontSize:24,opacity:.4}}>💳</span>
                    </div>
                    <div style={{fontSize:10,color:"rgba(26,18,9,0.55)",textAlign:"center",fontFamily:"'DM Sans',sans-serif",lineHeight:1.4}}>Sem gastos<br/>em {monthLabel(selMes)}</div>
                    <button onClick={()=>openM("mov")} style={{background:"#E8205F",border:"1px solid #C0154A",borderRadius:99,color:"#fff",fontSize:9,fontWeight:700,padding:"4px 10px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>+ Lançar</button>
                  </div>
                )}
              </div>

              {/* Pizza receita por empresa */}
              <div className={CARD} style={{padding:14}}>
                <SL>Empresas</SL>
                {donutEmpresas.length>0 ? (
                  <>
                    <div style={{display:"flex",justifyContent:"center",marginBottom:10}}>
                      <div style={{position:"relative"}}>
                        <Donut data={donutEmpresas} size={90} thick={13}/>
                        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                          <div className="num" style={{fontSize:8,fontWeight:700,color:TXT,textAlign:"center",lineHeight:1.3}}>{R(empAnalise.reduce((s,e)=>s+e.total,0))}</div>
                        </div>
                      </div>
                    </div>
                    {donutEmpresas.slice(0,4).map(d=>{
                      const tot=donutEmpresas.reduce((s,x)=>s+x.v,0);
                      return <div key={d.label} style={{display:"flex",alignItems:"center",gap:5,marginBottom:4}}>
                        <div style={{width:6,height:6,borderRadius:99,background:d.color,flexShrink:0}}/>
                        <span style={{fontSize:10,color:"rgba(26,18,9,0.85)",fontFamily:"'DM Sans',sans-serif",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.label}</span>
                        <span className="num" style={{fontSize:10,fontWeight:700,color:TXT,flexShrink:0}}>{tot>0?(d.v/tot*100).toFixed(0):0}%</span>
                      </div>;
                    })}
                  </>
                ):(
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"16px 0",gap:8}}>
                    <div style={{width:70,height:70,borderRadius:"50%",border:"2px dashed rgba(255,255,255,0.35)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <span style={{fontSize:24,opacity:.4}}>🏥</span>
                    </div>
                    <div style={{fontSize:10,color:"rgba(26,18,9,0.55)",textAlign:"center",fontFamily:"'DM Sans',sans-serif",lineHeight:1.4}}>Sem plantões<br/>cadastrados</div>
                    <button onClick={()=>navTo("plantoes")} style={{background:"#E8205F",border:"1px solid #C0154A",borderRadius:99,color:"#fff",fontSize:9,fontWeight:700,padding:"4px 10px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>+ Plantão</button>
                  </div>
                )}
              </div>
            </div>

            {/* ── Linha 3: Calendário + Próximos recebimentos ── */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
              <div className={CARD} style={{padding:12}}>
                <MultiCalendar plantoes={plantoes} movs={movs} onAddWithDate={(tipo,data)=>{if(tipo==="plantao"){openM("plt");setFPlt(f=>({...f,data}));}else{openM("mov");setFMov(f=>({...f,tipo,data}));}}}/>
              </div>
              <div className={CARD} style={{padding:14}}>
                <SL>Recebimentos</SL>
                {plantoesEfetivos.filter(p=>["pendente","atrasado"].includes(p.se)&&p.previsao).length>0 ? (
                  plantoesEfetivos.filter(p=>["pendente","atrasado"].includes(p.se)&&p.previsao).sort((a,b)=>a.previsao.localeCompare(b.previsao)).slice(0,4).map(p=>{
                    const d=daysUntil(p.previsao); const emp=empNome(p.empresa);
                    return (
                      <div key={p.id} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 0",borderBottom:"1px solid rgba(0,0,0,0.07)"}}>
                        <div style={{width:4,height:4,borderRadius:99,background:d<0?C.red:d<7?C.gold:C.green,flexShrink:0}}/>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:11,fontWeight:600,fontFamily:"'DM Sans',sans-serif",color:TXT,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{emp.nome}</div>
                          <div style={{fontSize:9,color:d<0?C.red:d<7?C.gold:TMUT,fontFamily:"'DM Sans',sans-serif"}}>{d<0?`${Math.abs(d)}d atrasado`:d===0?"Hoje":d===1?"Amanhã":`${d}d`}</div>
                        </div>
                        <div style={{textAlign:"right",flexShrink:0}}>
                          <div className="num" style={{fontSize:11,fontWeight:700,color:TXT}}>{R(p.valorTotal)}</div>
                          <button onClick={()=>marcarRecebido(p.id)} style={{background:"rgba(143,196,58,0.25)",border:`1px solid ${C.green}44`,borderRadius:6,color:C.green,fontSize:9,fontWeight:700,padding:"2px 7px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",marginTop:2}}>✓</button>
                        </div>
                      </div>
                    );
                  })
                ):(
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"20px 0",gap:6}}>
                    <span style={{fontSize:22,opacity:.4}}>✅</span>
                    <div style={{fontSize:10,color:"rgba(26,18,9,0.55)",textAlign:"center",fontFamily:"'DM Sans',sans-serif"}}>Tudo em dia!</div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Ranking empresas: quem paga mais / quem atrasa mais ── */}
            <div className={CARD} style={{marginBottom:10}}>
              <SL>Ranking de empresas</SL>
              {empAnalise.length>0 ? (
                <>
                  <div style={{marginBottom:12}}>
                    <div style={{fontSize:10,fontWeight:700,color:"rgba(26,18,9,0.55)",fontFamily:"'DM Sans',sans-serif",letterSpacing:".05em",marginBottom:7}}>💰 MAIOR RECEITA</div>
                    {empAnalise.slice(0,3).map((e,i)=><HBar key={e.nome} label={e.nome} value={e.total} max={empAnalise[0].total} color={e.cor||CHART_COLORS[i]}/>)}
                  </div>
                  {empAnalise.some(e=>e.atrasos>0)&&(
                    <>
                      <div style={{height:1,background:"rgba(0,0,0,0.08)",marginBottom:12}}/>
                      <div>
                        <div style={{fontSize:10,fontWeight:700,color:"rgba(26,18,9,0.55)",fontFamily:"'DM Sans',sans-serif",letterSpacing:".05em",marginBottom:7}}>⚠ MAIS ATRASOS</div>
                        {[...empAnalise].filter(e=>e.atrasos>0).sort((a,b)=>b.atrasos-a.atrasos).slice(0,3).map(e=><HBar key={e.nome} label={e.nome} value={e.atrasos} max={Math.max(...empAnalise.map(x=>x.atrasos))} color={C.red} sub={`${e.atrasos}x`}/>)}
                      </div>
                    </>
                  )}
                </>
              ):(
                <div style={{textAlign:"center",padding:"16px 0",color:"rgba(26,18,9,0.55)",fontSize:12,fontFamily:"'DM Sans',sans-serif"}}>
                  <span style={{fontSize:24,display:"block",marginBottom:6,opacity:.4}}>🏥</span>
                  Cadastre plantões para ver o ranking
                </div>
              )}
            </div>

            {/* ── Alocação ── */}
            <div className={CARD} style={{marginBottom:10,borderLeft:`3px solid ${C.magenta}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <SL>Alocação de receita</SL>
                <div style={{display:"flex",gap:6}}>
                  {alocacoes.length>0&&<button onClick={()=>setAlocExpanded(!alocExpanded)} style={{background:"rgba(0,0,0,0.06)",border:"1px solid rgba(0,0,0,0.12)",borderRadius:8,color:"#1A1209",fontSize:10,fontWeight:700,padding:"4px 10px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>{alocExpanded?"▲ Fechar":"▼ Extrato"}</button>}
                  <button onClick={()=>setModal("regras")} style={{background:"#E8205F",border:"none",borderRadius:8,color:"#fff",fontSize:10,fontWeight:700,padding:"4px 10px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>⚙ Regras</button>
                </div>
              </div>
              {alocacoes.length>0 ? (
                <>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:10}}>
                    {Object.entries(resumoAloc).filter(([,v])=>v>0).map(([tipo,val])=>{const dc=DEST_COLORS[tipo];return <div key={tipo} style={{background:dc.bg,border:`1px solid ${dc.color}30`,borderRadius:10,padding:"8px 10px"}}><div style={{fontSize:9,fontWeight:700,color:dc.color,fontFamily:"'DM Sans',sans-serif",marginBottom:2}}>{dc.icon} {tipo.toUpperCase()}</div><div className="num" style={{fontSize:13,fontWeight:700,color:dc.color}}>{R(val)}</div></div>;})}
                  </div>
                  {alocExpanded ? (
                    <div style={{borderTop:"1px solid rgba(0,0,0,0.07)",paddingTop:10}}>
                      <div style={{fontSize:10,fontWeight:700,color:"rgba(26,18,9,0.45)",letterSpacing:".07em",textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif",marginBottom:8}}>Extrato de distribuições</div>
                      {alocacoes.map(a=>(
                        <div key={a.id} style={{background:"rgba(0,0,0,0.03)",borderRadius:10,padding:"10px 12px",marginBottom:8,border:"1px solid rgba(0,0,0,0.06)"}}>
                          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                            <div><div style={{fontSize:12,fontWeight:700,color:"#1A1209",fontFamily:"'DM Sans',sans-serif"}}>{a.empresa}</div><div style={{fontSize:10,color:"rgba(26,18,9,0.5)",fontFamily:"'DM Sans',sans-serif"}}>{a.data?new Date(a.data+"T12:00:00").toLocaleDateString("pt-BR",{day:"2-digit",month:"short",year:"numeric"}):"—"}</div></div>
                            <div className="num" style={{fontSize:13,fontWeight:700,color:"#2D5A10"}}>{R(a.totalRecebido)}</div>
                          </div>
                          {a.itens.map((it,j)=>{const dc=DEST_COLORS[it.tipo]||DEST_COLORS.livre;const inv=it.tipo==="investimento"?invests.find(x=>x.id===it.destinoId):null;return(
                            <div key={j} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderTop:"1px solid rgba(0,0,0,0.04)"}}>
                              <div style={{display:"flex",alignItems:"center",gap:6}}>
                                <span>{dc.icon}</span>
                                <div><div style={{fontSize:11,fontWeight:600,color:"#1A1209",fontFamily:"'DM Sans',sans-serif"}}>{it.destinoNome}</div>
                                <div style={{fontSize:9,color:"rgba(26,18,9,0.45)",fontFamily:"'DM Sans',sans-serif"}}>{it.banco&&<span>{it.banco}</span>}{inv?.taxa&&<span style={{color:"#2D5A10",fontWeight:700}}> · {inv.taxa}% a.a.</span>}{!it.banco&&!inv?.taxa&&<span>{it.tipo}</span>}</div></div>
                              </div>
                              <div className="num" style={{fontSize:12,fontWeight:700,color:dc.color}}>{R(it.valor)}</div>
                            </div>
                          );})}
                        </div>
                      ))}
                    </div>
                  ) : (
                    alocacoes.slice(0,1).map(a=>(
                      <div key={a.id} style={{background:"rgba(0,0,0,0.03)",borderRadius:10,border:"1px solid rgba(0,0,0,0.06)",padding:"9px 11px"}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:12,fontWeight:600,fontFamily:"'DM Sans',sans-serif",color:"#1A1209"}}>{a.empresa}</span><span className="num" style={{fontSize:12,fontWeight:700,color:"#2D5A10"}}>{R(a.totalRecebido)}</span></div>
                        {a.itens.map((it,j)=>{const dc=DEST_COLORS[it.tipo]||DEST_COLORS.livre;return <div key={j} style={{display:"flex",justifyContent:"space-between",marginBottom:2}}><span style={{fontSize:10,color:"rgba(26,18,9,0.7)",fontFamily:"'DM Sans',sans-serif"}}>{dc.icon} {it.destinoNome}</span><span className="num" style={{fontSize:10,fontWeight:700,color:dc.color}}>{R(it.valor)}</span></div>;})}
                      </div>
                    ))
                  )}
                </>
              ):(
                <div style={{textAlign:"center",padding:"10px 0",color:"rgba(26,18,9,0.55)",fontFamily:"'DM Sans',sans-serif",fontSize:12}}>
                  Sem distribuições ainda —{" "}
                  <button onClick={()=>setModal("regras")} style={{background:"none",border:"none",color:C.magenta,fontWeight:700,cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>configurar regras →</button>
                </div>
              )}
            </div>

            {/* ── Objetivos ── */}
            <div className={CARD}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <SL>Objetivos</SL>
                <button onClick={()=>navTo("objetivos")} style={{background:"rgba(0,0,0,0.08)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:8,color:"#1A1209",fontSize:10,fontWeight:600,padding:"4px 10px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Ver todos</button>
              </div>
              {objetivos.length>0 ? objetivos.map(o=>{const pct=o.meta>0?Math.min(o.atual/o.meta*100,100):0;
                return <div key={o.id} style={{marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><span style={{fontSize:12,fontWeight:600,fontFamily:"'DM Sans',sans-serif",color:TXT}}>{o.nome}</span><span className="num" style={{fontSize:10,color:"rgba(26,18,9,0.85)"}}>{pct.toFixed(0)}%</span></div>
                  <Bar value={o.atual} max={o.meta} color={o.cor} h={5}/>
                  <div style={{fontSize:9,color:"rgba(26,18,9,0.55)",marginTop:2,fontFamily:"'DM Sans',sans-serif"}}>falta {R(o.meta-o.atual)}</div>
                </div>;
              }):(
                <div style={{textAlign:"center",padding:"14px 0",color:"rgba(26,18,9,0.55)",fontSize:12,fontFamily:"'DM Sans',sans-serif"}}>
                  <span style={{fontSize:22,display:"block",marginBottom:6,opacity:.4}}>🎯</span>
                  <button onClick={()=>navTo("objetivos")} style={{background:"none",border:"none",color:C.magenta,fontWeight:700,cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>Criar primeiro objetivo →</button>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ══ MOVIMENTOS ══ */}
        {tab==="movimentos"&&(
          <div className="fade">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div style={{display:"flex",gap:8}}>
                <div style={{background:"rgba(255,255,255,0.92)",backdropFilter:"blur(12px)",borderRadius:12,padding:"10px 16px",textAlign:"center",border:"1px solid rgba(143,196,58,0.4)"}}><div style={{fontSize:9,color:"#2D5A10",fontWeight:700,letterSpacing:".06em",fontFamily:"'DM Sans',sans-serif"}}>ENTRADAS</div><div className="num" style={{fontSize:15,fontWeight:700,color:"#2D5A10"}}>{R(entradas)}</div></div>
                <div style={{background:"rgba(255,255,255,0.92)",backdropFilter:"blur(12px)",borderRadius:12,padding:"10px 16px",textAlign:"center",border:"1px solid rgba(224,82,82,0.4)"}}><div style={{fontSize:9,color:"#8B1A1A",fontWeight:700,letterSpacing:".06em",fontFamily:"'DM Sans',sans-serif"}}>SAÍDAS</div><div className="num" style={{fontSize:15,fontWeight:700,color:"#8B1A1A"}}>{R(saidas)}</div></div>
              </div>
              <div style={{display:"flex",gap:7}}>
                <button onClick={()=>setImportOpen(true)} style={{background:"rgba(255,255,255,0.88)",border:"1px solid rgba(0,0,0,0.12)",borderRadius:12,padding:"9px 14px",fontSize:12,fontWeight:700,color:"#1A1209",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:6}}>📥 Importar</button>
                <Btn variant="primary" style={{padding:"9px 14px",fontSize:12,boxShadow:"0 2px 10px rgba(232,32,95,0.3)"}} onClick={()=>openM("mov")}>+ Lançamento</Btn>
              </div>
            </div>
            {movsDoMes.length===0?<div className={CARD} style={{textAlign:"center",padding:36,color:"rgba(26,18,9,0.55)",fontSize:14}}>Nenhum lançamento em {monthLabel(selMes)}</div>
              :[...movsDoMes].sort((a,b)=>b.data.localeCompare(a.data)).map(m=>(
                <div key={m.id} className={CARD} style={{display:"flex",alignItems:"center",gap:10,marginBottom:7,padding:"11px 14px"}}>
                  <div style={{width:34,height:34,borderRadius:10,background:m.tipo==="entrada"?"rgba(0,0,0,0.3)":"rgba(0,0,0,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0,border:`1px solid ${m.tipo==="entrada"?C.green:C.red}44`}}>{m.categoria.split(" ")[0]}</div>
                  <div style={{flex:1}}><div style={{fontSize:13,fontWeight:500,fontFamily:"'DM Sans',sans-serif",color:TXT}}>{m.descricao}</div><div style={{fontSize:10,color:"rgba(26,18,9,0.85)",fontFamily:"'DM Sans',sans-serif",marginTop:1}}>{fd(m.data)} · {m.categoria.split(" ").slice(1).join(" ")}</div></div>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3,flexShrink:0}}>
                    <div className="num" style={{fontSize:14,fontWeight:700,color:m.tipo==="entrada"?C.green:m.tipo==="transferencia"?"#5BA3D4":C.red}}>{m.tipo==="entrada"?"+":m.tipo==="transferencia"?"🔄":"-"}{R(m.valor)}</div>
                    {m.tipo==="entrada"&&regras.length>0&&<button onClick={()=>setMovDist(m)} style={{background:"rgba(232,32,95,0.1)",border:"1px solid rgba(232,32,95,0.3)",borderRadius:6,color:"#E8205F",fontSize:9,fontWeight:700,padding:"2px 6px",cursor:"pointer",fontFamily:"inherit"}}>distribuir</button>}
                  </div>
                  <button onClick={()=>remove(movs,setMovs,m.id)} style={{background:"none",border:"none",color:"rgba(26,18,9,0.55)",fontSize:17,cursor:"pointer",padding:"0 3px",lineHeight:1}}>×</button>
                </div>
              ))
            }
          </div>
        )}

        {/* ══ PLANTÕES ══ */}
        {tab==="plantoes"&&(
          <div className="fade">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div><div style={{fontSize:22,fontWeight:300,color:TXT}}>{plantoes.length} plantões</div><div className="num" style={{fontSize:12,color:C.magenta,fontWeight:600}}>{R(totalPendPlant)} a receber</div></div>
              <div style={{display:"flex",gap:7}}>
                <Btn variant="secondary" style={{fontSize:11,padding:"7px 11px",color:"#1A1209",background:"rgba(255,255,255,0.2)",border:"1px solid rgba(255,255,255,0.25)"}} onClick={()=>openM("emp")}>+ Empresa</Btn>
                <Btn variant="primary" style={{fontSize:11,padding:"7px 11px"}} onClick={()=>openM("plt")}>+ Plantão</Btn>
              </div>
            </div>
            {empresas.length>0&&<div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:12}}>{empresas.map(e=><span key={e.id} onClick={()=>openM("emp",e)} style={{fontSize:10,fontWeight:700,padding:"4px 12px",borderRadius:99,background:"rgba(255,255,255,0.9)",color:e.cor,border:`2px solid ${e.cor}`,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>{e.nome}</span>)}</div>}
            {plantoesEfetivos.length===0?<div className={CARD} style={{textAlign:"center",padding:36,color:"rgba(26,18,9,0.55)",fontSize:14}}>Adicione empresas e plantões</div>
              :[...plantoesEfetivos].sort((a,b)=>b.data.localeCompare(a.data)).map(p=>{
                const emp=empNome(p.empresa);const d=daysUntil(p.previsao);
                const sc={pendente:{label:"Pendente",color:C.gold,bg:C.goldGlass},recebido:{label:"Recebido",color:C.green,bg:C.greenGlass},atrasado:{label:"Atrasado",color:C.red,bg:C.redGlass},cancelado:{label:"Cancelado",color:"rgba(26,18,9,0.85)",bg:C.glass}};
                const s=sc[p.se]||sc.pendente;
                const aloc=alocacoes.find(a=>a.plantaoId===p.id);
                return (
                  <div key={p.id} className={CARD} style={{marginBottom:10,borderLeft:`3px solid ${emp.cor||C.magenta}`,padding:"13px 14px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                      <div>
                        <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3}}><span style={{fontSize:14,fontWeight:600,fontFamily:"'DM Sans',sans-serif",color:TXT}}>{emp.nome}</span><Badge label={s.label} color={s.color} bg={s.bg}/></div>
                        <div style={{fontSize:10,color:"rgba(26,18,9,0.85)",fontFamily:"'DM Sans',sans-serif"}}>{fd(p.data)}{p.horas&&` · ${p.horas}h`}{p.previsao&&` · pgto ${fd(p.previsao)}`}{p.previsao&&p.status!=="recebido"&&d!==null&&<span style={{color:d<0?C.red:d<7?C.gold:TSUB,fontWeight:600}}> ({d<0?`${Math.abs(d)}d atrasado`:d===0?"hoje":d===1?"amanhã":`${d}d`})</span>}</div>
                        {aloc&&<div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:5}}>{aloc.itens.map((it,j)=>{const dc=DEST_COLORS[it.tipo]||DEST_COLORS.livre;return <span key={j} style={{fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:99,background:dc.bg,color:dc.color,backdropFilter:"blur(4px)"}}>{it.destinoNome}: {R(it.valor)}</span>;})}</div>}
                      </div>
                      <div className="num" style={{fontSize:16,fontWeight:700,flexShrink:0,color:TXT}}>{R(p.valorTotal)}</div>
                    </div>
                    <div style={{display:"flex",gap:6}}>
                      {p.status!=="recebido"&&<Btn variant="green" style={{fontSize:10,padding:"5px 11px"}} onClick={()=>marcarRecebido(p.id)}>✓ Recebido</Btn>}
                      <Btn variant="secondary" style={{fontSize:10,padding:"5px 9px",color:"#1A1209",background:"rgba(0,0,0,0.07)",border:"1px solid rgba(0,0,0,0.12)"}} onClick={()=>openM("plt",p)}>Editar</Btn>
                      <Btn variant="danger" style={{fontSize:10,padding:"5px 9px"}} onClick={()=>remove(plantoes,setPlantoes,p.id)}>Excluir</Btn>
                    </div>
                  </div>
                );
              })
            }
          </div>
        )}

        {/* ══ ANÁLISE ══ */}
        {tab==="analise"&&(
          <div className="fade">
            {/* Título */}
            <div style={{background:"rgba(255,255,255,0.92)",backdropFilter:"blur(12px)",borderRadius:14,padding:"12px 16px",border:"1px solid rgba(255,255,255,0.98)",marginBottom:12,boxShadow:"0 2px 12px rgba(0,0,0,0.08)"}}>
              <div style={{fontSize:22,fontWeight:300,color:"#1A1209"}}>Análise Completa</div>
            </div>

            {/* Linha 1: Donut empresas + Donut gastos */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
              <div className={CARD}>
                <SL>Receita por empresa</SL>
                <div style={{display:"flex",justifyContent:"center",marginBottom:8}}>
                  <div style={{position:"relative"}}>
                    <Donut data={donutEmpresas} size={90} thick={13}/>
                    <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <div className="num" style={{fontSize:8,fontWeight:700,color:"#1A1209",textAlign:"center",lineHeight:1.3}}>{R(empAnalise.reduce((s,e)=>s+e.total,0))}</div>
                    </div>
                  </div>
                </div>
                {donutEmpresas.slice(0,5).map(d=>{
                  const tot=donutEmpresas.reduce((s,x)=>s+x.v,0);
                  return <div key={d.label} style={{display:"flex",alignItems:"center",gap:5,marginBottom:4}}>
                    <div style={{width:6,height:6,borderRadius:99,background:d.color,flexShrink:0}}/>
                    <span style={{fontSize:10,color:"rgba(26,18,9,0.75)",fontFamily:"'DM Sans',sans-serif",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.label}</span>
                    <span className="num" style={{fontSize:10,fontWeight:700,color:"#1A1209",flexShrink:0}}>{tot>0?(d.v/tot*100).toFixed(0):0}%</span>
                  </div>;
                })}
              </div>

              <div className={CARD}>
                <SL>Gastos · {monthLabel(selMes)}</SL>
                {donutGastos.length>0 ? (
                  <>
                    <div style={{display:"flex",justifyContent:"center",marginBottom:8}}>
                      <div style={{position:"relative"}}>
                        <Donut data={donutGastos} size={90} thick={13}/>
                        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                          <div className="num" style={{fontSize:8,fontWeight:700,color:"#1A1209",textAlign:"center",lineHeight:1.3}}>{R(totalGastos)}</div>
                        </div>
                      </div>
                    </div>
                    {donutGastos.slice(0,5).map(d=>(
                      <div key={d.label} style={{display:"flex",alignItems:"center",gap:5,marginBottom:4}}>
                        <div style={{width:6,height:6,borderRadius:99,background:d.color,flexShrink:0}}/>
                        <span style={{fontSize:10,color:"rgba(26,18,9,0.75)",fontFamily:"'DM Sans',sans-serif",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.label.split(" ").slice(1).join(" ")}</span>
                        <span className="num" style={{fontSize:10,fontWeight:700,color:"#1A1209",flexShrink:0}}>{totalGastos>0?(d.v/totalGastos*100).toFixed(0):0}%</span>
                      </div>
                    ))}
                  </>
                ):(
                  <div style={{textAlign:"center",padding:"20px 0",color:"rgba(26,18,9,0.4)",fontSize:12,fontFamily:"'DM Sans',sans-serif"}}>Sem gastos em {monthLabel(selMes)}</div>
                )}
              </div>
            </div>

            {empAnalise.length>0&&(
              <>
                {/* Linha 2: Maior receita + Mais plantões */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                  <div className={CARD}>
                    <SL>Maior receita</SL>
                    {empAnalise.map(e=><HBar key={e.nome} label={e.nome} value={e.total} max={maxEmpTotal} color={e.cor||C.magenta}/>)}
                  </div>
                  <div className={CARD}>
                    <SL>Mais plantões</SL>
                    {[...empAnalise].sort((a,b)=>b.count-a.count).map(e=><HBar key={e.nome} label={e.nome} value={e.count} max={maxEmpCount} color={e.cor||C.blue} sub={`${e.count}x`}/>)}
                  </div>
                </div>

                {/* Linha 3: Mais atrasos + Resumo */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                  <div className={CARD}>
                    <SL>Mais atrasos</SL>
                    {empAnalise.some(e=>e.atrasos>0)
                      ?[...empAnalise].sort((a,b)=>b.atrasos-a.atrasos).filter(e=>e.atrasos>0).map(e=><HBar key={e.nome} label={e.nome} value={e.atrasos} max={maxEmpAtraso} color={C.red} sub={`${e.atrasos}x`}/>)
                      :<div style={{color:"rgba(26,18,9,0.4)",fontSize:12,textAlign:"center",padding:"12px 0",fontFamily:"'DM Sans',sans-serif"}}>🎉 Nenhum atraso</div>
                    }
                  </div>
                  <div className={CARD}>
                    <SL>Resumo</SL>
                    {empAnalise.map((e,i)=>(
                      <div key={e.nome} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:i<empAnalise.length-1?"1px solid rgba(26,18,9,0.07)":"none"}}>
                        <div style={{width:7,height:7,borderRadius:99,background:e.cor||CHART_COLORS[i%CHART_COLORS.length],flexShrink:0}}/>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:11,fontWeight:600,color:"#1A1209",fontFamily:"'DM Sans',sans-serif",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.nome}</div>
                          <div style={{fontSize:9,color:"rgba(26,18,9,0.5)",fontFamily:"'DM Sans',sans-serif"}}>{e.count} plantão{e.count!==1?"ões":""}{e.atrasos>0?` · ${e.atrasos} atraso`:""}</div>
                        </div>
                        <div className="num" style={{fontSize:11,fontWeight:700,color:"#2D5A10",flexShrink:0}}>{R(e.recebido)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tabela resumo */}
                <div className={CARD} style={{marginBottom:12}}>
                  <SL>Resumo por empresa</SL>
                  {empAnalise.map((e,i)=>(
                    <div key={e.nome} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:i<empAnalise.length-1?"1px solid rgba(255,255,255,0.1)":"none"}}>
                      <div style={{width:8,height:8,borderRadius:99,background:e.cor||CHART_COLORS[i%CHART_COLORS.length],flexShrink:0}}/>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:600,color:TXT,fontFamily:"'DM Sans',sans-serif"}}>{e.nome}</div>
                        <div style={{fontSize:10,color:"rgba(26,18,9,0.85)",fontFamily:"'DM Sans',sans-serif"}}>{e.count} plantão{e.count!==1?"ões":""} · {e.atrasos>0?<span style={{color:C.red}}>{e.atrasos} atraso{e.atrasos!==1?"s":""}</span>:"sem atrasos"}</div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div className="num" style={{fontSize:14,fontWeight:700,color:C.green}}>{R(e.recebido)}</div>
                        {e.pendente>0&&<div className="num" style={{fontSize:10,color:C.gold}}>+{R(e.pendente)} pend.</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            {empAnalise.length===0&&<div className={CARD} style={{textAlign:"center",padding:36,color:"rgba(26,18,9,0.55)",fontSize:14}}>Cadastre plantões para ver a análise por empresa</div>}
          </div>
        )}

        {/* ══ INVESTIMENTOS ══ */}
        {tab==="investimentos"&&(
          <div className="fade">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div><div style={{fontSize:22,fontWeight:300,color:TXT}}>Investimentos</div><div className="num" style={{fontSize:15,fontWeight:700,color:C.green}}>{R(totalInvestido)}</div></div>
              <Btn variant="primary" style={{fontSize:12,padding:"9px 14px"}} onClick={()=>openM("inv")}>+ Investimento</Btn>
            </div>
            {invests.length===0?<div className={CARD} style={{textAlign:"center",padding:36,color:"rgba(26,18,9,0.55)",fontSize:14}}>Nenhum investimento registrado</div>
              :invests.map(i=>{
                const txEf=taxaEfetiva(i);
                const rend=i.aporte*txEf/100/12;
                const objsVinc=objetivos.filter(o=>o.investId===i.id);
                const divsVinc=dividas.filter(d=>d.tipo==="fundo"&&d.investId===i.id);
                const totalReservado=objsVinc.reduce((s,o)=>s+(+o.atual||0),0)+divsVinc.reduce((s,d)=>s+(+d.pago||0),0);
                const livreNoInvest=i.aporte-totalReservado;
                return <div key={i.id} className={CARD} style={{marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                    <div><div style={{fontSize:14,fontWeight:600,fontFamily:"'DM Sans',sans-serif",color:TXT}}>{i.nome}</div><div style={{fontSize:10,color:"rgba(26,18,9,0.85)",fontFamily:"'DM Sans',sans-serif",marginTop:1}}>{i.tipo}{i.banco&&` · ${i.banco}`} · desde {fd(i.data)}</div></div>
                    <div className="num" style={{fontSize:16,fontWeight:700,color:C.green}}>{R(i.aporte)}</div>
                  </div>
                  <div style={{display:"flex",gap:8,background:"rgba(0,0,0,0.05)",borderRadius:10,border:"1px solid rgba(0,0,0,0.07)",padding:"9px 11px",marginBottom:9}}>
                    <div style={{flex:1,textAlign:"center"}}>
                      <div style={{fontSize:9,color:"rgba(26,18,9,0.85)",fontFamily:"'DM Sans',sans-serif",fontWeight:600,letterSpacing:".06em",marginBottom:2}}>TAXA A.A.</div>
                      <div className="num" style={{fontSize:14,fontWeight:700,color:C.green}}>{txEf?txEf.toFixed(2):"—"}%</div>
                      {i.taxaModo==="cdi"&&i.percCDI&&<div style={{fontSize:8,color:"#5A4A3A",fontFamily:"'DM Sans',sans-serif"}}>{i.percCDI}% do CDI</div>}
                    </div>
                    <div style={{width:1,background:"rgba(255,255,255,0.2)"}}/>
                    <div style={{flex:1,textAlign:"center"}}><div style={{fontSize:9,color:"rgba(26,18,9,0.85)",fontFamily:"'DM Sans',sans-serif",fontWeight:600,letterSpacing:".06em",marginBottom:2}}>REND./MÊS</div><div className="num" style={{fontSize:14,fontWeight:700,color:C.green}}>{R(rend)}</div></div>
                  </div>
                  {(objsVinc.length>0||divsVinc.length>0)&&(
                    <div style={{background:"rgba(91,163,212,0.08)",border:"1px solid rgba(91,163,212,0.25)",borderRadius:10,padding:"9px 11px",marginBottom:9}}>
                      <div style={{fontSize:9,fontWeight:700,color:"#1A4A6E",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif",marginBottom:6}}>Reservado para</div>
                      {objsVinc.map(o=>(
                        <div key={o.id} style={{display:"flex",justifyContent:"space-between",padding:"2px 0"}}>
                          <span style={{fontSize:11,color:"#1A1209",fontFamily:"'DM Sans',sans-serif"}}>🎯 {o.nome}</span>
                          <span className="num" style={{fontSize:11,fontWeight:700,color:"#1A4A6E"}}>{R(o.atual)}</span>
                        </div>
                      ))}
                      {divsVinc.map(d=>(
                        <div key={d.id} style={{display:"flex",justifyContent:"space-between",padding:"2px 0"}}>
                          <span style={{fontSize:11,color:"#1A1209",fontFamily:"'DM Sans',sans-serif"}}>🏦 {d.credor}</span>
                          <span className="num" style={{fontSize:11,fontWeight:700,color:"#1A4A6E"}}>{R(d.pago)}</span>
                        </div>
                      ))}
                      <div style={{display:"flex",justifyContent:"space-between",padding:"4px 0 0",marginTop:4,borderTop:"1px solid rgba(91,163,212,0.2)"}}>
                        <span style={{fontSize:10,color:"#5A4A3A",fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>Livre neste investimento</span>
                        <span className="num" style={{fontSize:11,fontWeight:700,color:livreNoInvest>=0?"#2D5A10":"#8B1A1A"}}>{R(livreNoInvest)}</span>
                      </div>
                    </div>
                  )}
                  {i.obs&&<div style={{fontSize:11,color:"rgba(26,18,9,0.55)",marginBottom:8,fontFamily:"'DM Sans',sans-serif"}}>{i.obs}</div>}
                  <div style={{display:"flex",gap:6}}>
                    <Btn variant="secondary" style={{fontSize:10,padding:"5px 9px",color:"#1A1209",background:"rgba(0,0,0,0.07)",border:"1px solid rgba(0,0,0,0.12)"}} onClick={()=>openM("inv",i)}>Editar</Btn>
                    <Btn variant="danger" style={{fontSize:10,padding:"5px 9px"}} onClick={()=>remove(invests,setInvests,i.id)}>Excluir</Btn>
                  </div>
                </div>;
              })
            }
          </div>
        )}

        {/* ══ OBJETIVOS ══ */}
        {tab==="objetivos"&&(
          <div className="fade">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div style={{fontSize:22,fontWeight:300,color:TXT}}>Objetivos</div>
              <Btn variant="primary" style={{fontSize:12,padding:"9px 14px"}} onClick={()=>openM("obj")}>+ Objetivo</Btn>
            </div>
            {objetivos.length===0?<div className={CARD} style={{textAlign:"center",padding:36,color:"rgba(26,18,9,0.55)",fontSize:14}}>Crie seus objetivos financeiros</div>
              :objetivos.map(o=>{const pct=o.meta>0?Math.min(o.atual/o.meta*100,100):0;const d=daysUntil(o.prazo);
                const invVinc=o.investId?invests.find(i=>i.id===o.investId):null;
                return <div key={o.id} className={CARD} style={{marginBottom:10,borderLeft:`3px solid ${o.cor}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:9}}>
                    <div><div style={{fontSize:14,fontWeight:600,fontFamily:"'DM Sans',sans-serif",color:TXT}}>{o.nome}</div>
                      {invVinc&&<div style={{fontSize:10,color:"#2D5A10",fontFamily:"'DM Sans',sans-serif",marginTop:2,fontWeight:600}}>📈 {invVinc.nome}{invVinc.banco?" · "+invVinc.banco:""}{invVinc.taxa?" · "+invVinc.taxa+"% a.a.":""}</div>}
                      {o.prazo&&<div style={{fontSize:10,color:"rgba(26,18,9,0.85)",fontFamily:"'DM Sans',sans-serif",marginTop:1}}>Prazo: {fdFull(o.prazo)}{d!==null&&<span style={{color:d<=30?C.gold:TSUB}}> · {d>0?`${d}d`:d===0?"Hoje":"Vencido"}</span>}</div>}
                      {o.obs&&<div style={{fontSize:10,color:"rgba(26,18,9,0.55)",marginTop:2,fontFamily:"'DM Sans',sans-serif"}}>{o.obs}</div>}
                    </div>
                    <div style={{textAlign:"right"}}><div className="num" style={{fontSize:15,fontWeight:700,color:TXT}}>{R(o.atual)}</div><div style={{fontSize:10,color:"rgba(26,18,9,0.85)",fontFamily:"'DM Sans',sans-serif"}}>de {R(o.meta)}</div></div>
                  </div>
                  <Bar value={o.atual} max={o.meta} color={o.cor} h={6}/>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"rgba(26,18,9,0.55)",fontFamily:"'DM Sans',sans-serif",marginTop:4,marginBottom:10}}><span>{pct.toFixed(1)}%</span><span>Falta {R(Math.max(o.meta-o.atual,0))}</span></div>
                  <div style={{display:"flex",gap:6}}>
                    <Btn variant="green" style={{fontSize:10,padding:"5px 11px"}} onClick={()=>openM("aporte",null,o.id)}>+ Aporte</Btn>
                    <Btn variant="secondary" style={{fontSize:10,padding:"5px 9px",color:"#1A1209",background:"rgba(0,0,0,0.07)",border:"1px solid rgba(0,0,0,0.12)"}} onClick={()=>openM("obj",o)}>Editar</Btn>
                    <Btn variant="danger" style={{fontSize:10,padding:"5px 9px"}} onClick={()=>remove(objetivos,setObjetivos,o.id)}>Excluir</Btn>
                  </div>
                </div>;
              })
            }
          </div>
        )}

        {/* ══ DÍVIDAS ══ */}
        {tab==="dividas"&&(
          <div className="fade">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div><div style={{fontSize:22,fontWeight:300,color:TXT}}>Dívidas</div><div className="num" style={{fontSize:12,color:C.red,fontWeight:600}}>{R(totalDividas)} em aberto</div></div>
              <Btn variant="primary" style={{fontSize:12,padding:"9px 14px"}} onClick={()=>openM("div")}>+ Dívida</Btn>
            </div>

            {/* ── Fundo de Dívidas ── */}
            {dividas.filter(d=>d.tipo==="fundo").length>0&&(
              <div style={{marginBottom:18}}>
                <div style={{fontSize:11,fontWeight:700,color:"#8B6000",letterSpacing:".08em",textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif",marginBottom:8}}>🏦 Fundo de Dívidas — acumulando para quitar</div>
                {dividas.filter(d=>d.tipo==="fundo").map(d=>{
                  const pct=+d.total>0?Math.min(+d.pago/+d.total*100,100):0;
                  const falta=Math.max(+d.total-+d.pago,0);
                  const invVinc=d.investId?invests.find(i=>i.id===d.investId):null;
                  return <div key={d.id} className={CARD} style={{marginBottom:10,borderLeft:"3px solid #FFB347"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                      <div><div style={{fontSize:14,fontWeight:600,fontFamily:"'DM Sans',sans-serif",color:TXT}}>{d.credor}</div>
                        {invVinc&&<div style={{fontSize:10,color:"#2D5A10",fontFamily:"'DM Sans',sans-serif",marginTop:2,fontWeight:600}}>📈 {invVinc.nome}{invVinc.banco?" · "+invVinc.banco:""}{invVinc.taxa?" · "+invVinc.taxa+"% a.a.":""}</div>}
                        {d.obs&&<div style={{fontSize:10,color:TMUT,fontFamily:"'DM Sans',sans-serif"}}>{d.obs}</div>}
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div className="num" style={{fontSize:15,fontWeight:700,color:"#FFB347"}}>{R(+d.pago)}</div>
                        <div style={{fontSize:10,color:TMUT,fontFamily:"'DM Sans',sans-serif"}}>de {R(+d.total)}</div>
                      </div>
                    </div>
                    <Bar value={+d.pago} max={+d.total} color="#FFB347" h={6}/>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:TMUT,fontFamily:"'DM Sans',sans-serif",marginTop:4,marginBottom:10}}>
                      <span>{pct.toFixed(0)}% acumulado</span>
                      <span>Falta {R(falta)}</span>
                    </div>
                    {pct>=100&&<div style={{background:"rgba(143,196,58,0.15)",border:"1px solid rgba(143,196,58,0.4)",borderRadius:8,padding:"8px 12px",fontSize:12,color:"#2D5A10",fontFamily:"'DM Sans',sans-serif",marginBottom:8,fontWeight:600}}>✅ Pronto para quitar!</div>}
                    <div style={{display:"flex",gap:6}}>
                      <Btn variant="secondary" style={{fontSize:10,padding:"5px 9px",color:"#1A1209",background:"rgba(0,0,0,0.07)",border:"1px solid rgba(0,0,0,0.12)"}} onClick={()=>openM("div",d)}>Editar</Btn>
                      {pct>=100&&<Btn variant="green" style={{fontSize:10,padding:"5px 11px"}} onClick={()=>{setDividas(dividas.map(x=>x.id===d.id?{...x,quitada:true}:x));}}>Quitar agora</Btn>}
                      <Btn variant="danger" style={{fontSize:10,padding:"5px 9px"}} onClick={()=>remove(dividas,setDividas,d.id)}>Excluir</Btn>
                    </div>
                  </div>;
                })}
              </div>
            )}

            {/* ── Dívidas Ativas ── */}
            <div style={{fontSize:11,fontWeight:700,color:"rgba(26,18,9,0.5)",letterSpacing:".08em",textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif",marginBottom:8}}>💳 Dívidas Ativas — pagamento mensal</div>
            {dividas.filter(d=>!d.tipo||d.tipo==="ativa").length===0
              ?<div className={CARD} style={{textAlign:"center",padding:24,color:TMUT,fontSize:13,fontFamily:"'DM Sans',sans-serif"}}>Nenhuma dívida ativa 🎉</div>
              :dividas.filter(d=>!d.tipo||d.tipo==="ativa").map(d=>{
                const s=statusDiv(d);const pct=+d.total>0?Math.min(+d.pago/+d.total*100,100):0;
                return <div key={d.id} className={CARD} style={{marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                    <div><div style={{display:"flex",alignItems:"center",gap:7,marginBottom:2}}><span style={{fontSize:14,fontWeight:600,fontFamily:"'DM Sans',sans-serif",color:TXT}}>{d.credor}</span><Badge label={s.label} color={s.color} bg={s.bg}/></div>
                      {d.prazo&&<div style={{fontSize:10,color:TMUT,fontFamily:"'DM Sans',sans-serif"}}>Prazo: {fdFull(d.prazo)}</div>}
                      {d.parcelas&&<div style={{fontSize:10,color:TMUT,fontFamily:"'DM Sans',sans-serif"}}>{d.parcelas}</div>}
                    </div>
                    <div style={{textAlign:"right"}}><div className="num" style={{fontSize:15,fontWeight:700,color:C.red}}>{R(+d.total-+d.pago)}</div><div style={{fontSize:10,color:TMUT,fontFamily:"'DM Sans',sans-serif"}}>restante</div></div>
                  </div>
                  <Bar value={+d.pago} max={+d.total} color={C.green} h={5}/>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:TMUT,fontFamily:"'DM Sans',sans-serif",marginTop:4,marginBottom:10}}><span>Pago: {R(+d.pago)}</span><span>{pct.toFixed(0)}%</span><span>Total: {R(+d.total)}</span></div>
                  <div style={{display:"flex",gap:6}}>
                    <Btn variant="green" style={{fontSize:10,padding:"5px 11px"}} onClick={()=>openM("pgto",null,d.id)}>+ Pagamento</Btn>
                    <Btn variant="secondary" style={{fontSize:10,padding:"5px 9px",color:"#1A1209",background:"rgba(0,0,0,0.07)",border:"1px solid rgba(0,0,0,0.12)"}} onClick={()=>openM("div",d)}>Editar</Btn>
                    <Btn variant="danger" style={{fontSize:10,padding:"5px 9px"}} onClick={()=>remove(dividas,setDividas,d.id)}>Excluir</Btn>
                  </div>
                </div>;
              })
            }
          </div>
        )}
        {tab==="cartoes"&&(
          <div className="fade">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div style={{fontSize:22,fontWeight:300,color:TXT}}>Cartões</div>
              <div style={{display:"flex",gap:7}}>
                <Btn variant="secondary" style={{fontSize:11,padding:"7px 11px",color:"#1A1209",background:"rgba(0,0,0,0.07)",border:"1px solid rgba(0,0,0,0.12)"}} onClick={()=>openM("cart")}>+ Cartão</Btn>
                <Btn variant="primary" style={{fontSize:11,padding:"7px 11px"}} onClick={()=>openM("ccmov")}>+ Compra</Btn>
              </div>
            </div>
            {cartoes.length===0?<div className={CARD} style={{textAlign:"center",padding:36,color:"rgba(26,18,9,0.55)",fontSize:14}}>Adicione seus cartões</div>
              :cartoes.map(c=>{const usado=ccGastosMes(c.id);const pct=+c.limite>0?Math.min(usado/+c.limite*100,100):0;const alerta=pct>=80;
                const cc=ccMovs.filter(m=>m.cartao===c.id&&monthKey(m.data)===selMes).sort((a,b)=>b.data.localeCompare(a.data));
                return <div key={c.id} style={{marginBottom:14}}>
                  <div className={CARD} style={{background:alerta?"rgba(224,82,82,0.22)":"rgba(255,255,255,0.15)",border:`1px solid ${alerta?C.red+"55":"rgba(255,255,255,0.26)"}`,marginBottom:7}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:11}}>
                      <div><div style={{fontSize:15,fontWeight:700,fontFamily:"'DM Sans',sans-serif",color:TXT}}>{c.nome}</div><div style={{fontSize:10,color:"rgba(26,18,9,0.85)",marginTop:1,fontFamily:"'DM Sans',sans-serif"}}>{c.bandeira&&`${c.bandeira} · `}Fecha dia {c.fechamento} · Vence dia {c.vencimento}</div></div>
                      <div style={{textAlign:"right"}}><div className="num" style={{fontSize:17,fontWeight:700,color:alerta?C.red:TXT}}>{R(usado)}</div><div style={{fontSize:10,color:"rgba(26,18,9,0.85)",fontFamily:"'DM Sans',sans-serif"}}>de {R(+c.limite)}</div></div>
                    </div>
                    <Bar value={usado} max={+c.limite} color={alerta?C.red:C.magenta} h={5}/>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"rgba(26,18,9,0.85)",fontFamily:"'DM Sans',sans-serif",marginTop:4}}><span>{pct.toFixed(0)}%</span>{alerta&&<span style={{color:C.red,fontWeight:700}}>⚠ Limite próximo</span>}<span>Disponível: {R(+c.limite-usado)}</span></div>
                    <div style={{display:"flex",gap:6,marginTop:9}}>
                      <Btn variant="primary" style={{fontSize:10,padding:"5px 11px"}} onClick={()=>openM("ccmov",null,c.id)}>+ Compra</Btn>
                      <Btn variant="secondary" style={{fontSize:10,padding:"5px 9px",color:"#1A1209",background:"rgba(0,0,0,0.07)",border:"1px solid rgba(0,0,0,0.12)"}} onClick={()=>openM("cart",c)}>Editar</Btn>
                      <Btn variant="danger" style={{fontSize:10,padding:"5px 9px"}} onClick={()=>remove(cartoes,setCartoes,c.id)}>Excluir</Btn>
                    </div>
                  </div>
                  {cc.slice(0,4).map(m=>(
                    <div key={m.id} className={CARD} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 12px",marginBottom:5}}>
                      <div style={{fontSize:17}}>{m.categoria.split(" ")[0]}</div>
                      <div style={{flex:1}}><div style={{fontSize:12,fontWeight:500,fontFamily:"'DM Sans',sans-serif",color:TXT}}>{m.descricao}</div><div style={{fontSize:9,color:"rgba(26,18,9,0.85)",fontFamily:"'DM Sans',sans-serif"}}>{fd(m.data)}</div></div>
                      <div className="num" style={{fontSize:12,fontWeight:700,color:C.magenta}}>{R(m.valor)}</div>
                      <button onClick={()=>remove(ccMovs,setCCMovs,m.id)} style={{background:"none",border:"none",color:"rgba(26,18,9,0.55)",fontSize:16,cursor:"pointer",padding:"0 2px"}}>×</button>
                    </div>
                  ))}
                </div>;
              })
            }
          </div>
        )}

        {/* ══ PREVISÃO ══ */}
        {tab==="previsao"&&(
          <div className="fade">
            <div style={{fontSize:22,fontWeight:300,color:TXT,marginBottom:4}}>Previsão — 8 meses</div>
            <div style={{fontSize:12,color:"rgba(26,18,9,0.85)",fontFamily:"'DM Sans',sans-serif",marginBottom:14}}>Plantões agendados + investimentos + histórico</div>
            <div className={CARD} style={{marginBottom:14}}>
              <div style={{display:"flex",alignItems:"flex-end",gap:5,height:110,marginBottom:9}}>
                {forecast.map(f=>{const hE=maxFc>0?(f.entradas/maxFc)*100:0;const hS=maxFc>0?(f.saidas/maxFc)*100:0;const isNow=f.ym===today().slice(0,7);
                  return <div key={f.ym} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                    <div style={{display:"flex",gap:2,alignItems:"flex-end",height:95}}>
                      <div style={{width:9,background:C.green,borderRadius:"3px 3px 0 0",height:`${Math.max(hE,2)}%`,opacity:isNow?1:.6,transition:"height .5s"}}/>
                      <div style={{width:9,background:C.magenta,borderRadius:"3px 3px 0 0",height:`${Math.max(hS,2)}%`,opacity:isNow?1:.6,transition:"height .5s"}}/>
                    </div>
                    <div style={{fontSize:8,color:isNow?TXT:TMUT,fontFamily:"'DM Sans',sans-serif",fontWeight:isNow?700:400}}>{monthLabel(f.ym).split(" ")[0]}</div>
                  </div>;
                })}
              </div>
              <div style={{display:"flex",gap:12,justifyContent:"center"}}>
                <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:8,height:8,borderRadius:2,background:C.green}}/><span style={{fontSize:10,color:"rgba(26,18,9,0.85)",fontFamily:"'DM Sans',sans-serif"}}>Entradas</span></div>
                <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:8,height:8,borderRadius:2,background:C.magenta}}/><span style={{fontSize:10,color:"rgba(26,18,9,0.85)",fontFamily:"'DM Sans',sans-serif"}}>Saídas</span></div>
              </div>
            </div>
            {forecast.map(f=>{const isNow=f.ym===today().slice(0,7);
              return <div key={f.ym} className={CARD} style={{marginBottom:7,background:isNow?"rgba(232,32,95,0.12)":"rgba(255,255,255,0.88)",border:`1px solid ${isNow?"rgba(232,32,95,0.5)":"rgba(255,255,255,0.95)"}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <div style={{fontSize:13,fontWeight:600,fontFamily:"'DM Sans',sans-serif",color:isNow?C.magenta:TXT}}>{monthLabel(f.ym)}{isNow&&<span style={{fontSize:9,marginLeft:6,background:C.magenta,color:"#fff",borderRadius:99,padding:"1px 7px"}}>Atual</span>}</div>
                  <div className="num" style={{fontSize:15,fontWeight:700,color:f.saldo>=0?C.green:C.red}}>{R(f.saldo)}</div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:5}}>
                  {[{l:"Entradas",v:f.entradas,c:C.green},{l:"Saídas",v:f.saidas,c:C.red},{l:"Rendim.",v:f.rendimentos,c:C.gold}].map(r=>(
                    <div key={r.l} style={{background:"rgba(0,0,0,0.05)",borderRadius:7,padding:"6px 8px",textAlign:"center"}}>
                      <div style={{fontSize:8,color:"rgba(26,18,9,0.85)",fontFamily:"'DM Sans',sans-serif",fontWeight:700,letterSpacing:".05em",marginBottom:1}}>{r.l}</div>
                      <div className="num" style={{fontSize:11,fontWeight:700,color:r.c}}>{R(r.v)}</div>
                    </div>
                  ))}
                </div>
              </div>;
            })}
          </div>
        )}

        {/* ══ BALANÇO ══ */}
        {tab==="balanco"&&(
          <div className="fade">
            <BalancoTab movs={movs} plantoes={plantoes} ccMovs={ccMovs} cartoes={cartoes} selMes={selMes}/>
          </div>
        )}

        {/* ══ ORÇAMENTO ══ */}
        {tab==="orcamento"&&(
          <div className="fade">
            <OrcamentoTab movs={movs} plantoes={plantoes} cats={cats} orcamento={orcamento} setOrcamento={setOrcamento} selMes={selMes}/>
          </div>
        )}

        {/* ══ CATEGORIAS ══ */}
        {tab==="categorias"&&(
          <div className="fade">
            <div style={{background:"rgba(255,255,255,0.88)",backdropFilter:"blur(12px)",borderRadius:12,padding:"8px 14px",border:"1px solid rgba(255,255,255,0.95)",fontSize:22,fontWeight:300,color:"#1A1209",marginBottom:14}}>Categorias</div>
            <div className="card">
              <GerenciarCategorias cats={cats} setCats={setCats} onClose={()=>navTo("movimentos")}/>
            </div>
          </div>
        )}

      </div>

      {/* ══ MODAIS ══ */}
      <Modal open={modal==="mov"} onClose={closeM} title="Novo Lançamento">
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{display:"flex",background:"#EDE8E0",borderRadius:12,padding:4,gap:3}}>
            <button onClick={()=>setFMov({...fMov,tipo:"saida",categoria:CATS_OUT[0]})} style={{flex:1,background:fMov.tipo==="saida"?C.magentaDark:"transparent",color:fMov.tipo==="saida"?"#fff":C.modalSub,border:"none",borderRadius:10,padding:"9px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all .15s"}}>▼ Saída</button>
            <button onClick={()=>setFMov({...fMov,tipo:"entrada",categoria:CATS_IN[0]})} style={{flex:1,background:fMov.tipo==="entrada"?"rgba(143,196,58,0.7)":"transparent",color:fMov.tipo==="entrada"?"#fff":C.modalSub,border:"none",borderRadius:10,padding:"9px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all .15s"}}>▲ Entrada</button>
            <button onClick={()=>setFMov({...fMov,tipo:"transferencia",categoria:"🔄 Transferência"})} style={{flex:1,background:fMov.tipo==="transferencia"?"rgba(91,163,212,0.7)":"transparent",color:fMov.tipo==="transferencia"?"#fff":C.modalSub,border:"none",borderRadius:10,padding:"9px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all .15s"}}>🔄 Transfer.</button>
          </div>
          <Inp label="Descrição" placeholder="Ex: Salário, Aluguel..." value={fMov.descricao} onChange={e=>setFMov({...fMov,descricao:e.target.value})}/>
          <G2><Inp label="Valor (R$)" placeholder="0,00" value={fMov.valor} onChange={e=>setFMov({...fMov,valor:e.target.value})}/><Inp label="Data" type="date" value={fMov.data} onChange={e=>setFMov({...fMov,data:e.target.value})}/></G2>
          {fMov.tipo==="transferencia" ? (
            <div style={{background:"rgba(91,163,212,0.1)",border:"1px solid rgba(91,163,212,0.3)",borderRadius:10,padding:"11px 13px",fontSize:13,color:"#1A4A6E",fontFamily:"'DM Sans',sans-serif"}}>
              🔄 Transferência — não conta como gasto nem como receita
            </div>
          ) : (
            <Sel label="Categoria" value={fMov.categoria} onChange={e=>setFMov({...fMov,categoria:e.target.value})}>
              {fMov.tipo==="entrada"
                ? (cats?.receita||DEFAULT_CATS.receita).map(c=><option key={c.id} value={`${c.emoji} ${c.nome}`}>{c.emoji} {c.nome}</option>)
                : (cats?.despesa||DEFAULT_CATS.despesa).map(c=>(
                    <optgroup key={c.id} label={`${c.emoji} ${c.nome}`}>
                      <option value={`${c.emoji} ${c.nome}`}>{c.emoji} {c.nome}</option>
                      {c.subcats.map(s=><option key={s.id} value={`${c.emoji} ${c.nome} · ${s.nome}`}>{c.emoji} {c.nome} · {s.nome}</option>)}
                    </optgroup>
                  ))
              }
            </Sel>
          )}
          <Btn variant="primary" style={{marginTop:4}} onClick={saveMov}>Salvar lançamento</Btn>
        </div>
      </Modal>

      <Modal open={modal==="emp"} onClose={closeM} title={edit?"Editar Empresa":"Nova Empresa"}>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <Inp label="Nome" placeholder="Ex: Hospital São Lucas" value={fEmp.nome} onChange={e=>setFEmp({...fEmp,nome:e.target.value})}/>
          <Inp label="Contato" placeholder="Nome ou telefone" value={fEmp.contato} onChange={e=>setFEmp({...fEmp,contato:e.target.value})}/>
          <G2>
            <Sel label="Prazo padrão" value={fEmp.prazo} onChange={e=>setFEmp({...fEmp,prazo:e.target.value})}>{["15","30","45","60","90"].map(d=><option key={d} value={d}>{d} dias</option>)}</Sel>
            <div><div style={{fontSize:11,fontWeight:600,color:C.modalSub,letterSpacing:".06em",textTransform:"uppercase",marginBottom:5}}>Cor</div><input type="color" style={{background:C.inputBg,border:`1.5px solid ${C.inputBorder}`,borderRadius:10,padding:4,width:"100%",height:44,cursor:"pointer"}} value={fEmp.cor} onChange={e=>setFEmp({...fEmp,cor:e.target.value})}/></div>
          </G2>
          <div style={{display:"flex",gap:8}}>{edit&&<Btn variant="danger" style={{flex:1}} onClick={()=>{remove(empresas,setEmpresas,edit.id);closeM()}}>Excluir</Btn>}<Btn variant="primary" style={{flex:2}} onClick={saveEmp}>Salvar</Btn></div>
        </div>
      </Modal>

      <Modal open={modal==="plt"} onClose={closeM} title={edit?"Editar Plantão":"Novo Plantão"}>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <Sel label="Empresa" value={fPlt.empresa} onChange={e=>setFPlt({...fPlt,empresa:e.target.value})}><option value="">Selecione...</option>{empresas.map(e=><option key={e.id} value={e.nome}>{e.nome}</option>)}<option value="__outro">— Digitar nome —</option></Sel>
          {fPlt.empresa==="__outro"&&<Inp label="Nome" placeholder="Digite o nome" value={fPlt._empManual||""} onChange={e=>setFPlt({...fPlt,_empManual:e.target.value,empresa:e.target.value})}/>}
          <G2><Inp label="Data do plantão" type="date" value={fPlt.data} onChange={e=>setFPlt({...fPlt,data:e.target.value})}/><Sel label="Prazo pgto" value={fPlt.prazo} onChange={e=>setFPlt({...fPlt,prazo:e.target.value})}>{["15","30","45","60","90"].map(d=><option key={d} value={d}>{d} dias</option>)}</Sel></G2>
          <G2><Inp label="Horas" placeholder="Ex: 12" type="number" value={fPlt.horas} onChange={e=>setFPlt({...fPlt,horas:e.target.value})}/><Inp label="R$/hora" placeholder="Ex: 150" type="number" value={fPlt.valorH} onChange={e=>setFPlt({...fPlt,valorH:e.target.value})}/></G2>
          <Inp label="Valor total (R$)" placeholder="Calculado automaticamente" type="number" value={fPlt.valorTotal} onChange={e=>setFPlt({...fPlt,valorTotal:e.target.value})}/>
          <G2><Inp label="Previsão pgto" type="date" value={fPlt.previsao} onChange={e=>setFPlt({...fPlt,previsao:e.target.value})}/><Sel label="Status" value={fPlt.status} onChange={e=>setFPlt({...fPlt,status:e.target.value})}><option value="pendente">Pendente</option><option value="recebido">Recebido</option><option value="cancelado">Cancelado</option></Sel></G2>
          <Inp label="Observações" placeholder="Opcional" value={fPlt.obs} onChange={e=>setFPlt({...fPlt,obs:e.target.value})}/>
          <Btn variant="primary" onClick={savePlt}>Salvar plantão</Btn>
        </div>
      </Modal>

      <Modal open={modal==="inv"} onClose={closeM} title={edit?"Editar Investimento":"Novo Investimento"}>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <Inp label="Nome" placeholder="Ex: CDB Banco C6" value={fInv.nome} onChange={e=>setFInv({...fInv,nome:e.target.value})}/>
          <G2><Sel label="Tipo" value={fInv.tipo} onChange={e=>setFInv({...fInv,tipo:e.target.value})}>{INVEST_T.map(t=><option key={t} value={t}>{t}</option>)}</Sel><Inp label="Banco / Corretora" placeholder="XP, Nu, Itaú..." value={fInv.banco} onChange={e=>setFInv({...fInv,banco:e.target.value})}/></G2>
          <Inp label="Aporte (R$)" placeholder="0,00" value={fInv.aporte} onChange={e=>setFInv({...fInv,aporte:e.target.value})}/>
          <div style={{display:"flex",background:"#EDE8E0",borderRadius:12,padding:4}}>
            {[["fixo","Taxa Fixa"],["cdi","% do CDI"]].map(([v,l])=>(
              <button key={v} onClick={()=>setFInv({...fInv,taxaModo:v})} style={{flex:1,background:fInv.taxaModo===v?"#E8205F":"transparent",color:fInv.taxaModo===v?"#fff":"#5A4A3A",border:"none",borderRadius:10,padding:"9px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",transition:"all .15s"}}>{l}</button>
            ))}
          </div>
          {fInv.taxaModo==="cdi" ? (
            <div>
              <Inp label="% do CDI" placeholder="Ex: 102" value={fInv.percCDI} onChange={e=>setFInv({...fInv,percCDI:e.target.value})}/>
              <div style={{fontSize:11,color:C.modalSub,fontFamily:"'DM Sans',sans-serif",marginTop:5}}>
                {cdiAtual ? <>CDI hoje: <strong style={{color:"#2D5A10"}}>{cdiAtual.toFixed(2)}% a.a.</strong> · rende ≈ <strong style={{color:"#2D5A10"}}>{fInv.percCDI?(cdiAtual*(+fInv.percCDI)/100).toFixed(2):"—"}% a.a.</strong></> : "Buscando CDI atual..."}
              </div>
            </div>
          ) : (
            <Inp label="Taxa a.a. (%)" placeholder="Ex: 12.5" value={fInv.taxa} onChange={e=>setFInv({...fInv,taxa:e.target.value})}/>
          )}
          <Inp label="Data início" type="date" value={fInv.data} onChange={e=>setFInv({...fInv,data:e.target.value})}/>
          <Inp label="Observações" placeholder="Opcional" value={fInv.obs} onChange={e=>setFInv({...fInv,obs:e.target.value})}/>
          <Btn variant="primary" onClick={saveInv}>Salvar</Btn>
        </div>
      </Modal>

      <Modal open={modal==="obj"} onClose={closeM} title={edit?"Editar Objetivo":"Novo Objetivo"}>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <Inp label="Nome" placeholder="Ex: Viagem França..." value={fObj.nome} onChange={e=>setFObj({...fObj,nome:e.target.value})}/>
          <G2><Inp label="Meta (R$)" placeholder="0,00" value={fObj.meta} onChange={e=>setFObj({...fObj,meta:e.target.value})}/><Inp label="Já tenho (R$)" placeholder="0,00" value={fObj.atual} onChange={e=>setFObj({...fObj,atual:e.target.value})}/></G2>
          <Sel label="Guardado em qual investimento?" value={fObj.investId} onChange={e=>setFObj({...fObj,investId:e.target.value})}>
            <option value="">Nenhum (sem vínculo)</option>
            {invests.map(i=><option key={i.id} value={i.id}>{i.nome}{i.banco?" · "+i.banco:""}{i.taxa?" · "+i.taxa+"% a.a.":""}</option>)}
          </Sel>
          {invests.length===0&&<div style={{fontSize:11,color:C.modalSub,fontFamily:"'DM Sans',sans-serif"}}>Cadastre um investimento primeiro para vincular.</div>}
          <G2><Inp label="Prazo" type="date" value={fObj.prazo} onChange={e=>setFObj({...fObj,prazo:e.target.value})}/><div><div style={{fontSize:11,fontWeight:600,color:C.modalSub,letterSpacing:".06em",textTransform:"uppercase",marginBottom:5}}>Cor</div><input type="color" style={{background:C.inputBg,border:`1.5px solid ${C.inputBorder}`,borderRadius:10,padding:4,width:"100%",height:44,cursor:"pointer"}} value={fObj.cor} onChange={e=>setFObj({...fObj,cor:e.target.value})}/></div></G2>
          <Inp label="Observações" placeholder="Opcional" value={fObj.obs} onChange={e=>setFObj({...fObj,obs:e.target.value})}/>
          <Btn variant="primary" onClick={saveObj}>Salvar</Btn>
        </div>
      </Modal>

      <Modal open={modal==="aporte"} onClose={closeM} title="Registrar Aporte">
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{fontSize:14,color:C.modalSub,fontFamily:"'DM Sans',sans-serif"}}>Objetivo: <strong style={{color:C.modalText}}>{objetivos.find(o=>o.id===extra)?.nome}</strong></div>
          <Inp label="Valor (R$)" placeholder="0,00" value={fAporte.valor} onChange={e=>setFAporte({...fAporte,valor:e.target.value})} autoFocus/>
          <Inp label="Data" type="date" value={fAporte.data} onChange={e=>setFAporte({...fAporte,data:e.target.value})}/>
          <Btn variant="green" onClick={saveAporte}>Confirmar aporte</Btn>
        </div>
      </Modal>

      <Modal open={modal==="div"} onClose={closeM} title={edit?"Editar Dívida":"Nova Dívida"}>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{display:"flex",background:"#EDE8E0",borderRadius:12,padding:4}}>
            {[["ativa","💳 Dívida Ativa"],["fundo","🏦 Fundo de Dívida"]].map(([v,l])=>(
              <button key={v} onClick={()=>setFDiv({...fDiv,tipo:v})} style={{flex:1,background:(fDiv.tipo||"ativa")===v?(v==="fundo"?"rgba(255,179,71,0.8)":"#E8205F"):"transparent",color:(fDiv.tipo||"ativa")===v?"#fff":"#5A4A3A",border:"none",borderRadius:10,padding:"9px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",transition:"all .15s"}}>{l}</button>
            ))}
          </div>
          <Inp label="Credor" placeholder="Ex: Banco Itaú..." value={fDiv.credor} onChange={e=>setFDiv({...fDiv,credor:e.target.value})}/>
          <G2><Inp label="Total (R$)" placeholder="0,00" value={fDiv.total} onChange={e=>setFDiv({...fDiv,total:e.target.value})}/><Inp label="Já pago (R$)" placeholder="0,00" value={fDiv.pago} onChange={e=>setFDiv({...fDiv,pago:e.target.value})}/></G2>
          {(fDiv.tipo||"ativa")==="fundo"&&(
            <>
              <Sel label="Guardado em qual investimento?" value={fDiv.investId||""} onChange={e=>setFDiv({...fDiv,investId:e.target.value})}>
                <option value="">Nenhum (sem vínculo)</option>
                {invests.map(i=><option key={i.id} value={i.id}>{i.nome}{i.banco?" · "+i.banco:""}{i.taxa?" · "+i.taxa+"% a.a.":""}</option>)}
              </Sel>
              {invests.length===0&&<div style={{fontSize:11,color:C.modalSub,fontFamily:"'DM Sans',sans-serif"}}>Cadastre um investimento primeiro para vincular.</div>}
            </>
          )}
          <G2><Inp label="Prazo" type="date" value={fDiv.prazo} onChange={e=>setFDiv({...fDiv,prazo:e.target.value})}/><Inp label="Parcelas" placeholder="Ex: 12x de R$500" value={fDiv.parcelas} onChange={e=>setFDiv({...fDiv,parcelas:e.target.value})}/></G2>
          <Inp label="Observações" placeholder="Opcional" value={fDiv.obs} onChange={e=>setFDiv({...fDiv,obs:e.target.value})}/>
          <Btn variant="primary" onClick={saveDiv}>Salvar</Btn>
        </div>
      </Modal>

      <Modal open={modal==="pgto"} onClose={closeM} title="Registrar Pagamento">
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{fontSize:14,color:C.modalSub,fontFamily:"'DM Sans',sans-serif"}}>Dívida: <strong style={{color:C.modalText}}>{dividas.find(d=>d.id===extra)?.credor}</strong></div>
          <Inp label="Valor pago (R$)" placeholder="0,00" value={fPgto.valor} onChange={e=>setFPgto({...fPgto,valor:e.target.value})} autoFocus/>
          <Inp label="Data" type="date" value={fPgto.data} onChange={e=>setFPgto({...fPgto,data:e.target.value})}/>
          <Btn variant="green" onClick={savePgto}>Confirmar pagamento</Btn>
        </div>
      </Modal>

      <Modal open={modal==="cart"} onClose={closeM} title={edit?"Editar Cartão":"Novo Cartão"}>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <Inp label="Nome" placeholder="Ex: Nubank, Inter Gold..." value={fCart.nome} onChange={e=>setFCart({...fCart,nome:e.target.value})}/>
          <G2><Inp label="Bandeira" placeholder="Visa, Master, Elo..." value={fCart.bandeira} onChange={e=>setFCart({...fCart,bandeira:e.target.value})}/><Inp label="Limite (R$)" placeholder="0,00" value={fCart.limite} onChange={e=>setFCart({...fCart,limite:e.target.value})}/></G2>
          <G2><Inp label="Fecha dia" placeholder="Ex: 25" value={fCart.fechamento} onChange={e=>setFCart({...fCart,fechamento:e.target.value})}/><Inp label="Vence dia" placeholder="Ex: 5" value={fCart.vencimento} onChange={e=>setFCart({...fCart,vencimento:e.target.value})}/></G2>
          <div style={{display:"flex",gap:8}}>{edit&&<Btn variant="danger" style={{flex:1}} onClick={()=>{remove(cartoes,setCartoes,edit.id);closeM()}}>Excluir</Btn>}<Btn variant="primary" style={{flex:2}} onClick={saveCart}>Salvar</Btn></div>
        </div>
      </Modal>

      <Modal open={modal==="ccmov"} onClose={closeM} title="Lançar Compra no Cartão">
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <Sel label="Cartão" value={fCCMov.cartao} onChange={e=>setFCCMov({...fCCMov,cartao:e.target.value})}><option value="">Selecione...</option>{cartoes.map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}</Sel>
          <Inp label="Descrição" placeholder="Ex: Farmácia, Restaurante..." value={fCCMov.descricao} onChange={e=>setFCCMov({...fCCMov,descricao:e.target.value})}/>
          <G2><Inp label="Valor (R$)" placeholder="0,00" value={fCCMov.valor} onChange={e=>setFCCMov({...fCCMov,valor:e.target.value})}/><Inp label="Data" type="date" value={fCCMov.data} onChange={e=>setFCCMov({...fCCMov,data:e.target.value})}/></G2>
          <Sel label="Categoria" value={fCCMov.categoria} onChange={e=>setFCCMov({...fCCMov,categoria:e.target.value})}>{CATS_OUT.map(c=><option key={c} value={c}>{c}</option>)}</Sel>
          <Btn variant="primary" onClick={saveCCMov}>Salvar compra</Btn>
        </div>
      </Modal>

      <ImportacaoModal open={importOpen} onClose={()=>setImportOpen(false)} onImport={importarMovs} cats={cats}/>
      <Modal open={modal==="saldoini"} onClose={closeM} title="Saldo Inicial">
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{fontSize:13,color:"#5A4A3A",fontFamily:"'DM Sans',sans-serif",lineHeight:1.5}}>
            Defina a data e o valor que você tinha na conta naquele momento. O app vai calcular tudo a partir daí.
          </div>
          <G2>
            <div>
              <div style={{fontSize:11,fontWeight:600,color:"#5A4A3A",letterSpacing:".06em",textTransform:"uppercase",marginBottom:5}}>Mês de referência</div>
              <input type="month" value={saldoIni.data} onChange={e=>setSaldoIni({...saldoIni,data:e.target.value})}
                style={{background:"#F5F0E8",border:"1.5px solid #DDD5C8",borderRadius:10,padding:"11px 13px",color:"#1A1209",fontSize:14,outline:"none",width:"100%",fontFamily:"inherit"}}/>
            </div>
            <Inp label="Valor que tinha (R$)" type="text" inputMode="decimal" placeholder="0,00" value={saldoIni.valor}
              onChange={e=>setSaldoIni({...saldoIni,valor:e.target.value.replace(",",".")})}/>
          </G2>
          <div style={{background:"rgba(91,163,212,0.1)",border:"1px solid rgba(91,163,212,0.3)",borderRadius:10,padding:"10px 14px",fontSize:12,color:"#1A4A6E",fontFamily:"'DM Sans',sans-serif",lineHeight:1.5}}>
            💡 Exemplo: se em março você tinha R$500 no banco, coloque Mês = Mar 2026 e Valor = 500. O app soma esse valor com tudo que entrou e saiu a partir de março.
          </div>
          <Btn variant="primary" onClick={closeM}>Salvar</Btn>
        </div>
      </Modal>
      <AlocacaoModal open={!!movDist} onClose={()=>setMovDist(null)}
        plantao={movDist?{...movDist,empresa:movDist.descricao,valorTotal:movDist.valor}:null}
        regras={regras} invests={invests} objetivos={objetivos} dividas={dividas}
        onConfirm={alocs=>{
          confirmarDistribuicao({...movDist,empresa:movDist.descricao,valorTotal:movDist.valor,id:movDist.id+"_dist"},alocs,true);
          setMovDist(null);
        }}/>
      <RegrasModal open={modal==="regras"} onClose={closeM} regras={regras} setRegras={setRegras} invests={invests} objetivos={objetivos} dividas={dividas}/>
      <AlocacaoModal open={!!pltDist} onClose={()=>setPltDist(null)} plantao={pltDist} regras={regras} invests={invests} objetivos={objetivos} dividas={dividas} onConfirm={(alocs)=>confirmarDistribuicao(pltDist,alocs,false)}/>
    </div>
  );
}