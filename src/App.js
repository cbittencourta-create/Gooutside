import React, { useState, useEffect, useMemo, useRef } from "react";

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
const addMonths = (ds,n) => { const d=new Date(ds+"T12:00:00"); d.setMonth(d.getMonth()+n); return d.toISOString().slice(0,10); };
const daysUntil = ds => ds ? Math.ceil((new Date(ds+"T12:00:00")-new Date())/86400000) : null;
const isPast = ds => ds && new Date(ds+"T23:59:59")<new Date();
const monthKey = ds => ds ? ds.slice(0,7) : "";
const months8 = () => { const a=[]; const d=new Date(); for(let i=0;i<8;i++){const dd=new Date(d);dd.setMonth(dd.getMonth()+i);a.push(dd.toISOString().slice(0,7));} return a; };
const monthLabel = ym => { const [y,m]=ym.split("-"); return ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"][+m-1]+" "+y.slice(2); };
const shiftMonth = (ym,n) => { const [y,m]=ym.split("-").map(Number); const d=new Date(y,m-1+n,1); return d.toISOString().slice(0,7); };
const uid = () => Date.now()+Math.random().toString(36).slice(2);
const CATS_OUT = ["🍔 Alimentação","🚗 Transporte","🏠 Moradia","💊 Saúde","🎭 Lazer","👕 Vestuário","📚 Educação","💡 Contas","📦 Outros"];
const CATS_IN  = ["🏥 Plantão","💼 Consultório","🎓 Ensino","💰 Investimento","🎁 Presente","📦 Outros"];
const INVEST_T = ["CDB","LCI/LCA","Tesouro Direto","Ações","FIIs","Fundo de Investimento","Poupança","Previdência","Criptomoedas","Outro"];

const INVEST_CATEGORIAS = [
  {id:"fixa",     label:"Renda Fixa",     tipos:["CDB","LCI/LCA","Tesouro Direto","Poupança","Previdência"]},
  {id:"variavel", label:"Renda Variável", tipos:["Ações","Criptomoedas"]},
  {id:"fundos",   label:"Fundos",         tipos:["FIIs","Fundo de Investimento"]},
  {id:"outros",   label:"Outros",         tipos:["Outro"]},
];

function categoriaDoInvest(tipo) {
  const cat = INVEST_CATEGORIAS.find(c=>c.tipos.includes(tipo));
  return cat ? cat.id : "outros";
}

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
    <select className="filter-select" style={{background:C.inputBg,border:`1.5px solid ${C.inputBorder}`,borderRadius:10,padding:"11px 30px 11px 13px",color:C.modalText,fontSize:14,outline:"none",width:"100%",fontFamily:"inherit",cursor:"pointer"}} {...p}>{children}</select>
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
      <div className="card" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,padding:"16px 18px"}}>
        <div>
          <div style={{fontSize:22,fontWeight:300,color:"#1A1209"}}>{monthLabel(selMes)}</div>
          <div style={{fontSize:11,color:"#3D3226",fontFamily:"'DM Sans',sans-serif",marginTop:1,fontWeight:600}}>📊 Planejamento orçamentário</div>
        </div>
      </div>

      {/* Resumo */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:14}}>
        {[
          {l:"Planejado",v:totalPlanejado,c:"#C4185A"},
          {l:"Realizado",v:totalGasto,c:"#D4443A"},
          {l:"Saldo",v:totalPlanejado-totalGasto,c:totalPlanejado-totalGasto>=0?"#2D6E20":"#D4443A"},
        ].map(x=>(
          <div key={x.l} className="card" style={{padding:"14px 12px",textAlign:"center"}}>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",color:"#1A1209",fontFamily:"'DM Sans',sans-serif",marginBottom:5}}>{x.l}</div>
            <div className="num" style={{fontSize:16,fontWeight:700,color:x.c,letterSpacing:"-.01em"}}>{R(x.v)}</div>
          </div>
        ))}
      </div>

      {/* Toggle % */}
      <div style={{display:"flex",background:"rgba(255,255,255,0.9)",borderRadius:12,padding:3,marginBottom:14,border:"1px solid rgba(0,0,0,0.1)",boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
        <button onClick={()=>setViewMode("planejado")}
          style={{flex:1,background:viewMode==="planejado"?"#E8205F":"transparent",color:viewMode==="planejado"?"#fff":"#1A1209",border:"none",borderRadius:10,padding:"9px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",transition:"all .15s"}}>
          % do Planejado
        </button>
        <button onClick={()=>setViewMode("recebimento")}
          style={{flex:1,background:viewMode==="recebimento"?"#E8205F":"transparent",color:viewMode==="recebimento"?"#fff":"#1A1209",border:"none",borderRadius:10,padding:"9px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",transition:"all .15s"}}>
          % do Recebimento Previsto
        </button>
      </div>

      {viewMode==="recebimento"&&recebimentoPrevMes===0&&(
        <div style={{background:"rgba(212,168,67,0.25)",border:"1px solid rgba(212,168,67,0.5)",borderRadius:10,padding:"11px 14px",marginBottom:12,fontSize:12.5,color:"#6B4C00",fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>
          ⚠ Nenhum plantão com previsão para {monthLabel(selMes)}. Cadastre plantões para ver a % do recebimento.
        </div>
      )}

      {viewMode==="recebimento"&&recebimentoPrevMes>0&&(
        <div style={{background:"rgba(168,224,99,0.22)",border:"1px solid rgba(143,196,58,0.5)",borderRadius:10,padding:"11px 14px",marginBottom:12,fontSize:12.5,color:"#215010",fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>
          Base: {R(recebimentoPrevMes)} previstos para {monthLabel(selMes)}
        </div>
      )}

      {/* Tabela por categoria */}
      <div className="card" style={{padding:"16px 14px"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 82px 82px 52px",gap:8,marginBottom:10,paddingBottom:10,borderBottom:"2px solid rgba(0,0,0,0.1)"}}>
          {["Categoria","Planejado","Realizado","%"].map(h=>(
            <div key={h} style={{fontSize:10.5,fontWeight:700,color:"#1A1209",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif",textAlign:h!=="Categoria"?"right":"left"}}>{h}</div>
          ))}
        </div>
        {categorias.map((c,idx)=>{
          const gasto = gastosPorCat[`${c.emoji} ${c.nome}`] || 
                        Object.entries(gastosPorCat).filter(([k])=>k.includes(c.nome)).reduce((s,[,v])=>s+v,0);
          const plan = orcamento[selMes]?.[c.id] || 0;
          const base = viewMode==="recebimento" ? recebimentoPrevMes : plan;
          const pct = base>0 ? (gasto/base*100) : 0;
          const over = plan>0 && gasto>plan;
          return (
            <div key={c.id} style={{display:"grid",gridTemplateColumns:"1fr 82px 82px 52px",gap:8,alignItems:"center",padding:"10px 6px",marginBottom:2,background:idx%2===0?"rgba(0,0,0,0.025)":"transparent",borderRadius:8}}>
              <div>
                <div style={{fontSize:14,fontWeight:600,color:"#1A1209",fontFamily:"'DM Sans',sans-serif"}}>{c.emoji} {c.nome}</div>
                <div style={{marginTop:5}}>
                  <div style={{background:"rgba(0,0,0,0.15)",borderRadius:99,height:9,overflow:"hidden"}}>
                    <div style={{width:`${pct>0?Math.max(Math.min(pct,100),4):0}%`,height:"100%",background:over?"#E8331F":"#2E9A12",borderRadius:99,transition:"width .5s",boxShadow:pct>0?`0 0 4px ${over?"#E8331F":"#2E9A12"}66`:"none"}}/>
                  </div>
                </div>
              </div>
              <div style={{textAlign:"right"}}>
                {editCat===c.id ? (
                  <input type="number" value={editVal} onChange={e=>setEditVal(e.target.value)}
                    onBlur={()=>{setOrcamento({...orcamento,[selMes]:{...(orcamento[selMes]||{}),[c.id]:+editVal}});setEditCat(null);}}
                    onKeyDown={e=>e.key==="Enter"&&(setOrcamento({...orcamento,[selMes]:{...(orcamento[selMes]||{}),[c.id]:+editVal}}),setEditCat(null))}
                    autoFocus style={{background:"#F5F0E8",border:"1.5px solid #DDD5C8",borderRadius:6,padding:"4px 7px",width:75,fontSize:12,color:"#1A1209",outline:"none",textAlign:"right",fontFamily:"inherit"}}/>
                ) : plan>0 ? (
                  <button onClick={()=>{setEditCat(c.id);setEditVal(plan||"");}}
                    style={{background:"none",border:"none",color:"#1A1209",fontSize:12.5,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:700}}>
                    {R(plan)}
                  </button>
                ) : (
                  <button onClick={()=>{setEditCat(c.id);setEditVal(plan||"");}}
                    style={{background:"rgba(232,32,95,0.12)",border:"1px solid rgba(232,32,95,0.3)",borderRadius:8,color:"#C4185A",fontSize:10.5,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:700,padding:"4px 9px"}}>
                    + planejar
                  </button>
                )}
              </div>
              <div style={{textAlign:"right",fontSize:12.5,color:"#3D3226",fontFamily:"'DM Sans',sans-serif",fontWeight:700}}>{R(gasto)}</div>
              <div style={{textAlign:"right",fontSize:12.5,fontWeight:700,color:over?"#B01818":pct>80?"#8B5A00":"#215010",fontFamily:"'DM Sans',sans-serif"}}>{over&&"⚠"}{pct.toFixed(0)}%</div>
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

function BalancoTab({movs, plantoes, cartoes, selMes}) {
  // Últimos 12 meses relativos ao mês sendo visualizado (não a hoje)
  const meses = Array.from({length:12},(_,i)=>shiftMonth(selMes,i-11));

  const dataLinha = meses.map(ym=>({
    ym,
    label: monthLabel(ym).split(" ")[0],
    ent: movs.filter(m=>m.tipo==="entrada"&&monthKey(m.data)===ym).reduce((s,m)=>s+m.valor,0),
    sai: movs.filter(m=>m.tipo==="saida"&&monthKey(m.data)===ym).reduce((s,m)=>s+m.valor,0),
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
    const usado = movs.filter(m=>m.formaPagamento==="cartao"&&m.cartaoId===c.id&&monthKey(m.data)===selMes).reduce((s,m)=>s+m.valor,0);
    const pct = c.limite>0 ? usado/c.limite*100 : 0;
    return {...c, usado, pct};
  }).filter(c=>c.usado>0).sort((a,b)=>b.pct-a.pct);

  // Receitas/Despesas do mês selecionado — direto dos movs, sem depender da janela do gráfico
  const entM = movs.filter(m=>m.tipo==="entrada"&&monthKey(m.data)===selMes).reduce((s,m)=>s+m.valor,0);
  const saiM = movs.filter(m=>m.tipo==="saida"&&monthKey(m.data)===selMes).reduce((s,m)=>s+m.valor,0);

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
                          className="plt-select"
                          style={{fontSize:10,border:"1px solid rgba(0,0,0,0.12)",borderRadius:6,padding:"1px 4px",background:"transparent",color:t.tipo==="entrada"?"#2D5A10":t.tipo==="transferencia"?"#5BA3D4":"#8B1A1A",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                          <option value="entrada">↑ Entrada</option>
                          <option value="saida">↓ Saída</option>
                          <option value="transferencia">🔄 Transfer.</option>
                        </select>
                        <select value={t.categoria} onChange={e=>setTxns(txns.map((x,j)=>j===i?{...x,categoria:e.target.value}:x))}
                          className="plt-select"
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
  const [minimizado, setMinimizado] = useState(false);

  if(minimizado){
    return (
      <div onClick={()=>setMinimizado(false)}
        style={{position:"fixed",bottom:24,right:24,zIndex:40,display:window.innerWidth>1300?"flex":"none",alignItems:"center",gap:8,background:"linear-gradient(135deg,#EFE8DC,#E6DDCE)",borderRadius:99,padding:"10px 16px 10px 12px",boxShadow:"0 6px 20px rgba(0,0,0,0.25)",cursor:"pointer",border:"1px solid rgba(0,0,0,0.08)"}}>
        <div style={{width:26,height:26,borderRadius:8,background:"linear-gradient(135deg,#C4202E,#8E1620)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>📝</div>
        <span style={{fontSize:12,fontWeight:700,color:"#3A2F22",fontFamily:"'DM Sans',sans-serif"}}>Notas</span>
      </div>
    );
  }

  return (
    <div style={{position:"fixed",top:150,right:24,width:280,zIndex:40,display:window.innerWidth>1300?"block":"none"}}>
      <div style={{position:"relative"}}>
        <div style={{position:"absolute",top:10,left:20,width:240,height:280,background:"#A31621",transform:"rotate(-4deg)",borderRadius:4,boxShadow:"0 8px 24px rgba(0,0,0,0.3)"}}/>
        <div style={{position:"relative",background:"linear-gradient(135deg,#EFE8DC,#E6DDCE)",borderRadius:"2px 2px 6px 6px",transform:"rotate(2deg)",boxShadow:"0 10px 28px rgba(0,0,0,0.28)",padding:"24px 16px 16px",minHeight:280}}>
          <div style={{position:"absolute",top:-14,right:34,width:18,height:22,border:"3px solid #8a8580",borderRadius:"50% 50% 0 0",borderBottom:"none",background:"transparent",zIndex:2}}/>
          <div style={{position:"absolute",top:-10,right:22,width:40,height:20,background:"linear-gradient(135deg,#C4202E,#8E1620)",borderRadius:3,boxShadow:"0 3px 8px rgba(0,0,0,0.35)",zIndex:3}}/>
          <button onClick={()=>setMinimizado(true)} style={{position:"absolute",top:6,left:6,width:22,height:22,borderRadius:7,background:"rgba(0,0,0,0.08)",border:"none",color:"#3A2F22",fontSize:14,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1,zIndex:4}}>−</button>
          <textarea
            value={value}
            onChange={e=>onChange(e.target.value)}
            placeholder="Notas rápidas..."
            style={{width:"100%",minHeight:250,background:"transparent",border:"none",outline:"none",resize:"none",fontFamily:"'DM Sans',sans-serif",fontSize:13,lineHeight:1.6,color:"#3A2F22"}}
          />
        </div>
      </div>
    </div>
  );
}


// ── Mascote Sol de Ouro ────────────────────────────────────────────────────
function PatoMascote({progresso, alerta, relaxado, morto, correndo, onClickMorto, feedTrigger, totalAlimentado}) {
  const [piscando, setPiscando] = useState(false);
  const [falando, setFalando] = useState(false);
  const [bounce, setBounce] = useState(false);
  const [alimentando, setAlimentando] = useState(null); // {valor} enquanto mostra a animação
  const prevProgresso = useRef(progresso);
  const prevFeedId = useRef(null);

  useEffect(()=>{
    const blink = ()=>{ setPiscando(true); setTimeout(()=>setPiscando(false), 160); };
    const interval = setInterval(blink, 3400 + Math.random()*2000);
    return ()=>clearInterval(interval);
  },[]);

  useEffect(()=>{
    if(progresso>prevProgresso.current+0.5){
      setBounce(true);
      const t=setTimeout(()=>setBounce(false), 900);
      return ()=>clearTimeout(t);
    }
    prevProgresso.current=progresso;
  },[progresso]);

  useEffect(()=>{
    if(feedTrigger&&feedTrigger.id!==prevFeedId.current){
      prevFeedId.current=feedTrigger.id;
      setAlimentando({valor:feedTrigger.valor});
      setBounce(true);
      const t1=setTimeout(()=>setBounce(false), 900);
      const t2=setTimeout(()=>setAlimentando(null), 1800);
      return ()=>{clearTimeout(t1);clearTimeout(t2);};
    }
  },[feedTrigger]);

  const pct = Math.max(0, Math.min(100, progresso));
  const stage = pct>=100?5 : pct>=75?4 : pct>=50?3 : pct>=25?2 : pct>=5?1 : 0;

  // droop: 1 = pescoço bem caído (triste), 0 = pescoço ereto (feliz)
  const droopBase = alerta ? 1 : [1, 0.78, 0.52, 0.28, 0.1, 0][stage];
  const droop = morto ? 1 : relaxado&&!alerta ? 0.05 : droopBase;
  const corCorpo   = morto ? "#DDDAD2" : alerta ? "#DCD4C0" : "#F8F2E4";
  const corSombra  = morto ? "#C4C0B6" : alerta ? "#C0B698" : "#E8DCC0";
  const corBico    = morto ? "#B8A888" : alerta ? "#C89058" : "#F0A050";
  const corBicoEsc = morto ? "#988870" : alerta ? "#A87840" : "#D87830";
  const temCoroa = stage===5 && !alerta && !morto;
  const relaxAtivo = relaxado && !alerta && !morto && stage<5;
  const correndoAtivo = correndo && !morto && !relaxAtivo;

  const cx=100;
  const bodyCy=158, bodyRx=46, bodyRy=40;
  const neckBaseX=100, neckBaseY=122;
  const headX = 100 + droop*38;
  const headY = 76 + droop*46;
  const headR = 27;
  const ctrlX = (neckBaseX+headX)/2 + droop*26;
  const ctrlY = (neckBaseY+headY)/2 - droop*6;
  const neckPath = `M ${neckBaseX-15} ${neckBaseY} Q ${ctrlX-15} ${ctrlY} ${headX-headR*0.55} ${headY+headR*0.4}
                     L ${headX+headR*0.55} ${headY+headR*0.4} Q ${ctrlX+15} ${ctrlY} ${neckBaseX+15} ${neckBaseY} Z`;

  const bicoAngle = droop>0.4 ? 0.9 : 0.15;
  const bicoLen = 24;
  const bicoBaseX = headX + Math.cos(bicoAngle)*headR*0.85;
  const bicoBaseY = headY + Math.sin(bicoAngle)*headR*0.85;
  const bicoTipX = headX + Math.cos(bicoAngle)*(headR*0.85+bicoLen);
  const bicoTipY = headY + Math.sin(bicoAngle)*(headR*0.85+bicoLen);

  const olhoFechado = !morto && (droop>0.65 || piscando);
  const olhoY = headY - 4;
  const mostrarBochecha = !morto && droop<0.5;
  const mostrarCilios = !morto && !olhoFechado && !relaxAtivo;

  const mensagens = morto
    ? ["Quá... eu não aguentei esse mês 💀 vê o relatório"]
    : alerta
    ? ["Quá... gastos passaram do orçamento esse mês 😟"]
    : correndoAtivo
    ? ["QUÁ QUÁ QUÁ! Muita saída esse mês, corre pra ver os gastos! 😱"]
    : relaxAtivo
    ? ["Quá~ vida boa, pagando dívidas e tudo em dia 😎🍹"]
    : [
        "Quá? Vamos alimentar meus objetivos? 🌱",
        "Ainda meio molinho, mas animado!",
        "Já tô de pescoço mais durinho!",
        "Olha meu pescoço reto! Continue assim!",
        "Quase ganhando minha coroa de girassol!",
        "Ganhei minha coroa! Quá quá! 🌻",
      ];

  const handleClick = () => {
    if(morto && onClickMorto){ onClickMorto(); return; }
    setFalando(f=>!f);
  };

  return (
    <div style={{position:"fixed",top:150,left:24,zIndex:40,display:window.innerWidth>1300?"flex":"none",flexDirection:"column",alignItems:"center",gap:8}}>
      <div onClick={handleClick}
        style={{position:"relative",cursor:"pointer",transform:morto?"rotate(18deg)":bounce?"scale(1.15)":"scale(1)",transition:"transform .35s cubic-bezier(.34,1.56,.64,1)",animation:morto?"none":correndoAtivo?"patoPanico 0.5s ease-in-out infinite":"patoBreathe 3.4s ease-in-out infinite"}}>
        <svg width="170" height="190" viewBox="0 0 220 220" style={{overflow:"visible"}}>
          {/* boia rosa (só no estado relaxado) */}
          {relaxAtivo&&(
            <g>
              <ellipse cx={cx+10} cy={bodyCy+bodyRy+2} rx={62} ry={30} fill="#F582AC"/>
              <ellipse cx={cx+10} cy={bodyCy+bodyRy+2} rx={62} ry={30} fill="none" stroke="#E8548A" strokeWidth={3}/>
              <ellipse cx={cx+10} cy={bodyCy+bodyRy+2} rx={38} ry={16} fill="#5BA3D4" opacity={0.55}/>
            </g>
          )}
          {/* asa (normal ou espalhada quando correndo/alarmado) */}
          {correndoAtivo ? (
            <g className="patoAsaFlap">
              <path d={`M ${cx-bodyRx+4} ${bodyCy-10} Q ${cx-bodyRx-46} ${bodyCy-30} ${cx-bodyRx-38} ${bodyCy+2} Q ${cx-bodyRx-10} ${bodyCy+6} ${cx-bodyRx+6} ${bodyCy-4} Z`} fill={corSombra}/>
              <path d={`M ${cx+bodyRx-4} ${bodyCy-10} Q ${cx+bodyRx+46} ${bodyCy-30} ${cx+bodyRx+38} ${bodyCy+2} Q ${cx+bodyRx+10} ${bodyCy+6} ${cx+bodyRx-6} ${bodyCy-4} Z`} fill={corSombra}/>
            </g>
          ) : (
            <path d={`M ${cx-bodyRx+8} ${bodyCy-6} Q ${cx-bodyRx-14} ${bodyCy+14} ${cx-bodyRx+4} ${bodyCy+30} Q ${cx-bodyRx+18} ${bodyCy+18} ${cx-bodyRx+8} ${bodyCy-6} Z`} fill={corSombra} opacity={0.9}/>
          )}
          {/* corpo */}
          <ellipse cx={cx} cy={bodyCy} rx={bodyRx} ry={bodyRy} fill={corCorpo}/>
          <ellipse cx={cx} cy={bodyCy+bodyRy*0.35} rx={bodyRx*0.75} ry={bodyRy*0.55} fill={corSombra} opacity={0.45}/>
          {/* pés (escondidos na boia se relaxado) */}
          {!relaxAtivo&&(
            <>
              <path d={`M ${cx-14} ${bodyCy+bodyRy-2} L ${cx-20} ${bodyCy+bodyRy+12} L ${cx-8} ${bodyCy+bodyRy+10} Z`} fill={corBico}/>
              <path d={`M ${cx+14} ${bodyCy+bodyRy-2} L ${cx+20} ${bodyCy+bodyRy+12} L ${cx+8} ${bodyCy+bodyRy+10} Z`} fill={corBico}/>
            </>
          )}
          {/* copo de drinque (só relaxado) */}
          {relaxAtivo&&(
            <g transform={`translate(${cx+52},${bodyCy-18})`}>
              <line x1="0" y1="-2" x2="0" y2="18" stroke="#C9C9D8" strokeWidth={2}/>
              <ellipse cx="0" cy="20" rx="10" ry="3" fill="#C9C9D8" opacity={0.7}/>
              <path d="M -12 -30 L 12 -30 L 4 -2 L -4 -2 Z" fill="#FFA940" opacity={0.9}/>
              <path d="M -12 -30 L 12 -30 L 10 -22 L -10 -22 Z" fill="#FFC470"/>
              <line x1="-3" y1="-38" x2="3" y2="-20" stroke="#E8548A" strokeWidth={2.4} strokeLinecap="round"/>
              <line x1="3" y1="-38" x2="-3" y2="-20" stroke="#fff" strokeWidth={2.4} strokeLinecap="round"/>
              <path d="M 8 -32 Q 18 -32 16 -22 Q 10 -24 8 -32 Z" fill="#FFB020"/>
            </g>
          )}
          {/* pescoço */}
          <path d={neckPath} fill={corCorpo}/>
          {/* cabeça */}
          <circle cx={headX} cy={headY} r={headR} fill={corCorpo}/>
          {/* coroa de girassol (só no 100%) */}
          {temCoroa&&(
            <g transform={`translate(${headX},${headY-headR+4})`}>
              {Array.from({length:10},(_,i)=>{
                const a=(i/10)*360;
                const rad=a*Math.PI/180;
                const px=Math.cos(rad)*15, py=Math.sin(rad)*7-2;
                return <ellipse key={i} cx={px} cy={py} rx={7} ry={4.2} fill="#FFC420" stroke="#E8A800" strokeWidth={0.6} transform={`rotate(${a} ${px} ${py})`}/>;
              })}
              <circle cx="0" cy="-2" r="8" fill="#8B5A2B"/>
              <circle cx="0" cy="-2" r="8" fill="#5A3A1A" opacity={0.3}/>
            </g>
          )}
          {/* bico */}
          <path d={`M ${bicoBaseX-7} ${bicoBaseY-6} Q ${bicoTipX} ${bicoTipY-3} ${bicoTipX+2} ${bicoTipY+3} Q ${bicoTipX-4} ${bicoTipY+7} ${bicoBaseX-8} ${bicoBaseY+7} Z`} fill={corBico}/>
          <ellipse cx={(bicoBaseX+bicoTipX)/2} cy={(bicoBaseY+bicoTipY)/2+3} rx={3} ry={1.4} fill={corBicoEsc} opacity={0.6}/>
          {/* boca escancarada (correndo/alarmado) */}
          {correndoAtivo&&(
            <ellipse cx={(bicoBaseX+bicoTipX)/2-2} cy={(bicoBaseY+bicoTipY)/2+2} rx={6} ry={5} fill="#C24A5A"/>
          )}
          {/* língua pra fora (só morto) */}
          {morto&&(
            <ellipse cx={bicoTipX+2} cy={bicoTipY+9} rx={4} ry={3} fill="#E86C8A"/>
          )}
          {/* sementinha "comida" no bico (alimentando) */}
          {alimentando&&(
            <circle className="patoSemente" cx={bicoTipX} cy={bicoTipY} r={5} fill="#8FC43A" stroke="#5A8A1A" strokeWidth={1}/>
          )}
          {/* bochecha rosada */}
          {mostrarBochecha&&<ellipse cx={headX-17} cy={headY+8} rx={6.5} ry={4.2} fill="#F5A0B0" opacity={0.6}/>}
          {mostrarBochecha&&<ellipse cx={headX+17} cy={headY+8} rx={5} ry={3.2} fill="#F5A0B0" opacity={0.4}/>}
          {/* óculos de coração (só relaxado) OU olhos normais OU X (morto) */}
          {morto ? (
            <>
              <path d={`M ${headX-10} ${olhoY-4} L ${headX-2} ${olhoY+4} M ${headX-2} ${olhoY-4} L ${headX-10} ${olhoY+4}`} stroke="#3D3226" strokeWidth={2.2} strokeLinecap="round"/>
              <path d={`M ${headX+2} ${olhoY-4} L ${headX+10} ${olhoY+4} M ${headX+10} ${olhoY-4} L ${headX+2} ${olhoY+4}`} stroke="#3D3226" strokeWidth={2.2} strokeLinecap="round"/>
            </>
          ) : correndoAtivo ? (
            <>
              <circle cx={headX-4} cy={olhoY} r={4.6} fill="#fff" stroke="#3D3226" strokeWidth={1}/>
              <circle cx={headX+7} cy={olhoY-1} r={4.6} fill="#fff" stroke="#3D3226" strokeWidth={1}/>
              <circle cx={headX-4} cy={olhoY} r={2.4} fill="#3D3226"/>
              <circle cx={headX+7} cy={olhoY-1} r={2.4} fill="#3D3226"/>
            </>
          ) : relaxAtivo ? (
            <g transform={`translate(${headX},${olhoY-2})`}>
              {[-11,11].map((dx,i)=>(
                <path key={i} transform={`translate(${dx},0) scale(0.85)`}
                  d="M 0 -6 C -3 -10 -9 -9 -9 -4 C -9 0 -4 4 0 7 C 4 4 9 0 9 -4 C 9 -9 3 -10 0 -6 Z"
                  fill="#F582AC" stroke="#E8548A" strokeWidth={1} opacity={0.88}/>
              ))}
              <line x1={-4} y1={0} x2={4} y2={0} stroke="#C8447A" strokeWidth={1.4}/>
            </g>
          ) : olhoFechado ? (
            <path d={`M ${headX-10} ${olhoY} Q ${headX-4} ${olhoY+3} ${headX+2} ${olhoY}`} stroke="#3D3226" strokeWidth={2.6} fill="none" strokeLinecap="round"/>
          ) : (
            <>
              <circle cx={headX-4} cy={olhoY} r={3.6} fill="#3D3226"/>
              <circle cx={headX-2.5} cy={olhoY-1.5} r={1.1} fill="#fff"/>
              {mostrarCilios&&(
                <>
                  <path d={`M ${headX-8} ${olhoY-4} Q ${headX-11} ${olhoY-8} ${headX-13} ${olhoY-6}`} stroke="#2A2018" strokeWidth={1.3} fill="none" strokeLinecap="round"/>
                  <path d={`M ${headX-6} ${olhoY-5.5} Q ${headX-8} ${olhoY-10} ${headX-9} ${olhoY-9}`} stroke="#2A2018" strokeWidth={1.2} fill="none" strokeLinecap="round"/>
                  <path d={`M ${headX-3} ${olhoY-6} Q ${headX-4} ${olhoY-10} ${headX-5} ${olhoY-9.5}`} stroke="#2A2018" strokeWidth={1.1} fill="none" strokeLinecap="round"/>
                </>
              )}
            </>
          )}
        </svg>
        {alimentando&&(
          <div style={{position:"absolute",top:20,left:"50%",transform:"translateX(-50%)",fontSize:14,fontWeight:700,color:"#2D9A1A",fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap",animation:"patoFloatUp 1.8s ease-out forwards",textShadow:"0 1px 3px rgba(255,255,255,0.8)"}}>
            +{R(alimentando.valor)} 🌱
          </div>
        )}
      </div>
      {falando&&(
        <div style={{background:"rgba(255,255,255,0.96)",borderRadius:14,padding:"10px 14px",fontSize:12,color:"#3D3226",fontFamily:"'DM Sans',sans-serif",fontWeight:600,boxShadow:"0 4px 14px rgba(0,0,0,0.18)",maxWidth:190,textAlign:"center"}}>
          {morto ? mensagens[0] : alerta ? mensagens[0] : correndoAtivo ? mensagens[0] : relaxAtivo ? mensagens[0] : mensagens[stage]}
        </div>
      )}
      <div style={{background:"rgba(255,255,255,0.88)",borderRadius:99,padding:"5px 14px",fontSize:12,fontWeight:700,color:morto?"#8B1A1A":alerta?"#8B4A1A":"#3D3226",fontFamily:"'DM Sans',sans-serif",boxShadow:"0 2px 8px rgba(0,0,0,0.1)"}}>
        {morto?"💀 desmaiou":alerta?"⚠ "+pct.toFixed(0)+"% energia":correndoAtivo?"😱 muita saída":relaxAtivo?"😎 "+pct.toFixed(0)+"% tranquilo":pct.toFixed(0)+"% feliz"}
      </div>
      {totalAlimentado>0&&(
        <div style={{fontSize:9.5,color:"rgba(61,50,38,0.6)",fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>
          🌱 alimentado com {R(totalAlimentado)} no total
        </div>
      )}
      <style>{`@keyframes patoBreathe{0%,100%{transform:scale(1)}50%{transform:scale(1.035)}}
        @keyframes patoPanico{0%,100%{transform:translateX(0) rotate(0deg)}25%{transform:translateX(-3px) rotate(-2deg)}75%{transform:translateX(3px) rotate(2deg)}}
        .patoAsaFlap{animation:asaFlap 0.4s ease-in-out infinite;transform-origin:100px 148px}
        @keyframes asaFlap{0%,100%{transform:rotate(0deg)}50%{transform:rotate(-8deg)}}
        .patoSemente{animation:patoComer 1s ease-out forwards}
        @keyframes patoComer{0%{transform:scale(1.8);opacity:1}60%{transform:scale(1);opacity:1}100%{transform:scale(0.3);opacity:0}}
        @keyframes patoFloatUp{0%{transform:translateY(0);opacity:0}15%{opacity:1}100%{transform:translateY(-38px);opacity:0}}`}</style>
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
  const [saldoMensal, setSaldoMensal] = useLS("v4_saldo_mensal", {}, userId);
  const [confirmSaldoMes, setConfirmSaldoMes] = useState(null);
  const [editSaldoMes, setEditSaldoMes] = useState(null);
  const [mortoReportOpen, setMortoReportOpen] = useState(false);

  const [tab,setTab]=useState("dashboard");
  const [modal,setModal]=useState(null);
  const [edit,setEdit]=useState(null);
  const [extra,setExtra]=useState(null);
  const [selMes,setSelMes]=useState(today().slice(0,7));
  const [sideOpen,setSideOpen]=useState(false);
  const [cdiAtual,setCdiAtual]=useState(()=>{try{return JSON.parse(localStorage.getItem("velara_cdi")||"null")?.valor||null;}catch{return null;}});
  useEffect(()=>{fetchCDI().then(v=>{if(v)setCdiAtual(v);});},[]);
  useEffect(()=>{
    if(ccMovs.length>0){
      const migrados=ccMovs.map(m=>({
        id:uid(), tipo:"saida", descricao:m.descricao, valor:m.valor, categoria:m.categoria, data:m.data,
        formaPagamento:"cartao", cartaoId:m.cartao,
      }));
      setMovs([...migrados,...movs]);
      setCCMovs([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);
  useEffect(()=>{
    const mesAtualReal = today().slice(0,7);
    if(saldoMensal[mesAtualReal]!==undefined) return;
    const mesAnterior = shiftMonth(mesAtualReal,-1);
    const temDadosAnterior = saldoMensal[mesAnterior]!==undefined || movs.some(m=>monthKey(m.data)===mesAnterior);
    if(!temDadosAnterior) return;
    const entMesAnt = movs.filter(m=>m.tipo==="entrada"&&monthKey(m.data)===mesAnterior).reduce((s,m)=>s+m.valor,0);
    const saiMesAnt = movs.filter(m=>m.tipo==="saida"&&monthKey(m.data)===mesAnterior).reduce((s,m)=>s+m.valor,0);
    const transfAporteMesAnt = movs.filter(m=>m.tipo==="transferencia"&&m.subtipo!=="resgate"&&monthKey(m.data)===mesAnterior).reduce((s,m)=>s+m.valor,0);
    const transfResgateMesAnt = movs.filter(m=>m.tipo==="transferencia"&&m.subtipo==="resgate"&&monthKey(m.data)===mesAnterior).reduce((s,m)=>s+m.valor,0);
    const baseAnterior = saldoMensal[mesAnterior]!==undefined?+saldoMensal[mesAnterior]:0;
    const saldoFinalAnterior = baseAnterior+entMesAnt-saiMesAnt-transfAporteMesAnt+transfResgateMesAnt;
    setConfirmSaldoMes({mes:mesAtualReal, valor:saldoFinalAnterior.toFixed(2)});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);
  const [alocExpanded,setAlocExpanded]=useState(false);
  const [importOpen,setImportOpen]=useState(false);
  const [notas,setNotas]=useLS("v4_notas","",userId);
  const [pltDist,setPltDist]=useState(null);
  const [recebModal,setRecebModal]=useState(null);
  const [recebData,setRecebData]=useState(today());
  const [pltView,setPltView]=useState("tabela");
  const [pltMes,setPltMes]=useState(today().slice(0,7));
  const [objExpandido,setObjExpandido]=useState(null);
  const [investExpandido,setInvestExpandido]=useState(null);
  const [investIdx,setInvestIdx]=useState(0);
  const [cartaoIdx,setCartaoIdx]=useState(0);
  const [totalAlimentado,setTotalAlimentado]=useLS("v4_pato_alimentado",0,userId);
  const [feedTrigger,setFeedTrigger]=useState(null); // {valor,id} dispara animação de alimentar
  const alimentarPato=(valor)=>{
    if(!valor||valor<=0)return;
    setTotalAlimentado(+totalAlimentado+valor);
    setFeedTrigger({valor,id:uid()});
  };
  const [filtroMov,setFiltroMov]=useState({tipo:"todos",categoria:"todos",formaPagamento:"todos"});
  const [filtroPlt,setFiltroPlt]=useState({empresa:"todos",status:"todos",dataDe:"",dataAte:""});
  const [fJuros,setFJuros]=useState({mes:today().slice(0,7),taxa:""});
  const [temDinheiroPergunta,setTemDinheiroPergunta]=useState(null); // {mov, valorTotal} aguardando resposta
  const [planoAcaoAberto,setPlanoAcaoAberto]=useState(null); // {descricao, valorTotal} pra mostrar estrategia
  const [fParte,setFParte]=useState({descricao:"",valor:"",investId:""});
  const [movDist,setMovDist]=useState(null);

  const [fMov,setFMov]=useState({tipo:"saida",descricao:"",valor:"",categoria:CATS_OUT[0],data:today(),subtipo:"aporte",investId:"",formaPagamento:"dinheiro",cartaoId:"",parcelado:false,numParcelas:"2"});
  const [fEmp,setFEmp]=useState({nome:"",contato:"",prazo:"30",cor:"#E8205F"});
  const [fPlt,setFPlt]=useState({empresa:"",data:"",horas:"",valorH:"",valorTotal:"",prazo:"30",previsao:"",status:"pendente",obs:""});
  const [fPltLote,setFPltLote]=useState({empresa:"",valorTotal:"",horas:"",previsao:"",diasSelecionados:[],mesLote:today().slice(0,7)});
  const [fInv,setFInv]=useState({nome:"",tipo:"CDB",banco:"",aporte:"",taxa:"",taxaModo:"fixo",percCDI:"",data:today(),obs:""});
  const [fObj,setFObj]=useState({nome:"",meta:"",atual:"0",prazo:"",cor:C.green,obs:"",investId:""});
  const [fDiv,setFDiv]=useState({credor:"",total:"",pago:"0",prazo:"",parcelas:"",obs:""});
  const [fCartaoRenegoc,setFCartaoRenegoc]=useState({credor:"",numParcelas:"12",valorComDesconto:"",valorSemDesconto:"",percentualDesconto:"",percentualAntecipado:"",dataPrimeiraParcela:today()});
  const [cartaoRenegocExpandido,setCartaoRenegocExpandido]=useState(null);
  const [pagarParcelaModal,setPagarParcelaModal]=useState(null); // {divId, parcelaIdx}
  const [fCart,setFCart]=useState({nome:"",bandeira:"",limite:"",fechamento:"",vencimento:""});
    const [fAporte,setFAporte]=useState({valor:"",data:today()});
  const [fPgto,setFPgto]=useState({valor:"",data:today()});

  useEffect(()=>{const h=parseFloat(fPlt.horas),v=parseFloat(fPlt.valorH);if(h&&v)setFPlt(f=>({...f,valorTotal:(h*v).toFixed(2)}));},[fPlt.horas,fPlt.valorH]);
  useEffect(()=>{if(fPlt.data&&fPlt.prazo)setFPlt(f=>({...f,previsao:addDays(f.data,parseInt(f.prazo)||30)}));},[fPlt.data,fPlt.prazo]);

  const openM=(m,item=null,ex=null)=>{
    setEdit(item);setExtra(ex);setModal(m);
    if(m==="mov")   setFMov(item?{...item,subtipo:item.subtipo||"aporte",investId:item.investId||"",formaPagamento:item.formaPagamento||"dinheiro",cartaoId:item.cartaoId||"",parcelado:false,numParcelas:"2"}:{tipo:"saida",descricao:"",valor:"",categoria:CATS_OUT[0],data:today(),subtipo:"aporte",investId:"",formaPagamento:"dinheiro",cartaoId:"",parcelado:false,numParcelas:"2"});
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
  const removeMov=id=>{
    const m=movs.find(x=>x.id===id);
    if(m&&m.tipo==="transferencia"&&m.investId){
      setInvests(invests.map(i=>i.id===m.investId
        ? {...i,aporte:m.subtipo==="resgate"?i.aporte+m.valor:Math.max(0,i.aporte-m.valor)}
        : i));
    }
    setMovs(movs.filter(x=>x.id!==id));
  };

  const importarMovs=items=>{setMovs([...items,...movs]);};
  const saveMov=()=>{
    if(!fMov.descricao||!fMov.valor)return;
    const valorNum=+String(fMov.valor).replace(",",".");

    // Compra parcelada no cartão: gera N lançamentos, um por mês
    if(!edit&&fMov.tipo==="saida"&&fMov.formaPagamento==="cartao"&&fMov.parcelado){
      const n=Math.max(2,+fMov.numParcelas||2);
      const valorParcela=+(valorNum/n).toFixed(2);
      const grupoId=uid();
      const novos=Array.from({length:n},(_,idx)=>({
        id:uid(), tipo:"saida", descricao:`${fMov.descricao} (${idx+1}/${n})`, valor:valorParcela,
        categoria:fMov.categoria, data:addMonths(fMov.data,idx),
        formaPagamento:"cartao", cartaoId:fMov.cartaoId, parcelaAtual:idx+1, parcelaTotal:n, compraGrupoId:grupoId,
      }));
      setMovs([...novos,...movs]);
      closeM();
      if(fMov.formaPagamento==="cartao") setTemDinheiroPergunta({descricao:fMov.descricao,valorTotal:valorNum});
      return;
    }

    upsert(movs,setMovs,{...fMov,valor:valorNum});
    if(!edit&&fMov.tipo==="transferencia"&&fMov.investId){
      setInvests(invests.map(i=>i.id===fMov.investId
        ? {...i,aporte:fMov.subtipo==="resgate"?Math.max(0,i.aporte-valorNum):i.aporte+valorNum}
        : i));
      if(fMov.subtipo!=="resgate")alimentarPato(valorNum);
    }
    if(!edit&&fMov.tipo==="saida"&&fMov.formaPagamento==="cartao"){
      setTemDinheiroPergunta({descricao:fMov.descricao,valorTotal:valorNum});
    }
  };
  const saveEmp=()=>{if(!fEmp.nome)return;upsert(empresas,setEmpresas,fEmp);};
  const savePlt=()=>{if(!fPlt.empresa||!fPlt.data||!fPlt.valorTotal)return;upsert(plantoes,setPlantoes,{...fPlt,valorTotal:+fPlt.valorTotal});};
  const savePltLote=()=>{
    const f=fPltLote;
    if(!f.empresa||!f.valorTotal||f.diasSelecionados.length===0)return;
    const valorTotal=+String(f.valorTotal).replace(",",".");
    const novos=f.diasSelecionados.map(dia=>({
      id:uid(), empresa:f.empresa, data:`${f.mesLote}-${String(dia).padStart(2,"0")}`,
      horas:f.horas||"", valorH:f.horas&&valorTotal?(valorTotal/(+f.horas)).toFixed(2):"",
      valorTotal, previsao:f.previsao||"", status:"pendente", obs:"",
    }));
    setPlantoes([...novos,...plantoes]);
    setFPltLote({empresa:"",valorTotal:"",horas:"",previsao:"",diasSelecionados:[],mesLote:today().slice(0,7)});
    closeM();
  };
  const saveInv=()=>{
    if(!fInv.nome||!fInv.aporte)return;
    upsert(invests,setInvests,{...fInv,aporte:+String(fInv.aporte).replace(",","."),percCDI:fInv.taxaModo==="cdi"?+String(fInv.percCDI||0).replace(",","."):"",taxa:fInv.taxaModo==="fixo"?fInv.taxa:""});
  };
  const taxaEfetiva=inv=>inv.taxaModo==="cdi"&&inv.percCDI?(cdiAtual?cdiAtual*(+inv.percCDI)/100:0):(parseFloat(inv.taxa)||0);
  const saveObj=()=>{if(!fObj.nome||!fObj.meta)return;upsert(objetivos,setObjetivos,{...fObj,meta:+String(fObj.meta).replace(",","."),atual:+String(fObj.atual||0).replace(",",".")});};
  const saveDiv=()=>{if(!fDiv.credor||!fDiv.total)return;upsert(dividas,setDividas,{...fDiv,tipo:fDiv.tipo||"ativa",total:+String(fDiv.total).replace(",","."),pago:+String(fDiv.pago||0).replace(",",".")});};

  const saveCartaoRenegoc=()=>{
    const f=fCartaoRenegoc;
    if(!f.credor||!f.numParcelas||!f.valorComDesconto)return;
    const n=Math.max(1,+f.numParcelas);
    const vCom=+String(f.valorComDesconto).replace(",",".");
    const vSem=+String(f.valorSemDesconto||f.valorComDesconto).replace(",",".");
    const parcelasStatus=Array.from({length:n},(_,idx)=>({
      numero:idx+1, dataVencimento:addMonths(f.dataPrimeiraParcela,idx), pago:false, valorPago:0, comDesconto:null,
    }));
    const novaDiv={
      id:uid(), tipo:"cartao_desconto", credor:f.credor,
      numParcelas:n, valorComDesconto:vCom, valorSemDesconto:vSem,
      percentualDesconto:+String(f.percentualDesconto||0).replace(",","."),
      percentualAntecipado:+String(f.percentualAntecipado||0).replace(",","."),
      parcelasStatus, total:vCom*n, pago:0,
    };
    setDividas([novaDiv,...dividas]);
    setFCartaoRenegoc({credor:"",numParcelas:"12",valorComDesconto:"",valorSemDesconto:"",percentualDesconto:"",percentualAntecipado:"",dataPrimeiraParcela:today()});
    closeM();
  };

  const marcarParcelaPaga=(divId,parcelaIdx,comDesconto)=>{
    setDividas(dividas.map(d=>{
      if(d.id!==divId)return d;
      const novasParcelas=d.parcelasStatus.map((p,idx)=>{
        if(idx!==parcelaIdx)return p;
        const valorPago=comDesconto?d.valorComDesconto:d.valorSemDesconto;
        return {...p,pago:true,valorPago,comDesconto};
      });
      const novoPago=novasParcelas.reduce((s,p)=>s+(p.pago?p.valorPago:0),0);
      return {...d,parcelasStatus:novasParcelas,pago:novoPago};
    }));
    setPagarParcelaModal(null);
  };
  const desmarcarParcela=(divId,parcelaIdx)=>{
    setDividas(dividas.map(d=>{
      if(d.id!==divId)return d;
      const novasParcelas=d.parcelasStatus.map((p,idx)=>idx===parcelaIdx?{...p,pago:false,valorPago:0,comDesconto:null}:p);
      const novoPago=novasParcelas.reduce((s,p)=>s+(p.pago?p.valorPago:0),0);
      return {...d,parcelasStatus:novasParcelas,pago:novoPago};
    }));
  };
  const saveCart=()=>{if(!fCart.nome||!fCart.limite)return;upsert(cartoes,setCartoes,{...fCart,limite:+String(fCart.limite).replace(",",".")});};
    const addJuros=(investId)=>{
    if(!fJuros.mes||!fJuros.taxa)return;
    const entry={id:uid(),mes:fJuros.mes,taxa:+String(fJuros.taxa).replace(",",".")};
    setInvests(invests.map(i=>i.id===investId?{...i,historicoTaxas:[...(i.historicoTaxas||[]).filter(h=>h.mes!==entry.mes),entry].sort((a,b)=>a.mes.localeCompare(b.mes))}:i));
    setFJuros({mes:today().slice(0,7),taxa:""});
  };
  const removeJuros=(investId,entryId)=>{
    setInvests(invests.map(i=>i.id===investId?{...i,historicoTaxas:(i.historicoTaxas||[]).filter(h=>h.id!==entryId)}:i));
  };
  const addParte=(objId)=>{
    if(!fParte.descricao||!fParte.valor)return;
    const val=+String(fParte.valor).replace(",",".");
    const parte={id:uid(),descricao:fParte.descricao,valor:val,investId:fParte.investId||""};
    setObjetivos(objetivos.map(o=>o.id===objId?{...o,partes:[...(o.partes||[]),parte]}:o));
    setFParte({descricao:"",valor:"",investId:""});
  };
  const removeParte=(objId,parteId)=>{
    setObjetivos(objetivos.map(o=>o.id===objId?{...o,partes:(o.partes||[]).filter(p=>p.id!==parteId)}:o));
  };
  const saveAporte=()=>{
    if(!fAporte.valor||!extra)return;
    const v=+String(fAporte.valor).replace(",",".");
    const obj=objetivos.find(o=>o.id===extra);
    setObjetivos(objetivos.map(o=>o.id===extra?{...o,atual:+o.atual+v}:o));
    if(obj?.investId) setInvests(invests.map(i=>i.id===obj.investId?{...i,aporte:i.aporte+v}:i));
    alimentarPato(v);
    closeM();
  };
  const savePgto=()=>{if(!fPgto.valor||!extra)return;const v=+String(fPgto.valor).replace(",",".");setDividas(dividas.map(d=>d.id===extra?{...d,pago:Math.min(+d.pago+v,+d.total)}:d));alimentarPato(v);closeM();};

  const getPltStatus=p=>{if(p.status==="recebido")return"recebido";if(p.status==="cancelado")return"cancelado";if(isPast(p.previsao))return"atrasado";return"pendente";};

  const updatePlantao=(id,patch)=>{setPlantoes(plantoes.map(p=>p.id===id?{...p,...patch}:p));};
  const marcarRecebido=id=>{
    const p=plantoes.find(x=>x.id===id); if(!p)return;
    setRecebData(today());
    setRecebModal(p);
  };
  const confirmarDataRecebimento=()=>{
    const p=recebModal; if(!p)return;
    setRecebModal(null);
    if(regras.length>0){ setPltDist({...p, _dataEscolhida:recebData}); }
    else{
      setPlantoes(plantoes.map(x=>x.id===p.id?{...x,status:"recebido",dataRecebimento:recebData}:x));
      setMovs([{id:uid(),tipo:"entrada",descricao:`Plantão - ${p.empresa}`,valor:p.valorTotal,categoria:"🏥 Plantão",data:recebData},...movs]);
    }
  };

  const confirmarDistribuicao=(p,alocs,isMov=false)=>{
    const dataEsc=p._dataEscolhida||today();
    if(!isMov){
      setPlantoes(plantoes.map(x=>x.id===p.id?{...x,status:"recebido",dataRecebimento:dataEsc}:x));
      setMovs([{id:uid(),tipo:"entrada",descricao:`Plantão - ${p.empresa}`,valor:p.valorTotal,categoria:"🏥 Plantão",data:dataEsc},...movs]);
    }
    let nInv=[...invests],nObj=[...objetivos],nDiv=[...dividas];
    let totalAlimentarAgora=0;
    const reg={id:uid(),plantaoId:p.id,data:dataEsc,empresa:p.empresa,totalRecebido:p.valorTotal,itens:[]};
    alocs.forEach(a=>{
      const val=parseFloat(a.valorEdit||0); if(val<=0)return;
      const inv=a.tipo==="investimento"?invests.find(x=>x.id===a.destinoId):null;
      const getNome=()=>{if(a.tipo==="investimento"){const i=invests.find(x=>x.id===a.destinoId);return i?`${i.nome}${i.banco?" · "+i.banco:""}`:a.destinoNome||"—";}if(a.tipo==="objetivo")return objetivos.find(x=>x.id===a.destinoId)?.nome||a.destinoNome||"—";if(a.tipo==="divida"||a.tipo==="fundo_divida")return dividas.find(x=>x.id===a.destinoId)?.credor||a.destinoNome||"—";return"Livre";};
      reg.itens.push({tipo:a.tipo,destinoId:a.destinoId,destinoNome:a.tipo==="livre"?"Livre":getNome(),banco:inv?.banco||"",valor:val});
      if(a.tipo!=="livre")totalAlimentarAgora+=val;
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
    if(totalAlimentarAgora>0)alimentarPato(totalAlimentarAgora);
    if(!isMov) setPltDist(null);
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  const plantoesEfetivos=useMemo(()=>plantoes.map(p=>({...p,se:getPltStatus(p)})),[plantoes]);
  const movsDoMes=useMemo(()=>movs.filter(m=>monthKey(m.data)===selMes),[movs,selMes]);
  const categoriasEstouradas=useMemo(()=>{
    const categoriasD=cats?.despesa||DEFAULT_CATS.despesa;
    const gastosPorCat={};
    movsDoMes.filter(m=>m.tipo==="saida").forEach(m=>{gastosPorCat[m.categoria]=(gastosPorCat[m.categoria]||0)+m.valor;});
    return categoriasD.map(c=>{
      const gasto=gastosPorCat[`${c.emoji} ${c.nome}`]||Object.entries(gastosPorCat).filter(([k])=>k.includes(c.nome)).reduce((s,[,v])=>s+v,0);
      const plan=orcamento[selMes]?.[c.id]||0;
      return {nome:`${c.emoji} ${c.nome}`, gasto, plan, excesso:gasto-plan};
    }).filter(c=>c.plan>0&&c.excesso>0).sort((a,b)=>b.excesso-a.excesso);
  },[movsDoMes,cats,orcamento,selMes]);
  const orcamentoEstourado=categoriasEstouradas.length>0;
  const mediaSaldoLivre3Meses=useMemo(()=>{
    const meses=[1,2,3].map(n=>shiftMonth(today().slice(0,7),-n));
    const valores=meses.map(mk=>{
      const ent=movs.filter(m=>m.tipo==="entrada"&&monthKey(m.data)===mk).reduce((s,m)=>s+m.valor,0);
      const sai=movs.filter(m=>m.tipo==="saida"&&monthKey(m.data)===mk).reduce((s,m)=>s+m.valor,0);
      const tA=movs.filter(m=>m.tipo==="transferencia"&&m.subtipo!=="resgate"&&monthKey(m.data)===mk).reduce((s,m)=>s+m.valor,0);
      const tR=movs.filter(m=>m.tipo==="transferencia"&&m.subtipo==="resgate"&&monthKey(m.data)===mk).reduce((s,m)=>s+m.valor,0);
      return ent-sai-tA+tR;
    });
    return valores.reduce((s,v)=>s+v,0)/valores.length;
  },[movs]);
  const categoriaMaiorGasto=useMemo(()=>{
    const gastosPorCat={};
    movsDoMes.filter(m=>m.tipo==="saida").forEach(m=>{
      const catPai=m.categoria.includes("·")?m.categoria.split("·")[0].trim():m.categoria;
      gastosPorCat[catPai]=(gastosPorCat[catPai]||0)+m.valor;
    });
    const entries=Object.entries(gastosPorCat).sort((a,b)=>b[1]-a[1]);
    return entries.length?{nome:entries[0][0],valor:entries[0][1]}:null;
  },[movsDoMes]);
  const CATS_NAO_ESSENCIAIS=["Lazer","Vestuário","Educação"];
  const KEYWORDS_SUPERFLUO=["delivery","lanche","fast food","doce","doces","bebida","presente","impulso","streaming","ifood","balada","bar ","festa"];
  const analiseEconomia=useMemo(()=>{
    const meses3Ant=[1,2,3].map(n=>shiftMonth(selMes,-n));
    const gastoAtualPorCat={};
    movsDoMes.filter(m=>m.tipo==="saida").forEach(m=>{
      const catPai=m.categoria.includes("·")?m.categoria.split("·")[0].trim():m.categoria;
      gastoAtualPorCat[catPai]=(gastoAtualPorCat[catPai]||0)+m.valor;
    });
    const gastoMedioPorCat={};
    meses3Ant.forEach(mk=>{
      const gastosMes={};
      movs.filter(m=>m.tipo==="saida"&&monthKey(m.data)===mk).forEach(m=>{
        const catPai=m.categoria.includes("·")?m.categoria.split("·")[0].trim():m.categoria;
        gastosMes[catPai]=(gastosMes[catPai]||0)+m.valor;
      });
      Object.entries(gastosMes).forEach(([cat,v])=>{gastoMedioPorCat[cat]=(gastoMedioPorCat[cat]||0)+v;});
    });
    Object.keys(gastoMedioPorCat).forEach(cat=>{gastoMedioPorCat[cat]/=3;});

    const todasCats=new Set([...Object.keys(gastoAtualPorCat),...Object.keys(gastoMedioPorCat)]);
    const resultado=[...todasCats].map(cat=>{
      const atual=gastoAtualPorCat[cat]||0;
      const media=gastoMedioPorCat[cat]||0;
      const diferenca=atual-media;
      const percentualAcima=media>0?(diferenca/media*100):(atual>0?100:0);
      const naoEssencial=CATS_NAO_ESSENCIAIS.some(ne=>cat.includes(ne));
      return {cat,atual,media,diferenca,percentualAcima,naoEssencial};
    }).filter(r=>r.atual>0)
      .sort((a,b)=>{
        if(a.percentualAcima>15&&b.percentualAcima<=15)return -1;
        if(b.percentualAcima>15&&a.percentualAcima<=15)return 1;
        return b.atual-a.atual;
      });
    return resultado.slice(0,5);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[movs,movsDoMes,selMes]);

  const presenteVsFuturo=useMemo(()=>{
    const saidasMes=movsDoMes.filter(m=>m.tipo==="saida");
    const gastoSuperfluo=saidasMes.filter(m=>{
      const catLower=m.categoria.toLowerCase();
      const descLower=(m.descricao||"").toLowerCase();
      return CATS_NAO_ESSENCIAIS.some(ne=>m.categoria.includes(ne)) || KEYWORDS_SUPERFLUO.some(k=>catLower.includes(k)||descLower.includes(k));
    }).reduce((s,m)=>s+m.valor,0);

    const transfAporteMes=movsDoMes.filter(m=>m.tipo==="transferencia"&&m.subtipo!=="resgate").reduce((s,m)=>s+m.valor,0);
    const alocMes=alocacoes.filter(a=>monthKey(a.data)===selMes);
    const aportadoViaDistribuicao=alocMes.flatMap(a=>a.itens.filter(it=>it.tipo!=="livre")).reduce((s,it)=>s+it.valor,0);
    const totalFuturo=transfAporteMes+aportadoViaDistribuicao;

    return {gastoSuperfluo,totalFuturo,diferenca:gastoSuperfluo-totalFuturo};
  },[movsDoMes,alocacoes,selMes]);

  const entradas=movsDoMes.filter(m=>m.tipo==="entrada").reduce((s,m)=>s+m.valor,0);
  const saidas=movsDoMes.filter(m=>m.tipo==="saida").reduce((s,m)=>s+m.valor,0);
  const transferenciasAporte=movsDoMes.filter(m=>m.tipo==="transferencia"&&m.subtipo!=="resgate").reduce((s,m)=>s+m.valor,0);
  const transferenciasResgate=movsDoMes.filter(m=>m.tipo==="transferencia"&&m.subtipo==="resgate").reduce((s,m)=>s+m.valor,0);
  const transferencias=transferenciasAporte-transferenciasResgate;
  // Transferências acumuladas até o mês selecionado (total investido)
  const transferenciasAcumuladas=movs
    .filter(m=>m.tipo==="transferencia"&&m.data&&monthKey(m.data)<=selMes)
    .reduce((s,m)=>s+m.valor,0);
  // Saldo mensal puro
  const saldo=entradas-saidas-transferencias;

  const desafioPato=useMemo(()=>{
    const temParcelaAtrasada=dividas.some(d=>{
      if(d.tipo==="cartao_desconto")return (d.parcelasStatus||[]).some(p=>!p.pago&&isPast(p.dataVencimento));
      if(d.tipo==="ativa")return d.prazo&&isPast(d.prazo)&&(+d.pago<+d.total);
      return false;
    });
    const fezAporteEsteMes=(movsDoMes.some(m=>m.tipo==="transferencia"&&m.subtipo!=="resgate"))||(alocacoes.some(a=>monthKey(a.data)===selMes&&a.itens.some(it=>it.tipo!=="livre")));
    const itens=[
      {label:"Nenhuma categoria estourou o orçamento",feito:!orcamentoEstourado},
      {label:"Guardou mais pro futuro do que gastou no agora",feito:presenteVsFuturo.totalFuturo>=presenteVsFuturo.gastoSuperfluo&&(presenteVsFuturo.totalFuturo>0||presenteVsFuturo.gastoSuperfluo===0)},
      {label:"Saldo do mês positivo",feito:saldo>=0},
    ];
    if(dividas.length>0){
      itens.push({label:"Nenhuma parcela de dívida atrasada",feito:!temParcelaAtrasada});
    }
    if(objetivos.length>0||invests.length>0||dividas.length>0){
      itens.push({label:"Fez pelo menos um aporte (objetivo/investimento/dívida)",feito:fezAporteEsteMes});
    }
    const completos=itens.filter(i=>i.feito).length;
    return {itens,completos,total:itens.length};
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[orcamentoEstourado,presenteVsFuturo,saldo,dividas,objetivos,invests,movsDoMes,alocacoes,selMes]);

  const totalAlocadoMes=alocacoes.filter(a=>monthKey(a.data)===selMes).reduce((s,a)=>s+a.totalRecebido,0);

  // Saldo com carry-forward: acumula desde o mês mais antigo com dados,
  // respeitando qualquer ajuste manual feito no meio do caminho (⚙ ajustar)
  const saldoFinal = useMemo(()=>{
    const chaves=[...Object.keys(saldoMensal),...movs.map(m=>monthKey(m.data))].filter(Boolean);
    let mesAtual = chaves.length ? chaves.sort()[0] : selMes;
    let base = saldoMensal[mesAtual]!==undefined ? +saldoMensal[mesAtual] : 0;
    let guard=0;
    while(mesAtual<selMes && guard<600){
      const ent=movs.filter(m=>m.tipo==="entrada"&&monthKey(m.data)===mesAtual).reduce((s,m)=>s+m.valor,0);
      const sai=movs.filter(m=>m.tipo==="saida"&&monthKey(m.data)===mesAtual).reduce((s,m)=>s+m.valor,0);
      const tA=movs.filter(m=>m.tipo==="transferencia"&&m.subtipo!=="resgate"&&monthKey(m.data)===mesAtual).reduce((s,m)=>s+m.valor,0);
      const tR=movs.filter(m=>m.tipo==="transferencia"&&m.subtipo==="resgate"&&monthKey(m.data)===mesAtual).reduce((s,m)=>s+m.valor,0);
      const fim=base+ent-sai-tA+tR;
      mesAtual=shiftMonth(mesAtual,1);
      base=saldoMensal[mesAtual]!==undefined?+saldoMensal[mesAtual]:fim;
      guard++;
    }
    return base+saldo;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[selMes,movs,saldoMensal]);
  const estaMorto=saldoFinal<0;
  const totalInvestido=invests.reduce((s,i)=>s+i.aporte,0);
  const totalFundoDivida=dividas.filter(d=>d.tipo==="fundo"&&!d.investId).reduce((s,d)=>s+(+d.pago||0),0);
  const totalObjetivos=objetivos.filter(o=>!o.investId).reduce((s,o)=>s+(+o.atual||0),0);
  const totalPatrimonio=totalInvestido+totalFundoDivida;
  const totalDividas=dividas.reduce((s,d)=>s+(+d.total-+d.pago),0);
  const totalPendPlant=plantoesEfetivos.filter(p=>["pendente","atrasado"].includes(p.se)).reduce((s,p)=>s+p.valorTotal,0);
  const empNome=n=>empresas.find(e=>e.nome===n)||{nome:n,cor:C.magenta};
  const ccGastosMes=cid=>movs.filter(m=>m.formaPagamento==="cartao"&&m.cartaoId===cid&&monthKey(m.data)===selMes).reduce((s,m)=>s+m.valor,0);

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
      if(!map[p.empresa])map[p.empresa]={nome:p.empresa,total:0,count:0,atrasos:0,recebido:0,pendente:0,cor:empC?.cor||C.magenta,horas:0,totalComHoras:0};
      map[p.empresa].total+=p.valorTotal;
      map[p.empresa].count+=1;
      const se=getPltStatus(p);
      if(se==="atrasado")map[p.empresa].atrasos+=1;
      if(se==="recebido")map[p.empresa].recebido+=p.valorTotal;
      if(["pendente","atrasado"].includes(se))map[p.empresa].pendente+=p.valorTotal;
      if(+p.horas>0){map[p.empresa].horas+=+p.horas;map[p.empresa].totalComHoras+=p.valorTotal;}
    });
    return Object.values(map).sort((a,b)=>b.total-a.total);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[plantoes,empresas]);

  const maxEmpTotal=empAnalise.length?Math.max(...empAnalise.map(e=>e.total)):1;
  const maxEmpCount=empAnalise.length?Math.max(...empAnalise.map(e=>e.count)):1;
  const maxEmpAtraso=empAnalise.length?Math.max(...empAnalise.map(e=>e.atrasos),1):1;
  const empPorHora=useMemo(()=>empAnalise
    .filter(e=>e.horas>0)
    .map(e=>({...e,valorHora:e.totalComHoras/e.horas}))
    .sort((a,b)=>b.valorHora-a.valorHora),
  [empAnalise]);
  const maxValorHora=empPorHora.length?Math.max(...empPorHora.map(e=>e.valorHora)):1;

  // Donut por empresa
  const donutEmpresas=useMemo(()=>empAnalise.map((e,i)=>({label:e.nome,v:e.total,color:e.cor||CHART_COLORS[i%CHART_COLORS.length]})),[empAnalise]);

  // Alocação resumo
  const resumoAloc=useMemo(()=>{const m={investimento:0,objetivo:0,divida:0,livre:0};alocacoes.forEach(a=>a.itens.forEach(it=>{m[it.tipo]=(m[it.tipo]||0)+it.valor;}));return m;},[alocacoes]);

  // Forecast
  const forecast=useMemo(()=>months8().map(ym=>({
    ym,
    entradas:movs.filter(m=>m.tipo==="entrada"&&monthKey(m.data)===ym).reduce((s,m)=>s+m.valor,0)+plantoes.filter(p=>monthKey(p.previsao)===ym).reduce((s,p)=>s+p.valorTotal,0),
    saidas:movs.filter(m=>m.tipo==="saida"&&monthKey(m.data)===ym).reduce((s,m)=>s+m.valor,0),
    rendimentos:invests.reduce((s,i)=>s+(i.aporte*taxaEfetiva(i)/100/12),0),
  })).map(f=>({...f,saldo:f.entradas-f.saidas+f.rendimentos})),[movs,plantoes,invests]);
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
        .plt-numinput::-webkit-outer-spin-button,.plt-numinput::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
        .plt-numinput{-moz-appearance:textfield}
        .plt-select{appearance:none;-webkit-appearance:none;-moz-appearance:none;background-image:none!important}
        .filter-select{appearance:none;-webkit-appearance:none;-moz-appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%231A1209' stroke-width='1.6' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")!important;background-repeat:no-repeat!important;background-position:right 10px center!important;padding-right:26px!important}
        .plt-select option{background:#fff;color:#1A1209}
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

      <NotepadWidget value={notas} onChange={setNotas}/>
      {(()=>{
        const progObj=objetivos.length===0?0:objetivos.reduce((s,o)=>s+(o.meta>0?Math.min(o.atual/o.meta,1):0),0)/objetivos.length*100;
        const progDiv=dividas.length===0?0:dividas.reduce((s,d)=>s+(+d.total>0?Math.min(+d.pago/ +d.total,1):0),0)/dividas.length*100;
        let combinado = dividas.length>0 ? progObj*0.65+progDiv*0.35 : progObj;
        if(orcamentoEstourado) combinado -= 18;
        combinado = Math.max(0,Math.min(100,combinado));
        const stageCalc = combinado>=100?5 : combinado>=75?4 : combinado>=50?3 : combinado>=25?2 : combinado>=5?1 : 0;
        const relaxado = !orcamentoEstourado && stageCalc>=3 && stageCalc<5 && dividas.length>0 && progDiv>0;
        return <PatoMascote progresso={combinado} alerta={orcamentoEstourado} relaxado={relaxado} morto={estaMorto} correndo={saidas>entradas&&saldoFinal<saidas} onClickMorto={()=>setMortoReportOpen(true)} feedTrigger={feedTrigger} totalAlimentado={totalAlimentado}/>;
      })()}


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
                <div style={{fontSize:24,fontWeight:300,letterSpacing:"-.03em",lineHeight:1,color:"#1A1209"}}>{R(saldoFinal)}</div>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <div style={{fontSize:10,color:"rgba(0,0,0,0.5)",fontFamily:"'DM Sans',sans-serif"}}>saldo · {monthLabel(selMes)}</div>
                  <button onClick={()=>setEditSaldoMes(String(saldoMensal[selMes]!==undefined?saldoMensal[selMes]:0))} style={{background:"rgba(0,0,0,0.07)",border:"none",borderRadius:6,padding:"1px 6px",fontSize:9,color:"rgba(0,0,0,0.5)",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>⚙ ajustar</button>
                </div>
              </div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:12,color:"#2D6E20",fontFamily:"'DM Sans',sans-serif",fontWeight:700}}>▲ {R(entradas)}</div>
              <div style={{fontSize:12,color:"#B22222",fontFamily:"'DM Sans',sans-serif",fontWeight:700}}>▼ {R(saidas)}</div>
              {totalPendPlant>0&&<div style={{fontSize:10,color:"#8B6914",fontFamily:"'DM Sans',sans-serif",marginTop:1,fontWeight:600}}>⏳ {R(totalPendPlant)}</div>}
              {totalPatrimonio>0&&<div style={{fontSize:10,color:"#5BA3D4",fontFamily:"'DM Sans',sans-serif",marginTop:1,fontWeight:600}}>📈 {R(totalPatrimonio)} patrimônio</div>}
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
            <div style={{display:"flex",justifyContent:"flex-end",marginBottom:10}}>
              <button onClick={()=>setImportOpen(true)} style={{background:"rgba(255,255,255,0.88)",border:"1px solid rgba(0,0,0,0.12)",borderRadius:12,padding:"8px 14px",fontSize:12,fontWeight:700,color:"#1A1209",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:6,boxShadow:"0 2px 8px rgba(0,0,0,0.08)"}}>📥 Importar Extrato</button>
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

            {/* ── Desafio do Pato 100% ── */}
            <div className={CARD} style={{marginBottom:10,padding:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:26,height:26,borderRadius:8,background:"rgba(255,196,32,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>🌻</div>
                  <span style={{fontSize:12,fontWeight:700,color:"#1A1209",letterSpacing:".04em",textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif"}}>Desafio do Pato 100%</span>
                </div>
                <span style={{fontSize:12,fontWeight:700,color:desafioPato.completos===desafioPato.total?"#215010":"#8B6000",fontFamily:"'DM Sans',sans-serif"}}>{desafioPato.completos} de {desafioPato.total}</span>
              </div>
              <Bar value={desafioPato.completos} max={desafioPato.total} color={desafioPato.completos===desafioPato.total?"#2D9A1A":"#FFC420"} h={7}/>
              <div style={{marginTop:12}}>
                {desafioPato.itens.map((item,idx)=>(
                  <div key={idx} style={{display:"flex",alignItems:"center",gap:9,padding:"6px 0",borderBottom:idx<desafioPato.itens.length-1?"1px solid rgba(0,0,0,0.05)":"none"}}>
                    <div style={{width:20,height:20,borderRadius:6,background:item.feito?"rgba(45,90,16,0.15)":"rgba(0,0,0,0.06)",border:`1px solid ${item.feito?"rgba(45,90,16,0.35)":"rgba(0,0,0,0.12)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,flexShrink:0}}>{item.feito?"✓":""}</div>
                    <span style={{fontSize:12.5,color:item.feito?"#215010":"#5A4A3A",fontFamily:"'DM Sans',sans-serif",fontWeight:item.feito?600:500}}>{item.label}</span>
                  </div>
                ))}
              </div>
              {desafioPato.completos===desafioPato.total&&(
                <div style={{marginTop:10,background:"rgba(255,196,32,0.15)",border:"1px solid rgba(255,196,32,0.4)",borderRadius:10,padding:"9px 12px",fontSize:12,color:"#8B6000",fontFamily:"'DM Sans',sans-serif",fontWeight:600,textAlign:"center"}}>
                  🎉 Desafio completo esse mês! Seu pato agradece.
                </div>
              )}
            </div>

            {/* ── Resumo de Cartões ── */}
            {cartoes.length>0&&(
              <div className={CARD} style={{marginBottom:10,padding:14}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <SL style={{marginBottom:0}}>▭ Cartões</SL>
                  <button onClick={()=>navTo("cartoes")} style={{background:"rgba(0,0,0,0.06)",border:"1px solid rgba(0,0,0,0.1)",borderRadius:8,color:"#1A1209",fontSize:10,fontWeight:700,padding:"4px 10px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Ver todos</button>
                </div>
                {cartoes.map(c=>{
                  const usado=ccGastosMes(c.id);
                  const pct=+c.limite>0?Math.min(usado/+c.limite*100,100):0;
                  const alertaC=pct>=80;
                  return (
                    <div key={c.id} style={{marginBottom:9}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                        <span style={{fontSize:12,fontWeight:600,color:"#1A1209",fontFamily:"'DM Sans',sans-serif"}}>{c.nome}</span>
                        <span className="num" style={{fontSize:12,fontWeight:700,color:alertaC?C.red:"#1A1209"}}>{R(usado)} <span style={{fontSize:10,color:"rgba(26,18,9,0.5)",fontWeight:500}}>de {R(+c.limite)}</span></span>
                      </div>
                      <Bar value={usado} max={+c.limite} color={alertaC?C.red:C.magenta} h={5}/>
                    </div>
                  );
                })}
              </div>
            )}
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
            <div className={CARD} style={{marginBottom:14,padding:"16px 18px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
                <div style={{display:"flex",gap:8}}>
                  <div style={{background:"rgba(255,255,255,0.9)",borderRadius:12,padding:"9px 15px",textAlign:"center",border:"1px solid rgba(45,90,16,0.35)"}}><div style={{fontSize:9.5,color:"#215010",fontWeight:700,letterSpacing:".06em",fontFamily:"'DM Sans',sans-serif"}}>ENTRADAS</div><div className="num" style={{fontSize:15,fontWeight:700,color:"#215010"}}>{R(entradas)}</div></div>
                  <div style={{background:"rgba(255,255,255,0.9)",borderRadius:12,padding:"9px 15px",textAlign:"center",border:"1px solid rgba(196,24,90,0.35)"}}><div style={{fontSize:9.5,color:"#8B1A1A",fontWeight:700,letterSpacing:".06em",fontFamily:"'DM Sans',sans-serif"}}>SAÍDAS</div><div className="num" style={{fontSize:15,fontWeight:700,color:"#8B1A1A"}}>{R(saidas)}</div></div>
                </div>
                <div style={{display:"flex",gap:7}}>
                  <button onClick={()=>setImportOpen(true)} style={{background:"rgba(0,0,0,0.06)",border:"1px solid rgba(0,0,0,0.12)",borderRadius:12,padding:"9px 14px",fontSize:12,fontWeight:700,color:"#1A1209",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:6}}>📥 Importar</button>
                  <button onClick={()=>openM("mov")} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,background:"linear-gradient(135deg,#F0356E,#D01050)",border:"none",borderRadius:12,padding:"9px 16px",fontSize:12,fontWeight:700,color:"#fff",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",boxShadow:"0 4px 14px rgba(232,32,95,0.35)"}}>
                    <span style={{fontSize:14,lineHeight:1}}>✚</span> Lançamento
                  </button>
                </div>
              </div>
            </div>

            <div className={CARD} style={{marginBottom:14,padding:"14px 16px"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                <div style={{width:26,height:26,borderRadius:8,background:"rgba(232,32,95,0.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>🔍</div>
                <span style={{fontSize:12,fontWeight:700,color:"#1A1209",letterSpacing:".04em",textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif"}}>Filtrar lançamentos</span>
              </div>
              <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"flex-end"}}>
                <div>
                  <div style={{fontSize:9.5,fontWeight:700,color:"rgba(26,18,9,0.45)",letterSpacing:".05em",textTransform:"uppercase",marginBottom:4,fontFamily:"'DM Sans',sans-serif"}}>Tipo</div>
                  <select value={filtroMov.tipo} onChange={e=>setFiltroMov({...filtroMov,tipo:e.target.value})}
                    className="filter-select"
                    style={{background:"rgba(255,255,255,0.9)",border:"1.5px solid rgba(0,0,0,0.1)",borderRadius:10,padding:"8px 10px",fontSize:12,color:"#1A1209",outline:"none",fontFamily:"'DM Sans',sans-serif",fontWeight:600,cursor:"pointer",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
                    <option value="todos">Todos</option>
                    <option value="entrada">▲ Entradas</option>
                    <option value="saida">▼ Saídas</option>
                    <option value="transferencia">🔄 Transferências</option>
                  </select>
                </div>
                <div>
                  <div style={{fontSize:9.5,fontWeight:700,color:"rgba(26,18,9,0.45)",letterSpacing:".05em",textTransform:"uppercase",marginBottom:4,fontFamily:"'DM Sans',sans-serif"}}>Categoria</div>
                  <select value={filtroMov.categoria} onChange={e=>setFiltroMov({...filtroMov,categoria:e.target.value})}
                    className="filter-select"
                    style={{background:"rgba(255,255,255,0.9)",border:"1.5px solid rgba(0,0,0,0.1)",borderRadius:10,padding:"8px 10px",fontSize:12,color:"#1A1209",outline:"none",fontFamily:"'DM Sans',sans-serif",fontWeight:600,cursor:"pointer",maxWidth:170,boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
                    <option value="todos">Todas</option>
                    {[...new Set(movs.map(m=>m.categoria.includes("·")?m.categoria.split("·")[0].trim():m.categoria))].sort().map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{fontSize:9.5,fontWeight:700,color:"rgba(26,18,9,0.45)",letterSpacing:".05em",textTransform:"uppercase",marginBottom:4,fontFamily:"'DM Sans',sans-serif"}}>Pagamento</div>
                  <select value={filtroMov.formaPagamento} onChange={e=>setFiltroMov({...filtroMov,formaPagamento:e.target.value})}
                    className="filter-select"
                    style={{background:"rgba(255,255,255,0.9)",border:"1.5px solid rgba(0,0,0,0.1)",borderRadius:10,padding:"8px 10px",fontSize:12,color:"#1A1209",outline:"none",fontFamily:"'DM Sans',sans-serif",fontWeight:600,cursor:"pointer",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
                    <option value="todos">Todas</option>
                    <option value="dinheiro">💵 Dinheiro</option>
                    <option value="pix">📱 Pix</option>
                    <option value="debito">💳 Débito</option>
                    <option value="cartao">🖊️ Cartão</option>
                  </select>
                </div>
                {(filtroMov.tipo!=="todos"||filtroMov.categoria!=="todos"||filtroMov.formaPagamento!=="todos")&&(
                  <button onClick={()=>setFiltroMov({tipo:"todos",categoria:"todos",formaPagamento:"todos"})} style={{display:"flex",alignItems:"center",gap:5,background:"linear-gradient(135deg,#F0356E,#D01050)",border:"none",borderRadius:10,color:"#fff",fontSize:12,fontWeight:700,padding:"8px 14px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",boxShadow:"0 2px 8px rgba(232,32,95,0.3)"}}>✕ Limpar</button>
                )}
              </div>
            </div>

            {(()=>{
              const movsFiltrados=movsDoMes.filter(m=>{
                if(filtroMov.tipo!=="todos"&&m.tipo!==filtroMov.tipo)return false;
                if(filtroMov.categoria!=="todos"){
                  const catPai=m.categoria.includes("·")?m.categoria.split("·")[0].trim():m.categoria;
                  if(catPai!==filtroMov.categoria)return false;
                }
                if(filtroMov.formaPagamento!=="todos"&&(m.formaPagamento||"dinheiro")!==filtroMov.formaPagamento)return false;
                return true;
              });
              return movsFiltrados.length===0?<div className={CARD} style={{textAlign:"center",padding:36,color:"rgba(26,18,9,0.55)",fontSize:14}}>Nenhum lançamento encontrado com esse filtro</div>
              :(
              <div className={CARD} style={{padding:"16px 14px"}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 175px 100px 92px 26px",gap:10,marginBottom:8,padding:"0 4px"}}>
                  <div style={{fontSize:10,fontWeight:700,color:"#1A1209",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif"}}>Descrição</div>
                  <div style={{fontSize:10,fontWeight:700,color:"#1A1209",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif"}}>Categoria</div>
                  <div style={{fontSize:10,fontWeight:700,color:"#1A1209",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif"}}>Data</div>
                  <div style={{fontSize:10,fontWeight:700,color:"#1A1209",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif",textAlign:"right"}}>Valor</div>
                  <div/>
                </div>
                {[...movsFiltrados].sort((a,b)=>b.data.localeCompare(a.data)).map((m,idx)=>{
                  const opts = m.tipo==="entrada" ? (cats?.receita||DEFAULT_CATS.receita) : m.tipo==="transferencia" ? [] : (cats?.despesa||DEFAULT_CATS.despesa);
                  return (
                    <div key={m.id} style={{display:"grid",gridTemplateColumns:"1fr 175px 100px 92px 26px",gap:10,alignItems:"center",padding:"10px 4px",background:idx%2===0?"rgba(0,0,0,0.025)":"transparent",borderRadius:8}}>
                      <div>
                        <input value={m.descricao} onChange={e=>setMovs(movs.map(x=>x.id===m.id?{...x,descricao:e.target.value}:x))}
                          style={{background:"transparent",border:"none",padding:"5px 4px",fontSize:13,color:"#1A1209",fontWeight:600,outline:"none",fontFamily:"'DM Sans',sans-serif",width:"100%"}}/>
                        {m.tipo==="entrada"&&regras.length>0&&(
                          <button onClick={()=>setMovDist(m)} style={{background:"rgba(232,32,95,0.1)",border:"1px solid rgba(232,32,95,0.3)",borderRadius:6,color:"#C4185A",fontSize:9,fontWeight:700,padding:"2px 7px",cursor:"pointer",fontFamily:"inherit",marginLeft:4}}>distribuir</button>
                        )}
                      </div>
                      {m.tipo==="transferencia" ? (
                        <div title={m.investId?invests.find(i=>i.id===m.investId)?.nome:""} style={{display:"flex",alignItems:"center",gap:8,background:"rgba(91,163,212,0.14)",border:"1px solid rgba(91,163,212,0.3)",borderRadius:10,padding:"6px 10px 6px 6px",minWidth:0}}>
                          <div style={{width:26,height:26,borderRadius:8,background:"rgba(91,163,212,0.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>{m.subtipo==="resgate"?"📉":m.investId?"📈":"🔄"}</div>
                          <div style={{minWidth:0}}>
                            <div style={{fontSize:11.5,color:"#1A4A6E",fontWeight:700,fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{m.subtipo==="resgate"?"Resgate":"Transferência"}</div>
                            {m.investId&&<div style={{fontSize:9.5,color:"#1A4A6E",opacity:0.75,fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{invests.find(i=>i.id===m.investId)?.nome||""}</div>}
                          </div>
                        </div>
                      ) : (
                        <div title={m.categoria} style={{display:"flex",alignItems:"center",gap:8,background:m.tipo==="entrada"?"rgba(45,90,16,0.09)":"rgba(196,24,90,0.08)",border:`1px solid ${m.tipo==="entrada"?"rgba(45,90,16,0.22)":"rgba(196,24,90,0.2)"}`,borderRadius:10,padding:"6px 8px 6px 6px",minWidth:0}}>
                          <div style={{width:26,height:26,borderRadius:8,background:m.tipo==="entrada"?"rgba(45,90,16,0.16)":"rgba(196,24,90,0.14)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>{m.categoria.split(" ")[0]}</div>
                          <select value={m.categoria} onChange={e=>setMovs(movs.map(x=>x.id===m.id?{...x,categoria:e.target.value}:x))}
                            className="plt-select"
                            style={{background:"transparent",border:"none",padding:0,fontSize:12,color:m.tipo==="entrada"?"#215010":"#8B1043",fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",width:"100%",minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                            {opts.map(c=>(
                              <React.Fragment key={c.id}>
                                <option value={`${c.emoji} ${c.nome}`}>{c.nome}</option>
                                {(c.subcats||[]).map(s=><option key={s.id} value={`${c.emoji} ${c.nome} · ${s.nome}`}>{c.nome} · {s.nome}</option>)}
                              </React.Fragment>
                            ))}
                            {!opts.some(c=>m.categoria.startsWith(`${c.emoji} ${c.nome}`))&&<option value={m.categoria}>{m.categoria.split(" ").slice(1).join(" ")}</option>}
                          </select>
                        </div>
                      )}
                      <input type="date" value={m.data} onChange={e=>setMovs(movs.map(x=>x.id===m.id?{...x,data:e.target.value}:x))}
                        style={{background:"rgba(255,255,255,0.7)",border:"1px solid rgba(0,0,0,0.12)",borderRadius:8,padding:"6px 5px",fontSize:11,color:"#1A1209",outline:"none",fontFamily:"'DM Sans',sans-serif",width:"100%"}}/>
                      <input type="number" value={m.valor} onChange={e=>setMovs(movs.map(x=>x.id===m.id?{...x,valor:+e.target.value}:x))}
                        className="plt-numinput"
                        style={{background:"rgba(255,255,255,0.7)",border:"1px solid rgba(0,0,0,0.12)",borderRadius:8,padding:"6px 5px",fontSize:12.5,fontWeight:700,color:m.tipo==="entrada"?"#215010":m.tipo==="transferencia"?"#1A4A6E":"#8B1A1A",outline:"none",fontFamily:"'DM Sans',sans-serif",width:"100%",textAlign:"right"}}/>
                      <button onClick={()=>removeMov(m.id)} style={{background:"rgba(0,0,0,0.05)",border:"none",borderRadius:6,color:"#8B1A1A",fontSize:14,cursor:"pointer",lineHeight:1,width:22,height:22,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
                    </div>
                  );
                })}
              </div>
            );
            })()}
          </div>
        )}

        {/* ══ PLANTÕES ══ */}
        {tab==="plantoes"&&(
          <div className="fade">
            <div className={CARD} style={{marginBottom:14,padding:"18px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",background:"linear-gradient(135deg,rgba(255,255,255,0.92),rgba(255,255,255,0.82))"}}>
              <div>
                <div style={{fontSize:28,fontWeight:300,color:TXT,letterSpacing:"-.02em",lineHeight:1}}>{plantoes.length}</div>
                <div style={{fontSize:11,color:"rgba(26,18,9,0.55)",fontFamily:"'DM Sans',sans-serif",marginTop:2,marginBottom:8}}>plantões cadastrados</div>
                <div className="num" style={{fontSize:14,color:C.magenta,fontWeight:700}}>{R(totalPendPlant)}</div>
                <div style={{fontSize:10,color:"rgba(26,18,9,0.5)",fontFamily:"'DM Sans',sans-serif"}}>a receber</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                <button onClick={()=>openM("plt")} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,background:"linear-gradient(135deg,#F0356E,#D01050)",border:"none",borderRadius:12,padding:"10px 18px",fontSize:12.5,fontWeight:700,color:"#fff",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",boxShadow:"0 4px 14px rgba(232,32,95,0.35)",transition:"transform .15s"}}
                  onMouseEnter={e=>e.currentTarget.style.transform="translateY(-1px)"} onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
                  <span style={{fontSize:15,lineHeight:1}}>✚</span> Plantão
                </button>
                <button onClick={()=>setModal("pltLote")} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,background:"rgba(91,163,212,0.15)",border:"1.5px solid rgba(91,163,212,0.4)",borderRadius:12,padding:"10px 18px",fontSize:12.5,fontWeight:700,color:"#1A4A6E",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"transform .15s"}}
                  onMouseEnter={e=>e.currentTarget.style.transform="translateY(-1px)"} onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
                  <span style={{fontSize:14,lineHeight:1}}>📅</span> Vários
                </button>
                <button onClick={()=>openM("emp")} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,background:"rgba(255,255,255,0.9)",border:"1.5px solid rgba(0,0,0,0.1)",borderRadius:12,padding:"10px 18px",fontSize:12.5,fontWeight:700,color:"#1A1209",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",boxShadow:"0 2px 8px rgba(0,0,0,0.08)",transition:"transform .15s"}}
                  onMouseEnter={e=>e.currentTarget.style.transform="translateY(-1px)"} onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
                  <span style={{fontSize:14,lineHeight:1}}>🏥</span> Empresa
                </button>
              </div>
            </div>
            {empresas.length>0&&(
              <div className={CARD} style={{marginBottom:14,padding:"14px 16px"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:11}}>
                  <div style={{width:26,height:26,borderRadius:8,background:"rgba(232,32,95,0.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>🏢</div>
                  <span style={{fontSize:12,fontWeight:700,color:"#1A1209",letterSpacing:".04em",textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif"}}>Empresas</span>
                  <span style={{fontSize:11,color:"rgba(26,18,9,0.4)",fontFamily:"'DM Sans',sans-serif"}}>({empresas.length})</span>
                </div>
                <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                  {empresas.map(e=>(
                    <span key={e.id} onClick={()=>openM("emp",e)} style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:11.5,fontWeight:600,padding:"7px 13px",borderRadius:99,background:"rgba(255,255,255,0.9)",color:"#1A1209",border:"1px solid rgba(0,0,0,0.09)",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",boxShadow:"0 1px 3px rgba(0,0,0,0.05)",transition:"transform .12s"}}>
                      <span style={{width:8,height:8,borderRadius:99,background:e.cor,flexShrink:0}}/>
                      {e.nome}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div style={{display:"flex",background:"#EDE8E0",borderRadius:12,padding:3,marginBottom:14,maxWidth:220}}>
              {[["tabela","📊 Tabela"],["cards","📋 Cards"]].map(([v,l])=>(
                <button key={v} onClick={()=>setPltView(v)} style={{flex:1,background:pltView===v?"#E8205F":"transparent",color:pltView===v?"#fff":"#5A4A3A",border:"none",borderRadius:10,padding:"8px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",transition:"all .15s"}}>{l}</button>
              ))}
            </div>
            <div className={CARD} style={{marginBottom:14,padding:"14px 16px"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                <div style={{width:26,height:26,borderRadius:8,background:"rgba(232,32,95,0.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>🔍</div>
                <span style={{fontSize:12,fontWeight:700,color:"#1A1209",letterSpacing:".04em",textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif"}}>Filtrar plantões</span>
              </div>
              <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"flex-end"}}>
                <div>
                  <div style={{fontSize:9.5,fontWeight:700,color:"rgba(26,18,9,0.45)",letterSpacing:".05em",textTransform:"uppercase",marginBottom:4,fontFamily:"'DM Sans',sans-serif"}}>Empresa</div>
                  <select value={filtroPlt.empresa} onChange={e=>setFiltroPlt({...filtroPlt,empresa:e.target.value})}
                    className="filter-select"
                    style={{background:"rgba(255,255,255,0.9)",border:"1.5px solid rgba(0,0,0,0.1)",borderRadius:10,padding:"8px 10px",fontSize:12,color:"#1A1209",outline:"none",fontFamily:"'DM Sans',sans-serif",fontWeight:600,cursor:"pointer",maxWidth:170,boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
                    <option value="todos">Todas</option>
                    {empresas.map(e=><option key={e.id} value={e.nome}>{e.nome}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{fontSize:9.5,fontWeight:700,color:"rgba(26,18,9,0.45)",letterSpacing:".05em",textTransform:"uppercase",marginBottom:4,fontFamily:"'DM Sans',sans-serif"}}>Status</div>
                  <select value={filtroPlt.status} onChange={e=>setFiltroPlt({...filtroPlt,status:e.target.value})}
                    className="filter-select"
                    style={{background:"rgba(255,255,255,0.9)",border:"1.5px solid rgba(0,0,0,0.1)",borderRadius:10,padding:"8px 10px",fontSize:12,color:"#1A1209",outline:"none",fontFamily:"'DM Sans',sans-serif",fontWeight:600,cursor:"pointer",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
                    <option value="todos">Todos</option>
                    <option value="pendente">Pendente</option>
                    <option value="recebido">Recebido</option>
                    <option value="atrasado">Atrasado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
                <div>
                  <div style={{fontSize:9.5,fontWeight:700,color:"rgba(26,18,9,0.45)",letterSpacing:".05em",textTransform:"uppercase",marginBottom:4,fontFamily:"'DM Sans',sans-serif"}}>Previsão de pagamento</div>
                  <div style={{display:"flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.9)",border:"1.5px solid rgba(0,0,0,0.1)",borderRadius:10,padding:"5px 8px",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
                    <input type="date" value={filtroPlt.dataDe} onChange={e=>setFiltroPlt({...filtroPlt,dataDe:e.target.value})}
                      style={{background:"transparent",border:"none",padding:"3px 0",fontSize:11.5,color:"#1A1209",outline:"none",fontFamily:"'DM Sans',sans-serif",fontWeight:600,width:118}}/>
                    <span style={{fontSize:11,color:"rgba(26,18,9,0.4)",fontWeight:600}}>→</span>
                    <input type="date" value={filtroPlt.dataAte} onChange={e=>setFiltroPlt({...filtroPlt,dataAte:e.target.value})}
                      style={{background:"transparent",border:"none",padding:"3px 0",fontSize:11.5,color:"#1A1209",outline:"none",fontFamily:"'DM Sans',sans-serif",fontWeight:600,width:118}}/>
                  </div>
                </div>
                {(filtroPlt.empresa!=="todos"||filtroPlt.status!=="todos"||filtroPlt.dataDe||filtroPlt.dataAte)&&(
                  <button onClick={()=>setFiltroPlt({empresa:"todos",status:"todos",dataDe:"",dataAte:""})} style={{display:"flex",alignItems:"center",gap:5,background:"linear-gradient(135deg,#F0356E,#D01050)",border:"none",borderRadius:10,color:"#fff",fontSize:12,fontWeight:700,padding:"8px 14px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",boxShadow:"0 2px 8px rgba(232,32,95,0.3)"}}>✕ Limpar</button>
                )}
              </div>
            </div>
            {pltView==="tabela"&&(()=>{
              const plantoesFiltrados=plantoes.filter(p=>{
                if(filtroPlt.empresa!=="todos"&&p.empresa!==filtroPlt.empresa)return false;
                if(filtroPlt.status!=="todos"&&getPltStatus(p)!==filtroPlt.status)return false;
                if(filtroPlt.dataDe&&(!p.previsao||p.previsao<filtroPlt.dataDe))return false;
                if(filtroPlt.dataAte&&(!p.previsao||p.previsao>filtroPlt.dataAte))return false;
                return true;
              });
              const grupos={};
              plantoesFiltrados.forEach(p=>{
                const key=monthKey(p.previsao||p.data)||"sem-data";
                if(!grupos[key])grupos[key]=[];
                grupos[key].push(p);
              });
              const mk=pltMes;
              const grupo=(grupos[mk]||[]).slice().sort((a,b)=>(a.data||"").localeCompare(b.data||""));
              const totalMes=grupo.reduce((s,p)=>s+(+p.valorTotal||0),0);
              return (
                <div className={CARD} style={{marginBottom:16,padding:"18px 16px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,paddingBottom:12,borderBottom:"2px solid rgba(0,0,0,0.08)"}}>
                    <button onClick={()=>setPltMes(shiftMonth(pltMes,-1))} style={{background:"rgba(0,0,0,0.05)",border:"1px solid rgba(0,0,0,0.1)",borderRadius:10,width:34,height:34,cursor:"pointer",fontSize:16,color:"#1A1209",display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
                    <div style={{textAlign:"center"}}>
                      <div style={{fontSize:17,fontWeight:700,color:"#1A1209",fontFamily:"'DM Sans',sans-serif",textTransform:"capitalize"}}>{monthLabel(mk)}</div>
                      <div className="num" style={{fontSize:13,fontWeight:700,color:C.magenta}}>{R(totalMes)}</div>
                    </div>
                    <button onClick={()=>setPltMes(shiftMonth(pltMes,1))} style={{background:"rgba(0,0,0,0.05)",border:"1px solid rgba(0,0,0,0.1)",borderRadius:10,width:34,height:34,cursor:"pointer",fontSize:16,color:"#1A1209",display:"flex",alignItems:"center",justifyContent:"center"}}>›</button>
                  </div>
                  {grupo.length===0?(
                    <div style={{textAlign:"center",padding:"24px 0",color:"rgba(26,18,9,0.45)",fontSize:13,fontFamily:"'DM Sans',sans-serif"}}>Nenhum plantão em {monthLabel(mk)}</div>
                  ):(
                    <>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 95px 85px 100px 92px 26px",gap:6,marginBottom:8,padding:"0 4px"}}>
                        <div style={{fontSize:10,fontWeight:700,color:"rgba(26,18,9,0.5)",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif"}}>Empresa</div>
                        <div style={{fontSize:10,fontWeight:700,color:"rgba(26,18,9,0.5)",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif"}}>Dia</div>
                        <div style={{fontSize:10,fontWeight:700,color:"rgba(26,18,9,0.5)",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif"}}>Valor</div>
                        <div style={{fontSize:10,fontWeight:700,color:"rgba(26,18,9,0.5)",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif"}}>Data prov.</div>
                        <div style={{fontSize:10,fontWeight:700,color:"rgba(26,18,9,0.5)",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif"}}>Status</div>
                        <div/>
                      </div>
                      {grupo.map((p,idx)=>{
                        const emp=empNome(p.empresa);
                        return (
                          <div key={p.id} style={{display:"grid",gridTemplateColumns:"1fr 95px 85px 100px 92px 26px",gap:6,alignItems:"center",padding:"9px 4px",background:idx%2===0?"rgba(0,0,0,0.02)":"transparent",borderRadius:8}}>
                            <div style={{display:"flex",alignItems:"center",gap:7,minWidth:0}}>
                              <div style={{width:8,height:8,borderRadius:99,background:emp.cor||C.magenta,flexShrink:0}}/>
                              <select value={p.empresa} onChange={e=>updatePlantao(p.id,{empresa:e.target.value})}
                                className="plt-select"
                                style={{background:"transparent",border:"none",padding:"6px 4px",fontSize:14,color:"#1A1209",fontWeight:600,cursor:"pointer",fontFamily:"inherit",width:"100%",minWidth:0}}>
                                {empresas.map(e=><option key={e.id} value={e.nome}>{e.nome}</option>)}
                                {!empresas.find(e=>e.nome===p.empresa)&&<option value={p.empresa}>{p.empresa}</option>}
                              </select>
                            </div>
                            <input type="date" value={p.data||""} onChange={e=>updatePlantao(p.id,{data:e.target.value})}
                              style={{background:"rgba(255,255,255,0.7)",border:"1px solid rgba(0,0,0,0.12)",borderRadius:8,padding:"7px 4px",fontSize:11,color:"#1A1209",outline:"none",fontFamily:"'DM Sans',sans-serif",width:"100%"}}/>
                            <input type="number" value={p.valorTotal} onChange={e=>updatePlantao(p.id,{valorTotal:+e.target.value})}
                              className="plt-numinput"
                              style={{background:"rgba(255,255,255,0.7)",border:"1px solid rgba(0,0,0,0.12)",borderRadius:8,padding:"7px 5px",fontSize:13,color:"#2D5A10",fontWeight:700,outline:"none",fontFamily:"'DM Sans',sans-serif",width:"100%"}}/>
                            <input type="date" value={p.previsao||""} onChange={e=>updatePlantao(p.id,{previsao:e.target.value})}
                              style={{background:"rgba(255,255,255,0.7)",border:"1px solid rgba(0,0,0,0.12)",borderRadius:8,padding:"7px 4px",fontSize:11,color:"#1A1209",outline:"none",fontFamily:"'DM Sans',sans-serif",width:"100%"}}/>
                            {p.status==="recebido"?(
                              <div style={{background:"rgba(143,196,58,0.2)",border:"1px solid rgba(45,90,16,0.3)",borderRadius:7,padding:"6px 4px",fontSize:10,fontWeight:700,color:"#2D5A10",textAlign:"center",fontFamily:"'DM Sans',sans-serif"}}>✓ Recebido</div>
                            ):(
                              <button onClick={()=>marcarRecebido(p.id)} style={{background:"rgba(232,32,95,0.1)",border:"1px solid rgba(232,32,95,0.35)",borderRadius:7,padding:"6px 4px",fontSize:10,fontWeight:700,color:"#E8205F",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",width:"100%"}}>Receber</button>
                            )}
                            <button onClick={()=>remove(plantoes,setPlantoes,p.id)} style={{background:"rgba(0,0,0,0.05)",border:"none",borderRadius:6,color:"#8B1A1A",fontSize:14,cursor:"pointer",lineHeight:1,width:22,height:22,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              );
            })()}
            {pltView==="cards"&&<>
            {(()=>{
              const plantoesEfetivosFiltrados=plantoesEfetivos.filter(p=>{
                if(filtroPlt.empresa!=="todos"&&p.empresa!==filtroPlt.empresa)return false;
                if(filtroPlt.status!=="todos"&&p.se!==filtroPlt.status)return false;
                if(filtroPlt.dataDe&&(!p.previsao||p.previsao<filtroPlt.dataDe))return false;
                if(filtroPlt.dataAte&&(!p.previsao||p.previsao>filtroPlt.dataAte))return false;
                return true;
              });
              return plantoesEfetivosFiltrados.length===0?<div className={CARD} style={{textAlign:"center",padding:36,color:"rgba(26,18,9,0.55)",fontSize:14}}>Nenhum plantão encontrado com esse filtro</div>
              :[...plantoesEfetivosFiltrados].sort((a,b)=>b.data.localeCompare(a.data)).map(p=>{
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
              });
            })()}
            </>}
          </div>
        )}

        {/* ══ ANÁLISE ══ */}
        {tab==="analise"&&(
          <div className="fade">
            {/* Título */}
            <div style={{background:"rgba(255,255,255,0.92)",backdropFilter:"blur(12px)",borderRadius:14,padding:"12px 16px",border:"1px solid rgba(255,255,255,0.98)",marginBottom:12,boxShadow:"0 2px 12px rgba(0,0,0,0.08)"}}>
              <div style={{fontSize:22,fontWeight:300,color:"#1A1209"}}>Análise Completa</div>
            </div>

            {/* Presente vs Futuro */}
            {(presenteVsFuturo.gastoSuperfluo>0||presenteVsFuturo.totalFuturo>0)&&(
              <div className={CARD} style={{marginBottom:10,padding:"16px 18px"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                  <div style={{width:26,height:26,borderRadius:8,background:"rgba(91,163,212,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>🔮</div>
                  <span style={{fontSize:12,fontWeight:700,color:"#1A1209",letterSpacing:".04em",textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif"}}>Presente vs Futuro</span>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                  <div style={{background:"rgba(139,26,26,0.07)",border:"1px solid rgba(139,26,26,0.18)",borderRadius:10,padding:"11px 13px"}}>
                    <div style={{fontSize:9.5,fontWeight:700,color:"#8B1A1A",letterSpacing:".05em",textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif",marginBottom:4}}>🍟 Gasto no agora</div>
                    <div className="num" style={{fontSize:17,fontWeight:700,color:"#8B1A1A"}}>{R(presenteVsFuturo.gastoSuperfluo)}</div>
                    <div style={{fontSize:9,color:"#8B1A1A",opacity:0.7,fontFamily:"'DM Sans',sans-serif",marginTop:2}}>lazer, delivery, compras por impulso...</div>
                  </div>
                  <div style={{background:"rgba(45,90,16,0.08)",border:"1px solid rgba(45,90,16,0.2)",borderRadius:10,padding:"11px 13px"}}>
                    <div style={{fontSize:9.5,fontWeight:700,color:"#215010",letterSpacing:".05em",textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif",marginBottom:4}}>🌱 Guardado pro futuro</div>
                    <div className="num" style={{fontSize:17,fontWeight:700,color:"#215010"}}>{R(presenteVsFuturo.totalFuturo)}</div>
                    <div style={{fontSize:9,color:"#215010",opacity:0.7,fontFamily:"'DM Sans',sans-serif",marginTop:2}}>investimentos, objetivos, dívidas</div>
                  </div>
                </div>
                <div style={{background:presenteVsFuturo.diferenca>0?"rgba(212,168,67,0.15)":"rgba(45,90,16,0.08)",border:`1px solid ${presenteVsFuturo.diferenca>0?"rgba(212,168,67,0.4)":"rgba(45,90,16,0.2)"}`,borderRadius:10,padding:"10px 13px",fontSize:12,color:presenteVsFuturo.diferenca>0?"#6B4C00":"#215010",fontFamily:"'DM Sans',sans-serif",lineHeight:1.5}}>
                  {presenteVsFuturo.diferenca>0
                    ? <>⚠ Você gastou <strong>{R(presenteVsFuturo.diferenca)}</strong> a mais no agora do que guardou pro futuro esse mês. Vale repensar algumas compras do momento.</>
                    : <>✅ Você guardou mais pro futuro do que gastou em coisas do momento — seguindo bem!</>
                  }
                </div>
              </div>
            )}

            {/* Onde economizar */}
            {analiseEconomia.length>0&&(
              <div className={CARD} style={{marginBottom:10,padding:"16px 18px"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                  <div style={{width:26,height:26,borderRadius:8,background:"rgba(212,168,67,0.18)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>💡</div>
                  <span style={{fontSize:12,fontWeight:700,color:"#1A1209",letterSpacing:".04em",textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif"}}>Onde você pode economizar</span>
                </div>
                {analiseEconomia.map((r,idx)=>(
                  <div key={r.cat} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 4px",borderBottom:idx<analiseEconomia.length-1?"1px solid rgba(0,0,0,0.06)":"none"}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:600,color:"#1A1209",fontFamily:"'DM Sans',sans-serif"}}>{r.cat}</div>
                      <div style={{fontSize:10.5,color:r.percentualAcima>15?"#8B1A1A":"#5A4A3A",fontFamily:"'DM Sans',sans-serif",marginTop:2}}>
                        {r.percentualAcima>15
                          ? <>⚠ {r.percentualAcima.toFixed(0)}% acima da sua média (últimos 3 meses: {R(r.media)})</>
                          : r.naoEssencial
                          ? <>💭 categoria não essencial — boa candidata pra cortar</>
                          : <>dentro da sua média histórica</>
                        }
                      </div>
                    </div>
                    <div className="num" style={{fontSize:14,fontWeight:700,color:r.percentualAcima>15?"#8B1A1A":"#1A1209",marginLeft:10}}>{R(r.atual)}</div>
                  </div>
                ))}
                <div style={{marginTop:10,paddingTop:10,borderTop:"1px solid rgba(0,0,0,0.06)",fontSize:10.5,color:"rgba(26,18,9,0.5)",fontFamily:"'DM Sans',sans-serif",lineHeight:1.5}}>
                  Comparando com a média dos 3 meses anteriores. Categorias como Lazer e Vestuário costumam ter mais espaço pra cortar do que Moradia ou Saúde.
                </div>
              </div>
            )}

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

                {/* ── Ganho por hora trabalhada ── */}
                {empPorHora.length>0&&(
                  <div className={CARD} style={{marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                      <SL style={{marginBottom:0}}>💰 Ganho por hora trabalhada</SL>
                      <span style={{fontSize:10,color:"rgba(26,18,9,0.45)",fontFamily:"'DM Sans',sans-serif"}}>só plantões com horas registradas</span>
                    </div>
                    {empPorHora.map((e,idx)=>(
                      <HBar key={e.nome} label={idx===0?`🏆 ${e.nome}`:e.nome} value={e.valorHora} max={maxValorHora} color={idx===0?"#2D9A1A":(e.cor||C.magenta)} sub={`${R(e.valorHora)}/h`}/>
                    ))}
                  </div>
                )}

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
            <div className={CARD} style={{marginBottom:16,padding:"18px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",background:"linear-gradient(135deg,rgba(255,255,255,0.94),rgba(255,255,255,0.86))"}}>
              <div>
                <div style={{fontSize:11,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",color:"rgba(26,18,9,0.55)",fontFamily:"'DM Sans',sans-serif",marginBottom:4}}>📈 Investimentos</div>
                <div className="num" style={{fontSize:26,fontWeight:700,color:C.green,letterSpacing:"-.02em",lineHeight:1}}>{R(totalInvestido)}</div>
                <div style={{fontSize:10,color:"rgba(26,18,9,0.55)",fontFamily:"'DM Sans',sans-serif",marginTop:3}}>total investido</div>
              </div>
              <button onClick={()=>openM("inv")} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,background:"linear-gradient(135deg,#F0356E,#D01050)",border:"none",borderRadius:12,padding:"10px 16px",fontSize:12.5,fontWeight:700,color:"#fff",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",boxShadow:"0 4px 14px rgba(232,32,95,0.35)"}}>
                <span style={{fontSize:15,lineHeight:1}}>✚</span> Investimento
              </button>
            </div>
            {invests.length>1&&(()=>{
              const ranking=[...invests].map(i=>({...i,txEf:taxaEfetiva(i)})).sort((a,b)=>b.txEf-a.txEf);
              const maxTx=Math.max(...ranking.map(i=>i.txEf),1);
              return (
                <div className={CARD} style={{marginBottom:16,padding:"16px 18px"}}>
                  <div style={{fontSize:12,fontWeight:700,color:"#1A1209",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif",marginBottom:12}}>📊 Onde vale mais a pena alocar</div>
                  {ranking.map((i,idx)=>(
                    <div key={i.id} style={{marginBottom:10}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                        <span style={{fontSize:12,fontWeight:600,color:"#1A1209",fontFamily:"'DM Sans',sans-serif"}}>{idx===0&&"🏆 "}{i.nome}</span>
                        <span className="num" style={{fontSize:12,fontWeight:700,color:idx===0?"#2D5A10":"#1A1209"}}>{i.txEf.toFixed(2)}% a.a.</span>
                      </div>
                      <div style={{background:"rgba(0,0,0,0.1)",borderRadius:99,height:6,overflow:"hidden"}}>
                        <div style={{width:`${(i.txEf/maxTx*100)}%`,height:"100%",background:idx===0?"#2D9A1A":"#5BA3D4",borderRadius:99,transition:"width .5s"}}/>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
            {invests.length===0?<div className={CARD} style={{textAlign:"center",padding:36,color:"rgba(26,18,9,0.55)",fontSize:14}}>Nenhum investimento registrado</div>
              :(()=>{
                const idx=Math.max(0,Math.min(investIdx,invests.length-1));
                const i=invests[idx];
                const catInfo=INVEST_CATEGORIAS.find(c=>c.id===categoriaDoInvest(i.tipo));
                const catIcon={fixa:"📊",variavel:"📈",fundos:"🏦",outros:"📦"}[catInfo?.id]||"📦";
                const txEf=taxaEfetiva(i);
                const rend=i.aporte*txEf/100/12;
                const objsVinc=objetivos.filter(o=>o.investId===i.id);
                const divsVinc=dividas.filter(d=>d.tipo==="fundo"&&d.investId===i.id);
                const totalReservado=objsVinc.reduce((s,o)=>s+(+o.atual||0),0)+divsVinc.reduce((s,d)=>s+(+d.pago||0),0);
                const livreNoInvest=i.aporte-totalReservado;
                return (
                  <>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                      <button onClick={()=>setInvestIdx(idx===0?invests.length-1:idx-1)} style={{background:"rgba(255,255,255,0.75)",border:"1px solid rgba(0,0,0,0.1)",borderRadius:10,width:36,height:36,cursor:"pointer",fontSize:17,color:"#1A1209",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>‹</button>
                      <div style={{background:"rgba(255,255,255,0.85)",borderRadius:12,padding:"6px 16px",boxShadow:"0 2px 8px rgba(0,0,0,0.06)",textAlign:"center"}}>
                        <div style={{fontSize:10,fontWeight:700,color:"#1A1209",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif"}}>{catIcon} {catInfo?.label}</div>
                        <div style={{fontSize:11,color:"rgba(26,18,9,0.5)",fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>{idx+1} de {invests.length}</div>
                      </div>
                      <button onClick={()=>setInvestIdx(idx===invests.length-1?0:idx+1)} style={{background:"rgba(255,255,255,0.75)",border:"1px solid rgba(0,0,0,0.1)",borderRadius:10,width:36,height:36,cursor:"pointer",fontSize:17,color:"#1A1209",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>›</button>
                    </div>
                    {invests.length>1&&(
                      <div style={{display:"flex",gap:5,justifyContent:"center",marginBottom:14,flexWrap:"wrap"}}>
                        {invests.map((inv,dotIdx)=>(
                          <button key={inv.id} onClick={()=>setInvestIdx(dotIdx)} title={inv.nome}
                            style={{width:dotIdx===idx?18:7,height:7,borderRadius:99,border:"none",background:dotIdx===idx?"#E8205F":"rgba(0,0,0,0.18)",cursor:"pointer",transition:"all .2s",padding:0}}/>
                        ))}
                      </div>
                    )}
                    <div className={CARD} style={{marginBottom:10}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                        <div><div style={{fontSize:14,fontWeight:600,fontFamily:"'DM Sans',sans-serif",color:TXT}}>{i.nome}</div><div style={{fontSize:11,color:"#3D3226",fontFamily:"'DM Sans',sans-serif",marginTop:1,fontWeight:500}}>{i.tipo}{i.banco&&` · ${i.banco}`} · desde {fd(i.data)}</div></div>
                        <div className="num" style={{fontSize:16,fontWeight:700,color:C.green}}>{R(i.aporte)}</div>
                      </div>
                      <div style={{display:"flex",gap:8,background:"rgba(0,0,0,0.05)",borderRadius:10,border:"1px solid rgba(0,0,0,0.07)",padding:"9px 11px",marginBottom:9}}>
                        <div style={{flex:1,textAlign:"center"}}>
                          <div style={{fontSize:9,color:"#1A1209",fontFamily:"'DM Sans',sans-serif",fontWeight:700,letterSpacing:".06em",marginBottom:2}}>TAXA A.A.</div>
                          <div className="num" style={{fontSize:14,fontWeight:700,color:C.green}}>{txEf?txEf.toFixed(2):"—"}%</div>
                          {i.taxaModo==="cdi"&&i.percCDI&&<div style={{fontSize:9,color:"#3D3226",fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>{i.percCDI}% do CDI</div>}
                        </div>
                        <div style={{width:1,background:"rgba(0,0,0,0.1)"}}/>
                        <div style={{flex:1,textAlign:"center"}}><div style={{fontSize:9,color:"#1A1209",fontFamily:"'DM Sans',sans-serif",fontWeight:700,letterSpacing:".06em",marginBottom:2}}>REND./MÊS</div><div className="num" style={{fontSize:14,fontWeight:700,color:C.green}}>{R(rend)}</div></div>
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
                            <span style={{fontSize:10,color:"#1A1209",fontFamily:"'DM Sans',sans-serif",fontWeight:700}}>Livre neste investimento</span>
                            <span className="num" style={{fontSize:11,fontWeight:700,color:livreNoInvest>=0?"#2D5A10":"#8B1A1A"}}>{R(livreNoInvest)}</span>
                          </div>
                          {livreNoInvest<0&&(
                            <div style={{marginTop:6,background:"rgba(139,26,26,0.1)",border:"1px solid rgba(139,26,26,0.3)",borderRadius:8,padding:"6px 10px",fontSize:10,color:"#5A0A0A",fontFamily:"'DM Sans',sans-serif",fontWeight:700}}>
                              ⚠ Você alocou mais do que tem guardado aqui
                            </div>
                          )}
                        </div>
                      )}
                      {i.obs&&<div style={{fontSize:11,color:"#3D3226",marginBottom:8,fontFamily:"'DM Sans',sans-serif",fontWeight:500}}>{i.obs}</div>}

                      {investExpandido===i.id&&(()=>{
                        const hist=(i.historicoTaxas||[]).slice().sort((a,b)=>a.mes.localeCompare(b.mes));
                        const jurosAcumulado=hist.reduce((s,h)=>s+(i.aporte*h.taxa/100/12),0);
                        return (
                          <div style={{background:"rgba(0,0,0,0.03)",borderRadius:10,padding:"10px 12px",marginBottom:9,border:"1px solid rgba(0,0,0,0.06)"}}>
                            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                              <div style={{fontSize:10,fontWeight:700,color:"rgba(26,18,9,0.5)",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif"}}>Histórico de juros mensal</div>
                              {hist.length>0&&<span className="num" style={{fontSize:11,fontWeight:700,color:"#2D5A10"}}>≈{R(jurosAcumulado)} acumulado</span>}
                            </div>
                            {hist.length===0&&<div style={{fontSize:11,color:"rgba(26,18,9,0.45)",fontFamily:"'DM Sans',sans-serif",marginBottom:8}}>Nenhum mês registrado ainda.</div>}
                            {hist.map(h=>(
                              <div key={h.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:"1px solid rgba(0,0,0,0.05)"}}>
                                <span style={{fontSize:11.5,color:"#1A1209",fontFamily:"'DM Sans',sans-serif",fontWeight:600,textTransform:"capitalize"}}>{monthLabel(h.mes)}</span>
                                <div style={{display:"flex",alignItems:"center",gap:8}}>
                                  <span className="num" style={{fontSize:12,fontWeight:700,color:"#2D5A10"}}>{h.taxa}% a.a.</span>
                                  <button onClick={()=>removeJuros(i.id,h.id)} style={{background:"none",border:"none",color:"#aaa",fontSize:14,cursor:"pointer",lineHeight:1}}>×</button>
                                </div>
                              </div>
                            ))}
                            <div style={{display:"flex",gap:6,marginTop:8}}>
                              <input type="month" value={fJuros.mes} onChange={e=>setFJuros({...fJuros,mes:e.target.value})}
                                style={{flex:1,background:"#F5F0E8",border:"1.5px solid #DDD5C8",borderRadius:8,padding:"7px 8px",fontSize:11,color:"#1A1209",outline:"none",fontFamily:"inherit"}}/>
                              <input placeholder="Taxa % a.a." value={fJuros.taxa} onChange={e=>setFJuros({...fJuros,taxa:e.target.value})}
                                style={{flex:1,background:"#F5F0E8",border:"1.5px solid #DDD5C8",borderRadius:8,padding:"7px 8px",fontSize:11,color:"#1A1209",outline:"none",fontFamily:"inherit"}}/>
                              <button onClick={()=>addJuros(i.id)} style={{background:"#E8205F",border:"none",borderRadius:8,padding:"7px 12px",fontSize:11,fontWeight:700,color:"#fff",cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>+ Add</button>
                            </div>
                          </div>
                        );
                      })()}

                      <div style={{display:"flex",gap:7}}>
                        <button onClick={()=>setInvestExpandido(investExpandido===i.id?null:i.id)} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:5,background:"rgba(91,163,212,0.12)",border:"1px solid rgba(91,163,212,0.3)",borderRadius:10,color:"#1A4A6E",fontSize:11.5,fontWeight:700,padding:"8px 10px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>{investExpandido===i.id?"▲ Fechar":"📊 Juros"}</button>
                        <button onClick={()=>openM("inv",i)} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:5,background:"rgba(0,0,0,0.06)",border:"1px solid rgba(0,0,0,0.12)",borderRadius:10,color:"#1A1209",fontSize:11.5,fontWeight:700,padding:"8px 10px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>✎ Editar</button>
                        <button onClick={()=>{remove(invests,setInvests,i.id);setInvestIdx(0);}} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:5,background:"rgba(139,26,26,0.1)",border:"1px solid rgba(139,26,26,0.28)",borderRadius:10,color:"#8B1A1A",fontSize:11.5,fontWeight:700,padding:"8px 12px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>🗑</button>
                      </div>
                    </div>
                  </>
                );
              })()}
          </div>
        )}

        {/* ══ OBJETIVOS ══ */}
        {tab==="objetivos"&&(
          <div className="fade">
            <div className={CARD} style={{marginBottom:16,padding:"18px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",background:"linear-gradient(135deg,rgba(255,255,255,0.92),rgba(255,255,255,0.82))"}}>
              <div>
                <div style={{fontSize:11,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",color:"rgba(26,18,9,0.55)",fontFamily:"'DM Sans',sans-serif",marginBottom:4}}>🎯 Objetivos</div>
                <div className="num" style={{fontSize:26,fontWeight:700,color:C.magenta,letterSpacing:"-.02em",lineHeight:1}}>{objetivos.length}</div>
                <div style={{fontSize:10,color:"rgba(26,18,9,0.55)",fontFamily:"'DM Sans',sans-serif",marginTop:3}}>{objetivos.length===1?"meta cadastrada":"metas cadastradas"}</div>
              </div>
              <button onClick={()=>openM("obj")} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,background:"linear-gradient(135deg,#F0356E,#D01050)",border:"none",borderRadius:12,padding:"10px 16px",fontSize:12.5,fontWeight:700,color:"#fff",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",boxShadow:"0 4px 14px rgba(232,32,95,0.35)"}}>
                <span style={{fontSize:15,lineHeight:1}}>✚</span> Objetivo
              </button>
            </div>
            {objetivos.length===0?<div className={CARD} style={{textAlign:"center",padding:36,color:"rgba(26,18,9,0.55)",fontSize:14}}>Crie seus objetivos financeiros</div>
              :objetivos.map(o=>{const pct=o.meta>0?Math.min(o.atual/o.meta*100,100):0;const d=daysUntil(o.prazo);
                const invVinc=o.investId?invests.find(i=>i.id===o.investId):null;
                const partes=o.partes||[];
                const totalPartes=partes.reduce((s,p)=>s+p.valor,0);
                const isExp=objExpandido===o.id;
                return <div key={o.id} className={CARD} style={{marginBottom:12,borderLeft:`3px solid ${o.cor}`}}>
                  <div onClick={()=>setObjExpandido(isExp?null:o.id)} style={{display:"flex",justifyContent:"space-between",marginBottom:9,cursor:"pointer"}}>
                    <div style={{display:"flex",gap:10}}>
                      <div style={{width:34,height:34,borderRadius:10,background:`${o.cor}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0,marginTop:1}}>🎯</div>
                      <div>
                        <div style={{fontSize:14,fontWeight:700,fontFamily:"'DM Sans',sans-serif",color:"#1A1209",display:"flex",alignItems:"center",gap:6}}>{o.nome}<span style={{fontSize:10,color:TMUT}}>{isExp?"▲":"▼"}</span></div>
                      {invVinc&&<div style={{fontSize:10,color:"#2D5A10",fontFamily:"'DM Sans',sans-serif",marginTop:2,fontWeight:600}}>📈 {invVinc.nome}{invVinc.banco?" · "+invVinc.banco:""}{invVinc.taxa?" · "+invVinc.taxa+"% a.a.":""}</div>}
                      {o.prazo&&<div style={{fontSize:10,color:"rgba(26,18,9,0.85)",fontFamily:"'DM Sans',sans-serif",marginTop:1}}>Prazo: {fdFull(o.prazo)}{d!==null&&<span style={{color:d<=30?C.gold:TSUB}}> · {d>0?`${d}d`:d===0?"Hoje":"Vencido"}</span>}</div>}
                      {o.obs&&<div style={{fontSize:10,color:"rgba(26,18,9,0.55)",marginTop:2,fontFamily:"'DM Sans',sans-serif"}}>{o.obs}</div>}
                    </div>
                    </div>
                    <div style={{textAlign:"right"}}><div className="num" style={{fontSize:15,fontWeight:700,color:TXT}}>{R(o.atual)}</div><div style={{fontSize:10,color:"rgba(26,18,9,0.85)",fontFamily:"'DM Sans',sans-serif"}}>de {R(o.meta)}</div></div>
                  </div>
                  <Bar value={o.atual} max={o.meta} color={o.cor} h={7}/>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"rgba(26,18,9,0.55)",fontFamily:"'DM Sans',sans-serif",marginTop:5,marginBottom:10}}><span style={{fontWeight:700,color:o.cor}}>{pct.toFixed(1)}%</span><span>Falta {R(Math.max(o.meta-o.atual,0))}</span></div>

                  {isExp&&(
                    <div style={{background:"rgba(0,0,0,0.03)",borderRadius:10,padding:"10px 12px",marginBottom:10,border:"1px solid rgba(0,0,0,0.06)"}}>
                      <div style={{fontSize:10,fontWeight:700,color:"rgba(26,18,9,0.5)",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif",marginBottom:8}}>Onde está esse dinheiro e para quê</div>
                      {partes.length===0&&<div style={{fontSize:11,color:TMUT,fontFamily:"'DM Sans',sans-serif",marginBottom:8}}>Nenhum detalhamento ainda. Adicione abaixo.</div>}
                      {partes.map(p=>{
                        const pInv=p.investId?invests.find(i=>i.id===p.investId):null;
                        return (
                          <div key={p.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"1px solid rgba(0,0,0,0.05)"}}>
                            <div>
                              <div style={{fontSize:12,fontWeight:600,color:"#1A1209",fontFamily:"'DM Sans',sans-serif"}}>{p.descricao}</div>
                              <div style={{fontSize:10,color:pInv?"#2D5A10":TMUT,fontFamily:"'DM Sans',sans-serif"}}>{pInv?`📈 ${pInv.nome}${pInv.banco?" · "+pInv.banco:""}`:"Sem vínculo"}</div>
                            </div>
                            <div style={{display:"flex",alignItems:"center",gap:8}}>
                              <span className="num" style={{fontSize:12,fontWeight:700,color:o.cor}}>{R(p.valor)}</span>
                              <button onClick={()=>removeParte(o.id,p.id)} style={{background:"none",border:"none",color:"#aaa",fontSize:15,cursor:"pointer",lineHeight:1}}>×</button>
                            </div>
                          </div>
                        );
                      })}
                      {partes.length>0&&(
                        <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",fontSize:10,color:TMUT,fontFamily:"'DM Sans',sans-serif"}}>
                          <span>Total detalhado</span>
                          <span style={{fontWeight:700,color:totalPartes===o.atual?"#2D5A10":"#8B6000"}}>{R(totalPartes)} de {R(o.atual)}</span>
                        </div>
                      )}
                      <div style={{marginTop:8,paddingTop:8,borderTop:"1px solid rgba(0,0,0,0.06)"}}>
                        <div style={{display:"flex",gap:6,marginBottom:6}}>
                          <input placeholder="Finalidade (ex: Passagem aérea)" value={fParte.descricao} onChange={e=>setFParte({...fParte,descricao:e.target.value})}
                            style={{flex:2,background:"#F5F0E8",border:"1.5px solid #DDD5C8",borderRadius:8,padding:"7px 9px",fontSize:11,color:"#1A1209",outline:"none",fontFamily:"inherit"}}/>
                          <input placeholder="R$" value={fParte.valor} onChange={e=>setFParte({...fParte,valor:e.target.value})}
                            style={{flex:1,background:"#F5F0E8",border:"1.5px solid #DDD5C8",borderRadius:8,padding:"7px 9px",fontSize:11,color:"#1A1209",outline:"none",fontFamily:"inherit"}}/>
                        </div>
                        <div style={{display:"flex",gap:6}}>
                          <select value={fParte.investId} onChange={e=>setFParte({...fParte,investId:e.target.value})}
                            className="filter-select"
                            style={{flex:1,background:"#F5F0E8",border:"1.5px solid #DDD5C8",borderRadius:8,padding:"7px 26px 7px 9px",fontSize:11,color:"#1A1209",outline:"none",fontFamily:"inherit"}}>
                            <option value="">Sem vínculo de investimento</option>
                            {invests.map(i=><option key={i.id} value={i.id}>{i.nome}{i.banco?" · "+i.banco:""}</option>)}
                          </select>
                          <button onClick={()=>addParte(o.id)} style={{background:"#E8205F",border:"none",borderRadius:8,padding:"7px 14px",fontSize:11,fontWeight:700,color:"#fff",cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>+ Adicionar</button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div style={{display:"flex",gap:8}}>
                    <button onClick={()=>openM("aporte",null,o.id)} style={{flex:1.4,display:"flex",alignItems:"center",justifyContent:"center",gap:6,background:"linear-gradient(135deg,rgba(58,120,25,0.95),rgba(33,80,16,0.95))",border:"none",borderRadius:11,color:"#fff",fontSize:12,fontWeight:700,padding:"9px 12px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",boxShadow:"0 3px 10px rgba(45,90,16,0.3)",transition:"transform .12s"}}>
                      <span style={{fontSize:14,lineHeight:1}}>✚</span> Aporte
                    </button>
                    <button onClick={()=>openM("obj",o)} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:5,background:"rgba(255,255,255,0.9)",border:"1px solid rgba(0,0,0,0.12)",borderRadius:11,color:"#1A1209",fontSize:12,fontWeight:700,padding:"9px 10px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",boxShadow:"0 2px 6px rgba(0,0,0,0.05)"}}>
                      ✎ Editar
                    </button>
                    <button onClick={()=>remove(objetivos,setObjetivos,o.id)} style={{width:42,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(139,26,26,0.1)",border:"1px solid rgba(139,26,26,0.3)",borderRadius:11,color:"#8B1A1A",fontSize:15,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                      🗑
                    </button>
                  </div>
                </div>;
              })
            }
          </div>
        )}

        {/* ══ DÍVIDAS ══ */}
        {tab==="dividas"&&(
          <div className="fade">
            <div className={CARD} style={{marginBottom:16,padding:"18px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12,background:"linear-gradient(135deg,rgba(255,255,255,0.92),rgba(255,255,255,0.82))"}}>
              <div>
                <div style={{fontSize:11,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",color:"rgba(26,18,9,0.55)",fontFamily:"'DM Sans',sans-serif",marginBottom:4}}>💳 Dívidas</div>
                <div className="num" style={{fontSize:26,fontWeight:700,color:"#8B1A1A",letterSpacing:"-.02em",lineHeight:1}}>{R(totalDividas)}</div>
                <div style={{fontSize:10,color:"rgba(26,18,9,0.55)",fontFamily:"'DM Sans',sans-serif",marginTop:3}}>em aberto</div>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>openM("div")} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,background:"rgba(0,0,0,0.06)",border:"1px solid rgba(0,0,0,0.12)",borderRadius:12,padding:"10px 14px",fontSize:12,fontWeight:700,color:"#1A1209",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                  <span style={{fontSize:14,lineHeight:1}}>✚</span> Dívida
                </button>
                <button onClick={()=>setModal("cartaoRenegoc")} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,background:"linear-gradient(135deg,#F0356E,#D01050)",border:"none",borderRadius:12,padding:"10px 16px",fontSize:12,fontWeight:700,color:"#fff",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",boxShadow:"0 4px 14px rgba(232,32,95,0.35)"}}>
                  💳 Cartão Renegociado
                </button>
              </div>
            </div>

            {/* ── Cartão Renegociado (com desconto pontualidade) ── */}
            {dividas.filter(d=>d.tipo==="cartao_desconto").length>0&&(
              <div style={{marginBottom:18}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,padding:"9px 14px",background:"rgba(255,255,255,0.75)",borderRadius:10,boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
                  <span style={{fontSize:14}}>💳</span>
                  <span style={{fontSize:12,fontWeight:700,color:"#8B1043",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif"}}>Cartão Renegociado — desconto por pontualidade</span>
                </div>
                {dividas.filter(d=>d.tipo==="cartao_desconto").map(d=>{
                  const parcelas=d.parcelasStatus||[];
                  const pagasCount=parcelas.filter(p=>p.pago).length;
                  const totalComDesconto=d.valorComDesconto*d.numParcelas;
                  const totalSemDesconto=d.valorSemDesconto*d.numParcelas;
                  const economiaMaxima=totalSemDesconto-totalComDesconto;
                  const economiaRealizada=parcelas.filter(p=>p.pago&&p.comDesconto).reduce((s,p)=>s+(d.valorSemDesconto-d.valorComDesconto),0);
                  const proxima=parcelas.find(p=>!p.pago);
                  const diasProxima=proxima?daysUntil(proxima.dataVencimento):null;
                  const pctPago=d.numParcelas>0?(pagasCount/d.numParcelas*100):0;
                  const isExp=cartaoRenegocExpandido===d.id;
                  return (
                    <div key={d.id} className={CARD} style={{marginBottom:10,borderLeft:"3px solid #C4185A"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                        <div>
                          <div style={{fontSize:14,fontWeight:600,fontFamily:"'DM Sans',sans-serif",color:TXT}}>{d.credor}</div>
                          <div style={{fontSize:10,color:TMUT,fontFamily:"'DM Sans',sans-serif"}}>{pagasCount} de {d.numParcelas} parcelas pagas</div>
                        </div>
                        <div style={{textAlign:"right"}}>
                          <div className="num" style={{fontSize:15,fontWeight:700,color:"#C4185A"}}>{R(d.valorComDesconto)}</div>
                          <div style={{fontSize:9,color:TMUT,fontFamily:"'DM Sans',sans-serif"}}>por parcela (com desconto)</div>
                        </div>
                      </div>
                      <Bar value={pagasCount} max={d.numParcelas} color="#C4185A" h={6}/>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:TMUT,fontFamily:"'DM Sans',sans-serif",marginTop:4,marginBottom:9}}>
                        <span>{pctPago.toFixed(0)}% quitado</span>
                        <span>Falta {R(totalComDesconto-d.pago)}</span>
                      </div>
                      {proxima&&(
                        <div style={{background:diasProxima<0?"rgba(139,26,26,0.1)":diasProxima<=5?"rgba(212,168,67,0.15)":"rgba(45,90,16,0.08)",border:`1px solid ${diasProxima<0?"rgba(139,26,26,0.3)":diasProxima<=5?"rgba(212,168,67,0.4)":"rgba(45,90,16,0.2)"}`,borderRadius:10,padding:"9px 12px",marginBottom:9}}>
                          <div style={{fontSize:11,fontWeight:700,color:diasProxima<0?"#8B1A1A":diasProxima<=5?"#8B6000":"#215010",fontFamily:"'DM Sans',sans-serif"}}>
                            {diasProxima<0?`⚠ Parcela ${proxima.numero} atrasada há ${Math.abs(diasProxima)}d`:diasProxima===0?`🔔 Parcela ${proxima.numero} vence hoje!`:`Próxima: parcela ${proxima.numero} em ${diasProxima}d`}
                          </div>
                          <div style={{fontSize:10,color:TMUT,fontFamily:"'DM Sans',sans-serif",marginTop:1}}>Vence {fdFull(proxima.dataVencimento)} · pague até lá pra manter o desconto</div>
                          <button onClick={()=>setPagarParcelaModal({divId:d.id,parcelaIdx:parcelas.indexOf(proxima)})} style={{marginTop:6,background:"#C4185A",border:"none",borderRadius:8,color:"#fff",fontSize:11,fontWeight:700,padding:"6px 12px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Marcar parcela {proxima.numero} como paga</button>
                        </div>
                      )}
                      <div style={{background:"rgba(45,90,16,0.08)",border:"1px solid rgba(45,90,16,0.2)",borderRadius:10,padding:"9px 12px",marginBottom:9}}>
                        <div style={{display:"flex",justifyContent:"space-between"}}>
                          <span style={{fontSize:10,fontWeight:700,color:"#215010",fontFamily:"'DM Sans',sans-serif"}}>💰 Economia se pagar tudo em dia</span>
                          <span className="num" style={{fontSize:12,fontWeight:700,color:"#215010"}}>{R(economiaMaxima)}</span>
                        </div>
                        {economiaRealizada>0&&<div style={{fontSize:10,color:"#2D5A10",fontFamily:"'DM Sans',sans-serif",marginTop:3}}>Já economizou {R(economiaRealizada)} até agora ✓</div>}
                      </div>
                      <button onClick={()=>setCartaoRenegocExpandido(isExp?null:d.id)} style={{width:"100%",background:"rgba(0,0,0,0.05)",border:"1px solid rgba(0,0,0,0.1)",borderRadius:8,color:"#1A1209",fontSize:11,fontWeight:700,padding:"7px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",marginBottom:isExp?9:0}}>{isExp?"▲ Fechar parcelas":`▼ Ver todas as ${d.numParcelas} parcelas`}</button>
                      {isExp&&(
                        <div style={{maxHeight:280,overflowY:"auto",marginBottom:9}}>
                          {parcelas.map((p,idx)=>(
                            <div key={p.numero} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 4px",borderBottom:"1px solid rgba(0,0,0,0.05)"}}>
                              <div>
                                <span style={{fontSize:11.5,fontWeight:600,color:"#1A1209",fontFamily:"'DM Sans',sans-serif"}}>Parcela {p.numero}</span>
                                <span style={{fontSize:10,color:TMUT,fontFamily:"'DM Sans',sans-serif",marginLeft:6}}>{fd(p.dataVencimento)}</span>
                              </div>
                              {p.pago ? (
                                <div style={{display:"flex",alignItems:"center",gap:6}}>
                                  <span className="num" style={{fontSize:11,fontWeight:700,color:p.comDesconto?"#215010":"#8B1A1A"}}>{R(p.valorPago)} {p.comDesconto?"✓":"(sem desc.)"}</span>
                                  <button onClick={()=>desmarcarParcela(d.id,idx)} style={{background:"none",border:"none",color:"#aaa",fontSize:13,cursor:"pointer"}}>×</button>
                                </div>
                              ) : (
                                <button onClick={()=>setPagarParcelaModal({divId:d.id,parcelaIdx:idx})} style={{background:"rgba(196,24,90,0.1)",border:"1px solid rgba(196,24,90,0.3)",borderRadius:7,color:"#C4185A",fontSize:10,fontWeight:700,padding:"4px 9px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Marcar paga</button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      <button onClick={()=>remove(dividas,setDividas,d.id)} style={{display:"flex",alignItems:"center",gap:5,background:"rgba(139,26,26,0.1)",border:"1px solid rgba(139,26,26,0.28)",borderRadius:10,color:"#8B1A1A",fontSize:11.5,fontWeight:700,padding:"7px 12px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>🗑 Excluir</button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── Fundo de Dívidas ── */}
            {dividas.filter(d=>d.tipo==="fundo").length>0&&(
              <div style={{marginBottom:18}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,padding:"9px 14px",background:"rgba(255,255,255,0.75)",borderRadius:10,boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
                  <span style={{fontSize:14}}>🏦</span>
                  <span style={{fontSize:12,fontWeight:700,color:"#8B6000",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif"}}>Fundo de Dívidas — acumulando para quitar</span>
                </div>
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
                    <Bar value={+d.pago} max={+d.total} color="#FFB347" h={7}/>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:TMUT,fontFamily:"'DM Sans',sans-serif",marginTop:4,marginBottom:10}}>
                      <span style={{fontWeight:700,color:"#FFB347"}}>{pct.toFixed(0)}% acumulado</span>
                      <span>Falta {R(falta)}</span>
                    </div>
                    {pct>=100&&<div style={{background:"rgba(143,196,58,0.15)",border:"1px solid rgba(143,196,58,0.4)",borderRadius:8,padding:"8px 12px",fontSize:12,color:"#2D5A10",fontFamily:"'DM Sans',sans-serif",marginBottom:8,fontWeight:600}}>✅ Pronto para quitar!</div>}
                    <div style={{display:"flex",gap:7}}>
                      <button onClick={()=>openM("div",d)} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:5,background:"rgba(0,0,0,0.06)",border:"1px solid rgba(0,0,0,0.12)",borderRadius:10,color:"#1A1209",fontSize:11.5,fontWeight:700,padding:"8px 10px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>✎ Editar</button>
                      {pct>=100&&<button onClick={()=>{setDividas(dividas.map(x=>x.id===d.id?{...x,quitada:true}:x));}} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:5,background:"rgba(45,90,16,0.1)",border:"1px solid rgba(45,90,16,0.28)",borderRadius:10,color:"#215010",fontSize:11.5,fontWeight:700,padding:"8px 10px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>✓ Quitar agora</button>}
                      <button onClick={()=>remove(dividas,setDividas,d.id)} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:5,background:"rgba(139,26,26,0.1)",border:"1px solid rgba(139,26,26,0.28)",borderRadius:10,color:"#8B1A1A",fontSize:11.5,fontWeight:700,padding:"8px 12px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>🗑</button>
                    </div>
                  </div>;
                })}
              </div>
            )}

            {/* ── Dívidas Ativas ── */}
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,padding:"9px 14px",background:"rgba(255,255,255,0.75)",borderRadius:10,boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
              <span style={{fontSize:14}}>💳</span>
              <span style={{fontSize:12,fontWeight:700,color:"#1A1209",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif"}}>Dívidas Ativas — pagamento mensal</span>
            </div>
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
                  <Bar value={+d.pago} max={+d.total} color={C.green} h={7}/>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:TMUT,fontFamily:"'DM Sans',sans-serif",marginTop:4,marginBottom:10}}><span>Pago: {R(+d.pago)}</span><span style={{fontWeight:700,color:"#2D6E20"}}>{pct.toFixed(0)}%</span><span>Total: {R(+d.total)}</span></div>
                  <div style={{display:"flex",gap:7}}>
                    <button onClick={()=>openM("pgto",null,d.id)} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:5,background:"rgba(45,90,16,0.1)",border:"1px solid rgba(45,90,16,0.28)",borderRadius:10,color:"#215010",fontSize:11.5,fontWeight:700,padding:"8px 10px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>✚ Pagamento</button>
                    <button onClick={()=>openM("div",d)} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:5,background:"rgba(0,0,0,0.06)",border:"1px solid rgba(0,0,0,0.12)",borderRadius:10,color:"#1A1209",fontSize:11.5,fontWeight:700,padding:"8px 10px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>✎ Editar</button>
                    <button onClick={()=>remove(dividas,setDividas,d.id)} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:5,background:"rgba(139,26,26,0.1)",border:"1px solid rgba(139,26,26,0.28)",borderRadius:10,color:"#8B1A1A",fontSize:11.5,fontWeight:700,padding:"8px 12px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>🗑</button>
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
                <Btn variant="primary" style={{fontSize:11,padding:"7px 11px"}} onClick={()=>{openM("mov");setFMov(f=>({...f,tipo:"saida",formaPagamento:"cartao"}));}}>+ Compra</Btn>
              </div>
            </div>
            {cartoes.length===0?<div className={CARD} style={{textAlign:"center",padding:36,color:"rgba(26,18,9,0.55)",fontSize:14}}>Adicione seus cartões</div>
              :(()=>{
                const idx=Math.max(0,Math.min(cartaoIdx,cartoes.length-1));
                const c=cartoes[idx];
                const usado=ccGastosMes(c.id);
                const pct=+c.limite>0?Math.min(usado/+c.limite*100,100):0;
                const alerta=pct>=80;
                const cc=movs.filter(m=>m.formaPagamento==="cartao"&&m.cartaoId===c.id&&monthKey(m.data)===selMes).sort((a,b)=>b.data.localeCompare(a.data));
                return (
                  <>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                      <button onClick={()=>setCartaoIdx(idx===0?cartoes.length-1:idx-1)} style={{background:"rgba(255,255,255,0.75)",border:"1px solid rgba(0,0,0,0.1)",borderRadius:10,width:36,height:36,cursor:"pointer",fontSize:17,color:"#1A1209",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>‹</button>
                      <div style={{textAlign:"center"}}>
                        <div style={{fontSize:10,fontWeight:700,color:"rgba(26,18,9,0.5)",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif"}}>▭ Cartões</div>
                        <div style={{fontSize:11,color:"rgba(26,18,9,0.45)",fontFamily:"'DM Sans',sans-serif"}}>{idx+1} de {cartoes.length}</div>
                      </div>
                      <button onClick={()=>setCartaoIdx(idx===cartoes.length-1?0:idx+1)} style={{background:"rgba(255,255,255,0.75)",border:"1px solid rgba(0,0,0,0.1)",borderRadius:10,width:36,height:36,cursor:"pointer",fontSize:17,color:"#1A1209",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>›</button>
                    </div>
                    {cartoes.length>1&&(
                      <div style={{display:"flex",gap:5,justifyContent:"center",marginBottom:14,flexWrap:"wrap"}}>
                        {cartoes.map((cd,dotIdx)=>(
                          <button key={cd.id} onClick={()=>setCartaoIdx(dotIdx)} title={cd.nome}
                            style={{width:dotIdx===idx?18:7,height:7,borderRadius:99,border:"none",background:dotIdx===idx?"#E8205F":"rgba(0,0,0,0.18)",cursor:"pointer",transition:"all .2s",padding:0}}/>
                        ))}
                      </div>
                    )}
                    <div className={CARD} style={{background:alerta?"rgba(224,82,82,0.22)":"rgba(255,255,255,0.85)",border:`1px solid ${alerta?C.red+"55":"rgba(0,0,0,0.08)"}`,marginBottom:14}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:11}}>
                        <div><div style={{fontSize:16,fontWeight:700,fontFamily:"'DM Sans',sans-serif",color:TXT}}>{c.nome}</div><div style={{fontSize:10,color:"rgba(26,18,9,0.85)",marginTop:1,fontFamily:"'DM Sans',sans-serif"}}>{c.bandeira&&`${c.bandeira} · `}Fecha dia {c.fechamento} · Vence dia {c.vencimento}</div></div>
                        <div style={{textAlign:"right"}}><div className="num" style={{fontSize:18,fontWeight:700,color:alerta?C.red:TXT}}>{R(usado)}</div><div style={{fontSize:10,color:"rgba(26,18,9,0.85)",fontFamily:"'DM Sans',sans-serif"}}>de {R(+c.limite)}</div></div>
                      </div>
                      <Bar value={usado} max={+c.limite} color={alerta?C.red:C.magenta} h={6}/>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"rgba(26,18,9,0.85)",fontFamily:"'DM Sans',sans-serif",marginTop:4}}><span>{pct.toFixed(0)}%</span>{alerta&&<span style={{color:C.red,fontWeight:700}}>⚠ Limite próximo</span>}<span>Disponível: {R(+c.limite-usado)}</span></div>
                      <div style={{display:"flex",gap:6,marginTop:9}}>
                        <Btn variant="primary" style={{fontSize:10,padding:"5px 11px"}} onClick={()=>{openM("mov");setFMov(f=>({...f,tipo:"saida",formaPagamento:"cartao",cartaoId:c.id}));}}>+ Compra</Btn>
                        <Btn variant="secondary" style={{fontSize:10,padding:"5px 9px",color:"#1A1209",background:"rgba(0,0,0,0.07)",border:"1px solid rgba(0,0,0,0.12)"}} onClick={()=>openM("cart",c)}>Editar</Btn>
                        <Btn variant="danger" style={{fontSize:10,padding:"5px 9px"}} onClick={()=>{remove(cartoes,setCartoes,c.id);setCartaoIdx(0);}}>Excluir</Btn>
                      </div>
                    </div>
                    {cc.length===0?(
                      <div className={CARD} style={{textAlign:"center",padding:24,color:"rgba(26,18,9,0.45)",fontSize:13,fontFamily:"'DM Sans',sans-serif"}}>Nenhuma compra em {monthLabel(selMes)}</div>
                    ):(
                      <div className={CARD} style={{padding:"16px 14px"}}>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 95px 85px 100px 26px",gap:6,marginBottom:8,padding:"0 4px"}}>
                          <div style={{fontSize:10,fontWeight:700,color:"rgba(26,18,9,0.5)",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif"}}>Descrição</div>
                          <div style={{fontSize:10,fontWeight:700,color:"rgba(26,18,9,0.5)",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif"}}>Categoria</div>
                          <div style={{fontSize:10,fontWeight:700,color:"rgba(26,18,9,0.5)",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif"}}>Data</div>
                          <div style={{fontSize:10,fontWeight:700,color:"rgba(26,18,9,0.5)",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif",textAlign:"right"}}>Valor</div>
                          <div/>
                        </div>
                        {cc.map((m,rowIdx)=>{
                          const opts=cats?.despesa||DEFAULT_CATS.despesa;
                          return (
                            <div key={m.id} style={{display:"grid",gridTemplateColumns:"1fr 95px 85px 100px 26px",gap:6,alignItems:"center",padding:"9px 4px",background:rowIdx%2===0?"rgba(0,0,0,0.025)":"transparent",borderRadius:8}}>
                              <div>
                                <input value={m.descricao} onChange={e=>setMovs(movs.map(x=>x.id===m.id?{...x,descricao:e.target.value}:x))}
                                  style={{background:"transparent",border:"none",padding:"5px 4px",fontSize:12.5,color:"#1A1209",fontWeight:600,outline:"none",fontFamily:"'DM Sans',sans-serif",width:"100%"}}/>
                                {m.parcelaTotal>1&&<div style={{fontSize:9,color:"#8B1043",fontFamily:"'DM Sans',sans-serif",marginLeft:4}}>parcela {m.parcelaAtual}/{m.parcelaTotal}</div>}
                              </div>
                              <select value={m.categoria} onChange={e=>setMovs(movs.map(x=>x.id===m.id?{...x,categoria:e.target.value}:x))}
                                className="plt-select"
                                style={{background:"rgba(196,24,90,0.08)",border:"1px solid rgba(196,24,90,0.2)",borderRadius:8,padding:"5px 6px",fontSize:11,color:"#8B1043",fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",width:"100%",minWidth:0}}>
                                {opts.map(cc2=><option key={cc2.id} value={`${cc2.emoji} ${cc2.nome}`}>{cc2.nome}</option>)}
                                {!opts.some(cc2=>m.categoria.startsWith(`${cc2.emoji} ${cc2.nome}`))&&<option value={m.categoria}>{m.categoria}</option>}
                              </select>
                              <input type="date" value={m.data} onChange={e=>setMovs(movs.map(x=>x.id===m.id?{...x,data:e.target.value}:x))}
                                style={{background:"rgba(255,255,255,0.7)",border:"1px solid rgba(0,0,0,0.12)",borderRadius:8,padding:"6px 4px",fontSize:10.5,color:"#1A1209",outline:"none",fontFamily:"'DM Sans',sans-serif",width:"100%"}}/>
                              <input type="number" value={m.valor} onChange={e=>setMovs(movs.map(x=>x.id===m.id?{...x,valor:+e.target.value}:x))}
                                className="plt-numinput"
                                style={{background:"rgba(255,255,255,0.7)",border:"1px solid rgba(0,0,0,0.12)",borderRadius:8,padding:"6px 5px",fontSize:12,fontWeight:700,color:C.magenta,outline:"none",fontFamily:"'DM Sans',sans-serif",width:"100%",textAlign:"right"}}/>
                              <button onClick={()=>removeMov(m.id)} style={{background:"rgba(0,0,0,0.05)",border:"none",borderRadius:6,color:"#8B1A1A",fontSize:14,cursor:"pointer",lineHeight:1,width:22,height:22,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                );
              })()}
          </div>
        )}

        {/* ══ PREVISÃO ══ */}
        {tab==="previsao"&&(
          <div className="fade">
            <div className={CARD} style={{marginBottom:16,padding:"18px 20px",background:"linear-gradient(135deg,rgba(255,255,255,0.92),rgba(255,255,255,0.82))"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",flexWrap:"wrap",gap:10}}>
                <div>
                  <div style={{fontSize:11,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",color:"rgba(26,18,9,0.55)",fontFamily:"'DM Sans',sans-serif",marginBottom:4}}>📅 Previsão</div>
                  <div style={{fontSize:26,fontWeight:300,fontFamily:"'Cormorant Garamond',serif",color:"#1A1209",letterSpacing:"-.01em",lineHeight:1}}>Próximos 8 meses</div>
                  <div style={{fontSize:11,color:"rgba(26,18,9,0.5)",fontFamily:"'DM Sans',sans-serif",marginTop:5}}>Plantões agendados · investimentos · histórico</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:10,fontWeight:700,letterSpacing:".06em",textTransform:"uppercase",color:"rgba(26,18,9,0.45)",fontFamily:"'DM Sans',sans-serif",marginBottom:2}}>saldo projetado total</div>
                  <div className="num" style={{fontSize:22,fontWeight:700,color:forecast.reduce((s,f)=>s+f.saldo,0)>=0?"#215010":"#8B1A1A"}}>{R(forecast.reduce((s,f)=>s+f.saldo,0))}</div>
                </div>
              </div>
            </div>

            <div className={CARD} style={{marginBottom:18,padding:"22px 20px 16px"}}>
              <div style={{display:"flex",alignItems:"flex-end",gap:8,height:150,marginBottom:14,paddingTop:20}}>
                {forecast.map((f,fi)=>{const hE=maxFc>0?(f.entradas/maxFc)*100:0;const hS=maxFc>0?(f.saidas/maxFc)*100:0;const isNow=f.ym===today().slice(0,7);
                  return <div key={f.ym} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:6,position:"relative"}}>
                    {isNow&&(
                      <div style={{position:"absolute",top:-24,fontSize:9,fontWeight:700,color:"#8B1043",fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap",background:"rgba(232,32,95,0.1)",borderRadius:6,padding:"2px 6px"}}>{R(f.entradas)}</div>
                    )}
                    <div style={{display:"flex",gap:3,alignItems:"flex-end",height:120}}>
                      <div style={{width:11,background:isNow?"linear-gradient(180deg,#4ABE2A,#215010)":"linear-gradient(180deg,#8FC43A99,#21501099)",borderRadius:"6px 6px 2px 2px",height:`${Math.max(hE,3)}%`,transition:"height .6s ease",boxShadow:isNow?"0 0 10px rgba(45,90,16,0.35)":"none"}}/>
                      <div style={{width:11,background:isNow?"linear-gradient(180deg,#F0356E,#8B1043)":"linear-gradient(180deg,#F0356E99,#8B104399)",borderRadius:"6px 6px 2px 2px",height:`${Math.max(hS,3)}%`,transition:"height .6s ease",boxShadow:isNow?"0 0 10px rgba(232,32,95,0.35)":"none"}}/>
                    </div>
                    <div style={{fontSize:10,color:isNow?"#1A1209":"rgba(26,18,9,0.45)",fontFamily:"'DM Sans',sans-serif",fontWeight:isNow?700:600,textTransform:"capitalize"}}>{monthLabel(f.ym).split(" ")[0]}</div>
                  </div>;
                })}
              </div>
              <div style={{display:"flex",gap:16,justifyContent:"center",paddingTop:10,borderTop:"1px solid rgba(0,0,0,0.06)"}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:9,height:9,borderRadius:3,background:"linear-gradient(135deg,#4ABE2A,#215010)"}}/><span style={{fontSize:11,color:"#1A1209",fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>Entradas</span></div>
                <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:9,height:9,borderRadius:3,background:"linear-gradient(135deg,#F0356E,#8B1043)"}}/><span style={{fontSize:11,color:"#1A1209",fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>Saídas</span></div>
              </div>
            </div>

            {forecast.map((f,idx)=>{
              const isNow=f.ym===today().slice(0,7);
              const anterior=idx>0?forecast[idx-1]:null;
              const trend=anterior?f.saldo-anterior.saldo:null;
              const opacity=1-Math.min(idx*0.05,0.28);
              return (
                <div key={f.ym} className={CARD} style={{marginBottom:10,padding:"16px 18px",opacity,position:"relative",overflow:"hidden",
                  background:isNow?"linear-gradient(135deg,rgba(232,32,95,0.1),rgba(240,53,110,0.06))":"rgba(255,255,255,0.85)",
                  border:isNow?"1.5px solid rgba(232,32,95,0.4)":"1px solid rgba(0,0,0,0.06)",
                  boxShadow:isNow?"0 6px 20px rgba(232,32,95,0.18)":"0 2px 8px rgba(0,0,0,0.04)"}}>
                  {isNow&&<div style={{position:"absolute",top:0,left:0,width:4,height:"100%",background:"linear-gradient(180deg,#F0356E,#8B1043)"}}/>}
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                    <div style={{display:"flex",alignItems:"center",gap:9}}>
                      <div style={{fontSize:17,fontWeight:500,fontFamily:"'Cormorant Garamond',serif",color:isNow?"#8B1043":"#1A1209",textTransform:"capitalize"}}>{monthLabel(f.ym)}</div>
                      {isNow&&<span style={{fontSize:9,fontWeight:700,background:"linear-gradient(135deg,#F0356E,#D01050)",color:"#fff",borderRadius:99,padding:"3px 10px",letterSpacing:".04em",textTransform:"uppercase",boxShadow:"0 2px 6px rgba(232,32,95,0.3)"}}>✦ Atual</span>}
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{display:"flex",alignItems:"center",gap:5,justifyContent:"flex-end"}}>
                        {trend!==null&&<span style={{fontSize:11,fontWeight:700,color:trend>=0?"#2D8A1A":"#B0301A"}}>{trend>=0?"▲":"▼"}</span>}
                        <div className="num" style={{fontSize:19,fontWeight:700,color:f.saldo>=0?"#215010":"#8B1A1A"}}>{R(f.saldo)}</div>
                      </div>
                    </div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                    {[{l:"Entradas",v:f.entradas,c:"#215010",bg:"rgba(45,90,16,0.08)",bd:"rgba(45,90,16,0.2)",ic:"▲"},{l:"Saídas",v:f.saidas,c:"#8B1A1A",bg:"rgba(139,26,26,0.07)",bd:"rgba(139,26,26,0.18)",ic:"▼"},{l:"Rendim.",v:f.rendimentos,c:"#8B6000",bg:"rgba(212,168,67,0.12)",bd:"rgba(212,168,67,0.3)",ic:"📈"}].map(r=>(
                      <div key={r.l} style={{background:r.bg,border:`1px solid ${r.bd}`,borderRadius:10,padding:"8px 10px",textAlign:"center"}}>
                        <div style={{fontSize:9,color:r.c,fontFamily:"'DM Sans',sans-serif",fontWeight:700,letterSpacing:".05em",marginBottom:3,opacity:0.85}}>{r.ic} {r.l}</div>
                        <div className="num" style={{fontSize:12.5,fontWeight:700,color:r.c}}>{R(r.v)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ══ BALANÇO ══ */}
        {tab==="balanco"&&(
          <div className="fade">
            <BalancoTab movs={movs} plantoes={plantoes} cartoes={cartoes} selMes={selMes}/>
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
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <div style={{background:"rgba(91,163,212,0.1)",border:"1px solid rgba(91,163,212,0.3)",borderRadius:10,padding:"9px 13px",fontSize:12,color:"#1A4A6E",fontFamily:"'DM Sans',sans-serif"}}>
                🔄 Transferência — não conta como gasto nem como receita
              </div>
              <div style={{display:"flex",background:"#EDE8E0",borderRadius:12,padding:3,gap:3}}>
                <button onClick={()=>setFMov({...fMov,subtipo:"aporte"})} style={{flex:1,background:fMov.subtipo==="aporte"?"rgba(45,90,16,0.75)":"transparent",color:fMov.subtipo==="aporte"?"#fff":C.modalSub,border:"none",borderRadius:10,padding:"8px",fontSize:11.5,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>📈 Investimento (aporte)</button>
                <button onClick={()=>setFMov({...fMov,subtipo:"resgate"})} style={{flex:1,background:fMov.subtipo==="resgate"?"rgba(196,24,90,0.75)":"transparent",color:fMov.subtipo==="resgate"?"#fff":C.modalSub,border:"none",borderRadius:10,padding:"8px",fontSize:11.5,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>📉 Resgate</button>
              </div>
              <Sel label={fMov.subtipo==="resgate"?"Resgatar de qual investimento?":"Adicionar a qual investimento?"} value={fMov.investId} onChange={e=>setFMov({...fMov,investId:e.target.value})}>
                <option value="">Sem vínculo (só registrar)</option>
                {invests.map(i=><option key={i.id} value={i.id}>{i.nome}{i.banco?" · "+i.banco:""}</option>)}
              </Sel>
              {invests.length===0&&<div style={{fontSize:11,color:C.modalSub,fontFamily:"'DM Sans',sans-serif"}}>Cadastre um investimento primeiro para vincular.</div>}
            </div>
          ) : (
            <>
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
              {fMov.tipo==="saida"&&(
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  <div>
                    <div style={{fontSize:11,fontWeight:600,color:C.modalSub,letterSpacing:".06em",textTransform:"uppercase",marginBottom:5}}>Forma de pagamento</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:4}}>
                      {[["dinheiro","💵"],["pix","📱"],["debito","💳"],["cartao","🖊️"]].map(([v,ic])=>(
                        <button key={v} onClick={()=>setFMov({...fMov,formaPagamento:v})} style={{background:fMov.formaPagamento===v?C.magentaDark:"rgba(0,0,0,0.05)",color:fMov.formaPagamento===v?"#fff":C.modalSub,border:"none",borderRadius:9,padding:"8px 2px",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",textAlign:"center"}}>{ic}<br/>{v==="dinheiro"?"Dinheiro":v==="pix"?"Pix":v==="debito"?"Débito":"Cartão"}</button>
                      ))}
                    </div>
                  </div>
                  {fMov.formaPagamento==="cartao"&&(
                    <div style={{display:"flex",flexDirection:"column",gap:10,background:"rgba(232,32,95,0.05)",border:"1px solid rgba(232,32,95,0.15)",borderRadius:10,padding:"11px 13px"}}>
                      <Sel label="Qual cartão?" value={fMov.cartaoId} onChange={e=>setFMov({...fMov,cartaoId:e.target.value})}>
                        <option value="">Selecione...</option>
                        {cartoes.map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}
                      </Sel>
                      {cartoes.length===0&&<div style={{fontSize:11,color:C.modalSub,fontFamily:"'DM Sans',sans-serif"}}>Cadastre um cartão primeiro na aba Cartões.</div>}
                      <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
                        <input type="checkbox" checked={fMov.parcelado} onChange={e=>setFMov({...fMov,parcelado:e.target.checked})} style={{width:16,height:16,accentColor:C.magenta}}/>
                        <span style={{fontSize:12,color:C.modalText,fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>Compra parcelada</span>
                      </label>
                      {fMov.parcelado&&(
                        <Inp label="Número de parcelas" type="number" min="2" value={fMov.numParcelas} onChange={e=>setFMov({...fMov,numParcelas:e.target.value})}/>
                      )}
                      {fMov.parcelado&&fMov.valor&&fMov.numParcelas>=2&&(
                        <div style={{fontSize:11,color:"#8B1043",fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>
                          {fMov.numParcelas}x de {R((+String(fMov.valor).replace(",","."))/(+fMov.numParcelas||1))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
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

      <Modal open={modal==="pltLote"} onClose={closeM} title="📅 Vários Plantões">
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{background:"rgba(91,163,212,0.08)",border:"1px solid rgba(91,163,212,0.2)",borderRadius:10,padding:"9px 13px",fontSize:12,color:"#1A4A6E",fontFamily:"'DM Sans',sans-serif"}}>
            Marca os dias que trabalhou nessa empresa esse mês — cria um plantão pra cada dia de uma vez.
          </div>
          <Sel label="Empresa" value={fPltLote.empresa} onChange={e=>setFPltLote({...fPltLote,empresa:e.target.value})}>
            <option value="">Selecione...</option>
            {empresas.map(e=><option key={e.id} value={e.nome}>{e.nome}</option>)}
          </Sel>
          <G2>
            <Inp label="Valor por plantão (R$)" placeholder="0,00" value={fPltLote.valorTotal} onChange={e=>setFPltLote({...fPltLote,valorTotal:e.target.value})}/>
            <Inp label="Horas por plantão (opcional)" placeholder="Ex: 12" value={fPltLote.horas} onChange={e=>setFPltLote({...fPltLote,horas:e.target.value})}/>
          </G2>
          <Inp label="Data de previsão de pagamento" type="date" value={fPltLote.previsao} onChange={e=>setFPltLote({...fPltLote,previsao:e.target.value})}/>

          <div style={{background:C.inputBg,border:`1.5px solid ${C.inputBorder}`,borderRadius:10,padding:"12px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <button onClick={()=>setFPltLote({...fPltLote,mesLote:shiftMonth(fPltLote.mesLote,-1),diasSelecionados:[]})} style={{background:"rgba(0,0,0,0.06)",border:"none",borderRadius:8,width:28,height:28,cursor:"pointer",fontSize:14,color:C.modalText}}>‹</button>
              <div style={{fontSize:13,fontWeight:700,color:C.modalText,fontFamily:"'DM Sans',sans-serif",textTransform:"capitalize"}}>{monthLabel(fPltLote.mesLote)}</div>
              <button onClick={()=>setFPltLote({...fPltLote,mesLote:shiftMonth(fPltLote.mesLote,1),diasSelecionados:[]})} style={{background:"rgba(0,0,0,0.06)",border:"none",borderRadius:8,width:28,height:28,cursor:"pointer",fontSize:14,color:C.modalText}}>›</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:5}}>
              {(()=>{
                const [y,m]=fPltLote.mesLote.split("-").map(Number);
                const numDias=new Date(y,m,0).getDate();
                return Array.from({length:numDias},(_,i)=>i+1).map(dia=>{
                  const sel=fPltLote.diasSelecionados.includes(dia);
                  return (
                    <button key={dia} onClick={()=>{
                      const novos=sel?fPltLote.diasSelecionados.filter(d=>d!==dia):[...fPltLote.diasSelecionados,dia];
                      setFPltLote({...fPltLote,diasSelecionados:novos});
                    }} style={{aspectRatio:"1",background:sel?"#E8205F":"rgba(255,255,255,0.7)",color:sel?"#fff":C.modalText,border:`1px solid ${sel?"#E8205F":"rgba(0,0,0,0.1)"}`,borderRadius:8,fontSize:11.5,fontWeight:sel?700:500,cursor:"pointer",fontFamily:"inherit"}}>{dia}</button>
                  );
                });
              })()}
            </div>
          </div>

          {fPltLote.diasSelecionados.length>0&&fPltLote.valorTotal&&(
            <div style={{background:"rgba(45,90,16,0.08)",border:"1px solid rgba(45,90,16,0.2)",borderRadius:10,padding:"10px 13px",fontSize:12,color:"#215010",fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>
              {fPltLote.diasSelecionados.length} {fPltLote.diasSelecionados.length===1?"dia selecionado":"dias selecionados"} · Total: {R(fPltLote.diasSelecionados.length*(+String(fPltLote.valorTotal).replace(",",".")))}
            </div>
          )}

          <Btn variant="primary" onClick={savePltLote}>Criar {fPltLote.diasSelecionados.length>0?fPltLote.diasSelecionados.length:""} plantões</Btn>
        </div>
      </Modal>

      <Modal open={modal==="cartaoRenegoc"} onClose={closeM} title="💳 Cartão Renegociado">
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{background:"rgba(196,24,90,0.08)",border:"1px solid rgba(196,24,90,0.2)",borderRadius:10,padding:"10px 13px",fontSize:12,color:"#8B1043",fontFamily:"'DM Sans',sans-serif",lineHeight:1.5}}>
            Pra dívidas de cartão renegociadas com desconto por pagar em dia (ex: banco negocia parcela menor se pagar pontual).
          </div>
          <Inp label="Credor / Banco" placeholder="Ex: Itaú" value={fCartaoRenegoc.credor} onChange={e=>setFCartaoRenegoc({...fCartaoRenegoc,credor:e.target.value})}/>
          <G2>
            <Inp label="Número de parcelas" type="number" value={fCartaoRenegoc.numParcelas} onChange={e=>setFCartaoRenegoc({...fCartaoRenegoc,numParcelas:e.target.value})}/>
            <Inp label="Data 1ª parcela" type="date" value={fCartaoRenegoc.dataPrimeiraParcela} onChange={e=>setFCartaoRenegoc({...fCartaoRenegoc,dataPrimeiraParcela:e.target.value})}/>
          </G2>
          <G2>
            <Inp label="Valor da parcela COM desconto" placeholder="0,00" value={fCartaoRenegoc.valorComDesconto} onChange={e=>setFCartaoRenegoc({...fCartaoRenegoc,valorComDesconto:e.target.value})}/>
            <Inp label="Valor da parcela SEM desconto" placeholder="0,00" value={fCartaoRenegoc.valorSemDesconto} onChange={e=>setFCartaoRenegoc({...fCartaoRenegoc,valorSemDesconto:e.target.value})}/>
          </G2>
          <G2>
            <Inp label="% desconto pontualidade" placeholder="Ex: 12,55" value={fCartaoRenegoc.percentualDesconto} onChange={e=>setFCartaoRenegoc({...fCartaoRenegoc,percentualDesconto:e.target.value})}/>
            <Inp label="% extra se antecipar (opcional)" placeholder="Ex: 5" value={fCartaoRenegoc.percentualAntecipado} onChange={e=>setFCartaoRenegoc({...fCartaoRenegoc,percentualAntecipado:e.target.value})}/>
          </G2>
          {fCartaoRenegoc.valorComDesconto&&fCartaoRenegoc.valorSemDesconto&&fCartaoRenegoc.numParcelas&&(
            <div style={{background:"rgba(45,90,16,0.08)",border:"1px solid rgba(45,90,16,0.25)",borderRadius:10,padding:"10px 13px",fontSize:12,color:"#215010",fontFamily:"'DM Sans',sans-serif"}}>
              💰 Economia total se pagar tudo em dia: <strong>{R((+String(fCartaoRenegoc.valorSemDesconto).replace(",",".")-(+String(fCartaoRenegoc.valorComDesconto).replace(",",".")))*(+fCartaoRenegoc.numParcelas||0))}</strong>
            </div>
          )}
          <Btn variant="primary" onClick={saveCartaoRenegoc}>Salvar dívida renegociada</Btn>
        </div>
      </Modal>

      <Modal open={!!pagarParcelaModal} onClose={()=>setPagarParcelaModal(null)} title="Marcar parcela como paga">
        {pagarParcelaModal&&(()=>{
          const d=dividas.find(x=>x.id===pagarParcelaModal.divId);
          const p=d?.parcelasStatus[pagarParcelaModal.parcelaIdx];
          if(!d||!p)return null;
          const noPrazo=!isPast(p.dataVencimento);
          return (
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div style={{fontSize:13,color:"#5A4A3A",fontFamily:"'DM Sans',sans-serif"}}>
                Parcela <strong style={{color:"#1A1209"}}>{p.numero}</strong> de {d.credor} — vencimento {fdFull(p.dataVencimento)}
                {noPrazo?<span style={{color:"#215010",fontWeight:700}}> (ainda no prazo)</span>:<span style={{color:"#8B1A1A",fontWeight:700}}> (atrasada)</span>}
              </div>
              <button onClick={()=>marcarParcelaPaga(d.id,pagarParcelaModal.parcelaIdx,true)}
                style={{background:"rgba(45,90,16,0.1)",border:"2px solid rgba(45,90,16,0.35)",borderRadius:12,padding:"14px",textAlign:"left",cursor:"pointer"}}>
                <div style={{fontSize:13,fontWeight:700,color:"#215010",fontFamily:"'DM Sans',sans-serif"}}>✓ Paguei com desconto (em dia)</div>
                <div className="num" style={{fontSize:16,fontWeight:700,color:"#215010",marginTop:2}}>{R(d.valorComDesconto)}</div>
              </button>
              <button onClick={()=>marcarParcelaPaga(d.id,pagarParcelaModal.parcelaIdx,false)}
                style={{background:"rgba(139,26,26,0.08)",border:"2px solid rgba(139,26,26,0.25)",borderRadius:12,padding:"14px",textAlign:"left",cursor:"pointer"}}>
                <div style={{fontSize:13,fontWeight:700,color:"#8B1A1A",fontFamily:"'DM Sans',sans-serif"}}>Paguei sem desconto (atrasada)</div>
                <div className="num" style={{fontSize:16,fontWeight:700,color:"#8B1A1A",marginTop:2}}>{R(d.valorSemDesconto)}</div>
              </button>
            </div>
          );
        })()}
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

      <ImportacaoModal open={importOpen} onClose={()=>setImportOpen(false)} onImport={importarMovs} cats={cats}/>
      <Modal open={!!temDinheiroPergunta} onClose={()=>setTemDinheiroPergunta(null)} title="💳 Compra no cartão">
        {temDinheiroPergunta&&(
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={{fontSize:13,color:"#5A4A3A",fontFamily:"'DM Sans',sans-serif",lineHeight:1.5}}>
              Você registrou <strong style={{color:"#1A1209"}}>{temDinheiroPergunta.descricao}</strong> — {R(temDinheiroPergunta.valorTotal)}.
              <br/>Você já tem esse valor guardado pra pagar a fatura?
            </div>
            <div style={{display:"flex",gap:8}}>
              <Btn variant="green" style={{flex:1}} onClick={()=>setTemDinheiroPergunta(null)}>✓ Sim, já tenho</Btn>
              <Btn variant="danger" style={{flex:1}} onClick={()=>{setPlanoAcaoAberto(temDinheiroPergunta);setTemDinheiroPergunta(null);}}>Ainda não</Btn>
            </div>
          </div>
        )}
      </Modal>
      <Modal open={!!planoAcaoAberto} onClose={()=>setPlanoAcaoAberto(null)} title="📋 Plano para conseguir pagar">
        {planoAcaoAberto&&(()=>{
          const mesesNecessarios=mediaSaldoLivre3Meses>0?Math.ceil(planoAcaoAberto.valorTotal/mediaSaldoLivre3Meses):null;
          return (
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div style={{background:"rgba(232,32,95,0.08)",border:"1px solid rgba(232,32,95,0.25)",borderRadius:12,padding:"12px 16px",textAlign:"center"}}>
                <div style={{fontSize:11,fontWeight:700,color:"#8B1043",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif",marginBottom:4}}>{planoAcaoAberto.descricao}</div>
                <div className="num" style={{fontSize:20,fontWeight:700,color:"#8B1043"}}>{R(planoAcaoAberto.valorTotal)}</div>
              </div>

              <div style={{background:"rgba(91,163,212,0.1)",border:"1px solid rgba(91,163,212,0.3)",borderRadius:12,padding:"12px 14px"}}>
                <div style={{fontSize:11,fontWeight:700,color:"#1A4A6E",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif",marginBottom:6}}>⏱ Tempo estimado</div>
                <div style={{fontSize:12,color:"#1A4A6E",fontFamily:"'DM Sans',sans-serif",lineHeight:1.5}}>
                  {mesesNecessarios
                    ? <>Com sua média de <strong>{R(mediaSaldoLivre3Meses)}</strong> livre por mês, levaria cerca de <strong>{mesesNecessarios} {mesesNecessarios===1?"mês":"meses"}</strong> pra juntar esse valor guardando tudo que sobra.</>
                    : <>Seus últimos meses não deixaram sobra pra guardar. Vale reduzir gastos antes de assumir esse compromisso.</>
                  }
                </div>
              </div>

              {categoriaMaiorGasto&&(
                <div style={{background:"rgba(212,168,67,0.15)",border:"1px solid rgba(212,168,67,0.4)",borderRadius:12,padding:"12px 14px"}}>
                  <div style={{fontSize:11,fontWeight:700,color:"#8B6000",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif",marginBottom:6}}>✂ Onde cortar</div>
                  <div style={{fontSize:12,color:"#6B4C00",fontFamily:"'DM Sans',sans-serif",lineHeight:1.5}}>
                    Sua maior categoria de gasto esse mês é <strong>{categoriaMaiorGasto.nome}</strong> ({R(categoriaMaiorGasto.valor)}). Reduzir um pouco ali pode liberar dinheiro pra essa compra mais rápido.
                  </div>
                </div>
              )}

              <div style={{background:"rgba(45,90,16,0.08)",border:"1px solid rgba(45,90,16,0.25)",borderRadius:12,padding:"12px 14px"}}>
                <div style={{fontSize:11,fontWeight:700,color:"#215010",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif",marginBottom:8}}>🎯 Acompanhar como meta</div>
                <Btn variant="green" style={{width:"100%"}} onClick={()=>{
                  const prazo=mesesNecessarios?addMonths(today(),mesesNecessarios):"";
                  setObjetivos([{id:uid(),nome:planoAcaoAberto.descricao,meta:planoAcaoAberto.valorTotal,atual:0,prazo,cor:C.green,obs:"Criado automaticamente pelo plano de economia",partes:[]},...objetivos]);
                  setPlanoAcaoAberto(null);
                }}>+ Criar objetivo pra essa compra</Btn>
              </div>

              <Btn variant="secondary" style={{color:"#1A1209",background:"rgba(0,0,0,0.06)",border:"1px solid rgba(0,0,0,0.1)"}} onClick={()=>setPlanoAcaoAberto(null)}>Fechar</Btn>
            </div>
          );
        })()}
      </Modal>
      <Modal open={!!confirmSaldoMes} onClose={()=>{}} title="Confirmar saldo do mês">
        {confirmSaldoMes&&(
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={{fontSize:13,color:"#5A4A3A",fontFamily:"'DM Sans',sans-serif",lineHeight:1.5}}>
              Você está entrando em <strong style={{color:"#1A1209"}}>{monthLabel(confirmSaldoMes.mes)}</strong> com esse saldo (calculado do resultado de {monthLabel(shiftMonth(confirmSaldoMes.mes,-1))}). Confirma ou ajusta se precisar:
            </div>
            <Inp label="Saldo inicial deste mês (R$)" type="text" inputMode="decimal" value={confirmSaldoMes.valor}
              onChange={e=>setConfirmSaldoMes({...confirmSaldoMes,valor:e.target.value.replace(",",".")})}/>
            <Btn variant="primary" onClick={()=>{setSaldoMensal({...saldoMensal,[confirmSaldoMes.mes]:+confirmSaldoMes.valor||0});setConfirmSaldoMes(null);}}>✓ Confirmar</Btn>
          </div>
        )}
      </Modal>
      <Modal open={editSaldoMes!==null} onClose={()=>setEditSaldoMes(null)} title="Ajustar saldo inicial">
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{fontSize:13,color:"#5A4A3A",fontFamily:"'DM Sans',sans-serif",lineHeight:1.5}}>
            Corrija o saldo inicial de <strong style={{color:"#1A1209"}}>{monthLabel(selMes)}</strong>. O app vai recalcular o saldo desse mês em diante a partir desse valor.
          </div>
          <Inp label="Saldo inicial deste mês (R$)" type="text" inputMode="decimal" value={editSaldoMes||""}
            onChange={e=>setEditSaldoMes(e.target.value.replace(",","."))}/>
          <Btn variant="primary" onClick={()=>{setSaldoMensal({...saldoMensal,[selMes]:+editSaldoMes||0});setEditSaldoMes(null);}}>✓ Salvar ajuste</Btn>
        </div>
      </Modal>
      <Modal open={mortoReportOpen} onClose={()=>setMortoReportOpen(false)} title="💀 Relatório do mês">
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{background:"rgba(139,26,26,0.1)",border:"1px solid rgba(139,26,26,0.3)",borderRadius:12,padding:"14px 16px",textAlign:"center"}}>
            <div style={{fontSize:11,fontWeight:700,color:"#8B1A1A",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif",marginBottom:4}}>Saldo negativo em {monthLabel(selMes)}</div>
            <div className="num" style={{fontSize:22,fontWeight:700,color:"#8B1A1A"}}>{R(saldo)}</div>
          </div>
          <div>
            <div style={{fontSize:12,fontWeight:700,color:"#1A1209",fontFamily:"'DM Sans',sans-serif",marginBottom:8}}>O que passou do planejado:</div>
            {categoriasEstouradas.length===0?(
              <div style={{fontSize:12,color:"#5A4A3A",fontFamily:"'DM Sans',sans-serif"}}>Nenhuma categoria específica estourou — o saldo negativo veio do total geral de gastos ter passado das entradas do mês.</div>
            ):(
              categoriasEstouradas.map((c,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid rgba(0,0,0,0.06)"}}>
                  <span style={{fontSize:12,color:"#1A1209",fontFamily:"'DM Sans',sans-serif"}}>{c.nome}</span>
                  <span className="num" style={{fontSize:12,fontWeight:700,color:"#8B1A1A"}}>+{R(c.excesso)}</span>
                </div>
              ))
            )}
          </div>
          <div style={{background:"rgba(91,163,212,0.1)",border:"1px solid rgba(91,163,212,0.3)",borderRadius:12,padding:"12px 14px"}}>
            <div style={{fontSize:11,fontWeight:700,color:"#1A4A6E",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif",marginBottom:6}}>Como melhorar</div>
            <div style={{fontSize:12,color:"#1A4A6E",fontFamily:"'DM Sans',sans-serif",lineHeight:1.6}}>
              {categoriasEstouradas.length>0
                ? <>Foque em reduzir gastos em <strong>{categoriasEstouradas[0].nome}</strong> no próximo mês — foi onde mais passou do planejado. Revise o orçamento dessa categoria ou ajuste o planejamento se ele estava irreal.</>
                : <>Revise suas entradas e saídas do mês na aba Movimentos — pode ter algum gasto grande pontual, ou entradas que ainda não chegaram (verifique plantões pendentes).</>
              }
            </div>
          </div>
          <Btn variant="primary" onClick={()=>setMortoReportOpen(false)}>Entendi</Btn>
        </div>
      </Modal>
      <AlocacaoModal open={!!movDist} onClose={()=>setMovDist(null)}
        plantao={movDist?{...movDist,empresa:movDist.descricao,valorTotal:movDist.valor}:null}
        regras={regras} invests={invests} objetivos={objetivos} dividas={dividas}
        onConfirm={alocs=>{
          confirmarDistribuicao({...movDist,empresa:movDist.descricao,valorTotal:movDist.valor,id:movDist.id+"_dist"},alocs,true);
          setMovDist(null);
        }}/>
      <Modal open={!!recebModal} onClose={()=>setRecebModal(null)} title="Quando você recebeu?">
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{fontSize:13,color:C.modalSub,fontFamily:"'DM Sans',sans-serif"}}>
            {recebModal&&<>Plantão: <strong style={{color:C.modalText}}>{recebModal.empresa}</strong> · {R(recebModal.valorTotal)}</>}
          </div>
          <Inp label="Data do recebimento" type="date" value={recebData} onChange={e=>setRecebData(e.target.value)} autoFocus/>
          <div style={{display:"flex",gap:6}}>
            {[["Hoje",0],["Ontem",1],["2 dias atrás",2],["3 dias atrás",3]].map(([l,dias])=>(
              <button key={l} onClick={()=>setRecebData(addDays(today(),-dias))} style={{flex:1,background:"rgba(0,0,0,0.06)",border:"1px solid rgba(0,0,0,0.12)",borderRadius:8,padding:"6px 4px",fontSize:10,fontWeight:700,color:C.modalSub,cursor:"pointer",fontFamily:"inherit"}}>{l}</button>
            ))}
          </div>
          <Btn variant="green" onClick={confirmarDataRecebimento}>✓ Confirmar recebimento</Btn>
        </div>
      </Modal>
      <RegrasModal open={modal==="regras"} onClose={closeM} regras={regras} setRegras={setRegras} invests={invests} objetivos={objetivos} dividas={dividas}/>
      <AlocacaoModal open={!!pltDist} onClose={()=>setPltDist(null)} plantao={pltDist} regras={regras} invests={invests} objetivos={objetivos} dividas={dividas} onConfirm={(alocs)=>confirmarDistribuicao(pltDist,alocs,false)}/>
    </div>
  );
}