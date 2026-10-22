import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  AlertTriangle, CreditCard, TrendingUp, RefreshCw, Package, Wallet, Cross, Target, Trash2,
  BarChart3, Landmark, Lightbulb, CheckCircle2, Sprout, Sandwich, Car, Home, Pill, Drama, Shirt,
  BookOpen, Camera, Inbox, Skull, Settings, PartyPopper, Calendar, CalendarDays, Briefcase,
  GraduationCap, Pencil, Circle, FileText, Unlock, Lock, Hourglass, Flower2, Search, Banknote,
  Smartphone, PenLine, TrendingDown, ClipboardList, Sparkles, Sparkle, Trophy, Square, Sun, Dog,
  Gift, FolderOpen, Bot, Key, FileEdit, AlertCircle, GlassWater, User, Building2, Clock,
  MessageCircle, Bell, Timer, Scissors, Plus, Check, SlidersHorizontal, Eye, EyeOff,
  GripVertical, LayoutGrid, X, ArrowUpRight,
} from "lucide-react";
import { Responsive as ResponsiveGridLayoutBase, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
const ResponsiveGridLayout = WidthProvider(ResponsiveGridLayoutBase);

// ── Mapa emoji → ícone de linha (lucide) ─────────────────────────────────────
const EMOJI_ICON = {
  "⚠":AlertTriangle, "💳":CreditCard, "📈":TrendingUp, "🔄":RefreshCw, "📦":Package, "💰":Wallet,
  "🏥":Cross, "🎯":Target, "🗑":Trash2, "📊":BarChart3, "🏦":Landmark, "💡":Lightbulb, "✅":CheckCircle2,
  "🌱":Sprout, "🍔":Sandwich, "🚗":Car, "🏠":Home, "💊":Pill, "🎭":Drama, "👕":Shirt, "📚":BookOpen,
  "📸":Camera, "📥":Inbox, "💀":Skull, "⚙":Settings, "🎉":PartyPopper, "📅":Calendar, "💼":Briefcase,
  "🎓":GraduationCap, "✏":Pencil, "🔴":Circle, "📄":FileText, "🔓":Unlock, "⏳":Hourglass,
  "😱":AlertCircle, "😎":CheckCircle2, "🌻":Flower2, "🔍":Search, "💵":Banknote, "📱":Smartphone,
  "🖊":PenLine, "📉":TrendingDown, "📋":ClipboardList, "🔮":Sparkles, "🏆":Trophy, "🟫":Square,
  "🎀":Sparkle, "☀":Sun, "🐶":Dog, "🎁":Gift, "📂":FolderOpen, "🤖":Bot, "🔑":Key, "🔒":Lock,
  "📝":FileEdit, "😟":AlertCircle, "🍹":GlassWater, "👤":User, "🗓":CalendarDays, "🏢":Building2,
  "🕐":Clock, "🍟":Sandwich, "💭":MessageCircle, "🔔":Bell, "⏱":Timer, "✂":Scissors,
};

// Renderiza um emoji isolado como ícone de linha (mantém o char original como fallback)
const Glyph = ({e, size=14, strokeWidth=2.2, style, ...rest}) => {
  const Ico = EMOJI_ICON[e];
  if(!Ico) return e;
  return <Ico size={size} strokeWidth={strokeWidth} style={{display:"inline-block",verticalAlign:"-2px",flexShrink:0,...style}} {...rest}/>;
};

// Renderiza um texto "<emoji> resto do texto" trocando o emoji por ícone, preservando o resto
const CatLabel = ({text, size=14, strokeWidth=2.2, gap=5, style}) => {
  const m = /^(\S+)(\s.*)?$/.exec(text||"");
  if(!m) return text;
  const [, emoji, rest] = m;
  const Ico = EMOJI_ICON[emoji];
  if(!Ico) return text;
  return <span style={{display:"inline-flex",alignItems:"center",gap,...style}}><Ico size={size} strokeWidth={strokeWidth} style={{flexShrink:0}}/>{rest&&rest.trim()}</span>;
};

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
  magenta:"#B91D55", magentaGlass:"rgba(185,29,85,0.35)", magentaDark:"rgba(160,22,72,0.92)",
  green:"#6F9560",   greenGlass:"rgba(111,149,96,0.3)",
  gold:"#B8944F",    goldGlass:"rgba(184,148,79,0.3)",
  red:"#B5473F",     redGlass:"rgba(181,71,63,0.25)",
  blue:"#5B7C94",    blueGlass:"rgba(91,124,148,0.25)",
  amber:"#B8944F",   amberGlass:"rgba(212,168,67,0.25)",
  modalBg:"rgba(245,240,228,0.97)", modalText:"#1A1209", modalSub:"#5A4A3A",
  inputBg:"#F5F0E8", inputBorder:"#DDD5C8",
};

const DEST_COLORS = {
  investimento: {color:"#A8E063", bg:"rgba(168,224,99,0.15)",  icon:TrendingUp},
  objetivo:     {color:"#7BC8F0", bg:"rgba(123,200,240,0.15)", icon:Target},
  divida:       {color:"#FF8A80", bg:"rgba(255,138,128,0.15)", icon:CreditCard},
  fundo_divida: {color:"#FFB347", bg:"rgba(255,179,71,0.15)",  icon:Landmark},
  livre:        {color:"#FFD580", bg:"rgba(255,213,128,0.15)", icon:Wallet},
};

// Cards da aba Início que o usuário pode escolher mostrar/esconder
const DASH_CARDS = [
  {id:"resumo",        label:"Resumo (A Receber / Patrimônio / Dívidas)"},
  {id:"semanasLivres", label:"Semanas com espaço livre"},
  {id:"desafioPato",   label:"Desafio do Pato 100%"},
  {id:"cartoes",       label:"Resumo de cartões"},
  {id:"graficoGastos", label:"Gráfico de gastos"},
  {id:"graficoEmpresas", label:"Gráfico por empresa"},
  {id:"calendario",    label:"Calendário"},
  {id:"recebimentos",  label:"Próximos recebimentos"},
  {id:"ranking",       label:"Ranking de empresas"},
  {id:"alocacao",      label:"Alocação de receita"},
  {id:"objetivos",     label:"Objetivos"},
];

// Altura padrão (em unidades de linha do grid) de cada card do Início
const DASH_H = {
  resumo:9, semanasLivres:13, desafioPato:9, cartoes:4, graficoGastos:8,
  graficoEmpresas:7, calendario:9, recebimentos:9, ranking:5, alocacao:4, objetivos:6,
};
// alturas antigas: servem só pra reconhecer um layout salvo que nunca foi personalizado
const DASH_H_OLD = {
  resumo:3, semanasLivres:8, desafioPato:9, cartoes:8, graficoGastos:9,
  graficoEmpresas:9, calendario:9, recebimentos:9, ranking:10, alocacao:12, objetivos:8,
};
const DASH_BREAKPOINTS = {lg:996, md:768, sm:480};
const DASH_COLS = {lg:3, md:2, sm:1};

// Gera um layout padrão (empacotamento simples por coluna mais curta) pra um dado nº de colunas
function genDashLayout(cols, visibleIds, HH=DASH_H) {
  const colH = Array(cols).fill(0);
  const layout = [];
  visibleIds.forEach(id=>{
    const h = HH[id]||8;
    if(id==="resumo"){
      const y = Math.max(...colH);
      layout.push({i:id, x:0, y, w:cols, h});
      colH.fill(y+h);
      return;
    }
    let col=0; for(let c=1;c<cols;c++) if(colH[c]<colH[col]) col=c;
    layout.push({i:id, x:col, y:colH[col], w:1, h});
    colH[col]+=h;
  });
  return layout;
}

const CHART_COLORS = ["#B91D55","#6F9560","#5B7C94","#B8944F","#7D6A8E","#B5473F","#4F8A82","#C27A45","#8AA06B"];

const TARTAN_CSS = `background-color:#C4A96A;background-image:repeating-linear-gradient(0deg,transparent 0px,transparent 18px,rgba(80,72,20,0.55) 18px,rgba(80,72,20,0.55) 26px,transparent 26px,transparent 44px,rgba(80,72,20,0.55) 44px,rgba(80,72,20,0.55) 52px,transparent 52px,transparent 68px,rgba(100,20,20,0.5) 68px,rgba(100,20,20,0.5) 72px,transparent 72px,transparent 88px,rgba(80,72,20,0.55) 88px,rgba(80,72,20,0.55) 96px,transparent 96px,transparent 114px,rgba(80,72,20,0.55) 114px,rgba(80,72,20,0.55) 122px,transparent 122px,transparent 138px,rgba(100,20,20,0.5) 138px,rgba(100,20,20,0.5) 142px,transparent 142px,transparent 160px),repeating-linear-gradient(90deg,transparent 0px,transparent 18px,rgba(80,72,20,0.55) 18px,rgba(80,72,20,0.55) 26px,transparent 26px,transparent 44px,rgba(80,72,20,0.55) 44px,rgba(80,72,20,0.55) 52px,transparent 52px,transparent 68px,rgba(100,20,20,0.5) 68px,rgba(100,20,20,0.5) 72px,transparent 72px,transparent 88px,rgba(80,72,20,0.55) 88px,rgba(80,72,20,0.55) 96px,transparent 96px,transparent 114px,rgba(80,72,20,0.55) 114px,rgba(80,72,20,0.55) 122px,transparent 122px,transparent 138px,rgba(100,20,20,0.5) 138px,rgba(100,20,20,0.5) 142px,transparent 142px,transparent 160px);background-size:160px 160px;`;

const LISTRAS_CSS = `background-color:#F3B8C4;background-image:repeating-linear-gradient(90deg,#F3B8C4 0px,#F3B8C4 26px,#B5182A 26px,#B5182A 52px);background-size:52px 100%;`;

const SOL_STRIPES_CSS = `background-color:#FAF6ED;background-image:repeating-linear-gradient(90deg,#FAF6ED 0px,#FAF6ED 18px,#F0D89A 18px,#F0D89A 60px,#FAF6ED 60px,#FAF6ED 78px,#A9C4DE 78px,#A9C4DE 84px);background-size:84px 100%;`;

const LISTRAS_VINHO_CSS = `background-color:#5A1A1F;background-image:repeating-linear-gradient(90deg,#5A1A1F 0px,#5A1A1F 50px,#F0EAE0 50px,#F0EAE0 54px,#7FB8D4 54px,#7FB8D4 68px,#F0EAE0 68px,#F0EAE0 72px);background-size:72px 100%;`;

const AZULEJO_AZUL_CSS = `background-color:#B8D4E0;background-image:repeating-linear-gradient(90deg,#8B1A2E 0px,#8B1A2E 12px,transparent 12px,transparent 24px),repeating-linear-gradient(0deg,#8B1A2E 0px,#8B1A2E 12px,transparent 12px,transparent 24px);background-size:24px 24px;`;

const LISTRAS_LARGAS_CSS = `background-color:#7C9FB0;background-image:repeating-linear-gradient(90deg,#7C9FB0 0px,#7C9FB0 60px,#5C1420 60px,#5C1420 120px);background-size:120px 100%;`;

const BG_OPTIONS = [
  { id:"tartan",    label:"Xadrez",   emoji:"🟫", isCss:true, css:TARTAN_CSS },
  { id:"listras",   label:"Listras",  emoji:"🎀", isCss:true, css:LISTRAS_CSS },
  { id:"sol",       label:"Sol",      emoji:"☀️", isCss:true, css:SOL_STRIPES_CSS },
  { id:"cachorro",  label:"Dálmata",  emoji:"🐶", url:"/wallpapers/bg-cachorro-azul.jpg", contain:true, bgColor:"#2E4C82", position:"left bottom", containSize:"auto 90%" },
  { id:"listras_vinho",  label:"Listras Vinho", emoji:"🍷", isCss:true, css:LISTRAS_VINHO_CSS },
  { id:"azulejo_azul",   label:"Azulejo Azul",  emoji:"🔷", isCss:true, css:AZULEJO_AZUL_CSS },
  { id:"listras_largas", label:"Listras Largas", emoji:"🎗️", isCss:true, css:LISTRAS_LARGAS_CSS },
];

// Paleta da área abaixo do cabeçalho: cores chapadas (estilo azulejo / Matisse) combinando com cada fundo
// base = fundo da folha · acc = detalhe · hero = card grande · tiles = 4 cards pequenos (c = cor, fg = texto, m = motivo)
const CREAM="#F3E8CF";
const BG_PALETTES = {
  tartan: {base:"#F1E9DA", acc:"#9B2C2C", hero:{s:"veludo",z:1,x:0,y:0}, tiles:[{s:"tulipa",z:1.5,x:20,y:30},{s:"manteiga",z:1.4,x:40,y:20},{s:"noite",z:1.5,x:10,y:50},{s:"tulipa",z:1.8,x:70,y:10}]},
  listras: {base:"#F6EBE7", acc:"#B5253A", hero:{s:"tulipa",z:1,x:0,y:0}, tiles:[{s:"veludo",z:1.4,x:30,y:20},{s:"manteiga",z:1.5,x:40,y:40},{s:"noite",z:1.4,x:60,y:20},{s:"veludo",z:1.7,x:10,y:60}]},
  sol: {base:"#F5EFDD", acc:"#C48A1C", hero:{s:"manteiga",z:1,x:0,y:0}, tiles:[{s:"tulipa",z:1.5,x:30,y:30},{s:"veludo",z:1.4,x:20,y:40},{s:"noite",z:1.5,x:40,y:20},{s:"tulipa",z:1.8,x:10,y:60}]},
  cachorro: {base:"#EEEFF3", acc:"#2E4C82", hero:{s:"noite",z:1,x:0,y:0}, tiles:[{s:"manteiga",z:1.5,x:20,y:30},{s:"tulipa",z:1.4,x:40,y:20},{s:"veludo",z:1.5,x:10,y:50},{s:"manteiga",z:1.8,x:70,y:10}]},
  listras_vinho: {base:"#F0E7E1", acc:"#7A2634", hero:{s:"veludo",z:1,x:0,y:0}, tiles:[{s:"tulipa",z:1.5,x:30,y:20},{s:"manteiga",z:1.4,x:20,y:40},{s:"noite",z:1.5,x:50,y:30},{s:"tulipa",z:1.8,x:60,y:10}]},
  azulejo_azul: {base:"#EAEEF0", acc:"#8B1A2E", hero:{s:"noite",z:1,x:0,y:0}, tiles:[{s:"tulipa",z:1.5,x:20,y:30},{s:"manteiga",z:1.4,x:40,y:40},{s:"veludo",z:1.5,x:30,y:20},{s:"tulipa",z:1.8,x:70,y:50}]},
  listras_largas: {base:"#E9ECEC", acc:"#5C1420", hero:{s:"tulipa",z:1,x:0,y:0}, tiles:[{s:"noite",z:1.5,x:30,y:30},{s:"manteiga",z:1.4,x:20,y:40},{s:"veludo",z:1.5,x:40,y:20},{s:"noite",z:1.8,x:10,y:60}]},
};
const mixHex=(a,b,t)=>{const p=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));const x=p(a),y=p(b);return "#"+x.map((v,i)=>Math.round(v*(1-t)+y[i]*t).toString(16).padStart(2,"0")).join("");};
// Ilustrações botânicas (SVG, ocupam o card inteiro) — 4 estilos inspirados em aquarela/guache
const INK="#2A1E14", PANEL="#FBF4E2";
const STY={
  tulipa:  {paper:"#F6EEE0",f1:"#D9581F",f2:"#EE8A3E",l1:"#7F9470",l2:"#6A7F5C",stem:"#5F7352",acc:"#C8501F"},
  veludo:  {paper:"#6C1D26",f1:"#EBC9BE",f2:"#F3DDD2",l1:"#A99A4A",l2:"#8E8138",stem:"#23301F",acc:"#6C1D26"},
  noite:   {paper:"#18220F",f1:"#8DB1EC",f2:"#6F95DB",l1:"#4B5F2A",l2:"#3B4C20",stem:"#3B4C20",acc:"#2D4A8A"},
  manteiga:{paper:"#F8E6B8",f1:"#EDAA26",f2:"#F4BF45",l1:"#7B7B3E",l2:"#6B6B35",stem:"#6B6B35",acc:"#B07A0F"},
  petroleo: {paper:"#12303A",f1:"#F6CDBF",f2:"#E98F77",l1:"#5E9C99",l2:"#46807D",stem:"#356B68",acc:"#E07A5F"},
  marinho: {paper:"#16224B",f1:"#CBD5F8",f2:"#92A8EE",l1:"#4E8C93",l2:"#3C7279",stem:"#2F5A60",acc:"#4F6BD0"},
};
const Motif=({s="tulipa",z=1,x=0,y=0,p=1,bare=false,style})=>{
  const S=STY[s]||STY.tulipa;
  const Leaf=({x,y,r=0,k=1,c=S.l1,c2=S.l2,spots})=>(
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${k})`}>
      <path d="M0 0 C 10 -16, 38 -22, 66 -5 C 44 8, 16 12, 0 0Z" fill={c}/>
      <path d="M0 0 C 14 -2, 40 -2, 66 -5 C 44 8, 16 12, 0 0Z" fill={c2} opacity=".75"/>
      <path d="M3 0 C 22 -5, 44 -6, 60 -5" fill="none" stroke={S.paper} strokeWidth=".8" opacity=".5"/>
      {spots&&Array.from({length:15}).map((_,i)=><ellipse key={i} cx={8+i*3.6} cy={-4+((i*7)%5)*1.6-3} rx="1.7" ry=".7" fill="#26331F" transform={`rotate(${(i*53)%60-30} ${8+i*3.6} -4)`}/>)}
    </g>);
  const Fan=({x,y,r=0,k=1})=>(
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${k})`}>
      {[-66,-33,0,33,66].map((a,i)=>{const L=[36,44,50,44,36][i];return <g key={i} transform={`rotate(${a})`}>
        <path d={`M0 0 C -15 -8, -17 -${L*.72}, 0 -${L} C 17 -${L*.72}, 15 -8, 0 0Z`} fill={i%2?S.f2:S.f1} stroke={S.paper} strokeWidth="1.3"/>
        <path d={`M0 -6 L0 -${L-9}`} stroke={S.paper} strokeWidth=".8" opacity=".7"/></g>;})}
      <path d="M-5 3 C -4 -3, 4 -3, 5 3Z" fill={S.l1}/>
    </g>);
  const Bell=({x,y,r=0,k=1})=>(
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${k})`}>
      <path d="M0 0 C -24 6, -28 42, -8 64 C 0 72, 10 70, 17 60 C 32 40, 26 8, 0 0Z" fill={S.f1}/>
      <path d="M-3 22 C -10 34, -6 52, 2 60 C 10 50, 10 32, -3 22Z" fill="#E5A93A" opacity=".85"/>
      {[-16,-8,0,8,16].map((d,i)=><path key={i} d={`M${d*.2} 4 C ${d*1.3} 24, ${d*1.1} 44, ${d*.6} 62`} fill="none" stroke="#B5524B" strokeWidth=".7" opacity=".6"/>)}
      <path d="M-6 -2 L6 -2 L4 8 L-4 8Z" fill="#2A3A22"/>
    </g>);
  const Peri=({x,y,r=0,k=1})=>(
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${k})`}>
      {[0,72,144,216,288].map((a,i)=><g key={i} transform={`rotate(${a})`}><path d="M0 0 C -17 -10, -19 -42, 0 -56 C 19 -42, 17 -10, 0 0Z" fill={i%2?S.l1:S.f1}/><path d="M0 -4 C 7 -10, 8 -30, 0 -50 C 14 -34, 14 -12, 0 -4Z" fill={i%2?S.l2:S.f2} opacity=".8"/></g>)}
      <ellipse cx="0" cy="0" rx="5.5" ry="8" fill={S.f1}/>
    </g>);
  const Poppy=({x,y,r=0,k=1})=>(
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${k})`}>
      {[[-28,S.f1],[26,S.f1],[0,S.f2]].map(([a,c],i)=><ellipse key={i} cx="0" cy="-26" rx={i===2?19:17} ry={i===2?32:28} fill={c} opacity=".93" transform={`rotate(${a})`}/>)}
      <path d="M-9 4 C -6 -7, 6 -7, 9 4" fill="none" stroke={S.l2} strokeWidth="3" strokeLinecap="round"/>
    </g>);
  const St=(d,w=2.2)=><path d={d} fill="none" stroke={S.stem} strokeWidth={w} strokeLinecap="round"/>;
  let corpo;
  if(s==="veludo"){
    corpo=<>
      <Leaf x={-14} y={44} r={-34} k={2} spots/><Leaf x={214} y={150} r={188} k={1.9} spots/><Leaf x={120} y={216} r={-152} k={1.7} spots/><Leaf x={-12} y={206} r={-62} k={1.9} spots/><Leaf x={208} y={14} r={158} k={1.6} spots/>
      {St("M30 -6 C 22 44, 70 30, 80 62")}<Bell x={80} y={62} r={6} k={.95}/>
      {St("M182 -6 C 196 44, 150 40, 140 72")}<Bell x={140} y={72} r={-14} k={.85}/>
      {St("M22 140 C 16 92, 44 96, 54 122")}<Bell x={54} y={122} r={10} k={.7}/>
    </>;
  } else if(s==="noite"){
    corpo=<><Leaf x={-10} y={120} r={-20} k={1.4}/><Leaf x={210} y={80} r={170} k={1.4}/><Leaf x={100} y={214} r={-100} k={1.3}/>
      <Peri x={52} y={58} r={20} k={1.05}/><Peri x={152} y={38} r={-30} k={1}/><Peri x={102} y={142} r={60} k={1.15}/><Peri x={22} y={176} r={100} k={.95}/><Peri x={182} y={158} r={-80} k={1}/></>;
  } else if(s==="manteiga"){
    corpo=<>
      <path d="M100 150 C 70 118, 40 130, 14 98" fill="none" stroke={S.l1} strokeWidth="1.5" opacity=".7"/><path d="M104 122 C 130 98, 160 110, 196 78" fill="none" stroke={S.l1} strokeWidth="1.5" opacity=".7"/><path d="M60 190 C 76 160, 70 150, 86 138" fill="none" stroke={S.l1} strokeWidth="1.5" opacity=".6"/>
      {St("M100 216 C 98 160, 104 112, 100 70",3)}<Poppy x={100} y={68} k={1.15}/>
      {St("M38 216 C 44 170, 34 140, 30 112",2.6)}<Poppy x={28} y={104} r={-10} k={.95}/>
      {St("M166 216 C 160 170, 172 132, 178 98",2.6)}<Poppy x={180} y={90} r={12} k={1}/>
    </>;
  } else {
    corpo=<>
      {St("M100 216 C 98 172, 112 142, 100 112 C 90 86, 104 70, 100 42")}
      {St("M100 122 C 80 114, 62 114, 50 100")}{St("M104 90 C 128 84, 140 70, 150 58")}{St("M100 162 C 120 152, 140 152, 154 142")}{St("M98 176 C 80 170, 60 168, 46 152")}
      <Leaf x={100} y={110} r={-150} k={1.05}/><Leaf x={102} y={96} r={-30} k={1}/><Leaf x={98} y={150} r={170} k={1.1}/><Leaf x={100} y={190} r={-20} k={1.15}/><Leaf x={100} y={60} r={-100} k={.8}/><Leaf x={100} y={190} r={-165} k={1.2}/>
      <Fan x={48} y={98} r={-52} k={.95}/><Fan x={152} y={56} r={36} k={1}/><Fan x={156} y={140} r={78} k={.9}/><Fan x={44} y={150} r={-76} k={.9}/><Fan x={100} y={38} r={4} k={.7}/>
    </>;
  }
  const w=200/z;
  return <svg viewBox={`${x} ${y} ${w} ${w}`} preserveAspectRatio="xMidYMid slice" width="100%" height="100%" style={{...style,filter:`saturate(${(.15+.85*p).toFixed(2)})`,transition:"filter .5s"}} aria-hidden="true">{!bare&&<rect x="-60" y="-60" width="320" height="320" fill={S.paper}/>}{corpo}{p<1&&<rect x="-60" y="-60" width="320" height="320" fill={S.paper} opacity={((1-p)*.62).toFixed(2)} style={{transition:"opacity .5s"}}/>}</svg>;
};
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
const today = () => { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
const addDays = (ds,n) => { const d=new Date(ds+"T12:00:00"); d.setDate(d.getDate()+n); return d.toISOString().slice(0,10); };
const addMonths = (ds,n) => { const d=new Date(ds+"T12:00:00"); d.setMonth(d.getMonth()+n); return d.toISOString().slice(0,10); };
const daysUntil = ds => ds ? Math.ceil((new Date(ds+"T12:00:00")-new Date())/86400000) : null;
const isPast = ds => ds && new Date(ds+"T23:59:59")<new Date();
const monthKey = ds => ds ? ds.slice(0,7) : "";
const monthLabel = ym => { const [y,m]=ym.split("-"); return ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"][+m-1]+" "+y.slice(2); };
const shiftMonth = (ym,n) => { const [y,m]=ym.split("-").map(Number); const total=y*12+(m-1)+n; const ny=Math.floor(total/12); const nm=(total%12)+1; return `${ny}-${String(nm).padStart(2,"0")}`; };
const months8 = () => { const base=today().slice(0,7); const a=[]; for(let i=0;i<8;i++)a.push(shiftMonth(base,i)); return a; };
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
            <div style={{fontSize:11,fontWeight:500,color:"rgba(26,18,9,0.5)",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'DM Mono',ui-monospace,monospace",marginBottom:8}}>{selDay.slice(8)} de {MNAMES[+dm-1]}</div>
            {pltDia.map(p=><div key={p.id} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid rgba(0,0,0,0.05)"}}><span style={{fontSize:11,fontWeight:600,color:"#1A1209",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:5}}><Glyph e="🏥" size={12}/>{p.empresa}</span><span style={{fontSize:11,fontWeight:700,color:"#2D5A10",fontFamily:"'DM Sans',sans-serif"}}>{R(p.valorTotal)}</span></div>)}
            {movDia.map(m=><div key={m.id} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid rgba(0,0,0,0.05)"}}><span style={{fontSize:11,color:"#1A1209",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:5}}><Glyph e={m.categoria.split(" ")[0]} size={12}/>{m.descricao}</span><span style={{fontSize:11,fontWeight:700,color:m.tipo==="entrada"?"#2D5A10":"#8B1A1A",fontFamily:"'DM Sans',sans-serif"}}>{m.tipo==="entrada"?"+":"-"}{R(m.valor)}</span></div>)}
            {pltDia.length===0&&movDia.length===0&&<div style={{fontSize:11,color:"rgba(26,18,9,0.4)",fontFamily:"'DM Sans',sans-serif",marginBottom:6}}>Nenhum registro neste dia</div>}
            <div style={{display:"flex",gap:5,marginTop:8}}>
              <button onClick={()=>onAddWithDate&&onAddWithDate("entrada",selDay)} style={{flex:1,background:"rgba(45,90,16,0.1)",border:"1px solid rgba(45,90,16,0.25)",borderRadius:8,padding:"6px",fontSize:10,fontWeight:700,color:"#2D5A10",cursor:"pointer",fontFamily:"inherit"}}>+ Entrada</button>
              <button onClick={()=>onAddWithDate&&onAddWithDate("saida",selDay)} style={{flex:1,background:"rgba(139,26,26,0.1)",border:"1px solid rgba(139,26,26,0.25)",borderRadius:8,padding:"6px",fontSize:10,fontWeight:700,color:"#8B1A1A",cursor:"pointer",fontFamily:"inherit"}}>+ Saída</button>
              <button onClick={()=>onAddWithDate&&onAddWithDate("plantao",selDay)} style={{flex:1,background:"rgba(232,32,95,0.1)",border:"1px solid rgba(232,32,95,0.25)",borderRadius:8,padding:"6px",fontSize:10,fontWeight:700,color:"#B91D55",cursor:"pointer",fontFamily:"inherit"}}>+ Plantão</button>
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
    {label&&<div style={{fontSize:10,fontWeight:500,color:C.modalSub,letterSpacing:".08em",textTransform:"uppercase",marginBottom:6,fontFamily:"'DM Mono',ui-monospace,monospace"}}>{label}</div>}
    <input style={{background:C.inputBg,border:`1.5px solid ${C.inputBorder}`,borderRadius:10,padding:"11px 13px",color:C.modalText,fontSize:14,outline:"none",width:"100%",fontFamily:"inherit",transition:"border-color .15s"}}
      onFocus={e=>e.target.style.borderColor=C.magenta} onBlur={e=>e.target.style.borderColor=C.inputBorder} {...p}/>
  </div>
);
const Sel = ({label,children,...p}) => (
  <div>
    {label&&<div style={{fontSize:10,fontWeight:500,color:C.modalSub,letterSpacing:".08em",textTransform:"uppercase",marginBottom:6,fontFamily:"'DM Mono',ui-monospace,monospace"}}>{label}</div>}
    <select className="filter-select" style={{background:C.inputBg,border:`1.5px solid ${C.inputBorder}`,borderRadius:10,padding:"11px 30px 11px 13px",color:C.modalText,fontSize:14,outline:"none",width:"100%",fontFamily:"inherit",cursor:"pointer"}} {...p}>{children}</select>
  </div>
);
const G2=({children,gap=10})=><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap}}>{children}</div>;
const Btn=({variant="primary",children,style:extraStyle,...p})=>{
  const styles={
    primary:  {background:"linear-gradient(135deg,#C8235F,#9B1448)",color:"#fff",border:"1px solid rgba(208,16,80,0.6)",boxShadow:"0 2px 8px rgba(232,32,95,0.22)"},
    secondary:{background:"rgba(0,0,0,0.06)",color:C.modalText,border:"1.5px solid rgba(0,0,0,0.12)"},
    green:    {background:"rgba(143,196,58,0.7)",color:"#fff",border:"1px solid rgba(143,196,58,0.5)"},
    danger:   {background:"rgba(224,82,82,0.12)",color:"#C0392B",border:"1.5px solid rgba(224,82,82,0.3)"},
    blue:     {background:"rgba(91,163,212,0.6)",color:"#fff",border:"1px solid rgba(91,163,212,0.4)"},
  };
  return <button style={{...styles[variant],borderRadius:12,fontSize:14,fontWeight:600,padding:"11px 16px",cursor:"pointer",transition:"all .15s",fontFamily:"inherit",...extraStyle}} {...p}>{children}</button>;
};
const Money=({v,size=26,color,unit=true})=>{
  const m=R(v).match(/^(-?)R\$\s?(.*)$/);
  if(!m) return <span>{R(v)}</span>;
  const [int,dec]=m[2].split(",");
  return (
    <span style={{whiteSpace:"nowrap",color}}>
      {unit&&<span style={{fontFamily:"'DM Sans',sans-serif",fontSize:Math.max(10,size*0.42),opacity:.65,marginRight:3,letterSpacing:0}}>{m[1]}R$</span>}
      <span style={{fontFamily:"'Fraunces',Georgia,serif",fontSize:size,fontWeight:400,letterSpacing:"-.03em"}}>{int}</span>
      <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:Math.max(10,size*0.42),opacity:.6,letterSpacing:0}}>,{dec||"00"}</span>
    </span>
  );
};
const Spark=({data,color="#6F9560",w=92,h=34})=>{
  const mx=Math.max(...data,0.0001), mn=Math.min(...data,0);
  const rng=(mx-mn)||1, pad=4;
  const pts=data.map((v,i)=>[pad+i*((w-2*pad)/Math.max(data.length-1,1)), h-pad-((v-mn)/rng)*(h-2*pad)]);
  const d=pts.map((p,i)=>(i?"L":"M")+p[0].toFixed(1)+" "+p[1].toFixed(1)).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{display:"block",overflow:"visible"}}>
      <path d={d} fill="none" stroke={color} strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" opacity=".55"/>
      {pts.map((p,i)=><circle key={i} cx={p[0]} cy={p[1]} r={i===pts.length-1?3.6:2} fill={i===pts.length-1?color:"#fff"} stroke={color} strokeWidth={i===pts.length-1?0:1.2}/>)}
    </svg>
  );
};
const SL=({children,style:st})=><div className="sl" style={{fontSize:11,fontWeight:700,color:"rgba(26,18,9,0.55)",letterSpacing:".08em",textTransform:"uppercase",marginBottom:10,...st}}>{children}</div>;
const DashDragHandle=()=>(
  <div className="dash-drag-handle" style={{position:"absolute",top:6,right:6,width:24,height:24,borderRadius:7,background:"rgba(232,32,95,0.12)",border:"1px solid rgba(232,32,95,0.3)",display:"flex",alignItems:"center",justifyContent:"center",color:"#C4185A",cursor:"grab",zIndex:5}}>
    <GripVertical size={13} strokeWidth={2.2}/>
  </div>
);


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
                <div style={{fontSize:9,fontWeight:500,letterSpacing:".06em",textTransform:"uppercase",color:C.modalSub,fontFamily:"'DM Mono',ui-monospace,monospace",marginBottom:3}}>{l}</div>
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
                  <span style={{color:dc.color,display:"flex"}}><dc.icon size={18} strokeWidth={2}/></span>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:dc.color,fontFamily:"'DM Sans',sans-serif"}}>{getNome(a)}</div>
                    {inv?.banco&&<div style={{fontSize:10,color:C.modalSub,fontFamily:"'DM Sans',sans-serif"}}>{inv.banco} · {inv.tipo}</div>}
                    <div style={{fontSize:9,color:C.modalSub,fontFamily:"'DM Mono',ui-monospace,monospace",textTransform:"uppercase",letterSpacing:".05em"}}>{a.pct}% do recebimento</div>
                  </div>
                </div>
                <input type="number" value={a.valorEdit} onChange={e=>setAlocs(alocs.map((x,j)=>j===i?{...x,valorEdit:e.target.value}:x))}
                  style={{background:C.inputBg,border:`1.5px solid ${C.inputBorder}`,borderRadius:8,padding:"6px 10px",width:90,fontSize:13,fontWeight:700,color:dc.color,outline:"none",textAlign:"right",fontFamily:"inherit"}}/>
              </div>
            </div>
          );
        })}
        {livre<0&&<div style={{background:"rgba(224,82,82,0.1)",border:"1px solid rgba(224,82,82,0.3)",borderRadius:10,padding:"10px 14px",marginBottom:14,fontSize:13,color:C.red,fontFamily:"'DM Sans',sans-serif"}}><Glyph e="⚠" size={13}/>Excede em {R(Math.abs(livre))}</div>}
        <Btn variant="green" style={{width:"100%",marginTop:8}} onClick={()=>onConfirm(alocs)}><Check size={14} strokeWidth={2.5} style={{marginRight:4}}/>Confirmar e distribuir</Btn>
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
                <option value="investimento">Investimento</option>
                <option value="objetivo">Objetivo</option>
                <option value="fundo_divida">Fundo de Dívida</option>
                <option value="divida">Dívida Ativa</option>
                <option value="livre">Livre</option>
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
            style={{flex:1,background:tipo===t?(t==="despesa"?"#B91D55":"#4A7A1A"):"transparent",color:tipo===t?"#fff":"#5A4A3A",border:"none",borderRadius:10,padding:"8px",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",transition:"all .15s"}}>
            {t==="despesa"?"Despesa":"Receita"}
          </button>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {/* Categorias */}
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{fontSize:11,fontWeight:700,color:"#5A4A3A",letterSpacing:".06em",textTransform:"uppercase"}}>Categoria</div>
            <button onClick={addCat} style={{background:"none",border:"none",color:"#B91D55",fontSize:18,cursor:"pointer",lineHeight:1,padding:"0 2px"}}>+</button>
          </div>
          <div style={{maxHeight:200,overflowY:"auto",display:"flex",flexDirection:"column",gap:4}}>
            {lista.map(c=>(
              <div key={c.id} onClick={()=>setSelCat(c.id)}
                style={{display:"flex",alignItems:"center",gap:7,padding:"8px 10px",borderRadius:9,background:selCat===c.id?"rgba(232,32,95,0.1)":"rgba(0,0,0,0.03)",border:`1px solid ${selCat===c.id?"rgba(232,32,95,0.3)":"transparent"}`,cursor:"pointer"}}>
                <span style={{color:"#5A4A3A",display:"flex"}}><Glyph e={c.emoji} size={15}/></span>
                <span style={{flex:1,fontSize:12,fontWeight:500,color:"#1A1209"}}>{c.nome}</span>
                <button onClick={e=>{e.stopPropagation();setEditMode("cat");setEditId(c.id);setEditVal({nome:c.nome,emoji:c.emoji});setSelCat(c.id);}}
                  style={{background:"none",border:"none",color:"#aaa",fontSize:12,cursor:"pointer",padding:"0 2px"}}><Pencil size={12} strokeWidth={2.2}/></button>
                <button onClick={e=>{e.stopPropagation();delCat(c.id);}}
                  style={{background:"none",border:"none",color:"#aaa",fontSize:12,cursor:"pointer",padding:"0 2px"}}><Trash2 size={13} strokeWidth={2.2}/></button>
              </div>
            ))}
          </div>
        </div>

        {/* Subcategorias */}
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{fontSize:11,fontWeight:700,color:"#5A4A3A",letterSpacing:".06em",textTransform:"uppercase"}}>Subcategoria</div>
            {selCat&&<button onClick={addSubcat} style={{background:"none",border:"none",color:"#B91D55",fontSize:18,cursor:"pointer",lineHeight:1,padding:"0 2px"}}>+</button>}
          </div>
          <div style={{maxHeight:200,overflowY:"auto",display:"flex",flexDirection:"column",gap:4}}>
            {catSel?.subcats.map(s=>(
              <div key={s.id} style={{display:"flex",alignItems:"center",gap:7,padding:"8px 10px",borderRadius:9,background:"rgba(0,0,0,0.03)"}}>
                <span style={{flex:1,fontSize:12,color:"#1A1209"}}>{s.nome}</span>
                <button onClick={()=>{setEditMode("subcat");setEditId(s.id);setEditVal({nome:s.nome});}}
                  style={{background:"none",border:"none",color:"#aaa",fontSize:12,cursor:"pointer",padding:"0 2px"}}><Pencil size={12} strokeWidth={2.2}/></button>
                <button onClick={()=>delSubcat(selCat,s.id)}
                  style={{background:"none",border:"none",color:"#aaa",fontSize:12,cursor:"pointer",padding:"0 2px"}}><Trash2 size={13} strokeWidth={2.2}/></button>
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
            <button onClick={saveEdit} style={{flex:2,background:"#B91D55",border:"none",borderRadius:10,padding:"8px",fontSize:13,fontWeight:700,cursor:"pointer",color:"#fff",fontFamily:"inherit"}}>Salvar</button>
          </div>
        </div>
      )}

      <button onClick={onClose} style={{background:"#B91D55",border:"none",borderRadius:12,padding:"12px",fontSize:14,fontWeight:700,cursor:"pointer",color:"#fff",fontFamily:"inherit",marginTop:4}}>
        Fechar
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MÓDULO 2 — PLANEJAMENTO ORÇAMENTÁRIO
// ═══════════════════════════════════════════════════════════════════

// Mês a que um plantão pertence: se já foi recebido, o mês em que o dinheiro entrou; senão, o da previsão
const mesDoPlantao = p => (p.status==="recebido" && p.dataRecebimento) ? monthKey(p.dataRecebimento) : monthKey(p.previsao||p.data);

function OrcamentoTab({movs, plantoes, cats, orcamento, setOrcamento, selMes}) {
  const [viewMode, setViewMode] = useState("planejado"); // 'planejado' | 'recebimento'
  const [editCat, setEditCat] = useState(null);
  const [editVal, setEditVal] = useState("");

  const recebimentoPrevMes = plantoes
    .filter(p => p.status!=="cancelado" && mesDoPlantao(p)===selMes)
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
          <div style={{fontSize:11,color:"#3D3226",fontFamily:"'DM Sans',sans-serif",marginTop:1,fontWeight:600}}><BarChart3 size={12} strokeWidth={2.2} style={{marginRight:4,verticalAlign:"-2px"}}/>Planejamento orçamentário</div>
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
            <div style={{fontSize:10,fontWeight:500,letterSpacing:".08em",textTransform:"uppercase",color:"#1A1209",fontFamily:"'DM Mono',ui-monospace,monospace",marginBottom:5}}>{x.l}</div>
            <div className="num" style={{fontSize:16,fontWeight:700,color:x.c,letterSpacing:"-.01em"}}>{R(x.v)}</div>
          </div>
        ))}
      </div>

      {/* Toggle % */}
      <div style={{display:"flex",background:"rgba(255,255,255,0.9)",borderRadius:12,padding:3,marginBottom:14,border:"1px solid rgba(0,0,0,0.1)",boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
        <button onClick={()=>setViewMode("planejado")}
          style={{flex:1,background:viewMode==="planejado"?"#B91D55":"transparent",color:viewMode==="planejado"?"#fff":"#1A1209",border:"none",borderRadius:10,padding:"9px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",transition:"all .15s"}}>
          % do Planejado
        </button>
        <button onClick={()=>setViewMode("recebimento")}
          style={{flex:1,background:viewMode==="recebimento"?"#B91D55":"transparent",color:viewMode==="recebimento"?"#fff":"#1A1209",border:"none",borderRadius:10,padding:"9px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",transition:"all .15s"}}>
          % do Recebimento Previsto
        </button>
      </div>

      {viewMode==="recebimento"&&recebimentoPrevMes===0&&(
        <div style={{background:"rgba(212,168,67,0.25)",border:"1px solid rgba(212,168,67,0.5)",borderRadius:10,padding:"11px 14px",marginBottom:12,fontSize:12.5,color:"#6B4C00",fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>
          <Glyph e="⚠" size={13} style={{marginRight:5}}/>Nenhum plantão com previsão para {monthLabel(selMes)}. Cadastre plantões para ver a % do recebimento.
        </div>
      )}

      {viewMode==="recebimento"&&recebimentoPrevMes>0&&(
        <div style={{background:"rgba(168,224,99,0.22)",border:"1px solid rgba(143,196,58,0.5)",borderRadius:10,padding:"11px 14px",marginBottom:12,fontSize:12.5,color:"#215010",fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>
          Base: {R(recebimentoPrevMes)} previstos para {monthLabel(selMes)}
        </div>
      )}

      {/* Tabela por categoria */}
      <div className="card" style={{padding:"16px 14px"}}>
        <div className="row-orc" style={{display:"grid",gridTemplateColumns:"1fr 82px 82px 52px",gap:8,marginBottom:10,paddingBottom:10,borderBottom:"2px solid rgba(0,0,0,0.1)"}}>
          {["Categoria","Planejado","Realizado","%"].map(h=>(
            <div key={h} style={{fontSize:10.5,fontWeight:500,color:"#1A1209",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'DM Mono',ui-monospace,monospace",textAlign:h!=="Categoria"?"right":"left"}}>{h}</div>
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
            <div key={c.id} className="row-orc" style={{display:"grid",gridTemplateColumns:"1fr 82px 82px 52px",gap:8,alignItems:"center",padding:"10px 6px",marginBottom:2,background:idx%2===0?"rgba(0,0,0,0.025)":"transparent",borderRadius:8}}>
              <div>
                <div style={{fontSize:14,fontWeight:600,color:"#1A1209",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:6}}><Glyph e={c.emoji} size={15}/>{c.nome}</div>
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
              <div style={{textAlign:"right",fontSize:12.5,fontWeight:700,color:over?"#B01818":pct>80?"#8B5A00":"#215010",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"flex-end",gap:2}}>{over&&<Glyph e="⚠" size={11}/>}{pct.toFixed(0)}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ESTUDOS — mini-plataforma de residência dentro do Velara
// ═══════════════════════════════════════════════════════════════════
const EST_INK="#15251E", EST_FOREST="#1E3A2F", EST_CREAM="#F4EBD9", EST_CORAL="#E4623F";
const EST_CORES=["#E4623F","#D9A441","#6F7B3C","#7B8FD8","#B8643A","#8E2A3A"];
const REV_DIAS=[1,7,30];
const EST_SEED=[
  ["Clínica Médica",["Cardiologia","Pneumologia","Endocrinologia","Infectologia","Nefrologia","Gastroenterologia","Hematologia","Reumatologia","Neurologia"]],
  ["Cirurgia",["Trauma","Abdome agudo","Cirurgia vascular","Urologia","Ortopedia"]],
  ["Pediatria",["Neonatologia","Imunizações","Infectologia pediátrica","Crescimento e desenvolvimento"]],
  ["Ginecologia e Obstetrícia",["Pré-natal","Parto","Ginecologia endócrina","Oncologia ginecológica"]],
  ["Medicina Preventiva",["Epidemiologia","Bioestatística","SUS e políticas de saúde","Vigilância em saúde"]],
  ["Cardiologia intervencionista e Hemodinâmica",["Anatomia coronariana e cateterismo diagnóstico","Síndromes coronarianas agudas","ICP e stents","Acessos vasculares (radial e femoral)","Hemodinâmica invasiva: pressões, débito e shunts","Valvopatias e TAVI","Cardiopatias estruturais","Antiagregação e anticoagulação no procedimento","Complicações do cateterismo","Contraste e nefropatia","Radioproteção","Choque cardiogênico e suporte mecânico"]],
].map(([nome,tops],i)=>({id:"m"+i,nome,cor:EST_CORES[i%EST_CORES.length],topicos:tops.map((t,j)=>({id:`t${i}_${j}`,nome:t,estudado:false,dataEstudo:"",revs:[]}))}));

// ── Alternador entre mini-apps (Finanças ⇄ Estudos) ──
function AppSwitch({atual,onTrocar}){
  const itens=[["fin","Finanças","#8B2B3A"],["est","Estudos","#3E5C8A"],["idi","Idiomas","#B8832A"],["med","Clínica","#2E7D7A"]];
  const idx=itens.findIndex(i=>i[0]===atual);
  const estreito=typeof window!=="undefined"&&window.innerWidth<400;
  return (
    <div role="tablist" aria-label="Trocar de aplicativo" style={{position:"relative",display:"inline-grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",background:"rgba(255,255,255,.14)",border:"1px solid rgba(255,255,255,.3)",borderRadius:999,padding:3,backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)"}}>
      <i style={{position:"absolute",top:3,bottom:3,left:3,width:"calc((100% - 6px) / 4)",borderRadius:999,background:"#FBF4E2",boxShadow:"0 6px 18px -8px rgba(0,0,0,.55)",transform:`translateX(${idx*100}%)`,transition:"transform .45s cubic-bezier(.5,0,.15,1)"}}/>
      {itens.map(([id,l,cor])=>(
        <button key={id} role="tab" aria-selected={id===atual} onClick={()=>onTrocar(id)} style={{position:"relative",zIndex:1,height:34,minHeight:34,padding:estreito?"0 6px":"0 9px",border:"none",background:"transparent",cursor:"pointer",borderRadius:999,fontFamily:"'DM Sans',sans-serif",fontSize:estreito?11:12,fontWeight:id===atual?700:500,color:id===atual?"#15251E":"rgba(255,255,255,.88)",display:"inline-flex",alignItems:"center",justifyContent:"center",gap:estreito?4:5,transition:"color .3s",whiteSpace:"nowrap"}}>
          {!estreito&&<span style={{width:6,height:6,borderRadius:"50%",background:id===atual?cor:"rgba(255,255,255,.55)",transition:"background .3s"}}/>}{l}
        </button>))}
    </div>);
}

function EstudosApp({userId,isMobile,onMenu,onTrocar}){
  const [cfg,setCfg]=useLS("v5_est_cfg",{nome:"Residência médica",prova:"",metaSem:20},userId);
  const [mats,setMats]=useLS("v5_est_mat",EST_SEED,userId);
  const [sess,setSess]=useLS("v5_est_sess",[],userId);
  const [sub,setSub]=useState("hoje");
  const [editCfg,setEditCfg]=useState(false);
  const [fCfg,setFCfg]=useState(null);
  const [aberta,setAberta]=useState(null);
  const [novoTop,setNovoTop]=useState("");
  const [novaMat,setNovaMat]=useState("");
  const [fq,setFq]=useState({matId:"",q:"",ac:""});
  const [matFoco,setMatFoco]=useState("");
  const [durMin,setDurMin]=useState(25);
  const [seg,setSeg]=useState(25*60);
  const [rodando,setRodando]=useState(false);
  const [decorrido,setDecorrido]=useState(0);
  const [manual,setManual]=useState("");
  useEffect(()=>{
    if(!rodando)return;
    const t=setInterval(()=>{setSeg(s=>s>0?s-1:0);setDecorrido(d=>d+1);},1000);
    return()=>clearInterval(t);
  },[rodando]);
  useEffect(()=>{if(rodando&&seg===0)setRodando(false);},[rodando,seg]);

  const hoje=today();
  const dias=cfg.prova?Math.ceil((new Date(cfg.prova+"T12:00:00")-new Date(hoje+"T12:00:00"))/86400000):null;
  const iniSemD=new Date(hoje+"T12:00:00"); iniSemD.setDate(iniSemD.getDate()-iniSemD.getDay());
  const iniSem=iniSemD.toISOString().slice(0,10);
  const minSem=sess.filter(s=>s.tipo==="estudo"&&s.data>=iniSem).reduce((a,s)=>a+(+s.min||0),0);
  const hSem=minSem/60;
  const todasRevs=mats.flatMap(m=>m.topicos.flatMap(t=>(t.revs||[]).map((r,ri)=>({...r,ri,matId:m.id,matNome:m.nome,cor:m.cor,topId:t.id,topNome:t.nome}))));
  const revsPend=todasRevs.filter(r=>!r.feita).sort((a,b)=>a.d.localeCompare(b.d));
  const revsHoje=revsPend.filter(r=>r.d<=hoje);
  const revsProx=revsPend.filter(r=>r.d>hoje&&r.d<=addDays(hoje,14));
  const totQ=sess.filter(s=>s.tipo==="questoes").reduce((a,s)=>a+(+s.q||0),0);
  const totAc=sess.filter(s=>s.tipo==="questoes").reduce((a,s)=>a+(+s.ac||0),0);
  const acerto=totQ>0?Math.round(totAc/totQ*100):null;
  const ativos=new Set([...sess.map(s=>s.data),...mats.flatMap(m=>m.topicos.map(t=>t.dataEstudo).filter(Boolean)),...todasRevs.filter(r=>r.feita&&r.dataFeita).map(r=>r.dataFeita)]);
  let streak=0, dd=hoje; if(!ativos.has(dd))dd=addDays(dd,-1); while(ativos.has(dd)){streak++;dd=addDays(dd,-1);}
  const totTop=mats.reduce((a,m)=>a+m.topicos.length,0), estTop=mats.reduce((a,m)=>a+m.topicos.filter(t=>t.estudado).length,0);
  const pctGeral=totTop>0?Math.round(estTop/totTop*100):0;
  const semana=Array.from({length:7},(_,i)=>{const ds=addDays(iniSem,i);const min=sess.filter(s=>s.data===ds).reduce((a,s)=>a+(+s.min||0),0);return {ds,min,ativo:ativos.has(ds),ehHoje:ds===hoje,lbl:["D","S","T","Q","Q","S","S"][i]};});
  const sugestoes=[...mats].map(m=>({m,pct:m.topicos.length?m.topicos.filter(t=>t.estudado).length/m.topicos.length:1,prox:m.topicos.find(t=>!t.estudado)})).filter(x=>x.prox).sort((a,b)=>a.pct-b.pct).slice(0,4);

  const marcarTopico=(mid,tid)=>setMats(mats.map(m=>m.id!==mid?m:{...m,topicos:m.topicos.map(t=>{
    if(t.id!==tid)return t;
    if(t.estudado)return {...t,estudado:false,dataEstudo:"",revs:[]};
    return {...t,estudado:true,dataEstudo:hoje,revs:REV_DIAS.map(n=>({d:addDays(hoje,n),n,feita:false}))};
  })}));
  const feitaRev=(mid,tid,ri)=>setMats(mats.map(m=>m.id!==mid?m:{...m,topicos:m.topicos.map(t=>t.id!==tid?t:{...t,revs:t.revs.map((r,i)=>i===ri?{...r,feita:!r.feita,dataFeita:!r.feita?hoje:""}:r)})}));
  const addTopico=mid=>{const n=novoTop.trim();if(!n)return;setMats(mats.map(m=>m.id!==mid?m:{...m,topicos:[...m.topicos,{id:uid(),nome:n,estudado:false,dataEstudo:"",revs:[]}]}));setNovoTop("");};
  const delTopico=(mid,tid)=>setMats(mats.map(m=>m.id!==mid?m:{...m,topicos:m.topicos.filter(t=>t.id!==tid)}));
  const addMateria=()=>{const n=novaMat.trim();if(!n)return;setMats([...mats,{id:uid(),nome:n,cor:EST_CORES[mats.length%EST_CORES.length],topicos:[]}]);setNovaMat("");};
  const delMateria=mid=>{if(window.confirm("Remover esta matéria e todos os tópicos?"))setMats(mats.filter(m=>m.id!==mid));};
  const addQuestoes=()=>{const q=+fq.q,ac=+fq.ac;const mid=fq.matId||mats[0]?.id;if(!(q>0)||ac<0||ac>q||!mid)return;setSess([{id:uid(),data:hoje,matId:mid,tipo:"questoes",q,ac,min:0},...sess]);setFq({...fq,q:"",ac:""});};
  const salvarFoco=()=>{const min=Math.max(1,Math.round(decorrido/60));setSess([{id:uid(),data:hoje,matId:matFoco||mats[0]?.id,tipo:"estudo",min},...sess]);setRodando(false);setDecorrido(0);setSeg(durMin*60);};
  const addManual=()=>{const min=+manual;if(!(min>0))return;setSess([{id:uid(),data:hoje,matId:matFoco||mats[0]?.id,tipo:"estudo",min},...sess]);setManual("");};
  const matDe=id=>mats.find(m=>m.id===id);
  const fmt=s=>String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0");

  const lab={fontFamily:"'DM Mono',ui-monospace,monospace",fontSize:10,letterSpacing:".12em",textTransform:"uppercase",color:"rgba(21,37,30,.6)"};
  const serif={fontFamily:"'Fraunces',Georgia,serif",fontWeight:300,letterSpacing:"-.03em"};
  const chipBtn=ativo=>({background:ativo?EST_CREAM:"rgba(244,235,217,.1)",color:ativo?EST_INK:"rgba(244,235,217,.85)",border:"1px solid "+(ativo?EST_CREAM:"rgba(244,235,217,.28)"),borderRadius:999,padding:"0 16px",height:36,fontSize:12.5,fontWeight:ativo?700:500,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,fontFamily:"'DM Sans',sans-serif"});
  const inp={background:"#fff",border:"1px solid rgba(21,37,30,.18)",borderRadius:12,padding:"11px 14px",fontSize:14,fontFamily:"'DM Sans',sans-serif",color:EST_INK,width:"100%",minWidth:0,outline:"none"};
  const btnP={background:EST_INK,color:EST_CREAM,border:"none",borderRadius:999,padding:"11px 20px",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap"};
  const btnS={background:"transparent",color:EST_INK,border:"1px solid rgba(21,37,30,.25)",borderRadius:999,padding:"10px 18px",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap"};
  const Check=({on,cor,onClick})=><button onClick={onClick} aria-label="marcar" style={{width:26,height:26,borderRadius:"50%",border:"1.5px solid "+(on?cor:"rgba(21,37,30,.3)"),background:on?cor:"transparent",color:"#fff",cursor:"pointer",flexShrink:0,fontSize:13,lineHeight:1,display:"inline-flex",alignItems:"center",justifyContent:"center",padding:0}}>{on?"✓":""}</button>;
  const CardR1=useRef(null);
  CardR1.current=({children,style})=><div style={{background:"#fff",border:"1px solid rgba(21,37,30,.1)",borderRadius:24,padding:isMobile?"20px 18px":"26px 28px",marginBottom:16,...style}}>{children}</div>;
  const Card=useRef(pp=>CardR1.current(pp)).current;
  const Titulo=({k,t,dir})=><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",gap:12,marginBottom:18}}><div><div style={lab}>{k}</div><div style={{...serif,fontSize:isMobile?26:32,marginTop:6,lineHeight:1,color:EST_INK}}>{t}</div></div>{dir}</div>;
  const RevRow=({r})=>(
    <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderTop:"1px solid rgba(21,37,30,.08)"}}>
      <Check on={r.feita} cor={r.cor} onClick={()=>feitaRev(r.matId,r.topId,r.ri)}/>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:14.5,fontWeight:600,color:EST_INK}}>{r.topNome}</div>
        <div style={{...lab,marginTop:3,fontSize:9.5}}>{r.matNome} · revisão D{r.n}</div>
      </div>
      <span style={{...lab,fontSize:10,color:r.d<hoje?EST_CORAL:undefined,fontWeight:r.d<hoje?700:400}}>{r.d<hoje?"atrasada":r.d===hoje?"hoje":fd(r.d)}</span>
    </div>);
  const tiles=[
    {l:"Revisões hoje",v:String(revsHoje.length),u:revsHoje.length===1?"pendente":"pendentes",s:"tulipa",z:1.5,x:20,y:30,to:"rev"},
    {l:"Horas na semana",v:hSem.toFixed(1).replace(".0",""),u:"h de "+(cfg.metaSem||0)+"h",s:"manteiga",z:1.4,x:40,y:20,to:"foco"},
    {l:"Taxa de acerto",v:acerto===null?"—":acerto+"%",u:totQ+" questões",s:"noite",z:1.5,x:10,y:50,to:"q"},
    {l:"Sequência",v:String(streak),u:streak===1?"dia seguido":"dias seguidos",s:"veludo",z:1.4,x:30,y:20,to:"hoje"},
  ];
  const subs=[["hoje","Hoje"],["mat","Matérias"],["rev","Revisões"+(revsHoje.length?" · "+revsHoje.length:"")],["q","Questões"],["foco","Foco"]];

  return (
    <div className="est" style={{minHeight:"100vh",background:EST_INK,position:"relative",zIndex:1,color:EST_INK,fontFamily:"'DM Sans','Segoe UI',sans-serif"}}>
      <style>{`
        .est .est-hero{position:relative;overflow:hidden;background:${EST_INK};color:${EST_CREAM}}
        .est .est-scrim{position:absolute;inset:0;background:linear-gradient(95deg,rgba(15,24,18,.96) 0%,rgba(15,24,18,.78) 42%,rgba(15,24,18,.25) 100%)}
        .est .est-in{position:relative;max-width:1100px;margin:0 auto;padding:${isMobile?"18px 18px 54px":"26px 28px 62px"}}
        .est .est-sheet{position:relative;background:${EST_CREAM};border-radius:30px 30px 0 0;margin-top:-28px;min-height:70vh;padding:${isMobile?"26px 14px 110px":"34px 28px 110px"}}
        .est .est-wrap{max-width:1100px;margin:0 auto}
        .est .est-grid4{display:grid;grid-template-columns:repeat(${isMobile?2:4},1fr);gap:14px;margin-bottom:16px}
        .est .est-grid2{display:grid;grid-template-columns:${isMobile?"1fr":"1fr 1fr"};gap:16px}
        .est .est-pills{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;margin-top:22px;padding-bottom:2px}
        .est .est-pills::-webkit-scrollbar{display:none}
        .est input:focus,.est select:focus{border-color:${EST_FOREST}!important}
        .est button:active{transform:scale(.98)}
      `}</style>
      <div className="est-hero">
        <Motif s="noite" z={1.1} x={40} y={10} style={{position:"absolute",inset:0,opacity:.95}}/>
        <div className="est-scrim"/>
        <div className="est-in">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:isMobile?22:30}}>
            <button onClick={onMenu} aria-label="Abrir menu" style={{background:"rgba(244,235,217,.12)",border:"1px solid rgba(244,235,217,.3)",borderRadius:99,width:40,height:40,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4.5}}>{[0,1,2].map(i=><i key={i} style={{width:16,height:1.5,background:EST_CREAM,display:"block"}}/>)}</button>
            <AppSwitch atual="est" onTrocar={onTrocar}/>
            <span style={{width:40,height:40}}/>
          </div>
          <div style={{fontFamily:"'DM Mono',ui-monospace,monospace",fontSize:10.5,letterSpacing:".18em",textTransform:"uppercase",opacity:.7,marginBottom:6}}>{cfg.nome||"Prova"}{cfg.prova?" · "+fdFull(cfg.prova):""}</div>
          {dias===null
            ? <div style={{...serif,fontSize:isMobile?44:64,lineHeight:1,color:EST_CREAM}}>Defina a data<br/>da sua prova</div>
            : dias>=0
              ? <div style={{display:"flex",alignItems:"baseline",gap:14,flexWrap:"wrap"}}><span style={{...serif,fontSize:isMobile?104:150,lineHeight:.85,color:EST_CREAM}}>{dias}</span><span style={{...serif,fontSize:isMobile?22:30,opacity:.85}}>{dias===1?"dia":"dias"}<br/>para a prova</span></div>
              : <div style={{...serif,fontSize:isMobile?40:56,lineHeight:1}}>Prova realizada</div>}
          <div style={{display:"flex",alignItems:"center",gap:14,marginTop:20,flexWrap:"wrap"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:isMobile?150:200,height:6,borderRadius:99,background:"rgba(244,235,217,.2)",overflow:"hidden"}}><div style={{width:pctGeral+"%",height:"100%",background:EST_CORAL,borderRadius:99,transition:"width .5s"}}/></div>
              <span style={{fontFamily:"'DM Mono',ui-monospace,monospace",fontSize:10.5,letterSpacing:".1em",opacity:.85}}>{pctGeral}% DO CONTEÚDO · {estTop}/{totTop}</span>
            </div>
            <button onClick={()=>{setFCfg({...cfg});setEditCfg(true);setSub("hoje");}} style={{background:"transparent",border:"none",color:EST_CREAM,opacity:.7,fontSize:12,cursor:"pointer",textDecoration:"underline",textUnderlineOffset:4}}>editar prova</button>
          </div>
          <div className="est-pills">{subs.map(([id,l])=><button key={id} onClick={()=>setSub(id)} style={chipBtn(sub===id)}>{l}</button>)}</div>
        </div>
      </div>

      <div className="est-sheet"><div className="est-wrap">

      {editCfg&&fCfg&&(
        <Card>
          <Titulo k="Configuração" t="Sua prova"/>
          <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"2fr 1fr 1fr",gap:12,marginBottom:16}}>
            <div><div style={{...lab,marginBottom:6}}>Nome</div><input style={inp} value={fCfg.nome} onChange={e=>setFCfg({...fCfg,nome:e.target.value})} placeholder="Ex: Residência — Cardiologia"/></div>
            <div><div style={{...lab,marginBottom:6}}>Data da prova</div><input style={inp} type="date" value={fCfg.prova} onChange={e=>setFCfg({...fCfg,prova:e.target.value})}/></div>
            <div><div style={{...lab,marginBottom:6}}>Meta (h/semana)</div><input style={inp} type="number" min="0" value={fCfg.metaSem} onChange={e=>setFCfg({...fCfg,metaSem:e.target.value})}/></div>
          </div>
          <div style={{display:"flex",gap:10}}><button style={btnP} onClick={()=>{setCfg({...fCfg,metaSem:+fCfg.metaSem||0});setEditCfg(false);}}>Salvar</button><button style={btnS} onClick={()=>setEditCfg(false)}>Cancelar</button></div>
        </Card>)}

      {/* ═ HOJE ═ */}
      {sub==="hoje"&&(<>
        <div className="est-grid4">
          {tiles.map(t=>(
            <div key={t.l} className="bento-tile" onClick={()=>setSub(t.to)} style={{background:STY[t.s].paper,cursor:"pointer",minHeight:isMobile?172:200}}>
              <Motif s={t.s} z={t.z} x={t.x} y={t.y} style={{position:"absolute",inset:0,zIndex:0,pointerEvents:"none"}}/>
              <div className="tile-panel" style={{marginTop:"auto"}}>
                <div style={{...lab,fontSize:9.5,color:"rgba(42,30,20,.65)"}}>{t.l}</div>
                <div style={{display:"flex",alignItems:"baseline",gap:6,marginTop:6,flexWrap:"wrap"}}><span style={{...serif,fontSize:isMobile?34:42,lineHeight:1,color:"#2A1E14"}}>{t.v}</span><span style={{fontSize:11.5,opacity:.6}}>{t.u}</span></div>
              </div>
            </div>))}
        </div>
        <div className="est-grid2">
          <Card>
            <Titulo k="Memória" t="Revisões de hoje" dir={<button style={{...btnS,padding:"8px 14px",fontSize:12}} onClick={()=>setSub("rev")}>ver todas</button>}/>
            {revsHoje.length===0
              ? <div style={{display:"flex",alignItems:"center",gap:16}}><div style={{width:84,height:84,borderRadius:22,overflow:"hidden",flexShrink:0}}><Motif s="tulipa" z={1.55} x={0} y={36}/></div><div style={{fontSize:14,lineHeight:1.45,color:"rgba(21,37,30,.65)"}}>Nenhuma revisão pendente.<br/>Marque tópicos como estudados para agendar D1, D7 e D30.</div></div>
              : revsHoje.slice(0,6).map(r=><RevRow key={r.topId+r.ri} r={r}/>)}
          </Card>
          <Card>
            <Titulo k="Próximos passos" t="O que estudar"/>
            {sugestoes.length===0
              ? <div style={{fontSize:14,color:"rgba(21,37,30,.65)"}}>Você concluiu todos os tópicos cadastrados. Adicione mais em Matérias.</div>
              : sugestoes.map(({m,prox,pct})=>(
                <div key={m.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderTop:"1px solid rgba(21,37,30,.08)"}}>
                  <Check on={false} cor={m.cor} onClick={()=>marcarTopico(m.id,prox.id)}/>
                  <div style={{flex:1,minWidth:0}}><div style={{fontSize:14.5,fontWeight:600}}>{prox.nome}</div><div style={{...lab,marginTop:3,fontSize:9.5}}>{m.nome} · {Math.round(pct*100)}% feito</div></div>
                </div>))}
          </Card>
        </div>
        <Card>
          <Titulo k="Semana" t="Ritmo de estudo" dir={<div style={{textAlign:"right"}}><div style={lab}>meta</div><div style={{...serif,fontSize:isMobile?24:30,marginTop:4}}>{hSem.toFixed(1).replace(".0","")}<small style={{fontSize:"50%",opacity:.55}}> / {cfg.metaSem||0}h</small></div></div>}/>
          <div style={{display:"flex",gap:isMobile?6:14,justifyContent:"space-between"}}>
            {semana.map((d,i)=>(
              <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
                <i style={{width:"100%",maxWidth:56,aspectRatio:"1",borderRadius:"50%",background:d.ativo?EST_INK:d.ds>hoje?"#E6DFD0":"#D9D1C3",boxShadow:d.ehHoje?"0 0 0 3px "+EST_CORAL:"none",display:"flex",alignItems:"center",justifyContent:"center",color:EST_CREAM,fontSize:isMobile?10:12,fontStyle:"normal",fontWeight:600}}>{d.min>0?Math.round(d.min/60*10)/10+"h":""}</i>
                <span style={{...lab,fontSize:9.5,color:d.ehHoje?EST_CORAL:undefined,fontWeight:d.ehHoje?700:400}}>{d.lbl}</span>
              </div>))}
          </div>
        </Card>
      </>)}

      {/* ═ MATÉRIAS ═ */}
      {sub==="mat"&&(<>
        {mats.map(m=>{
          const est=m.topicos.filter(t=>t.estudado).length, tot=m.topicos.length, pct=tot?Math.round(est/tot*100):0, op=aberta===m.id;
          return (
            <Card key={m.id} style={{padding:isMobile?"18px":"22px 26px"}}>
              <div onClick={()=>{setAberta(op?null:m.id);setNovoTop("");}} style={{display:"flex",alignItems:"center",gap:14,cursor:"pointer"}}>
                <i style={{width:14,height:14,borderRadius:"50%",background:m.cor,flexShrink:0}}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{...serif,fontSize:isMobile?22:26,lineHeight:1.1}}>{m.nome}</div>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginTop:10}}>
                    <div style={{flex:1,height:6,borderRadius:99,background:"rgba(21,37,30,.1)",overflow:"hidden"}}><div style={{width:pct+"%",height:"100%",background:m.cor,borderRadius:99,transition:"width .4s"}}/></div>
                    <span style={{...lab,fontSize:10}}>{est}/{tot} · {pct}%</span>
                  </div>
                </div>
                <span style={{fontSize:18,opacity:.5,transform:op?"rotate(90deg)":"none",transition:"transform .2s"}}>›</span>
              </div>
              {op&&(
                <div style={{marginTop:16}}>
                  {m.topicos.map(t=>(
                    <div key={t.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderTop:"1px solid rgba(21,37,30,.08)"}}>
                      <Check on={t.estudado} cor={m.cor} onClick={()=>marcarTopico(m.id,t.id)}/>
                      <div style={{flex:1,minWidth:0}}><div style={{fontSize:14.5,fontWeight:500,textDecoration:t.estudado?"none":"none",opacity:t.estudado?.6:1}}>{t.nome}</div>{t.estudado&&<div style={{...lab,fontSize:9.5,marginTop:2}}>estudado em {fd(t.dataEstudo)}</div>}</div>
                      <button onClick={()=>delTopico(m.id,t.id)} aria-label="remover" style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:"rgba(21,37,30,.35)",padding:"0 4px"}}>×</button>
                    </div>))}
                  <div style={{display:"flex",gap:10,marginTop:12}}>
                    <input style={inp} value={novoTop} onChange={e=>setNovoTop(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")addTopico(m.id);}} placeholder="Novo tópico…"/>
                    <button style={btnP} onClick={()=>addTopico(m.id)}>+</button>
                  </div>
                  <button onClick={()=>delMateria(m.id)} style={{marginTop:14,background:"none",border:"none",color:"rgba(21,37,30,.5)",fontSize:12,cursor:"pointer",textDecoration:"underline",textUnderlineOffset:3}}>remover matéria</button>
                </div>)}
            </Card>);
        })}
        <Card>
          <Titulo k="Nova" t="Adicionar matéria"/>
          <div style={{display:"flex",gap:10}}><input style={inp} value={novaMat} onChange={e=>setNovaMat(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")addMateria();}} placeholder="Ex: Cardiologia intervencionista"/><button style={btnP} onClick={addMateria}>Adicionar</button></div>
        </Card>
      </>)}

      {/* ═ REVISÕES ═ */}
      {sub==="rev"&&(<>
        <Card>
          <Titulo k="Repetição espaçada" t="Para hoje"/>
          {revsHoje.length===0?<div style={{fontSize:14,color:"rgba(21,37,30,.65)"}}>Tudo em dia por aqui.</div>:revsHoje.map(r=><RevRow key={r.topId+r.ri} r={r}/>)}
        </Card>
        <Card>
          <Titulo k="Próximos 14 dias" t="Agendadas"/>
          {revsProx.length===0?<div style={{fontSize:14,color:"rgba(21,37,30,.65)"}}>Nada agendado. Cada tópico estudado gera revisões em D1, D7 e D30.</div>:revsProx.map(r=><RevRow key={r.topId+r.ri} r={r}/>)}
        </Card>
      </>)}

      {/* ═ QUESTÕES ═ */}
      {sub==="q"&&(<>
        <Card>
          <Titulo k="Desempenho" t="Registrar questões" dir={<div style={{textAlign:"right"}}><div style={lab}>acerto geral</div><div style={{...serif,fontSize:isMobile?30:38,marginTop:4,color:EST_CORAL}}>{acerto===null?"—":acerto+"%"}</div></div>}/>
          <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"2fr 1fr 1fr auto",gap:12,alignItems:"end"}}>
            <div style={{gridColumn:isMobile?"1 / 3":"auto"}}><div style={{...lab,marginBottom:6}}>Matéria</div><select style={inp} value={fq.matId||mats[0]?.id||""} onChange={e=>setFq({...fq,matId:e.target.value})}>{mats.map(m=><option key={m.id} value={m.id}>{m.nome}</option>)}</select></div>
            <div><div style={{...lab,marginBottom:6}}>Questões</div><input style={inp} type="number" min="1" value={fq.q} onChange={e=>setFq({...fq,q:e.target.value})} placeholder="20"/></div>
            <div><div style={{...lab,marginBottom:6}}>Acertos</div><input style={inp} type="number" min="0" value={fq.ac} onChange={e=>setFq({...fq,ac:e.target.value})} placeholder="15"/></div>
            <button style={{...btnP,gridColumn:isMobile?"1 / 3":"auto"}} onClick={addQuestoes}>Salvar</button>
          </div>
        </Card>
        <Card>
          <Titulo k="Por matéria" t="Taxa de acerto"/>
          {mats.map(m=>{const ss=sess.filter(s=>s.tipo==="questoes"&&s.matId===m.id);const q=ss.reduce((a,s)=>a+(+s.q||0),0),ac=ss.reduce((a,s)=>a+(+s.ac||0),0);const p=q?Math.round(ac/q*100):0;return (
            <div key={m.id} style={{padding:"11px 0",borderTop:"1px solid rgba(21,37,30,.08)"}}>
              <div style={{display:"flex",justifyContent:"space-between",gap:10,marginBottom:8}}><span style={{fontSize:14.5,fontWeight:600}}>{m.nome}</span><span style={{...lab,fontSize:10}}>{q?`${ac}/${q} · ${p}%`:"sem registros"}</span></div>
              <div style={{height:8,borderRadius:99,background:"rgba(21,37,30,.1)",overflow:"hidden"}}><div style={{width:p+"%",height:"100%",background:m.cor,borderRadius:99,transition:"width .4s"}}/></div>
            </div>);})}
        </Card>
        <Card>
          <Titulo k="Histórico" t="Últimos registros"/>
          {sess.filter(s=>s.tipo==="questoes").length===0?<div style={{fontSize:14,color:"rgba(21,37,30,.65)"}}>Nenhuma sessão de questões ainda.</div>:sess.filter(s=>s.tipo==="questoes").slice(0,8).map(s=>{const m=matDe(s.matId);return (
            <div key={s.id} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 0",borderTop:"1px solid rgba(21,37,30,.08)"}}>
              <i style={{width:10,height:10,borderRadius:"50%",background:m?.cor||"#999",flexShrink:0}}/>
              <div style={{flex:1,minWidth:0}}><div style={{fontSize:14.5,fontWeight:600}}>{m?.nome||"—"}</div><div style={{...lab,fontSize:9.5,marginTop:3}}>{fd(s.data)}</div></div>
              <span style={{...serif,fontSize:22}}>{s.ac}/{s.q}</span>
              <button onClick={()=>setSess(sess.filter(x=>x.id!==s.id))} aria-label="remover" style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:"rgba(21,37,30,.35)"}}>×</button>
            </div>);})}
        </Card>
      </>)}

      {/* ═ FOCO ═ */}
      {sub==="foco"&&(<>
        <Card style={{textAlign:"center"}}>
          <div style={lab}>Sessão de foco</div>
          <div style={{position:"relative",width:isMobile?250:300,height:isMobile?250:300,margin:"18px auto"}}>
            <svg viewBox="0 0 100 100" width="100%" height="100%" style={{transform:"rotate(-90deg)"}}>
              <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(21,37,30,.1)" strokeWidth="2.5"/>
              <circle cx="50" cy="50" r="46" fill="none" stroke={EST_CORAL} strokeWidth="2.5" strokeLinecap="round" strokeDasharray={2*Math.PI*46} strokeDashoffset={2*Math.PI*46*(durMin*60>0?seg/(durMin*60):0)} style={{transition:"stroke-dashoffset 1s linear"}}/>
            </svg>
            <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
              <div style={{...serif,fontSize:isMobile?60:72,lineHeight:1}}>{fmt(seg)}</div>
              <div style={{...lab,marginTop:8}}>{seg===0?"concluído":rodando?"focando":"pronto"}</div>
            </div>
          </div>
          <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:16,flexWrap:"wrap"}}>
            {[25,50,90].map(n=><button key={n} disabled={rodando} onClick={()=>{setDurMin(n);setSeg(n*60);setDecorrido(0);}} style={{...btnS,padding:"8px 16px",background:durMin===n?EST_INK:"transparent",color:durMin===n?EST_CREAM:EST_INK,opacity:rodando?.5:1}}>{n} min</button>)}
          </div>
          <div style={{maxWidth:360,margin:"0 auto 18px"}}><select style={inp} value={matFoco||mats[0]?.id||""} onChange={e=>setMatFoco(e.target.value)}>{mats.map(m=><option key={m.id} value={m.id}>{m.nome}</option>)}</select></div>
          <div style={{display:"flex",justifyContent:"center",gap:10,flexWrap:"wrap"}}>
            <button style={btnP} onClick={()=>{if(seg===0){setSeg(durMin*60);setDecorrido(0);}setRodando(!rodando);}}>{rodando?"Pausar":seg===0?"Reiniciar":decorrido>0?"Continuar":"Iniciar"}</button>
            {decorrido>=60&&<button style={{...btnP,background:EST_CORAL}} onClick={salvarFoco}>Salvar {Math.round(decorrido/60)} min</button>}
            {(decorrido>0||seg!==durMin*60)&&<button style={btnS} onClick={()=>{setRodando(false);setDecorrido(0);setSeg(durMin*60);}}>Zerar</button>}
          </div>
        </Card>
        <Card>
          <Titulo k="Sem cronômetro" t="Registrar tempo"/>
          <div style={{display:"flex",gap:10}}><input style={inp} type="number" min="1" value={manual} onChange={e=>setManual(e.target.value)} placeholder="Minutos estudados (matéria selecionada acima)"/><button style={btnP} onClick={addManual}>Salvar</button></div>
        </Card>
        <Card>
          <Titulo k="Histórico" t="Sessões de estudo"/>
          {sess.filter(s=>s.tipo==="estudo").length===0?<div style={{fontSize:14,color:"rgba(21,37,30,.65)"}}>Nenhuma sessão registrada.</div>:sess.filter(s=>s.tipo==="estudo").slice(0,8).map(s=>{const m=matDe(s.matId);return (
            <div key={s.id} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 0",borderTop:"1px solid rgba(21,37,30,.08)"}}>
              <i style={{width:10,height:10,borderRadius:"50%",background:m?.cor||"#999",flexShrink:0}}/>
              <div style={{flex:1,minWidth:0}}><div style={{fontSize:14.5,fontWeight:600}}>{m?.nome||"—"}</div><div style={{...lab,fontSize:9.5,marginTop:3}}>{fd(s.data)}</div></div>
              <span style={{...serif,fontSize:22}}>{s.min}<small style={{fontSize:"55%",opacity:.55}}> min</small></span>
              <button onClick={()=>setSess(sess.filter(x=>x.id!==s.id))} aria-label="remover" style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:"rgba(21,37,30,.35)"}}>×</button>
            </div>);})}
        </Card>
      </>)}

      </div></div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// IDIOMAS — mini-plataforma de alemão e francês dentro do Velara
// ═══════════════════════════════════════════════════════════════════
const IDI_INK="#2A1E14", IDI_CREAM="#F6EBD3", IDI_PAPER="#FCF6E8", IDI_GOLD="#D9A441", IDI_BLUE="#6F86D6", IDI_RED="#C4503A";
const NIVEIS=["A1","A2","B1","B2","C1","C2"];
const HAB=[["ouvir","Ouvir"],["falar","Falar"],["ler","Ler"],["escrever","Escrever"],["gramatica","Gramática"],["vocab","Vocabulário"]];
const IDI_TIPOS=[...HAB,["aula","Aula"]];
const LEIT=[1,3,7,14,30,60];
const IDI_LANGS=[
  {id:"de",nome:"Alemão",cod:"DE",cor:IDI_GOLD,nivel:"B1",alvo:"B2",prova:"",metaSem:4},
  {id:"fr",nome:"Francês",cod:"FR",cor:IDI_BLUE,nivel:"A2",alvo:"B1",prova:"",metaSem:3},
];
const IDI_TEMAS={
  de:{ink:IDI_INK,sheet:IDI_CREAM,paper:IDI_PAPER,acc:IDI_GOLD,rgb:"42,30,20",hrgb:"246,235,211",hero:{s:"manteiga",z:1.2,x:45,y:15},scrim:"linear-gradient(95deg,rgba(32,21,12,.96) 0%,rgba(32,21,12,.8) 45%,rgba(32,21,12,.28) 100%)",tiles:["tulipa","manteiga","noite","veludo"],nome:"Deutsch"},
  fr:{ink:"#17213F",sheet:"#EAEEF9",paper:"#F6F8FD",acc:IDI_BLUE,rgb:"23,33,63",hrgb:"234,238,249",hero:{s:"marinho",z:1.2,x:30,y:20},scrim:"linear-gradient(95deg,rgba(11,17,42,.96) 0%,rgba(11,17,42,.8) 45%,rgba(11,17,42,.3) 100%)",tiles:["marinho","tulipa","veludo","manteiga"],nome:"Français"},
};

// ── Substantivos alemães: cores por artigo, regras de terminação e banco básico ──
const ART_COR={der:"#3F6FB5",die:"#C4503A",das:"#4E8A3E",le:"#3F6FB5",la:"#C4503A"};
const ART_BG={der:"#DCE7F6",die:"#F6DDD6",das:"#DDEBD6",le:"#DCE7F6",la:"#F6DDD6"};
const SUF_REGRAS=[
  ["chen","das","sempre"],["lein","das","sempre"],["ung","die","sempre"],["heit","die","sempre"],["keit","die","sempre"],["schaft","die","sempre"],["ion","die","sempre"],["tät","die","sempre"],["ismus","der","sempre"],["ling","der","sempre"],
  ["ment","das","quase sempre"],["nis","das","quase sempre"],["tum","das","quase sempre"],["ik","die","quase sempre"],["ur","die","quase sempre"],["ei","die","quase sempre"],["ie","die","quase sempre"],["ig","der","quase sempre"],["ist","der","quase sempre"],["or","der","quase sempre"],["um","das","quase sempre"],["ma","das","quase sempre"],
  ["ge-","das","geralmente"],["er","der","geralmente"],["e","die","geralmente"],
];
const sugerirArt=raw=>{
  const t=(raw||"").trim().replace(/^(der|die|das)\s+/i,""); if(t.length<3)return null;
  const w=t.toLowerCase();
  for(const [suf,art,conf] of SUF_REGRAS){
    if(suf==="ge-"){ if(w.startsWith("ge")&&w.length>5)return {suf:"Ge-",art,conf}; continue; }
    if(w.length>suf.length+1&&w.endsWith(suf)){ if(suf==="e"&&w.endsWith("ee"))continue; return {suf:"-"+suf,art,conf}; }
  }
  return null;
};
const REGRAS_ART={
  der:[["-ling, -ismus, -ist, -ig, -or","der Frühling, der Optimismus, der König (quase sempre)"],["-er (pessoas e instrumentos)","der Lehrer, der Computer — mas die Mutter, das Fenster"],["Dias, meses, estações, pontos cardeais","der Montag, der Juli, der Winter, der Norden"],["Chuva, neve e vento","der Regen, der Schnee, der Wind"],["Bebidas alcoólicas (exceto das Bier)","der Wein, der Wodka"],["Marcas de carro","der BMW, der Mercedes"]],
  die:[["-ung, -heit, -keit, -schaft","die Zeitung, die Freiheit, die Möglichkeit, die Freundschaft (sempre)"],["-ion, -tät, -ik, -ur, -ei, -ie","die Nation, die Universität, die Musik, die Kultur (quase sempre)"],["-in (profissões femininas)","die Lehrerin, die Ärztin"],["Maioria das palavras em -e (≈90%)","die Blume, die Schule — mas der Name, der Käse, das Ende"],["Números como substantivo","die Eins, die Zehn"]],
  das:[["-chen, -lein (diminutivos)","das Mädchen, das Brötchen (sempre)"],["-ment, -um, -ma, -nis, -tum","das Medikament, das Museum, das Thema, das Ergebnis (quase sempre)"],["Prefixo Ge-","das Gebäude, das Gespräch, das Geschenk (geralmente)"],["Verbos viram substantivos","das Essen, das Lernen"],["Cores, línguas e metais","das Blau, das Deutsch, das Gold"],["Cidades e a maioria dos países","das Berlin — mas die Schweiz, die Türkei"]],
};
const BANCO=`der|Tisch|Tische|mesa
der|Stuhl|Stühle|cadeira
der|Schrank|Schränke|armário
der|Schlüssel|Schlüssel|chave
der|Koffer|Koffer|mala
der|Stift|Stifte|caneta, lápis
der|Computer|Computer|computador
der|Rucksack|Rucksäcke|mochila
der|Spiegel|Spiegel|espelho
der|Teller|Teller|prato
der|Löffel|Löffel|colher
der|Garten|Gärten|jardim
der|Baum|Bäume|árvore
der|Fisch|Fische|peixe
der|Vogel|Vögel|pássaro
der|Hund|Hunde|cachorro
der|Apfel|Äpfel|maçã
der|Kuchen|Kuchen|bolo
der|Käse|Käse|queijo|Termina em -e mas é der: exceção clássica
der|Kaffee|Kaffees|café (bebida)
der|Wein|Weine|vinho|Álcool costuma ser der
der|Honig||mel|-ig → der
der|Mond|Monde|lua|Invertido em relação ao português: a lua é masculina
der|Mann|Männer|homem
der|Vater|Väter|pai
der|Bruder|Brüder|irmão
der|Sohn|Söhne|filho
der|Freund|Freunde|amigo
der|Lehrer|Lehrer|professor
der|Schüler|Schüler|aluno
der|Arzt|Ärzte|médico
der|Chef|Chefs|chefe
der|Student|Studenten|estudante universitário
der|König|Könige|rei|-ig → der
der|Name|Namen|nome|Termina em -e mas é der
der|Junge|Jungen|menino|Termina em -e mas é der (masculino)
der|Tag|Tage|dia
der|Monat|Monate|mês
der|Morgen|Morgen|manhã
der|Abend|Abende|noite (começo)
der|Montag|Montage|segunda-feira|Dias, meses e estações: sempre der
der|Winter|Winter|inverno|Estações: sempre der
der|Sommer|Sommer|verão|Estações: sempre der
der|Herbst|Herbste|outono|Estações: sempre der
der|Frühling|Frühlinge|primavera|-ling → der
der|Lehrling|Lehrlinge|aprendiz|-ling → der
der|Optimismus||otimismo|-ismus → der
der|Regen||chuva|Chuva e neve: der
der|Schnee||neve|Chuva e neve: der
der|Zug|Züge|trem
der|Bahnhof|Bahnhöfe|estação de trem
der|Flughafen|Flughäfen|aeroporto
der|Platz|Plätze|praça, lugar
der|Weg|Wege|caminho
der|Fluss|Flüsse|rio
der|Berg|Berge|montanha
der|See|Seen|lago|der See = lago; die See = mar
der|Urlaub|Urlaube|férias
der|Beruf|Berufe|profissão
der|Preis|Preise|preço
der|Termin|Termine|compromisso, consulta
der|Himmel|Himmel|céu
der|Motor|Motoren|motor|-or → der
der|Pullover|Pullover|suéter
die|Frau|Frauen|mulher
die|Mutter|Mütter|mãe|Termina em -er mas é die: exceção
die|Schwester|Schwestern|irmã|Exceção ao -er
die|Tochter|Töchter|filha|Exceção ao -er
die|Lehrerin|Lehrerinnen|professora|-in → die
die|Ärztin|Ärztinnen|médica|-in → die
die|Familie|Familien|família|-ie → die
die|Katze|Katzen|gato(a)
die|Maus|Mäuse|rato
die|Woche|Wochen|semana
die|Nacht|Nächte|noite
die|Stunde|Stunden|hora
die|Minute|Minuten|minuto
die|Uhr|Uhren|relógio, hora
die|Zeit|Zeiten|tempo
die|Stadt|Städte|cidade
die|Straße|Straßen|rua
die|Wohnung|Wohnungen|apartamento|-ung → die
die|Küche|Küchen|cozinha
die|Tür|Türen|porta
die|Wand|Wände|parede
die|Tasche|Taschen|bolsa
die|Lampe|Lampen|lâmpada
die|Blume|Blumen|flor
die|Sonne|Sonnen|sol|Invertido em relação ao português: o sol é feminino
die|See||mar|die See = mar; der See = lago
die|Milch||leite
die|Butter||manteiga|Termina em -er mas é die: exceção
die|Suppe|Suppen|sopa
die|Tomate|Tomaten|tomate
die|Banane|Bananen|banana
die|Gabel|Gabeln|garfo|Talheres: der Löffel, die Gabel, das Messer
die|Brille|Brillen|óculos
die|Zeitung|Zeitungen|jornal|-ung → die
die|Hausaufgabe|Hausaufgaben|dever de casa
die|Übung|Übungen|exercício|-ung → die
die|Prüfung|Prüfungen|prova|-ung → die
die|Erfahrung|Erfahrungen|experiência|-ung → die
die|Freiheit|Freiheiten|liberdade|-heit → die
die|Gesundheit||saúde|-heit → die
die|Möglichkeit|Möglichkeiten|possibilidade|-keit → die
die|Schwierigkeit|Schwierigkeiten|dificuldade|-keit → die
die|Freundschaft|Freundschaften|amizade|-schaft → die
die|Gesellschaft|Gesellschaften|sociedade|-schaft → die
die|Nation|Nationen|nação|-ion → die
die|Information|Informationen|informação|-ion → die
die|Universität|Universitäten|universidade|-tät → die
die|Qualität|Qualitäten|qualidade|-tät → die
die|Musik||música|-ik → die
die|Natur||natureza|-ur → die
die|Kultur|Kulturen|cultura|-ur → die
die|Bäckerei|Bäckereien|padaria|-ei → die
die|Reise|Reisen|viagem
die|Arbeit|Arbeiten|trabalho
die|Hand|Hände|mão
die|Nase|Nasen|nariz
die|Zahl|Zahlen|número
die|Frage|Fragen|pergunta
die|Antwort|Antworten|resposta
die|Sprache|Sprachen|língua
die|Schule|Schulen|escola
die|Kirche|Kirchen|igreja
die|Bank|Banken|banco (financeiro)
die|Brücke|Brücken|ponte
das|Kind|Kinder|criança
das|Mädchen|Mädchen|menina|-chen → sempre das, mesmo sendo uma menina
das|Brötchen|Brötchen|pãozinho|-chen → das
das|Häuschen|Häuschen|casinha|-chen → das
das|Haus|Häuser|casa
das|Auto|Autos|carro
das|Buch|Bücher|livro
das|Wasser||água|Termina em -er mas é das: exceção
das|Brot|Brote|pão
das|Bier|Biere|cerveja|Álcool costuma ser der (der Wein), mas das Bier
das|Fenster|Fenster|janela|Termina em -er mas é das: exceção
das|Zimmer|Zimmer|quarto|Termina em -er mas é das: exceção
das|Messer|Messer|faca|Talheres: der Löffel, die Gabel, das Messer
das|Gewitter|Gewitter|tempestade|Prefixo Ge- → das
das|Gebäude|Gebäude|prédio|Prefixo Ge- → das
das|Gespräch|Gespräche|conversa|Prefixo Ge- → das
das|Geschenk|Geschenke|presente|Prefixo Ge- → das
das|Gemüse||legumes|Prefixo Ge- → das
das|Datum|Daten|data|-um → das
das|Museum|Museen|museu|-um → das
das|Zentrum|Zentren|centro|-um → das
das|Medikament|Medikamente|medicamento|-ment → das
das|Instrument|Instrumente|instrumento|-ment → das
das|Dokument|Dokumente|documento|-ment → das
das|Ergebnis|Ergebnisse|resultado|-nis → das
das|Geheimnis|Geheimnisse|segredo|-nis → das
das|Thema|Themen|tema|-ma → das
das|Problem|Probleme|problema
das|System|Systeme|sistema
das|Wetter||tempo (clima)|Termina em -er mas é das: exceção
das|Jahr|Jahre|ano
das|Telefon|Telefone|telefone
das|Handy|Handys|celular
das|Bett|Betten|cama
das|Bild|Bilder|imagem
das|Geld||dinheiro
das|Ei|Eier|ovo
das|Obst||frutas
das|Fleisch||carne
das|Glas|Gläser|copo, vidro
das|Spiel|Spiele|jogo
das|Lied|Lieder|canção
das|Land|Länder|país
das|Dorf|Dörfer|vilarejo
das|Ohr|Ohren|orelha
das|Auge|Augen|olho|Termina em -e mas é das: exceção
das|Herz|Herzen|coração
das|Wort|Wörter|palavra
das|Café|Cafés|café (lugar)
das|Hotel|Hotels|hotel
das|Fahrrad|Fahrräder|bicicleta
das|Krankenhaus|Krankenhäuser|hospital
das|Ende|Enden|fim|Termina em -e mas é das: exceção
das|Essen||comida, refeição|Verbo vira substantivo → sempre das
das|Lernen||o aprender|Verbo vira substantivo → sempre das`.split("\n").map(l=>{const [art,termo,plural,trad,dica]=l.split("|");return {k:`de:${art}:${termo.toLowerCase()}`,art,termo,plural:plural||"",trad,dica:dica||"",bank:true};});

// ── Francês: banco básico e regras (le/la) ──
const SUF_FR=[
  ["tion","la","sempre"],["sion","la","sempre"],["isme","le","sempre"],
  ["té","la","quase sempre"],["ure","la","quase sempre"],["ette","la","quase sempre"],["esse","la","quase sempre"],["ude","la","quase sempre"],["ence","la","quase sempre"],["ance","la","quase sempre"],["ée","la","quase sempre"],["ie","la","quase sempre"],
  ["age","le","quase sempre"],["ment","le","quase sempre"],["eau","le","quase sempre"],["oir","le","quase sempre"],["ier","le","quase sempre"],["al","le","quase sempre"],
  ["ique","la","geralmente"],["teur","le","geralmente"],
];
const sugerirArtFr=raw=>{
  const t=(raw||"").trim().replace(/^(?:(?:le|la)\s+|l['’])/i,""); if(t.length<3)return null;
  const w=t.toLowerCase();
  for(const [suf,art,conf] of SUF_FR){ if(w.length>suf.length+1&&w.endsWith(suf))return {suf:"-"+suf,art,conf}; }
  return null;
};
const REGRAS_FR={
  le:[["-age, -ment, -isme","le voyage, le gouvernement, le tourisme (quase sempre) — mas la page, la plage, l'image"],["-eau, -oir, -ier, -al","le bureau, le miroir, le quartier, le journal — mas l'eau, la peau"],["-teur (profissões)","le directeur, l'acteur (geralmente)"],["Dias, meses, estações e línguas","le lundi, le mois, le printemps, le français"],["Metais, cores e árvores","le fer, le bleu, le chêne"]],
  la:[["-tion, -sion","la nation, la télévision, la question (sempre)"],["-té","la liberté, la qualité, la santé — mas le côté, l'été"],["-ure, -ette, -esse, -ude","la culture, la fourchette, la tristesse, l'étude (quase sempre)"],["-ence, -ance","la différence, la chance — mas le silence"],["-ie, -ée, -ique","la vie, l'année, la musique — mas le musée, le lycée"]],
};
const BANCO_FR=`le|livre|livres|livro
le|stylo|stylos|caneta
le|cahier|cahiers|caderno|-ier → le
le|sac|sacs|bolsa, mochila
le|téléphone|téléphones|telefone
le|ordinateur|ordinateurs|computador
le|bureau|bureaux|escritório, escrivaninha|-eau → le; plural em -x
le|couteau|couteaux|faca|-eau → le; plural em -x
le|gâteau|gâteaux|bolo|-eau → le; plural em -x
le|manteau|manteaux|casaco|-eau → le; plural em -x
le|verre|verres|copo
le|fromage|fromages|queijo|-age → le
le|pain|pains|pão
le|vin|vins|vinho
le|café|cafés|café
le|lait||leite
le|sucre|sucres|açúcar
le|poisson|poissons|peixe
le|poulet|poulets|frango
le|légume|légumes|legume
le|fruit|fruits|fruta
le|repas|repas|refeição
le|jour|jours|dia
le|mois|mois|mês|Dias, meses e estações são masculinos
le|matin|matins|manhã
le|soir|soirs|fim de tarde, noite
le|temps|temps|tempo
le|travail|travaux|trabalho|Plural irregular: travaux
le|voyage|voyages|viagem|-age → le
le|village|villages|vilarejo|-age → le
le|message|messages|mensagem|-age → le
le|mariage|mariages|casamento|-age → le
le|garage|garages|garagem|-age → le
le|nuage|nuages|nuvem|-age → le
le|paysage|paysages|paisagem|-age → le
le|visage|visages|rosto|-age → le
le|gouvernement|gouvernements|governo|-ment → le
le|appartement|appartements|apartamento|-ment → le
le|moment|moments|momento|-ment → le
le|médicament|médicaments|medicamento|-ment → le
le|tourisme||turismo|-isme → le
le|avion|avions|avião
le|train|trains|trem
le|bus|bus|ônibus
le|vélo|vélos|bicicleta
le|métro|métros|metrô
le|aéroport|aéroports|aeroporto
le|billet|billets|bilhete
le|passeport|passeports|passaporte
le|hôtel|hôtels|hotel
le|restaurant|restaurants|restaurante
le|magasin|magasins|loja
le|marché|marchés|mercado
le|quartier|quartiers|bairro|-ier → le
le|escalier|escaliers|escada|-ier → le
le|journal|journaux|jornal|-al → le; plural em -aux
le|animal|animaux|animal|-al → le; plural em -aux
le|hôpital|hôpitaux|hospital|-al → le; plural em -aux
le|cheval|chevaux|cavalo|Plural irregular: chevaux
le|miroir|miroirs|espelho|-oir → le
le|problème|problèmes|problema|Termina em -e mas é masculino (-ème de origem grega)
le|système|systèmes|sistema|Termina em -e mas é masculino
le|groupe|groupes|grupo|Termina em -e mas é masculino
le|monde|mondes|mundo
le|exemple|exemples|exemplo|Termina em -e mas é masculino
le|programme|programmes|programa|Termina em -e mas é masculino
le|nom|noms|nome
le|numéro|numéros|número
le|mot|mots|palavra
le|conseil|conseils|conselho
le|choix|choix|escolha
le|prix|prix|preço
le|pays|pays|país
le|mur|murs|parede externa, muro
le|jeu|jeux|jogo|Plural irregular: jeux
le|lit|lits|cama
le|fauteuil|fauteuils|poltrona
le|salon|salons|sala de estar
le|plat|plats|prato (comida)
le|pantalon|pantalons|calça
le|pull|pulls|suéter
le|chemin|chemins|caminho
le|père|pères|pai
le|frère|frères|irmão
le|fils|fils|filho
le|mari|maris|marido
le|ami|amis|amigo
le|bras|bras|braço
le|pied|pieds|pé
le|doigt|doigts|dedo
le|cœur|cœurs|coração
le|dos|dos|costas
le|corps|corps|corpo
le|nez|nez|nariz
le|ventre|ventres|barriga
le|genou|genoux|joelho|Plural irregular: genoux
le|soleil|soleils|sol
le|ciel|cieux|céu|Plural irregular: cieux
le|arbre|arbres|árvore
le|jardin|jardins|jardim
le|lac|lacs|lago
le|fleuve|fleuves|rio (que desemboca no mar)
le|sel|sels|sal
le|bonheur|bonheurs|felicidade
le|amour|amours|amor
le|musée|musées|museu|Termina em -ée mas é masculino: exceção
le|lycée|lycées|ensino médio|Termina em -ée mas é masculino: exceção
le|côté|côtés|lado|Termina em -té mas é masculino: exceção
le|été|étés|verão|Termina em -té mas é masculino: exceção. Estações são masculinas
le|silence|silences|silêncio|Termina em -ence mas é masculino: exceção
le|printemps|printemps|primavera|Estações são masculinas
le|hiver|hivers|inverno|Estações são masculinas
le|docteur|docteurs|médico|-teur → geralmente le
le|professeur|professeurs|professor
le|directeur|directeurs|diretor|-teur → geralmente le
le|acteur|acteurs|ator|-teur → geralmente le
le|client|clients|cliente
le|médecin|médecins|médico
la|maison|maisons|casa
la|fenêtre|fenêtres|janela
la|porte|portes|porta
la|chambre|chambres|quarto
la|cuisine|cuisines|cozinha
la|table|tables|mesa
la|chaise|chaises|cadeira
la|voiture|voitures|carro|-ure → la
la|rue|rues|rua
la|ville|villes|cidade
la|route|routes|estrada
la|gare|gares|estação de trem
la|école|écoles|escola
la|université|universités|universidade|-té → la
la|bibliothèque|bibliothèques|biblioteca
la|église|églises|igreja
la|banque|banques|banco
la|pharmacie|pharmacies|farmácia|-ie → la
la|boulangerie|boulangeries|padaria|-ie → la
la|famille|familles|família
la|mère|mères|mãe
la|sœur|sœurs|irmã
la|fille|filles|filha, menina
la|femme|femmes|mulher, esposa
la|amie|amies|amiga
la|tante|tantes|tia
la|main|mains|mão|Termina sem -e mas é feminino: la main
la|tête|têtes|cabeça
la|jambe|jambes|perna
la|bouche|bouches|boca
la|dent|dents|dente
la|oreille|oreilles|orelha
la|eau|eaux|água|Termina em -eau mas é feminino: exceção
la|peau|peaux|pele|Termina em -eau mas é feminino: exceção
la|fleur|fleurs|flor
la|mer|mers|mar|Em português "o mar" é masculino; em francês é feminino (la mer ≠ la mère)
la|montagne|montagnes|montanha
la|plage|plages|praia|Termina em -age mas é feminino: exceção
la|page|pages|página|Termina em -age mas é feminino: exceção
la|image|images|imagem|Termina em -age mas é feminino: exceção
la|nation|nations|nação|-tion → sempre la
la|information|informations|informação|-tion → sempre la
la|question|questions|pergunta|-tion → sempre la
la|conversation|conversations|conversa|-tion → sempre la
la|situation|situations|situação|-tion → sempre la
la|solution|solutions|solução|-tion → sempre la
la|attention||atenção|-tion → sempre la
la|télévision|télévisions|televisão|-sion → sempre la
la|décision|décisions|decisão|-sion → sempre la
la|qualité|qualités|qualidade|-té → la
la|liberté|libertés|liberdade|-té → la
la|santé||saúde|-té → la
la|beauté||beleza|-té → la
la|société|sociétés|sociedade|-té → la
la|vérité|vérités|verdade|-té → la
la|chaleur||calor|Termina em -eur mas é feminino
la|couleur|couleurs|cor|Termina em -eur mas é feminino
la|peur|peurs|medo|Termina em -eur mas é feminino
la|valeur|valeurs|valor|Termina em -eur mas é feminino
la|douleur|douleurs|dor|Termina em -eur mas é feminino
la|heure|heures|hora|h mudo: l'heure
la|minute|minutes|minuto
la|semaine|semaines|semana
la|année|années|ano|-ée → la
la|journée|journées|dia (duração)|-ée → la
la|soirée|soirées|noitada, serão|-ée → la
la|idée|idées|ideia|-ée → la
la|température|températures|temperatura|-ure → la
la|aventure|aventures|aventura|-ure → la
la|culture|cultures|cultura|-ure → la
la|nature|natures|natureza|-ure → la
la|ceinture|ceintures|cinto|-ure → la
la|chaussure|chaussures|sapato|-ure → la
la|fourchette|fourchettes|garfo|-ette → la
la|assiette|assiettes|prato|-ette → la
la|cuillère|cuillères|colher
la|bouteille|bouteilles|garrafa
la|tasse|tasses|xícara
la|clé|clés|chave
la|lampe|lampes|lâmpada
la|chose|choses|coisa
la|histoire|histoires|história
la|musique|musiques|música|-ique → la
la|politique|politiques|política|-ique → la
la|langue|langues|língua
la|phrase|phrases|frase
la|lettre|lettres|carta, letra
la|réponse|réponses|resposta
la|vie|vies|vida|-ie → la
la|envie|envies|vontade|-ie → la
la|tristesse||tristeza|-esse → la
la|richesse|richesses|riqueza|-esse → la
la|jeunesse||juventude|-esse → la
la|habitude|habitudes|hábito|-ude → la
la|étude|études|estudo|-ude → la
la|attitude|attitudes|atitude|-ude → la
la|différence|différences|diferença|-ence → la
la|patience||paciência|-ence → la
la|intelligence||inteligência|-ence → la
la|science|sciences|ciência|-ence → la
la|chance|chances|sorte|-ance → la
la|distance|distances|distância|-ance → la
la|fin|fins|fim
la|faim||fome
la|soif||sede
la|nuit|nuits|noite
la|salade|salades|salada
la|pomme|pommes|maçã
la|banane|bananes|banana
la|tomate|tomates|tomate
la|viande|viandes|carne
la|soupe|soupes|sopa
la|bière|bières|cerveja
la|glace|glaces|sorvete, gelo
la|fête|fêtes|festa
la|radio|radios|rádio
la|photo|photos|foto|Abreviação mantém o gênero (la photographie)
la|moto|motos|moto|Abreviação mantém o gênero (la motocyclette)
la|lumière|lumières|luz
la|montre|montres|relógio de pulso
la|robe|robes|vestido
la|jupe|jupes|saia
la|chemise|chemises|camisa
la|veste|vestes|jaqueta`.split("\n").map(l=>{const [art,termo,plural,trad,dica]=l.split("|");return {k:`fr:${art}:${termo.toLowerCase()}`,art,termo,plural:plural||"",trad,dica:dica||"",bank:true};});
const GEN={
  de:{arts:["der","die","das"],plArt:"die",plCor:ART_COR.die,banco:BANCO,regras:REGRAS_ART,sug:sugerirArt,parse:/^(der|die|das)\s+(.+)$/i,ph:"der Schlüssel",phS:"Schlüssel",chars:["ä","ö","ü","ß"],pl:null},
  fr:{arts:["le","la"],plArt:"les",plCor:"#7083BF",banco:BANCO_FR,regras:REGRAS_FR,sug:sugerirArtFr,parse:/^(le|la)\s+(.+)$/i,ph:"la clé",phS:"clés",chars:["é","è","ê","à","ç","î","ô","û","œ"],pl:"Plural: em geral +s. Termina em -s, -x ou -z: não muda (le prix → les prix). -al → -aux (journal → journaux). -eau, -eu → +x (bureau → bureaux, jeu → jeux). Exceções comuns: œil → yeux, ciel → cieux."},
};
const ART_NOME={der:"azul",die:"vermelho",das:"verde",le:"azul",la:"vermelho"};
// ── Gramática: banco de exercícios (anexar ao fim de cada idioma; não reordenar, os ids dependem da ordem) ──
// formato: área | enunciado (___ = lacuna) | resposta(s) separadas por ~ | trecho a destacar | dica | explicação
const GRAM_AREAS={
  de:[["kasus","Casos (Akk/Dat/Gen)"],["prep","Preposições"],["adj","Terminações de adjetivo"],["satz","Posição do verbo"],["perf","Perfekt"],["konj","Konjunktiv II"],["pass","Passiv"]],
  fr:[["temps","Passé composé × imparfait"],["aux","Auxiliar être/avoir"],["pron","Pronomes (COD, COI, y, en)"],["subj","Subjonctif × indicatif"],["art","Artigos e preposições de lugar"],["accord","Concordância e comparação"]],
};
const GRAM_RAW={
de:`kasus|Ich habe ___ Bruder gestern angerufen. (mein-)|meinen|angerufen|Que caso o verbo "anrufen" pede? E Bruder é masculino.|anrufen + Akkusativ. Masculino no Akkusativ: mein → meinen.
kasus|Er hilft ___ Frau beim Umzug. (die Frau)|der|hilft|Pense no caso que "helfen" exige. Como o feminino muda nele?|helfen + Dativ. Feminino no Dativ: die → der.
kasus|Das ist das Auto ___ Nachbarn. (der Nachbar)|des|Nachbarn|Aqui há posse: de quem é o carro?|Posse = Genitiv. Masculino: der → des (e o substantivo ganha -s ou -n).
kasus|Wir fahren mit ___ Zug. (der Zug)|dem|mit|Essa preposição sempre pede o mesmo caso.|mit + Dativ (sempre). Masculino no Dativ: der → dem.
kasus|Sie kauft ___ Kind ein Eis. (das Kind)|dem|Kind|Quem recebe o sorvete? Objeto direto ou indireto?|Objeto indireto (quem recebe) = Dativ. Neutro: das → dem.
kasus|Hast du ___ Mann gesehen? (der Mann)|den|gesehen|Quem é visto? Qual objeto é esse?|Objeto direto = Akkusativ. Masculino: der → den.
kasus|Wegen ___ Regens bleiben wir zu Hause. (der Regen)|des|Wegen|Essa preposição de causa pede um caso mais formal.|wegen + Genitiv. Masculino: der → des.
prep|Das Buch liegt auf ___ Tisch. (der Tisch)|dem|liegt|Wo? ou Wohin? O livro já está lá, sem movimento.|Wechselpräposition: Wo? (lugar) = Dativ. der Tisch → dem Tisch.
prep|Ich lege das Buch auf ___ Tisch. (der Tisch)|den|lege|Wo? ou Wohin? Aqui há movimento.|Wohin? (direção) = Akkusativ. der Tisch → den Tisch.
prep|Wir warten ___ den Bus.|auf|warten|Verbo com preposição fixa.|warten auf + Akkusativ.
prep|Sie interessiert sich ___ Medizin.|für|interessiert|Verbo reflexivo com preposição fixa.|sich interessieren für + Akkusativ.
prep|Ich freue mich ___ das Wochenende. (ainda vai acontecer)|auf|freue|Alegria por algo futuro ou presente?|sich freuen auf = alegria antecipada (futuro); sich freuen über = por algo presente ou passado.
prep|Ich komme ___ Brasilien.|aus|komme|Origem.|Origem de um país = aus.
prep|Nach dem Essen gehen wir ___ Arzt. (contraído)|zum~zu dem|Arzt|Ir até uma pessoa ou profissional.|Para pessoas: zu + Dativ. zu + dem = zum.
adj|Das ist ein ___ Auto. (schnell)|schnelles|ein|Neutro, nominativo, com "ein": o artigo não mostra o gênero.|Após ein- sem terminação (neutro Nom/Akk), o adjetivo mostra o gênero: -es.
adj|Ich kaufe einen ___ Tisch. (groß)|großen|einen|Masculino, acusativo.|Após einen (Akk masculino): -en.
adj|Die ___ Frau lacht. (alt)|alte|Die|Artigo definido, feminino, nominativo.|Após artigo definido em Nom/Akk feminino, neutro e plural: -e.
adj|Mit dem ___ Mann sprach ich. (nett)|netten|dem|Dativ com artigo definido.|Após artigo definido no Dativ (e no Genitiv): sempre -en.
adj|Ich trinke gern ___ Kaffee. (stark)|starken|Kaffee|Sem artigo: o adjetivo assume o papel do artigo. Masculino, acusativo.|Sem artigo, o adjetivo leva a terminação do artigo: den → -en.
adj|Das ist die Tasche meiner ___ Schwester. (jung)|jungen|meiner|Genitivo feminino.|Após possessivo no Genitiv: -en.
adj|Wir haben ein ___ Problem. (groß)|großes|ein|Neutro com "ein".|ein + neutro Nom/Akk: -es.
satz|Er kommt nicht, ___ (weil / krank / ist / er)|weil er krank ist|weil|Em oração subordinada, onde vai o verbo conjugado?|Após weil, dass, ob, wenn…: verbo conjugado no fim.
satz|Ich glaube, ___ (dass / sie / recht / hat)|dass sie recht hat|dass|Subordinada com dass.|dass → verbo conjugado no fim.
satz|Wenn es regnet, ___ (wir / bleiben / zu Hause)|bleiben wir zu Hause|Wenn|A subordinada ocupa a 1ª posição. Onde fica o verbo da principal?|Se a subordinada abre a frase, ela conta como 1ª posição: o verbo da principal vem logo depois.
satz|Ich frage mich, ___ (er / ob / kommt / morgen)|ob er morgen kommt|ob|Pergunta indireta.|ob → verbo no fim; tempo (morgen) antes do verbo.
satz|Heute ___ (gehe / ich / ins Kino)|gehe ich ins Kino|Heute|Quando algo que não é o sujeito abre a frase, onde fica o verbo?|Na oração principal o verbo conjugado é sempre o 2º elemento; o sujeito vem depois dele.
satz|Obwohl ___, ging er zur Arbeit. (er / müde / war)|er müde war|Obwohl|obwohl abre uma subordinada.|obwohl → verbo conjugado no fim da subordinada.
perf|Ich ___ gestern nach Hause gegangen. (haben / sein)|bin|gegangen|Qual auxiliar os verbos de movimento usam?|Verbos de movimento e mudança de estado → sein.
perf|Wir ___ einen Film gesehen. (haben / sein)|haben|gesehen|Verbo transitivo, com objeto direto.|Verbos transitivos → haben.
perf|Er hat das Fenster ___. (aufmachen)|aufgemacht|aufmachen|Verbo separável: onde entra o "ge-"?|Separável: prefixo + ge + radical + t → auf-ge-macht.
perf|Sie ist früh ___. (aufstehen)|aufgestanden|aufstehen|Verbo forte e separável.|aufstehen → ist aufgestanden (sein: mudança de estado).
perf|Ich habe dich gestern ___. (anrufen)|angerufen|anrufen|Separável e forte.|anrufen → angerufen (an-ge-rufen).
perf|Wir sind nach Rio ___. (fahren)|gefahren|fahren|Particípio de verbo forte: ge- + radical + -en.|fahren → gefahren.
perf|Hast du schon ___? (essen)|gegessen|essen|Verbo forte.|essen → gegessen (irregular).
konj|Wenn ich mehr Zeit hätte, ___ ich mehr lesen.|würde|hätte|Irreal: o que forma o Konjunktiv II da maioria dos verbos?|würde + infinitivo.
konj|Ich ___ gern ein Glas Wasser. (mögen, educado)|möchte|gern|Forma educada de "mögen".|möchte = Konjunktiv II de mögen.
konj|Wenn ich du ___, würde ich das nicht tun. (sein)|wäre|Wenn|Konjunktiv II de sein.|sein → wäre.
konj|Wenn er Geld ___, würde er ein Haus kaufen. (haben)|hätte|Wenn|Konjunktiv II de haben.|haben → hätte.
konj|___ Sie mir bitte helfen? (können, educado)|Könnten|bitte|Pedido educado.|können → könnte(n) no Konjunktiv II.
konj|An deiner Stelle ___ ich zum Arzt gehen.|würde|Stelle|Conselho.|"An deiner Stelle" + würde + infinitivo.
pass|Das Haus ___ gebaut. (werden, presente)|wird|gebaut|Passiv: qual auxiliar?|Passiv = werden + Partizip II.
pass|Die Patienten ___ untersucht. (werden, presente)|werden|Patienten|Concorde com o sujeito plural.|werden (plural) + Partizip II.
pass|Der Brief ___ gestern geschrieben. (werden, Präteritum)|wurde|gestern|Passado simples de werden.|Passiv Präteritum: wurde + Partizip II.
pass|Das Medikament ___ vom Arzt verschrieben. (werden, presente)|wird|vom Arzt|O agente da passiva vem com von.|Presente: wird + Partizip II; agente = von + Dativ.
pass|Die Tür ist geöffnet ___. (Perfekt Passiv)|worden|geöffnet|No Perfekt do Passiv, o particípio de werden é especial.|Perfekt Passiv: sein + Partizip II + worden.
pass|Hier ___ nicht geraucht. (werden, presente)|wird|nicht|Passiv sem sujeito.|Passiv impessoal: wird + Partizip II.`,
fr:`temps|Hier, j'___ (manger) une pizza.|ai mangé|Hier|Ação concluída e pontual no passado.|Passé composé para ação pontual: avoir + participe.
temps|Quand j'étais petite, je ___ (jouer) dehors tous les jours.|jouais|tous les jours|Hábito repetido no passado.|Imparfait para hábitos e descrições no passado.
temps|Il ___ (pleuvoir) quand je suis sorti.|pleuvait|quand|Qual é o pano de fundo e qual é a ação que interrompe?|Imparfait = cenário em curso; passé composé = o evento que interrompe.
temps|Hier soir, elle ___ (arriver) à huit heures.|est arrivée|Hier soir|Ação pontual. Qual auxiliar? E o participe concorda?|arriver → être; o participe concorda com o sujeito: arrivée.
temps|Pendant que je ___ (dormir), le téléphone a sonné.|dormais|Pendant que|Ação em curso que foi interrompida.|Imparfait para a ação em curso.
temps|Nous ___ (finir) le travail à midi hier.|avons fini|hier|Ação concluída.|Passé composé: avoir + fini.
temps|Autrefois, nous ___ (habiter) à Lyon.|habitions|Autrefois|Situação habitual no passado.|Imparfait: radical de "nous" + -ions.
aux|Elle ___ allée au marché.|est|allée|Verbo de movimento.|aller usa être; o participe concorda com o sujeito.
aux|J'___ vu ce film.|ai|vu|Verbo transitivo.|A maioria dos verbos usa avoir.
aux|Nous ___ partis hier.|sommes|partis|Partir é verbo de movimento.|partir → être.
aux|Ils ___ mangé au restaurant.|ont|mangé|Verbo comum.|manger → avoir.
aux|Tu ___ tombé dans l'escalier ?|es|tombé|Verbo de queda e movimento.|tomber → être.
aux|Je me ___ levée tôt.|suis|me|Verbo pronominal.|Todos os verbos pronominais usam être.
aux|Vous ___ rentrés tard.|êtes|rentrés|Verbo de movimento.|rentrer → être.
pron|Tu vois Marie ? Oui, je ___ vois.|la|vois|Objeto direto feminino.|COD feminino singular = la.
pron|Tu parles à Paul ? Oui, je ___ parle.|lui|à Paul|Complemento introduzido por "à" com pessoa.|COI (à + pessoa) = lui (singular) ou leur (plural).
pron|Tu as acheté ce livre ? Oui, je ___ ai acheté.|l'~l’|livre|COD masculino diante de vogal.|COD diante de vogal elide: le/la → l'.
pron|Tu téléphones à tes parents ? Oui, je ___ téléphone.|leur|à tes parents|COI no plural.|COI plural = leur.
pron|Il aime les fruits ? Oui, il ___ mange tous les jours.|les|fruits|COD no plural.|COD plural = les.
pron|Tu veux du café ? Oui, j'___ veux.|en|du café|Substitui "du + substantivo" (quantidade).|en substitui de/du/des + nome.
pron|Tu vas à Paris ? Oui, j'___ vais demain.|y|à Paris|Substitui "à + lugar".|y substitui à/en/dans + lugar.
subj|Il faut que tu ___ (venir) demain.|viennes|Il faut que|Após "il faut que", qual modo?|il faut que + subjonctif.
subj|Je veux que vous ___ (être) à l'heure.|soyez|veux que|Vontade com sujeitos diferentes.|vouloir que + subjonctif; être → que vous soyez.
subj|Il faut que nous ___ (finir) ce travail.|finissions|Il faut que|Subjonctif com "nous".|finir → que nous finissions.
subj|Je pense qu'il ___ (avoir) raison.|a|pense qu'|Penser no afirmativo expressa certeza.|penser que (afirmativo) + indicatif.
subj|Il est possible qu'elle ___ (avoir) du retard.|ait|possible qu'|Possibilidade, dúvida.|il est possible que + subjonctif; avoir → qu'elle ait.
subj|Je ne crois pas qu'il ___ (venir).|vienne|ne crois pas|Opinião na negativa.|croire que na negativa + subjonctif.
subj|Bien que ce ___ (être) difficile, j'essaie.|soit|Bien que|Conjunção concessiva.|bien que + subjonctif; être → soit.
art|Je bois ___ eau. (partitivo)|de l'~de l’|eau|Água, não contável, antes de vogal.|Partitivo antes de vogal: de l'.
art|Elle mange ___ pain. (partitivo)|du|pain|Masculino, quantidade indefinida.|Partitivo masculino: du.
art|Il n'y a pas ___ lait.|de|pas|Depois de negação.|Na negação, du/de la/des → de (d').
art|J'habite ___ France.|en|habite|País feminino.|Países femininos (ou que começam por vogal): en.
art|Je vais ___ Brésil.|au|vais|País masculino.|Países masculinos: au.
art|Nous allons ___ États-Unis.|aux|allons|País plural.|Países plurais: aux.
art|Elle vient ___ Italie. (de + vogal)|d'~d’|vient|Origem; país que começa por vogal.|venir de + vogal → d'.
accord|Elle est très ___ (content).|contente|Elle|Concordância em gênero.|O adjetivo concorda: feminino → -e.
accord|Les fleurs que j'ai ___ (acheter) sont belles.|achetées|Les fleurs|O objeto vem antes do verbo.|Com avoir, o participe concorda com o COD colocado antes: fleurs → achetées.
accord|C'est une ___ (beau) maison.|belle|une|Feminino de beau.|beau → belle.
accord|Il est ___ grand que moi.|plus|que|Comparativo de superioridade.|plus + adjetivo + que.
accord|Elle est la ___ de la classe. (bon, superlativo)|meilleure|la|Superlativo irregular de bon.|bon → le/la meilleur(e).
accord|Ces filles sont ___ (heureux).|heureuses|filles|Feminino plural.|heureux → heureuse → heureuses.
accord|Il parle ___ que moi. (bien, comparativo)|mieux|parle|Advérbio, não adjetivo.|bien → mieux (advérbio); bon → meilleur (adjetivo).`,
};

// ── Leitura: palavras funcionais (contam como conhecidas) e textos de exemplo ──
const FUNC_PAL={
  de:"der die das den dem des ein eine einen einem einer eines kein keine keinen keinem keiner und oder aber denn doch sondern ist sind war waren sei bin bist seid hat haben hatte hatten habe hast habt wird werden wurde wurden worden kann können konnte konnten muss müssen musste soll sollen will wollen darf dürfen mag mögen ich du er sie es wir ihr mich dich ihn uns euch ihnen ihm ihre ihren ihrem ihrer mein meine meinen meinem meiner dein deine sein seine seinen seinem seiner unser mit von zu zum zur auf in im ins an am aus bei beim nach über unter um für gegen ohne durch bis vor hinter neben zwischen seit während wegen als wie wenn weil dass ob dann da dort hier nicht kein nur auch noch schon sehr mehr viel viele wenig immer nie oft manchmal heute gestern morgen jetzt bald schon wieder so ja nein was wer wo wann warum wie welche welcher welches man etwas nichts alles jeder jede jedes diese dieser dieses diesen diesem".split(" "),
  fr:"le la les un une des du de d l et ou mais donc or ni car est sont était étaient être été sera serait suis es sommes êtes a ont avait avaient avoir ai as avons avez eu fait fais font faire ne pas plus jamais rien personne je tu il elle nous vous ils elles on me te se lui leur moi toi eux soi que qui quoi dont où quand comment pourquoi si ce cet cette ces c ça cela ceci celui celle ceux mon ma mes ton ta tes son sa ses notre nos votre vos leurs dans en à au aux pour par sur sous avec sans chez vers entre contre pendant depuis avant après y très aussi comme alors puis encore déjà toujours souvent trop peu beaucoup tout tous toute toutes même autre autres j m n s t qu aucun chaque quelque oui non bien mal ici là".split(" "),
};
const LEIT_EX={
  de:"Gestern hatte ich Nachtdienst im Krankenhaus. Um drei Uhr morgens kam ein älterer Mann mit starken Brustschmerzen in die Notaufnahme. Die Ärztin untersuchte ihn sofort und machte ein EKG. Zum Glück war es kein Herzinfarkt, aber der Patient musste trotzdem über Nacht bleiben. Am Morgen war ich müde, doch ich fühlte mich zufrieden, weil ich helfen konnte.",
  fr:"Hier soir, j'ai travaillé aux urgences. Vers trois heures du matin, un homme âgé est arrivé avec une forte douleur à la poitrine. Le médecin l'a examiné tout de suite et a fait un électrocardiogramme. Heureusement, ce n'était pas un infarctus, mais le patient a dû rester à l'hôpital pendant la nuit. Le matin, j'étais fatiguée, mais j'étais contente parce que j'avais pu aider.",
};
const tokenizarLeit=t=>{const re=/\p{L}+(?:-\p{L}+)*/gu;const out=[];let m;while((m=re.exec(t||"")))out.push({w:m[0],i:m.index});return out;};
const GRAM_ITENS=Object.entries(GRAM_RAW).flatMap(([lang,txt])=>{
  const cnt={};
  return txt.trim().split("\n").filter(Boolean).map(l=>{
    const [area,q,r,f,h,e]=l.split("|").map(x=>x.trim());
    cnt[area]=(cnt[area]||0)+1;
    return {id:lang+":"+area+":"+cnt[area],lang,area,q,r:r.split("~"),f,h,e};
  });
});

// ═════════════════════════ CLÍNICA (casos, revisão, condutas) ═════════════════════════
const CLI_INK="#12303A", CLI_SHEET="#E9F0EF", CLI_ACC="#E07A5F";
const CLI_AREAS=["Cardio","Neuro","Resp","Gastro","Trauma","Infecto","Pediatria","Obstetrícia","Psiquiatria","Outros"];
const CLI_LOCAIS=["UPA","Ambulância","Outro"];
const CLI_DESF=["Alta","Internado","Transferido","Óbito","Sem seguimento"];
const CLI_MODELO="# Avaliação inicial\n\n# Exames\n\n# Conduta\n\n# Quando internar ou transferir\n\n# Pegadinhas";
const CLI_MESES=["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];

// ── Apoio ao raciocínio clínico (sala amarela). Lembrete de diagnósticos diferenciais e condutas iniciais; doses ficam de fora de propósito. ──
const CLI_KB=[
{id:"dt",nome:"Dor torácica",area:"Cardio",
 sinais:[["op","Dor opressiva, em aperto"],["irr","Irradia para braço, mandíbula ou dorso"],["esf","Desencadeada por esforço, alivia no repouso"],["plr","Piora ao respirar (pleurítica)"],["pos","Piora deitado, melhora sentado inclinado"],["ras","Início súbito, rasgante, intensidade máxima de cara"],["dis","Dispneia associada"],["sin","Síncope ou pré-síncope"],["feb","Febre ou tosse produtiva"],["tx","Dor reproduzida à palpação ou movimento"],["fr","Fatores de risco cardiovascular"],["tev","Imobilização, cirurgia, câncer ou TEV prévio"],["hip","Hipotensão ou choque"],["sat","SpO2 baixa"],["ass","Assimetria de pulsos ou de PA entre os braços"],["rgr","Pirose, regurgitação, relação com alimentação"]],
 dx:[
 {n:"Síndrome coronariana aguda",nm:1,a:{op:3,irr:2,esf:2,fr:1,dis:1,sin:1,tx:-2,plr:-1,pos:-1},ex:"ECG de 12 derivações em até 10 min e seriado; troponina seriada conforme protocolo; RX de tórax; ecocardiograma se instabilidade.",cd:"Monitorização e acesso venoso. AAS se sem contraindicação. O2 só se SpO2 < 90%. Analgesia e nitrato conforme PA e sem contraindicações (IAM de VD, uso recente de inibidor de PDE5). Supra de ST, BRE novo ou alto risco: acionar fluxo de reperfusão e hemodinâmica/transferência. Antitrombóticos e doses: protocolo do serviço."},
 {n:"Embolia pulmonar",nm:1,a:{plr:2,dis:3,sin:1,tev:3,sat:2,hip:1,feb:-1},ex:"Probabilidade pré-teste (Wells/PERC); D-dímero se baixa ou intermediária; angio-TC de tórax se indicada; ECG; ecocardiograma à beira do leito se instável.",cd:"Suporte (O2 se hipoxemia). Anticoagulação precoce se probabilidade alta enquanto aguarda confirmação e sem contraindicação. Instável (hipotensão/choque): discutir trombólise ou reperfusão conforme protocolo."},
 {n:"Dissecção aguda de aorta",nm:1,a:{ras:4,irr:1,ass:3,hip:1,sin:1,fr:1},ex:"Angio-TC de aorta (ou eco transesofágico se instável); PA nos dois braços; RX de tórax (mediastino alargado pode faltar); ECG para ver IAM associado.",cd:"Evitar antiagregante e anticoagulante até excluir quando a suspeita for alta. Controle de dor e de FC/PA (alvos e fármacos conforme protocolo). Acionar cirurgia cardiovascular e transferência urgente."},
 {n:"Pneumotórax (inclui hipertensivo)",nm:1,a:{plr:2,dis:3,sat:1,hip:1,ras:1},ex:"Exame físico (murmúrio abolido, timpanismo, desvio de traqueia); RX ou US à beira do leito. O hipertensivo é diagnóstico clínico.",cd:"Hipertensivo: descompressão imediata (agulha ou dreno) sem esperar imagem. Demais casos: observação ou drenagem conforme tamanho e sintomas."},
 {n:"Pericardite ou miopericardite",a:{plr:2,pos:3,feb:1},ex:"ECG (supra difuso de ST, infra de PR), troponina, PCR, ecocardiograma (derrame).",cd:"Anti-inflamatório e demais medidas conforme protocolo. Afastar tamponamento (hipotensão, turgência jugular, bulhas abafadas). Troponina elevada sugere miocardite: observar ou internar."},
 {n:"Pneumonia ou pleurite",a:{plr:2,feb:3,dis:1,sat:1},ex:"RX de tórax, hemograma, PCR, oximetria; escore de gravidade (CURB-65).",cd:"Antibiótico conforme gravidade e protocolo local; O2 se hipoxemia; checar critérios de internação."},
 {n:"Dor de parede torácica (musculoesquelética)",a:{tx:3,plr:1,fr:-1,op:-1},ex:"Diagnóstico de exclusão, depois de ECG e estratificação de risco.",cd:"Analgesia e orientação com retorno se sinais de alarme."},
 {n:"Causa esofágica ou gástrica (DRGE, espasmo)",a:{rgr:3},ex:"ECG mesmo assim; considerar endoscopia depois, ambulatorialmente.",cd:"Tratamento sintomático. Lembrar que alívio com antiácido não exclui SCA."}]},
{id:"dp",nome:"Dispneia",area:"Resp",
 sinais:[["ort","Ortopneia ou dispneia paroxística noturna"],["edm","Edema de MMII, ganho de peso, turgência jugular"],["sib","Sibilância; asma ou DPOC conhecidas"],["tab","Tabagismo"],["feb","Febre, tosse com escarro"],["pl","Dor pleurítica"],["tev","Imobilização, cirurgia, câncer ou TEV prévio"],["su","Início súbito"],["tr","Trauma torácico"],["ale","Exposição a alérgeno, urticária, angioedema"],["dr","Dor torácica opressiva associada"],["ac","Respiração profunda e rápida, glicemia alta ou vômitos"],["sat","SpO2 baixa"],["hip","Hipotensão"],["est","Estridor ou rouquidão"]],
 dx:[
 {n:"Insuficiência cardíaca descompensada / edema agudo de pulmão",a:{ort:3,edm:3,dr:1,sat:1},ex:"ECG, RX de tórax, BNP/NT-proBNP se dúvida, troponina, função renal e eletrólitos, US à beira do leito.",cd:"Posição sentada, O2 se hipoxemia, VNI (CPAP/BiPAP) se desconforto importante. Diurético e vasodilatador conforme PA e protocolo. Procurar fator precipitante (isquemia, arritmia, infecção, má adesão)."},
 {n:"Exacerbação de asma ou DPOC",a:{sib:3,tab:2,feb:1},ex:"Oximetria, pico de fluxo (asma), RX se febre ou suspeita de complicação, gasometria se grave.",cd:"Broncodilatador inalatório, corticoide sistêmico, O2 com alvo adequado (evitar hiperóxia em retentor de CO2), antibiótico se sinais de infecção bacteriana, VNI se insuficiência respiratória."},
 {n:"Pneumonia",a:{feb:3,pl:1,sat:1,tab:1},ex:"RX de tórax, hemograma, PCR, oximetria; CURB-65.",cd:"Antibiótico conforme gravidade e protocolo local; O2 se hipoxemia; critérios de internação."},
 {n:"Embolia pulmonar",nm:1,a:{su:2,pl:2,tev:3,sat:1,hip:1},ex:"Probabilidade pré-teste (Wells/PERC), D-dímero se baixa ou intermediária, angio-TC, ecocardiograma à beira do leito se instável.",cd:"Suporte, anticoagulação precoce se probabilidade alta e sem contraindicação; instável: discutir reperfusão conforme protocolo."},
 {n:"Pneumotórax",nm:1,a:{su:2,pl:2,tr:2,tab:1},ex:"Exame físico, RX ou US à beira do leito.",cd:"Hipertensivo: descompressão imediata. Demais: observação ou drenagem conforme tamanho e sintomas."},
 {n:"Anafilaxia ou angioedema",nm:1,a:{ale:4,est:3,hip:2,su:2},ex:"Diagnóstico clínico; não atrasar tratamento por exames.",cd:"Adrenalina intramuscular precoce é a primeira linha (dose conforme protocolo), posição adequada, O2, volume se hipotensão, atenção à via aérea. Observar por risco de reação bifásica."},
 {n:"Síndrome coronariana aguda (equivalente anginoso)",nm:1,a:{dr:3,sat:0},ex:"ECG em todo dispneico com fator de risco; troponina seriada.",cd:"Ver conduta de SCA em dor torácica."},
 {n:"Acidose metabólica (CAD, sepse, intoxicação)",a:{ac:3},ex:"Glicemia e cetonas, gasometria, eletrólitos, lactato.",cd:"Tratar a causa de base conforme protocolo (CAD, sepse, etc.)."}]},
{id:"da",nome:"Dor abdominal",area:"Gastro",
 sinais:[["fid","Dor em fossa ilíaca direita ou migração periumbilical"],["fie","Dor em fossa ilíaca esquerda"],["peri","Defesa, rigidez ou descompressão brusca positiva"],["vom","Vômitos"],["dist","Distensão, parada de gases e fezes"],["fe","Febre"],["col","Cólica com irradiação para flanco ou virilha, hematúria"],["epi","Dor epigástrica, relação com alimentação"],["hd","Hipocôndrio direito, Murphy, piora após refeição gordurosa"],["bar","Dor em barra irradiada para o dorso, álcool ou litíase biliar"],["hip","Hipotensão ou taquicardia"],["pul","Massa pulsátil, idade > 60, aterosclerose, dor desproporcional ao exame"],["gin","Mulher em idade fértil, atraso menstrual ou sangramento vaginal"],["dia","Diarreia"],["sg","Sangue nas fezes ou melena"],["urm","Disúria ou polaciúria"]],
 dx:[
 {n:"Abdome agudo perfurativo / peritonite",nm:1,a:{peri:4,hip:1,fe:1,epi:1},ex:"Exame abdominal seriado, RX ou TC de abdome conforme disponibilidade, hemograma, lactato.",cd:"Jejum, acesso venoso, analgesia, antibiótico e avaliação cirúrgica imediata."},
 {n:"Apendicite aguda",nm:1,a:{fid:4,vom:1,fe:1,peri:1},ex:"Hemograma, PCR, US ou TC conforme disponibilidade; considerar escore de Alvarado.",cd:"Jejum, analgesia, antibiótico conforme protocolo e avaliação cirúrgica."},
 {n:"Obstrução intestinal",nm:1,a:{dist:4,vom:2},ex:"RX ou TC de abdome, eletrólitos, função renal, lactato.",cd:"Jejum, hidratação, correção de distúrbios, sonda nasogástrica se vômitos importantes e avaliação cirúrgica."},
 {n:"Aneurisma de aorta roto ou isquemia mesentérica",nm:1,a:{pul:3,hip:2},ex:"US à beira do leito (aorta), angio-TC, lactato. Dor desproporcional ao exame é sinal de alerta de isquemia mesentérica.",cd:"Acesso calibroso, avaliação vascular/cirúrgica imediata; não atrasar transferência por exames."},
 {n:"Gravidez ectópica",nm:1,a:{gin:4,hip:1},ex:"Beta-hCG em toda mulher em idade fértil com dor abdominal; US.",cd:"Instável: acesso, ressuscitação e avaliação ginecológica de imediato."},
 {n:"Colecistite, colangite ou cólica biliar",a:{hd:3,fe:1,vom:1},ex:"US de vias biliares, hemograma, PCR, bilirrubinas, enzimas hepáticas. Febre, icterícia e dor sugerem colangite.",cd:"Analgesia, antiemético, antibiótico se colecistite/colangite e avaliação cirúrgica."},
 {n:"Pancreatite aguda",a:{bar:3,epi:1,vom:1},ex:"Lipase, hemograma, função renal, cálcio, triglicérides; US de vias biliares.",cd:"Hidratação criteriosa, analgesia, antiemético, tratar a causa e avaliar gravidade."},
 {n:"Cólica nefrética ou pielonefrite",a:{col:3,fe:1,urm:2},ex:"Urina tipo 1 e urocultura, função renal, US ou TC de vias urinárias; febre com obstrução é urgência.",cd:"Analgesia e antiemético; antibiótico se infecção; urgência urológica se obstrução infectada."},
 {n:"Diverticulite",a:{fie:3,fe:1},ex:"Hemograma, PCR, TC de abdome se dúvida ou gravidade.",cd:"Conforme gravidade: ambulatorial ou internação; antibiótico conforme protocolo."},
 {n:"Gastroenterite / diarreia aguda",a:{dia:3,vom:1,fe:1},ex:"Clínico; avaliar desidratação e sinais de gravidade.",cd:"Hidratação, antiemético se necessário, orientar sinais de alarme."},
 {n:"Gastrite, úlcera ou sangramento digestivo",a:{epi:3,sg:3},ex:"Hemograma, ureia, coagulação; endoscopia conforme gravidade.",cd:"Acesso, ressuscitação se instável, IBP e avaliação para endoscopia nos sangramentos."}]},
{id:"cf",nome:"Cefaleia",area:"Neuro",
 sinais:[["tun","Início súbito, a pior dor da vida (em trovoada)"],["feb","Febre"],["rig","Rigidez de nuca ou fotofobia"],["foc","Déficit focal ou alteração do nível de consciência"],["tra","Trauma recente"],["unil","Unilateral, pulsátil, náusea, fotofobia, episódios prévios iguais"],["ida","Primeira cefaleia com mais de 50 anos, dor ao mastigar, VHS alta"],["imu","Imunossupressão, câncer ou HIV"],["pa","PA muito elevada"],["cos","Aperto bilateral, leve a moderada, sem sintomas associados"],["aut","Periorbitária unilateral com lacrimejamento e inquietação"],["gest","Gestação ou puerpério"],["pro","Piora progressiva, pior pela manhã ou ao deitar, vômitos"],["anc","Uso de anticoagulante"]],
 dx:[
 {n:"Hemorragia subaracnóidea",nm:1,a:{tun:4,rig:2,foc:1},ex:"TC de crânio sem contraste o mais cedo possível (mais sensível nas primeiras horas); se normal e suspeita alta, discutir punção lombar ou angiografia conforme protocolo.",cd:"Controle de PA e dor conforme protocolo, acionar neurocirurgia e transferência."},
 {n:"Meningite ou encefalite",nm:1,a:{feb:2,rig:3,foc:1,imu:1},ex:"Hemoculturas, punção lombar (TC antes se déficit focal, rebaixamento ou imunossupressão), hemograma, PCR.",cd:"Não atrasar antibiótico (e antiviral se suspeita de encefalite) por causa de exames; corticoide conforme protocolo."},
 {n:"AVC isquêmico ou hemorrágico",nm:1,a:{foc:4,pa:1,anc:2,tra:1},ex:"Glicemia capilar, TC de crânio sem contraste imediata, NIHSS, horário de início.",cd:"Ativar protocolo de AVC; evitar queda brusca de PA sem indicação."},
 {n:"Hematoma subdural ou trauma",nm:1,a:{tra:3,anc:2,foc:1,pro:1},ex:"TC de crânio; atenção a idosos e anticoagulados, mesmo com trauma leve.",cd:"Observação neurológica seriada; reverter anticoagulação conforme protocolo; neurocirurgia se indicada."},
 {n:"Arterite de células gigantes",nm:1,a:{ida:4},ex:"VHS e PCR; biópsia de artéria temporal depois.",cd:"Corticoide precoce quando a suspeita é alta, para prevenir perda visual."},
 {n:"Emergência hipertensiva / pré-eclâmpsia",nm:1,a:{pa:2,gest:3},ex:"PA seriada, proteinúria, função renal e hepática, fundo de olho; em gestantes, avaliação obstétrica imediata.",cd:"Controle de PA conforme protocolo; sulfato de magnésio em pré-eclâmpsia grave conforme protocolo obstétrico."},
 {n:"Lesão expansiva / hipertensão intracraniana",a:{pro:3,foc:1,imu:1},ex:"TC ou RM de crânio.",cd:"Avaliação neurológica; corticoide e neurocirurgia conforme achados."},
 {n:"Enxaqueca",a:{unil:3},ex:"Diagnóstico clínico após afastar sinais de alarme.",cd:"Analgesia e antiemético; evitar opioides; orientar acompanhamento."},
 {n:"Cefaleia tensional",a:{cos:3},ex:"Diagnóstico clínico.",cd:"Analgesia simples e orientação."},
 {n:"Cefaleia em salvas",a:{aut:4},ex:"Diagnóstico clínico.",cd:"Oxigênio em alto fluxo e tratamento específico conforme protocolo."}]},
{id:"sc",nome:"Síncope",area:"Cardio",
 sinais:[["esf","Durante esforço"],["sup","Em decúbito ou sem pródromos"],["pal","Palpitações antes"],["cdf","Cardiopatia estrutural, FEVE reduzida, história familiar de morte súbita"],["pro","Pródromos (calor, sudorese, náusea), ortostase prolongada, dor ou emoção"],["ort","Ao levantar; anti-hipertensivo, diurético ou desidratação"],["ecg","ECG alterado (bloqueio, QT longo, pré-excitação, Brugada)"],["san","Sangramento, melena ou anemia"],["ang","Dor torácica ou dispneia associada"],["crs","Confusão prolongada, mordedura de língua, abalos"],["hgl","Glicemia baixa"],["tev","Fatores de risco para TEV"]],
 dx:[
 {n:"Síncope arrítmica",nm:1,a:{esf:3,sup:2,pal:3,cdf:3,ecg:4},ex:"ECG, monitorização contínua, ecocardiograma, eletrólitos incluindo K e Mg, troponina se indicado.",cd:"Monitorização e internação para investigação quando alto risco; corrigir distúrbios."},
 {n:"Obstrução estrutural (estenose aórtica, miocardiopatia hipertrófica)",nm:1,a:{esf:3,cdf:1},ex:"Exame cardíaco (sopro), ECG, ecocardiograma.",cd:"Evitar vasodilatadores e esforço; encaminhar para avaliação cardiológica."},
 {n:"Embolia pulmonar",nm:1,a:{tev:3,ang:2},ex:"Probabilidade pré-teste, D-dímero ou angio-TC, ECG.",cd:"Ver conduta em dor torácica."},
 {n:"Síndrome coronariana aguda",nm:1,a:{ang:3},ex:"ECG e troponina seriada.",cd:"Ver conduta em dor torácica."},
 {n:"Hemorragia ou anemia",nm:1,a:{san:4,ort:1},ex:"Hemoglobina, toque retal, coagulação, tipagem.",cd:"Acesso calibroso, ressuscitação e investigação da fonte."},
 {n:"Síncope vasovagal",a:{pro:4},ex:"Diagnóstico clínico com ECG normal e sem sinais de alto risco.",cd:"Orientação, hidratação e manobras de contrapressão."},
 {n:"Hipotensão ortostática ou medicamentosa",a:{ort:3},ex:"PA deitado e em pé (1 e 3 min), revisão de medicamentos, hemoglobina.",cd:"Ajuste de medicamentos, hidratação, orientação."},
 {n:"Crise convulsiva",a:{crs:4},ex:"Glicemia, eletrólitos, avaliação neurológica; imagem se déficit ou primeira crise.",cd:"Conforme protocolo de crise e investigação."},
 {n:"Hipoglicemia",a:{hgl:4},ex:"Glicemia capilar imediata.",cd:"Correção da glicemia conforme protocolo e investigação da causa."}]},
{id:"dn",nome:"Déficit neurológico agudo",area:"Neuro",
 sinais:[["fac","Assimetria facial"],["bra","Fraqueza em membro ou hemicorpo"],["fal","Alteração da fala (afasia, disartria)"],["vis","Perda visual ou diplopia"],["ver","Vertigem intensa com ataxia"],["cef","Cefaleia intensa, vômitos"],["pa","PA muito elevada"],["gli","Glicemia alterada"],["cri","Crise convulsiva presenciada"],["fib","Fibrilação atrial ou cardiopatia embólica"],["anc","Uso de anticoagulante"],["fe","Febre ou rigidez de nuca"],["rev","Sintomas já resolvidos"],["pro","Piora gradual em dias ou semanas"],["fper","Paralisia facial incluindo a testa, sem outros déficits"]],
 dx:[
 {n:"AVC isquêmico",nm:1,a:{fac:2,bra:2,fal:2,vis:1,ver:1,fib:2},ex:"Horário de início ou última vez visto bem, glicemia capilar, NIHSS, TC de crânio sem contraste imediata (ou RM), ECG.",cd:"Ativar protocolo de AVC; trombólise ou trombectomia conforme janela e critérios; evitar reduzir PA agressivamente sem indicação."},
 {n:"AVC hemorrágico",nm:1,a:{cef:3,pa:2,anc:2,fac:1,bra:1,fal:1},ex:"TC de crânio sem contraste imediata, coagulação.",cd:"Controle de PA conforme protocolo, reversão de anticoagulação e neurocirurgia se indicada."},
 {n:"Ataque isquêmico transitório",nm:1,a:{rev:4,fib:1},ex:"Imagem cerebral e vascular, ECG e monitorização do ritmo, escore de risco conforme protocolo.",cd:"Risco alto de AVC nas primeiras 48 h: antiagregação e investigação rápidas conforme protocolo."},
 {n:"Hipoglicemia ou hiperglicemia",a:{gli:4},ex:"Glicemia capilar logo na chegada.",cd:"Corrigir a alteração e reavaliar o déficit."},
 {n:"Crise convulsiva com paresia pós-ictal",a:{cri:4},ex:"Glicemia, eletrólitos, imagem se primeira crise ou déficit persistente.",cd:"Conforme protocolo de crise e investigação."},
 {n:"Meningoencefalite ou abscesso",nm:1,a:{fe:3,cef:1},ex:"Hemoculturas, punção lombar após imagem quando indicado, hemograma, PCR.",cd:"Antibiótico e antiviral precoces conforme protocolo."},
 {n:"Lesão expansiva",a:{pro:3},ex:"TC ou RM de crânio com contraste.",cd:"Corticoide e neurocirurgia conforme achados."},
 {n:"Paralisia facial periférica (Bell)",a:{fper:4,fac:1},ex:"Exame neurológico completo para afastar causa central; otoscopia e pesquisa de lesões vesiculares.",cd:"Corticoide precoce conforme protocolo e proteção ocular."}]},
{id:"fs",nome:"Febre e suspeita de sepse",area:"Infecto",
 sinais:[["fr","Frequência respiratória ≥ 22"],["pas","PAS ≤ 100 mmHg"],["men","Alteração do estado mental"],["tos","Tosse, escarro, dispneia"],["uri","Disúria, dor lombar ou no flanco"],["abd","Dor abdominal, vômitos"],["pele","Eritema, calor e dor em pele ou partes moles; ferida"],["mn2","Rigidez de nuca, cefaleia"],["lin","Cateter, sonda ou internação recente"],["imu","Imunossupressão ou diabetes descompensado"],["via","Exposição epidemiológica (dengue, leptospirose, malária)"],["man","Petéquias, púrpura ou manchas"],["car","Sopro novo ou uso de drogas injetáveis"]],
 dx:[
 {n:"Pneumonia",a:{tos:4},ex:"RX de tórax, hemograma, PCR, oximetria; CURB-65.",cd:"Antibiótico conforme gravidade e protocolo local; O2 se hipoxemia."},
 {n:"Infecção urinária / pielonefrite",a:{uri:4},ex:"Urina tipo 1, urocultura, função renal; imagem se suspeita de obstrução.",cd:"Antibiótico conforme gravidade e antibiograma local; urgência urológica se obstrução infectada."},
 {n:"Infecção intra-abdominal",a:{abd:3},ex:"Hemograma, PCR, lactato, imagem conforme foco.",cd:"Antibiótico precoce e controle do foco (avaliação cirúrgica)."},
 {n:"Pele e partes moles / fasceíte necrotizante",nm:1,a:{pele:3},ex:"Clínico: dor desproporcional, crepitação, bolhas hemorrágicas, toxemia; lactato, CPK; imagem não deve atrasar a cirurgia.",cd:"Antibiótico amplo e avaliação cirúrgica urgente quando há suspeita de necrotizante."},
 {n:"Meningite",nm:1,a:{mn2:4,men:1,man:2},ex:"Hemoculturas, punção lombar (TC antes se indicado), hemograma, PCR.",cd:"Antibiótico imediato, sem esperar exames; corticoide conforme protocolo."},
 {n:"Endocardite",nm:1,a:{car:4,lin:1},ex:"Hemoculturas seriadas antes do antibiótico, ecocardiograma.",cd:"Internação e antibiótico guiado por cultura, com discussão com infectologia."},
 {n:"Arboviroses, leptospirose, malária (epidemiologia)",a:{via:3},ex:"Dengue: classificar em grupos A a D (sinais de alarme, comorbidades, choque), hemograma e hematócrito; notificar.",cd:"Hidratação e conduta conforme o grupo de risco do protocolo do Ministério da Saúde; investigar leptospirose se exposição a água de enchente."},
 {n:"Infecção relacionada a dispositivo",a:{lin:3},ex:"Hemoculturas (periférica e do cateter), urocultura se sonda.",cd:"Remover ou trocar o dispositivo quando possível e iniciar antibiótico conforme protocolo."}]},
{id:"pa",nome:"Palpitações e taquicardia",area:"Cardio",
 sinais:[["reg","Ritmo regular, início e término abruptos"],["irr","Ritmo irregularmente irregular"],["lar","QRS largo no ECG"],["est","Instabilidade: hipotensão, dor torácica, síncope, edema pulmonar, rebaixamento"],["fev","Febre, anemia, hipovolemia, dor ou estimulantes"],["cdp","Cardiopatia estrutural ou IAM prévio"],["ins","Início gradual com gatilho (dor, febre, ansiedade)"],["qt","Drogas que prolongam o QT ou hipopotassemia"],["alc","Álcool ou cafeína em excesso"],["tir","Sintomas de hipertireoidismo"]],
 dx:[
 {n:"Taquicardia ventricular",nm:1,a:{lar:4,cdp:2,est:1},ex:"ECG de 12 derivações se estável, monitor, eletrólitos, troponina.",cd:"Taquicardia de QRS largo: tratar como TV até prova em contrário. Instável: cardioversão elétrica sincronizada. Estável: medicação conforme protocolo e discussão com cardiologia."},
 {n:"Torsades de pointes / QT longo",nm:1,a:{qt:4,lar:1},ex:"ECG com QTc, K, Mg e Ca.",cd:"Suspender drogas que prolongam o QT, repor magnésio e potássio; instável: desfibrilação conforme protocolo."},
 {n:"Fibrilação ou flutter atrial",a:{irr:4,alc:1,tir:1},ex:"ECG, eletrólitos, TSH, função renal; procurar gatilhos (infecção, TEP, álcool).",cd:"Avaliar estabilidade; controle de FC versus ritmo; risco embólico (CHA2DS2-VASc) e duração; anticoagulação conforme protocolo."},
 {n:"Taquicardia supraventricular por reentrada",a:{reg:4,lar:-3},ex:"ECG durante o episódio.",cd:"Manobras vagais; adenosina conforme protocolo; cardioversão se instável."},
 {n:"Taquicardia sinusal secundária",a:{fev:3,ins:3},ex:"Procurar causa: infecção, anemia, hipovolemia, dor, TEP, hipertireoidismo.",cd:"Tratar a causa; não tratar a frequência."},
 {n:"Tireotoxicose",a:{tir:3,irr:1},ex:"TSH e T4 livre.",cd:"Controle de sintomas e tratamento específico conforme protocolo."}]},
{id:"tv",nome:"Tontura e vertigem",area:"Neuro",
 sinais:[["pos","Vertigem desencadeada por mudança de posição da cabeça, breve"],["con","Vertigem contínua com náuseas, horas ou dias"],["ata","Ataxia de marcha ou de tronco"],["foc","Déficit focal, disartria ou diplopia"],["nis","Nistagmo vertical ou que muda de direção"],["cef","Cefaleia súbita ou cervicalgia"],["aud","Perda auditiva, zumbido ou plenitude auricular"],["pre","Pré-síncope (cabeça vazia) ao levantar"],["fvr","Fatores de risco vasculares"],["inf","Infecção viral recente"],["med","Sedativos ou anti-hipertensivos"]],
 dx:[
 {n:"AVC de circulação posterior",nm:1,a:{con:2,ata:3,foc:3,nis:3,cef:1,fvr:2},ex:"Exame neurológico com marcha; HINTS por examinador treinado na vertigem contínua; TC tem pouca sensibilidade na fossa posterior, RM se suspeita.",cd:"Ativar fluxo de AVC se déficit ou HINTS central; ataxia importante é sinal de alerta."},
 {n:"Vertigem posicional paroxística benigna (VPPB)",a:{pos:4},ex:"Manobra de Dix-Hallpike.",cd:"Manobra de reposicionamento (Epley); evitar sedativos vestibulares prolongados."},
 {n:"Neurite vestibular",a:{con:3,inf:2,aud:-2,ata:-1},ex:"Exame neurológico e HINTS periférico.",cd:"Sintomáticos por poucos dias e reabilitação vestibular precoce."},
 {n:"Doença de Ménière",a:{aud:3,con:1},ex:"Audiometria depois.",cd:"Sintomáticos e encaminhamento."},
 {n:"Hipotensão ortostática ou medicamentosa",a:{pre:3,med:2},ex:"PA deitado e em pé, hemoglobina, revisão de medicamentos.",cd:"Ajuste de medicamentos e hidratação."},
 {n:"Causas cardíacas e metabólicas",nm:1,a:{pre:2},ex:"ECG, glicemia, hemograma, eletrólitos.",cd:"Tratar a causa encontrada; monitorizar se ECG alterado."}]},
];
const CLI_SIT=[["aguardando-ex","Aguardando exames"],["reaval","Aguardando reavaliação"],["medicado","Medicado, em observação"],["vaga","Aguardando vaga ou transferência"],["alta","Pronto para alta"]];

function ClinicaApp({userId,isMobile,onMenu,onTrocar}){
  const hoje=today();
  const [casos,setCasos]=useLS("v5_med_casos",[],userId);
  const [cards,setCards]=useLS("v5_med_cards",[],userId);
  const [prot,setProt]=useLS("v5_med_prot",[],userId);
  const [cfgM,setCfgM]=useLS("v5_med_cfg",{novosDia:8},userId);
  const [plt]=useLS("v4_plt",[],userId);
  const [sub,setSub]=useState("hoje");
  const fcInit={data:hoje,local:"UPA",idade:"",sexo:"",queixa:"",area:"Cardio",hist:"",conduta:"",desf:"",aprend:"",duvida:""};
  const [fc,setFc]=useState(fcInit);
  const [editId,setEditId]=useState(null);
  const [filtro,setFiltro]=useState({area:"",local:"",q:""});
  const [verTodos,setVerTodos]=useState(false);
  const [cardDe,setCardDe]=useState(null);
  const [resId,setResId]=useState(null);
  const [resTxt,setResTxt]=useState("");
  const [resCard,setResCard]=useState(true);
  const [rs,setRs]=useState(null);
  const [fk,setFk]=useState({frente:"",verso:"",area:"Cardio"});
  const [pe,setPe]=useState(null);
  const [pAberta,setPAberta]=useState(null);
  const [marcas,setMarcas]=useState({});
  const [pq,setPq]=useState("");
  const [toast,setToast]=useState("");
  const [novosEd,setNovosEd]=useState(false);
  const [pacs,setPacs]=useLS("v5_med_pac",[],userId);
  const [kbn,setKbn]=useLS("v5_med_kbnotas",{},userId);
  const [pacId,setPacId]=useState(null);
  const [np,setNp]=useState({leito:"",idade:"",sexo:"",queixa:""});
  const [npAberto,setNpAberto]=useState(false);
  const [expDx,setExpDx]=useState(null);
  const [pendT,setPendT]=useState("");
  const [evoT,setEvoT]=useState("");
  const [encDesf,setEncDesf]=useState("");
  const [tickS,setTickS]=useState(0);
  useEffect(()=>{if(sub!=="sala")return;const t=setInterval(()=>setTickS(x=>x+1),30000);return()=>clearInterval(t);},[sub]);
  useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(""),3200);return()=>clearTimeout(t);},[toast]);

  const T={ink:CLI_INK,sheet:CLI_SHEET,acc:CLI_ACC,rgb:"18,48,58",hrgb:"233,240,239"};
  const lab={fontFamily:"'DM Mono',ui-monospace,monospace",fontSize:10,letterSpacing:".12em",textTransform:"uppercase",color:"rgba(var(--cli-rgb),.6)"};
  const serif={fontFamily:"'Fraunces',Georgia,serif",fontWeight:300,letterSpacing:"-.03em"};
  const chipBtn=ativo=>({background:ativo?T.sheet:"rgba(var(--cli-hrgb),.1)",color:ativo?T.ink:"rgba(var(--cli-hrgb),.88)",border:"1px solid "+(ativo?T.sheet:"rgba(var(--cli-hrgb),.3)"),borderRadius:999,padding:"0 16px",height:36,fontSize:12.5,fontWeight:ativo?700:500,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,fontFamily:"'DM Sans',sans-serif"});
  const inp={background:"#fff",border:"1px solid rgba(var(--cli-rgb),.18)",borderRadius:12,padding:"11px 14px",fontSize:14,fontFamily:"'DM Sans',sans-serif",color:T.ink,width:"100%",minWidth:0,outline:"none"};
  const btnP={background:T.ink,color:T.sheet,border:"none",borderRadius:999,padding:"11px 20px",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap"};
  const btnS={background:"transparent",color:T.ink,border:"1px solid rgba(var(--cli-rgb),.25)",borderRadius:999,padding:"10px 18px",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap"};
  const pill=on=>({height:34,padding:"0 14px",borderRadius:999,border:"1px solid "+T.ink,background:on?T.ink:"transparent",color:on?T.sheet:T.ink,fontSize:12.5,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap"});
  const CardR=useRef(null);
  CardR.current=({children,style})=><div style={{background:"#fff",border:"1px solid rgba(var(--cli-rgb),.1)",borderRadius:24,padding:isMobile?"20px 18px":"26px 28px",marginBottom:16,...style}}>{children}</div>;
  const Card=useRef(pp=>CardR.current(pp)).current;
  const Titulo=({k,t,dir})=><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",gap:12,marginBottom:18}}><div><div style={lab}>{k}</div><div style={{...serif,fontSize:isMobile?26:32,marginTop:6,lineHeight:1,color:T.ink}}>{t}</div></div>{dir}</div>;
  const Vazio=({children})=><div style={{fontSize:14,lineHeight:1.5,color:"rgba(var(--cli-rgb),.62)"}}>{children}</div>;

  // ── dados derivados ──
  const mesAtual=hoje.slice(0,7);
  const casosMes=casos.filter(c=>(c.data||"").startsWith(mesAtual));
  const duvidas=casos.filter(c=>c.duvida&&c.duvida.trim()&&!c.duvidaOk);
  const pltMes=plt.filter(p=>(p.data||"").startsWith(mesAtual)).length;
  const d90=addDays(hoje,-90);
  const porArea=CLI_AREAS.map(a=>({a,n:casos.filter(c=>c.area===a&&(c.data||"")>=d90).length})).filter(x=>x.n>0).sort((x,y)=>y.n-x.n);
  const maxArea=Math.max(1,...porArea.map(x=>x.n));
  const hhmm=t=>{const m=/^(\d{1,2}):(\d{2})/.exec(t||"");return m?(+m[1])*60+(+m[2]):null;};
  const plNoturno=q=>{const a=hhmm(q.horaInicio),b=hhmm(q.horaFim);if(a!==null&&b!==null)return b<=a||a>=18*60||(b-a)>=24*60;return (+q.horas||0)>=12;};
  const posPlantao=plt.some(q=>q.data===addDays(hoje,-1)&&plNoturno(q));
  const isNova=k=>!k.vista&&!((k.ok||0)+(k.er||0));
  const due=cards.filter(k=>!isNova(k)&&k.prox<=hoje).sort((a,b)=>a.prox.localeCompare(b.prox));
  const novasTodas=cards.filter(isNova).sort((a,b)=>(a.criada||"").localeCompare(b.criada||""));
  const baseNov=(cfgM.novosDia===undefined||cfgM.novosDia===""||!Number.isFinite(+cfgM.novosDia))?8:+cfgM.novosDia;
  const bloqueioNov=posPlantao?"Pós-plantão: hoje só revisões":(due.length>30?`Dívida alta (${due.length} atrasados): zere antes de liberar novos`:"");
  const limiteHoje=bloqueioNov?0:baseNov;
  const novasFeitas=cards.filter(k=>k.vista===hoje).length;
  const novasLib=novasTodas.slice(0,Math.max(0,limiteHoje-novasFeitas));
  const totHoje=due.length+novasLib.length;
  const acertoTot=(()=>{const o=cards.reduce((a,k)=>a+(k.ok||0),0),e=cards.reduce((a,k)=>a+(k.er||0),0);return o+e?Math.round(o/(o+e)*100):null;})();

  // ── casos ──
  const salvarCaso=()=>{
    if(!fc.queixa.trim())return;
    const base={...fc,queixa:fc.queixa.trim()};
    if(editId){setCasos(casos.map(c=>c.id!==editId?c:{...c,...base}));setEditId(null);setToast("Caso atualizado.");}
    else{setCasos([{id:uid(),...base,criada:hoje,duvidaOk:false,resolucao:""},...casos]);setToast("Caso salvo.");}
    setFc({...fcInit,local:fc.local,area:fc.area});
  };
  const editarCaso=c=>{setFc({data:c.data||hoje,local:c.local||"UPA",idade:c.idade||"",sexo:c.sexo||"",queixa:c.queixa||"",area:c.area||"Outros",hist:c.hist||"",conduta:c.conduta||"",desf:c.desf||"",aprend:c.aprend||"",duvida:c.duvida||""});setEditId(c.id);setSub("casos");try{window.scrollTo({top:0,behavior:"smooth"});}catch{}};
  const casosFilt=casos.filter(c=>(!filtro.area||c.area===filtro.area)&&(!filtro.local||c.local===filtro.local)&&(!filtro.q||[c.queixa,c.hist,c.conduta,c.aprend,c.duvida].join(" ").toLowerCase().includes(filtro.q.toLowerCase()))).sort((a,b)=>(b.data||"").localeCompare(a.data||"")||String(b.id).localeCompare(String(a.id)));
  const novoCard=(frente,verso,area,casoId)=>({id:uid(),frente:frente.trim(),verso:verso.trim(),area:area||"Outros",casoId:casoId||"",criada:hoje,box:0,prox:hoje,ok:0,er:0});
  const abrirCardDe=c=>setCardDe({id:c.id,frente:"Caso: "+c.queixa+". Qual o ponto-chave?",verso:c.aprend||"",area:c.area||"Outros"});
  const salvarCardDe=()=>{if(!cardDe||!cardDe.frente.trim()||!cardDe.verso.trim())return;setCards([novoCard(cardDe.frente,cardDe.verso,cardDe.area,cardDe.id),...cards]);setCardDe(null);setToast("Cartão criado. Entra nos novos do dia.");};
  const resolverDuvida=c=>{
    if(!resTxt.trim())return;
    setCasos(casos.map(x=>x.id!==c.id?x:{...x,duvidaOk:true,resolucao:resTxt.trim()}));
    if(resCard)setCards([novoCard(c.duvida,resTxt,c.area,c.id),...cards]);
    setResId(null);setResTxt("");setToast(resCard?"Dúvida resolvida e virou cartão.":"Dúvida resolvida.");
  };

  // ── revisão ──
  const iniciarRev=m5=>{
    const base=m5===true?due.slice(0,15):due; const nov=m5===true?[]:novasLib;
    const fila=[...base,...nov].map(k=>k.id);
    if(!fila.length)return;
    setRs({fila,i:0,show:false,ok:0,er:0,rep:{},fim:false,m5:m5===true});
  };
  const curK=rs&&!rs.fim?cards.find(k=>k.id===rs.fila[rs.i]):null;
  const responder=ok=>{
    if(!rs||rs.fim)return;
    const id=rs.fila[rs.i]; const k=cards.find(x=>x.id===id);
    if(!k){setRs({...rs,i:rs.i+1,show:false,fim:rs.i+1>=rs.fila.length});return;}
    const b=k.box||0;
    setCards(cards.map(x=>x.id!==id?x:{...x,box:ok?Math.min(b+1,5):0,prox:ok?addDays(hoje,LEIT[Math.min(b,5)]):addDays(hoje,1),vista:x.vista||hoje,ok:(x.ok||0)+(ok?1:0),er:(x.er||0)+(ok?0:1)}));
    const fila=(!ok&&!rs.rep[id])?[...rs.fila,id]:rs.fila; const prox=rs.i+1;
    setRs({...rs,fila,i:prox,show:false,ok:rs.ok+(ok?1:0),er:rs.er+(ok?0:1),rep:ok?rs.rep:{...rs.rep,[id]:1},fim:prox>=fila.length});
  };
  const addCardManual=()=>{if(!fk.frente.trim()||!fk.verso.trim())return;setCards([novoCard(fk.frente,fk.verso,fk.area,""),...cards]);setFk({...fk,frente:"",verso:""});setToast("Cartão criado.");};

  // ── condutas ──
  const salvarProt=()=>{
    if(!pe||!pe.titulo.trim())return;
    if(pe.id){setProt(prot.map(p=>p.id!==pe.id?p:{...p,titulo:pe.titulo.trim(),area:pe.area,texto:pe.texto,atualizada:hoje}));setPAberta(pe.id);}
    else{const n={id:uid(),titulo:pe.titulo.trim(),area:pe.area,texto:pe.texto,atualizada:hoje};setProt([n,...prot]);setPAberta(n.id);}
    setPe(null);
  };
  const protFilt=prot.filter(p=>!pq||(p.titulo+" "+p.texto+" "+p.area).toLowerCase().includes(pq.toLowerCase())).sort((a,b)=>a.titulo.localeCompare(b.titulo));
  const protAb=prot.find(p=>p.id===pAberta)||null;
  const linhasProt=p=>(p.texto||"").split("\n").map((t,i)=>({i,t:t.trim()})).filter(x=>x.t).map(x=>x.t.startsWith("#")?{...x,h:true,t:x.t.replace(/^#+\s*/,"")}:{...x,h:false,t:x.t.replace(/^[-*]\s*/,"")});

  // ── sala amarela ──
  const agoraISO=()=>{const d=new Date();return hoje+"T"+String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0");};
  void tickS;
  const minsDesde=iso=>Math.max(0,Math.round((Date.now()-new Date(iso+":00").getTime())/60000));
  const fmtDur=m=>m<60?m+" min":Math.floor(m/60)+"h"+String(m%60).padStart(2,"0");
  const upPac=(id,patch)=>setPacs(pacs.map(x=>x.id!==id?x:{...x,...patch}));
  const pac=pacs.find(x=>x.id===pacId)||null;
  const pacsOrd=[...pacs].sort((a,b)=>(a.entrada||"").localeCompare(b.entrada||""));
  const addPac=()=>{
    if(!np.queixa.trim()&&!np.leito.trim())return;
    const n={id:uid(),leito:np.leito.trim()||"s/ id",idade:np.idade,sexo:np.sexo,queixa:np.queixa.trim()||"(sem queixa)",entrada:agoraISO(),sit:"aguardando-ex",vit:{pa:"",fc:"",fr:"",sat:"",tax:"",gli:"",mental:false},sind:"",sinais:[],hip:[],pend:[],evo:[],conduta:""};
    setPacs([n,...pacs]); setNp({leito:"",idade:"",sexo:"",queixa:""}); setNpAberto(false); setPacId(n.id); setExpDx(null);
  };
  const alertasVit=v=>{
    const out=[]; const sys=parseInt(String(v.pa||"").split("/")[0],10); const fc=parseFloat(v.fc),fr=parseFloat(v.fr),sat=parseFloat(v.sat),tax=parseFloat(String(v.tax||"").replace(",",".")),gli=parseFloat(v.gli);
    if(sat<92)out.push("SpO2 < 92%"); if(sys<90)out.push("PAS < 90"); if(fc>120)out.push("FC > 120"); if(fc<50)out.push("FC < 50"); if(fr>=22)out.push("FR ≥ 22"); if(tax>=38)out.push("Febre"); if(tax>0&&tax<35.5)out.push("Hipotermia"); if(gli<70)out.push("Glicemia < 70"); if(gli>=250)out.push("Glicemia ≥ 250");
    const tem=!isNaN(fr)||!isNaN(sys)||v.mental; const q=(fr>=22?1:0)+(sys<=100?1:0)+(v.mental?1:0);
    return {flags:out,q:tem?q:null};
  };
  const sx=pac?CLI_KB.find(x=>x.id===pac.sind):null;
  const rankDx=sx?sx.dx.map((d,i)=>{let sc=0;const m=[];pac.sinais.forEach(k=>{const w=d.a[k];if(w){sc+=w;if(w>0)m.push(k);}});return {...d,i,key:sx.id+":"+i,sc,m};}):[];
  const dxNm=rankDx.filter(d=>d.nm).sort((a,b)=>b.sc-a.sc||a.i-b.i);
  const dxOut=rankDx.filter(d=>!d.nm).sort((a,b)=>b.sc-a.sc||a.i-b.i);
  const maxSc=Math.max(1,...rankDx.map(d=>d.sc));
  const toggleSinal=k=>upPac(pac.id,{sinais:pac.sinais.includes(k)?pac.sinais.filter(x=>x!==k):[...pac.sinais,k]});
  const addHip=d=>{if(pac.hip.some(h=>h.k===d.key))return;upPac(pac.id,{hip:[...pac.hip,{k:d.key,nome:d.n,estado:"investigando"}]});};
  const ciclaHip=k=>upPac(pac.id,{hip:pac.hip.map(h=>h.k!==k?h:{...h,estado:h.estado==="investigando"?"confirmada":h.estado==="confirmada"?"descartada":"investigando"})});
  const addPend=()=>{if(!pendT.trim())return;upPac(pac.id,{pend:[...pac.pend,{id:uid(),t:pendT.trim(),feito:false,res:""}]});setPendT("");};
  const upPend=(id,patch)=>upPac(pac.id,{pend:pac.pend.map(x=>x.id!==id?x:{...x,...patch})});
  const addEvo=()=>{if(!evoT.trim())return;upPac(pac.id,{evo:[{id:uid(),h:agoraISO(),t:evoT.trim()},...pac.evo]});setEvoT("");};
  const encerrar=()=>{
    if(!pac||!encDesf)return;
    const kbx=CLI_KB.find(x=>x.id===pac.sind); const v=pac.vit;
    const sinaisTxt=kbx?pac.sinais.map(k=>(kbx.sinais.find(x=>x[0]===k)||[0,k])[1]).join("; "):"";
    const vit=[v.pa&&"PA "+v.pa,v.fc&&"FC "+v.fc,v.fr&&"FR "+v.fr,v.sat&&"SpO2 "+v.sat+"%",v.tax&&"Tax "+v.tax,v.gli&&"Glic "+v.gli].filter(Boolean).join(" · ");
    const pendTxt=pac.pend.map(x=>"- "+x.t+(x.res?": "+x.res:"")+(x.feito?"":" (pendente)")).join("\n");
    const hipTxt=pac.hip.map(h=>h.nome+" ("+h.estado+")").join("; ");
    const evoTxt=[...pac.evo].reverse().map(e=>e.h.slice(11)+" "+e.t).join("\n");
    const hist=[vit,sinaisTxt&&"Achados: "+sinaisTxt,hipTxt&&"Hipóteses: "+hipTxt,pendTxt&&"Exames e pendências:\n"+pendTxt,evoTxt&&"Evolução:\n"+evoTxt].filter(Boolean).join("\n");
    const caso={id:uid(),data:(pac.entrada||hoje).slice(0,10),local:"UPA",idade:pac.idade,sexo:pac.sexo,queixa:pac.queixa,area:kbx?kbx.area:"Outros",hist,conduta:pac.conduta,desf:encDesf,aprend:"",duvida:"",criada:hoje,duvidaOk:false,resolucao:""};
    setCasos([caso,...casos]); setPacs(pacs.filter(x=>x.id!==pac.id)); setPacId(null); setEncDesf("");
    editarCaso(caso); setToast("Caso salvo no diário. Complete o que você aprendeu.");
  };
  const dxCard=d=>{
    const aberto=expDx===(pac.id+d.key); const jaHip=pac.hip.some(h=>h.k===d.key);
    const pct=pac.sinais.length&&d.sc>0?Math.round(d.sc/maxSc*100):0;
    return (
      <div key={d.key} style={{border:"1px solid rgba(var(--cli-rgb),.12)",borderRadius:16,marginBottom:10,overflow:"hidden",background:d.nm?"rgba(224,122,95,.06)":"#fff"}}>
        <div onClick={()=>setExpDx(aberto?null:pac.id+d.key)} style={{padding:"12px 14px",cursor:"pointer"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,justifyContent:"space-between"}}>
            <div style={{fontSize:14.5,fontWeight:600,lineHeight:1.35}}>{d.n}</div>
            <span style={{fontSize:16,opacity:.4,transform:aberto?"rotate(90deg)":"none",transition:"transform .2s"}}>›</span>
          </div>
          {pac.sinais.length>0&&<div style={{height:5,borderRadius:99,background:"rgba(var(--cli-rgb),.08)",marginTop:9,overflow:"hidden"}}><div style={{width:pct+"%",height:"100%",background:d.nm?CLI_ACC:T.ink,borderRadius:99,transition:"width .3s"}}/></div>}
          {d.m.length>0&&<div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:8}}>{d.m.map(k=><span key={k} style={{fontSize:10.5,padding:"2px 8px",borderRadius:999,background:"rgba(var(--cli-rgb),.08)"}}>{(sx.sinais.find(x=>x[0]===k)||[0,k])[1]}</span>)}</div>}
        </div>
        {aberto&&(<div style={{padding:"0 14px 14px",fontSize:13.5,lineHeight:1.6}}>
          <div style={{...lab,marginBottom:4}}>Para confirmar ou descartar</div><div>{d.ex}</div>
          <div style={{...lab,margin:"12px 0 4px"}}>Conduta inicial</div><div>{d.cd}</div>
          <div style={{...lab,margin:"12px 0 6px"}}>Minha anotação</div>
          <textarea style={{...inp,minHeight:56,resize:"vertical",lineHeight:1.5,fontSize:13}} value={kbn[d.key]||""} onChange={e=>setKbn({...kbn,[d.key]:e.target.value})} placeholder="Doses do seu serviço, pegadinhas, referência…"/>
          <div style={{marginTop:12}}><button style={{...(jaHip?btnS:btnP),padding:"8px 16px",fontSize:12.5}} disabled={jaHip} onClick={()=>addHip(d)}>{jaHip?"Já é hipótese deste paciente":"Marcar como hipótese"}</button></div>
        </div>)}
      </div>);
  };
  const corEstado={investigando:"rgba(var(--cli-rgb),.1)",confirmada:"rgba(60,130,90,.25)",descartada:"rgba(168,50,50,.14)"};
  const subs=[["hoje","Hoje"],["sala","Sala amarela"+(pacs.length?" · "+pacs.length:"")],["casos","Casos"],["rev","Revisão"+(totHoje?" · "+totHoje:"")],["cond","Condutas"]];
  const tiles=[
    {l:"Casos no mês",v:String(casosMes.length),u:"registrados",s:"petroleo",z:1.5,x:20,y:30,to:"casos"},
    {l:"Cartões hoje",v:String(totHoje),u:novasLib.length?`${due.length} rev. + ${novasLib.length} novos`:"para revisar",s:"tulipa",z:1.4,x:40,y:20,to:"rev"},
    {l:"Dúvidas abertas",v:String(duvidas.length),u:duvidas.length===1?"para estudar":"para estudar",s:"veludo",z:1.5,x:10,y:50,to:"hoje"},
    {l:"Plantões no mês",v:String(pltMes),u:pltMes?`${(casosMes.length/pltMes).toFixed(1).replace(".0","")} casos por plantão`:"na agenda",s:"manteiga",z:1.4,x:30,y:20,to:"casos"},
  ];
  const mesNome=CLI_MESES[+hoje.slice(5,7)-1];

  const fmtData=d=>d?d.slice(8,10)+"/"+d.slice(5,7):"";
  const Chip=({children,cor})=><span style={{display:"inline-block",fontSize:10.5,fontWeight:600,letterSpacing:".04em",padding:"3px 9px",borderRadius:999,background:cor||"rgba(var(--cli-rgb),.08)",color:T.ink}}>{children}</span>;

  return (
    <div className="cli" style={{"--cli-rgb":T.rgb,"--cli-hrgb":T.hrgb,minHeight:"100vh",background:T.ink,position:"relative",zIndex:1,color:T.ink,fontFamily:"'DM Sans','Segoe UI',sans-serif"}}>
      <style>{`
        .cli .cli-hero{position:relative;overflow:hidden;background:${T.ink};color:${T.sheet};animation:cliFade .5s ease both}
        .cli .cli-sheet{animation:cliFade .5s ease both;position:relative;background:${T.sheet};border-radius:30px 30px 0 0;margin-top:-28px;min-height:70vh;padding:${isMobile?"26px 14px 110px":"34px 28px 110px"}}
        @keyframes cliFade{from{opacity:0}to{opacity:1}}
        .cli .cli-scrim{position:absolute;inset:0;background:linear-gradient(95deg,rgba(8,26,32,.96) 0%,rgba(8,26,32,.8) 45%,rgba(8,26,32,.3) 100%)}
        .cli .cli-in{position:relative;max-width:1100px;margin:0 auto;padding:${isMobile?"18px 18px 54px":"26px 28px 62px"}}
        .cli .cli-wrap{max-width:1100px;margin:0 auto}
        .cli .cli-grid4{display:grid;grid-template-columns:repeat(${isMobile?2:4},1fr);gap:14px;margin-bottom:16px}
        .cli .cli-grid2{display:grid;grid-template-columns:${isMobile?"1fr":"1fr 1fr"};gap:16px}
        .cli .cli-row{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;padding-bottom:2px}
        .cli .cli-row::-webkit-scrollbar{display:none}
        .cli input:focus,.cli select:focus,.cli textarea:focus{border-color:${T.ink}!important}
        .cli button:active{transform:scale(.98)}
        body:has(.cli){background:#0B2229!important}
      `}</style>
      <div className="cli-hero">
        <Motif s="petroleo" z={1.2} x={40} y={15} style={{position:"absolute",inset:0,opacity:.95}}/>
        <div className="cli-scrim"/>
        <div className="cli-in">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:isMobile?22:30}}>
            <button onClick={onMenu} aria-label="Abrir menu" style={{background:"rgba(var(--cli-hrgb),.12)",border:"1px solid rgba(var(--cli-hrgb),.3)",borderRadius:99,width:40,height:40,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4.5}}>{[0,1,2].map(i=><i key={i} style={{width:16,height:1.5,background:T.sheet,display:"block"}}/>)}</button>
            <AppSwitch atual="med" onTrocar={onTrocar}/>
            <span style={{width:40,height:40}}/>
          </div>
          <div style={{...serif,fontSize:isMobile?38:52,lineHeight:1,color:T.sheet,marginBottom:10}}>Clínica</div>
          <div style={{fontFamily:"'DM Mono',ui-monospace,monospace",fontSize:10.5,letterSpacing:".16em",textTransform:"uppercase",opacity:.75,marginBottom:6}}>Casos e condutas da rotina</div>
          <div style={{display:"flex",alignItems:"baseline",gap:14,flexWrap:"wrap"}}><span style={{...serif,fontSize:isMobile?96:140,lineHeight:.85,color:T.sheet}}>{casosMes.length}</span><span style={{...serif,fontSize:isMobile?22:30,opacity:.85}}>{casosMes.length===1?"caso":"casos"}<br/>em {mesNome}</span></div>
          <div style={{fontFamily:"'DM Mono',ui-monospace,monospace",fontSize:10.5,letterSpacing:".1em",opacity:.85,marginTop:18}}>{pacs.length>0?pacs.length+" NA SALA · ":""}{duvidas.length} DÚVIDA{duvidas.length===1?"":"S"} EM ABERTO · {totHoje} CARTÕE{totHoje===1?"":"S"} HOJE</div>
          <div className="cli-row" style={{marginTop:20}}>{subs.map(([id,l])=><button key={id} onClick={()=>setSub(id)} style={chipBtn(sub===id)}>{l}</button>)}</div>
        </div>
      </div>

      <div className="cli-sheet"><div className="cli-wrap">

      {sub==="hoje"&&(<>
        <div className="cli-grid4">
          {tiles.map(t=>(
            <div key={t.l} className="bento-tile" onClick={()=>setSub(t.to)} style={{background:STY[t.s].paper,cursor:"pointer",minHeight:isMobile?172:200}}>
              <Motif s={t.s} z={t.z} x={t.x} y={t.y} style={{position:"absolute",inset:0,zIndex:0,pointerEvents:"none"}}/>
              <div className="tile-panel" style={{marginTop:"auto"}}>
                <div style={{...lab,fontSize:9.5,color:"rgba(var(--cli-rgb),.65)"}}>{t.l}</div>
                <div style={{display:"flex",alignItems:"baseline",gap:6,marginTop:6,flexWrap:"wrap"}}><span style={{...serif,fontSize:isMobile?34:42,lineHeight:1,color:T.ink}}>{t.v}</span><span style={{fontSize:11.5,opacity:.6}}>{t.u}</span></div>
              </div>
            </div>))}
        </div>
        {pacs.length>0&&(
          <Card>
            <Titulo k="Agora" t="Na sala amarela" dir={<button style={{...btnS,padding:"8px 14px",fontSize:12}} onClick={()=>{setSub("sala");setPacId(null);}}>abrir sala</button>}/>
            {pacsOrd.slice(0,5).map((x,n)=>(
              <div key={x.id} onClick={()=>{setSub("sala");setPacId(x.id);}} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderTop:n===0?"none":"1px solid rgba(var(--cli-rgb),.08)",cursor:"pointer"}}>
                <span style={{...serif,fontSize:22,width:46,flexShrink:0}}>{x.leito}</span>
                <div style={{flex:1,minWidth:0,fontSize:14,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{x.queixa}</div>
                <span style={{...lab,whiteSpace:"nowrap"}}>{fmtDur(minsDesde(x.entrada))}</span>
              </div>))}
          </Card>)}
        <div className="cli-grid2">
          <Card>
            <Titulo k="Para estudar" t="Dúvidas em aberto"/>
            {duvidas.length===0?<Vazio>Nenhuma dúvida pendente. Quando um caso te deixar com uma pergunta, ela aparece aqui até você resolver.</Vazio>:duvidas.slice(0,6).map((c,n)=>(
              <div key={c.id} style={{padding:"12px 0",borderTop:n===0?"none":"1px solid rgba(var(--cli-rgb),.08)"}}>
                <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:6}}><Chip>{c.area}</Chip><span style={{...lab,fontSize:9.5}}>{fmtData(c.data)} · {c.queixa}</span></div>
                <div style={{fontSize:14.5,lineHeight:1.5,fontWeight:600}}>{c.duvida}</div>
                {resId===c.id?(<div style={{marginTop:10}}>
                  <textarea style={{...inp,minHeight:70,resize:"vertical",lineHeight:1.5}} value={resTxt} onChange={e=>setResTxt(e.target.value)} placeholder="O que você descobriu? (fonte, diretriz, resposta)"/>
                  <label style={{display:"flex",alignItems:"center",gap:8,fontSize:13,marginTop:10}}><input type="checkbox" checked={resCard} onChange={e=>setResCard(e.target.checked)} style={{width:"auto"}}/>Virar cartão de revisão</label>
                  <div style={{display:"flex",gap:10,marginTop:12}}><button style={{...btnP,opacity:resTxt.trim()?1:.4}} disabled={!resTxt.trim()} onClick={()=>resolverDuvida(c)}>Resolver</button><button style={btnS} onClick={()=>{setResId(null);setResTxt("");}}>Cancelar</button></div>
                </div>):<button style={{...btnS,padding:"7px 14px",fontSize:12,marginTop:10}} onClick={()=>{setResId(c.id);setResTxt("");}}>Resolver</button>}
              </div>))}
            {duvidas.length>6&&<div style={{...lab,marginTop:10}}>+ {duvidas.length-6} dúvidas</div>}
          </Card>
          <Card>
            <Titulo k="Últimos 90 dias" t="Casos por área"/>
            {porArea.length===0?<Vazio>Registre casos para ver onde você mais atua e onde precisa reforçar.</Vazio>:porArea.map(x=>(
              <div key={x.a} style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
                <span style={{width:92,fontSize:13,fontWeight:600,flexShrink:0}}>{x.a}</span>
                <div style={{flex:1,height:8,borderRadius:99,background:"rgba(var(--cli-rgb),.08)",overflow:"hidden"}}><div style={{width:(x.n/maxArea*100)+"%",height:"100%",background:T.ink,borderRadius:99}}/></div>
                <span style={{...lab,width:24,textAlign:"right"}}>{x.n}</span>
              </div>))}
          </Card>
        </div>
        <Card>
          <Titulo k="Recentes" t="Últimos casos" dir={casos.length>0?<button style={{...btnS,padding:"8px 14px",fontSize:12}} onClick={()=>setSub("casos")}>ver todos</button>:null}/>
          {casos.length===0?<Vazio>Nenhum caso ainda. Registre o primeiro na aba Casos: leva um minuto e fica como memória de plantão.</Vazio>:[...casos].sort((a,b)=>(b.data||"").localeCompare(a.data||"")).slice(0,4).map((c,n)=>(
            <div key={c.id} style={{padding:"11px 0",borderTop:n===0?"none":"1px solid rgba(var(--cli-rgb),.08)"}}>
              <div style={{fontSize:14.5,fontWeight:600}}>{c.queixa}</div>
              <div style={{...lab,fontSize:9.5,marginTop:4}}>{fmtData(c.data)} · {c.local} · {c.area}{c.desf?" · "+c.desf:""}</div>
              {c.aprend&&<div style={{fontSize:13,opacity:.75,marginTop:6,lineHeight:1.5}}>{c.aprend}</div>}
            </div>))}
        </Card>
      </>)}

      {sub==="sala"&&(<>
        {!pac?(<>
          <Card>
            <Titulo k="Em andamento" t="Sala amarela" dir={<button style={{...btnP,padding:"9px 16px",fontSize:12}} onClick={()=>setNpAberto(!npAberto)}>{npAberto?"Fechar":"Novo paciente"}</button>}/>
            <div style={{fontSize:13.5,lineHeight:1.6,opacity:.75,maxWidth:620}}>Cadastre cada paciente que você está acompanhando, anote sinais, hipóteses, exames pendentes e evolução, e use o apoio ao raciocínio para pensar em diferenciais e conduta. Ao encerrar, o caso vai direto para o diário.</div>
            {npAberto&&(<div style={{marginTop:16,padding:16,borderRadius:16,background:"rgba(var(--cli-rgb),.05)"}}>
              <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"1fr 90px 100px",gap:12}}>
                <div style={isMobile?{gridColumn:"1 / -1"}:{}}><div style={{...lab,marginBottom:6}}>Queixa principal</div><input autoFocus style={inp} value={np.queixa} onChange={e=>setNp({...np,queixa:e.target.value})} onKeyDown={e=>{if(e.key==="Enter")addPac();}} placeholder="Ex: dor torácica há 2h"/></div>
                <div><div style={{...lab,marginBottom:6}}>Leito / ident.</div><input style={inp} value={np.leito} onChange={e=>setNp({...np,leito:e.target.value})} placeholder="A3"/></div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  <div><div style={{...lab,marginBottom:6}}>Idade</div><input style={inp} value={np.idade} onChange={e=>setNp({...np,idade:e.target.value})} placeholder="58"/></div>
                  <div><div style={{...lab,marginBottom:6}}>Sexo</div><select style={inp} value={np.sexo} onChange={e=>setNp({...np,sexo:e.target.value})}><option value="">—</option><option>F</option><option>M</option></select></div>
                </div>
              </div>
              <div style={{marginTop:14}}><button style={{...btnP,opacity:np.queixa.trim()||np.leito.trim()?1:.4}} disabled={!(np.queixa.trim()||np.leito.trim())} onClick={addPac}>Adicionar à sala</button></div>
            </div>)}
          </Card>
          {pacsOrd.length===0?<Card><Vazio>Ninguém na sala por enquanto. Toque em “Novo paciente” quando começar a atender.</Vazio></Card>:pacsOrd.map(x=>{
            const al=alertasVit(x.vit); const abertas=x.pend.filter(y=>!y.feito).length; const hipsA=x.hip.filter(h=>h.estado!=="descartada");
            return (
              <div key={x.id} onClick={()=>{setPacId(x.id);setExpDx(null);try{window.scrollTo({top:0,behavior:"smooth"});}catch{}}} style={{background:"#fff",border:"1px solid rgba(var(--cli-rgb),.1)",borderRadius:24,padding:isMobile?"16px 18px":"20px 26px",marginBottom:12,cursor:"pointer"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",gap:12}}>
                  <div style={{display:"flex",alignItems:"baseline",gap:10,minWidth:0}}><span style={{...serif,fontSize:isMobile?26:30,lineHeight:1}}>{x.leito}</span><span style={{...lab,whiteSpace:"nowrap"}}>{x.idade?x.idade+"a":""}{x.sexo?" "+x.sexo:""}</span></div>
                  <span style={{...lab,whiteSpace:"nowrap"}}>há {fmtDur(minsDesde(x.entrada))}</span>
                </div>
                <div style={{fontSize:15,fontWeight:600,marginTop:8,lineHeight:1.35}}>{x.queixa}</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:10}}>
                  <Chip cor="rgba(224,122,95,.22)">{(CLI_SIT.find(c=>c[0]===x.sit)||[0,"—"])[1]}</Chip>
                  {abertas>0&&<Chip>{abertas} pendência{abertas>1?"s":""}</Chip>}
                  {al.flags.slice(0,3).map(f=><Chip key={f} cor="rgba(168,50,50,.16)">{f}</Chip>)}
                  {al.q!==null&&al.q>=2&&<Chip cor="rgba(168,50,50,.28)">qSOFA {al.q}</Chip>}
                </div>
                {hipsA.length>0&&<div style={{fontSize:12.5,opacity:.7,marginTop:8,lineHeight:1.5}}>{hipsA.map(h=>h.nome).join(" · ")}</div>}
              </div>);})}
        </>):(<>
          <div style={{marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}>
            <button onClick={()=>setPacId(null)} style={{background:"none",border:"none",padding:0,cursor:"pointer",...lab,textDecoration:"underline",textUnderlineOffset:3}}>← sala amarela</button>
            <span style={{...lab,whiteSpace:"nowrap"}}>entrada {pac.entrada.slice(11)} · há {fmtDur(minsDesde(pac.entrada))}</span>
          </div>
          <Card>
            <div style={{display:"flex",alignItems:"baseline",gap:12,flexWrap:"wrap"}}><span style={{...serif,fontSize:isMobile?34:42,lineHeight:1}}>{pac.leito}</span><span style={lab}>{pac.idade?pac.idade+" anos":""}{pac.sexo?" · "+pac.sexo:""}</span></div>
            <input style={{...inp,marginTop:12,fontWeight:600}} value={pac.queixa} onChange={e=>upPac(pac.id,{queixa:e.target.value})}/>
            <div style={{...lab,margin:"16px 0 8px"}}>Situação</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{CLI_SIT.map(([k,l])=><button key={k} style={pill(pac.sit===k)} onClick={()=>upPac(pac.id,{sit:k})}>{l}</button>)}</div>
            <div style={{...lab,margin:"16px 0 8px"}}>Sinais vitais</div>
            <div style={{display:"grid",gridTemplateColumns:isMobile?"repeat(3,1fr)":"repeat(6,1fr)",gap:10}}>
              {[["pa","PA","120/80"],["fc","FC","bpm"],["fr","FR","irpm"],["sat","SpO2","%"],["tax","Tax","°C"],["gli","Glicemia","mg/dL"]].map(([k,l,ph])=>(
                <div key={k}><div style={{...lab,fontSize:9,marginBottom:5}}>{l}</div><input style={{...inp,padding:"9px 10px"}} inputMode={k==="pa"?"text":"decimal"} value={pac.vit[k]} onChange={e=>upPac(pac.id,{vit:{...pac.vit,[k]:e.target.value}})} placeholder={ph}/></div>))}
            </div>
            <label style={{display:"flex",alignItems:"center",gap:8,fontSize:13,marginTop:12}}><input type="checkbox" checked={!!pac.vit.mental} onChange={e=>upPac(pac.id,{vit:{...pac.vit,mental:e.target.checked}})} style={{width:"auto"}}/>Alteração do estado mental</label>
            {(()=>{const al=alertasVit(pac.vit);return (al.flags.length>0||al.q!==null)&&(
              <div style={{marginTop:14,padding:"12px 14px",borderRadius:14,background:al.q>=2||al.flags.length?"rgba(168,50,50,.08)":"rgba(var(--cli-rgb),.05)",fontSize:13,lineHeight:1.55}}>
                {al.flags.length>0&&<div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:al.q!==null?8:0}}>{al.flags.map(f=><Chip key={f} cor="rgba(168,50,50,.2)">{f}</Chip>)}</div>}
                {al.q!==null&&<div><b>qSOFA {al.q}/3</b>{al.q>=2?": risco alto de desfecho adverso se houver infecção. Considerar sepse e seguir o pacote da primeira hora do protocolo (lactato, hemoculturas, antibiótico precoce, volume)."  :" (FR ≥ 22, PAS ≤ 100, estado mental alterado)."}</div>}
              </div>);})()}
          </Card>

          <Card>
            <Titulo k="Apoio ao raciocínio" t="O que pode ser?"/>
            <div style={{...lab,marginBottom:8}}>Síndrome</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:6}}>{CLI_KB.map(k=><button key={k.id} style={pill(pac.sind===k.id)} onClick={()=>upPac(pac.id,{sind:pac.sind===k.id?"":k.id,sinais:pac.sind===k.id?[]:pac.sinais})}>{k.nome}</button>)}</div>
            {!sx?<Vazio>Escolha a síndrome que mais se parece com a queixa. Depois marque os achados e o app ordena os diagnósticos pelo que combina, mantendo sempre à vista os que não podem ser perdidos.</Vazio>:(<>
              <div style={{...lab,margin:"16px 0 8px"}}>Achados presentes ({pac.sinais.length})</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{sx.sinais.map(([k,l])=>{const on=pac.sinais.includes(k);return <button key={k} onClick={()=>toggleSinal(k)} style={{padding:"8px 13px",borderRadius:14,border:"1px solid "+(on?T.ink:"rgba(var(--cli-rgb),.22)"),background:on?T.ink:"transparent",color:on?T.sheet:T.ink,fontSize:12.5,lineHeight:1.35,cursor:"pointer",textAlign:"left",fontFamily:"'DM Sans',sans-serif"}}>{l}</button>;})}</div>
              <div style={{...lab,margin:"22px 0 10px",color:"#B5533C"}}>Não pode perder (excluir primeiro)</div>
              {dxNm.map(dxCard)}
              <div style={{...lab,margin:"22px 0 10px"}}>Outras hipóteses frequentes</div>
              {dxOut.map(dxCard)}
              <div style={{fontSize:12,opacity:.6,lineHeight:1.55,marginTop:14}}>A barra mostra o quanto os achados marcados combinam com cada diagnóstico; não é probabilidade. É um lembrete de raciocínio com condutas iniciais de forma geral, sem doses. Confirme na diretriz atual e no protocolo do seu serviço, e anote as doses do seu serviço em “Minha anotação”.</div>
            </>)}
          </Card>

          <Card>
            <Titulo k="Raciocínio" t="Hipóteses deste paciente"/>
            {pac.hip.length===0?<Vazio>Abra um diagnóstico acima e toque em “Marcar como hipótese”.</Vazio>:pac.hip.map((h,n)=>(
              <div key={h.k} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderTop:n===0?"none":"1px solid rgba(var(--cli-rgb),.08)"}}>
                <div style={{flex:1,minWidth:0,fontSize:14.5,fontWeight:600,textDecoration:h.estado==="descartada"?"line-through":"none",opacity:h.estado==="descartada"?.55:1}}>{h.nome}</div>
                <button onClick={()=>ciclaHip(h.k)} style={{border:"none",borderRadius:999,padding:"6px 12px",fontSize:11.5,fontWeight:700,cursor:"pointer",background:corEstado[h.estado],color:T.ink,fontFamily:"'DM Sans',sans-serif"}}>{h.estado}</button>
                <button onClick={()=>upPac(pac.id,{hip:pac.hip.filter(x=>x.k!==h.k)})} aria-label="remover" style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:"rgba(var(--cli-rgb),.35)"}}>×</button>
              </div>))}
            {pac.hip.length>0&&<div style={{fontSize:12,opacity:.6,marginTop:8}}>Toque no estado para alternar: investigando, confirmada, descartada.</div>}
          </Card>

          <Card>
            <Titulo k="Acompanhar" t="Exames e pendências"/>
            {pac.pend.map((x,n)=>(
              <div key={x.id} style={{padding:"10px 0",borderTop:n===0?"none":"1px solid rgba(var(--cli-rgb),.08)"}}>
                <label style={{display:"flex",gap:12,alignItems:"flex-start",cursor:"pointer",fontSize:14.5,lineHeight:1.45}}>
                  <input type="checkbox" checked={x.feito} onChange={e=>upPend(x.id,{feito:e.target.checked})} style={{width:20,height:20,marginTop:1,flexShrink:0,accentColor:T.ink}}/>
                  <span style={{flex:1,textDecoration:x.feito?"line-through":"none",opacity:x.feito?.6:1}}>{x.t}</span>
                  <button onClick={e=>{e.preventDefault();upPac(pac.id,{pend:pac.pend.filter(y=>y.id!==x.id)});}} aria-label="remover" style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:"rgba(var(--cli-rgb),.35)"}}>×</button>
                </label>
                {x.feito&&<input style={{...inp,marginTop:8,marginLeft:32,width:"calc(100% - 32px)",padding:"8px 12px",fontSize:13}} value={x.res} onChange={e=>upPend(x.id,{res:e.target.value})} placeholder="Resultado"/>}
              </div>))}
            <div style={{display:"flex",gap:10,marginTop:pac.pend.length?12:0}}>
              <input style={inp} value={pendT} onChange={e=>setPendT(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")addPend();}} placeholder="Ex: troponina 2ª amostra, RX de tórax"/>
              <button style={btnP} onClick={addPend}>Adicionar</button>
            </div>
          </Card>

          <Card>
            <Titulo k="Linha do tempo" t="Evolução"/>
            <div style={{display:"flex",gap:10}}>
              <input style={inp} value={evoT} onChange={e=>setEvoT(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")addEvo();}} placeholder="Ex: reavaliado, dor melhorou após analgesia"/>
              <button style={btnP} onClick={addEvo}>Registrar</button>
            </div>
            {pac.evo.map((e,n)=>(
              <div key={e.id} style={{display:"flex",gap:12,padding:"10px 0",borderTop:n===0?"1px solid rgba(var(--cli-rgb),.08)":"1px solid rgba(var(--cli-rgb),.08)",marginTop:n===0?14:0,fontSize:14,lineHeight:1.5}}>
                <span style={{...lab,flexShrink:0,paddingTop:3}}>{e.h.slice(11)}</span><span style={{flex:1}}>{e.t}</span>
                <button onClick={()=>upPac(pac.id,{evo:pac.evo.filter(y=>y.id!==e.id)})} aria-label="remover" style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:"rgba(var(--cli-rgb),.35)"}}>×</button>
              </div>))}
            <div style={{...lab,margin:"18px 0 6px"}}>Conduta</div>
            <textarea style={{...inp,minHeight:70,resize:"vertical",lineHeight:1.5}} value={pac.conduta} onChange={e=>upPac(pac.id,{conduta:e.target.value})} placeholder="O que foi prescrito e decidido"/>
          </Card>

          <Card>
            <Titulo k="Fechar" t="Encerrar atendimento"/>
            <div style={{...lab,marginBottom:8}}>Desfecho</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{CLI_DESF.map(d=><button key={d} style={pill(encDesf===d)} onClick={()=>setEncDesf(encDesf===d?"":d)}>{d}</button>)}</div>
            <div style={{display:"flex",gap:10,marginTop:16,flexWrap:"wrap"}}>
              <button style={{...btnP,opacity:encDesf?1:.4}} disabled={!encDesf} onClick={encerrar}>Salvar no diário e encerrar</button>
              <button style={{...btnS,borderColor:"rgba(168,50,50,.4)",color:"#A83232"}} onClick={()=>{if(window.confirm("Remover da sala sem salvar no diário?")){setPacs(pacs.filter(x=>x.id!==pac.id));setPacId(null);}}}>Remover sem salvar</button>
            </div>
            <div style={{fontSize:12,opacity:.6,marginTop:10}}>O caso vai para o diário com sinais, hipóteses, exames e evolução. Depois é só preencher o que aprendeu.</div>
          </Card>
        </>)}
      </>)}

      {sub==="casos"&&(<>
        <Card>
          <Titulo k={editId?"Editando":"Novo"} t={editId?"Editar caso":"Registrar caso"}/>
          <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"150px 1fr 90px 110px",gap:12}}>
            <div style={isMobile?{}:{}}><div style={{...lab,marginBottom:6}}>Data</div><input style={inp} type="date" value={fc.data} onChange={e=>setFc({...fc,data:e.target.value})}/></div>
            <div style={isMobile?{gridColumn:"1 / -1",order:-1}:{}}><div style={{...lab,marginBottom:6}}>Queixa / hipótese</div><input style={inp} value={fc.queixa} onChange={e=>setFc({...fc,queixa:e.target.value})} placeholder="Ex: dor torácica típica, 58a"/></div>
            <div><div style={{...lab,marginBottom:6}}>Idade</div><input style={inp} value={fc.idade} onChange={e=>setFc({...fc,idade:e.target.value})} placeholder="58"/></div>
            <div><div style={{...lab,marginBottom:6}}>Sexo</div><select style={inp} value={fc.sexo} onChange={e=>setFc({...fc,sexo:e.target.value})}><option value="">—</option><option>F</option><option>M</option></select></div>
          </div>
          <div style={{...lab,margin:"16px 0 8px"}}>Onde</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{CLI_LOCAIS.map(l=><button key={l} style={pill(fc.local===l)} onClick={()=>setFc({...fc,local:l})}>{l}</button>)}</div>
          <div style={{...lab,margin:"16px 0 8px"}}>Área</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{CLI_AREAS.map(a=><button key={a} style={pill(fc.area===a)} onClick={()=>setFc({...fc,area:a})}>{a}</button>)}</div>
          <div style={{marginTop:16}}><div style={{...lab,marginBottom:6}}>Apresentação e achados</div><textarea style={{...inp,minHeight:80,resize:"vertical",lineHeight:1.5}} value={fc.hist} onChange={e=>setFc({...fc,hist:e.target.value})} placeholder="História, exame físico, exames complementares"/></div>
          <div style={{marginTop:12}}><div style={{...lab,marginBottom:6}}>Conduta</div><textarea style={{...inp,minHeight:70,resize:"vertical",lineHeight:1.5}} value={fc.conduta} onChange={e=>setFc({...fc,conduta:e.target.value})} placeholder="O que foi feito"/></div>
          <div style={{...lab,margin:"16px 0 8px"}}>Desfecho</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{CLI_DESF.map(d=><button key={d} style={pill(fc.desf===d)} onClick={()=>setFc({...fc,desf:fc.desf===d?"":d})}>{d}</button>)}</div>
          <div style={{marginTop:16}}><div style={{...lab,marginBottom:6}}>O que aprendi</div><textarea style={{...inp,minHeight:70,resize:"vertical",lineHeight:1.5}} value={fc.aprend} onChange={e=>setFc({...fc,aprend:e.target.value})} placeholder="O ponto-chave que você quer lembrar (vira cartão depois)"/></div>
          <div style={{marginTop:12}}><div style={{...lab,marginBottom:6}}>Dúvida para estudar</div><input style={inp} value={fc.duvida} onChange={e=>setFc({...fc,duvida:e.target.value})} placeholder="O que ficou sem resposta?"/></div>
          <div style={{display:"flex",gap:10,marginTop:18,flexWrap:"wrap"}}>
            <button style={{...btnP,opacity:fc.queixa.trim()?1:.4}} disabled={!fc.queixa.trim()} onClick={salvarCaso}>{editId?"Salvar alterações":"Salvar caso"}</button>
            {editId&&<button style={btnS} onClick={()=>{setEditId(null);setFc({...fcInit});}}>Cancelar</button>}
          </div>
        </Card>
        <Card>
          <Titulo k="Histórico" t="Seus casos" dir={<span style={{...lab,whiteSpace:"nowrap"}}>{casosFilt.length} de {casos.length}</span>}/>
          <input style={{...inp,marginBottom:10}} value={filtro.q} onChange={e=>setFiltro({...filtro,q:e.target.value})} placeholder="Buscar em queixa, conduta, aprendizado…"/>
          <div className="cli-row" style={{marginBottom:6}}>
            <button style={pill(!filtro.area)} onClick={()=>setFiltro({...filtro,area:""})}>Todas</button>
            {CLI_AREAS.map(a=><button key={a} style={pill(filtro.area===a)} onClick={()=>setFiltro({...filtro,area:filtro.area===a?"":a})}>{a}</button>)}
          </div>
          <div className="cli-row" style={{marginBottom:12}}>
            {CLI_LOCAIS.map(l=><button key={l} style={pill(filtro.local===l)} onClick={()=>setFiltro({...filtro,local:filtro.local===l?"":l})}>{l}</button>)}
          </div>
          {casosFilt.length===0?<Vazio>{casos.length===0?"Nenhum caso registrado.":"Nada encontrado com esses filtros."}</Vazio>:(verTodos?casosFilt:casosFilt.slice(0,20)).map((c,n)=>(
            <div key={c.id} style={{padding:"16px 0",borderTop:n===0?"none":"1px solid rgba(var(--cli-rgb),.1)"}}>
              <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",marginBottom:8}}><Chip>{c.area}</Chip><Chip>{c.local}</Chip>{c.desf&&<Chip cor="rgba(224,122,95,.25)">{c.desf}</Chip>}<span style={{...lab,fontSize:9.5}}>{fmtData(c.data)}{c.idade?` · ${c.idade}a`:""}{c.sexo?` ${c.sexo}`:""}</span></div>
              <div style={{fontSize:16,fontWeight:600,lineHeight:1.35}}>{c.queixa}</div>
              {c.hist&&<div style={{fontSize:13.5,lineHeight:1.55,marginTop:8,opacity:.8,whiteSpace:"pre-wrap"}}>{c.hist}</div>}
              {c.conduta&&<div style={{fontSize:13.5,lineHeight:1.55,marginTop:8,whiteSpace:"pre-wrap"}}><b style={{...lab,marginRight:6}}>conduta</b>{c.conduta}</div>}
              {c.aprend&&<div style={{fontSize:13.5,lineHeight:1.55,marginTop:8,padding:"10px 12px",borderRadius:12,background:"rgba(224,122,95,.12)",whiteSpace:"pre-wrap"}}><b style={{...lab,marginRight:6}}>aprendi</b>{c.aprend}</div>}
              {c.duvida&&<div style={{fontSize:13.5,lineHeight:1.55,marginTop:8}}><b style={{...lab,marginRight:6}}>dúvida{c.duvidaOk?" resolvida":""}</b>{c.duvida}{c.duvidaOk&&c.resolucao&&<div style={{opacity:.75,marginTop:4,whiteSpace:"pre-wrap"}}>→ {c.resolucao}</div>}</div>}
              {cardDe&&cardDe.id===c.id?(
                <div style={{marginTop:12,padding:14,borderRadius:16,background:"rgba(var(--cli-rgb),.05)"}}>
                  <div style={{...lab,marginBottom:6}}>Frente (pergunta)</div><input style={inp} value={cardDe.frente} onChange={e=>setCardDe({...cardDe,frente:e.target.value})}/>
                  <div style={{...lab,margin:"10px 0 6px"}}>Verso (resposta)</div><textarea style={{...inp,minHeight:64,resize:"vertical",lineHeight:1.5}} value={cardDe.verso} onChange={e=>setCardDe({...cardDe,verso:e.target.value})}/>
                  <div style={{display:"flex",gap:10,marginTop:12}}><button style={{...btnP,opacity:cardDe.frente.trim()&&cardDe.verso.trim()?1:.4}} disabled={!(cardDe.frente.trim()&&cardDe.verso.trim())} onClick={salvarCardDe}>Criar cartão</button><button style={btnS} onClick={()=>setCardDe(null)}>Cancelar</button></div>
                </div>
              ):(
                <div style={{display:"flex",gap:8,marginTop:12,flexWrap:"wrap"}}>
                  {c.aprend&&<button style={{...btnS,padding:"7px 14px",fontSize:12}} onClick={()=>abrirCardDe(c)}>Virar cartão</button>}
                  <button style={{...btnS,padding:"7px 14px",fontSize:12}} onClick={()=>editarCaso(c)}>Editar</button>
                  <button style={{...btnS,padding:"7px 14px",fontSize:12,borderColor:"rgba(168,50,50,.4)",color:"#A83232"}} onClick={()=>{if(window.confirm("Excluir este caso?"))setCasos(casos.filter(x=>x.id!==c.id));}}>Excluir</button>
                </div>)}
            </div>))}
          {!verTodos&&casosFilt.length>20&&<button style={{...btnS,marginTop:12}} onClick={()=>setVerTodos(true)}>Ver todos ({casosFilt.length})</button>}
        </Card>
      </>)}

      {sub==="rev"&&(<>
        {rs?(
          <Card style={{textAlign:"center",padding:isMobile?"26px 18px":"36px 28px"}}>
            {rs.fim?(<>
              <div style={lab}>{rs.m5?"Modo 5 min concluído":"Revisão concluída"}</div>
              <div style={{...serif,fontSize:isMobile?56:72,margin:"14px 0 6px",lineHeight:1}}>{rs.ok}<small style={{fontSize:"45%",opacity:.45}}> / {rs.ok+rs.er}</small></div>
              <Vazio>acertos nesta sessão. Os cartões voltam em intervalos crescentes.</Vazio>
              <div style={{marginTop:20}}><button style={btnP} onClick={()=>setRs(null)}>Fechar</button></div>
            </>):curK?(<>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <Chip>{curK.area}</Chip><span style={lab}>{Math.min(rs.i+1,rs.fila.length)} / {rs.fila.length}</span>
              </div>
              <div style={{height:4,borderRadius:99,background:"rgba(var(--cli-rgb),.1)",overflow:"hidden",marginBottom:26}}><div style={{width:(rs.i/rs.fila.length*100)+"%",height:"100%",background:T.ink,transition:"width .3s"}}/></div>
              <div style={{...serif,fontSize:isMobile?26:34,lineHeight:1.3,wordBreak:"break-word",whiteSpace:"pre-wrap"}}>{curK.frente}</div>
              {rs.show?(<>
                <div style={{fontSize:isMobile?16:18,lineHeight:1.6,marginTop:22,padding:"16px 18px",borderRadius:16,background:"rgba(224,122,95,.12)",textAlign:"left",whiteSpace:"pre-wrap"}}>{curK.verso}</div>
                <div style={{display:"flex",justifyContent:"center",gap:12,marginTop:26}}>
                  <button style={{...btnS,minWidth:130,borderColor:"#A83232",color:"#A83232"}} onClick={()=>responder(false)}>Errei</button>
                  <button style={{...btnP,minWidth:130}} onClick={()=>responder(true)}>Acertei</button>
                </div>
              </>):<div style={{marginTop:32}}><button style={btnP} onClick={()=>setRs({...rs,show:true})}>Mostrar resposta</button></div>}
            </>):null}
            {!rs.fim&&<div style={{marginTop:22}}><button onClick={()=>setRs(null)} style={{background:"none",border:"none",cursor:"pointer",fontSize:12,textDecoration:"underline",textUnderlineOffset:3,color:"rgba(var(--cli-rgb),.55)"}}>sair da revisão</button></div>}
          </Card>
        ):(<>
          <Card>
            <Titulo k="Repetição espaçada" t="Revisar" dir={<div style={{textAlign:"right"}}><div style={lab}>acerto</div><div style={{...serif,fontSize:isMobile?30:38,marginTop:4,color:CLI_ACC}}>{acertoTot===null?"—":acertoTot+"%"}</div></div>}/>
            <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
              <button style={{...btnP,opacity:totHoje?1:.4}} disabled={!totHoje} onClick={()=>iniciarRev()}>{totHoje?`Revisar ${due.length}${novasLib.length?` + ${novasLib.length} ${novasLib.length===1?"novo":"novos"}`:""}`:"Nada para hoje"}</button>
              {due.length>0&&<button style={btnS} onClick={()=>iniciarRev(true)}>Modo 5 min</button>}
            </div>
            <div style={{marginTop:16,fontSize:12.5,lineHeight:1.6,opacity:.8}}>
              Novos hoje: <b>{novasFeitas}</b> de {limiteHoje}{novasTodas.length>0?` · ${novasTodas.length} na fila`:""}
              {bloqueioNov&&<div style={{color:"#A83232",fontWeight:600}}>{bloqueioNov}</div>}
              <div style={{marginTop:6}}>{novosEd
                ?<span style={{display:"inline-flex",gap:8,alignItems:"center"}}>Novos por dia <input style={{...inp,width:70,padding:"6px 10px"}} type="number" min="0" value={cfgM.novosDia} onChange={e=>setCfgM({...cfgM,novosDia:e.target.value===""?"":Math.max(0,+e.target.value)})}/><button style={{...btnS,padding:"6px 12px",fontSize:12}} onClick={()=>setNovosEd(false)}>ok</button></span>
                :<button onClick={()=>setNovosEd(true)} style={{background:"none",border:"none",padding:0,cursor:"pointer",textDecoration:"underline",textUnderlineOffset:3,fontSize:12.5,color:T.ink}}>ajustar limite diário</button>}</div>
            </div>
            <div style={{...lab,marginTop:12}}>{cards.length} cartões no total</div>
          </Card>
          <Card>
            <Titulo k="Novo" t="Criar cartão"/>
            <div style={{...lab,marginBottom:6}}>Frente (pergunta)</div><input style={inp} value={fk.frente} onChange={e=>setFk({...fk,frente:e.target.value})} placeholder="Ex: Quando suspeitar de…?"/>
            <div style={{...lab,margin:"12px 0 6px"}}>Verso (resposta)</div><textarea style={{...inp,minHeight:70,resize:"vertical",lineHeight:1.5}} value={fk.verso} onChange={e=>setFk({...fk,verso:e.target.value})}/>
            <div style={{...lab,margin:"12px 0 8px"}}>Área</div>
            <div className="cli-row">{CLI_AREAS.map(a=><button key={a} style={pill(fk.area===a)} onClick={()=>setFk({...fk,area:a})}>{a}</button>)}</div>
            <div style={{marginTop:16}}><button style={{...btnP,opacity:fk.frente.trim()&&fk.verso.trim()?1:.4}} disabled={!(fk.frente.trim()&&fk.verso.trim())} onClick={addCardManual}>Criar cartão</button></div>
            <div style={{fontSize:12,opacity:.6,marginTop:12}}>Dica: o jeito mais rápido é registrar o caso e tocar em “Virar cartão” no ponto-chave.</div>
          </Card>
          {cards.length>0&&<Card>
            <Titulo k="Banco" t="Seus cartões"/>
            {cards.slice(0,25).map((k,n)=>(
              <div key={k.id} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 0",borderTop:n===0?"none":"1px solid rgba(var(--cli-rgb),.08)"}}>
                <div style={{flex:1,minWidth:0}}><div style={{fontSize:14,fontWeight:600,lineHeight:1.4}}>{k.frente}</div><div style={{...lab,fontSize:9.5,marginTop:4}}>{k.area}{isNova(k)?" · novo":""}</div></div>
                <div style={{display:"flex",gap:3}} title={"nível "+(k.box||0)+" de 5"}>{[0,1,2,3,4].map(i=><i key={i} style={{width:6,height:6,borderRadius:"50%",background:i<(k.box||0)?T.ink:"rgba(var(--cli-rgb),.15)"}}/>)}</div>
                <button onClick={()=>setCards(cards.filter(x=>x.id!==k.id))} aria-label="remover" style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:"rgba(var(--cli-rgb),.35)"}}>×</button>
              </div>))}
            {cards.length>25&&<div style={{...lab,marginTop:10}}>+ {cards.length-25} cartões</div>}
          </Card>}
        </>)}
      </>)}

      {sub==="cond"&&(<>
        {pe?(
          <Card>
            <Titulo k={pe.id?"Editando":"Nova"} t={pe.id?"Editar ficha":"Ficha de conduta"}/>
            <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 200px",gap:12}}>
              <div><div style={{...lab,marginBottom:6}}>Título</div><input style={inp} value={pe.titulo} onChange={e=>setPe({...pe,titulo:e.target.value})} placeholder="Ex: Dor torácica no pronto atendimento"/></div>
              <div><div style={{...lab,marginBottom:6}}>Área</div><select style={inp} value={pe.area} onChange={e=>setPe({...pe,area:e.target.value})}>{CLI_AREAS.map(a=><option key={a}>{a}</option>)}</select></div>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",margin:"16px 0 6px"}}><div style={lab}>Conteúdo</div><button style={{...btnS,padding:"6px 12px",fontSize:11.5}} onClick={()=>setPe({...pe,texto:pe.texto.trim()?pe.texto+"\n\n"+CLI_MODELO:CLI_MODELO})}>inserir modelo de seções</button></div>
            <textarea style={{...inp,minHeight:260,resize:"vertical",lineHeight:1.6,fontFamily:"'DM Mono',ui-monospace,monospace",fontSize:13}} value={pe.texto} onChange={e=>setPe({...pe,texto:e.target.value})} placeholder={"# Seção\nitem do checklist\nOutro item"}/>
            <div style={{fontSize:12,opacity:.6,marginTop:8,lineHeight:1.5}}>Linhas com <b>#</b> viram títulos de seção; as demais viram itens que você marca à beira do leito. Escreva conforme o protocolo do seu serviço: o app não traz conteúdo clínico pronto.</div>
            <div style={{display:"flex",gap:10,marginTop:16}}><button style={{...btnP,opacity:pe.titulo.trim()?1:.4}} disabled={!pe.titulo.trim()} onClick={salvarProt}>Salvar ficha</button><button style={btnS} onClick={()=>setPe(null)}>Cancelar</button></div>
          </Card>
        ):protAb?(
          <Card>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,marginBottom:6}}>
              <button onClick={()=>setPAberta(null)} style={{background:"none",border:"none",padding:0,cursor:"pointer",...lab,textDecoration:"underline",textUnderlineOffset:3}}>← fichas</button>
              <Chip>{protAb.area}</Chip>
            </div>
            <div style={{...serif,fontSize:isMobile?28:36,lineHeight:1.1,marginBottom:6}}>{protAb.titulo}</div>
            <div style={{...lab,fontSize:9.5,marginBottom:18}}>atualizada em {fmtData(protAb.atualizada)}</div>
            {linhasProt(protAb).length===0?<Vazio>Ficha vazia. Toque em editar para escrever.</Vazio>:linhasProt(protAb).map(x=>x.h
              ?<div key={x.i} style={{...lab,color:T.ink,fontWeight:700,margin:"18px 0 8px",paddingBottom:6,borderBottom:"2px solid "+CLI_ACC,display:"inline-block"}}>{x.t}</div>
              :<label key={x.i} style={{display:"flex",gap:12,alignItems:"flex-start",padding:"8px 0",cursor:"pointer",fontSize:15,lineHeight:1.5,textDecoration:marcas[protAb.id+":"+x.i]?"line-through":"none",opacity:marcas[protAb.id+":"+x.i]?.5:1}}>
                <input type="checkbox" checked={!!marcas[protAb.id+":"+x.i]} onChange={e=>setMarcas({...marcas,[protAb.id+":"+x.i]:e.target.checked})} style={{width:20,height:20,marginTop:2,flexShrink:0,accentColor:T.ink}}/><span>{x.t}</span></label>)}
            <div style={{display:"flex",gap:8,marginTop:22,flexWrap:"wrap"}}>
              <button style={btnP} onClick={()=>setPe({id:protAb.id,titulo:protAb.titulo,area:protAb.area,texto:protAb.texto||""})}>Editar</button>
              <button style={btnS} onClick={()=>setMarcas(Object.fromEntries(Object.entries(marcas).filter(([k])=>!k.startsWith(protAb.id+":"))))}>Limpar marcas</button>
              <button style={{...btnS,borderColor:"rgba(168,50,50,.4)",color:"#A83232"}} onClick={()=>{if(window.confirm("Excluir esta ficha?")){setProt(prot.filter(x=>x.id!==protAb.id));setPAberta(null);}}}>Excluir</button>
            </div>
          </Card>
        ):(<>
          <Card>
            <Titulo k="Fichas de bolso" t="Condutas" dir={<button style={{...btnP,padding:"9px 16px",fontSize:12}} onClick={()=>setPe({titulo:"",area:"Cardio",texto:""})}>Nova ficha</button>}/>
            {prot.length===0?<Vazio>Crie fichas por queixa (dor torácica, sepse, AVC…) com o checklist do seu serviço. Na hora do plantão, abra e vá marcando.</Vazio>:(<>
              <input style={{...inp,marginBottom:10}} value={pq} onChange={e=>setPq(e.target.value)} placeholder="Buscar ficha…"/>
              {protFilt.map((p,n)=>(
                <div key={p.id} onClick={()=>setPAberta(p.id)} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 0",borderTop:n===0?"none":"1px solid rgba(var(--cli-rgb),.08)",cursor:"pointer"}}>
                  <div style={{flex:1,minWidth:0}}><div style={{fontSize:15.5,fontWeight:600}}>{p.titulo}</div><div style={{...lab,fontSize:9.5,marginTop:4}}>{p.area} · {linhasProt(p).filter(x=>!x.h).length} itens</div></div>
                  <span style={{fontSize:18,opacity:.35}}>›</span>
                </div>))}
              {protFilt.length===0&&<Vazio>Nada encontrado.</Vazio>}
            </>)}
          </Card>
        </>)}
      </>)}

      </div></div>
      {toast&&<div role="status" style={{position:"fixed",left:"50%",transform:"translateX(-50%)",bottom:20,zIndex:61,background:T.ink,color:T.sheet,borderRadius:999,padding:"11px 20px",fontSize:13,fontWeight:600,boxShadow:"0 14px 34px -10px rgba(0,0,0,.5)",maxWidth:"calc(100% - 32px)",textAlign:"center"}}>{toast}</div>}
    </div>
  );
}

function IdiomasApp({userId,isMobile,onMenu,onTrocar}){
  const [cfg,setCfg]=useLS("v5_idi_cfg",IDI_LANGS,userId);
  const [log,setLog]=useLS("v5_idi_log",[],userId);
  const [vocab,setVocab]=useLS("v5_idi_voc",[],userId);
  const [rv,setRv]=useLS("v5_idi_rv",{},userId);
  const [aval,setAval]=useLS("v5_idi_aval",[],userId);
  const [marcos,setMarcos]=useLS("v5_idi_marcos",[],userId);
  const [sbst,setSbst]=useLS("v5_idi_sub",{},userId);
  const [ds,setDs]=useState(null);
  const [dicaEd,setDicaEd]=useState(null);
  const [dicaTxt,setDicaTxt]=useState("");
  const [bancoBusca,setBancoBusca]=useState("");
  const [verBanco,setVerBanco]=useState(false);
  const [lang,setLang]=useLS("v5_idi_lang","de",userId);
  const sel=cfg.some(l=>l.id===lang)?lang:(cfg[0]?cfg[0].id:"de");
  const setSel=setLang;
  const T=IDI_TEMAS[sel]||IDI_TEMAS.de;
  const [sub,setSub]=useState("hoje");
  const [editL,setEditL]=useState(null);
  const [fL,setFL]=useState(null);
  const [fp,setFp]=useState({lang:"",tipo:"ouvir",min:"",nota:"",data:""});
  const [fw,setFw]=useState({lang:"",termo:"",trad:"",ex:"",art:"",plural:"",tipo:"palavra",minha:"",tema:"",vars:""});
  const [plt]=useLS("v4_plt",[],userId);
  const [ii,setIi]=useLS("v5_idi_ii",{},userId);
  const [iiEd,setIiEd]=useState(null);
  const [fcN,setFcN]=useState(null);
  const [gstat,setGstat]=useLS("v5_idi_gram",{areas:{},items:{}},userId);
  const [gm,setGm]=useState(null);
  const [conh,setConh]=useLS("v5_idi_conh",{},userId);
  const [leit,setLeit]=useLS("v5_idi_leit",[],userId);
  const [lts,setLts]=useState({});
  const [lw,setLw]=useState(null);
  const [midia,setMidia]=useLS("v5_idi_midia",[],userId);
  const [mfo,setMfo]=useState({tipo:"serie",titulo:""});
  const [mfonte,setMfonte]=useState("");
  const [ms,setMs]=useState({min:"",comp:70});
  const [mm,setMm]=useState({frase:"",lacuna:"",trad:"",tempo:""});
  const [pl,setPl]=useState(null);
  const [plT,setPlT]=useState(0);
  const [plA,setPlA]=useState(null);
  const [plB,setPlB]=useState(null);
  const [plLoop,setPlLoop]=useState(false);
  const [plV,setPlV]=useState(1);
  const plRef=useRef(null);
  const [lf,setLf]=useState({trad:"",art:""});
  const [mt,setMt]=useState("");
  const [busca,setBusca]=useState("");
  const [verTodas,setVerTodas]=useState(false);
  const [rs,setRs]=useState(null);
  const [avN,setAvN]=useState({ouvir:3,falar:3,ler:3,escrever:3,gramatica:3,vocab:3});
  const [fm,setFm]=useState({titulo:"",data:""});
  const [cron,setCron]=useLS("v5_idi_cron",null,userId);
  const [metaC,setMetaC]=useState(0);
  const [toast,setToast]=useState("");
  const [,setTick]=useState(0);
  const cronRodando=!!(cron&&cron.ini);
  useEffect(()=>{
    if(!cronRodando)return;
    const t=setInterval(()=>setTick(x=>x+1),1000);
    return()=>clearInterval(t);
  },[cronRodando]);
  useEffect(()=>{
    if(!toast)return;
    const t=setTimeout(()=>setToast(""),3500);
    return()=>clearTimeout(t);
  },[toast]);

  const hoje=today();
  const L=id=>cfg.find(l=>l.id===id)||{id,nome:id,cod:String(id).toUpperCase(),cor:"#999"};
  const inSel=id=>sel===id;
  const ativas=cfg.filter(l=>l.id===sel);
  const defLang=sel;
  const iniSemD=new Date(hoje+"T12:00:00"); iniSemD.setDate(iniSemD.getDate()-iniSemD.getDay());
  const iniSem=iniSemD.toISOString().slice(0,10);
  const logSel=log.filter(s=>inSel(s.lang));
  const minSem=logSel.filter(s=>s.data>=iniSem).reduce((a,s)=>a+(+s.min||0),0);
  const hSem=minSem/60;
  const metaTot=ativas.reduce((a,l)=>a+(+l.metaSem||0),0);
  const vocSel=vocab.filter(v=>inSel(v.lang));
  const isNova=v=>!v.vista&&!((v.ok||0)+(v.er||0));
  const due=vocSel.filter(v=>!isNova(v)&&v.prox<=hoje).sort((a,b)=>a.prox.localeCompare(b.prox));
  const novasTodas=vocSel.filter(isNova).sort((a,b)=>(a.criada||"").localeCompare(b.criada||""));
  const cfgL=L(sel);
  const baseNov=(cfgL.novosDia!==undefined&&cfgL.novosDia!==null&&cfgL.novosDia!==""&&Number.isFinite(+cfgL.novosDia))?+cfgL.novosDia:(sel==="de"?10:6);
  const hhmm=t=>{const m=/^(\d{1,2}):(\d{2})/.exec(t||"");return m?(+m[1])*60+(+m[2]):null;};
  const plNoturno=q=>{const a=hhmm(q.horaInicio),b=hhmm(q.horaFim);if(a!==null&&b!==null)return b<=a||a>=18*60||(b-a)>=24*60;return (+q.horas||0)>=12;};
  const posPlantao=plt.some(q=>q.data===addDays(hoje,-1)&&plNoturno(q));
  const plt4=plt.filter(q=>q.data>=addDays(hoje,-3)&&q.data<=hoje).length;
  const bloqueioNov=posPlantao?"Pós-plantão: hoje só revisões":(due.length>30?`Dívida alta (${due.length} atrasadas): zere antes de liberar novas`:"");
  const limiteHoje=bloqueioNov?0:(plt4>=2?Math.floor(baseNov/2):baseNov);
  const novasFeitas=vocSel.filter(v=>v.vista===hoje).length;
  const novasLib=(()=>{
    const q=Math.max(0,limiteHoje-novasFeitas); const cont={};
    vocSel.filter(v=>v.vista===hoje).forEach(v=>{const t=(v.tema||"").trim().toLowerCase();if(t)cont[t]=(cont[t]||0)+1;});
    const out=[];
    for(const v of novasTodas){
      if(out.length>=q)break;
      const t=(v.tema||"").trim().toLowerCase();
      if(t){if((cont[t]||0)>=2)continue;cont[t]=(cont[t]||0)+1;}
      out.push(v);
    }
    return out;
  })();
  const totHoje=due.length+novasLib.length;
  const baseCarga=Array.from({length:7},(_,i)=>vocSel.filter(v=>!isNova(v)&&v.prox===addDays(hoje,i+1)).length);
  const projNovas=n=>Array.from({length:7},(_,i)=>i===0?n:(i===3?Math.round(n*0.9):0));
  const nFc=fcN===null?Math.max(limiteHoje,0)||baseNov:fcN;
  const cargaFc=baseCarga.map((b,i)=>b+projNovas(nFc)[i]);
  const totFc=cargaFc.reduce((a,b)=>a+b,0), totBase=baseCarga.reduce((a,b)=>a+b,0);
  const maxFc=Math.max(1,...cargaFc);
  const semAcento=t=>t.normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  const normR=t=>t.trim().toLowerCase().replace(/\s+/g," ").replace(/[.!?,;]+$/,"");
  const confTexto=(r,esp,lg)=>{
    const a=normR(r), b=normR(esp);
    if(!a)return "er"; if(a===b)return "ok";
    if(semAcento(a)===semAcento(b))return "quase";
    if(lg==="de"){const f=t=>semAcento(t.replace(/ß/g,"ss")).replace(/ae/g,"a").replace(/oe/g,"o").replace(/ue/g,"u");if(f(a)===f(b))return "quase";}
    return "er";
  };
  const confNome=(r,w)=>{
    const m=normR(r).match(/^(der|die|das|le|la|les|l['’])\s*(.+)$/);
    if(!m)return {r:"er",msg:"Faltou o artigo."};
    const at=m[1].replace("’","'"); const frOk=w.lang==="fr"&&vogal(w.termo)&&at==="l'";
    const rr=confTexto(m[2],w.termo,w.lang);
    if(rr==="er")return {r:"er",msg:""};
    if(!(at===w.art||frOk))return {r:"er",msg:"Palavra certa, artigo errado."};
    return {r:rr,msg:rr==="quase"?"Atenção à grafia.":""};
  };
  const temCloze=t=>/\[\[[^\]]+\]\]/.test(t||"");
  const clozeResp=t=>{const m=/\[\[([^\]]+)\]\]/.exec(t||"");return m?m[1]:"";};
  const clozeVer=(t,rev)=>(t||"").split(/(\[\[[^\]]+\]\])/).map((q,i)=>/^\[\[/.test(q)?(rev?<b key={i} style={{color:T.ink,borderBottom:"2px solid "+T.acc}}>{q.slice(2,-2)}</b>:<span key={i} style={{display:"inline-block",minWidth:64,borderBottom:"2px solid "+T.ink,margin:"0 3px"}}>&nbsp;</span>):<span key={i}>{q}</span>);
  const modoCard=w=>{
    if(w.tipo==="chunk")return (w.vars||[]).length?"chunk":"rec";
    const b=w.box||0;
    if(temCloze(w.ex)&&b>=1&&(((w.ok||0)+(w.er||0))%2===1))return "cloze";
    if(b>=2)return "prod";
    return "rec";
  };
  const dominadas=vocSel.filter(v=>(v.box||0)>=4).length;
  const ativos=new Set([...logSel.map(s=>s.data),...Object.entries(rv).filter(([d,o])=>ativas.some(l=>(o[l.id]&&(o[l.id].ok+o[l.id].er)>0)||(o[l.id+"g"]&&(o[l.id+"g"].ok+o[l.id+"g"].er)>0))).map(([d])=>d)]);
  let streak=0, folgaRec=false;
  {
    const ativoMin=[...ativos].sort()[0]||hoje; let dd=ativos.has(hoje)?hoje:addDays(hoje,-1), ultFolga=null, guard=0;
    while(dd>=ativoMin&&guard++<900){
      if(ativos.has(dd)){streak++;}
      else if(ultFolga===null||addDays(dd,7)<=ultFolga){ultFolga=dd;if(dd>=addDays(hoje,-6))folgaRec=true;}
      else break;
      dd=addDays(dd,-1);
    }
  }
  const semana=Array.from({length:7},(_,i)=>{const ds=addDays(iniSem,i);const min=logSel.filter(s=>s.data===ds).reduce((a,s)=>a+(+s.min||0),0);return {ds,min,ativo:ativos.has(ds),ehHoje:ds===hoje,lbl:["D","S","T","Q","Q","S","S"][i]};});
  const diasAte=p=>p?Math.ceil((new Date(p+"T12:00:00")-new Date(hoje+"T12:00:00"))/86400000):null;
  const unica=L(sel);
  const dProva=unica?diasAte(unica.prova):null;
  const okTot=Object.values(rv).reduce((a,o)=>a+ativas.reduce((b,l)=>b+((o[l.id]||{}).ok||0),0),0);
  const erTot=Object.values(rv).reduce((a,o)=>a+ativas.reduce((b,l)=>b+((o[l.id]||{}).er||0),0),0);
  const acertoV=okTot+erTot>0?Math.round(okTot/(okTot+erTot)*100):null;

  const addPratica=()=>{
    const min=+fp.min; const lang=defLang;
    if(!(min>0)||!lang)return;
    setLog([{id:uid(),lang,tipo:fp.tipo,min,nota:fp.nota.trim(),data:fp.data||hoje},...log]);
    setFp({...fp,min:"",nota:""});
  };
  const addPalavra=()=>{
    const lang=defLang; let termo=fw.termo.trim(); const trad=fw.trad.trim();
    if(!termo||!trad||!lang)return;
    const chunk=fw.tipo==="chunk";
    const extra={};
    if(fw.tema.trim())extra.tema=fw.tema.trim();
    if(fw.minha.trim())extra.minha=fw.minha.trim();
    let ex=fw.ex.trim(), art="", pl="";
    if(chunk){
      const vars=fw.vars.split(/[,\n;]/).map(x=>x.trim()).filter(Boolean).map(x=>{const k=x.indexOf("=");return k<0?{d:"",r:x}:{d:x.slice(0,k).trim(),r:x.slice(k+1).trim()};}).filter(x=>x.r);
      extra.tipo="chunk"; extra.vars=vars;
    }else{
      art=fw.art||"";
      const m=termo.match(GEN[lang].parse);
      if(m){art=m[1].toLowerCase();termo=m[2];}
      pl=(fw.plural||"").trim().replace(new RegExp("^"+GEN[lang].plArt+"\\s+","i"),"");
      if(ex&&!temCloze(ex)){
        const i=ex.toLowerCase().indexOf(termo.toLowerCase());
        if(i>=0)ex=ex.slice(0,i)+"[["+ex.slice(i,i+termo.length)+"]]"+ex.slice(i+termo.length);
      }
    }
    setVocab([{id:uid(),lang,termo,trad,ex,criada:hoje,box:0,prox:hoje,ok:0,er:0,...extra,...(art?{art,plural:pl}:{})},...vocab]);
    setFw({...fw,termo:"",trad:"",ex:"",art:"",plural:"",minha:"",vars:""});
  };
  // ── Substantivos (artigos e plurais) ──
  const G=GEN[sel]||GEN.de;
  const ARTS=G.arts;
  const meusN=vocab.filter(v=>v.lang===sel&&v.art).map(v=>({k:`${sel}:${v.art}:${v.termo.toLowerCase()}`,art:v.art,termo:v.termo,plural:v.plural||"",trad:v.trad,dica:"",bank:false}));
  const chavesMeus=new Set(meusN.map(n=>n.k));
  const poolAll=[...meusN,...G.banco.filter(n=>!chavesMeus.has(n.k))];
  const mapN=new Map(poolAll.map(n=>[n.k,n]));
  const dicaDe=n=>(sbst[n.k]&&sbst[n.k].dica)||n.dica||"";
  const iniciarDrill=modo=>{
    const pool=modo==="plural"?poolAll.filter(n=>n.plural):poolAll;
    const pr=n=>{const x=sbst[modo==="plural"?n.k+"|p":n.k]||{ok:0,er:0};return x.er*2-x.ok*0.6+Math.random()*2.5;};
    const fila=[...pool].sort((a,b)=>pr(b)-pr(a)).slice(0,10);
    if(!fila.length)return;
    setDicaEd(null);
    setDs({modo,fila,i:0,resp:null,ok:0,er:0,rep:{},fim:false,pin:"",hint:false});
  };
  const gravarStat=(n,ok,modo)=>{
    const key=modo==="plural"?n.k+"|p":n.k;
    const x=sbst[key]||{ok:0,er:0};
    const y=sbst[n.k+"|s"]||{ok:0,er:0};
    const novo={...sbst,[key]:{...x,ok:x.ok+(ok.a?1:0),er:x.er+(ok.a?0:1),ult:hoje}};
    if(modo==="art")novo[n.k+"|s"]={...y,ok:y.ok+(ok.w?1:0),er:y.er+(ok.w?0:1),ult:hoje};
    setSbst(novo);
    const todo=ok.a&&ok.w;
    const dia=rv[hoje]||{}; const c=dia[sel]||{ok:0,er:0};
    setRv({...rv,[hoje]:{...dia,[sel]:{ok:c.ok+(todo?1:0),er:c.er+(todo?0:1)}}});
  };
  const normT=x=>(x||"").trim().replace(/\s+/g," ");
  const conferirArt=()=>{
    if(!ds||ds.resp||ds.fim)return; const n=ds.fila[ds.i];
    const txt=normT(ds.pin);
    const reArt=new RegExp("^("+ARTS.join("|")+")\\s+(.+)$","i");
    let a=null,w=txt; const m1=txt.match(reArt);
    if(m1){a=m1[1].toLowerCase();w=m1[2].trim();}
    else{const m2=txt.match(/^l['’]\s*(.+)$/i);if(m2){w=m2[1].trim();}}
    const artOk=a===n.art, nounOk=w.toLowerCase()===n.termo.toLowerCase();
    const cap=sel==="de"&&nounOk&&w[0]!==w[0].toUpperCase();
    gravarStat(n,{a:artOk,w:nounOk},"art");
    setDs({...ds,resp:{txt,a,w,artOk,nounOk,cap,ok:artOk&&nounOk}});
  };
  const respPlural=()=>{
    if(!ds||ds.resp||ds.fim)return; const n=ds.fila[ds.i];
    const norm=x=>(x||"").trim().toLowerCase().replace(new RegExp("^"+G.plArt+"\\s+"),"");
    const ok=norm(ds.pin)===n.plural.toLowerCase();
    gravarStat(n,{a:ok,w:ok},"plural"); setDs({...ds,resp:{txt:ds.pin,ok}});
  };
  const proxDrill=()=>{
    if(!ds||!ds.resp)return; const n=ds.fila[ds.i]; const r=ds.resp;
    const fila=(!r.ok&&!ds.rep[n.k])?[...ds.fila,n]:ds.fila; const p=ds.i+1;
    setDs({...ds,fila,i:p,resp:null,pin:"",hint:false,ok:ds.ok+(r.ok?1:0),er:ds.er+(r.ok?0:1),rep:r.ok?ds.rep:{...ds.rep,[n.k]:1},fim:p>=fila.length});
    setDicaEd(null);
  };
  const salvarDica=(k,txt)=>{const x=sbst[k]||{ok:0,er:0};setSbst({...sbst,[k]:{...x,dica:txt.trim()}});setDicaEd(null);setDicaTxt("");};
  const addBanco=n=>{
    if(chavesMeus.has(n.k))return;
    setVocab([{id:uid(),lang:sel,termo:n.termo,art:n.art,plural:n.plural,trad:n.trad,ex:"",criada:hoje,box:0,prox:hoje,ok:0,er:0},...vocab]);
  };
  const statsArt={}; ARTS.forEach(a=>{statsArt[a]={ok:0,er:0};});
  Object.entries(sbst).forEach(([k,x])=>{if(k.includes("|"))return;const n=mapN.get(k);if(!n||!statsArt[n.art])return;statsArt[n.art].ok+=x.ok||0;statsArt[n.art].er+=x.er||0;});
  const totArtOk=ARTS.reduce((t,a)=>t+statsArt[a].ok,0), totArtEr=ARTS.reduce((t,a)=>t+statsArt[a].er,0);
  const pctArt=a=>{const t=statsArt[a].ok+statsArt[a].er;return t?Math.round(statsArt[a].ok/t*100):null;};
  const piorArt=ARTS.filter(a=>statsArt[a].ok+statsArt[a].er>=3).sort((a,b)=>pctArt(a)-pctArt(b))[0];
  const dificeis=Object.entries(sbst).filter(([k,x])=>!k.includes("|")&&(x.er||0)>0&&mapN.get(k)).sort((a,b)=>(b[1].er-a[1].er)||((a[1].ok||0)-(b[1].ok||0))).slice(0,8).map(([k,x])=>({n:mapN.get(k),x}));
  // ── Gramática mista ──
  const gAreas=GRAM_AREAS[sel]||[];
  const gItens=GRAM_ITENS.filter(x=>x.lang===sel);
  const gA=a=>((gstat.areas||{})[sel+":"+a])||{ok:0,aut:0,er:0};
  const gTot=a=>{const x=gA(a);return x.ok+x.aut+x.er;};
  const gPct=a=>{const x=gA(a),t=gTot(a);return t?Math.round((x.ok+x.aut*.5)/t*100):null;};
  const dificG=gAreas.map(([k,nome])=>{const x=gA(k),t=gTot(k);return {k,nome,t,pct:gPct(k),falha:t?(x.er+x.aut*.5)/t:0};}).filter(x=>x.t>=3&&x.falha>=.25).sort((a,b)=>b.falha-a.falha);
  const leeches=vocSel.filter(v=>(v.er||0)>=3&&(v.er||0)*2>=(v.ok||0)).sort((a,b)=>(b.er||0)-(a.er||0)).slice(0,6);
  const artFraco=piorArt&&pctArt(piorArt)<85?piorArt:null;
  const nDif=dificG.length+(artFraco?1:0)+Math.min(dificeis.length,4)+leeches.length;
  const iniciarGram=af=>{
    const stI=gstat.items||{};
    const q={};
    gItens.filter(x=>!af||x.area===af).forEach(x=>{
      const st=stI[x.id];
      const base=!st?2:((st.er||0)+(st.aut||0)*.5>(st.ok||0)?3:1);
      (q[x.area]=q[x.area]||[]).push({x,k:base+Math.random()*1.5});
    });
    Object.values(q).forEach(a=>a.sort((u,v)=>v.k-u.k));
    const ord=Object.keys(q).sort(()=>Math.random()-.5);
    const N=af?8:10; const fila=[];
    while(fila.length<N&&ord.some(a=>q[a].length)){
      for(const a of ord){if(fila.length>=N)break;const it=q[a].shift();if(it)fila.push(it.x.id);}
    }
    if(!fila.length)return;
    setGm({fila,i:0,tent:0,resp:"",fb:null,dica:false,ok:0,aut:0,er:0,rep:{},fim:false,af:af||null});
  };
  const gCur=gm&&!gm.fim?GRAM_ITENS.find(x=>x.id===gm.fila[gm.i]):null;
  const gGravar=res=>{
    if(!gCur)return;
    const k=sel+":"+gCur.area; const a=gA(gCur.area); const it=(gstat.items||{})[gCur.id]||{ok:0,aut:0,er:0};
    setGstat({areas:{...(gstat.areas||{}),[k]:{...a,[res]:(a[res]||0)+1}},items:{...(gstat.items||{}),[gCur.id]:{...it,[res]:(it[res]||0)+1,ult:hoje}}});
    const dia=rv[hoje]||{}; const c=dia[sel+"g"]||{ok:0,er:0};
    setRv({...rv,[hoje]:{...dia,[sel+"g"]:{ok:c.ok+(res==="er"?0:1),er:c.er+(res==="er"?1:0)}}});
  };
  const gVerificar=()=>{
    if(!gm||!gCur||gm.fb||!gm.resp.trim())return;
    const r=gCur.r.map(a=>confTexto(gm.resp,a,sel)).reduce((m,c)=>c==="ok"?"ok":(c==="quase"&&m!=="ok"?"quase":m),"er");
    if(r!=="er"){const tipo=gm.tent===0?"ok":"aut";gGravar(tipo);setGm({...gm,fb:{tipo,quase:r==="quase"}});return;}
    if(gm.tent===0){setGm({...gm,tent:1,dica:true});return;}
    gGravar("er");setGm({...gm,fb:{tipo:"er"}});
  };
  const gMostrar=()=>{ if(!gm||!gCur||gm.fb)return; gGravar("er"); setGm({...gm,fb:{tipo:"er",skip:true}}); };
  const gProx=()=>{
    if(!gm||!gm.fb)return;
    const erro=gm.fb.tipo==="er"; const id=gm.fila[gm.i];
    const fila=(erro&&!gm.rep[id])?[...gm.fila,id]:gm.fila;
    const prox=gm.i+1;
    setGm({...gm,fila,rep:erro?{...gm.rep,[id]:1}:gm.rep,i:prox,tent:0,resp:"",fb:null,dica:false,ok:gm.ok+(gm.fb.tipo==="ok"?1:0),aut:gm.aut+(gm.fb.tipo==="aut"?1:0),er:gm.er+(erro?1:0),fim:prox>=fila.length});
  };
  const gFrase=(q,f,hl,fill)=>q.split("___").map((parte,i,arr)=>(
    <span key={i}>
      {(hl&&f&&parte.includes(f))?parte.split(f).flatMap((t,j,aa)=>j<aa.length-1?[t,<mark key={"m"+j} style={{background:"rgba(var(--idi-rgb),.14)",color:"inherit",borderBottom:"3px solid "+T.acc,padding:"0 2px",borderRadius:3}}>{f}</mark>]:[t]):parte}
      {i<arr.length-1&&(fill?<b style={{color:T.ink,borderBottom:"2px solid "+T.acc,margin:"0 3px"}}>{fill}</b>:<span style={{display:"inline-block",minWidth:70,borderBottom:"2px solid "+T.ink,margin:"0 4px"}}>&nbsp;</span>)}
    </span>));
  // ── Leitura ──
  const lt=lts[sel]||{titulo:"",texto:""};
  const setLt=v=>setLts({...lts,[sel]:v});
  const conhL=conh[sel]||[];
  const vocMapL=new Map();
  vocSel.forEach(v=>{tokenizarLeit(v.termo).forEach(t=>{const k=t.w.toLowerCase();const forte=(v.box||0)>=2;vocMapL.set(k,(vocMapL.get(k)==="k"||forte)?"k":"a");});});
  const funcSet=new Set(FUNC_PAL[sel]||[]); const conhSet=new Set(conhL);
  const stPal=w=>{const k=w.toLowerCase();if(k.length<2||funcSet.has(k)||conhSet.has(k)||vocMapL.get(k)==="k")return "k";if(vocMapL.get(k)==="a")return "a";return "n";};
  const toks=tokenizarLeit(lt.texto).map(t=>({...t,st:stPal(t.w)}));
  const nK=toks.filter(t=>t.st==="k").length, nA=toks.filter(t=>t.st==="a").length, nN=toks.filter(t=>t.st==="n").length;
  const cobPct=toks.length?Math.round(nK/toks.length*100):null;
  const novasTxt=(()=>{const m=new Map();toks.filter(t=>t.st==="n").forEach(t=>{const k=t.w.toLowerCase();const o=m.get(k)||{w:t.w,i:t.i,n:0};o.n++;m.set(k,o);});return [...m.values()].sort((a,b)=>b.n-a.n||a.w.length-b.w.length);})();
  const veredito=cobPct===null?"":cobPct>=98?"Muito fácil: ótimo para leitura extensiva e fluência.":cobPct>=95?"Faixa ideal (95 a 98%): você entende e ainda aprende palavras pelo contexto.":cobPct>=90?"Um pouco difícil: serve para estudo intensivo, mas cansa em volume.":"Difícil demais agora: vira decodificação. Escolha um texto mais fácil ou minere as palavras-chave antes.";
  const fraseLeit=idx=>{
    const tx=lt.texto; let a=idx; while(a>0&&!/[.!?…\n]/.test(tx[a-1]))a--; let b=idx; while(b<tx.length&&!/[.!?…\n]/.test(tx[b]))b++; if(b<tx.length&&tx[b]!=="\n")b++;
    while(a<idx&&/\s/.test(tx[a]))a++;
    return {ini:a,fim:b};
  };
  const abrirPal=t=>{const fr=fraseLeit(t.i);setLw({w:t.w,i:t.i,fr,st:t.st});setLf({trad:"",art:""});};
  const jaCartao=lw?vocSel.find(v=>tokenizarLeit(v.termo).some(x=>x.w.toLowerCase()===lw.w.toLowerCase())):null;
  const marcarConhecida=()=>{if(!lw)return;const k=lw.w.toLowerCase();if(!conhSet.has(k))setConh({...conh,[sel]:[...conhL,k]});setLw(null);};
  const desmarcarConhecida=()=>{if(!lw)return;const k=lw.w.toLowerCase();setConh({...conh,[sel]:conhL.filter(x=>x!==k)});setLw(null);};
  const criarCartaoLeit=()=>{
    if(!lw||!lf.trad.trim()||jaCartao)return;
    const tx=lt.texto; const {ini,fim}=lw.fr;
    const ex=(tx.slice(ini,lw.i)+"[["+lw.w+"]]"+tx.slice(lw.i+lw.w.length,fim)).replace(/\s+/g," ").trim();
    let termo=lw.w;
    if(sel==="fr")termo=termo.toLowerCase();
    else if(lf.art)termo=termo[0].toUpperCase()+termo.slice(1);
    else if(lw.i===ini)termo=termo.toLowerCase();
    setVocab([{id:uid(),lang:sel,termo,trad:lf.trad.trim(),ex,criada:hoje,box:0,prox:hoje,ok:0,er:0,fonte:lt.titulo.trim()||"leitura",...(lf.art?{art:lf.art,plural:""}:{})},...vocab]);
    setToast("Cartão criado com a frase do texto. Entra nas novas.");
    setLw(null);
  };
  const salvarTexto=()=>{
    if(!lt.texto.trim())return;
    setLeit([{id:uid(),lang:sel,titulo:lt.titulo.trim()||lt.texto.trim().slice(0,32)+"…",texto:lt.texto,data:hoje},...leit]);
    setToast("Texto salvo.");
  };
  // ── Escuta (podcasts, séries, filmes) ──
  const MID_TIPOS=[["podcast","Podcast"],["serie","Série"],["filme","Filme"],["youtube","YouTube"]];
  const midiaL=midia.filter(x=>x.lang===sel);
  const fonteAtual=midiaL.find(x=>x.id===mfonte)||midiaL[0]||null;
  const sessoesF=f=>log.filter(x=>x.lang===sel&&x.fonte===f.id);
  const minF=f=>sessoesF(f).reduce((a,x)=>a+(+x.min||0),0);
  const compF=f=>{const a=sessoesF(f).filter(x=>x.comp!==undefined).slice(0,5);return a.length?Math.round(a.reduce((t,x)=>t+x.comp,0)/a.length):null;};
  const minOuvirSem=logSel.filter(x=>x.tipo==="ouvir"&&x.data>=iniSem).reduce((a,x)=>a+(+x.min||0),0);
  const vereditoEscuta=c=>c>=90?"Muito fácil: ótimo para volume e relaxar o ouvido.":c>=70?"Faixa boa: você entende o fio e ainda captura palavras novas.":c>=50?"Puxado: ative legenda no idioma que está aprendendo e repita trechos.":"Difícil demais agora: escolha algo mais lento ou mais simples.";
  const addFonte=()=>{
    if(!mfo.titulo.trim())return;
    const n={id:uid(),lang:sel,tipo:mfo.tipo,titulo:mfo.titulo.trim(),criada:hoje};
    setMidia([n,...midia]); setMfonte(n.id); setMfo({...mfo,titulo:""});
  };
  const registrarEscuta=()=>{
    const min=+ms.min; if(!(min>0)||!fonteAtual)return;
    setLog([{id:uid(),lang:sel,tipo:"ouvir",min,nota:fonteAtual.titulo+" · "+ms.comp+"% entendido",data:hoje,fonte:fonteAtual.id,comp:+ms.comp},...log]);
    setMs({...ms,min:""}); setToast("Sessão de escuta registrada.");
  };
  const mmM=(()=>{const f=mm.frase,l=mm.lacuna.trim();if(!f.trim()||!l)return -1;return f.toLowerCase().indexOf(l.toLowerCase());})();
  const criarCartaoEscuta=()=>{
    if(mmM<0||!mm.trad.trim())return;
    const f=mm.frase.replace(/\s+/g," ").trim(); const l=mm.lacuna.trim();
    const k=f.toLowerCase().indexOf(l.toLowerCase()); if(k<0)return;
    const ex=f.slice(0,k)+"[["+f.slice(k,k+l.length)+"]]"+f.slice(k+l.length);
    const fonte=fonteAtual?fonteAtual.titulo:"escuta";
    setVocab([{id:uid(),lang:sel,termo:l,trad:mm.trad.trim(),ex,criada:hoje,box:0,prox:hoje,ok:0,er:0,fonte,...(mm.tempo.trim()?{tempo:mm.tempo.trim()}:{})},...vocab]);
    setMm({frase:"",lacuna:"",trad:"",tempo:""}); setToast("Cartão criado a partir do que você ouviu.");
  };
  const fmtMS=t=>{const x=Math.max(0,Math.floor(t));return Math.floor(x/60)+":"+String(x%60).padStart(2,"0");};
  const abrirArq=e=>{
    const f=e.target.files&&e.target.files[0]; if(!f)return;
    if(pl&&pl.url){try{URL.revokeObjectURL(pl.url);}catch{}}
    setPl({url:URL.createObjectURL(f),nome:f.name,video:/^video\//.test(f.type)}); setPlA(null); setPlB(null); setPlLoop(false); setPlT(0);
  };
  useEffect(()=>{
    if(!plLoop||plA===null||plB===null)return;
    const t=setInterval(()=>{const v=plRef.current;if(v&&!v.paused&&v.currentTime>=plB)v.currentTime=plA;},80);
    return()=>clearInterval(t);
  },[plLoop,plA,plB]);
  useEffect(()=>{if(plRef.current)plRef.current.playbackRate=plV;},[plV,pl]);
  const pillD={display:"inline-flex",alignItems:"center",gap:6,border:"1px solid rgba(var(--idi-rgb),.22)",background:"transparent",borderRadius:999,padding:"7px 13px",fontSize:12.5,fontWeight:600,color:T.ink,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"};
  const dsCur=ds&&!ds.fim?ds.fila[ds.i]:null;
  const vogal=t=>/^[aeiouyhàâäéèêëîïôöûùü]/i.test(t||"");
  const NomeN=({lang,art,termo})=>(lang==="fr"&&vogal(termo))
    ?<><span style={{color:ART_COR[art],fontWeight:700}}>l'</span>{termo}<small style={{opacity:.55,fontSize:"58%"}}> ({art==="la"?"f.":"m."})</small></>
    :<><span style={{color:ART_COR[art],fontWeight:700}}>{art}</span> {termo}</>;
  const Nome=({v})=>v.art?<NomeN lang={v.lang} art={v.art} termo={v.termo}/>:<>{v.termo}</>;
  const sugForm=G.sug(fw.termo);
  const bancoFiltrado=poolAll.filter(n=>!bancoBusca||(n.termo+" "+n.trad).toLowerCase().includes(bancoBusca.toLowerCase()));

  const iniciarRev=m5=>{
    const base=m5===true?due.slice(0,15):due;
    const novas=m5===true?[]:novasLib;
    const fila=[...base,...novas].map(v=>v.id);
    if(!fila.length)return;
    setRs({fila,i:0,show:false,ok:0,er:0,rep:{},fim:false,resp:"",res:null,m5:m5===true});
  };
  const responder=ok=>{
    if(!rs||rs.fim)return;
    setMt("");
    const id=rs.fila[rs.i]; const w=vocab.find(v=>v.id===id);
    if(!w){setRs({...rs,i:rs.i+1,show:false,resp:"",res:null,fim:rs.i+1>=rs.fila.length});return;}
    const b=w.box||0;
    setVocab(vocab.map(v=>v.id!==id?v:{...v,box:ok?Math.min(b+1,5):0,prox:ok?addDays(hoje,LEIT[Math.min(b,5)]):addDays(hoje,1),vista:v.vista||hoje,ok:(v.ok||0)+(ok?1:0),er:(v.er||0)+(ok?0:1)}));
    const dia=rv[hoje]||{}; const c=dia[w.lang]||{ok:0,er:0};
    setRv({...rv,[hoje]:{...dia,[w.lang]:{ok:c.ok+(ok?1:0),er:c.er+(ok?0:1)}}});
    const fila=(!ok&&!rs.rep[id])?[...rs.fila,id]:rs.fila;
    const prox=rs.i+1;
    setRs({...rs,fila,i:prox,show:false,resp:"",res:null,ok:rs.ok+(ok?1:0),er:rs.er+(ok?0:1),rep:ok?rs.rep:{...rs.rep,[id]:1},fim:prox>=fila.length});
  };
  const salvarMinha=(id,t)=>{ if(!t.trim())return; setVocab(vocab.map(v=>v.id!==id?v:{...v,minha:t.trim()})); };
  const abrirEdit=l=>{setFL({nivel:l.nivel,alvo:l.alvo,prova:l.prova||"",metaSem:l.metaSem,novosDia:(l.novosDia===undefined||l.novosDia===null)?"":l.novosDia});setEditL(l.id);};
  const salvarEdit=()=>{
    const l=L(editL);
    setCfg(cfg.map(x=>x.id!==editL?x:{...x,nivel:fL.nivel,alvo:fL.alvo,prova:fL.prova,metaSem:+fL.metaSem||0,novosDia:(fL.novosDia===""||fL.novosDia===undefined)?undefined:Math.max(0,+fL.novosDia||0)}));
    if(fL.nivel!==l.nivel)setMarcos([{id:uid(),lang:editL,data:hoje,titulo:"Nível "+fL.nivel,tipo:"nivel"},...marcos]);
    setEditL(null);
  };
  const subirNivel=l=>{
    const i=NIVEIS.indexOf(l.nivel); if(i<0||i>=NIVEIS.length-1)return;
    const n=NIVEIS[i+1];
    setCfg(cfg.map(x=>x.id!==l.id?x:{...x,nivel:n}));
    setMarcos([{id:uid(),lang:l.id,data:hoje,titulo:"Nível "+n+" atingido",tipo:"nivel"},...marcos]);
  };
  const avLangAtual=sel;
  const avsDe=id=>aval.filter(a=>a.lang===id).sort((a,b)=>b.data.localeCompare(a.data));
  const decorrido=cron?(cron.acc||0)+(cron.ini?Date.now()-cron.ini:0):0;
  const tipoNome=t=>(IDI_TIPOS.find(x=>x[0]===t)||[0,t])[1];
  const fmtT=ms=>{const t=Math.max(0,Math.floor(ms/1000));const h=Math.floor(t/3600),m=Math.floor(t%3600/60),x=t%60;return (h?h+":":"")+String(m).padStart(2,"0")+":"+String(x).padStart(2,"0");};
  const iniciarCron=()=>setCron({lang:sel,tipo:fp.tipo,acc:0,ini:Date.now(),meta:metaC});
  const pausarCron=()=>{if(cron)setCron({...cron,acc:decorrido,ini:null});};
  const retomarCron=()=>{if(cron)setCron({...cron,ini:Date.now()});};
  const finalizarCron=()=>{
    if(!cron)return;
    const ms=decorrido;
    if(ms<30000){setCron(null);setToast("Menos de 30 segundos: não salvei.");return;}
    const min=Math.max(1,Math.round(ms/60000));
    setLog([{id:uid(),lang:cron.lang,tipo:cron.tipo,min,nota:"cronômetro",data:hoje},...log]);
    setToast(`Salvo: ${min} min de ${L(cron.lang).nome} · ${tipoNome(cron.tipo)}`);
    setCron(null);
  };
  const descartarCron=()=>{if(window.confirm("Descartar este tempo sem salvar?"))setCron(null);};
  const trocarIdioma=id=>{
    if(id===sel)return;
    setSel(id);setRs(null);setDs(null);setDicaEd(null);setFw(f=>({...f,art:"",plural:""}));
    const u=avsDe(id)[0];setAvN(u?{...u.notas}:{ouvir:3,falar:3,ler:3,escrever:3,gramatica:3,vocab:3});
  };
  const salvarAval=()=>{if(!avLangAtual)return;setAval([{id:uid(),lang:avLangAtual,data:hoje,notas:{...avN}},...aval]);};
  const addMarco=()=>{const t=fm.titulo.trim();const lang=defLang;if(!t||!lang)return;setMarcos([{id:uid(),lang,data:fm.data||hoje,titulo:t,tipo:"outro"},...marcos]);setFm({...fm,titulo:""});};

  const lab={fontFamily:"'DM Mono',ui-monospace,monospace",fontSize:10,letterSpacing:".12em",textTransform:"uppercase",color:"rgba(var(--idi-rgb),.6)"};
  const serif={fontFamily:"'Fraunces',Georgia,serif",fontWeight:300,letterSpacing:"-.03em"};
  const chipBtn=ativo=>({background:ativo?T.sheet:"rgba(var(--idi-hrgb),.1)",color:ativo?T.ink:"rgba(var(--idi-hrgb),.88)",border:"1px solid "+(ativo?T.sheet:"rgba(var(--idi-hrgb),.3)"),borderRadius:999,padding:"0 16px",height:36,fontSize:12.5,fontWeight:ativo?700:500,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,fontFamily:"'DM Sans',sans-serif",display:"inline-flex",alignItems:"center",gap:7});
  const inp={background:"#fff",border:"1px solid rgba(var(--idi-rgb),.18)",borderRadius:12,padding:"11px 14px",fontSize:14,fontFamily:"'DM Sans',sans-serif",color:T.ink,width:"100%",minWidth:0,outline:"none"};
  const btnP={background:T.ink,color:T.sheet,border:"none",borderRadius:999,padding:"11px 20px",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap"};
  const btnS={background:"transparent",color:T.ink,border:"1px solid rgba(var(--idi-rgb),.25)",borderRadius:999,padding:"10px 18px",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap"};
  const CardR2=useRef(null);
  CardR2.current=({children,style})=><div style={{background:"#fff",border:"1px solid rgba(var(--idi-rgb),.1)",borderRadius:24,padding:isMobile?"20px 18px":"26px 28px",marginBottom:16,...style}}>{children}</div>;
  const Card=useRef(pp=>CardR2.current(pp)).current;
  const Titulo=({k,t,dir})=><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",gap:12,marginBottom:18}}><div><div style={lab}>{k}</div><div style={{...serif,fontSize:isMobile?26:32,marginTop:6,lineHeight:1,color:T.ink}}>{t}</div></div>{dir}</div>;
  const Vazio=({children})=><div style={{fontSize:14,lineHeight:1.45,color:"rgba(var(--idi-rgb),.62)"}}>{children}</div>;
  const Pick=({val,set,opts})=>(
    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{opts.map(([id,l,cor])=>{const on=val===id;return (
      <button key={id} onClick={()=>set(id)} style={{height:36,padding:"0 14px",borderRadius:999,border:"1px solid "+(on?(cor||T.ink):"rgba(var(--idi-rgb),.22)"),background:on?(cor||T.ink):"transparent",color:on?(cor?T.ink:T.sheet):T.ink,fontSize:12.5,fontWeight:on?700:500,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"inline-flex",alignItems:"center",gap:6}}>{cor&&!on&&<i style={{width:7,height:7,borderRadius:"50%",background:cor}}/>}{l}</button>);})}</div>);
  const Hist=({lista,cor})=>lista.map(s=>(
    <div key={s.id} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 0",borderTop:"1px solid rgba(var(--idi-rgb),.08)"}}>
      <i style={{width:10,height:10,borderRadius:"50%",background:L(s.lang).cor,flexShrink:0}}/>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:14.5,fontWeight:600}}>{L(s.lang).nome} · {(IDI_TIPOS.find(t=>t[0]===s.tipo)||[0,s.tipo])[1]}</div>
        <div style={{...lab,fontSize:9.5,marginTop:3,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{fd(s.data)}{s.nota?" · "+s.nota:""}</div>
      </div>
      <span style={{...serif,fontSize:22}}>{s.min}<small style={{fontSize:"55%",opacity:.55}}> min</small></span>
      <button onClick={()=>setLog(log.filter(x=>x.id!==s.id))} aria-label="remover" style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:"rgba(var(--idi-rgb),.35)"}}>×</button>
    </div>));
  const tiles=[
    {l:"Palavras hoje",v:String(totHoje),u:novasLib.length?`${due.length} rev. + ${novasLib.length} novas`:"para revisar",s:T.tiles[0],z:1.5,x:20,y:30,to:"palavras"},
    {l:"Horas na semana",v:hSem.toFixed(1).replace(".0",""),u:"h de "+metaTot+"h",s:T.tiles[1],z:1.4,x:40,y:20,to:"pratica"},
    {l:"Vocabulário",v:String(vocSel.length),u:dominadas+" dominadas",s:T.tiles[2],z:1.5,x:10,y:50,to:"palavras"},
    {l:"Sequência",v:String(streak),u:streak===1?"dia seguido":"dias seguidos",s:T.tiles[3],z:1.4,x:30,y:20,to:"evol"},
  ];
  const subs=[["hoje","Hoje"],["pratica","Praticar"],["palavras","Palavras"+(totHoje?" · "+totHoje:"")],["subst","Substantivos"],["gram","Gramática"],["ler","Leitura"],["midia","Escuta"],["evol","Evolução"]];
  const nomeSel=`${unica.nome} · ${unica.nivel} → ${unica.alvo}`+(dProva!==null&&dProva>=0?` · prova em ${dProva} ${dProva===1?"dia":"dias"}`:"");

  // Evolução
  const semanas=Array.from({length:8},(_,k)=>{const ini=addDays(iniSem,-7*(7-k));const fim=addDays(ini,6);return {ini,fim,por:ativas.map(l=>({l,min:log.filter(s=>s.lang===l.id&&s.data>=ini&&s.data<=fim).reduce((a,s)=>a+(+s.min||0),0)}))};});
  const maxSem=Math.max(60,...semanas.map(w=>w.por.reduce((a,x)=>a+x.min,0)));
  const serieV=ativas.map(l=>({l,pts:semanas.map(w=>vocab.filter(v=>v.lang===l.id&&v.criada<=w.fim).length)}));
  const maxV=Math.max(5,...serieV.flatMap(s=>s.pts));
  const ult30=addDays(hoje,-29);
  const porTipo=IDI_TIPOS.map(([id,n])=>({id,n,min:logSel.filter(s=>s.tipo===id&&s.data>=ult30).reduce((a,s)=>a+(+s.min||0),0)}));
  const maxTipo=Math.max(1,...porTipo.map(t=>t.min));
  const avs=avsDe(avLangAtual); const avUlt=avs[0]?.notas, avAnt=avs[1]?.notas;
  const marcosSel=marcos.filter(m=>inSel(m.lang)).sort((a,b)=>b.data.localeCompare(a.data));
  const palavrasLista=vocSel.filter(v=>!busca||(v.termo+" "+v.trad).toLowerCase().includes(busca.toLowerCase()));
  const cur=rs&&!rs.fim?vocab.find(v=>v.id===rs.fila[rs.i]):null;
  const temaN=fw.tema.trim()?vocSel.filter(v=>(v.tema||"").trim().toLowerCase()===fw.tema.trim().toLowerCase()&&(isNova(v)||(v.criada||"")>=addDays(hoje,-3))).length:0;
  const modoCur=cur?modoCard(cur):"rec";
  const chunkV=cur&&modoCur==="chunk"?cur.vars[((cur.ok||0)+(cur.er||0))%cur.vars.length]:null;
  const espCur=!cur?"":modoCur==="cloze"?clozeResp(cur.ex):modoCur==="chunk"?chunkV.r:cur.termo;
  const verificar=()=>{
    if(!rs||!cur||rs.res||!rs.resp.trim())return;
    const res=(modoCur==="prod"&&cur.art)?confNome(rs.resp,cur):{r:confTexto(rs.resp,espCur,cur.lang),msg:""};
    setRs({...rs,res});
  };
  const caixaMinha=()=>(
    cur.minha
      ?<div style={{fontSize:13.5,marginTop:12,lineHeight:1.5,opacity:.85}}><span style={{...lab,marginRight:8}}>minha frase</span>{cur.minha}</div>
      :<div style={{display:"flex",gap:8,marginTop:14,justifyContent:"center",flexWrap:"wrap"}}>
        <input style={{...inp,maxWidth:360}} value={mt} onChange={e=>setMt(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){salvarMinha(cur.id,mt);setMt("");}}} placeholder="Escreva uma frase sua com esta palavra (opcional)"/>
        <button style={{...btnS,padding:"9px 16px"}} disabled={!mt.trim()} onClick={()=>{salvarMinha(cur.id,mt);setMt("");}}>Salvar</button>
      </div>
  );

  return (
    <div className="idi" data-lang={sel} style={{"--idi-rgb":T.rgb,"--idi-hrgb":T.hrgb,minHeight:"100vh",background:T.ink,position:"relative",zIndex:1,color:T.ink,fontFamily:"'DM Sans','Segoe UI',sans-serif"}}>
      <style>{`
        .idi .idi-hero{position:relative;overflow:hidden;background:${T.ink};color:${T.sheet}}
        .idi .idi-scrim{position:absolute;inset:0;background:${T.scrim}}
        .idi .idi-hero,.idi .idi-sheet{animation:idiFade .5s ease both}
        @keyframes idiFade{from{opacity:0}to{opacity:1}}
        @keyframes idiPulse{0%,100%{opacity:1}50%{opacity:.25}}
        body:has(.idi[data-lang="fr"]){background:#17213F!important}
        .idi .idi-in{position:relative;max-width:1100px;margin:0 auto;padding:${isMobile?"18px 18px 54px":"26px 28px 62px"}}
        .idi .idi-sheet{position:relative;background:${T.sheet};border-radius:30px 30px 0 0;margin-top:-28px;min-height:70vh;padding:${isMobile?"26px 14px 110px":"34px 28px 110px"}}
        .idi .idi-wrap{max-width:1100px;margin:0 auto}
        .idi .idi-grid4{display:grid;grid-template-columns:repeat(${isMobile?2:4},1fr);gap:14px;margin-bottom:16px}
        .idi .idi-grid2{display:grid;grid-template-columns:${isMobile?"1fr":"1fr 1fr"};gap:16px}
        .idi .idi-row{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;padding-bottom:2px}
        .idi .idi-row::-webkit-scrollbar{display:none}
        .idi input:focus,.idi select:focus{border-color:${T.ink}!important}
        .idi input[type=range]{accent-color:${T.ink};width:100%}
        .idi button:active{transform:scale(.98)}
      `}</style>
      <div className="idi-hero" key={"h"+sel}>
        <Motif s={T.hero.s} z={T.hero.z} x={T.hero.x} y={T.hero.y} style={{position:"absolute",inset:0,opacity:.95}}/>
        <div className="idi-scrim"/>
        <div className="idi-in">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:isMobile?22:30}}>
            <button onClick={onMenu} aria-label="Abrir menu" style={{background:"rgba(var(--idi-hrgb),.12)",border:"1px solid rgba(var(--idi-hrgb),.3)",borderRadius:99,width:40,height:40,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4.5}}>{[0,1,2].map(i=><i key={i} style={{width:16,height:1.5,background:T.sheet,display:"block"}}/>)}</button>
            <AppSwitch atual="idi" onTrocar={onTrocar}/>
            <span style={{width:40,height:40}}/>
          </div>
          <div style={{display:"flex",gap:isMobile?26:38,alignItems:"flex-end",marginBottom:14}}>
            {cfg.map(l=>{const on=l.id===sel;return <button key={l.id} onClick={()=>trocarIdioma(l.id)} aria-pressed={on} style={{background:"none",border:"none",padding:"0 0 6px",cursor:"pointer",color:T.sheet,fontFamily:"'Fraunces',Georgia,serif",fontWeight:on?400:300,fontSize:isMobile?34:46,letterSpacing:"-.03em",lineHeight:1,opacity:on?1:.4,borderBottom:"2px solid "+(on?T.acc:"transparent"),transition:"opacity .3s,border-color .3s"}}>{(IDI_TEMAS[l.id]||{}).nome||l.nome}</button>;})}
          </div>
          <div style={{fontFamily:"'DM Mono',ui-monospace,monospace",fontSize:10.5,letterSpacing:".16em",textTransform:"uppercase",opacity:.75,marginBottom:6,lineHeight:1.5}}>{nomeSel}</div>
          <div style={{display:"flex",alignItems:"baseline",gap:14,flexWrap:"wrap"}}><span style={{...serif,fontSize:isMobile?104:150,lineHeight:.85,color:T.sheet}}>{streak}</span><span style={{...serif,fontSize:isMobile?22:30,opacity:.85}}>{streak===1?"dia":"dias"}<br/>de prática</span></div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginTop:20}}>
            <div style={{width:isMobile?150:200,height:6,borderRadius:99,background:"rgba(var(--idi-hrgb),.2)",overflow:"hidden"}}><div style={{width:Math.min(100,metaTot>0?hSem/metaTot*100:0)+"%",height:"100%",background:T.acc,borderRadius:99,transition:"width .5s"}}/></div>
            <span style={{fontFamily:"'DM Mono',ui-monospace,monospace",fontSize:10.5,letterSpacing:".1em",opacity:.85}}>{hSem.toFixed(1).replace(".0","")}H DE {metaTot}H NA SEMANA</span>
          </div>
          <div className="idi-row" style={{marginTop:20}}>{subs.map(([id,l])=><button key={id} onClick={()=>setSub(id)} style={chipBtn(sub===id)}>{l}</button>)}</div>
        </div>
      </div>

      <div className="idi-sheet" key={"s"+sel}><div className="idi-wrap">

      {editL&&fL&&(
        <Card>
          <Titulo k="Configuração" t={L(editL).nome}/>
          <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"1fr 1fr 1fr 1fr 1fr",gap:12,marginBottom:16}}>
            <div><div style={{...lab,marginBottom:6}}>Nível atual</div><select style={inp} value={fL.nivel} onChange={e=>setFL({...fL,nivel:e.target.value})}>{NIVEIS.map(n=><option key={n}>{n}</option>)}</select></div>
            <div><div style={{...lab,marginBottom:6}}>Meta de nível</div><select style={inp} value={fL.alvo} onChange={e=>setFL({...fL,alvo:e.target.value})}>{NIVEIS.map(n=><option key={n}>{n}</option>)}</select></div>
            <div><div style={{...lab,marginBottom:6}}>Data da prova</div><input style={inp} type="date" value={fL.prova} onChange={e=>setFL({...fL,prova:e.target.value})}/></div>
            <div><div style={{...lab,marginBottom:6}}>Meta (h/semana)</div><input style={inp} type="number" min="0" value={fL.metaSem} onChange={e=>setFL({...fL,metaSem:e.target.value})}/></div>
            <div><div style={{...lab,marginBottom:6}}>Novas por dia</div><input style={inp} type="number" min="0" value={fL.novosDia} placeholder={String(sel===editL&&editL==="de"?10:6)} onChange={e=>setFL({...fL,novosDia:e.target.value})}/></div>
          </div>
          <div style={{display:"flex",gap:10}}><button style={btnP} onClick={salvarEdit}>Salvar</button><button style={btnS} onClick={()=>setEditL(null)}>Cancelar</button></div>
        </Card>)}

      {/* ═ HOJE ═ */}
      {sub==="hoje"&&(<>
        <div className="idi-grid4">
          {tiles.map(t=>(
            <div key={t.l} className="bento-tile" onClick={()=>setSub(t.to)} style={{background:STY[t.s].paper,cursor:"pointer",minHeight:isMobile?172:200}}>
              <Motif s={t.s} z={t.z} x={t.x} y={t.y} style={{position:"absolute",inset:0,zIndex:0,pointerEvents:"none"}}/>
              <div className="tile-panel" style={{marginTop:"auto"}}>
                <div style={{...lab,fontSize:9.5,color:"rgba(var(--idi-rgb),.65)"}}>{t.l}</div>
                <div style={{display:"flex",alignItems:"baseline",gap:6,marginTop:6,flexWrap:"wrap"}}><span style={{...serif,fontSize:isMobile?34:42,lineHeight:1,color:T.ink}}>{t.v}</span><span style={{fontSize:11.5,opacity:.6}}>{t.u}</span></div>
              </div>
            </div>))}
        </div>
        {(
          <button onClick={()=>setSub("subst")} style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:14,width:"100%",textAlign:"left",border:"1px solid rgba(var(--idi-rgb),.1)",background:"#fff",borderRadius:24,padding:isMobile?"16px 18px":"20px 26px",marginBottom:16,cursor:"pointer",fontFamily:"inherit",color:T.ink}}>
            <div style={{minWidth:0}}>
              <div style={lab}>{unica.nome} · substantivos</div>
              <div style={{...serif,fontSize:isMobile?22:26,marginTop:6,lineHeight:1.1}}>Treino de artigos</div>
              <div style={{fontSize:12.5,opacity:.65,marginTop:6}}>{totArtOk+totArtEr>0?`${Math.round(totArtOk/(totArtOk+totArtEr)*100)}% de acerto${piorArt?` · mais difícil: ${piorArt}`:""}`:"10 substantivos por rodada, com regras e ganchos"}</div>
            </div>
            <div style={{display:"flex",gap:6,flexShrink:0}}>{ARTS.map(a=><span key={a} style={{background:ART_BG[a],color:ART_COR[a],fontWeight:700,fontSize:isMobile?12:13,padding:"7px 11px",borderRadius:999}}>{a}</span>)}</div>
          </button>)}
        {folgaRec&&<div style={{...lab,textAlign:"center",marginBottom:14}}>1 dia de folga perdoado esta semana · a sequência continua</div>}
        <Card>
          <Titulo k="Prioridades" t="Dificuldades a serem sanadas" dir={nDif>0?<span style={{...lab,whiteSpace:"nowrap"}}>{nDif} {nDif===1?"ponto":"pontos"}</span>:null}/>
          {nDif===0?<Vazio>Nada crítico por enquanto. Conforme você errar em gramática, substantivos e palavras, os pontos fracos aparecem aqui para você atacar.</Vazio>:(
            <div style={{display:"grid",gap:16}}>
              {dificG.length>0&&<div><div style={{...lab,marginBottom:8}}>Gramática</div><div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{dificG.map(d=><button key={d.k} style={pillD} onClick={()=>{setSub("gram");iniciarGram(d.k);}}>{d.nome}<span style={{color:IDI_RED}}>{d.pct}%</span></button>)}</div></div>}
              {(artFraco||dificeis.length>0)&&<div><div style={{...lab,marginBottom:8}}>Substantivos</div><div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {artFraco&&<button style={pillD} onClick={()=>setSub("subst")}>artigo <b style={{color:ART_COR[artFraco]}}>{artFraco}</b><span style={{color:IDI_RED}}>{pctArt(artFraco)}%</span></button>}
                {dificeis.slice(0,4).map(({n,x})=><button key={n.k} style={pillD} onClick={()=>setSub("subst")}><NomeN lang={sel} art={n.art} termo={n.termo}/><span style={{color:IDI_RED}}>×{x.er}</span></button>)}
              </div></div>}
              {leeches.length>0&&<div><div style={{...lab,marginBottom:8}}>Palavras que não fixam</div><div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{leeches.map(v=><button key={v.id} style={pillD} onClick={()=>setSub("palavras")}><Nome v={v}/><span style={{color:IDI_RED}}>×{v.er}</span></button>)}</div></div>}
            </div>)}
        </Card>
        <Card>
          <Titulo k="Hábito" t="Quando… então…" dir={iiEd?null:<button style={{...btnS,padding:"8px 14px",fontSize:12}} onClick={()=>setIiEd({q:(ii[sel]||{}).q||"",f:(ii[sel]||{}).f||""})}>{ii[sel]&&ii[sel].q?"editar":"definir"}</button>}/>
          {iiEd?(<>
            <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:12}}>
              <div><div style={{...lab,marginBottom:6}}>Quando eu…</div><input style={inp} value={iiEd.q} onChange={e=>setIiEd({...iiEd,q:e.target.value})} placeholder="sentar na ambulância depois de um transporte"/></div>
              <div><div style={{...lab,marginBottom:6}}>…eu faço</div><input style={inp} value={iiEd.f} onChange={e=>setIiEd({...iiEd,f:e.target.value})} placeholder={"10 cartões de "+unica.nome.toLowerCase()}/></div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:14}}><button style={btnP} onClick={()=>{setIi({...ii,[sel]:{q:iiEd.q.trim(),f:iiEd.f.trim()}});setIiEd(null);}}>Salvar</button><button style={btnS} onClick={()=>setIiEd(null)}>Cancelar</button></div>
          </>):(ii[sel]&&ii[sel].q&&ii[sel].f
            ?<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:14,flexWrap:"wrap"}}>
              <div style={{...serif,fontSize:isMobile?19:22,lineHeight:1.35}}>Quando eu <b style={{fontWeight:600}}>{ii[sel].q}</b>, faço <b style={{fontWeight:600}}>{ii[sel].f}</b>.</div>
              <button style={btnP} onClick={()=>setSub("palavras")}>Fazer agora</button>
            </div>
            :<Vazio>Um gatilho concreto (“quando eu… faço…”) aumenta muito a chance de você cumprir. Defina o seu para {unica.nome}.</Vazio>)}
        </Card>
        <div className="idi-grid2">
          <Card>
            <Titulo k="Níveis" t="Onde você está"/>
            {ativas.map((l,k)=>{
              const iN=NIVEIS.indexOf(l.nivel), iA=NIVEIS.indexOf(l.alvo);
              const mSem=log.filter(s=>s.lang===l.id&&s.data>=iniSem).reduce((a,s)=>a+(+s.min||0),0)/60;
              const dp=diasAte(l.prova);
              return (
                <div key={l.id} style={{padding:"16px 0 "+(k===ativas.length-1?0:16)+"px",borderTop:k===0?"none":"1px solid rgba(var(--idi-rgb),.08)"}}>
                  <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",gap:10}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}><i style={{width:12,height:12,borderRadius:"50%",background:l.cor}}/><span style={{...serif,fontSize:isMobile?24:28}}>{l.nome}</span></div>
                    <span style={{...serif,fontSize:isMobile?22:26}}>{l.nivel}<small style={{opacity:.45}}> → {l.alvo}</small></span>
                  </div>
                  <div style={{display:"flex",gap:4,marginTop:14}}>{NIVEIS.map((n,i)=><div key={n} style={{flex:1}}><div style={{height:9,borderRadius:99,background:i<=iN?l.cor:"rgba(var(--idi-rgb),.1)",boxShadow:i===iA?"0 0 0 2px "+T.paper+", 0 0 0 3.5px "+T.ink:"none"}}/><div style={{...lab,fontSize:9,marginTop:6,textAlign:"center",color:i===iN?T.ink:undefined,fontWeight:i===iN?700:400}}>{n}</div></div>)}</div>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginTop:14}}>
                    <div style={{flex:1,height:6,borderRadius:99,background:"rgba(var(--idi-rgb),.1)",overflow:"hidden"}}><div style={{width:Math.min(100,l.metaSem>0?mSem/l.metaSem*100:0)+"%",height:"100%",background:l.cor,borderRadius:99}}/></div>
                    <span style={{...lab,fontSize:10}}>{mSem.toFixed(1).replace(".0","")}/{l.metaSem}h semana</span>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginTop:14,flexWrap:"wrap"}}>
                    {iN<NIVEIS.length-1&&<button style={{...btnS,padding:"8px 14px",fontSize:12}} onClick={()=>subirNivel(l)}>Subi para {NIVEIS[iN+1]}</button>}
                    <button style={{...btnS,padding:"8px 14px",fontSize:12}} onClick={()=>abrirEdit(l)}>Editar metas</button>
                    {dp!==null&&dp>=0&&<span style={{...lab,marginLeft:"auto",color:T.ink,fontWeight:700}}>prova em {dp} {dp===1?"dia":"dias"}</span>}
                  </div>
                </div>);})}
          </Card>
          <Card>
            <Titulo k="Memória" t="Palavras de hoje" dir={totHoje>0?<button style={{...btnP,padding:"9px 16px",fontSize:12}} onClick={()=>{setSub("palavras");iniciarRev();}}>Revisar</button>:null}/>
            {totHoje===0
              ? <div style={{display:"flex",alignItems:"center",gap:16}}><div style={{width:84,height:84,borderRadius:22,overflow:"hidden",flexShrink:0}}><Motif s={T.tiles[1]} z={1.55} x={0} y={36}/></div><Vazio>{vocSel.length===0?"Nenhuma palavra ainda. Cadastre em Palavras e elas voltam na hora certa.":"Nada para revisar hoje. Volte amanhã ou adicione palavras novas."}</Vazio></div>
              : due.slice(0,6).map(v=>(
                <div key={v.id} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 0",borderTop:"1px solid rgba(var(--idi-rgb),.08)"}}>
                  <i style={{width:10,height:10,borderRadius:"50%",background:L(v.lang).cor,flexShrink:0}}/>
                  <span style={{flex:1,fontSize:14.5,fontWeight:600,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}><Nome v={v}/></span>
                  <span style={{...lab,fontSize:9.5}}>{L(v.lang).cod}</span>
                </div>))}
            {due.length>6&&<div style={{...lab,marginTop:10}}>+ {due.length-6} palavras</div>}
            {novasLib.length>0&&<div style={{...lab,marginTop:10}}>+ {novasLib.length} {novasLib.length===1?"nova liberada":"novas liberadas"} hoje</div>}
            {bloqueioNov&&<div style={{fontSize:12.5,marginTop:10,color:IDI_RED}}>{bloqueioNov}</div>}
          </Card>
        </div>
        <Card>
          <Titulo k="Semana" t="Ritmo de prática" dir={<button style={{...btnS,padding:"8px 14px",fontSize:12}} onClick={()=>setSub("pratica")}>{cronRodando?"● cronometrando":"Cronometrar"}</button>}/>
          <div style={{display:"flex",gap:isMobile?6:14,justifyContent:"space-between"}}>
            {semana.map((d,i)=>(
              <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
                <i style={{width:"100%",maxWidth:56,aspectRatio:"1",borderRadius:"50%",background:d.ativo?T.ink:d.ds>hoje?"#EADFC8":"#DDD0B6",boxShadow:d.ehHoje?"0 0 0 3px "+T.acc:"none",display:"flex",alignItems:"center",justifyContent:"center",color:T.sheet,fontSize:isMobile?10:12,fontStyle:"normal",fontWeight:600}}>{d.min>0?Math.round(d.min/60*10)/10+"h":""}</i>
                <span style={{...lab,fontSize:9.5,color:d.ehHoje?T.ink:undefined,fontWeight:d.ehHoje?700:400}}>{d.lbl}</span>
              </div>))}
          </div>
        </Card>
        <Card>
          <Titulo k="Recentes" t="Últimas práticas"/>
          {logSel.length===0?<Vazio>Nada registrado ainda. Use “Praticar” para lançar seu primeiro estudo.</Vazio>:<Hist lista={logSel.slice(0,5)}/>}
        </Card>
      </>)}

      {/* ═ PRATICAR ═ */}
      {sub==="pratica"&&(<>
        {(()=>{
          const ativo=!!cron; const cl=L(cron?cron.lang:sel); const mt=ativo?(cron.meta||0):metaC;
          const dec=decorrido; const C=2*Math.PI*46;
          const p=mt>0?Math.min(1,dec/(mt*60000)):(dec%60000)/60000;
          const bateu=mt>0&&dec>=mt*60000;
          const tam=isMobile?232:272;
          return (
            <Card style={{textAlign:"center"}}>
              <div style={lab}>Cronômetro · {cl.nome}</div>
              <div style={{position:"relative",width:tam,height:tam,margin:"16px auto 18px"}}>
                <svg viewBox="0 0 100 100" width="100%" height="100%" style={{transform:"rotate(-90deg)"}}>
                  <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(var(--idi-rgb),.1)" strokeWidth="2.5"/>
                  <circle cx="50" cy="50" r="46" fill="none" stroke={T.acc} strokeWidth="2.5" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C*(1-p)} style={{transition:cronRodando?"stroke-dashoffset 1s linear":"none"}}/>
                </svg>
                <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                  <div style={{...serif,fontSize:dec>=3600000?(isMobile?48:58):(isMobile?64:76),lineHeight:1,fontVariantNumeric:"tabular-nums"}}>{fmtT(dec)}</div>
                  <div style={{...lab,marginTop:10}}>{!ativo?"pronto":bateu?"meta atingida ✓":cronRodando?"estudando":"pausado"}</div>
                </div>
              </div>
              {!ativo?(<>
                <div style={{...lab,marginBottom:8}}>O que vai estudar</div>
                <div style={{display:"flex",justifyContent:"center"}}><Pick val={fp.tipo} set={v=>setFp({...fp,tipo:v})} opts={IDI_TIPOS.map(([i,n])=>[i,n])}/></div>
                <div style={{...lab,margin:"16px 0 8px"}}>Meta de tempo</div>
                <div style={{display:"flex",justifyContent:"center"}}><Pick val={metaC} set={setMetaC} opts={[[0,"Livre"],[25,"25 min"],[45,"45 min"],[60,"1 h"],[90,"1h30"]]}/></div>
                <div style={{marginTop:22}}><button style={{...btnP,padding:"14px 34px",fontSize:14}} onClick={iniciarCron}>Iniciar</button></div>
              </>):(<>
                <div style={{...lab,marginBottom:16,color:T.ink}}>{tipoNome(cron.tipo)}{mt>0?` · meta ${mt} min`:""}</div>
                <div style={{display:"flex",justifyContent:"center",gap:10,flexWrap:"wrap"}}>
                  {cronRodando?<button style={{...btnS,padding:"13px 26px"}} onClick={pausarCron}>Pausar</button>:<button style={{...btnP,padding:"13px 26px"}} onClick={retomarCron}>Continuar</button>}
                  <button style={{...btnP,padding:"13px 26px",background:T.acc,color:T.ink}} onClick={finalizarCron}>Finalizar e salvar</button>
                </div>
                <div style={{marginTop:14}}><button onClick={descartarCron} style={{background:"none",border:"none",cursor:"pointer",fontSize:12,textDecoration:"underline",textUnderlineOffset:3,color:"rgba(var(--idi-rgb),.55)"}}>descartar</button></div>
              </>)}
            </Card>);
        })()}
        <Card>
          <Titulo k="Registro" t="Lançar manualmente"/>
          <div style={{...lab,marginBottom:8}}>Atividade</div>
          <Pick val={fp.tipo} set={v=>setFp({...fp,tipo:v})} opts={IDI_TIPOS.map(([i,n])=>[i,n])}/>
          <div style={{...lab,margin:"18px 0 8px"}}>Minutos</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
            {[15,30,45,60,90].map(n=><button key={n} onClick={()=>setFp({...fp,min:String(n)})} style={{...btnS,padding:"8px 14px",background:+fp.min===n?T.ink:"transparent",color:+fp.min===n?T.sheet:T.ink}}>{n}</button>)}
            <input style={{...inp,width:100}} type="number" min="1" value={fp.min} onChange={e=>setFp({...fp,min:e.target.value})} placeholder="outro"/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"2fr 1fr",gap:12,marginTop:18}}>
            <div><div style={{...lab,marginBottom:6}}>Anotação (opcional)</div><input style={inp} value={fp.nota} onChange={e=>setFp({...fp,nota:e.target.value})} placeholder="Ex: Netzwerk neu cap. 5, podcast, aula…"/></div>
            <div><div style={{...lab,marginBottom:6}}>Data</div><input style={inp} type="date" value={fp.data||hoje} onChange={e=>setFp({...fp,data:e.target.value})}/></div>
          </div>
          <div style={{marginTop:18}}><button style={btnP} onClick={addPratica}>Salvar registro</button></div>
        </Card>
        <Card>
          <Titulo k="Histórico" t="Registros recentes"/>
          {logSel.length===0?<Vazio>Nenhum registro ainda.</Vazio>:<Hist lista={logSel.slice(0,12)}/>}
        </Card>
      </>)}

      {/* ═ PALAVRAS ═ */}
      {sub==="palavras"&&(<>
        {rs&&(
          <Card style={{textAlign:"center",padding:isMobile?"26px 18px":"36px 28px"}}>
            {rs.fim?(<>
              <div style={lab}>{rs.m5?"Modo 5 min concluído":"Revisão concluída"}</div>
              <div style={{...serif,fontSize:isMobile?56:72,margin:"14px 0 6px",lineHeight:1}}>{rs.ok}<small style={{fontSize:"45%",opacity:.45}}> / {rs.ok+rs.er}</small></div>
              <Vazio>{rs.m5?"acertos. Sessão mínima feita: o hábito continua vivo.":"acertos nesta sessão. As palavras voltam em intervalos crescentes."}</Vazio>
              <div style={{marginTop:20}}><button style={btnP} onClick={()=>setRs(null)}>Fechar</button></div>
            </>):cur?(<>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <span style={{...lab,display:"inline-flex",alignItems:"center",gap:7}}><i style={{width:8,height:8,borderRadius:"50%",background:L(cur.lang).cor}}/>{L(cur.lang).nome}{rs.m5?" · 5 min":""}</span>
                <span style={lab}>{Math.min(rs.i+1,rs.fila.length)} / {rs.fila.length}</span>
              </div>
              <div style={{height:4,borderRadius:99,background:"rgba(var(--idi-rgb),.1)",overflow:"hidden",marginBottom:28}}><div style={{width:(rs.i/rs.fila.length*100)+"%",height:"100%",background:T.ink,transition:"width .3s"}}/></div>
              {modoCur==="rec"?(<>
                <div style={{...serif,fontSize:isMobile?42:56,lineHeight:1.1,minHeight:isMobile?60:76,wordBreak:"break-word"}}><Nome v={cur}/></div>
                {rs.show?(<>
                  <div style={{fontSize:isMobile?20:24,marginTop:18,fontWeight:500}}>{cur.trad}</div>
                  {cur.plural&&<div style={{fontSize:14,marginTop:8,opacity:.65}}>plural: {(GEN[cur.lang]||G).plArt} {cur.plural}</div>}
                  {cur.ex&&<div style={{fontSize:14,marginTop:10,fontStyle:"italic",opacity:.75,lineHeight:1.5}}>{clozeVer(cur.ex,true)}</div>}
                  {cur.fonte&&<div style={{...lab,marginTop:8,fontSize:9.5}}>{cur.fonte}{cur.tempo?" · "+cur.tempo:""}</div>}
                  {caixaMinha()}
                  <div style={{display:"flex",justifyContent:"center",gap:12,marginTop:28}}>
                    <button style={{...btnS,minWidth:130,borderColor:IDI_RED,color:IDI_RED}} onClick={()=>responder(false)}>Errei</button>
                    <button style={{...btnP,minWidth:130}} onClick={()=>responder(true)}>Acertei</button>
                  </div>
                </>):(
                  <div style={{marginTop:36}}><button style={btnP} onClick={()=>setRs({...rs,show:true})}>Mostrar tradução</button></div>)}
              </>):(<>
                <div style={{...lab,marginBottom:12}}>{modoCur==="prod"?"Como se diz…?":modoCur==="cloze"?"Complete a frase":"Complete a estrutura"}</div>
                <div style={{...serif,fontSize:modoCur==="prod"?(isMobile?34:44):(isMobile?24:30),lineHeight:1.25,wordBreak:"break-word"}}>
                  {modoCur==="prod"?cur.trad:modoCur==="cloze"?clozeVer(cur.ex,false):cur.termo}
                </div>
                <div style={{fontSize:13,opacity:.6,marginTop:10}}>
                  {modoCur==="prod"?(cur.art?"substantivo: escreva com o artigo":""):modoCur==="cloze"?"dica: "+cur.trad:(chunkV.d?"("+chunkV.d+") · ":"")+cur.trad}
                </div>
                {!rs.res?(<>
                  <div style={{marginTop:22,display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
                    <input autoFocus autoCapitalize="off" autoCorrect="off" spellCheck={false} style={{...inp,maxWidth:340,textAlign:"center"}} value={rs.resp} onChange={e=>setRs({...rs,resp:e.target.value})} onKeyDown={e=>{if(e.key==="Enter")verificar();}} placeholder={modoCur==="prod"&&cur.art?G.ph:"sua resposta"}/>
                    <button style={{...btnP,opacity:rs.resp.trim()?1:.4}} disabled={!rs.resp.trim()} onClick={verificar}>Verificar</button>
                  </div>
                  <div style={{marginTop:14}}><button onClick={()=>setRs({...rs,res:{r:"er",msg:"",skip:true}})} style={{background:"none",border:"none",cursor:"pointer",fontSize:12.5,textDecoration:"underline",textUnderlineOffset:3,color:"rgba(var(--idi-rgb),.55)"}}>não lembro</button></div>
                </>):(<>
                  <div style={{marginTop:22,padding:"14px 16px",borderRadius:16,textAlign:"left",background:rs.res.r==="er"?"rgba(168,50,50,.08)":"rgba(60,130,90,.1)"}}>
                    <div style={{...lab,color:rs.res.r==="er"?IDI_RED:"#2F7A52"}}>{rs.res.r==="ok"?"Correto":rs.res.r==="quase"?"Quase · "+(rs.res.msg||"atenção à grafia"):rs.res.skip?"Resposta":"Não foi dessa vez"+(rs.res.msg?" · "+rs.res.msg:"")}</div>
                    <div style={{...serif,fontSize:isMobile?28:36,marginTop:6,lineHeight:1.15,wordBreak:"break-word"}}>{modoCur==="prod"?<Nome v={cur}/>:espCur}</div>
                    {rs.res.r!=="ok"&&!rs.res.skip&&<div style={{fontSize:13,opacity:.6,marginTop:6}}>você escreveu: {rs.resp}</div>}
                  </div>
                  {cur.plural&&<div style={{fontSize:14,marginTop:12,opacity:.65}}>plural: {(GEN[cur.lang]||G).plArt} {cur.plural}</div>}
                  {cur.ex&&<div style={{fontSize:14,marginTop:10,fontStyle:"italic",opacity:.75,lineHeight:1.5}}>{clozeVer(cur.ex,true)}</div>}
                  {cur.fonte&&<div style={{...lab,marginTop:8,fontSize:9.5}}>{cur.fonte}{cur.tempo?" · "+cur.tempo:""}</div>}
                  {caixaMinha()}
                  <div style={{display:"flex",justifyContent:"center",gap:12,marginTop:24,flexWrap:"wrap"}}>
                    {rs.res.r==="er"&&!rs.res.skip&&<button style={{...btnS,minWidth:130}} onClick={()=>responder(true)}>Contar como acerto</button>}
                    <button style={{...btnP,minWidth:130}} onClick={()=>responder(rs.res.r!=="er")}>Próxima</button>
                  </div>
                </>)}
              </>)}
            </>):null}
            {!rs.fim&&<div style={{marginTop:22}}><button onClick={()=>setRs(null)} style={{background:"none",border:"none",cursor:"pointer",fontSize:12,textDecoration:"underline",textUnderlineOffset:3,color:"rgba(var(--idi-rgb),.55)"}}>sair da revisão</button></div>}
          </Card>)}
        {!rs&&(
          <Card>
            <Titulo k="Repetição espaçada" t="Revisar" dir={<div style={{textAlign:"right"}}><div style={lab}>acerto</div><div style={{...serif,fontSize:isMobile?30:38,marginTop:4,color:IDI_RED}}>{acertoV===null?"—":acertoV+"%"}</div></div>}/>
            <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
              <button style={{...btnP,opacity:totHoje?1:.4}} disabled={!totHoje} onClick={()=>iniciarRev()}>{totHoje?`Revisar ${due.length}${novasLib.length?` + ${novasLib.length} ${novasLib.length===1?"nova":"novas"}`:""}`:"Nada para hoje"}</button>
              {due.length>0&&<button style={btnS} onClick={()=>iniciarRev(true)}>Modo 5 min</button>}
            </div>
            <div style={{marginTop:16,fontSize:12.5,lineHeight:1.6,opacity:.8}}>
              Novas hoje: <b>{novasFeitas}</b> de {limiteHoje}{novasTodas.length>0?` · ${novasTodas.length} na fila`:""}
              {bloqueioNov&&<div style={{color:IDI_RED,fontWeight:600}}>{bloqueioNov}</div>}
              {!bloqueioNov&&plt4>=2&&<div>Semana de plantões: limite de novas reduzido pela metade.</div>}
              {!bloqueioNov&&novasTodas.length>0&&novasLib.length<Math.max(0,limiteHoje-novasFeitas)&&<div>Algumas novas ficaram para depois: no máximo 2 do mesmo tema por dia.</div>}
            </div>
            <div style={{...lab,marginTop:12}}>{vocSel.length} no total · {dominadas} dominadas</div>
          </Card>)}
        {!rs&&vocSel.length>0&&(
          <Card>
            <Titulo k="Carga" t="Revisões nos próximos 7 dias"/>
            <div style={{display:"flex",alignItems:"flex-end",gap:8,height:104}}>
              {cargaFc.map((n,i)=>{const bs=baseCarga[i];const dd2=addDays(hoje,i+1);return (
                <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end",height:"100%",gap:4}}>
                  <span style={{fontSize:10.5,opacity:.65}}>{n}</span>
                  <div style={{width:"100%",display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
                    <div style={{height:(n-bs)/maxFc*60,background:T.acc,borderRadius:"6px 6px 0 0"}}/>
                    <div style={{height:Math.max(3,bs/maxFc*60),background:T.ink,opacity:.85,borderRadius:n-bs>0?0:"6px 6px 0 0"}}/>
                  </div>
                  <span style={{...lab,fontSize:9.5}}>{["D","S","T","Q","Q","S","S"][new Date(dd2+"T12:00:00").getDay()]}</span>
                </div>);})}
            </div>
            <div style={{marginTop:18}}>
              <div style={{...lab,marginBottom:6}}>Se eu adicionar <b style={{color:T.ink}}>{nFc}</b> novas hoje</div>
              <input type="range" min="0" max="40" value={nFc} onChange={e=>setFcN(+e.target.value)}/>
              <div style={{fontSize:13,marginTop:8,lineHeight:1.55,opacity:.85}}>≈ <b>{totFc}</b> revisões em 7 dias{nFc>0?` (${totBase} sem novas)`:""} · média de {Math.round(totFc/7)} por dia.{totFc/7>40?" Pesado: o controle está nas novas, não nas revisões.":""}</div>
            </div>
          </Card>)}
        <Card>
          <Titulo k="Nova" t="Adicionar palavra"/>
          <div style={{display:"flex",gap:8,marginTop:14}}>{[["palavra","Palavra"],["chunk","Expressão (chunk)"]].map(([k,l])=><button key={k} onClick={()=>setFw({...fw,tipo:k})} style={{height:34,padding:"0 16px",borderRadius:999,border:"1px solid "+T.ink,background:fw.tipo===k?T.ink:"transparent",color:fw.tipo===k?T.sheet:T.ink,fontSize:12.5,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>{l}</button>)}</div>
          {fw.tipo!=="chunk"&&(
            <div style={{marginTop:14}}>
              <div style={{...lab,marginBottom:8}}>Artigo (se for substantivo)</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{ARTS.map(a=>{const on=fw.art===a;return <button key={a} onClick={()=>setFw({...fw,art:on?"":a})} style={{height:36,minWidth:64,padding:"0 16px",borderRadius:999,border:"1px solid "+ART_COR[a],background:on?ART_COR[a]:ART_BG[a],color:on?"#fff":ART_COR[a],fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>{a}</button>;})}</div>
              {sugForm&&!fw.art&&!G.parse.test(fw.termo.trim())&&<div style={{fontSize:12.5,marginTop:10,lineHeight:1.5,color:"rgba(var(--idi-rgb),.75)"}}>Terminação <b>{sugForm.suf}</b> costuma ser <b style={{color:ART_COR[sugForm.art]}}>{sugForm.art}</b> ({sugForm.conf}). <button onClick={()=>setFw({...fw,art:sugForm.art})} style={{background:"none",border:"none",padding:0,cursor:"pointer",textDecoration:"underline",textUnderlineOffset:3,fontSize:12.5,color:T.ink}}>usar {sugForm.art}</button></div>}
            </div>)}
          <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:12,marginTop:14}}>
            <div><div style={{...lab,marginBottom:6}}>{fw.tipo==="chunk"?"Estrutura (use ___ no que varia)":"Palavra"}</div><input style={inp} value={fw.termo} onChange={e=>setFw({...fw,termo:e.target.value})} placeholder={fw.tipo==="chunk"?(sel==="fr"?"Il vaut mieux que tu ___":"Es kommt darauf an, ob ___"):G.ph}/></div>
            <div><div style={{...lab,marginBottom:6}}>Tradução</div><input style={inp} value={fw.trad} onChange={e=>setFw({...fw,trad:e.target.value})} placeholder="a chave"/></div>
          </div>
          {fw.tipo!=="chunk"&&<div style={{marginTop:12}}><div style={{...lab,marginBottom:6}}>Plural (opcional)</div><input style={inp} value={fw.plural} onChange={e=>setFw({...fw,plural:e.target.value})} placeholder={G.phS}/></div>}
          {fw.tipo==="chunk"
            ?<div style={{marginTop:12}}><div style={{...lab,marginBottom:6}}>Variações (dica = resposta, separadas por vírgula)</div><input style={inp} value={fw.vars} onChange={e=>setFw({...fw,vars:e.target.value})} placeholder={sel==="fr"?"partir = partes, venir = viennes, faire = fasses":"mitkommen = mitkommst, bleiben = bleibst"}/><div style={{fontSize:12,opacity:.6,marginTop:6}}>A cada revisão aparece uma variação diferente.</div></div>
            :<div style={{marginTop:12}}><div style={{...lab,marginBottom:6}}>Frase de exemplo (a palavra vira a lacuna)</div><input style={inp} value={fw.ex} onChange={e=>setFw({...fw,ex:e.target.value})} placeholder="Frase real onde a palavra apareceu"/><div style={{fontSize:12,opacity:.6,marginTop:6}}>Dica: marque a lacuna com [[colchetes duplos]] se quiser outro trecho.</div></div>}
          <div style={{marginTop:12}}><div style={{...lab,marginBottom:6}}>Minha frase (opcional)</div><input style={inp} value={fw.minha} onChange={e=>setFw({...fw,minha:e.target.value})} placeholder={sel==="fr"?"Je suis médecin aux urgences.":"Ich arbeite als Ärztin im Notdienst."}/></div>
          <div style={{marginTop:12}}><div style={{...lab,marginBottom:6}}>Tema / cena (opcional)</div><input style={inp} list="idi-temas" value={fw.tema} onChange={e=>setFw({...fw,tema:e.target.value})} onKeyDown={e=>{if(e.key==="Enter")addPalavra();}} placeholder="no restaurante, consultório, trânsito…"/>
            <datalist id="idi-temas">{[...new Set(vocSel.map(v=>v.tema).filter(Boolean))].map(t=><option key={t} value={t}/>)}</datalist>
            {temaN>=4&&<div style={{fontSize:12.5,marginTop:8,color:IDI_RED,lineHeight:1.5}}>Você já tem {temaN} palavras recentes em “{fw.tema.trim()}”. Muitas do mesmo campo semântico juntas se confundem: espalhe ao longo dos dias.</div>}
            <div style={{fontSize:12,opacity:.6,marginTop:6}}>Agrupe por cena (garçom, conta, gorjeta), não por categoria (todas as cores).</div>
          </div>
          <div style={{marginTop:16}}><button style={btnP} onClick={addPalavra}>Adicionar</button></div>
        </Card>
        <Card>
          <Titulo k="Vocabulário" t="Suas palavras"/>
          <input style={{...inp,marginBottom:8}} value={busca} onChange={e=>setBusca(e.target.value)} placeholder="Buscar…"/>
          {palavrasLista.length===0?<Vazio>{vocSel.length===0?"Nenhuma palavra cadastrada.":"Nada encontrado."}</Vazio>:(verTodas?palavrasLista:palavrasLista.slice(0,30)).map(v=>(
            <div key={v.id} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 0",borderTop:"1px solid rgba(var(--idi-rgb),.08)"}}>
              <i style={{width:10,height:10,borderRadius:"50%",background:L(v.lang).cor,flexShrink:0}}/>
              <div style={{flex:1,minWidth:0}}><div style={{fontSize:14.5,fontWeight:600}}><Nome v={v}/>{v.plural&&<span style={{fontWeight:400,opacity:.5,fontSize:12.5}}> · pl. {v.plural}</span>}</div><div style={{fontSize:13,opacity:.6,marginTop:2}}>{v.trad}{(v.tema||v.tipo==="chunk"||temCloze(v.ex)||isNova(v))&&<span style={{...lab,fontSize:9.5,marginLeft:8}}>{[isNova(v)?"nova":"",v.tipo==="chunk"?"chunk":"",temCloze(v.ex)?"lacuna":"",v.tema||""].filter(Boolean).join(" · ")}</span>}</div></div>
              <div style={{display:"flex",gap:3}} title={"nível "+(v.box||0)+" de 5"}>{[0,1,2,3,4].map(i=><i key={i} style={{width:6,height:6,borderRadius:"50%",background:i<(v.box||0)?T.ink:"rgba(var(--idi-rgb),.15)"}}/>)}</div>
              <button onClick={()=>setVocab(vocab.filter(x=>x.id!==v.id))} aria-label="remover" style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:"rgba(var(--idi-rgb),.35)"}}>×</button>
            </div>))}
          {!verTodas&&palavrasLista.length>30&&<button style={{...btnS,marginTop:12}} onClick={()=>setVerTodas(true)}>Ver todas ({palavrasLista.length})</button>}
        </Card>
      </>)}

      {/* ═ SUBSTANTIVOS ═ */}
      {/* ═ GRAMÁTICA ═ */}
      {sub==="gram"&&(<>
        {gm?(
          <Card style={{padding:isMobile?"26px 18px":"34px 30px"}}>
            {gm.fim?(<div style={{textAlign:"center"}}>
              <div style={lab}>Sessão concluída</div>
              <div style={{...serif,fontSize:isMobile?56:72,margin:"14px 0 6px",lineHeight:1}}>{gm.ok}<small style={{fontSize:"45%",opacity:.45}}> / {gm.ok+gm.aut+gm.er}</small></div>
              <Vazio>de primeira{gm.aut>0?` · ${gm.aut} autocorrigida${gm.aut>1?"s":""}`:""}{gm.er>0?` · ${gm.er} para revisar`:""}.</Vazio>
              <div style={{marginTop:20,display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}><button style={btnP} onClick={()=>iniciarGram(gm.af||undefined)}>Outra sessão</button><button style={btnS} onClick={()=>setGm(null)}>Fechar</button></div>
            </div>):gCur?(<>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <span style={{...lab,display:"inline-flex",alignItems:"center",gap:7}}><i style={{width:8,height:8,borderRadius:"50%",background:L(sel).cor}}/>{gm.af?(gAreas.find(a=>a[0]===gm.af)||[])[1]:"Sessão mista"}</span>
                <span style={lab}>{Math.min(gm.i+1,gm.fila.length)} / {gm.fila.length}</span>
              </div>
              <div style={{height:4,borderRadius:99,background:"rgba(var(--idi-rgb),.1)",overflow:"hidden",marginBottom:26}}><div style={{width:(gm.i/gm.fila.length*100)+"%",height:"100%",background:T.ink,transition:"width .3s"}}/></div>
              <div style={{...serif,fontSize:isMobile?25:32,lineHeight:1.45,wordBreak:"break-word",textAlign:"center"}}>{gm.fb?gFrase(gCur.q,gCur.f,false,gCur.r[0]):gFrase(gCur.q,gCur.f,gm.dica,null)}</div>
              {!gm.fb?(<>
                {gm.dica&&<div style={{marginTop:16,padding:"12px 14px",borderRadius:14,background:"rgba(var(--idi-rgb),.07)",fontSize:13.5,lineHeight:1.5,textAlign:"left"}}><span style={{...lab,marginRight:8}}>2ª tentativa</span>Ainda não. Revise o trecho marcado: {gCur.h}</div>}
                <div style={{marginTop:22,display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
                  <input autoFocus autoCapitalize="off" autoCorrect="off" spellCheck={false} style={{...inp,maxWidth:300,textAlign:"center"}} value={gm.resp} onChange={e=>setGm({...gm,resp:e.target.value})} onKeyDown={e=>{if(e.key==="Enter")gVerificar();}} placeholder="preencha a lacuna"/>
                  <button style={{...btnP,opacity:gm.resp.trim()?1:.4}} disabled={!gm.resp.trim()} onClick={gVerificar}>Verificar</button>
                </div>
                {gm.dica&&<div style={{marginTop:14,textAlign:"center"}}><button onClick={gMostrar} style={{background:"none",border:"none",cursor:"pointer",fontSize:12.5,textDecoration:"underline",textUnderlineOffset:3,color:"rgba(var(--idi-rgb),.55)"}}>mostrar resposta</button></div>}
              </>):(<>
                <div style={{marginTop:20,padding:"14px 16px",borderRadius:16,textAlign:"left",background:gm.fb.tipo==="er"?"rgba(168,50,50,.08)":"rgba(60,130,90,.1)"}}>
                  <div style={{...lab,color:gm.fb.tipo==="er"?IDI_RED:"#2F7A52"}}>{gm.fb.tipo==="ok"?(gm.fb.quase?"Correto · atenção à grafia":"Correto de primeira"):gm.fb.tipo==="aut"?"Autocorrigida · boa":"Resposta: "+gCur.r[0]}</div>
                  <div style={{fontSize:14,lineHeight:1.55,marginTop:8}}>{gCur.e}</div>
                  <div style={{...lab,marginTop:10,fontSize:9.5}}>{(gAreas.find(a=>a[0]===gCur.area)||[])[1]}</div>
                </div>
                <div style={{marginTop:22,textAlign:"center"}}><button style={{...btnP,minWidth:150}} onClick={gProx}>Próxima</button></div>
              </>)}
              <div style={{marginTop:20,textAlign:"center"}}><button onClick={()=>setGm(null)} style={{background:"none",border:"none",cursor:"pointer",fontSize:12,textDecoration:"underline",textUnderlineOffset:3,color:"rgba(var(--idi-rgb),.55)"}}>sair da sessão</button></div>
            </>):null}
          </Card>
        ):(<>
          <Card>
            <Titulo k="Intercalação" t="Gramática mista"/>
            <div style={{fontSize:14,lineHeight:1.6,opacity:.8,maxWidth:560}}>10 frases de áreas misturadas, para você decidir qual regra se aplica (é essa a habilidade da prova). No primeiro erro o app só <b>marca o trecho</b> e pede nova tentativa; no segundo mostra a resposta e a explicação. O que errar volta para a fila e alimenta suas dificuldades.</div>
            <div style={{marginTop:18}}><button style={btnP} onClick={()=>iniciarGram()}>Começar sessão mista</button></div>
          </Card>
          <Card>
            <Titulo k="Áreas" t={unica.nome+" · por área"}/>
            {gAreas.map(([k,nome],n)=>{const t=gTot(k),pc=gPct(k);const total=gItens.filter(x=>x.area===k).length;return (
              <div key={k} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderTop:n===0?"none":"1px solid rgba(var(--idi-rgb),.08)"}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:14.5,fontWeight:600}}>{nome}</div>
                  <div style={{height:5,borderRadius:99,background:"rgba(var(--idi-rgb),.1)",marginTop:7,overflow:"hidden"}}><div style={{width:(pc||0)+"%",height:"100%",background:pc!==null&&pc<60?IDI_RED:T.ink,transition:"width .4s"}}/></div>
                  <div style={{...lab,fontSize:9.5,marginTop:6}}>{t?`${pc}% · ${t} respostas`:"ainda não treinada"} · {total} exercícios</div>
                </div>
                <button style={{...btnS,padding:"8px 14px",fontSize:12}} onClick={()=>iniciarGram(k)}>Treinar</button>
              </div>);})}
          </Card>
        </>)}
      </>)}

      {/* ═ LEITURA ═ */}
      {sub==="ler"&&(<>
        <Card>
          <Titulo k="Input compreensível" t="Leitura"/>
          <div style={{fontSize:13.5,lineHeight:1.6,opacity:.75,marginBottom:14,maxWidth:600}}>Cole um texto (notícia, artigo, caso clínico). O app estima quantas palavras você já conhece. O ideal é <b>95 a 98%</b>. Toque numa palavra para marcar como conhecida ou criar um cartão com a frase original.</div>
          <input style={{...inp,marginBottom:10}} value={lt.titulo} onChange={e=>setLt({...lt,titulo:e.target.value})} placeholder="Título ou fonte (opcional)"/>
          <textarea style={{...inp,minHeight:120,resize:"vertical",lineHeight:1.5}} value={lt.texto} onChange={e=>setLt({...lt,texto:e.target.value})} placeholder={"Cole aqui um texto em "+unica.nome.toLowerCase()+"…"}/>
          <div style={{display:"flex",gap:10,marginTop:12,flexWrap:"wrap"}}>
            <button style={btnS} onClick={()=>setLt({titulo:"Exemplo: plantão",texto:LEIT_EX[sel]||""})}>Colar exemplo</button>
            <button style={{...btnS,opacity:lt.texto.trim()?1:.4}} disabled={!lt.texto.trim()} onClick={salvarTexto}>Salvar texto</button>
            {lt.texto&&<button style={btnS} onClick={()=>{setLt({titulo:"",texto:""});setLw(null);}}>Limpar</button>}
          </div>
        </Card>
        {toks.length>0&&(<>
          <Card>
            <Titulo k="Cobertura" t="Palavras que você conhece" dir={<div style={{...serif,fontSize:isMobile?38:48,lineHeight:1,color:cobPct>=95?"#2F7A52":cobPct>=90?T.ink:IDI_RED}}>{cobPct}%</div>}/>
            <div style={{position:"relative",height:12,borderRadius:99,background:"rgba(var(--idi-rgb),.1)",overflow:"hidden"}}>
              <div style={{position:"absolute",left:"95%",width:"3%",top:0,bottom:0,background:"rgba(60,130,90,.35)"}}/>
              <div style={{width:cobPct+"%",height:"100%",background:cobPct>=95?"#2F7A52":T.ink,borderRadius:99,transition:"width .4s"}}/>
            </div>
            <div style={{...lab,marginTop:8,display:"flex",justifyContent:"space-between"}}><span>meta 95 a 98%</span><span>{toks.length} palavras no texto</span></div>
            <div style={{fontSize:14,lineHeight:1.55,marginTop:12}}>{veredito}</div>
            <div style={{display:"flex",gap:16,flexWrap:"wrap",marginTop:12,fontSize:12.5}}>
              <span><b>{nK}</b> conhecidas</span>
              <span><b>{nA}</b> aprendendo</span>
              <span style={{color:IDI_RED}}><b>{nN}</b> novas ({novasTxt.length} diferentes)</span>
            </div>
            <div style={{fontSize:12,opacity:.6,marginTop:10,lineHeight:1.5}}>Conta como conhecida: palavra funcional comum, palavra que você marcou ou cartão em nível 2 ou mais. Formas flexionadas (ex.: plural, conjugação) contam como palavras diferentes.</div>
          </Card>
          <Card>
            <Titulo k="Texto" t={lt.titulo.trim()||"Toque nas palavras"}/>
            <div style={{display:"flex",gap:14,flexWrap:"wrap",marginBottom:12,fontSize:11.5,opacity:.8}}>
              <span>conhecida</span>
              <span style={{background:"rgba(var(--idi-rgb),.12)",borderRadius:4,padding:"0 5px"}}>aprendendo</span>
              <span style={{borderBottom:"2px solid "+T.acc,fontWeight:600}}>nova</span>
            </div>
            <div style={{fontSize:isMobile?17:18.5,lineHeight:1.85,whiteSpace:"pre-wrap",wordBreak:"break-word"}}>
              {(()=>{const out=[];let pos=0;toks.forEach((t,n)=>{
                if(t.i>pos)out.push(<span key={"t"+n}>{lt.texto.slice(pos,t.i)}</span>);
                const ativo=lw&&lw.i===t.i;
                out.push(<span key={"w"+n} onClick={()=>abrirPal(t)} style={{cursor:"pointer",borderRadius:4,padding:"0 1px",...(t.st==="a"?{background:"rgba(var(--idi-rgb),.12)"}:{}),...(t.st==="n"?{borderBottom:"2px solid "+T.acc,fontWeight:600}:{}),...(ativo?{background:T.ink,color:T.sheet}:{})}}>{t.w}</span>);
                pos=t.i+t.w.length;});
                if(pos<lt.texto.length)out.push(<span key="fim">{lt.texto.slice(pos)}</span>);return out;})()}
            </div>
          </Card>
          {novasTxt.length>0&&(
            <Card>
              <Titulo k="Para minerar" t="Palavras novas deste texto"/>
              <div style={{fontSize:12.5,opacity:.7,lineHeight:1.5,marginBottom:12}}>Toque nas que você <b>não</b> sabe para criar cartões. Depois, marque todo o resto como conhecido de uma vez.</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{novasTxt.slice(0,18).map(o=>(
                <button key={o.w} style={pillD} onClick={()=>abrirPal({w:o.w,i:o.i,st:"n"})}>{o.w}{o.n>1&&<span style={{opacity:.55}}>×{o.n}</span>}</button>))}</div>
              {novasTxt.length>18&&<div style={{...lab,marginTop:10}}>+ {novasTxt.length-18} no texto</div>}
              <div style={{marginTop:14}}><button style={btnS} onClick={()=>{setConh({...conh,[sel]:[...new Set([...conhL,...novasTxt.map(o=>o.w.toLowerCase())])]});setToast("Todas marcadas como conhecidas.");}}>Marcar todas as novas como conhecidas</button></div>
            </Card>)}
        </>)}
        {leit.filter(x=>x.lang===sel).length>0&&(
          <Card>
            <Titulo k="Biblioteca" t="Textos salvos"/>
            {leit.filter(x=>x.lang===sel).map((x,n)=>(
              <div key={x.id} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 0",borderTop:n===0?"none":"1px solid rgba(var(--idi-rgb),.08)"}}>
                <div style={{flex:1,minWidth:0}}><div style={{fontSize:14.5,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{x.titulo}</div><div style={{...lab,fontSize:9.5,marginTop:3}}>{tokenizarLeit(x.texto).length} palavras · {x.data}</div></div>
                <button style={{...btnS,padding:"7px 14px",fontSize:12}} onClick={()=>{setLt({titulo:x.titulo,texto:x.texto});setLw(null);window.scrollTo({top:0,behavior:"smooth"});}}>Abrir</button>
                <button onClick={()=>setLeit(leit.filter(y=>y.id!==x.id))} aria-label="remover" style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:"rgba(var(--idi-rgb),.35)"}}>×</button>
              </div>))}
          </Card>)}
      </>)}

      {/* ═ ESCUTA ═ */}
      {sub==="midia"&&(<>
        <Card>
          <Titulo k="Input real" t="Podcasts, séries e filmes" dir={<div style={{textAlign:"right"}}><div style={lab}>ouvir na semana</div><div style={{...serif,fontSize:isMobile?26:32,marginTop:4}}>{minOuvirSem}<small style={{fontSize:"50%",opacity:.55}}> min</small></div></div>}/>
          <div style={{fontSize:13.5,lineHeight:1.6,opacity:.78,maxWidth:620}}>Áudio de pessoas reais, com vozes e sotaques variados, é o melhor treino de ouvido. Assista ou ouça no app de sempre (Netflix, Spotify, YouTube) e use este espaço para <b>registrar</b> o tempo, medir o quanto você entendeu e <b>pescar frases</b> que viram cartão.</div>
        </Card>
        <Card>
          <Titulo k="Fontes" t={"O que você ouve em "+unica.nome.toLowerCase()}/>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>{MID_TIPOS.map(([k,l])=><button key={k} onClick={()=>setMfo({...mfo,tipo:k})} style={{height:34,padding:"0 16px",borderRadius:999,border:"1px solid "+T.ink,background:mfo.tipo===k?T.ink:"transparent",color:mfo.tipo===k?T.sheet:T.ink,fontSize:12.5,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>{l}</button>)}</div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            <input style={{...inp,flex:"1 1 200px",width:"auto"}} value={mfo.titulo} onChange={e=>setMfo({...mfo,titulo:e.target.value})} onKeyDown={e=>{if(e.key==="Enter")addFonte();}} placeholder={sel==="fr"?"Ex: Dix pour cent, Inner French":"Ex: Dark, Easy German, Tagesschau"}/>
            <button style={btnP} onClick={addFonte}>Adicionar</button>
          </div>
          {midiaL.length>0&&<div style={{marginTop:16}}>{midiaL.map((f,n)=>{const on=fonteAtual&&fonteAtual.id===f.id;const c=compF(f);return (
            <div key={f.id} onClick={()=>setMfonte(f.id)} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 10px",margin:"0 -10px",borderRadius:14,cursor:"pointer",background:on?"rgba(var(--idi-rgb),.07)":"transparent",borderTop:n===0?"none":"1px solid rgba(var(--idi-rgb),.08)"}}>
              <i style={{width:10,height:10,borderRadius:"50%",background:on?T.ink:"rgba(var(--idi-rgb),.2)",flexShrink:0}}/>
              <div style={{flex:1,minWidth:0}}><div style={{fontSize:14.5,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{f.titulo}</div><div style={{...lab,fontSize:9.5,marginTop:3}}>{(MID_TIPOS.find(x=>x[0]===f.tipo)||[0,f.tipo])[1]} · {minF(f)} min{c!==null?` · ${c}% entendido`:""}</div></div>
              <button onClick={e=>{e.stopPropagation();setMidia(midia.filter(x=>x.id!==f.id));}} aria-label="remover" style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:"rgba(var(--idi-rgb),.35)"}}>×</button>
            </div>);})}</div>}
        </Card>
        {fonteAtual&&(<>
          <Card>
            <Titulo k="Sessão" t={"Registrar: "+fonteAtual.titulo}/>
            <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"140px 1fr",gap:16,alignItems:"end"}}>
              <div><div style={{...lab,marginBottom:6}}>Minutos</div><input style={inp} type="number" min="1" value={ms.min} onChange={e=>setMs({...ms,min:e.target.value})} placeholder="40"/></div>
              <div><div style={{...lab,marginBottom:6}}>Quanto eu entendi: <b style={{color:T.ink}}>{ms.comp}%</b></div><input type="range" min="0" max="100" step="5" value={ms.comp} onChange={e=>setMs({...ms,comp:+e.target.value})}/></div>
            </div>
            <div style={{fontSize:13.5,lineHeight:1.5,marginTop:12,opacity:.85}}>{vereditoEscuta(ms.comp)}</div>
            <div style={{marginTop:14}}><button style={{...btnP,opacity:+ms.min>0?1:.4}} disabled={!(+ms.min>0)} onClick={registrarEscuta}>Registrar sessão</button></div>
          </Card>
          <Card>
            <Titulo k="Pescar" t="Frase que escapou"/>
            <div style={{fontSize:13,opacity:.7,lineHeight:1.5,marginBottom:12}}>Pausou e não entendeu um trecho? Escreva a frase como está na legenda (ou como você a decifrou) e marque o trecho que escapou. Vira um cartão de lacuna.</div>
            <textarea style={{...inp,minHeight:70,resize:"vertical",lineHeight:1.5}} value={mm.frase} onChange={e=>setMm({...mm,frase:e.target.value})} placeholder="Frase completa, no idioma original"/>
            <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:12,marginTop:12}}>
              <div><div style={{...lab,marginBottom:6}}>Trecho que escapou</div><input style={inp} value={mm.lacuna} onChange={e=>setMm({...mm,lacuna:e.target.value})} placeholder="palavra ou expressão da frase"/></div>
              <div><div style={{...lab,marginBottom:6}}>Tradução do trecho</div><input style={inp} value={mm.trad} onChange={e=>setMm({...mm,trad:e.target.value})} onKeyDown={e=>{if(e.key==="Enter")criarCartaoEscuta();}} placeholder="em português"/></div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:12,alignItems:"center",flexWrap:"wrap"}}>
              <input style={{...inp,maxWidth:150}} value={mm.tempo} onChange={e=>setMm({...mm,tempo:e.target.value})} placeholder="min:seg (opc.)"/>
              {pl&&<button style={{...btnS,padding:"9px 14px",fontSize:12}} onClick={()=>setMm({...mm,tempo:fmtMS(plRef.current?plRef.current.currentTime:plT)})}>usar tempo do player</button>}
            </div>
            {mm.frase.trim()&&mm.lacuna.trim()&&mmM<0&&<div style={{fontSize:12.5,color:IDI_RED,marginTop:10}}>Esse trecho não aparece na frase. Copie exatamente como está escrito.</div>}
            <div style={{marginTop:14}}><button style={{...btnP,opacity:mmM>=0&&mm.trad.trim()?1:.4}} disabled={!(mmM>=0&&mm.trad.trim())} onClick={criarCartaoEscuta}>Criar cartão</button></div>
          </Card>
        </>)}
        <Card>
          <Titulo k="Shadowing" t="Player com repetição de trecho"/>
          <div style={{fontSize:13,opacity:.7,lineHeight:1.5,marginBottom:12}}>Se você tiver um arquivo de áudio ou vídeo seu (podcast baixado, gravação), abra aqui para repetir um trecho em loop e falar junto, com atraso mínimo. O arquivo fica só no seu aparelho, não é enviado a lugar nenhum.</div>
          <input type="file" accept="audio/*,video/*" onChange={abrirArq} style={{fontSize:13,maxWidth:"100%"}}/>
          {pl&&(<div style={{marginTop:16}}>
            {pl.video
              ?<video ref={plRef} src={pl.url} preload="auto" controls playsInline onTimeUpdate={e=>setPlT(e.target.currentTime)} style={{width:"100%",borderRadius:14,background:"#000",maxHeight:300}}/>
              :<audio ref={plRef} src={pl.url} preload="auto" controls onTimeUpdate={e=>setPlT(e.target.currentTime)} style={{width:"100%"}}/>}
            <div style={{...lab,marginTop:8}}>{pl.nome} · {fmtMS(plT)}</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:12,alignItems:"center"}}>
              <span style={lab}>velocidade</span>
              {[0.75,0.9,1,1.15].map(v=><button key={v} onClick={()=>setPlV(v)} style={{height:32,padding:"0 13px",borderRadius:999,border:"1px solid "+T.ink,background:plV===v?T.ink:"transparent",color:plV===v?T.sheet:T.ink,fontSize:12.5,fontWeight:600,cursor:"pointer"}}>{v}x</button>)}
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:12}}>
              <button style={{...btnS,padding:"8px 14px",fontSize:12}} onClick={()=>{if(plRef.current)plRef.current.currentTime=Math.max(0,plRef.current.currentTime-5);}}>−5 s</button>
              <button style={{...btnS,padding:"8px 14px",fontSize:12}} onClick={()=>{if(plRef.current)plRef.current.currentTime+=5;}}>+5 s</button>
              <button style={{...btnS,padding:"8px 14px",fontSize:12}} onClick={()=>{setPlA(plRef.current?plRef.current.currentTime:plT);}}>Marcar início{plA!==null?" · "+fmtMS(plA):""}</button>
              <button style={{...btnS,padding:"8px 14px",fontSize:12}} onClick={()=>{setPlB(plRef.current?plRef.current.currentTime:plT);}}>Marcar fim{plB!==null?" · "+fmtMS(plB):""}</button>
              <button style={{...(plLoop?btnP:btnS),padding:"8px 14px",fontSize:12,opacity:plA!==null&&plB!==null&&plB>plA?1:.4}} disabled={!(plA!==null&&plB!==null&&plB>plA)} onClick={()=>{setPlLoop(!plLoop);if(!plLoop&&plRef.current){plRef.current.currentTime=plA;plRef.current.play();}}}>{plLoop?"Loop ligado":"Repetir trecho"}</button>
            </div>
            <div style={{fontSize:12.5,opacity:.65,lineHeight:1.55,marginTop:14}}>Roteiro: 1) ouça o trecho sem ler; 2) ouça lendo a transcrição; 3) repita junto, imitando ritmo e entonação; 4) grave você mesma e compare.</div>
          </div>)}
        </Card>
      </>)}

      {sub==="subst"&&(<>
        <Card style={{textAlign:"center",padding:isMobile?"26px 18px":"34px 28px"}}>
          {!ds&&(<>
            <div style={lab}>Treino</div>
            <div style={{...serif,fontSize:isMobile?34:44,margin:"10px 0 8px",lineHeight:1.05}}>Escreva o artigo<br/>e o substantivo</div>
            <div style={{display:"flex",justifyContent:"center",gap:8,margin:"14px 0 20px"}}>{ARTS.map(a=><span key={a} style={{background:ART_BG[a],color:ART_COR[a],fontWeight:700,fontSize:15,padding:"8px 16px",borderRadius:999}}>{a}</span>)}</div>
            <div style={{display:"flex",justifyContent:"center",gap:10,flexWrap:"wrap"}}>
              <button style={btnP} onClick={()=>iniciarDrill("art")}>Escrever artigo + palavra</button>
              <button style={btnS} onClick={()=>iniciarDrill("plural")}>Treinar plurais</button>
            </div>
            <div style={{...lab,marginTop:18}}>{poolAll.length} substantivos · {meusN.length} seus · o que você erra volta mais vezes</div>
          </>)}
          {ds&&ds.fim&&(<>
            <div style={lab}>Rodada concluída</div>
            <div style={{...serif,fontSize:isMobile?56:72,margin:"14px 0 6px",lineHeight:1}}>{ds.ok}<small style={{fontSize:"45%",opacity:.45}}> / {ds.ok+ds.er}</small></div>
            <Vazio>acertos. Os erros voltaram na mesma rodada e entram com prioridade na próxima.</Vazio>
            <div style={{display:"flex",justifyContent:"center",gap:10,marginTop:20,flexWrap:"wrap"}}><button style={btnP} onClick={()=>iniciarDrill(ds.modo)}>Nova rodada</button><button style={btnS} onClick={()=>setDs(null)}>Fechar</button></div>
          </>)}
          {dsCur&&(<>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <span style={lab}>{ds.modo==="plural"?"Escrever o plural":"Escrever artigo + palavra"}</span>
              <span style={lab}>{Math.min(ds.i+1,ds.fila.length)} / {ds.fila.length}</span>
            </div>
            <div style={{height:4,borderRadius:99,background:"rgba(var(--idi-rgb),.1)",overflow:"hidden",marginBottom:26}}><div style={{width:(ds.i/ds.fila.length*100)+"%",height:"100%",background:T.ink,transition:"width .3s"}}/></div>
            {ds.modo==="art"?(<>
              <div style={{...serif,fontSize:isMobile?44:58,lineHeight:1.08,wordBreak:"break-word",color:ds.resp?ART_COR[dsCur.art]:T.ink}}>{ds.resp?<NomeN lang={sel} art={dsCur.art} termo={dsCur.termo}/>:dsCur.trad}</div>
              {ds.resp?<div style={{fontSize:14,opacity:.6,marginTop:8}}>{dsCur.trad}</div>:(<div style={{fontSize:12.5,opacity:.6,marginTop:8}}>{ds.hint?`Começa com “${dsCur.termo[0].toUpperCase()}”`:"Escreva o artigo e o substantivo"}</div>)}
              {!ds.resp&&<div style={{maxWidth:440,marginLeft:"auto",marginRight:"auto",marginTop:26}}>
                <input style={{...inp,fontSize:18,textAlign:"center",padding:"14px 16px"}} autoFocus autoCapitalize="off" autoCorrect="off" spellCheck={false} value={ds.pin||""} onChange={e=>setDs({...ds,pin:e.target.value})} onKeyDown={e=>{if(e.key==="Enter")conferirArt();}} placeholder={`ex.: ${G.ph}`}/>
                <div style={{display:"flex",justifyContent:"center",gap:6,flexWrap:"wrap",marginTop:10}}>{G.chars.map(c=><button key={c} onClick={()=>setDs({...ds,pin:(ds.pin||"")+c})} style={{width:38,height:38,borderRadius:12,border:"1px solid rgba(var(--idi-rgb),.2)",background:"#fff",fontSize:16,cursor:"pointer",fontFamily:"inherit",color:T.ink,padding:0}}>{c}</button>)}</div>
                {sel==="fr"&&vogal(dsCur.termo)&&<div style={{fontSize:12,marginTop:10,opacity:.65,lineHeight:1.4}}>Antes de vogal, escreva le/la mesmo assim (ex.: la eau).</div>}
                <div style={{display:"flex",justifyContent:"center",gap:10,marginTop:16}}>
                  <button style={btnP} onClick={conferirArt}>Conferir</button>
                  {!ds.hint&&<button style={btnS} onClick={()=>setDs({...ds,hint:true})}>Dica: 1ª letra</button>}
                </div>
              </div>}
            </>):(<>
              <div style={{...serif,fontSize:isMobile?46:60,lineHeight:1.05,wordBreak:"break-word"}}><NomeN lang={sel} art={dsCur.art} termo={dsCur.termo}/></div>
              <div style={{fontSize:14,opacity:.6,marginTop:8}}>{dsCur.trad}</div>
              {!ds.resp&&<div style={{display:"flex",gap:10,marginTop:28,maxWidth:420,marginLeft:"auto",marginRight:"auto",alignItems:"center"}}>
                <span style={{...serif,fontSize:22,color:G.plCor}}>{G.plArt}</span>
                <input style={inp} autoFocus autoCapitalize="off" autoCorrect="off" spellCheck={false} value={ds.pin||""} onChange={e=>setDs({...ds,pin:e.target.value})} onKeyDown={e=>{if(e.key==="Enter")respPlural();}} placeholder="plural"/>
                <button style={btnP} onClick={respPlural}>OK</button>
              </div>}
            </>)}
            {ds.resp&&(()=>{const r=ds.resp;const sg=G.sug(dsCur.termo);const dc=dicaDe(dsCur);return (
              <div style={{marginTop:22,textAlign:"left",maxWidth:520,marginLeft:"auto",marginRight:"auto"}}>
                <div style={{padding:"14px 16px",borderRadius:18,background:r.ok?"#E3EFDB":"#F8E0D9",marginBottom:12}}>
                  <div style={{fontWeight:700,fontSize:15,color:r.ok?"#3C7030":"#B23F2A"}}>{r.ok?"✓ Certo":ds.modo==="art"?(!r.artOk&&!r.nounOk?"✗ Artigo e substantivo":!r.artOk?"✗ Artigo errado":"✗ Ortografia do substantivo"):`✗ Era: ${G.plArt} ${dsCur.plural}`}</div>
                  {ds.modo==="art"&&<div style={{fontSize:13,marginTop:6,opacity:.8}}>Você escreveu: <i>{r.txt||"(nada)"}</i>{r.cap?" — lembre: em alemão, substantivos levam letra maiúscula.":""}</div>}
                  <div style={{fontSize:14,marginTop:6,lineHeight:1.5}}><NomeN lang={sel} art={dsCur.art} termo={dsCur.termo}/>{dsCur.plural&&<> · <span style={{color:G.plCor,fontWeight:700}}>{G.plArt}</span> {dsCur.plural}</>}</div>
                </div>
                <div style={{fontSize:13,lineHeight:1.5,color:"rgba(var(--idi-rgb),.75)"}}>
                  {sg?(sg.art===dsCur.art?<>Terminação <b>{sg.suf}</b> → <b style={{color:ART_COR[sg.art]}}>{sg.art}</b> ({sg.conf}).</>:<><b>Exceção!</b> A terminação <b>{sg.suf}</b> sugere <b style={{color:ART_COR[sg.art]}}>{sg.art}</b>, mas esta palavra é <b style={{color:ART_COR[dsCur.art]}}>{dsCur.art}</b>.</>):"Sem regra de terminação confiável: use cor e gancho."}
                </div>
                {dc&&dicaEd!==dsCur.k&&<div style={{fontSize:13,marginTop:8,padding:"10px 14px",borderRadius:14,background:"#FBF1D8",lineHeight:1.5}}>💡 {dc}</div>}
                {dicaEd===dsCur.k?(
                  <div style={{display:"flex",gap:8,marginTop:10}}><input style={inp} autoFocus value={dicaTxt} onChange={e=>setDicaTxt(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")salvarDica(dsCur.k,dicaTxt);}} placeholder="Ex: imagine a chave dentro de uma lata (die)"/><button style={btnP} onClick={()=>salvarDica(dsCur.k,dicaTxt)}>Salvar</button></div>
                ):(
                  <button onClick={()=>{setDicaEd(dsCur.k);setDicaTxt((sbst[dsCur.k]&&sbst[dsCur.k].dica)||"");}} style={{background:"none",border:"none",cursor:"pointer",fontSize:12.5,textDecoration:"underline",textUnderlineOffset:3,color:"rgba(var(--idi-rgb),.65)",padding:"10px 0 0"}}>{dc?"editar gancho":"criar gancho de memória"}</button>)}
                <div style={{textAlign:"center",marginTop:18}}><button style={btnP} onClick={proxDrill}>{ds.i+1>=ds.fila.length?"Finalizar":"Próxima"}</button></div>
              </div>);})()}
            <div style={{marginTop:18}}><button onClick={()=>setDs(null)} style={{background:"none",border:"none",cursor:"pointer",fontSize:12,textDecoration:"underline",textUnderlineOffset:3,color:"rgba(var(--idi-rgb),.55)"}}>sair do treino</button></div>
          </>)}
        </Card>

        <div className="idi-grid2">
          <Card>
            <Titulo k="Desempenho" t="Acerto por artigo" dir={<div style={{textAlign:"right"}}><div style={lab}>geral</div><div style={{...serif,fontSize:isMobile?28:34,marginTop:4,color:IDI_RED}}>{totArtOk+totArtEr>0?Math.round(totArtOk/(totArtOk+totArtEr)*100)+"%":"—"}</div></div>}/>
            {ARTS.map(a=>{const p=pctArt(a);return (
              <div key={a} style={{display:"grid",gridTemplateColumns:"46px 1fr 78px",alignItems:"center",gap:12,padding:"8px 0"}}>
                <span style={{fontWeight:700,color:ART_COR[a],fontSize:15}}>{a}</span>
                <div style={{height:10,borderRadius:99,background:ART_BG[a],overflow:"hidden"}}><div style={{width:(p||0)+"%",height:"100%",background:ART_COR[a],borderRadius:99,transition:"width .4s"}}/></div>
                <span style={{...lab,textAlign:"right",fontSize:9.5}}>{p===null?"sem dados":`${p}% · ${statsArt[a].ok+statsArt[a].er}`}</span>
              </div>);})}
            {piorArt&&<div style={{fontSize:13,marginTop:10,lineHeight:1.5,color:"rgba(var(--idi-rgb),.75)"}}>Onde você mais erra: <b style={{color:ART_COR[piorArt]}}>{piorArt}</b>.</div>}
          </Card>
          <Card>
            <Titulo k="Revisar primeiro" t="Mais difíceis"/>
            {dificeis.length===0?<Vazio>Os substantivos que você errar aparecem aqui, com seu gancho de memória.</Vazio>:dificeis.map(({n,x})=>(
              <div key={n.k} style={{padding:"10px 0",borderTop:"1px solid rgba(var(--idi-rgb),.08)"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{flex:1,minWidth:0,fontSize:14.5,fontWeight:600}}><span style={{color:ART_COR[n.art],fontWeight:700}}>{n.art}</span> {n.termo}{n.plural&&<span style={{fontWeight:400,opacity:.5,fontSize:12.5}}> · pl. {n.plural}</span>}</div>
                  <span style={{...lab,fontSize:9.5,color:IDI_RED}}>{x.er} {x.er===1?"erro":"erros"}</span>
                  <button onClick={()=>{setDicaEd("h:"+n.k);setDicaTxt(x.dica||"");}} style={{background:"none",border:"none",cursor:"pointer",fontSize:15}} aria-label="gancho">💡</button>
                </div>
                {dicaEd==="h:"+n.k?(
                  <div style={{display:"flex",gap:8,marginTop:8}}><input style={inp} autoFocus value={dicaTxt} onChange={e=>setDicaTxt(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")salvarDica(n.k,dicaTxt);}} placeholder="Seu gancho de memória"/><button style={btnP} onClick={()=>salvarDica(n.k,dicaTxt)}>OK</button></div>
                ):dicaDe(n)&&<div style={{fontSize:12.5,marginTop:6,opacity:.7,lineHeight:1.4}}>💡 {dicaDe(n)}</div>}
              </div>))}
          </Card>
        </div>

        <Card>
          <Titulo k="Atalhos que funcionam" t="Regras de terminação"/>
          <div style={{fontSize:13.5,lineHeight:1.55,color:"rgba(var(--idi-rgb),.75)",marginBottom:14}}>Regra de ouro: nunca decore o substantivo sozinho. Aprenda sempre <b>artigo + palavra + plural</b>, e associe uma cor: {ARTS.map((a,i)=><span key={a}>{i>0?", ":""}<b style={{color:ART_COR[a]}}>{a} {ART_NOME[a]}</b></span>)}.{G.pl&&<><br/><br/>{G.pl}</>}</div>
          <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":`repeat(${ARTS.length},1fr)`,gap:14}}>
            {ARTS.map(a=>(
              <div key={a} style={{background:ART_BG[a],borderRadius:18,padding:"16px 16px 6px"}}>
                <div style={{...serif,fontSize:30,color:ART_COR[a],fontWeight:400,marginBottom:6}}>{a}</div>
                {G.regras[a].map(([t,ex])=>(
                  <div key={t} style={{padding:"10px 0",borderTop:"1px solid "+ART_COR[a]+"33"}}>
                    <div style={{fontWeight:700,fontSize:13.5}}>{t}</div>
                    <div style={{fontSize:12.5,marginTop:3,opacity:.75,lineHeight:1.45}}>{ex}</div>
                  </div>))}
              </div>))}
          </div>
        </Card>

        <Card>
          <Titulo k="Banco básico" t="Explorar e adicionar" dir={<button style={{...btnS,padding:"8px 14px",fontSize:12}} onClick={()=>setVerBanco(!verBanco)}>{verBanco?"fechar":"abrir"}</button>}/>
          {!verBanco?<Vazio>{G.banco.length} substantivos comuns (A1–B1) com artigo, plural e dicas. Adicione os que quiser às suas palavras para entrar na revisão espaçada.</Vazio>:(<>
            <input style={{...inp,marginBottom:12}} value={bancoBusca} onChange={e=>setBancoBusca(e.target.value)} placeholder="Buscar palavra ou tradução…"/>
            <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":`repeat(${ARTS.length},1fr)`,gap:14}}>
              {ARTS.map(a=>(
                <div key={a} style={{background:ART_BG[a],borderRadius:18,padding:"12px 14px",maxHeight:380,overflowY:"auto"}}>
                  <div style={{fontWeight:700,color:ART_COR[a],fontSize:15,marginBottom:6}}>{a}</div>
                  {bancoFiltrado.filter(n=>n.art===a).map(n=>(
                    <div key={n.k} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderTop:"1px solid "+ART_COR[a]+"26"}}>
                      <div style={{flex:1,minWidth:0}}><div style={{fontSize:13.5,fontWeight:600}}>{n.termo}{n.plural&&<span style={{fontWeight:400,opacity:.5,fontSize:11.5}}> · {n.plural}</span>}</div><div style={{fontSize:11.5,opacity:.65}}>{n.trad}</div></div>
                      {chavesMeus.has(n.k)?<span style={{fontSize:13,color:ART_COR[a]}}>✓</span>:<button onClick={()=>addBanco(n)} aria-label="adicionar" style={{width:26,height:26,borderRadius:"50%",border:"1px solid "+ART_COR[a],background:"transparent",color:ART_COR[a],cursor:"pointer",fontSize:15,lineHeight:1,padding:0}}>+</button>}
                    </div>))}
                </div>))}
            </div>
          </>)}
        </Card>
      </>)}

      {/* ═ EVOLUÇÃO ═ */}
      {sub==="evol"&&(<>
        <Card>
          <Titulo k="Últimas 8 semanas" t="Horas por semana"/>
          <div style={{display:"flex",alignItems:"flex-end",gap:isMobile?6:14,height:150}}>
            {semanas.map((w,i)=>{const tot=w.por.reduce((a,x)=>a+x.min,0);return (
              <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end",height:"100%",gap:6}}>
                <span style={{...lab,fontSize:9,color:T.ink}}>{tot>0?(tot/60).toFixed(1).replace(".0","")+"h":""}</span>
                <div style={{width:"100%",maxWidth:44,display:"flex",flexDirection:"column-reverse",gap:2,height:(tot/maxSem*100)+"px",minHeight:tot>0?3:0}}>
                  {w.por.map(x=>x.min>0&&<div key={x.l.id} style={{flex:x.min,background:x.l.cor,borderRadius:4,minHeight:2}}/>)}
                </div>
              </div>);})}
          </div>
          <div style={{display:"flex",gap:isMobile?6:14,marginTop:8}}>{semanas.map((w,i)=><div key={i} style={{flex:1,textAlign:"center",...lab,fontSize:8.5}}>{fd(w.ini)}</div>)}</div>
          <div style={{display:"flex",gap:16,marginTop:14,flexWrap:"wrap"}}>{ativas.map(l=><span key={l.id} style={{...lab,display:"inline-flex",alignItems:"center",gap:7}}><i style={{width:8,height:8,borderRadius:"50%",background:l.cor}}/>{l.nome}</span>)}</div>
        </Card>
        <div className="idi-grid2">
          <Card>
            <Titulo k="Vocabulário" t="Palavras acumuladas" dir={<div style={{textAlign:"right"}}><div style={lab}>total</div><div style={{...serif,fontSize:isMobile?26:32,marginTop:4}}>{vocSel.length}</div></div>}/>
            <svg viewBox="0 0 300 110" width="100%" style={{display:"block",overflow:"visible"}}>
              {[0,1,2,3].map(i=><line key={i} x1="0" x2="300" y1={10+i*30} y2={10+i*30} stroke="rgba(var(--idi-rgb),.08)"/>)}
              {serieV.map(s=>{const pts=s.pts.map((v,i)=>[i*(300/7),100-(v/maxV)*90]);return (
                <g key={s.l.id}>
                  <polyline fill="none" stroke={s.l.cor} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" points={pts.map(p=>p.join(",")).join(" ")}/>
                  {pts.map((p,i)=><circle key={i} cx={p[0]} cy={p[1]} r={i===7?4:2.2} fill={s.l.cor}/>)}
                </g>);})}
            </svg>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:10,flexWrap:"wrap",gap:8}}>
              <span style={lab}>{dominadas} dominadas</span>
              <span style={lab}>acerto nas revisões: {acertoV===null?"—":acertoV+"%"}</span>
            </div>
          </Card>
          <Card>
            <Titulo k="Últimos 30 dias" t="Onde o tempo vai"/>
            {porTipo.every(t=>t.min===0)?<Vazio>Registre práticas para ver a distribuição por habilidade.</Vazio>:porTipo.map(t=>(
              <div key={t.id} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 0"}}>
                <span style={{...lab,width:78,flexShrink:0,color:T.ink}}>{t.n}</span>
                <div style={{flex:1,height:8,borderRadius:99,background:"rgba(var(--idi-rgb),.08)",overflow:"hidden"}}><div style={{width:(t.min/maxTipo*100)+"%",height:"100%",background:T.ink,borderRadius:99}}/></div>
                <span style={{...lab,width:46,textAlign:"right"}}>{t.min>=60?(t.min/60).toFixed(1).replace(".0","")+"h":t.min+"m"}</span>
              </div>))}
          </Card>
        </div>
        <Card>
          <Titulo k="Habilidades" t="Autoavaliação"/>
          {HAB.map(([id,n])=>{const u=avUlt?avUlt[id]:null, a=avAnt?avAnt[id]:null, dl=u!=null&&a!=null?u-a:0;const cor=L(avLangAtual).cor;return (
            <div key={id} style={{display:"grid",gridTemplateColumns:isMobile?"88px 1fr 52px":"110px 1fr 70px",alignItems:"center",gap:12,padding:"9px 0"}}>
              <span style={{...lab,color:T.ink}}>{n}</span>
              <div style={{display:"flex",gap:4}}>{[1,2,3,4,5].map(i=><i key={i} style={{flex:1,height:9,borderRadius:99,background:u!=null&&i<=u?cor:"rgba(var(--idi-rgb),.1)"}}/>)}</div>
              <span style={{...lab,textAlign:"right",color:dl>0?"#4C7A3A":dl<0?IDI_RED:undefined,fontWeight:dl?700:400}}>{u==null?"—":dl>0?"▲ +"+dl:dl<0?"▼ "+dl:"= "+u}</span>
            </div>);})}
          <div style={{height:1,background:"rgba(var(--idi-rgb),.1)",margin:"14px 0"}}/>
          <div style={{...lab,marginBottom:10}}>Nova avaliação · {L(avLangAtual).nome}{avs.length?` · ${avs.length} registrada${avs.length>1?"s":""}`:""}</div>
          <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:"10px 28px"}}>
            {HAB.map(([id,n])=>(
              <div key={id} style={{display:"grid",gridTemplateColumns:"88px 1fr 18px",alignItems:"center",gap:10}}>
                <span style={{fontSize:13}}>{n}</span>
                <input type="range" min="1" max="5" step="1" value={avN[id]} onChange={e=>setAvN({...avN,[id]:+e.target.value})}/>
                <span style={{fontWeight:700,fontSize:13}}>{avN[id]}</span>
              </div>))}
          </div>
          <div style={{marginTop:16}}><button style={btnP} onClick={salvarAval}>Salvar avaliação</button></div>
        </Card>
        <Card>
          <Titulo k="Trajetória" t="Marcos"/>
          {marcosSel.length===0?<Vazio>Mudanças de nível entram aqui automaticamente. Adicione provas, certificados e viagens.</Vazio>:marcosSel.map(m=>(
            <div key={m.id} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 0",borderTop:"1px solid rgba(var(--idi-rgb),.08)"}}>
              <i style={{width:12,height:12,borderRadius:m.tipo==="nivel"?"3px":"50%",background:L(m.lang).cor,flexShrink:0,transform:m.tipo==="nivel"?"rotate(45deg)":"none"}}/>
              <div style={{flex:1,minWidth:0}}><div style={{fontSize:14.5,fontWeight:600}}>{m.titulo}</div><div style={{...lab,fontSize:9.5,marginTop:3}}>{L(m.lang).nome} · {fdFull(m.data)}</div></div>
              <button onClick={()=>setMarcos(marcos.filter(x=>x.id!==m.id))} aria-label="remover" style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:"rgba(var(--idi-rgb),.35)"}}>×</button>
            </div>))}
          <div style={{display:"flex",gap:10,marginTop:14,flexWrap:"wrap"}}>
            <input style={{...inp,flex:"1 1 180px",width:"auto"}} value={fm.titulo} onChange={e=>setFm({...fm,titulo:e.target.value})} onKeyDown={e=>{if(e.key==="Enter")addMarco();}} placeholder="Ex: Prova Goethe B1, primeira conversa…"/>
            <button style={btnP} onClick={addMarco}>Adicionar</button>
          </div>
        </Card>
      </>)}

      </div></div>

      {cron&&sub!=="pratica"&&(
        <div style={{position:"fixed",left:"50%",transform:"translateX(-50%)",bottom:16,width:"min(520px, calc(100% - 28px))",zIndex:60,background:T.ink,color:T.sheet,borderRadius:999,padding:"8px 8px 8px 18px",display:"flex",alignItems:"center",gap:12,boxShadow:"0 18px 40px -12px rgba(0,0,0,.55)",border:"1px solid rgba(var(--idi-hrgb),.25)"}}>
          <i style={{width:9,height:9,borderRadius:"50%",background:L(cron.lang).cor,flexShrink:0,animation:cronRodando?"idiPulse 1.4s ease-in-out infinite":"none"}}/>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontFamily:"'DM Mono',ui-monospace,monospace",fontSize:17,letterSpacing:".04em",fontVariantNumeric:"tabular-nums",lineHeight:1.1}}>{fmtT(decorrido)}</div>
            <div style={{fontSize:11,opacity:.7,marginTop:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{L(cron.lang).nome} · {tipoNome(cron.tipo)}</div>
          </div>
          <button onClick={cronRodando?pausarCron:retomarCron} aria-label={cronRodando?"Pausar":"Continuar"} style={{width:40,height:40,borderRadius:"50%",border:"1px solid rgba(var(--idi-hrgb),.35)",background:"transparent",color:T.sheet,cursor:"pointer",display:"inline-flex",alignItems:"center",justifyContent:"center",padding:0}}>
            {cronRodando?<svg width="14" height="14" viewBox="0 0 14 14"><rect x="2" y="1" width="3.5" height="12" rx="1" fill="currentColor"/><rect x="8.5" y="1" width="3.5" height="12" rx="1" fill="currentColor"/></svg>:<svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 1.5v11l9-5.5z" fill="currentColor"/></svg>}
          </button>
          <button onClick={finalizarCron} aria-label="Finalizar e salvar" style={{width:40,height:40,borderRadius:"50%",border:"none",background:T.acc,color:T.ink,cursor:"pointer",display:"inline-flex",alignItems:"center",justifyContent:"center",padding:0}}>
            <svg width="13" height="13" viewBox="0 0 13 13"><rect x="1" y="1" width="11" height="11" rx="2" fill="currentColor"/></svg>
          </button>
        </div>)}
      {sub==="ler"&&lw&&(
        <div style={{position:"fixed",left:0,right:0,bottom:0,zIndex:62,display:"flex",justifyContent:"center",pointerEvents:"none"}}>
          <div style={{pointerEvents:"auto",width:"min(640px,100%)",background:"#fff",borderRadius:"24px 24px 0 0",boxShadow:"0 -12px 40px rgba(0,0,0,.28)",padding:isMobile?"18px 18px 22px":"22px 26px 26px",maxHeight:"72vh",overflowY:"auto",color:T.ink}}>
            <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",gap:12}}>
              <div style={{...serif,fontSize:isMobile?30:36,lineHeight:1.1,wordBreak:"break-word"}}>{lw.w}</div>
              <button onClick={()=>setLw(null)} aria-label="fechar" style={{background:"none",border:"none",cursor:"pointer",fontSize:24,lineHeight:1,color:"rgba(var(--idi-rgb),.5)"}}>×</button>
            </div>
            <div style={{...lab,marginTop:4}}>{jaCartao?`já nos seus cartões · nível ${jaCartao.box||0}`:conhSet.has(lw.w.toLowerCase())?"marcada como conhecida":funcSet.has(lw.w.toLowerCase())?"palavra funcional":"nova"}</div>
            <div style={{fontSize:13.5,lineHeight:1.55,marginTop:12,opacity:.85,fontStyle:"italic"}}>{lt.texto.slice(lw.fr.ini,lw.i)}<b style={{borderBottom:"2px solid "+T.acc}}>{lw.w}</b>{lt.texto.slice(lw.i+lw.w.length,lw.fr.fim)}</div>
            {!jaCartao&&(<>
              <input style={{...inp,marginTop:14}} value={lf.trad} onChange={e=>setLf({...lf,trad:e.target.value})} onKeyDown={e=>{if(e.key==="Enter")criarCartaoLeit();}} placeholder="Tradução (obrigatória para criar o cartão)"/>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:10,alignItems:"center"}}><span style={lab}>se for substantivo</span>{ARTS.map(a=>{const on=lf.art===a;return <button key={a} onClick={()=>setLf({...lf,art:on?"":a})} style={{height:32,minWidth:54,padding:"0 14px",borderRadius:999,border:"1px solid "+ART_COR[a],background:on?ART_COR[a]:ART_BG[a],color:on?"#fff":ART_COR[a],fontSize:12.5,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>{a}</button>;})}</div>
            </>)}
            <div style={{display:"flex",gap:10,marginTop:16,flexWrap:"wrap"}}>
              {!jaCartao&&<button style={{...btnP,opacity:lf.trad.trim()?1:.4}} disabled={!lf.trad.trim()} onClick={criarCartaoLeit}>Criar cartão</button>}
              {conhSet.has(lw.w.toLowerCase())?<button style={btnS} onClick={desmarcarConhecida}>Desmarcar conhecida</button>:(!jaCartao&&!funcSet.has(lw.w.toLowerCase())&&<button style={btnS} onClick={marcarConhecida}>Já sei</button>)}
            </div>
            {!jaCartao&&<div style={{fontSize:12,opacity:.6,marginTop:10}}>O cartão guarda a frase do texto com a palavra como lacuna, e entra no limite diário de novas.</div>}
          </div>
        </div>)}

      {toast&&<div role="status" style={{position:"fixed",left:"50%",transform:"translateX(-50%)",bottom:cron&&sub!=="pratica"?84:20,zIndex:61,background:T.ink,color:T.sheet,borderRadius:999,padding:"11px 20px",fontSize:13,fontWeight:600,boxShadow:"0 14px 34px -12px rgba(0,0,0,.5)",maxWidth:"calc(100% - 28px)",textAlign:"center"}}>{toast}</div>}
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
            <div style={{fontSize:9,fontWeight:500,color:"rgba(26,18,9,0.6)",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'DM Mono',ui-monospace,monospace",marginBottom:3}}>{x.l}</div>
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
                  <span style={{fontSize:12,color:"#1A1209",fontFamily:"'DM Sans',sans-serif"}}><CatLabel text={cat} size={13}/></span>
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
                <div style={{width:`${Math.min(c.pct,100)}%`,height:"100%",background:c.pct>100?"#FF8A80":c.pct>80?"#FFD580":"#B91D55",borderRadius:99,transition:"width .5s"}}/>
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
                    <span style={{fontSize:13,fontWeight:700,color:"#1A1209",fontFamily:"'DM Sans',sans-serif"}}><CatLabel text={pai} size={14}/></span>
                    <span style={{fontSize:12,fontWeight:700,color:"#8B1A1A",fontFamily:"'DM Sans',sans-serif"}}>{R(total)}</span>
                  </div>
                  {/* Subcategorias */}
                  {subList.map(([sub, val],idx)=>{
                    const pct = total>0 ? val/total*100 : 0;
                    const alerta = pct >= 60;
                    const color = alerta ? "#C0392B" : idx===0 ? "#B91D55" : "#5B7C94";
                    return (
                      <div key={sub} style={{marginBottom:8}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                          <div style={{display:"flex",alignItems:"center",gap:6}}>
                            {alerta&&<span style={{width:7,height:7,borderRadius:99,background:"#C0392B",flexShrink:0}}/>}
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
                        {alerta&&<div style={{fontSize:10,color:"#C0392B",fontFamily:"'DM Sans',sans-serif",marginTop:2,fontWeight:600}}><Glyph e="⚠" size={11} style={{marginRight:3}}/>Representa {pct.toFixed(0)}% de todos os gastos com {pai.split(" ").slice(1).join(" ")}</div>}
                      </div>
                    );
                  })}
                </div>
              );
            })}
            {/* Legenda de alertas */}
            <div style={{background:"rgba(192,57,43,0.07)",border:"1px solid rgba(192,57,43,0.2)",borderRadius:10,padding:"8px 12px",marginTop:4}}>
              <div style={{fontSize:11,fontWeight:700,color:"#C0392B",fontFamily:"'DM Sans',sans-serif",marginBottom:2,display:"flex",alignItems:"center",gap:5}}><span style={{width:7,height:7,borderRadius:99,background:"#C0392B",flexShrink:0}}/>Como interpretar os alertas</div>
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
  {cat:"🍔 Alimentação", keys:["ifood","rappi","uber eat","delivery","restaur","lanchon","mcdonalds","burger","subway","pizza","padaria","mercado","supermercado","pao de acucar","carrefour","atacadao","hortifruti","acougue","sushi","churrasco","habib","bob's","bobs","spoleto","giraffas","outback","coco bambu","cafe","cafeteria","starbucks","kopenhagen","cacau show","doceria","sorveteria","hamburgueria","padoca","empório","emporio","adega","hortifrutti","zona sul","pao acucar","assai","extra ","dia %","dia supermercado"]},
  {cat:"🚗 Transporte",  keys:["uber","99app","99 ","taxi","táxi","gasolina","combustiv","posto ","shell","ipiranga","br distribu","estacionam","pedágio","pedagio","metro","ônibus","onibus","trem","brt","zona azul","estapar","multipark","bh trans","move buh","move bh"]},
  {cat:"🏠 Moradia",     keys:["aluguel","condomin","iptu","água","agua","sabesp","celesc","copel","cemig","coelba","energia","luz ","esgoto","gás","gas encanado","comgas","light ","enel","cedae","copasa","síndico","sindico","imobiliária","imobiliaria"]},
  {cat:"💊 Saúde",       keys:["farmácia","farmacia","drogaria","droga raia","drogasil","pacheco","panvel","hospital","clínica","clinica","médico","medico","plano de saude","unimed","hapvida","amil","sulamerica","sul america","bradesco saude","academia","smart fit","bio ritmo","bodytech","consultorio","consultório","dentista","odonto","laboratório","laboratorio","exame","psicólog","psicolog","terapia","fisioterapia"]},
  {cat:"💅 Cuidados Pessoais", keys:["salão","salao","cabelei","manicure","unha","depilação","depilacao","estética","estetica","barbearia","spa ","massagem","nail","sobrancelha"]},
  {cat:"🎭 Lazer",       keys:["netflix","spotify","amazon prime","disney","hbo","deezer","youtube premium","youtube","cinema","teatro","ingresso","airbnb","booking","show ","balada","bar ","festa","viagem","hotel","pousada","cvc","decolar","latam","gol linhas","azul linhas","despegar"]},
  {cat:"👕 Vestuário",   keys:["renner","riachuelo","c&a","zara","h&m","roupas","calçados","calcados","sapatos","americanas","marisa","shein","centauro","nike","adidas","hering","forever 21"]},
  {cat:"📚 Educação",    keys:["escola","faculdade","universidade","curso","livro","saraiva","estácio","estacio","anhanguera","unip","alura","udemy","coursera","hotmart"]},
  {cat:"💡 Contas",      keys:["claro","vivo","tim ","oi ","net ","giga","internet","celular","telefone","google ","apple ","icloud","microsoft","recarga","nubank fatura","fatura nubank"]},
];

const KEYWORD_CATS_RECEITA = [
  {cat:"🏥 Plantão", keys:["plantao","plantão","upa ","hospital","pronto socorro","pronto atendimento"]},
  {cat:"💼 Consultório", keys:["consultorio","consultório","particular"]},
  {cat:"💰 Investimento", keys:["rendimento","dividendo","resgate","juros"]},
];

// Mapeia as categorias que o PRÓPRIO cartão/banco já manda no extrato/fatura pras nossas categorias.
// Usamos isso com prioridade máxima — o banco já sabe onde foi gasto, é mais confiável que adivinhar.
const CATEGORIA_BANCO_MAP = [
  {match:["automotivo","posto","combustivel","pedagio","estacionamento"], cat:"🚗 Transporte"},
  {match:["transporte","uber","taxi","aplicativo de transporte"], cat:"🚗 Transporte"},
  {match:["companhia aerea","cia aerea","aereo","hospedagem"], cat:"🎭 Lazer"},
  {match:["vestuario","roupas","calcados"], cat:"👕 Vestuário"},
  {match:["assistencia medica","farmacia","saude","odontolog"], cat:"💊 Saúde"},
  {match:["cuidados pessoais","salao","beleza","estetica"], cat:"💅 Cuidados Pessoais"},
  {match:["entretenimento","lazer","streaming"], cat:"🎭 Lazer"},
  {match:["supermercado","mercearia","padaria","conveniencia"], cat:"🍔 Alimentação"},
  {match:["restaurante","lanchonete","bar","alimentacao"], cat:"🍔 Alimentação"},
  {match:["educacao","livraria","curso","ensino"], cat:"📚 Educação"},
  {match:["moradia","condominio","aluguel","casa"], cat:"🏠 Moradia"},
  {match:["telefonia","internet","assinatura de servicos"], cat:"💡 Contas"},
];
function mapCategoriaBanco(catBanco) {
  if(!catBanco||catBanco.trim()==="-") return null;
  const d = catBanco.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  for(const {match,cat} of CATEGORIA_BANCO_MAP) {
    if(match.some(k=>d.includes(k))) return cat;
  }
  return null;
}
// Linhas de "inclusão de pagamento" / "pagamento de fatura" são o pagamento do cartão em si — não uma compra
const PAYMENT_KEYS = ["inclusao de pagamento","inclusão de pagamento","pagamento recebido","pagto recebido"];
function isFaturaPayment(desc, categoriaBanco) {
  const d = (desc||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  return PAYMENT_KEYS.some(k=>d.includes(k)) && (!categoriaBanco||categoriaBanco.trim()==="-");
}

const TRANSFER_KEYS = ["aplicação em fundo","aplicacao em fundo","aplicacao fundo","invest","resgate fundo","cdb","lci","lca","tesouro","poupança","poupanca","fundo de invest","pagamento fatura","pagamento de fatura","fatura cartao","fatura cartão","transferencia entre contas","transferência entre contas"];

function isTransfer(desc) {
  const d = (desc||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  return TRANSFER_KEYS.some(k=>d.includes(k));
}

// guessCat: retorna {categoria, confiante} — confiante=false quando caiu no fallback genérico "Outros"
function guessCat(desc, tipo) {
  const d = (desc||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  const lista = tipo==="entrada" ? KEYWORD_CATS_RECEITA : KEYWORD_CATS;
  for(const {cat, keys} of lista) {
    if(keys.some(k=>d.includes(k))) return {categoria:cat, confiante:true};
  }
  return {categoria:"📦 Outros", confiante:false};
}

// Extrai as "palavras significativas" de uma descrição (ignora números, datas, palavras muito curtas)
function palavrasChave(desc) {
  return (desc||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .replace(/[^a-z0-9\s]/g," ").split(/\s+/).filter(w=>w.length>=3&&!/^\d+$/.test(w));
}

// Categorização inteligente: primeiro tenta achar algo parecido no histórico da pessoa
// (o que ela já categorizou antes é mais confiável que qualquer lista fixa de palavras-chave).
// Retorna {categoria, confiante} — confiante=false quando nada bateu e caiu no "Outros" genérico.
function guessCatSmart(desc, movsHistorico, tipo) {
  const palavrasNovo = [...new Set(palavrasChave(desc))];
  if(palavrasNovo.length>0 && movsHistorico && movsHistorico.length>0){
    const candidatos=[];
    movsHistorico.forEach(m=>{
      if(tipo&&m.tipo!==tipo)return; // só compara com o mesmo tipo (entrada com entrada, saída com saída)
      if(m.tipo!=="saida"&&m.tipo!=="entrada")return;
      const palavrasHist = [...new Set(palavrasChave(m.descricao))];
      if(palavrasHist.length===0)return;
      const comuns = palavrasNovo.filter(p=>palavrasHist.includes(p)).length;
      if(comuns>0) candidatos.push({categoria:m.categoria,comuns,data:m.data||""});
    });
    if(candidatos.length>0){
      // Prioriza: mais palavras em comum, depois o mais recente
      candidatos.sort((a,b)=>b.comuns-a.comuns||b.data.localeCompare(a.data));
      return {categoria:candidatos[0].categoria, confiante:true};
    }
  }
  return guessCat(desc,tipo);
}

// Detecta se uma transação importada já parece estar registrada no app
// (mesma data + mesmo valor + descrição parecida) — evita duplicar parcelas
// que já foram lançadas manualmente ou por outro import.
function pareceDuplicata(t, movsHistorico) {
  if(!movsHistorico || movsHistorico.length===0) return false;
  const descBase = (t.desc||"").replace(/\s*\(\d+\/\d+\)\s*$/,""); // tira o "(2/8)" do final pra comparar
  const palavrasNovo = [...new Set(palavrasChave(descBase))];
  return movsHistorico.some(m=>{
    if(m.data!==t.data) return false;
    if(Math.abs((+m.valor||0)-(t.valor||0))>0.02) return false;
    const palavrasHist = [...new Set(palavrasChave((m.descricao||"").replace(/\s*\(\d+\/\d+\)\s*$/,"")))];
    if(palavrasNovo.length===0||palavrasHist.length===0) return false;
    const comuns = palavrasNovo.filter(p=>palavrasHist.includes(p)).length;
    return comuns >= Math.min(2, palavrasNovo.length); // pelo menos 2 palavras em comum (ou todas, se a descrição for curta)
  });
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
    if(amt===0)return;
    const tipo=amt>0?"entrada":"saida";
    const transf=isTransfer(memo);
    const g=transf?{categoria:"🔄 Transferência",confiante:true}:guessCat(memo,tipo);
    txns.push({desc:memo, valor:Math.abs(amt), tipo:transf?"transferencia":tipo, data, categoria:g.categoria, confiante:g.confiante});
  });
  return txns;
}

function parseCSV(text) {
  const txns = [];
  // Remove BOM se tiver (comum em exports de banco)
  text = text.replace(/^\uFEFF/,"");
  const linhas = text.split(/\r?\n/).filter(l=>l.trim());
  if(linhas.length<1) return txns;

  // Detecta separador testando qual aparece mais vezes na 1ª linha
  const candidatos=[";","\t",",","|"];
  const sep = candidatos.reduce((melhor,c)=>{
    const n=(linhas[0].match(new RegExp(c==="\t"?"\\t":`\\${c}`,"g"))||[]).length;
    const nMelhor=(linhas[0].match(new RegExp(melhor==="\t"?"\\t":`\\${melhor}`,"g"))||[]).length;
    return n>nMelhor?c:melhor;
  },",");

  const linhaParece=(cells)=>{
    // true se a linha parece ser dado (tem data OU valor monetário), false se parece texto de cabeçalho
    return cells.some(c=>/\d{2}[\/\-]\d{2}[\/\-]\d{2,4}/.test(c)||/^-?\s*R?\$?\s*\d{1,3}(\.\d{3})*,\d{2}$/.test(c.trim())||/^-?\d+\.\d{2}$/.test(c.trim()));
  };

  const linha0Cells = linhas[0].split(sep).map(c=>c.trim().replace(/^"|"$/g,""));
  const temCabecalho = !linhaParece(linha0Cells);

  const cols = temCabecalho ? linha0Cells.map(c=>c.toLowerCase().replace(/"/g,"")) : [];
  const iData  = cols.findIndex(c=>c.includes("data")||c==="date"||c.includes("dia"));
  const DESC_PATTERNS = [
    c=>c.includes("descri"),
    c=>c.includes("histór")||c.includes("histor"),
    c=>c.includes("lançamento")||c.includes("lancamento"),
    c=>c.includes("memo")||c.includes("title"),
    c=>c.includes("estabelec"),
    c=>c.includes("nome")&&!c.includes("cart")&&!c.includes("titular"), // evita pegar "Nome no Cartão"
  ];
  let iDesc = -1;
  for(const pat of DESC_PATTERNS){ const idx=cols.findIndex(pat); if(idx>=0){iDesc=idx;break;} }
  // Pode ter mais de uma coluna com "valor" (ex: Valor em US$ e Valor em R$) — prioriza a que é em Reais
  const colunasValor = cols.map((c,idx)=>({c,idx})).filter(({c})=>c==="valor"||c==="amount"||c.includes("vlr")||c.includes("valor"));
  let iValor = -1;
  if(colunasValor.length>0){
    const comReais = colunasValor.find(({c})=>c.includes("r$")||c.includes("reais")||c.includes("(brl)"));
    const semMoedaEstrangeira = colunasValor.find(({c})=>!c.includes("us$")&&!c.includes("usd")&&!c.includes("dolar")&&!c.includes("dólar")&&!c.includes("cotaç")&&!c.includes("cotac"));
    iValor = comReais ? comReais.idx : (semMoedaEstrangeira ? semMoedaEstrangeira.idx : colunasValor[0].idx);
  }
  const iCred  = cols.findIndex(c=>c.includes("crédit")||c.includes("credit")||c.includes("entrada"));
  const iDeb   = cols.findIndex(c=>c.includes("débit")||c.includes("debit")||c.includes("saída")||c.includes("saida"));
  const iCategoria = cols.findIndex(c=>c==="categoria"||c.includes("categoria"));
  const iParcela = cols.findIndex(c=>c==="parcela"||c.includes("parcela"));

  const linhaDados = temCabecalho ? (linhas[1]||"") : linhas[0];
  // Fallback: se não achou nenhuma coluna de valor pelo nome, tenta descobrir testando os dados reais
  if(iValor<0&&iCred<0&&iDeb<0&&linhaDados){
    const linhaTeste = linhaDados.split(sep).map(p=>p.trim().replace(/^"|"$/g,""));
    for(let c=0;c<linhaTeste.length;c++){
      if(c===iData||c===iDesc)continue;
      const v = linhaTeste[c].replace(/[R$\s]/g,"");
      if(/^-?\d{1,3}(\.\d{3})*,\d{2}$/.test(v)||/^-?\d+,\d{2}$/.test(v)||/^-?\d+\.\d{2}$/.test(v)){iValor=c;break;}
    }
  }

  const inicio = temCabecalho ? 1 : 0;
  const ehFatura = iParcela>=0; // presença de coluna "Parcela" indica fatura de cartão, não extrato de conta
  for(let i=inicio;i<linhas.length;i++){
    const parts = linhas[i].split(sep).map(p=>p.trim().replace(/^"|"$/g,""));
    if(parts.length<2) continue;
    let desc = iDesc>=0 ? parts[iDesc] : (parts.find((p,idx)=>{
      if(idx===iData||idx===iValor)return false;
      const t=p.trim();
      if(/^\d{2}[\/\-]\d{2}[\/\-]\d{2,4}$/.test(t))return false; // parece data
      if(/^-?\s*R?\$?\s*\d{1,3}(\.\d{3})*,\d{2}$/.test(t))return false; // parece valor em R$
      if(/^-?\d+\.\d{2}$/.test(t))return false; // parece valor em formato en-US
      return isNaN(+t.replace(",","."))&&t.length>2;
    })||parts[1]||"");
    if(!desc||desc.toLowerCase().includes("saldo")) continue;
    const catBanco = iCategoria>=0 ? parts[iCategoria] : null;
    if(isFaturaPayment(desc,catBanco)) continue; // pula "Inclusão de Pagamento" — não é uma compra
    let data="";
    if(iData>=0){const raw=parts[iData]||"";if(raw.includes("/")){const[d,m,y]=raw.split("/");data=`${y.length===2?"20"+y:y}-${m.padStart(2,"0")}-${d.padStart(2,"0")}`;}else if(raw.includes("-")){data=raw.slice(0,10);}}
    else{
      // tenta achar uma data em qualquer coluna, se não sabe qual é
      const raw=parts.find(p=>/\d{2}\/\d{2}\/\d{2,4}/.test(p))||"";
      if(raw){const[d,m,y]=raw.match(/(\d{2})\/(\d{2})\/(\d{2,4})/).slice(1);data=`${y.length===2?"20"+y:y}-${m.padStart(2,"0")}-${d.padStart(2,"0")}`;}
    }
    let valor=0,tipo="saida";
    if(iValor>=0){
      const v=(parts[iValor]||"").replace(/[R$\s]/g,"").replace(/\.(?=\d{3})/g,"").replace(",",".");
      const vNum=parseFloat(v)||0;
      valor=Math.abs(vNum);
      tipo = ehFatura ? (vNum>0?"saida":"entrada") : (vNum>0?"entrada":"saida");
    }
    else if(iCred>=0||iDeb>=0){const cred=parseFloat((parts[iCred]||"").replace(/\.(?=\d{3})/g,"").replace(",","."))||0;const deb=parseFloat((parts[iDeb]||"").replace(/\.(?=\d{3})/g,"").replace(",","."))||0;if(cred>0){valor=cred;tipo="entrada";}else if(deb>0){valor=deb;tipo="saida";}}
    if(valor<=0)continue;
    if(iParcela>=0){
      const parc=parts[iParcela];
      if(parc&&!/^unica$|^única$/i.test(parc.trim())) desc=`${desc} (${parc})`;
    }
    const transf=isTransfer(desc);
    let categoria,confiante;
    if(transf){ categoria="🔄 Transferência"; confiante=true; }
    else {
      const catMapeada=mapCategoriaBanco(catBanco);
      if(catMapeada){ categoria=catMapeada; confiante=true; }
      else { const g=guessCat(desc,tipo); categoria=g.categoria; confiante=g.confiante; }
    }
    txns.push({desc,valor,tipo:transf?"transferencia":tipo,data,categoria,confiante});
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
    const transf=isTransfer(desc);
    const g=transf?{categoria:"🔄 Transferência",confiante:true}:guessCat(desc,tipo);
    txns.push({desc,valor,tipo:transf?"transferencia":tipo,data,categoria:g.categoria,confiante:g.confiante});
  });
  return txns;
}

function ImportacaoModal({open, onClose, onImport, cats, movsHistorico}) {
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
    setTxns(parsed.map((t,i)=>{
      const duplicata = pareceDuplicata(t, movsHistorico);
      if(t.categoria==="🔄 Transferência") return {...t,id:i,selected:!duplicata,confiante:true,duplicata};
      const g = guessCatSmart(t.desc||"", movsHistorico, t.tipo);
      return {...t,id:i,selected:!duplicata,categoria:g.categoria,confiante:g.confiante,duplicata};
    }));
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
          <div style={{fontSize:16,fontWeight:700,color:"#1A1209",display:"flex",alignItems:"center",gap:7}}><Glyph e="📥" size={16}/>Importar Extrato</div>
          <button onClick={()=>{reset();onClose();}} style={{background:"rgba(0,0,0,0.07)",border:"1px solid rgba(0,0,0,0.12)",color:"#5A4A3A",borderRadius:10,width:32,height:32,cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>

        {step===1&&!loading&&!pedeSenha&&(
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {/* Tipo de importação */}
            <div style={{display:"flex",background:"#EDE8E0",borderRadius:12,padding:3}}>
              {[["arquivo",FileText,"Arquivo"],["foto",Camera,"Print/Foto"]].map(([v,Ic,l])=>(
                <button key={v} onClick={()=>setModo(v)} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,background:modo===v?"#B91D55":"transparent",color:modo===v?"#fff":"#5A4A3A",border:"none",borderRadius:10,padding:"9px",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",transition:"all .15s"}}><Ic size={14} strokeWidth={2.2}/>{l}</button>
              ))}
            </div>

            {modo==="arquivo"&&(
              <>
                <div style={{fontSize:13,color:"#5A4A3A",fontFamily:"'DM Sans',sans-serif",lineHeight:1.5}}>
                  Aceita <strong>PDF</strong> (com ou sem senha), <strong>OFX</strong> e <strong>CSV</strong> do C6 Bank e Itaú.
                </div>
                <label style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10,background:"rgba(232,32,95,0.06)",border:"2px dashed rgba(232,32,95,0.3)",borderRadius:16,padding:"28px 20px",cursor:"pointer"}}>
                  <FolderOpen size={32} strokeWidth={1.6} color="#B91D55"/>
                  <span style={{fontSize:13,fontWeight:600,color:"#B91D55",fontFamily:"'DM Sans',sans-serif"}}>Clique para selecionar arquivo</span>
                  <span style={{fontSize:11,color:"#5A4A3A",fontFamily:"'DM Sans',sans-serif"}}>PDF · OFX · CSV</span>
                  <input type="file" accept=".pdf,.ofx,.csv,.txt" onChange={handleFile} style={{display:"none"}}/>
                </label>
              </>
            )}

            {modo==="foto"&&(
              <>
                <div style={{fontSize:13,color:"#5A4A3A",fontFamily:"'DM Sans',sans-serif",lineHeight:1.5}}>
                  Tire um <strong>print do app</strong> do C6 ou Itaú. O Claude AI extrai todas as transações automaticamente.
                </div>
                {!localStorage.getItem("velara_gemini_key")&&(
                  <div style={{background:"rgba(212,168,67,0.15)",border:"1px solid rgba(212,168,67,0.4)",borderRadius:12,padding:"12px 14px"}}>
                    <div style={{fontSize:12,fontWeight:700,color:"#8B6000",fontFamily:"'DM Sans',sans-serif",marginBottom:4}}><Key size={12} strokeWidth={2.2} style={{marginRight:4,verticalAlign:"-2px"}}/>Chave Gemini (gratuita)</div>
                    <div style={{fontSize:11,color:"#5A4A3A",fontFamily:"'DM Sans',sans-serif",marginBottom:8}}>Acesse <strong>aistudio.google.com</strong> → Get API Key → criar chave gratuita (sem cartão).</div>
                    <div style={{display:"flex",gap:6}}>
                      <input id="gemini_key_input" placeholder="AIza..." style={{flex:1,background:"#F5F0E8",border:"1.5px solid #DDD5C8",borderRadius:8,padding:"8px 10px",fontSize:12,color:"#1A1209",outline:"none",fontFamily:"inherit"}}/>
                      <button onClick={()=>{const v=document.getElementById("gemini_key_input").value;if(v.length>10){localStorage.setItem("velara_gemini_key",v);setErro("");}}} style={{background:"#B91D55",border:"none",borderRadius:8,padding:"8px 12px",fontSize:12,fontWeight:700,color:"#fff",cursor:"pointer",fontFamily:"inherit"}}>Salvar</button>
                    </div>
                  </div>
                )}
                <label style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10,background:"rgba(91,163,212,0.08)",border:"2px dashed rgba(91,163,212,0.4)",borderRadius:16,padding:"28px 20px",cursor:"pointer"}}>
                  <Camera size={36} strokeWidth={1.6}/>
                  <span style={{fontSize:13,fontWeight:600,color:"#5B7C94",fontFamily:"'DM Sans',sans-serif"}}>Clique para enviar print ou foto</span>
                  <span style={{fontSize:11,color:"#5A4A3A",fontFamily:"'DM Sans',sans-serif"}}>PNG · JPG — qualquer banco</span>
                  <input type="file" accept=".png,.jpg,.jpeg,.webp" onChange={handleFile} style={{display:"none"}}/>
                </label>
                {localStorage.getItem("velara_gemini_key")&&(
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"rgba(45,90,16,0.08)",border:"1px solid rgba(45,90,16,0.2)",borderRadius:10,padding:"8px 12px"}}>
                    <span style={{fontSize:11,color:"#2D5A10",fontFamily:"'DM Sans',sans-serif",fontWeight:600}}><CheckCircle2 size={13} strokeWidth={2.2} style={{marginRight:4,verticalAlign:"-2px"}}/>Chave Gemini salva</span>
                    <button onClick={()=>{localStorage.removeItem("velara_gemini_key");setErro("");}} style={{background:"none",border:"none",color:"#B91D55",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Trocar chave</button>
                  </div>
                )}
                
              </>
            )}

            {erro&&<div style={{background:"rgba(224,82,82,0.1)",border:"1px solid rgba(224,82,82,0.3)",borderRadius:10,padding:"10px 14px",fontSize:13,color:"#C0392B",fontFamily:"'DM Sans',sans-serif"}}><Glyph e="⚠" size={13} style={{marginRight:5}}/>{erro}</div>}
          </div>
        )}

        {loading&&(
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 20px",gap:16}}>
            <div style={{animation:"spin 1s linear infinite",display:"flex",justifyContent:"center"}}><RefreshCw size={36} strokeWidth={1.8}/></div>
            <div style={{fontSize:14,fontWeight:600,color:"#1A1209",fontFamily:"'DM Sans',sans-serif",textAlign:"center"}}>{loadMsg}</div>
            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {pedeSenha&&!loading&&(
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={{textAlign:"center",padding:"16px 0"}}>
              <div style={{marginBottom:10,display:"flex",justifyContent:"center"}}><Lock size={40} strokeWidth={1.6}/></div>
              <div style={{fontSize:15,fontWeight:700,color:"#1A1209",fontFamily:"'DM Sans',sans-serif",marginBottom:6}}>PDF protegido por senha</div>
              <div style={{fontSize:13,color:"#5A4A3A",fontFamily:"'DM Sans',sans-serif"}}>Digite a senha para desbloquear o extrato</div>
            </div>
            <input type="password" placeholder="Senha do PDF" value={pdfSenha} onChange={e=>setPdfSenha(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&handleSenha()}
              autoFocus
              style={{background:"#F5F0E8",border:"1.5px solid #DDD5C8",borderRadius:10,padding:"12px 14px",fontSize:14,color:"#1A1209",outline:"none",width:"100%",fontFamily:"inherit"}}/>
            {erro&&<div style={{background:"rgba(224,82,82,0.1)",border:"1px solid rgba(224,82,82,0.3)",borderRadius:10,padding:"10px 14px",fontSize:13,color:"#C0392B",fontFamily:"'DM Sans',sans-serif"}}><Glyph e="⚠" size={13} style={{marginRight:5}}/>{erro}</div>}
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>{setPedeSenha(false);setErro("");}} style={{flex:1,background:"rgba(0,0,0,0.06)",border:"1px solid rgba(0,0,0,0.12)",borderRadius:12,padding:"12px",fontSize:14,fontWeight:600,color:"#5A4A3A",cursor:"pointer",fontFamily:"inherit"}}>Cancelar</button>
              <button onClick={handleSenha} style={{flex:2,background:"#B91D55",border:"none",borderRadius:12,padding:"12px",fontSize:14,fontWeight:700,color:"#fff",cursor:"pointer",fontFamily:"inherit"}}><Unlock size={14} strokeWidth={2.2} style={{marginRight:5,verticalAlign:"-2px"}}/>Desbloquear</button>
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
            {txns.some(t=>t.duplicata)&&(
              <div style={{background:"rgba(91,163,212,0.12)",border:"1px solid rgba(91,163,212,0.35)",borderRadius:10,padding:"9px 12px",marginBottom:10,fontSize:11.5,color:"#1A4A6E",fontFamily:"'DM Sans',sans-serif",fontWeight:600,display:"flex",alignItems:"center",gap:6}}>
                🔁 {txns.filter(t=>t.duplicata).length} transaç{txns.filter(t=>t.duplicata).length===1?"ão":"ões"} já parece{txns.filter(t=>t.duplicata).length===1?"":"m"} estar cadastrada{txns.filter(t=>t.duplicata).length===1?"":"s"} — já vieram desmarcadas, mas revise antes de importar
              </div>
            )}
            {txns.some(t=>!t.confiante)&&(
              <div style={{background:"rgba(212,168,67,0.15)",border:"1px solid rgba(212,168,67,0.4)",borderRadius:10,padding:"9px 12px",marginBottom:10,fontSize:11.5,color:"#6B4C00",fontFamily:"'DM Sans',sans-serif",fontWeight:600,display:"flex",alignItems:"center",gap:6}}>
                ❓ {txns.filter(t=>!t.confiante).length} transaç{txns.filter(t=>!t.confiante).length===1?"ão":"ões"} sem categoria certa — confira as marcadas em amarelo abaixo
              </div>
            )}
            <div style={{display:"flex",gap:6,marginBottom:10}}>
              <button onClick={()=>toggleAll(true)} style={{flex:1,background:"rgba(45,90,16,0.1)",border:"1px solid rgba(45,90,16,0.25)",borderRadius:8,padding:"6px",fontSize:11,fontWeight:700,color:"#2D5A10",cursor:"pointer",fontFamily:"inherit"}}>Selecionar tudo</button>
              <button onClick={()=>toggleAll(false)} style={{flex:1,background:"rgba(0,0,0,0.06)",border:"1px solid rgba(0,0,0,0.12)",borderRadius:8,padding:"6px",fontSize:11,fontWeight:700,color:"#5A4A3A",cursor:"pointer",fontFamily:"inherit"}}>Desmarcar tudo</button>
              <button onClick={reset} style={{background:"rgba(0,0,0,0.06)",border:"1px solid rgba(0,0,0,0.12)",borderRadius:8,padding:"6px 10px",fontSize:11,color:"#5A4A3A",cursor:"pointer",fontFamily:"inherit"}}>← Voltar</button>
            </div>
            <div style={{maxHeight:340,overflowY:"auto",display:"flex",flexDirection:"column",gap:6,marginBottom:14}}>
              {txns.map((t,i)=>(
                <div key={t.id} style={{background:t.duplicata?"rgba(91,163,212,0.08)":!t.confiante&&t.selected?"rgba(212,168,67,0.12)":t.selected?"rgba(255,255,255,0.9)":"rgba(0,0,0,0.04)",border:`1px solid ${t.duplicata?"rgba(91,163,212,0.35)":!t.confiante&&t.selected?"rgba(212,168,67,0.5)":t.selected?"rgba(0,0,0,0.1)":"rgba(0,0,0,0.06)"}`,borderRadius:12,padding:"10px 12px",opacity:t.selected?1:0.6}}>
                  <div style={{display:"flex",alignItems:"flex-start",gap:8}}>
                    <input type="checkbox" checked={t.selected} onChange={()=>setTxns(txns.map((x,j)=>j===i?{...x,selected:!x.selected}:x))} style={{marginTop:2,cursor:"pointer",accentColor:"#B91D55"}}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                        <span style={{fontSize:12,fontWeight:600,color:"#1A1209",fontFamily:"'DM Sans',sans-serif",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"60%"}}>{t.desc}</span>
                        <span style={{fontSize:12,fontWeight:700,color:t.tipo==="entrada"?"#2D5A10":"#8B1A1A",fontFamily:"'DM Sans',sans-serif",flexShrink:0}}>{t.tipo==="entrada"?"+":"-"}{R(t.valor)}</span>
                      </div>
                      {t.duplicata&&<div style={{fontSize:9.5,fontWeight:700,color:"#1A4A6E",marginBottom:4}}>🔁 já parece estar cadastrada</div>}
                      <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
                        <span style={{fontSize:10,color:"#5A4A3A",fontFamily:"'DM Sans',sans-serif"}}>{t.data||"—"}</span>
                        <select value={t.tipo} onChange={e=>setTxns(txns.map((x,j)=>j===i?{...x,tipo:e.target.value}:x))}
                          className="plt-select"
                          style={{fontSize:10,border:"1px solid rgba(0,0,0,0.12)",borderRadius:6,padding:"1px 4px",background:"transparent",color:t.tipo==="entrada"?"#2D5A10":t.tipo==="transferencia"?"#5B7C94":"#8B1A1A",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                          <option value="entrada">↑ Entrada</option>
                          <option value="saida">↓ Saída</option>
                          <option value="transferencia">Transfer.</option>
                        </select>
                        {!t.confiante&&<span style={{fontSize:9,fontWeight:700,color:"#8B6000"}}>❓</span>}
                        <select value={t.categoria} onChange={e=>setTxns(txns.map((x,j)=>j===i?{...x,categoria:e.target.value,confiante:true}:x))}
                          className="plt-select"
                          style={{fontSize:10,border:`1px solid ${!t.confiante?"rgba(212,168,67,0.6)":"rgba(0,0,0,0.12)"}`,borderRadius:6,padding:"1px 4px",background:!t.confiante?"rgba(212,168,67,0.15)":"transparent",color:"#1A1209",cursor:"pointer",fontFamily:"inherit",flex:1,minWidth:0,fontWeight:!t.confiante?700:400}}>
                          <optgroup label="Despesas">{CATS_DESP.map(c=><option key={c} value={c}>{c}</option>)}</optgroup>
                          <optgroup label="Receitas">{CATS_REC.map(c=><option key={c} value={c}>{c}</option>)}</optgroup>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={confirmar} disabled={total===0} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:6,background:total===0?"rgba(0,0,0,0.1)":"#B91D55",border:"none",borderRadius:14,padding:"14px",fontSize:14,fontWeight:700,color:"#fff",cursor:total===0?"default":"pointer",fontFamily:"inherit"}}>
              <Check size={15} strokeWidth={2.5}/> Importar {total} transação{total!==1?"ões":""}
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
        <div style={{width:26,height:26,borderRadius:8,background:"linear-gradient(135deg,#C4202E,#8E1620)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff"}}><FileEdit size={13} strokeWidth={2.2}/></div>
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
    ? ["Quá... eu não aguentei esse mês, vê o relatório"]
    : alerta
    ? ["Quá... gastos passaram do orçamento esse mês"]
    : correndoAtivo
    ? ["QUÁ QUÁ QUÁ! Muita saída esse mês, corre pra ver os gastos!"]
    : relaxAtivo
    ? ["Quá~ vida boa, pagando dívidas e tudo em dia"]
    : [
        "Quá? Vamos alimentar meus objetivos?",
        "Ainda meio molinho, mas animado!",
        "Já tô de pescoço mais durinho!",
        "Olha meu pescoço reto! Continue assim!",
        "Quase ganhando minha coroa de girassol!",
        "Ganhei minha coroa! Quá quá!",
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
              <ellipse cx={cx+10} cy={bodyCy+bodyRy+2} rx={38} ry={16} fill="#5B7C94" opacity={0.55}/>
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
            <circle className="patoSemente" cx={bicoTipX} cy={bicoTipY} r={5} fill="#6F9560" stroke="#5A8A1A" strokeWidth={1}/>
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
          <div style={{position:"absolute",top:20,left:"50%",transform:"translateX(-50%)",fontSize:14,fontWeight:700,color:"#2D9A1A",fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap",animation:"patoFloatUp 1.8s ease-out forwards",textShadow:"0 1px 3px rgba(255,255,255,0.8)",display:"flex",alignItems:"center",gap:3}}>
            +{R(alimentando.valor)} <Sprout size={13} strokeWidth={2.2}/>
          </div>
        )}
      </div>
      {falando&&(
        <div style={{background:"rgba(255,255,255,0.96)",borderRadius:14,padding:"10px 14px",fontSize:12,color:"#3D3226",fontFamily:"'DM Sans',sans-serif",fontWeight:600,boxShadow:"0 4px 14px rgba(0,0,0,0.18)",maxWidth:190,textAlign:"center"}}>
          {morto ? mensagens[0] : alerta ? mensagens[0] : correndoAtivo ? mensagens[0] : relaxAtivo ? mensagens[0] : mensagens[stage]}
        </div>
      )}
      <div style={{background:"rgba(255,255,255,0.88)",borderRadius:99,padding:"5px 14px",fontSize:12,fontWeight:700,color:morto?"#8B1A1A":alerta?"#8B4A1A":"#3D3226",fontFamily:"'DM Sans',sans-serif",boxShadow:"0 2px 8px rgba(0,0,0,0.1)",display:"flex",alignItems:"center",gap:4}}>
        {morto?<><Skull size={12} strokeWidth={2.2}/>desmaiou</>:alerta?<><Glyph e="⚠" size={12}/>{pct.toFixed(0)}% energia</>:correndoAtivo?<><AlertCircle size={12} strokeWidth={2.2}/>muita saída</>:relaxAtivo?<><CheckCircle2 size={12} strokeWidth={2.2}/>{pct.toFixed(0)}% tranquilo</>:pct.toFixed(0)+"% feliz"}
      </div>
      {totalAlimentado>0&&(
        <div style={{fontSize:9.5,color:"rgba(61,50,38,0.6)",fontFamily:"'DM Sans',sans-serif",fontWeight:600,display:"flex",alignItems:"center",gap:3}}>
          <Sprout size={11} strokeWidth={2.2}/>alimentado com {R(totalAlimentado)} no total
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
          <div style={{fontSize:11,fontWeight:500,letterSpacing:".2em",textTransform:"uppercase",color:"rgba(26,18,9,0.4)",fontFamily:"'DM Mono',ui-monospace,monospace",marginBottom:6}}>Velara Finance</div>
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
            style={{background:"#B91D55",color:"#fff",border:"none",borderRadius:12,padding:"13px",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",marginTop:4,opacity:loading?0.7:1}}>
            {loading?"Aguarde...":(mode==="login"?"Entrar":"Criar conta")}
          </button>
          <div style={{textAlign:"center",fontSize:12,color:"rgba(26,18,9,0.55)",fontFamily:"'DM Sans',sans-serif"}}>
            {mode==="login"?"Não tem conta?":"Já tem conta?"}{" "}
            <button onClick={()=>{setMode(mode==="login"?"signup":"login");setError("");}}
              style={{background:"none",border:"none",color:"#B91D55",fontWeight:700,cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>
              {mode==="login"?"Cadastrar":"Fazer login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Lançamento rápido por texto ("uber 23 cartão", "mercado 187 pix") ────────
const normTxt = s => (s||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"");
const numBR = str => {
  let s=String(str).trim();
  if(s.includes(",")&&s.includes(".")) s=s.replace(/\./g,"").replace(",",".");
  else if(s.includes(",")) s=s.replace(",",".");
  else if(/^\d{1,3}(\.\d{3})+$/.test(s)) s=s.replace(/\./g,"");
  return parseFloat(s);
};
const dataLocalStr = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const STOP_RAPIDO = new Set(["no","na","nos","nas","de","do","da","em","com","por","pra","para","um","uma","o","a","e","via","foi","gasto","gastos"]);

function opcoesCategoria(tipo, cats) {
  if(tipo==="entrada") return (cats?.receita||DEFAULT_CATS.receita).map(c=>`${c.emoji} ${c.nome}`);
  return (cats?.despesa||DEFAULT_CATS.despesa).flatMap(c=>[`${c.emoji} ${c.nome}`,...(c.subcats||[]).map(s=>`${c.emoji} ${c.nome} · ${s.nome}`)]);
}

function parseLancamentoRapido(texto, cartoes, movsHistorico, cats) {
  const original=(texto||"").trim();
  if(!original) return null;
  let rest=" "+original+" ";
  // Procura o padrão no texto sem acento/maiúscula e remove o trecho do texto original
  const retirar=(re)=>{
    const m=re.exec(normTxt(rest));
    if(!m) return null;
    rest=rest.slice(0,m.index)+" "+rest.slice(m.index+m[0].length);
    return m;
  };

  // tipo
  let tipo="saida";
  if(/^\s*\+/.test(original)){ tipo="entrada"; rest=rest.replace("+"," "); }
  if(retirar(/\b(recebi|recebido|ganhei|entrou|receita)\b/)) tipo="entrada";
  retirar(/\b(gastei|paguei|comprei|pago|paga)\b/);

  // parcelas ("3x", "em 10x", "6 parcelas")
  let parcelas=0;
  const mp=retirar(/\b(?:em\s+)?(\d{1,2})\s*(?:x|vezes|parcelas?)\b/);
  if(mp) parcelas=+mp[1];

  // data
  let data=today();
  const hojeD=new Date(today()+"T12:00:00");
  if(retirar(/\banteontem\b/)){ const d=new Date(hojeD); d.setDate(d.getDate()-2); data=dataLocalStr(d); }
  else if(retirar(/\bontem\b/)){ const d=new Date(hojeD); d.setDate(d.getDate()-1); data=dataLocalStr(d); }
  else retirar(/\bhoje\b/);
  const md=retirar(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/);
  if(md){
    const dia=+md[1], mes=+md[2];
    let ano=md[3]?(md[3].length===2?2000+(+md[3]):+md[3]):hojeD.getFullYear();
    const d=new Date(ano,mes-1,dia,12);
    if(d.getMonth()===mes-1&&d.getDate()===dia) data=dataLocalStr(d);
  } else {
    const mdia=retirar(/\bdia\s+(\d{1,2})\b/);
    if(mdia){
      const dia=+mdia[1];
      let y=hojeD.getFullYear(), m=hojeD.getMonth();
      if(dia>hojeD.getDate()){ m-=1; if(m<0){m=11;y-=1;} } // "dia 28" dito no dia 5 = mês passado
      const d=new Date(y,m,dia,12);
      if(d.getMonth()===m&&d.getDate()===dia) data=dataLocalStr(d);
    }
  }

  // forma de pagamento / cartão
  let forma=null, cartaoId="";
  for(const c of (cartoes||[])){
    const nomeN=normTxt(c.nome||"").trim();
    if(!nomeN) continue;
    const tokens=[nomeN,...nomeN.split(/\s+/).filter(w=>w.length>=3&&!["cartao","credito","banco","card"].includes(w))];
    for(const tk of tokens){
      const esc=tk.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
      if(retirar(new RegExp("\\b"+esc+"\\b"))){ forma="cartao"; cartaoId=c.id; break; }
    }
    if(forma) break;
  }
  const generico=retirar(/\b(cartao|credito|cc)\b/);
  if(!forma){
    if(retirar(/\bpix\b/)) forma="pix";
    else if(retirar(/\bdebito\b/)) forma="debito";
    else if(retirar(/\b(dinheiro|especie|cash)\b/)) forma="dinheiro";
    else if(generico) forma="cartao";
  } else { retirar(/\b(pix|debito)\b/); }
  if(!forma && parcelas>1) forma="cartao"; // parcelado quase sempre é cartão
  // sem forma explícita: usa a mais frequente nas últimas saídas
  if(!forma||(forma==="cartao"&&!cartaoId)){
    const ultimas=(movsHistorico||[]).filter(m=>m.tipo==="saida"&&m.formaPagamento).slice(0,30);
    if(!forma){
      const cont={}; ultimas.forEach(m=>{cont[m.formaPagamento]=(cont[m.formaPagamento]||0)+1;});
      forma=Object.entries(cont).sort((a,b)=>b[1]-a[1])[0]?.[0]||"dinheiro";
    }
    if(forma==="cartao"&&!cartaoId){
      if((cartoes||[]).length===1) cartaoId=cartoes[0].id;
      else {
        const cont={}; ultimas.filter(m=>m.formaPagamento==="cartao"&&m.cartaoId).forEach(m=>{cont[m.cartaoId]=(cont[m.cartaoId]||0)+1;});
        const top=Object.entries(cont).sort((a,b)=>b[1]-a[1])[0]?.[0];
        if(top&&(cartoes||[]).some(c=>c.id===top)) cartaoId=top;
      }
    }
  }

  // valor: prefere o que tem "R$"; senão o maior número do texto
  retirar(/\breais\b/);
  const reValor=/(r\$\s*)?(\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?|\d+(?:[.,]\d{1,2})?)(\s*k\b)?/g;
  const nrm=normTxt(rest);
  const cands=[]; let mv;
  while((mv=reValor.exec(nrm))!==null){
    let v=numBR(mv[2]); if(mv[3]) v*=1000;
    if(isFinite(v)&&v>0) cands.push({v,rs:!!mv[1],index:mv.index,len:mv[0].length});
  }
  let valor=0;
  if(cands.length){
    const escolhido=cands.filter(c=>c.rs)[0]||cands.slice().sort((a,b)=>b.v-a.v)[0];
    valor=escolhido.v;
    rest=rest.slice(0,escolhido.index)+" "+rest.slice(escolhido.index+escolhido.len);
  }

  // descrição: o que sobrou, sem palavras-ponte nas pontas
  let words=rest.replace(/r\$/gi," ").replace(/[,;]+/g," ").replace(/\s+/g," ").trim().split(" ").filter(Boolean);
  while(words.length&&STOP_RAPIDO.has(normTxt(words[0]))) words.shift();
  while(words.length&&STOP_RAPIDO.has(normTxt(words[words.length-1]))) words.pop();
  let descricao=words.join(" ");
  if(descricao) descricao=descricao.charAt(0).toUpperCase()+descricao.slice(1);

  // categoria: histórico dela > palavras-chave; se não souber, deixa vazio (pergunta)
  const g=guessCatSmart(descricao||original,movsHistorico,tipo);
  let categoria=g.confiante?g.categoria:"";
  if(categoria&&tipo==="saida"){
    const cat=(cats?.despesa||DEFAULT_CATS.despesa).find(c=>categoria===`${c.emoji} ${c.nome}`);
    if(cat){
      const dn=new Set(palavrasChave(descricao));
      const ach=(cat.subcats||[]).filter(s=>palavrasChave(s.nome).some(w=>dn.has(w)));
      if(ach.length===1) categoria=`${cat.emoji} ${cat.nome} · ${ach[0].nome}`;
    }
  }
  if(categoria&&!opcoesCategoria(tipo,cats).includes(categoria)) categoria=""; // categoria que não existe mais

  return {tipo,descricao,valor,data,formaPagamento:tipo==="entrada"?"dinheiro":forma,cartaoId:forma==="cartao"?cartaoId:"",parcelas:tipo==="saida"&&forma==="cartao"?parcelas:0,categoria};
}

function LancamentoRapido({movs,cartoes,cats,onSalvar,onEditar}) {
  const [texto,setTexto]=useState("");
  const [ov,setOv]=useState({});
  const [okMsg,setOkMsg]=useState("");
  const parsed=useMemo(()=>parseLancamentoRapido(texto,cartoes,movs,cats),[texto,cartoes,movs,cats]);
  const item=parsed?{...parsed,...ov}:null;
  if(item&&item.tipo!=="saida"){ item.formaPagamento="dinheiro"; item.cartaoId=""; item.parcelas=0; }
  const pronto=!!(item&&item.valor>0&&item.descricao&&item.categoria);
  const duplicado=!!(item&&item.valor>0&&pareceDuplicata({desc:item.descricao,data:item.data,valor:item.valor},movs));
  const limpar=()=>{setTexto("");setOv({});};
  const salvar=()=>{
    if(!pronto) return;
    onSalvar(item);
    limpar();
    setOkMsg("Lançado ✓");
    setTimeout(()=>setOkMsg(""),2500);
  };
  const pillBtn=(ativo)=>({background:ativo?C.magentaDark:"rgba(0,0,0,0.06)",color:ativo?"#fff":"#1A1209",border:"none",borderRadius:9,padding:"7px 10px",fontSize:11.5,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"});
  const cartaoSel=item&&item.formaPagamento==="cartao"?cartoes:[];
  return (
    <div className={"card lr"+(item?"":" lr-idle")} style={{padding:"12px 14px",marginBottom:10,borderRadius:14}}>
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        <input className="lr-in" value={texto} onChange={e=>setTexto(e.target.value)}
          onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();salvar();}}}
          placeholder="Lançar rápido: uber 23 cartão · mercado 187 pix · recebi 1500 plantão"
          style={{flex:1,background:"#F5F0E8",border:"1.5px solid #DDD5C8",borderRadius:10,padding:"11px 13px",color:"#1A1209",fontSize:14,outline:"none",fontFamily:"inherit",minWidth:0}}/>
        {texto&&<button onClick={limpar} style={{background:"rgba(0,0,0,0.07)",border:"none",borderRadius:10,width:36,height:40,cursor:"pointer",fontSize:16,color:"#5A4A3A"}}>×</button>}
      </div>
      {okMsg&&<div style={{marginTop:8,fontSize:12,fontWeight:700,color:"#2D5A10",fontFamily:"'DM Sans',sans-serif"}}>{okMsg}</div>}
      {item&&(
        <div style={{marginTop:10,display:"flex",flexDirection:"column",gap:9}}>
          {!(item.valor>0)?(
            <div style={{fontSize:12,color:"#8B6F14",fontFamily:"'DM Sans',sans-serif"}}>Falta o valor — ex: “{item.descricao||"uber"} 23”.</div>
          ):(
            <>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",gap:10,flexWrap:"wrap"}}>
                <div style={{fontSize:14,fontWeight:700,color:"#1A1209",fontFamily:"'DM Sans',sans-serif"}}>{item.descricao||"(sem descrição)"}</div>
                <div className="num" style={{fontSize:15,fontWeight:700,color:item.tipo==="entrada"?"#2D5A10":"#8B1043"}}>
                  {item.tipo==="entrada"?"+":"−"}{R(item.valor)}
                </div>
              </div>
              <div style={{fontSize:11.5,color:"rgba(26,18,9,0.6)",fontFamily:"'DM Sans',sans-serif"}}>
                {item.data===today()?"hoje":fdFull(item.data)}
                {item.parcelas>1&&<> · {item.parcelas}x de {R(item.valor/item.parcelas)}</>}
              </div>
              <div style={{display:"flex",gap:6}}>
                <button onClick={()=>setOv({...ov,tipo:"saida",categoria:""})} style={pillBtn(item.tipo==="saida")}>Saída</button>
                <button onClick={()=>setOv({...ov,tipo:"entrada",categoria:""})} style={pillBtn(item.tipo==="entrada")}>Entrada</button>
              </div>
              <div>
                {!item.categoria&&<div style={{fontSize:11.5,fontWeight:700,color:"#8B6F14",marginBottom:4,fontFamily:"'DM Sans',sans-serif"}}>Não sei a categoria — escolhe aqui:</div>}
                <select value={item.categoria} onChange={e=>setOv({...ov,categoria:e.target.value})} className="filter-select"
                  style={{background:"#F5F0E8",border:`1.5px solid ${item.categoria?"#DDD5C8":"#B8944F"}`,borderRadius:10,padding:"9px 30px 9px 12px",color:"#1A1209",fontSize:13,outline:"none",width:"100%",fontFamily:"inherit",cursor:"pointer"}}>
                  {!item.categoria&&<option value="">Escolher categoria…</option>}
                  {opcoesCategoria(item.tipo,cats).map(o=><option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              {item.tipo==="saida"&&(
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {[["dinheiro","Dinheiro"],["pix","Pix"],["debito","Débito"],["cartao","Cartão"]].map(([v,l])=>(
                    <button key={v} onClick={()=>setOv({...ov,formaPagamento:v,cartaoId:v==="cartao"?(item.cartaoId||cartoes[0]?.id||""):"",parcelas:v==="cartao"?item.parcelas:0})} style={pillBtn(item.formaPagamento===v)}>{l}</button>
                  ))}
                </div>
              )}
              {cartaoSel.length>0&&(
                <select value={item.cartaoId} onChange={e=>setOv({...ov,cartaoId:e.target.value})} className="filter-select"
                  style={{background:"#F5F0E8",border:"1.5px solid #DDD5C8",borderRadius:10,padding:"9px 30px 9px 12px",color:"#1A1209",fontSize:13,outline:"none",width:"100%",fontFamily:"inherit",cursor:"pointer"}}>
                  <option value="">Qual cartão?</option>
                  {cartaoSel.map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              )}
              {duplicado&&(
                <div style={{fontSize:11.5,color:"#8B6F14",fontWeight:600,display:"flex",alignItems:"center",gap:5,fontFamily:"'DM Sans',sans-serif"}}>
                  <AlertTriangle size={13} strokeWidth={2.2}/>Parece que isso já está lançado.
                </div>
              )}
              <div style={{display:"flex",gap:8}}>
                <Btn variant="primary" style={{flex:1,opacity:pronto?1:0.45}} onClick={salvar}>Lançar</Btn>
                <Btn variant="secondary" onClick={()=>{onEditar(item);limpar();}}>Editar</Btn>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Simular Compra ("Pergunte antes de comprar") ─────────────────────────────
const CATEGORIAS_COMPRA = [
  {id:"celular",    emoji:"📱", nome:"Celular"},
  {id:"viagem",     emoji:"✈️", nome:"Viagem"},
  {id:"eletronico", emoji:"💻", nome:"Eletrônico"},
  {id:"beleza",     emoji:"💄", nome:"Beleza"},
  {id:"casa",       emoji:"🛋️", nome:"Casa"},
  {id:"educacao",   emoji:"📚", nome:"Educação"},
  {id:"lazer",      emoji:"🎉", nome:"Lazer"},
  {id:"outra",      emoji:"✦",  nome:"Outra"},
];
const VALORES_RAPIDOS_COMPRA = [500,1000,1500,2000,3000,5000];
const REGRA_COMPROMETIMENTO_MAX = 90; // % máx. recomendado da renda em parcelas

function SimularCompraModal({open,onClose,movs,dividas,objetivos,setObjetivos,mediaSaldoLivre3Meses,categoriaMaiorGasto,navTo}) {
  const [step,setStep]=useState("categoria");
  const [categoria,setCategoria]=useState(null);
  const [descricao,setDescricao]=useState("");
  const [valor,setValor]=useState("");
  const [parcelado,setParcelado]=useState(false);
  const [numParcelas,setNumParcelas]=useState("10");
  const [temJuros,setTemJuros]=useState("naosei");
  const [checkIdx,setCheckIdx]=useState(0);
  const [metaCriada,setMetaCriada]=useState(null);

  useEffect(()=>{
    if(!open) return;
    setStep("categoria"); setCategoria(null); setDescricao(""); setValor("");
    setParcelado(false); setNumParcelas("10"); setTemJuros("naosei"); setMetaCriada(null);
  },[open]);

  useEffect(()=>{
    if(step!=="analisando") return;
    setCheckIdx(0);
    let i=0;
    const t=setInterval(()=>{
      i++; setCheckIdx(i);
      if(i>=4){ clearInterval(t); setTimeout(()=>setStep("resultado"),350); }
    },350);
    return ()=>clearInterval(t);
  },[step]);

  const valorNum = +String(valor).replace(",",".")||0;
  const n = parcelado ? Math.max(1,+numParcelas||1) : 1;
  const taxaMensal = !parcelado ? 0 : (temJuros==="sim"?0.025:temJuros==="naosei"?0.03:0);
  const valorTotalComJuros = taxaMensal>0 ? valorNum*(1+taxaMensal*n) : valorNum;
  const parcela = n>0 ? valorTotalComJuros/n : valorNum;
  const jurosEstimados = valorTotalComJuros-valorNum;

  const hoje = today();
  const mesAlvo = monthKey(hoje);

  const rendaMedia = useMemo(()=>{
    const meses=[1,2,3].map(k=>shiftMonth(mesAlvo,-k));
    const vals=meses.map(mk=>movs.filter(m=>m.tipo==="entrada"&&monthKey(m.data)===mk).reduce((s,m)=>s+m.valor,0)).filter(v=>v>0);
    return vals.length? vals.reduce((s,v)=>s+v,0)/vals.length : 0;
  },[movs,mesAlvo]);

  const comprometidoAtual = useMemo(()=>{
    const cartao = movs.filter(m=>m.formaPagamento==="cartao"&&m.parcelaTotal>1&&monthKey(m.data)===mesAlvo).reduce((s,m)=>s+m.valor,0);
    const divida = dividas.filter(d=>d.tipo==="cartao_desconto").reduce((s,d)=>{
      const p=(d.parcelasStatus||[]).find(pp=>!pp.pago&&monthKey(pp.dataVencimento)===mesAlvo);
      return s+(p?d.valorComDesconto:0);
    },0);
    return cartao+divida;
  },[movs,dividas,mesAlvo]);

  const semDados = rendaMedia<=0;
  const pctAtual = semDados?0:(comprometidoAtual/rendaMedia*100);
  const pctComCompra = semDados?0:((comprometidoAtual+parcela)/rendaMedia*100);
  const veredito = semDados?"semdados":pctComCompra>REGRA_COMPROMETIMENTO_MAX?"nao":pctComCompra>70?"atencao":"sim";

  const sobraParaMetasDepois = mediaSaldoLivre3Meses-parcela;

  const margemDisponivel = Math.max(0,(rendaMedia*REGRA_COMPROMETIMENTO_MAX/100)-comprometidoAtual);
  const corteNecessario = Math.max(0,parcela-margemDisponivel);
  const mesesGuardando = mediaSaldoLivre3Meses>0 ? Math.ceil(valorNum/mediaSaldoLivre3Meses) : null;
  const dataGuardando = mesesGuardando ? addMonths(hoje,mesesGuardando) : null;
  const parcelasMinNecessarias = (parcelado&&margemDisponivel>0) ? Math.max(n,Math.ceil(valorTotalComJuros/margemDisponivel)) : null;

  const nomeCompra = descricao||categoria?.nome||"Compra";

  const criarMeta=(prazo)=>{
    const novaMeta={id:uid(), nome:`${categoria?.emoji||"🎯"} ${nomeCompra}`, meta:valorNum, atual:0, prazo, cor:C.blue, obs:"Criada pela Simulação de Compra", partes:[]};
    setObjetivos([novaMeta,...objetivos]);
    setMetaCriada(novaMeta);
    setStep("concluido");
  };

  if(!open) return null;

  return (
    <Modal open={open} onClose={onClose} title={<><Glyph e="💭" size={16} style={{marginRight:6,verticalAlign:"-3px"}}/>Simular uma compra</>}>

      {step==="categoria"&&(
        <div>
          <SL>O que você quer comprar?</SL>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
            {CATEGORIAS_COMPRA.map(c=>(
              <button key={c.id} onClick={()=>{setCategoria(c);setStep("valor");}}
                style={{background:"rgba(0,0,0,0.04)",border:"1.5px solid rgba(0,0,0,0.1)",borderRadius:12,padding:"14px 10px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:6,fontFamily:"'DM Sans',sans-serif"}}>
                <span style={{fontSize:22}}>{c.emoji}</span>
                <span style={{fontSize:12,fontWeight:700,color:C.modalText}}>{c.nome}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {step==="valor"&&(
        <div>
          <SL>{categoria?.emoji} {categoria?.nome} — quanto custa?</SL>
          <Inp label="O que é (opcional)" placeholder="ex: iPhone 16, viagem pro Nordeste..." value={descricao} onChange={e=>setDescricao(e.target.value)}/>
          <div style={{height:12}}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:7,marginBottom:10}}>
            {VALORES_RAPIDOS_COMPRA.map(v=>(
              <button key={v} onClick={()=>setValor(String(v))}
                style={{background:+valor===v?C.magentaDark:"rgba(0,0,0,0.05)",color:+valor===v?"#fff":C.modalText,border:"none",borderRadius:10,padding:"9px 4px",fontSize:12.5,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                {R(v).replace(",00","")}
              </button>
            ))}
          </div>
          <Inp label="Ou digite o valor exato" placeholder="R$ 0,00" value={valor} onChange={e=>setValor(e.target.value)}/>
          <div style={{height:16}}/>

          <div style={{display:"flex",gap:8,marginBottom:14}}>
            <button onClick={()=>setParcelado(false)} style={{flex:1,background:!parcelado?C.magentaDark:"rgba(0,0,0,0.05)",color:!parcelado?"#fff":C.modalText,border:"none",borderRadius:10,padding:"9px",fontSize:12.5,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>À vista</button>
            <button onClick={()=>setParcelado(true)} style={{flex:1,background:parcelado?C.magentaDark:"rgba(0,0,0,0.05)",color:parcelado?"#fff":C.modalText,border:"none",borderRadius:10,padding:"9px",fontSize:12.5,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Parcelado</button>
          </div>

          {parcelado&&(
            <>
              <Sel label="Quantas vezes?" value={numParcelas} onChange={e=>setNumParcelas(e.target.value)}>
                {Array.from({length:23},(_,i)=>i+2).map(x=><option key={x} value={x}>{x}x</option>)}
              </Sel>
              <div style={{height:12}}/>
              <div style={{fontSize:11,fontWeight:600,color:C.modalSub,letterSpacing:".06em",textTransform:"uppercase",marginBottom:5}}>Tem juros?</div>
              <div style={{display:"flex",gap:7}}>
                {[["nao","Não"],["sim","Sim"],["naosei","Não sei"]].map(([v,lbl])=>(
                  <button key={v} onClick={()=>setTemJuros(v)} style={{flex:1,background:temJuros===v?C.magentaDark:"rgba(0,0,0,0.05)",color:temJuros===v?"#fff":C.modalText,border:"none",borderRadius:9,padding:"8px 4px",fontSize:11.5,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>{lbl}</button>
                ))}
              </div>
              {valorNum>0&&(
                <div style={{fontSize:11.5,color:C.modalSub,marginTop:10,fontFamily:"'DM Sans',sans-serif",lineHeight:1.5}}>
                  {n}x de <strong style={{color:C.modalText}}>{R(parcela)}</strong>
                  {taxaMensal>0&&<>. {temJuros==="naosei"?"Sem saber, conto 3% ao mês, o comum em loja.":"Considerando 3% ao mês."} Total pago: <strong style={{color:C.modalText}}>{R(valorTotalComJuros)}</strong></>}
                </div>
              )}
            </>
          )}

          <Btn variant="primary" style={{width:"100%",marginTop:18}} onClick={()=>valorNum>0&&setStep("analisando")}>Continuar</Btn>
        </div>
      )}

      {step==="analisando"&&(
        <div style={{padding:"26px 6px 10px",textAlign:"center"}}>
          <div style={{fontSize:16,fontWeight:700,color:C.modalText,marginBottom:22}}>Analisando seu mês...</div>
          <div style={{display:"flex",flexDirection:"column",gap:14,alignItems:"flex-start",maxWidth:280,margin:"0 auto"}}>
            {["Seus gastos do mês","Compras que você já tem","Suas metas e a reserva","Quanto costuma sobrar"].map((lbl,i)=>(
              <div key={lbl} style={{display:"flex",alignItems:"center",gap:10,opacity:checkIdx>i?1:0.35,transition:"opacity .25s"}}>
                <CheckCircle2 size={16} strokeWidth={2.2} color={checkIdx>i?C.green:C.modalSub}/>
                <span style={{fontSize:13,color:C.modalText,fontFamily:"'DM Sans',sans-serif"}}>{lbl}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {step==="resultado"&&(
        <div>
          <div style={{background:veredito==="nao"?"rgba(224,82,82,0.1)":veredito==="atencao"?"rgba(212,168,67,0.12)":veredito==="semdados"?"rgba(0,0,0,0.04)":"rgba(143,196,58,0.12)",
            border:`1.5px solid ${veredito==="nao"?"rgba(224,82,82,0.3)":veredito==="atencao"?"rgba(212,168,67,0.35)":veredito==="semdados"?"rgba(0,0,0,0.1)":"rgba(143,196,58,0.35)"}`,
            borderRadius:14,padding:16,marginBottom:14}}>
            <div style={{fontSize:17,fontWeight:700,marginBottom:6,color:veredito==="nao"?"#C0392B":veredito==="atencao"?"#8B6F14":veredito==="semdados"?C.modalText:"#2D5A10"}}>
              {veredito==="nao"?"Eu não compraria agora.":veredito==="atencao"?"Dá, mas com atenção.":veredito==="semdados"?"Ainda não tenho dados suficientes.":"Pode comprar."}
            </div>
            {veredito==="semdados" ? (
              <div style={{fontSize:12.5,color:C.modalSub,fontFamily:"'DM Sans',sans-serif",lineHeight:1.5}}>Preciso de pelo menos um mês de entradas registradas pra calcular sua renda média. Registre seus plantões e eu calculo certinho da próxima vez.</div>
            ) : (
              <>
                <div style={{fontSize:12.5,color:C.modalSub,fontFamily:"'DM Sans',sans-serif",lineHeight:1.5}}>
                  Sua renda já está <strong style={{color:C.modalText}}>{pctAtual.toFixed(0)}%</strong> comprometida com parcelas.{" "}
                  {parcelado
                    ? <>Com essa de <strong style={{color:C.modalText}}>{R(parcela)}</strong>, vai a <strong style={{color:C.modalText}}>{pctComCompra.toFixed(0)}%</strong>.</>
                    : <>Comprando à vista, esse mês fica <strong style={{color:C.modalText}}>{R(comprometidoAtual+parcela)}</strong> comprometido.</>}
                  {" "}A regra é no máximo {REGRA_COMPROMETIMENTO_MAX}%.
                </div>
                {jurosEstimados>1&&(
                  <div style={{marginTop:8,display:"flex",alignItems:"center",gap:6,fontSize:11.5,color:"#8B6F14",fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>
                    <AlertTriangle size={13} strokeWidth={2.2}/>+{R(jurosEstimados)} de juros estimados
                  </div>
                )}
              </>
            )}
          </div>

          {!semDados&&(
            <div style={{background:"rgba(0,0,0,0.03)",borderRadius:12,padding:14,marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:10.5,color:C.modalSub,fontFamily:"'DM Mono',ui-monospace,monospace",marginBottom:6,letterSpacing:".04em",textTransform:"uppercase"}}>
                <span>Sobra p/ metas hoje</span><span>Com essa compra</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span className="num" style={{fontSize:16,fontWeight:700,color:C.modalText}}>{R(mediaSaldoLivre3Meses)}</span>
                <span style={{color:C.modalSub,fontSize:13}}>→</span>
                <span className="num" style={{fontSize:16,fontWeight:700,color:sobraParaMetasDepois<0?"#C0392B":C.modalText}}>{R(sobraParaMetasDepois)}</span>
              </div>
            </div>
          )}

          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {(veredito==="nao"||veredito==="atencao")&&(
              <Btn variant="secondary" style={{width:"100%"}} onClick={()=>setStep("fazercaber")}>Ver como fazer caber</Btn>
            )}
            <Btn variant={veredito==="nao"?"danger":"primary"} style={{width:"100%"}} onClick={()=>setStep("decisao")}>{veredito==="nao"?"Mesmo assim, decidir agora":"Continuar"}</Btn>
          </div>
        </div>
      )}

      {step==="fazercaber"&&(
        <div>
          <SL>Dá pra fazer caber</SL>
          <div style={{fontSize:12,color:C.modalSub,marginBottom:14,fontFamily:"'DM Sans',sans-serif"}}>Escolha um caminho. Cada um mostra o que acontece com o seu mês.</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {corteNecessario>0&&categoriaMaiorGasto&&(
              <button onClick={()=>setStep("decisao")} style={{textAlign:"left",background:"rgba(0,0,0,0.04)",border:"1.5px solid rgba(0,0,0,0.1)",borderRadius:12,padding:14,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                <div style={{fontSize:13,fontWeight:700,color:C.modalText,marginBottom:4}}>✂️ Gastar {R(corteNecessario)} a menos por mês</div>
                <div style={{fontSize:11.5,color:C.modalSub}}>Sua maior categoria esse mês é {categoriaMaiorGasto.nome} ({R(categoriaMaiorGasto.valor)}) — reduzindo ali, a parcela cabe.</div>
              </button>
            )}
            {mesesGuardando>0&&(
              <button onClick={()=>setStep("decisao")} style={{textAlign:"left",background:"rgba(0,0,0,0.04)",border:"1.5px solid rgba(0,0,0,0.1)",borderRadius:12,padding:14,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                <div style={{fontSize:13,fontWeight:700,color:C.modalText,marginBottom:4}}>⏳ Guardar e comprar à vista em {fdFull(dataGuardando)}</div>
                <div style={{fontSize:11.5,color:C.modalSub}}>Guardando {R(mediaSaldoLivre3Meses)} por mês (sua média de hoje), sem dívida.</div>
              </button>
            )}
            {parcelado&&parcelasMinNecessarias>n&&(
              <button onClick={()=>{setNumParcelas(String(parcelasMinNecessarias));setStep("decisao");}} style={{textAlign:"left",background:"rgba(0,0,0,0.04)",border:"1.5px solid rgba(0,0,0,0.1)",borderRadius:12,padding:14,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                <div style={{fontSize:13,fontWeight:700,color:C.modalText,marginBottom:4}}>🔁 Parcelar em {parcelasMinNecessarias}x</div>
                <div style={{fontSize:11.5,color:C.modalSub}}>Parcela menor, cabe dentro da regra de {REGRA_COMPROMETIMENTO_MAX}% da renda.</div>
              </button>
            )}
            {!(corteNecessario>0&&categoriaMaiorGasto)&&!(mesesGuardando>0)&&!(parcelado&&parcelasMinNecessarias>n)&&(
              <div style={{fontSize:12.5,color:C.modalSub,fontFamily:"'DM Sans',sans-serif"}}>Não encontrei um caminho fácil agora — talvez valha esperar ou repensar o valor.</div>
            )}
          </div>
          <Btn variant="secondary" style={{width:"100%",marginTop:14}} onClick={()=>setStep("resultado")}>Voltar</Btn>
        </div>
      )}

      {step==="decisao"&&(
        <div>
          <SL>Então, o que você vai fazer?</SL>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {mesesGuardando>0&&(
              <button onClick={()=>criarMeta(dataGuardando)} style={{textAlign:"left",background:"rgba(143,196,58,0.12)",border:"1.5px solid rgba(143,196,58,0.35)",borderRadius:12,padding:14,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                <div style={{fontSize:13,fontWeight:700,color:"#2D5A10",marginBottom:4}}>💰 Vou guardar primeiro</div>
                <div style={{fontSize:11.5,color:C.modalSub}}>Meta de {R(mediaSaldoLivre3Meses)} por mês, compra em {fdFull(dataGuardando)}.</div>
              </button>
            )}
            <button onClick={onClose} style={{textAlign:"left",background:"rgba(0,0,0,0.04)",border:"1.5px solid rgba(0,0,0,0.1)",borderRadius:12,padding:14,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
              <div style={{fontSize:13,fontWeight:700,color:C.modalText,marginBottom:4}}>😴 Decidir amanhã</div>
              <div style={{fontSize:11.5,color:C.modalSub}}>Se amanhã ainda quiser, volta aqui.</div>
            </button>
            <button onClick={onClose} style={{textAlign:"left",background:"rgba(0,0,0,0.04)",border:"1.5px solid rgba(0,0,0,0.1)",borderRadius:12,padding:14,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
              <div style={{fontSize:13,fontWeight:700,color:C.modalText,marginBottom:4}}>🙅 Vou desistir</div>
              <div style={{fontSize:11.5,color:C.modalSub}}>Não preciso disso agora.</div>
            </button>
          </div>
        </div>
      )}

      {step==="concluido"&&metaCriada&&(
        <div style={{textAlign:"center",padding:"10px 0"}}>
          <div style={{fontSize:30,marginBottom:10}}>💰</div>
          <div style={{fontSize:17,fontWeight:700,color:C.modalText,marginBottom:8}}>Compra planejada.</div>
          <div style={{fontSize:12.5,color:C.modalSub,marginBottom:18,fontFamily:"'DM Sans',sans-serif"}}>
            {R(mediaSaldoLivre3Meses)} por mês até {fdFull(metaCriada.prazo)}. Meta criada.
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <Btn variant="primary" style={{width:"100%"}} onClick={()=>{navTo&&navTo("objetivos");onClose();}}>Ver a meta</Btn>
            <Btn variant="secondary" style={{width:"100%"}} onClick={()=>{setStep("categoria");setCategoria(null);setDescricao("");setValor("");setParcelado(false);setMetaCriada(null);}}>Simular outra compra</Btn>
          </div>
        </div>
      )}

    </Modal>
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
          <div style={{fontSize:40,marginBottom:16}}><AlertTriangle size={36}/></div>
          <div style={{fontSize:18,fontWeight:700,color:"#1A1209",marginBottom:10}}>Algo deu errado</div>
          <div style={{fontSize:13,color:"#5A4A3A",marginBottom:20,maxWidth:400,wordBreak:"break-word"}}>{String(this.state.error?.message||this.state.error||"Erro desconhecido")}</div>
          <button onClick={()=>{localStorage.clear();window.location.reload();}}
            style={{background:"#B91D55",color:"#fff",border:"none",borderRadius:12,padding:"12px 24px",fontSize:14,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:7}}>
            <RefreshCw size={14} strokeWidth={2.2}/>Limpar dados e recarregar
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
  // Modo de tela: "auto" (decide pela largura), "celular" ou "pc"
  const [modoTela,  setModoTela]   = useLS("v4_modo",   "auto", userId);
  const [larguraTela,setLarguraTela]=useState(typeof window!=="undefined"?window.innerWidth:1024);
  useEffect(()=>{
    const f=()=>setLarguraTela(window.innerWidth);
    window.addEventListener("resize",f);window.addEventListener("orientationchange",f);
    return ()=>{window.removeEventListener("resize",f);window.removeEventListener("orientationchange",f);};
  },[]);
  const isMobile = modoTela==="celular" || (modoTela!=="pc" && larguraTela<=640);
  const [dashCards, setDashCards] = useLS("v4_dash_cards", {}, userId);
  const [dashLayouts, setDashLayouts] = useLS("v4_dash_layout", {}, userId);
  const [dashEditMode, setDashEditMode] = useState(false);
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
  const [filaConfirmacaoPlt, setFilaConfirmacaoPlt] = useState([]); // ids de plantões aguardando confirmação
  const [confirmandoPlt, setConfirmandoPlt] = useState(null); // {plantaoId, mostrarCobertura} — o que está na tela agora
  const [editSaldoMes, setEditSaldoMes] = useState(null);
  const [mortoReportOpen, setMortoReportOpen] = useState(false);

  const [tab,setTab]=useState("dashboard");
  const [modal,setModal]=useState(null);
  const [edit,setEdit]=useState(null);
  const [extra,setExtra]=useState(null);
  const [selMes,setSelMes]=useState(today().slice(0,7));
  const [sideOpen,setSideOpen]=useState(false);
  const [metaPrincipal,setMetaPrincipal]=useLS("v4_meta_principal","",userId);
  const [goalIdx,setGoalIdx]=useState(0);
  const [cdiAtual,setCdiAtual]=useState(()=>{try{return JSON.parse(localStorage.getItem("velara_cdi")||"null")?.valor||null;}catch{return null;}});
  useEffect(()=>{fetchCDI().then(v=>{if(v)setCdiAtual(v);});},[]);
  const jaAconteceu = p => {
    if(!p.data) return false;
    if(p.horaFim){
      let fimDate = new Date(p.data+"T"+p.horaFim+":00");
      // se a hora de fim é menor/igual à de início, o plantão vira a noite (termina no dia seguinte)
      if(p.horaInicio && p.horaFim<=p.horaInicio) fimDate.setDate(fimDate.getDate()+1);
      return fimDate <= new Date();
    }
    // sem horário definido: só considera que passou quando o dia inteiro já virou
    return p.data < today();
  };
  useEffect(()=>{
    const pendentes = plantoes.filter(p=>p.data && jaAconteceu(p) && p.confirmado===undefined);
    if(pendentes.length>0){
      setFilaConfirmacaoPlt(pendentes.map(p=>p.id));
      setConfirmandoPlt({plantaoId:pendentes[0].id, mostrarCobertura:false});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);
  const confirmarPlantaoRealizado=(id,fez,coberturaPor)=>{
    setPlantoes(plantoes.map(p=>{
      if(p.id!==id)return p;
      if(fez) return {...p, confirmado:true};
      return {...p, confirmado:false, coberturaPor:coberturaPor||"", valorOriginal:p.valorTotal, valorTotal:0};
    }));
    const resto = filaConfirmacaoPlt.filter(pid=>pid!==id);
    setFilaConfirmacaoPlt(resto);
    if(resto.length>0) setConfirmandoPlt({plantaoId:resto[0], mostrarCobertura:false});
    else setConfirmandoPlt(null);
  };
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
  // Saldo ao FIM de um mês, acumulando desde o primeiro mês com dados (carry-forward),
  // respeitando ajustes manuais e descontando o que foi distribuído pra investimento/objetivo/dívida.
  // Mesma lógica do saldoFinal — usada pelo pop-up de novo mês e pelo "ajustar".
  useEffect(()=>{
    const desp=cats?.despesa||[];
    if(desp.length&&!desp.some(c=>c.nome==="Dívidas")) setCats({...cats,despesa:[...desp,{id:"cat_div",nome:"Dívidas",emoji:"💳",subcats:[]}]});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);
  const saldoFimDoMes=(mes)=>{
    const chaves=[...Object.keys(saldoMensal),...movs.map(m=>monthKey(m.data))].filter(Boolean).sort();
    if(!chaves.length) return 0;
    let mesAtual=chaves[0];
    let base=saldoMensal[mesAtual]!==undefined?+saldoMensal[mesAtual]:0;
    let fim=base;
    let guard=0;
    while(mesAtual<=mes && guard<600){
      const ent=movs.filter(m=>m.tipo==="entrada"&&monthKey(m.data)===mesAtual).reduce((s,m)=>s+m.valor,0);
      const sai=movs.filter(m=>m.tipo==="saida"&&monthKey(m.data)===mesAtual).reduce((s,m)=>s+m.valor,0);
      const tA=movs.filter(m=>m.tipo==="transferencia"&&m.subtipo!=="resgate"&&monthKey(m.data)===mesAtual).reduce((s,m)=>s+m.valor,0);
      const tR=movs.filter(m=>m.tipo==="transferencia"&&m.subtipo==="resgate"&&monthKey(m.data)===mesAtual).reduce((s,m)=>s+m.valor,0);
      fim=base+ent-sai-tA+tR-(distribuidoNaoLivrePorMes[mesAtual]||0);
      mesAtual=shiftMonth(mesAtual,1);
      base=saldoMensal[mesAtual]!==undefined?+saldoMensal[mesAtual]:fim;
      guard++;
    }
    return fim;
  };
  useEffect(()=>{
    const mesAtualReal = today().slice(0,7);
    if(saldoMensal[mesAtualReal]!==undefined) return;
    const mesAnterior = shiftMonth(mesAtualReal,-1);
    const temDadosAnterior = saldoMensal[mesAnterior]!==undefined || movs.some(m=>monthKey(m.data)===mesAnterior);
    if(!temDadosAnterior) return;
    setConfirmSaldoMes({mes:mesAtualReal, valor:saldoFimDoMes(mesAnterior).toFixed(2)});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);
  const [alocExpanded,setAlocExpanded]=useState(false);
  const [importOpen,setImportOpen]=useState(false);
  const [simularOpen,setSimularOpen]=useState(false);
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
  const [fAporteInv,setFAporteInv]=useState({valor:"",data:today(),obs:"",descontar:true});
  const [cronoAberto,setCronoAberto]=useState(null); // id do investimento com cronologia expandida
  const [temDinheiroPergunta,setTemDinheiroPergunta]=useState(null); // {mov, valorTotal} aguardando resposta
  const [planoAcaoAberto,setPlanoAcaoAberto]=useState(null); // {descricao, valorTotal} pra mostrar estrategia
  const [fParte,setFParte]=useState({descricao:"",valor:"",investId:""});
  const [movDist,setMovDist]=useState(null);

  const [fMov,setFMov]=useState({tipo:"saida",descricao:"",valor:"",categoria:CATS_OUT[0],data:today(),subtipo:"aporte",investId:"",formaPagamento:"dinheiro",cartaoId:"",parcelado:false,numParcelas:"2"});
  const [fEmp,setFEmp]=useState({nome:"",contato:"",prazo:"30",cor:"#B91D55"});
  const [fPlt,setFPlt]=useState({empresa:"",data:"",horaInicio:"",horaFim:"",horas:"",valorH:"",valorTotal:"",prazo:"30",previsao:"",status:"pendente",obs:""});
  const [fPltLote,setFPltLote]=useState({empresa:"",valorTotal:"",horas:"",horaInicio:"",horaFim:"",previsao:"",diasSelecionados:[],mesLote:today().slice(0,7)});
  const [agendaView,setAgendaView]=useState("7");
  const [hoveredWeek,setHoveredWeek]=useState(null);
  const [agMes,setAgMes]=useState(()=>today().slice(0,7));
  const [agSel,setAgSel]=useState(()=>today());
  const [agendaInicio,setAgendaInicio]=useState(()=>{
    const hoje=new Date(today()+"T12:00:00");
    hoje.setDate(hoje.getDate()-hoje.getDay());
    return hoje.toISOString().slice(0,10);
  });
  const [fInv,setFInv]=useState({nome:"",tipo:"CDB",banco:"",aporte:"",taxa:"",taxaModo:"fixo",percCDI:"",data:today(),obs:""});
  const [fObj,setFObj]=useState({nome:"",meta:"",atual:"0",prazo:"",cor:C.green,obs:"",investId:""});
  const [fDiv,setFDiv]=useState({credor:"",total:"",pago:"0",prazo:"",parcelas:"",obs:""});
  const [fCartaoRenegoc,setFCartaoRenegoc]=useState({credor:"",numParcelas:"12",valorComDesconto:"",valorSemDesconto:"",percentualDesconto:"",percentualAntecipado:"",dataPrimeiraParcela:today()});
  const [cartaoRenegocExpandido,setCartaoRenegocExpandido]=useState(null);
  const [pagarParcelaModal,setPagarParcelaModal]=useState(null); // {divId, parcelaIdx}
  const [pagarParcelaData,setPagarParcelaData]=useState(today());
  const [fCart,setFCart]=useState({nome:"",bandeira:"",limite:"",fechamento:"",vencimento:""});
    const [fAporte,setFAporte]=useState({valor:"",data:today()});
  const [fPgto,setFPgto]=useState({valor:"",data:today()});

  useEffect(()=>{const h=parseFloat(fPlt.horas),v=parseFloat(fPlt.valorH);if(h&&v)setFPlt(f=>({...f,valorTotal:(h*v).toFixed(2)}));},[fPlt.horas,fPlt.valorH]);
  const pularRecalcPrevisao=useRef(false);
  useEffect(()=>{
    if(pularRecalcPrevisao.current){pularRecalcPrevisao.current=false;return;}
    if(fPlt.data&&fPlt.prazo)setFPlt(f=>({...f,previsao:addDays(f.data,parseInt(f.prazo)||30)}));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[fPlt.data,fPlt.prazo]);

  const openM=(m,item=null,ex=null)=>{
    setEdit(item);setExtra(ex);setModal(m);
    if(m==="mov")   setFMov(item?{...item,subtipo:item.subtipo||"aporte",investId:item.investId||"",formaPagamento:item.formaPagamento||"dinheiro",cartaoId:item.cartaoId||"",parcelado:false,numParcelas:"2"}:{tipo:"saida",descricao:"",valor:"",categoria:CATS_OUT[0],data:today(),subtipo:"aporte",investId:"",formaPagamento:"dinheiro",cartaoId:"",parcelado:false,numParcelas:"2"});
    if(m==="emp")   setFEmp(item?{...item}:{nome:"",contato:"",prazo:"30",cor:"#B91D55"});
    if(m==="plt"){
      if(item)pularRecalcPrevisao.current=true;
      setFPlt(item?{...item,horaInicio:item.horaInicio||"",horaFim:item.horaFim||""}:{empresa:"",data:"",horaInicio:"",horaFim:"",horas:"",valorH:"",valorTotal:"",prazo:"30",previsao:"",status:"pendente",obs:""});
    }
    if(m==="inv")   setFInv(item?{...item,taxaModo:item.taxaModo||"fixo"}:{nome:"",tipo:"CDB",banco:"",aporte:"",taxa:"",taxaModo:"fixo",percCDI:"",data:today(),obs:""});
    if(m==="obj")   setFObj(item?{...item}:{nome:"",meta:"",atual:"0",prazo:"",cor:C.green,obs:"",investId:""});
    if(m==="div")   setFDiv(item?{...item}:{credor:"",total:"",pago:"0",prazo:"",parcelas:"",obs:""});
    if(m==="cart")  setFCart(item?{...item}:{nome:"",bandeira:"",limite:"",fechamento:"",vencimento:""});
    if(m==="ccmov") setFCCMov(item?{...item}:{cartao:ex||"",descricao:"",valor:"",categoria:CATS_OUT[0],data:today()});
    if(m==="aporteInv") setFAporteInv({valor:"",data:today(),obs:"",descontar:true});
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
  // Lançamento rápido por texto: salva direto (mesma lógica do saveMov, sem passar pelo modal)
  const salvarRapido=(it)=>{
    const valorNum=+it.valor;
    if(it.tipo==="saida"&&it.formaPagamento==="cartao"&&it.parcelas>1){
      const n=Math.max(2,+it.parcelas);
      const valorParcela=+(valorNum/n).toFixed(2);
      const grupoId=uid();
      const novos=Array.from({length:n},(_,idx)=>({
        id:uid(), tipo:"saida", descricao:`${it.descricao} (${idx+1}/${n})`, valor:valorParcela,
        categoria:it.categoria, data:addMonths(it.data,idx),
        formaPagamento:"cartao", cartaoId:it.cartaoId, parcelaAtual:idx+1, parcelaTotal:n, compraGrupoId:grupoId,
      }));
      setMovs([...novos,...movs]);
      setTemDinheiroPergunta({descricao:it.descricao,valorTotal:valorNum});
      return;
    }
    setMovs([{id:uid(),tipo:it.tipo,descricao:it.descricao,valor:valorNum,categoria:it.categoria,data:it.data,
      formaPagamento:it.tipo==="saida"?it.formaPagamento:"dinheiro",cartaoId:it.tipo==="saida"&&it.formaPagamento==="cartao"?it.cartaoId:""},...movs]);
    if(it.tipo==="saida"&&it.formaPagamento==="cartao") setTemDinheiroPergunta({descricao:it.descricao,valorTotal:valorNum});
  };
  const editarRapido=(it)=>{
    openM("mov");
    setFMov(f=>({...f,tipo:it.tipo,descricao:it.descricao,valor:String(it.valor),categoria:it.categoria||(it.tipo==="entrada"?CATS_IN[0]:CATS_OUT[0]),
      data:it.data,formaPagamento:it.formaPagamento,cartaoId:it.cartaoId||"",parcelado:it.parcelas>1,numParcelas:String(it.parcelas>1?it.parcelas:2)}));
  };
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
  const savePlt=()=>{
    if(!fPlt.empresa||!fPlt.data||!fPlt.valorTotal)return;
    const estavaEditando=!!edit;
    const novoPlt={...fPlt,valorTotal:+fPlt.valorTotal};
    if(novoPlt.status==="recebido"&&(!edit||edit.status!=="recebido")){
      // não grava como recebido direto: abre "Quando você recebeu?" para criar a entrada no mês certo
      const id=edit?edit.id:uid();
      const base={...novoPlt,id,status:"pendente"};
      setPlantoes(edit?plantoes.map(x=>x.id===id?base:x):[base,...plantoes]);
      closeM();
      setRecebData(today());
      setRecebModal(base);
      return;
    }
    upsert(plantoes,setPlantoes,novoPlt);
    if(estavaEditando){
      const novaChave=monthKey(novoPlt.previsao||novoPlt.data);
      if(novaChave)setPltMes(novaChave);
    }
  };
  const savePltLote=()=>{
    const f=fPltLote;
    if(!f.empresa||!f.valorTotal||f.diasSelecionados.length===0)return;
    const valorTotal=+String(f.valorTotal).replace(",",".");
    const novos=f.diasSelecionados.map(dia=>({
      id:uid(), empresa:f.empresa, data:`${f.mesLote}-${String(dia).padStart(2,"0")}`,
      horaInicio:f.horaInicio||"", horaFim:f.horaFim||"",
      horas:f.horas||"", valorH:f.horas&&valorTotal?(valorTotal/(+f.horas)).toFixed(2):"",
      valorTotal, previsao:f.previsao||"", status:"pendente", obs:"",
    }));
    setPlantoes([...novos,...plantoes]);
    setFPltLote({empresa:"",valorTotal:"",horas:"",horaInicio:"",horaFim:"",previsao:"",diasSelecionados:[],mesLote:today().slice(0,7)});
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

  const CATEGORIA_DIVIDA="💳 Dívidas";
  const marcarParcelaPaga=(divId,parcelaIdx,comDesconto)=>{
    const div=dividas.find(d=>d.id===divId); if(!div)return;
    const parc=div.parcelasStatus[parcelaIdx]; if(!parc)return;
    const valorPago=comDesconto?div.valorComDesconto:div.valorSemDesconto;
    const dataPg=pagarParcelaData||today();
    const movId=uid();
    // a parcela paga sai do saldo do mês em que foi paga
    setMovs([{id:movId,tipo:"saida",descricao:`Dívida - ${div.credor} (parcela ${parc.numero}/${div.numParcelas})`,valor:valorPago,categoria:CATEGORIA_DIVIDA,data:dataPg,formaPagamento:"pix",dividaId:divId},...movs]);
    setDividas(dividas.map(d=>{
      if(d.id!==divId)return d;
      const novasParcelas=d.parcelasStatus.map((p,idx)=>idx===parcelaIdx?{...p,pago:true,valorPago,comDesconto,dataPagamento:dataPg,movId}:p);
      const novoPago=novasParcelas.reduce((s,p)=>s+(p.pago?p.valorPago:0),0);
      return {...d,parcelasStatus:novasParcelas,pago:novoPago};
    }));
    setPagarParcelaModal(null);
  };
  const desmarcarParcela=(divId,parcelaIdx)=>{
    const div=dividas.find(d=>d.id===divId);
    const movId=div?.parcelasStatus[parcelaIdx]?.movId;
    if(movId) setMovs(movs.filter(m=>m.id!==movId)); // desfaz a saída no caixa
    setDividas(dividas.map(d=>{
      if(d.id!==divId)return d;
      const novasParcelas=d.parcelasStatus.map((p,idx)=>idx===parcelaIdx?{...p,pago:false,valorPago:0,comDesconto:null,dataPagamento:undefined,movId:undefined}:p);
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
  // Aporte direto num investimento (aba Investimentos)
  const saveAporteInv=()=>{
    const v=numBR(fAporteInv.valor);
    if(!(v>0)||!extra)return;
    const inv=invests.find(x=>x.id===extra);
    if(!inv)return;
    const data=fAporteInv.data||today();
    const obs=(fAporteInv.obs||"").trim();
    if(fAporteInv.descontar){
      // vira uma transferência (sai do saldo do mês) — aparece também em Movimentos
      setMovs([{id:uid(),tipo:"transferencia",subtipo:"aporte",investId:inv.id,descricao:obs||`Aporte - ${inv.nome}`,valor:v,categoria:"🔄 Transferência",data,formaPagamento:"dinheiro"},...movs]);
      setInvests(invests.map(i=>i.id===inv.id?{...i,aporte:i.aporte+v}:i));
    } else {
      // só registra (dinheiro que já não estava no saldo): não mexe no saldo do mês
      setInvests(invests.map(i=>i.id===inv.id?{...i,aporte:i.aporte+v,aportesManuais:[{id:uid(),data,valor:v,origem:"registro",obs},...(i.aportesManuais||[])]}:i));
    }
    alimentarPato(v);
    closeM();
  };
  const removeAporteManual=(investId,entryId)=>{
    const inv=invests.find(x=>x.id===investId);
    const e=(inv?.aportesManuais||[]).find(x=>x.id===entryId);
    if(!inv||!e)return;
    setInvests(invests.map(i=>i.id===investId?{...i,aporte:Math.max(0,i.aporte-e.valor),aportesManuais:(i.aportesManuais||[]).filter(x=>x.id!==entryId)}:i));
  };
  const saveAporte=()=>{
    if(!fAporte.valor||!extra)return;
    const v=+String(fAporte.valor).replace(",",".");
    const obj=objetivos.find(o=>o.id===extra);
    setObjetivos(objetivos.map(o=>o.id===extra?{...o,atual:+o.atual+v}:o));
    if(obj?.investId) setInvests(invests.map(i=>i.id===obj.investId?{...i,aporte:i.aporte+v,aportesManuais:[{id:uid(),data:fAporte.data||today(),valor:v,origem:"objetivo",obs:obj.nome},...(i.aportesManuais||[])]}:i));
    alimentarPato(v);
    closeM();
  };
  const savePgto=()=>{
    if(!fPgto.valor||!extra)return;
    const v=numBR(fPgto.valor); if(!(v>0))return;
    const div=dividas.find(d=>d.id===extra);
    setDividas(dividas.map(d=>d.id===extra?{...d,pago:Math.min(+d.pago+v,+d.total)}:d));
    // o pagamento sai do saldo do mês da data escolhida
    setMovs([{id:uid(),tipo:"saida",descricao:`Dívida - ${div?.credor||"pagamento"}`,valor:v,categoria:CATEGORIA_DIVIDA,data:fPgto.data||today(),formaPagamento:"pix",dividaId:extra},...movs]);
    alimentarPato(v);
    closeM();
  };

  const getPltStatus=p=>{if(p.status==="recebido")return"recebido";if(p.status==="cancelado")return"cancelado";if(isPast(p.previsao))return"atrasado";return"pendente";};
  // Plantão marcado como "recebido" pela edição (sem passar por "Receber"): sem data e sem entrada no caixa
  const recebidoSemEntrada=p=>p.status==="recebido"&&!p.dataRecebimento&&!movs.some(m=>m.tipo==="entrada"&&m.descricao===`Plantão - ${p.empresa}`&&Math.abs(m.valor-p.valorTotal)<0.01);

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
  // Valores distribuídos via "distribuir plantão" para investimento/objetivo/dívida.
  // Esse dinheiro sai do caixa disponível mas não vira "saída"/"transferência" em movs,
  // então precisa ser descontado do saldo separadamente por mês.
  const distribuidoNaoLivrePorMes=useMemo(()=>{
    const m={};
    alocacoes.forEach(a=>{
      const mk=monthKey(a.data);
      const val=a.itens.filter(it=>it.tipo!=="livre").reduce((s,it)=>s+it.valor,0);
      m[mk]=(m[mk]||0)+val;
    });
    return m;
  },[alocacoes]);
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
      return ent-sai-tA+tR-(distribuidoNaoLivrePorMes[mk]||0);
    });
    return valores.reduce((s,v)=>s+v,0)/valores.length;
  },[movs,distribuidoNaoLivrePorMes]);
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
  const saldo=entradas-saidas-transferencias-(distribuidoNaoLivrePorMes[selMes]||0);

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

  const semanasLivres=useMemo(()=>{
    // Início da semana atual (domingo)
    const hoje=new Date(today()+"T12:00:00");
    const inicioSemanaAtual=new Date(hoje);
    inicioSemanaAtual.setDate(hoje.getDate()-hoje.getDay());

    const semanas=Array.from({length:6},(_,i)=>{
      const inicio=new Date(inicioSemanaAtual);
      inicio.setDate(inicioSemanaAtual.getDate()+i*7);
      const fim=new Date(inicio);
      fim.setDate(inicio.getDate()+6);
      const inicioStr=inicio.toISOString().slice(0,10);
      const fimStr=fim.toISOString().slice(0,10);
      const plantoesSemana=plantoes.filter(p=>p.data&&p.data>=inicioStr&&p.data<=fimStr&&+p.horas>0);
      const horas=plantoesSemana.reduce((s,p)=>s+(+p.horas||0),0);
      return {inicio:inicioStr,fim:fimStr,horas,qtdPlantoes:plantoesSemana.length,ehAtual:i===0};
    });

    const mediaHoras=semanas.reduce((s,sem)=>s+sem.horas,0)/semanas.length;
    return semanas.map(sem=>({...sem,temEspaco:mediaHoras>0&&sem.horas<mediaHoras*0.6}));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[plantoes]);

  // Horas trabalhadas por semana — histórico (passadas + atual)
  const horasPorSemana=useMemo(()=>{
    const hoje=new Date(today()+"T12:00:00");
    const inicioSemanaAtual=new Date(hoje);
    inicioSemanaAtual.setDate(hoje.getDate()-hoje.getDay());

    const semanas=Array.from({length:9},(_,i)=>{
      const offset=i-4; // 4 semanas passadas + atual + 4 semanas futuras
      const inicio=new Date(inicioSemanaAtual);
      inicio.setDate(inicioSemanaAtual.getDate()+offset*7);
      const fim=new Date(inicio);
      fim.setDate(inicio.getDate()+6);
      const inicioStr=inicio.toISOString().slice(0,10);
      const fimStr=fim.toISOString().slice(0,10);
      const plantoesSemana=plantoes.filter(p=>p.data&&p.data>=inicioStr&&p.data<=fimStr&&+p.horas>0);
      const horas=plantoesSemana.reduce((s,p)=>s+(+p.horas||0),0);
      return {inicio:inicioStr,fim:fimStr,horas,qtdPlantoes:plantoesSemana.length,ehAtual:offset===0,ehFutura:offset>0};
    });
    const semanasComDados=semanas.filter(s=>s.horas>0);
    const mediaHoras=semanasComDados.length?semanasComDados.reduce((s,sem)=>s+sem.horas,0)/semanasComDados.length:0;
    return {semanas,mediaHoras,semanaAtual:semanas.find(s=>s.ehAtual)};
  },[plantoes]);

  const agendaDias=useMemo(()=>{
    const n=+agendaView;
    const minTot=t=>{const [h,m]=t.split(":").map(Number);return h*60+m;};
    return Array.from({length:n},(_,i)=>{
      const d=new Date(agendaInicio+"T12:00:00");
      d.setDate(d.getDate()+i);
      const dataStr=d.toISOString().slice(0,10);
      const todosDoDia=plantoes.filter(p=>p.data===dataStr);
      const plantoesDia=todosDoDia.filter(p=>p.horaInicio&&p.horaFim).map(p=>{
        const emp=empresas.find(e=>e.nome===p.empresa);
        let ini=minTot(p.horaInicio), fim=minTot(p.horaFim);
        if(fim<=ini)fim=24*60; // corta à meia-noite (simplificação p/ plantões noturnos)
        return {...p,iniMin:ini,fimMin:fim,cor:emp?.cor||C.magenta};
      }).sort((a,b)=>a.iniMin-b.iniMin);
      const plantoesSemHorario=todosDoDia.filter(p=>!p.horaInicio||!p.horaFim).map(p=>{
        const emp=empresas.find(e=>e.nome===p.empresa);
        return {...p,cor:emp?.cor||C.magenta};
      });

      // Calcula períodos livres (gaps) dentro de 00:00–24:00
      const livres=[];
      let cursor=0;
      plantoesDia.forEach(p=>{
        if(p.iniMin>cursor+30)livres.push({ini:cursor,fim:p.iniMin});
        cursor=Math.max(cursor,p.fimMin);
      });
      if(cursor<24*60-30)livres.push({ini:cursor,fim:24*60});

      return {data:dataStr, diaSemana:d.getDay(), diaNum:d.getDate(), plantoes:plantoesDia, plantoesSemHorario, livres};
    });
  },[agendaView,agendaInicio,plantoes,empresas]);

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
      const fim=base+ent-sai-tA+tR-(distribuidoNaoLivrePorMes[mesAtual]||0);
      mesAtual=shiftMonth(mesAtual,1);
      base=saldoMensal[mesAtual]!==undefined?+saldoMensal[mesAtual]:fim;
      guard++;
    }
    return base+saldo;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[selMes,movs,saldoMensal,distribuidoNaoLivrePorMes]);
  const estaMorto=saldoFinal<0;
  const totalInvestido=invests.reduce((s,i)=>s+i.aporte,0);
  const totalFundoDivida=dividas.filter(d=>d.tipo==="fundo"&&!d.investId).reduce((s,d)=>s+(+d.pago||0),0);
  const totalObjetivos=objetivos.filter(o=>!o.investId).reduce((s,o)=>s+(+o.atual||0),0);
  const totalPatrimonio=totalInvestido+totalFundoDivida;
  const totalDividas=dividas.reduce((s,d)=>s+(+d.total-+d.pago),0);
  const parcelasDividaMes=dividas.filter(d=>d.tipo==="cartao_desconto").reduce((s,d)=>s+(d.parcelasStatus||[]).filter(p=>!p.pago&&monthKey(p.dataVencimento)===selMes).length*(+d.valorComDesconto||0),0);
  // Saídas exibidas = saídas lançadas + parcelas de dívida do mês ainda não pagas (as pagas já viram lançamento)
  const saidasTotal=saidas+parcelasDividaMes;
  const totalPendPlant=plantoesEfetivos.filter(p=>["pendente","atrasado"].includes(p.se)).reduce((s,p)=>s+p.valorTotal,0);
  const palBg=BG_PALETTES[bgId]||BG_PALETTES.tartan;
  const serie6=fn=>Array.from({length:6},(_,i)=>fn(shiftMonth(selMes,i-5)));
  const gastosSerie=serie6(m=>movs.filter(x=>x.tipo==="saida"&&monthKey(x.data)===m).reduce((s,x)=>s+(+x.valor||0),0)).map((v,i)=>i===5?v+parcelasDividaMes:v);
  const gastosAnt=gastosSerie[4]||0;
  const gastosVar=gastosAnt>0?Math.round((saidasTotal-gastosAnt)/gastosAnt*100):null;
  const receberSerie=Array.from({length:6},(_,i)=>{const m=shiftMonth(selMes,i);return plantoesEfetivos.filter(p=>["pendente","atrasado"].includes(p.se)&&mesDoPlantao(p)===m).reduce((s,p)=>s+(+p.valorTotal||0),0);});
  const aporteSerie=serie6(m=>movs.filter(x=>x.tipo==="transferencia"&&monthKey(x.data)<=m).reduce((s,x)=>s+(x.subtipo==="resgate"?-1:1)*(+x.valor||0),0));
  const dividaTotalBruto=dividas.reduce((s,d)=>s+(+d.total||0),0);
  const dividaPct=dividaTotalBruto>0?Math.round(dividas.reduce((s,d)=>s+(+d.pago||0),0)/dividaTotalBruto*100):0;
  const aReceberMes=plantoesEfetivos.filter(p=>["pendente","atrasado"].includes(p.se)&&mesDoPlantao(p)===selMes).reduce((s,p)=>s+(+p.valorTotal||0),0);
  const _hoje=new Date(); const _mesAtual=selMes===_hoje.toISOString().slice(0,7);
  const _ultDia=new Date(+selMes.slice(0,4),+selMes.slice(5,7),0).getDate();
  const diasRestantes=_mesAtual?_ultDia-_hoje.getDate()+1:0;
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
    entradas:movs.filter(m=>m.tipo==="entrada"&&monthKey(m.data)===ym).reduce((s,m)=>s+m.valor,0)+plantoes.filter(p=>p.status!=="recebido"&&p.status!=="cancelado"&&monthKey(p.previsao)===ym).reduce((s,p)=>s+p.valorTotal,0),
    saidas:movs.filter(m=>m.tipo==="saida"&&monthKey(m.data)===ym).reduce((s,m)=>s+m.valor,0)+dividas.filter(d=>d.tipo==="cartao_desconto").reduce((s,d)=>s+(d.parcelasStatus||[]).filter(p=>!p.pago&&monthKey(p.dataVencimento)===ym).length*(+d.valorComDesconto||0),0),
    rendimentos:invests.reduce((s,i)=>s+(i.aporte*taxaEfetiva(i)/100/12),0),
  })).map(f=>({...f,saldo:f.entradas-f.saidas+f.rendimentos})),[movs,plantoes,invests,dividas]);
  const maxFc=Math.max(...forecast.map(f=>Math.max(f.entradas,f.saidas,1)));

  const statusDiv=d=>{if(!d.prazo)return{label:"Em aberto",color:"rgba(26,18,9,0.5)",bg:"rgba(0,0,0,0.06)"};if(isPast(d.prazo)&&d.pago<d.total)return{label:"Atrasada",color:C.red,bg:C.redGlass};if(daysUntil(d.prazo)<=30)return{label:"Vence em breve",color:C.gold,bg:C.goldGlass};return{label:"Em dia",color:C.green,bg:C.greenGlass};};

  const TABS=[
    {id:"dashboard",icon:"◈",label:"Início"},
    {id:"agenda",icon:"▦",label:"Agenda"},
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
    {id:"estudos",icon:"✦",label:"Estudos"},
    {id:"idiomas",icon:"✎",label:"Idiomas"},
    {id:"clinica",icon:"✚",label:"Clínica"},
  ];
  const navTo=id=>{setTab(id);setSideOpen(false);};
  const [trocando,setTrocando]=useState(null);
  const trocarApp=dest=>{
    const atualApp=tab==="estudos"?"est":tab==="idiomas"?"idi":tab==="clinica"?"med":"fin";
    if(dest===atualApp||trocando)return;
    setTrocando(dest);
    setTimeout(()=>{navTo(dest==="est"?"estudos":dest==="idi"?"idiomas":dest==="med"?"clinica":"dashboard");try{window.scrollTo(0,0);}catch{}},300);
    setTimeout(()=>setTrocando(null),900);
  };
  const showCard=id=>dashCards[id]!==false;
  const visibleDashIds=DASH_CARDS.filter(dc=>showCard(dc.id)&&!(dc.id==="cartoes"&&cartoes.length===0)).map(dc=>dc.id);
  const dashLayoutsResolved={};
  Object.entries(DASH_COLS).forEach(([bp,cols])=>{
    const stored=dashLayouts[bp]||[];
    const base=genDashLayout(cols,visibleDashIds);
    const oldBase=genDashLayout(cols,visibleDashIds,DASH_H_OLD);
    const nuncaMexeu=stored.length===0||oldBase.every(o=>{const st=stored.find(it=>it.i===o.i);return !st||(st.x===o.x&&st.y===o.y&&st.h===o.h);});
    dashLayoutsResolved[bp]=nuncaMexeu?base:base.map(item=>stored.find(it=>it.i===item.i)||item);
  });

  const CARD="card"; // className shorthand
  const TXT="#1A1209";
  const TSUB="rgba(26,18,9,0.65)";
  const TMUT="rgba(26,18,9,0.45)";

  return (
    <div className={"vl"+(isMobile?" mobile":"")+(tab==="estudos"||tab==="idiomas"||tab==="clinica"?" est-on":"")+(tab==="idiomas"?" idi-on":"")+(tab==="clinica"?" clin-on":"")} style={{...((p)=>({"--m1":p.m1,"--m2":p.m2,"--m3":p.m3,"--m4":p.m4,"--base":p.base,"--h1":p.h1,"--h2":p.h2,"--h3":p.h3,"--hb":p.hb,"--acc":p.acc}))(BG_PALETTES[bgId]||BG_PALETTES.tartan),minHeight:"100vh",color:TXT,fontFamily:"'DM Sans','Segoe UI',sans-serif",position:"relative"}}>
      <div className="wallpaper-bg" style={bgToStyle(BG_OPTIONS.find(b=>b.id===bgId)||BG_OPTIONS[0])}/>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@300;400;500&family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        input,select,textarea,button{font-family:'DM Sans','Segoe UI',sans-serif}
        .num{font-family:'DM Sans',sans-serif;font-variant-numeric:lining-nums tabular-nums;letter-spacing:-.015em}
        .mono{font-family:'DM Mono',ui-monospace,monospace}
        ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.2);border-radius:2px}
        body,#root{background:#C4A96A;min-height:100vh;font-variant-numeric:lining-nums}
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
        .card{background:rgba(250,248,244,0.96);border:1px solid rgba(255,255,255,0.7);border-radius:20px;padding:18px;box-shadow:0 8px 28px rgba(40,24,8,0.14);color:#1A1209}.card *{color:inherit}.card span,.card div,.card p{color:#1A1209}
        .card *{color:inherit}
        select option{background:#3d1a10;color:#fff}
        .plt-numinput::-webkit-outer-spin-button,.plt-numinput::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
        .plt-numinput{-moz-appearance:textfield}
        .plt-select{appearance:none;-webkit-appearance:none;-moz-appearance:none;background-image:none!important}
        .filter-select{appearance:none;-webkit-appearance:none;-moz-appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%231A1209' stroke-width='1.6' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")!important;background-repeat:no-repeat!important;background-position:right 10px center!important;padding-right:26px!important}
        .plt-select option{background:#fff;color:#1A1209}
        .fade{animation:fd .2s ease} @keyframes fd{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}
        .scr::-webkit-scrollbar{display:none}
        html{-webkit-text-size-adjust:100%;text-size-adjust:100%}
        @media (max-width:640px){html,body{overflow-x:hidden;max-width:100vw}}
        .mlab{display:none}
        /* ===== MODO CELULAR ===== */
        .vl .wallpaper-bg{display:none}
        .vl,body:has(.vl){background:#7A0E3A}
        .vl .topbar{display:none!important}
        .app-swap{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;animation:swp .9s cubic-bezier(.4,0,.2,1) both;pointer-events:all}
        .app-swap-card{position:relative;background:#FBF4E2;color:#2A1E14;border-radius:28px;padding:26px 40px;text-align:center;box-shadow:0 30px 70px -24px rgba(0,0,0,.6);animation:swc .9s cubic-bezier(.4,0,.2,1) both}
        @keyframes swp{0%{opacity:0}33%{opacity:1}67%{opacity:1}100%{opacity:0}}
        @keyframes swc{0%{transform:translateY(16px) scale(.94)}35%{transform:none}70%{transform:none}100%{transform:translateY(-10px) scale(.98)}}
        .vl.est-on .m-hero,.vl.est-on .sheet,.vl.est-on .wallpaper-bg{display:none!important}
        .vl.est-on,body:has(.vl.est-on){background:#15251E}
        .vl.idi-on,body:has(.vl.idi-on){background:#2A1E14}
        .vl.clin-on,body:has(.vl.clin-on){background:#0B2229}
        .vl .sheet{background:var(--base);border-radius:30px 30px 0 0;margin-top:-26px;position:relative;z-index:1;min-height:70vh}
        .mobile .sheet{margin-top:-24px}
        .mobile .main-wrap{padding:24px 14px 96px!important}
        .vl .main-wrap{padding-top:28px!important}
        .vl .card{background:#FFFCF4!important;border:1px solid rgba(35,21,25,.10)!important;box-shadow:none!important;border-radius:24px!important}
        .vl .bento{display:grid;grid-template-columns:1.3fr 1fr 1fr;grid-template-rows:minmax(190px,auto) minmax(190px,auto);gap:14px}
        .vl .bento-hero{grid-row:1/3;border-radius:32px;padding:0;color:#fff;display:flex;flex-direction:column;min-height:300px;position:relative;overflow:hidden;background:#8F2427;box-shadow:none}
        .vl .bento-hero *{color:inherit}
        .vl .goal-pill{display:inline-flex;align-items:center;gap:8px;background:#FBF4E2;color:#2A1E14;border-radius:999px;padding:5px 14px 5px 5px;max-width:calc(100% - 96px)}
        .vl .goal-pill .ring{width:28px;height:28px;border-color:rgba(42,30,20,.3)}
        .vl .goal-panel{margin-top:auto;background:#FBF4E2;color:#2A1E14;border-radius:22px;padding:16px 18px 14px;box-shadow:0 10px 26px -14px rgba(42,30,20,.5)}
        .vl .tile-panel{background:#FBF4E2;color:#2A1E14;border-radius:18px;padding:11px 13px;margin-top:auto;position:relative;z-index:1}
        .vl .tile-ic{background:#FBF4E2;border:none!important;color:#2A1E14;position:relative;z-index:1;width:32px;height:32px}
        .vl .tile-ic *{color:#2A1E14!important}
        .vl .goal-track{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;height:100%;scrollbar-width:none;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain}
        .vl .goal-track::-webkit-scrollbar{display:none}
        .vl .goal-slide{flex:0 0 100%;scroll-snap-align:start;padding:14px;display:flex;flex-direction:column;min-height:300px;min-width:0}
        .vl .goal-dots{display:flex;justify-content:center;gap:5px;margin-top:12px}
        .vl .goal-dots i{height:6px;border-radius:99px;display:inline-block;transition:all .2s}
        .vl .bento-tile{border-radius:26px;padding:10px;display:flex;flex-direction:column;min-height:190px;position:relative;overflow:hidden;box-shadow:none}
        .vl .bento-tile *{color:inherit}
        
        .vl .bento-hero>.goal-track{position:relative;z-index:1}
        
        .vl .ring{width:34px;height:34px;border-radius:50%;border:1px solid rgba(35,21,25,.22);display:inline-flex;align-items:center;justify-content:center;flex-shrink:0}
        .vl .arrow-btn{width:38px;height:38px;min-height:38px!important;border-radius:50%;border:none;background:#fff;color:#1D1A1C!important;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;box-shadow:0 6px 16px -8px rgba(0,0,0,.4)}
        .vl .arrow-btn *{color:#1D1A1C!important}
        .vl .arrow-btn.star-off *{color:#fff!important}
        .vl .arrow-btn-sm{width:34px;height:34px;min-height:34px!important;background:#1D1A1C;box-shadow:none}
        .vl .arrow-btn-sm *{color:#fff!important}
        .mobile .bento{grid-template-columns:1fr 1fr;grid-template-rows:auto}
        .mobile .bento-hero{grid-column:1/3;grid-row:auto;min-height:220px}
        .mobile .bento-tile{min-height:172px;padding:8px}
        .mobile .tile-panel{padding:9px 10px;border-radius:15px}
        .mobile .bento-hero{min-height:300px}
                .vl .lr.card.lr-idle{background:transparent!important;border:none!important;box-shadow:none!important;padding:0!important}
        .vl .lr-in{background:#FBF9F5!important;border:1px solid rgba(35,21,25,.16)!important;border-radius:999px!important;padding:14px 22px!important;font-size:15px!important}
        .vl .dash-item .sl::before{content:"";display:inline-block;width:16px;height:2px;background:var(--acc,#B8944F);margin-right:10px;vertical-align:middle;position:relative;top:-2px}
        .vl .num{font-family:'Fraunces',Georgia,serif!important;font-weight:400!important;letter-spacing:-.02em}
        .vl .dash-item>*{height:auto!important;overflow:visible!important}
        .vl .dash-item>.card{padding:20px!important}
        .vl .dash-item .sl,.vl .dash-item .dash-h{font-family:'Fraunces',Georgia,serif!important;font-size:19px!important;font-weight:400!important;letter-spacing:-.015em!important;text-transform:none!important;color:#1A1209!important;line-height:1.15!important}
        .vl .dash-item .sl{margin-bottom:12px!important}
        .vl .dash-item .card .sl+div{}
        .vl .m-hero{background:#5E0A2E;color:#fff;padding:max(14px,env(safe-area-inset-top)) 18px 50px;position:relative;overflow:hidden}
        .vl .m-hero-in{max-width:1100px;margin:0 auto;position:relative;z-index:2;display:block}
        .vl .m-hero>.m-hero-bg,.vl .m-hero>.m-hero-scrim{position:absolute;inset:0;z-index:0;pointer-events:none}
        .vl .m-hero>.m-hero-scrim{z-index:1;background:linear-gradient(180deg,rgba(110,10,48,.5) 0%,rgba(50,6,24,.68) 55%,rgba(30,4,16,.82) 100%)}
        .vl .m-hero *{color:inherit}
        .vl .m-hero .scr{scrollbar-width:none}
        .vl .m-saldo{font-family:'Fraunces',Georgia,serif!important;font-weight:300!important;font-size:46px;letter-spacing:-.035em;line-height:1.02;color:#fff}
        .vl .m-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));margin-top:20px}
        .vl .m-stats>div{padding:0 10px;border-left:1px solid rgba(255,255,255,.28)}
        .vl .m-stats>div:first-child{padding-left:0;border-left:none}
        .vl .m-stats .v{font-family:'Fraunces',Georgia,serif;font-size:17px;font-weight:400;letter-spacing:-.02em;white-space:nowrap}
        .vl .m-stats .l{font-family:'DM Mono',ui-monospace,monospace;font-size:9px;letter-spacing:.1em;text-transform:uppercase;opacity:.7;margin-bottom:3px}
        @media (min-width:900px){
          .vl .m-hero{padding:22px 32px 72px}
          .vl .m-hero-in{display:grid;grid-template-columns:minmax(0,1fr) auto;grid-template-areas:"top top" "left stats" "chips chips";column-gap:40px;align-items:end}
          .vl .m-hero-top{grid-area:top;margin-bottom:34px!important}
          .vl .m-hero-l{grid-area:left}
          .vl .m-hero-chips{grid-area:chips;margin-right:0!important;padding-right:0!important;margin-top:30px!important}
          .vl .m-stats{grid-area:stats;margin-top:0;grid-template-columns:repeat(3,auto)}
          .vl .m-stats>div{padding:0 26px}
          .vl .m-stats .v{font-size:24px}
          .vl .m-saldo{font-size:76px}
          .vl .main-wrap{padding-left:32px!important;padding-right:32px!important}
        }
        .vl .sidebar{width:100%!important;background:linear-gradient(170deg,#E8205F 0%,#A8134B 55%,#5E0A2E 100%)!important;border:none!important;overflow-y:auto;display:flex;flex-direction:column}
        .vl .sidebar .navitem{font-family:'Fraunces',Georgia,serif;font-size:32px;font-weight:300;letter-spacing:-.02em;color:rgba(255,255,255,.55);background:none!important;border:none!important;box-shadow:none!important;padding:5px 24px;margin:0;border-radius:0}
        .vl .sidebar .navitem:hover{color:#fff}
        .vl .sidebar .navitem.active{color:#fff;font-weight:400}
        .vl .sidebar .navitem.active>span:last-of-type{text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:6px}
        .vl .sidebar .nav-icon{display:none}
        .vl .sidebar .nav-count{font-family:'DM Mono',ui-monospace,monospace;font-size:11px;color:#FFD36A;margin-left:4px;vertical-align:super}
        .vl .sidebar .nav-list{max-height:none!important;overflow:visible!important;padding:6px 0 14px!important}
        .vl .overlay-side{display:none!important}
        .sidebar .m-close{display:none}
        .vl .sidebar .m-close{display:flex}
        .vl:not(.mobile) .sidebar{width:340px!important;box-shadow:6px 0 40px rgba(0,0,0,.3)}
        .vl:not(.mobile) .sidebar .navitem{font-size:27px;padding:4px 28px}
        .vl:not(.mobile) .overlay-side.open{display:block!important}
        .mobile input,.mobile select,.mobile textarea{font-size:16px!important}
        .mobile .main-wrap button{min-height:34px}
        .mobile .topbar{position:relative!important;top:auto!important}
        .mobile .row-head{display:none!important}
        .mobile .card{border-radius:18px}
        .mobile .row-mov{grid-template-columns:minmax(0,1fr) minmax(0,1fr) 40px!important;gap:6px 8px!important;padding:12px 8px!important;border-radius:12px!important}
        .mobile .row-mov>*:nth-child(1){grid-column:1/3;grid-row:1}
        .mobile .row-mov>*:nth-child(5){grid-column:3;grid-row:1;justify-self:end;align-self:start}
        .mobile .row-mov>*:nth-child(2){grid-column:1/4;grid-row:2}
        .mobile .row-mov>*:nth-child(3){grid-column:1;grid-row:3}
        .mobile .row-mov>*:nth-child(4){grid-column:2/4;grid-row:3}
        .mobile .row-mov>button{width:38px!important;height:38px!important}
        .mobile .row-plt{grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;gap:2px 10px!important;padding:14px 10px!important;border-radius:12px!important}
        .mobile .row-plt>.mlab{display:block;font-family:'DM Mono',ui-monospace,monospace;font-size:9px;letter-spacing:.08em;text-transform:uppercase;opacity:.6;margin-top:8px}
        .mobile .row-plt>*:nth-child(1){grid-column:1/3;grid-row:1}
        .mobile .row-plt>[data-for="dia"]{grid-column:1;grid-row:2}
        .mobile .row-plt>[data-for="valor"]{grid-column:2;grid-row:2}
        .mobile .row-plt>[data-for="prev"]{grid-column:1;grid-row:4}
        .mobile .row-plt>[data-for="status"]{grid-column:2;grid-row:4}
        .mobile .row-plt>*:nth-child(2){grid-column:1;grid-row:3}
        .mobile .row-plt>*:nth-child(3){grid-column:2;grid-row:3}
        .mobile .row-plt>*:nth-child(4){grid-column:1;grid-row:5}
        .mobile .row-plt>*:nth-child(5){grid-column:2;grid-row:5;min-height:40px;display:flex;align-items:center;justify-content:center;gap:5px;flex-wrap:wrap}
        .mobile .row-plt>*:nth-child(6){grid-column:1;grid-row:6}
        .mobile .row-plt>*:nth-child(7){grid-column:2;grid-row:6}
        .mobile .row-plt>button{width:100%!important;height:38px!important;margin-top:6px}
        .mobile .row-orc{grid-template-columns:minmax(0,1fr) 62px 62px 40px!important;gap:6px!important}
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
        .card .chartTooltip, .card .chartTooltip div, .card .chartTooltip span { color: #fff !important; }
        /* Exception: colored value numbers keep their accent color via inline style - override below */
        .card svg text { fill: #1A1209 !important; }
      `}</style>

      {/* SIDEBAR */}
      <div className={`overlay-side ${sideOpen?"open":""}`} onClick={()=>setSideOpen(false)}/>
      <div className={`sidebar ${sideOpen?"open":""}`}>
        <div style={{padding:"max(22px,calc(env(safe-area-inset-top) + 8px)) 16px 14px",borderBottom:"1px solid rgba(255,255,255,0.12)",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <div style={{fontSize:10,fontWeight:500,letterSpacing:".2em",textTransform:"uppercase",color:"rgba(255,255,255,0.4)",fontFamily:"'DM Mono',ui-monospace,monospace",marginBottom:4}}>Velara Finance</div>
            <div style={{fontSize:20,fontWeight:300,letterSpacing:"-.02em",color:"#fff"}}>Menu</div>
          </div>
          <button className="m-close" onClick={()=>setSideOpen(false)} aria-label="Fechar menu" style={{width:40,height:40,borderRadius:99,background:"rgba(255,255,255,0.16)",border:"1px solid rgba(255,255,255,0.3)",color:"#fff",fontSize:22,lineHeight:1,alignItems:"center",justifyContent:"center",cursor:"pointer"}}>×</button>
        </div>
        <div className="nav-list" style={{padding:"8px 0",overflowY:"auto",maxHeight:"calc(100vh - 160px)"}}>
          {TABS.map(t=>{
            const cnt={movimentos:movsDoMes.length,plantoes:plantoes.length,investimentos:invests.length,objetivos:objetivos.length,dividas:dividas.length,cartoes:cartoes.length}[t.id];
            return (
            <div key={t.id} className={`navitem ${tab===t.id?"active":""}`} onClick={()=>navTo(t.id)}>
              <span className="nav-icon">{t.icon}</span>
              <span>{t.label}</span>
              {cnt>0&&<sup className="nav-count">{cnt}</sup>}
            </div>
          );})}
        </div>
        <div style={{padding:"12px 16px",borderTop:"1px solid rgba(255,255,255,0.1)"}}>
          <div style={{fontSize:10,fontWeight:500,letterSpacing:".07em",textTransform:"uppercase",color:"rgba(255,255,255,0.4)",fontFamily:"'DM Mono',ui-monospace,monospace",marginBottom:7}}>Tela</div>
          <div style={{display:"flex",gap:5,marginBottom:14}}>
            {[["auto","Auto"],["celular","Celular"],["pc","Computador"]].map(([id,lb])=>(
              <button key={id} onClick={()=>setModoTela(id)} style={{flex:1,background:modoTela===id?"rgba(232,32,95,0.5)":"rgba(255,255,255,0.08)",border:`1px solid ${modoTela===id?"#B91D55":"rgba(255,255,255,0.15)"}`,borderRadius:8,padding:"7px 2px",fontSize:10.5,fontWeight:600,color:"#fff",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>{lb}</button>
            ))}
          </div>
          <div style={{fontSize:10,fontWeight:500,letterSpacing:".07em",textTransform:"uppercase",color:"rgba(255,255,255,0.4)",fontFamily:"'DM Mono',ui-monospace,monospace",marginBottom:7}}>Fundo</div>
          <div style={{display:"flex",gap:6,marginBottom:12}}>
            {BG_OPTIONS.map(bg=>(
              <button key={bg.id} onClick={()=>setBgId(bg.id)}
                style={{flex:1,background:bgId===bg.id?"rgba(232,32,95,0.5)":"rgba(255,255,255,0.08)",border:`2px solid ${bgId===bg.id?"#B91D55":"rgba(255,255,255,0.15)"}`,borderRadius:10,padding:0,cursor:"pointer",overflow:"hidden",display:"flex",flexDirection:"column",alignItems:"center"}}>
                <div style={{width:"100%",height:36,...bgToStyle(bg)}}/>
                <div style={{fontSize:8,fontWeight:600,color:"#fff",padding:"3px 0"}}>{bg.label}</div>
              </button>
            ))}
          </div>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.55)",fontFamily:"'DM Sans',sans-serif",marginBottom:8,display:"flex",alignItems:"center",gap:5}}><Glyph e="👤" size={12}/>{user.name||user.email}</div>
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


      {(
        <div className="m-hero">
          <div className="m-hero-bg" style={bgToStyle(BG_OPTIONS.find(b=>b.id===bgId)||BG_OPTIONS[0])}/>
          <div className="m-hero-scrim"/>
          <div className="m-hero-in">
          <div className="m-hero-top" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
            <button onClick={()=>setSideOpen(true)} aria-label="Abrir menu" style={{background:"rgba(255,255,255,0.16)",border:"1px solid rgba(255,255,255,0.3)",borderRadius:99,width:40,height:40,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4.5,minHeight:40,flexShrink:0}}>
              <div style={{width:16,height:1.5,background:"#fff",borderRadius:1}}/>
              <div style={{width:16,height:1.5,background:"#fff",borderRadius:1}}/>
              <div style={{width:10,height:1.5,background:"#fff",borderRadius:1,alignSelf:"flex-start",marginLeft:12}}/>
            </button>
            <AppSwitch atual="fin" onTrocar={trocarApp}/>
            <button onClick={()=>setEditSaldoMes(String(saldoMensal[selMes]!==undefined?saldoMensal[selMes]:+saldoFimDoMes(shiftMonth(selMes,-1)).toFixed(2)))} style={{background:"rgba(255,255,255,0.16)",border:"1px solid rgba(255,255,255,0.3)",borderRadius:99,padding:"0 12px",height:40,minHeight:40,fontSize:11,color:"#fff",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:500}}>{typeof window!=="undefined"&&window.innerWidth<400?<Settings size={14} strokeWidth={2}/>:"ajustar"}</button>
          </div>
          <div className="m-hero-l">
          <div className="mono" style={{fontSize:10,letterSpacing:".18em",textTransform:"uppercase",opacity:.75,marginBottom:6}}>Saldo · {monthLabel(selMes)}</div>
          <div className="m-saldo">{R(saldoFinal)}</div>
          {parcelasDividaMes>0&&(
            <div style={{display:"inline-flex",alignItems:"center",gap:6,marginTop:12,background:"rgba(255,255,255,0.16)",border:"1px solid rgba(255,255,255,0.28)",borderRadius:99,padding:"5px 12px",fontSize:11}}>
              <CreditCard size={12} strokeWidth={2.2}/>
              <span>parcelas {R(parcelasDividaMes)} · previsto <strong>{R(saldoFinal-parcelasDividaMes)}</strong></span>
            </div>
          )}
          </div>
          <div className="scr m-hero-chips" style={{display:"flex",gap:6,overflowX:"auto",marginTop:18,marginRight:-18,paddingRight:18}}>
            {Array.from({length:20},(_,i)=>{const d=new Date();d.setMonth(d.getMonth()-12+i);const ym=d.toISOString().slice(0,7);const isSel=ym===selMes;
              return <button key={ym} ref={isSel?(el=>{if(el&&el.parentNode&&!el.parentNode.dataset.done){el.parentNode.dataset.done="1";el.parentNode.scrollLeft=Math.max(0,el.offsetLeft-90);}}):undefined} onClick={()=>setSelMes(ym)} style={{flexShrink:0,background:isSel?"#fff":"rgba(255,255,255,0.14)",color:isSel?"#C4185A":"#fff",border:isSel?"1px solid #fff":"1px solid rgba(255,255,255,0.28)",borderRadius:99,padding:"0 14px",height:32,minHeight:32,fontSize:12,fontWeight:isSel?700:500,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>{monthLabel(ym)}</button>;
            })}
          </div>
          <div className="m-stats">
            <div><div className="l">Entradas</div><div className="v">{R(entradas)}</div></div>
            <div title={parcelasDividaMes>0?`Inclui ${R(parcelasDividaMes)} em parcelas de dívida a pagar neste mês`:undefined}><div className="l">Saídas</div><div className="v">{R(saidasTotal)}</div>{parcelasDividaMes>0&&<div style={{fontSize:9.5,opacity:.7,marginTop:2,whiteSpace:"nowrap"}}>{isMobile?"inclui parcelas":`inclui ${R(parcelasDividaMes)} em parcelas`}</div>}</div>
            <div><div className="l">A receber</div><div className="v">{R(aReceberMes)}</div></div>
          </div>
          </div>
        </div>
      )}

      {/* TOP BAR */}
      <div className="topbar" style={{background:"rgba(255,255,255,0.78)",backdropFilter:"blur(24px) saturate(180%)",WebkitBackdropFilter:"blur(24px) saturate(180%)",borderBottom:"1px solid rgba(0,0,0,0.08)",padding:"14px 16px 12px",position:"sticky",top:0,zIndex:50,boxShadow:"0 2px 20px rgba(0,0,0,0.1)"}}>
        <div style={{maxWidth:1100,margin:"0 auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <button onClick={()=>setSideOpen(true)} style={{background:"rgba(0,0,0,0.07)",border:"1px solid rgba(0,0,0,0.12)",borderRadius:10,width:38,height:38,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4.5,flexShrink:0,backdropFilter:"blur(8px)"}}>
                <div style={{width:16,height:1.5,background:"rgba(0,0,0,0.75)",borderRadius:1}}/>
                <div style={{width:16,height:1.5,background:"rgba(0,0,0,0.75)",borderRadius:1}}/>
                <div style={{width:11,height:1.5,background:"rgba(0,0,0,0.75)",borderRadius:1}}/>
              </button>
              <div>
                <div style={{fontSize:10,fontWeight:500,letterSpacing:".15em",textTransform:"uppercase",color:"rgba(0,0,0,0.5)",fontFamily:"'DM Mono',ui-monospace,monospace",marginBottom:1}}>{TABS.find(t=>t.id===tab)?.label||"Velara Finance"}<span style={{display:"inline-flex",gap:3,marginLeft:7,verticalAlign:"1px"}}>{[C.magenta,C.green,C.gold].map(c=><i key={c} style={{width:5,height:5,borderRadius:99,background:c,display:"inline-block"}}/>)}</span></div>
                <div className="num" style={{fontSize:30,fontWeight:300,letterSpacing:"-.04em",lineHeight:1.05,color:"#1A1209"}}>{R(saldoFinal)}</div>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <div style={{fontSize:10,color:"rgba(0,0,0,0.5)",fontFamily:"'DM Sans',sans-serif"}}>saldo · {monthLabel(selMes)}</div>
                  <button onClick={()=>setEditSaldoMes(String(saldoMensal[selMes]!==undefined?saldoMensal[selMes]:+saldoFimDoMes(shiftMonth(selMes,-1)).toFixed(2)))} style={{background:"rgba(0,0,0,0.07)",border:"none",borderRadius:6,padding:"1px 6px",fontSize:9,color:"rgba(0,0,0,0.5)",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}><Settings size={9} strokeWidth={2.2} style={{marginRight:3,verticalAlign:"-1px"}}/>ajustar</button>
                </div>
              </div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:12,color:"#2D6E20",fontFamily:"'DM Sans',sans-serif",fontWeight:700}}>▲ {R(entradas)}</div>
              <div style={{fontSize:12,color:"#B22222",fontFamily:"'DM Sans',sans-serif",fontWeight:700}}>▼ {R(saidasTotal)}</div>
              {totalPendPlant>0&&<div style={{fontSize:10,color:"#8B6914",fontFamily:"'DM Sans',sans-serif",marginTop:1,fontWeight:600,display:"flex",alignItems:"center",gap:3}}><Hourglass size={10} strokeWidth={2.2}/>{R(totalPendPlant)}</div>}
              {totalPatrimonio>0&&<div style={{fontSize:10,color:"#5B7C94",fontFamily:"'DM Sans',sans-serif",marginTop:1,fontWeight:600}}><TrendingUp size={10} strokeWidth={2.2} style={{marginRight:3,verticalAlign:"-2px"}}/>{R(totalPatrimonio)} patrimônio</div>}
            </div>
          </div>
          {parcelasDividaMes>0&&(
            <div title="Parcelas de dívida que vencem neste mês e ainda não foram pagas" style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",background:"rgba(139,26,26,0.07)",border:"1px solid rgba(139,26,26,0.16)",borderRadius:10,padding:"6px 10px",marginBottom:8}}>
              <CreditCard size={12} strokeWidth={2.2} style={{color:"#8B1A1A"}}/>
              <span className="mono" style={{fontSize:9.5,fontWeight:500,color:"#8B1A1A",letterSpacing:".05em",textTransform:"uppercase"}}>Parcelas do mês a pagar</span>
              <span className="num" style={{fontSize:12,fontWeight:700,color:"#8B1A1A"}}>{R(parcelasDividaMes)}</span>
              <span style={{fontSize:11,color:"rgba(26,18,9,0.6)",fontFamily:"'DM Sans',sans-serif",marginLeft:"auto"}}>saldo previsto <strong className="num" style={{color:saldoFinal-parcelasDividaMes<0?"#8B1A1A":"#1A1209"}}>{R(saldoFinal-parcelasDividaMes)}</strong></span>
            </div>
          )}
          <div className="scr" style={{display:"flex",gap:5,overflowX:"auto",paddingBottom:2}}>
            {Array.from({length:20},(_,i)=>{const d=new Date();d.setMonth(d.getMonth()-12+i);const ym=d.toISOString().slice(0,7);const isSel=ym===selMes;
              return <button key={ym} onClick={()=>setSelMes(ym)} style={{flexShrink:0,background:isSel?"#B91D55":"rgba(0,0,0,0.08)",color:isSel?"#fff":"rgba(26,18,9,0.7)",border:isSel?"1px solid #B91D55":"1px solid rgba(0,0,0,0.12)",borderRadius:99,padding:"4px 12px",fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all .15s",boxShadow:isSel?"0 2px 8px rgba(232,32,95,0.3)":"none"}}>{monthLabel(ym)}</button>;
            })}
          </div>
        </div>
      </div>

      {trocando&&(()=>{const est=trocando==="est",idi=trocando==="idi",med=trocando==="med";const sty=est?"noite":idi?"manteiga":med?"petroleo":palBg.hero.s;return (
        <div className="app-swap" style={{background:STY[sty].paper}}>
          <Motif s={sty} z={1.1} x={est?40:30} y={est?10:20} style={{position:"absolute",inset:0}}/>
          <div className="app-swap-card"><div className="mono" style={{fontSize:10,letterSpacing:".24em",textTransform:"uppercase",opacity:.6,marginBottom:8}}>Velara</div><div style={{fontFamily:"'Fraunces',Georgia,serif",fontWeight:300,fontSize:46,letterSpacing:"-.03em",lineHeight:1}}>{est?"Estudos":idi?"Idiomas":med?"Clínica":"Finanças"}</div></div>
        </div>);})()}
      {tab==="idiomas"&&<IdiomasApp userId={userId} isMobile={isMobile} onMenu={()=>setSideOpen(true)} onTrocar={trocarApp}/>}
      {tab==="clinica"&&<ClinicaApp userId={userId} isMobile={isMobile} onMenu={()=>setSideOpen(true)} onTrocar={trocarApp}/>}
      {tab==="estudos"&&<EstudosApp userId={userId} isMobile={isMobile} onMenu={()=>setSideOpen(true)} onTrocar={trocarApp}/>}
      <div className="sheet">
      <div className="main-wrap" style={{maxWidth:1100,margin:"0 auto",padding:"14px 24px 80px",position:"relative",zIndex:1}}>

        {/* ══ DASHBOARD ══ */}
        {tab==="dashboard"&&(
          <div className="fade">
            <LancamentoRapido movs={movs} cartoes={cartoes} cats={cats} onSalvar={salvarRapido} onEditar={editarRapido}/>
            <div style={{display:"flex",justifyContent:"flex-end",flexWrap:"wrap",gap:8,marginBottom:10}}>
              <button onClick={()=>setDashEditMode(!dashEditMode)} style={{background:dashEditMode?C.magenta:"rgba(251,249,245,0.6)",border:`1px solid ${dashEditMode?C.magenta:"rgba(0,0,0,0.12)"}`,borderRadius:12,padding:"8px 14px",fontSize:12,fontWeight:700,color:dashEditMode?"#fff":"#1A1209",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:6,boxShadow:"0 2px 8px rgba(0,0,0,0.08)"}}>
                {dashEditMode?<Check size={14} strokeWidth={2.5}/>:<LayoutGrid size={14} strokeWidth={2.2}/>}
                {dashEditMode?"Concluir":"Reorganizar"}
              </button>
              <button onClick={()=>setModal("dashCustom")} style={{background:"rgba(251,249,245,0.6)",border:"1px solid rgba(0,0,0,0.12)",borderRadius:12,padding:"8px 10px",fontSize:12,fontWeight:700,color:"#1A1209",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.08)"}} title="Escolher o que mostrar"><SlidersHorizontal size={14} strokeWidth={2.2}/></button>
              <button onClick={()=>setImportOpen(true)} style={{background:"rgba(251,249,245,0.6)",border:"1px solid rgba(0,0,0,0.12)",borderRadius:12,padding:"8px 14px",fontSize:12,fontWeight:700,color:"#1A1209",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:6,boxShadow:"0 2px 8px rgba(0,0,0,0.08)"}}><Glyph e="📥" size={14}/>Importar Extrato</button>
              <button onClick={()=>setSimularOpen(true)} style={{background:C.magentaDark,border:`1px solid ${C.magenta}`,borderRadius:12,padding:"8px 14px",fontSize:12,fontWeight:700,color:"#fff",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:6,boxShadow:`0 2px 10px ${C.magenta}44`}}><Lightbulb size={13} strokeWidth={2.2}/>Simular Compra</button>
            </div>

            {dashEditMode&&(
              <div style={{background:"rgba(232,32,95,0.08)",border:"1px solid rgba(232,32,95,0.25)",borderRadius:10,padding:"9px 13px",marginBottom:10,fontSize:12,color:"#8B1043",fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>
                Arraste pelo <GripVertical size={11} strokeWidth={2.2} style={{display:"inline-block",verticalAlign:"-2px",margin:"0 2px"}}/> pra mover, e puxe o canto inferior direito de cada card pra redimensionar.
              </div>
            )}

            {!dashEditMode&&(()=>{
              let cfgE={},matsE=[];
              try{cfgE=JSON.parse(localStorage.getItem(userId+"_v5_est_cfg")||"{}")||{};matsE=JSON.parse(localStorage.getItem(userId+"_v5_est_mat")||"[]")||[];}catch{}
              const hj=today();
              const dE=cfgE.prova?Math.ceil((new Date(cfgE.prova+"T12:00:00")-new Date(hj+"T12:00:00"))/86400000):null;
              const revE=matsE.flatMap(m=>(m.topicos||[]).flatMap(t=>t.revs||[])).filter(r=>!r.feita&&r.d<=hj).length;
              return (
                <button onClick={()=>trocarApp("est")} style={{position:"relative",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"space-between",gap:14,width:"100%",textAlign:"left",border:"none",cursor:"pointer",borderRadius:28,padding:isMobile?"20px 20px":"24px 30px",marginBottom:14,background:"#15251E",color:"#F4EBD9",fontFamily:"inherit"}}>
                  <Motif s="noite" z={1.1} x={60} y={20} style={{position:"absolute",inset:0,opacity:.95}}/>
                  <div style={{position:"absolute",inset:0,background:"linear-gradient(95deg,rgba(15,24,18,.96) 0%,rgba(15,24,18,.75) 50%,rgba(15,24,18,.2) 100%)"}}/>
                  <div style={{position:"relative",minWidth:0}}>
                    <div className="mono" style={{fontSize:10,letterSpacing:".22em",textTransform:"uppercase",opacity:.7,marginBottom:8}}>Plataforma · Estudos</div>
                    <div style={{fontFamily:"'Fraunces',Georgia,serif",fontWeight:300,fontSize:isMobile?26:32,letterSpacing:"-.03em",lineHeight:1.05}}>{cfgE.nome||"Residência médica"}</div>
                    <div style={{fontSize:12.5,opacity:.8,marginTop:8}}>{revE>0?`${revE} ${revE===1?"revisão":"revisões"} para hoje`:dE===null?"Defina a data da prova e comece":"Sem revisões pendentes hoje"}</div>
                  </div>
                  <div style={{position:"relative",display:"flex",alignItems:"center",gap:14,flexShrink:0}}>
                    {dE!==null&&dE>=0&&<div style={{textAlign:"right",lineHeight:1}}><div style={{fontFamily:"'Fraunces',Georgia,serif",fontWeight:300,fontSize:isMobile?44:60,letterSpacing:"-.04em"}}>{dE}</div><div className="mono" style={{fontSize:9.5,letterSpacing:".14em",textTransform:"uppercase",opacity:.7,marginTop:4}}>dias</div></div>}
                    <span style={{width:40,height:40,borderRadius:"50%",background:"#F4EBD9",color:"#15251E",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>↗</span>
                  </div>
                </button>);
            })()}
            {!dashEditMode&&(()=>{
              let lg=[],vc=[],lo=[],cr=null;
              try{lg=JSON.parse(localStorage.getItem(userId+"_v5_idi_cfg")||"null")||IDI_LANGS;vc=JSON.parse(localStorage.getItem(userId+"_v5_idi_voc")||"[]")||[];lo=JSON.parse(localStorage.getItem(userId+"_v5_idi_log")||"[]")||[];cr=JSON.parse(localStorage.getItem(userId+"_v5_idi_cron")||"null");}catch{lg=IDI_LANGS;}
              const hj=today();
              const dueI=vc.filter(v=>(v.vista||(v.ok||0)+(v.er||0))&&v.prox<=hj).length;
              return (
                <button onClick={()=>trocarApp("idi")} style={{position:"relative",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"space-between",gap:14,width:"100%",textAlign:"left",border:"none",cursor:"pointer",borderRadius:28,padding:isMobile?"20px 20px":"24px 30px",marginBottom:14,background:"#2A1E14",color:"#F6EBD3",fontFamily:"inherit"}}>
                  <Motif s="manteiga" z={1.2} x={60} y={20} style={{position:"absolute",inset:0,opacity:.95}}/>
                  <div style={{position:"absolute",inset:0,background:"linear-gradient(95deg,rgba(32,21,12,.96) 0%,rgba(32,21,12,.78) 50%,rgba(32,21,12,.25) 100%)"}}/>
                  <div style={{position:"relative",minWidth:0}}>
                    <div className="mono" style={{fontSize:10,letterSpacing:".22em",textTransform:"uppercase",opacity:.7,marginBottom:8}}>Plataforma · Idiomas</div>
                    <div style={{fontFamily:"'Fraunces',Georgia,serif",fontWeight:300,fontSize:isMobile?26:32,letterSpacing:"-.03em",lineHeight:1.05}}>{lg.map(l=>l.nome).join(" & ")}</div>
                    <div style={{fontSize:12.5,opacity:.8,marginTop:8}}>{cr?"● cronômetro em andamento":dueI>0?`${dueI} ${dueI===1?"palavra":"palavras"} para revisar hoje`:vc.length===0&&lo.length===0?"Registre estudos e palavras":"Sem revisões pendentes hoje"}</div>
                  </div>
                  <span style={{position:"relative",width:40,height:40,borderRadius:"50%",background:"#F6EBD3",color:"#2A1E14",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>↗</span>
                </button>);
            })()}

            {(()=>{
              const dc={};

              // ── Linha 1: Cards resumo ── 
              dc.resumo = showCard("resumo")&&(
              <div key="resumo" style={{height:"100%",overflow:"auto",position:"relative"}}>
                {dashEditMode&&<DashDragHandle/>}
                <div className="bento">
                  <div className="bento-hero" style={{background:STY[palBg.hero.s].paper,color:INK}}>
                    <Motif s={palBg.hero.s} style={{position:"absolute",inset:0,zIndex:0,pointerEvents:"none"}}/>
                    {(()=>{
                      const lista=[...objetivos].sort((x,y)=>(y.id===metaPrincipal)-(x.id===metaPrincipal));
                      if(lista.length===0) return (
                        <div className="goal-slide" style={{justifyContent:"space-between"}}>
                          <div className="goal-pill"><span className="ring"><Target size={14} strokeWidth={1.6}/></span><span style={{fontSize:12.5,lineHeight:1.15}}>Sua meta principal</span></div>
                          <div className="goal-panel">
                            <div style={{fontFamily:"'Fraunces',Georgia,serif",fontSize:28,fontWeight:300,lineHeight:1.1,marginBottom:14}}>Defina o que<br/>você está buscando</div>
                            <button className="arrow-btn" style={{width:"auto",padding:"0 18px",borderRadius:999,fontSize:13,fontWeight:600,gap:6}} onClick={()=>navTo("objetivos")}>Criar meta <ArrowUpRight size={15} strokeWidth={1.8}/></button>
                          </div>
                        </div>
                      );
                      return (
                        <div className="goal-track" onScroll={e=>{const el=e.currentTarget;const i=Math.round(el.scrollLeft/Math.max(el.clientWidth,1));if(i!==goalIdx)setGoalIdx(i);}}>
                          {lista.map((o,idx)=>{
                            const meta=+o.meta||0, atual=+o.atual||0;
                            const pct=meta>0?Math.min(100,Math.round(atual/meta*100)):0;
                            const falta=Math.max(0,meta-atual);
                            const ehPrinc=o.id===metaPrincipal||(!metaPrincipal&&idx===0);
                            const ativoNo=Math.min(4,Math.floor(pct/25));
                            const mesesPrazo=o.prazo?Math.max(0,Math.round((new Date(o.prazo+"T12:00:00")-new Date())/(86400000*30.44))):null;
                            return (
                              <div key={o.id} className="goal-slide">
                                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                                  <div className="goal-pill" style={{minWidth:0}}>
                                    <span className="ring"><Target size={14} strokeWidth={1.6}/></span>
                                    <span style={{fontSize:13,lineHeight:1.2,minWidth:0}}>
                                      <span className="mono" style={{fontSize:9.5,letterSpacing:".12em",textTransform:"uppercase",opacity:.75}}>{ehPrinc?"Meta principal":"Meta"}</span><br/>
                                      <b style={{fontWeight:600,display:"inline-block",maxWidth:"100%",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",verticalAlign:"bottom"}}>{o.nome}</b>
                                    </span>
                                  </div>
                                  <div style={{display:"flex",gap:8,flexShrink:0}}>
                                    <button className={"arrow-btn"+(ehPrinc?"":" star-off")} onClick={()=>setMetaPrincipal(o.id)} aria-label="Definir como meta principal" title="Definir como meta principal" style={{background:ehPrinc?PANEL:INK}}>
                                      <Sparkle size={15} strokeWidth={1.8} fill={ehPrinc?"#C48A1C":"none"} style={{color:ehPrinc?"#C48A1C":"#fff"}}/>
                                    </button>
                                    <button className="arrow-btn" onClick={()=>navTo("objetivos")} aria-label="Ver metas"><ArrowUpRight size={16} strokeWidth={1.8}/></button>
                                  </div>
                                </div>
                                <div className="goal-panel">
                                  <div style={{display:"flex",alignItems:"center",gap:6,margin:"0 0 14px 2px"}}>
                                    {[0,1,2,3,4].map(k=>{const on=k===ativoNo;return <React.Fragment key={k}><i style={{width:on?16:6,height:on?16:6,borderRadius:99,background:k<=ativoNo?STY[palBg.hero.s].acc:"rgba(42,30,20,.22)",display:"inline-block",boxShadow:on?"0 0 0 4px "+mixHex(STY[palBg.hero.s].acc,PANEL,.78):"none"}}/>{k<4&&<i style={{flex:1,height:1,background:"rgba(42,30,20,.25)",display:"inline-block"}}/>}</React.Fragment>;})}
                                  </div>
                                  <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",gap:10,flexWrap:"wrap"}}>
                                    <Money v={atual} size={isMobile?32:42} color={mixHex(mixHex(STY[palBg.hero.s].acc,PANEL,.74),STY[palBg.hero.s].acc,Math.max(0,Math.min(1,meta>0?atual/meta:0)))}/>
                                    <span className="mono" style={{fontSize:10,letterSpacing:".1em",textTransform:"uppercase",opacity:.9,paddingBottom:6,textAlign:"right"}}>{pct}% de {R(meta)}</span>
                                  </div>
                                  <div style={{fontSize:12,opacity:.85,marginTop:6}}>
                                    {falta>0?<>faltam <b style={{fontWeight:600}}>{R(falta)}</b></>:"meta atingida"}{mesesPrazo!==null&&falta>0?<> · {mesesPrazo===0?"vence este mês":`${mesesPrazo} ${mesesPrazo===1?"mês":"meses"} de prazo`}</>:null}
                                  </div>
                                  {lista.length>1&&<div className="goal-dots">{lista.map((q,i)=><i key={q.id} style={{width:i===idx?16:6,background:i===idx?STY[palBg.hero.s].acc:"rgba(42,30,20,.25)"}}/>)}</div>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                  {[
                    {ic:<TrendingUp size={15} strokeWidth={1.6}/>,l1:"Patrimônio",l2:invests.length+" investimentos",v:totalPatrimonio,sp:aporteSerie,c:"#6F9560"},
                    {ic:<Hourglass size={15} strokeWidth={1.6}/>,l1:"A receber",l2:"próx. 6 meses",v:totalPendPlant,sp:receberSerie,c:"#B8944F"},
                    {ic:<Wallet size={15} strokeWidth={1.6}/>,l1:"Gastos",l2:gastosVar===null?"no mês":(gastosVar>0?"+":"")+gastosVar+"% vs mês ant.",v:saidasTotal,sp:gastosSerie,c:"#B91D55"},
                    {ic:<CreditCard size={15} strokeWidth={1.6}/>,l1:"Dívidas",l2:dividaPct+"% quitado",v:totalDividas,sp:null,c:"#B5473F"},
                  ].map((t,ti)=>{
                    const tp=palBg.tiles[ti]; 
                    return (
                    <div key={t.l1} className="bento-tile" style={{background:STY[tp.s].paper}}>
                      <Motif s={tp.s} z={tp.z} x={tp.x} y={tp.y} style={{position:"absolute",inset:0,zIndex:0,pointerEvents:"none"}}/>
                      <span className="ring tile-ic">{t.ic}</span>
                      <div className="tile-panel">
                        <div style={{fontSize:12.5,lineHeight:1.2,marginBottom:8}}><b style={{fontWeight:600}}>{t.l1}</b> {!isMobile&&<span style={{opacity:.6,fontSize:11}}>· {t.l2}</span>}</div>
                        <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",gap:8}}>
                          <Money v={t.v} size={isMobile?19:24} color={INK}/>
                          {t.sp&&!isMobile&&<Spark data={t.sp} color={STY[tp.s].acc}/>}
                        </div>
                        {t.sp&&isMobile&&<div style={{marginTop:6}}><Spark data={t.sp} color={STY[tp.s].acc} w={110} h={24}/></div>}
                      </div>
                    </div>
                  );})}
                </div>
              </div>
              );

              // ── Semanas com espaço livre ── 
              dc.semanasLivres = showCard("semanasLivres")&&(
              <div key="semanasLivres" className={CARD} style={{padding:16,height:"100%",overflow:"auto",position:"relative"}}>
                {dashEditMode&&<DashDragHandle/>}
                {semanasLivres.some(s=>s.horas>0)?(
                <>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                  <div style={{width:26,height:26,borderRadius:8,background:"rgba(91,163,212,0.15)",display:"flex",alignItems:"center",justifyContent:"center",color:"#1A4A6E"}}><CalendarDays size={13} strokeWidth={2.2}/></div>
                  <span className="dash-h" style={{fontSize:12,fontWeight:500,color:"#1A1209",letterSpacing:".04em",textTransform:"uppercase",fontFamily:"'DM Mono',ui-monospace,monospace"}}>Suas próximas semanas</span>
                </div>
                {semanasLivres.map((sem,idx)=>(
                  <div key={idx} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 4px",borderBottom:idx<semanasLivres.length-1?"1px solid rgba(0,0,0,0.05)":"none"}}>
                    <div>
                      <div style={{fontSize:12.5,fontWeight:600,color:"#1A1209",fontFamily:"'DM Sans',sans-serif"}}>
                        {sem.ehAtual?"Essa semana":`${fd(sem.inicio)} – ${fd(sem.fim)}`}
                      </div>
                      <div style={{fontSize:10.5,color:sem.temEspaco?"#1A4A6E":"rgba(26,18,9,0.5)",fontFamily:"'DM Sans',sans-serif",marginTop:1,display:"flex",alignItems:"center",gap:4}}>
                        {sem.temEspaco?<><Lightbulb size={11} strokeWidth={2.2}/>Espaço livre — dá pra pegar mais plantão</>:`${sem.qtdPlantoes} ${sem.qtdPlantoes===1?"plantão":"plantões"} agendado${sem.qtdPlantoes===1?"":"s"}`}
                      </div>
                    </div>
                    <div className="num" style={{fontSize:14,fontWeight:700,color:sem.temEspaco?"#1A4A6E":"#1A1209"}}>{sem.horas}h</div>
                  </div>
                ))}
                <div style={{marginTop:10,paddingTop:10,borderTop:"1px solid rgba(0,0,0,0.06)",fontSize:10.5,color:"rgba(26,18,9,0.5)",fontFamily:"'DM Sans',sans-serif"}}>
                  Comparando com sua média de horas agendadas nas próximas 6 semanas. Só considera plantões com horas preenchidas.
                </div>
                </>
                ):(
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:6,color:"rgba(26,18,9,0.4)"}}>
                    <CalendarDays size={22} strokeWidth={1.6} style={{opacity:.4}}/>
                    <div style={{fontSize:11,fontFamily:"'DM Sans',sans-serif",textAlign:"center"}}>Nenhuma semana com espaço livre no momento</div>
                  </div>
                )}
              </div>
              );

              // ── Desafio do Pato 100% ── 
              dc.desafioPato = showCard("desafioPato")&&(
              <div key="desafioPato" className={CARD} style={{padding:16,height:"100%",overflow:"auto",position:"relative"}}>
                {dashEditMode&&<DashDragHandle/>}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:26,height:26,borderRadius:8,background:"rgba(255,196,32,0.2)",display:"flex",alignItems:"center",justifyContent:"center",color:"#8B6000"}}><Flower2 size={13} strokeWidth={2.2}/></div>
                    <div>
                      <div className="dash-h" style={{fontSize:12,fontWeight:500,color:"#1A1209",letterSpacing:".04em",textTransform:"uppercase",fontFamily:"'DM Mono',ui-monospace,monospace",lineHeight:1.2}}>Desafio do Pato 100%</div>
                      <div style={{fontSize:9.5,color:"rgba(26,18,9,0.5)",fontFamily:"'DM Sans',sans-serif",textTransform:"capitalize"}}>{monthLabel(selMes)} · reseta todo mês</div>
                    </div>
                  </div>
                  <span style={{fontSize:12,fontWeight:700,color:desafioPato.completos===desafioPato.total?"#215010":"#8B6000",fontFamily:"'DM Sans',sans-serif"}}>{desafioPato.completos} de {desafioPato.total}</span>
                </div>
                <Bar value={desafioPato.completos} max={desafioPato.total} color={desafioPato.completos===desafioPato.total?"#2D9A1A":"#FFC420"} h={7}/>
                <div style={{marginTop:12}}>
                  {desafioPato.itens.map((item,idx)=>(
                    <div key={idx} style={{display:"flex",alignItems:"center",gap:9,padding:"6px 0",borderBottom:idx<desafioPato.itens.length-1?"1px solid rgba(0,0,0,0.05)":"none"}}>
                      <div style={{width:20,height:20,borderRadius:6,background:item.feito?"rgba(45,90,16,0.15)":"rgba(0,0,0,0.06)",border:`1px solid ${item.feito?"rgba(45,90,16,0.35)":"rgba(0,0,0,0.12)"}`,display:"flex",alignItems:"center",justifyContent:"center",color:"#215010",flexShrink:0}}>{item.feito&&<Check size={12} strokeWidth={3}/>}</div>
                      <span style={{fontSize:12.5,color:item.feito?"#215010":"#5A4A3A",fontFamily:"'DM Sans',sans-serif",fontWeight:item.feito?600:500}}>{item.label}</span>
                    </div>
                  ))}
                </div>
                {desafioPato.completos===desafioPato.total&&(
                  <div style={{marginTop:10,background:"rgba(255,196,32,0.15)",border:"1px solid rgba(255,196,32,0.4)",borderRadius:10,padding:"9px 12px",fontSize:12,color:"#8B6000",fontFamily:"'DM Sans',sans-serif",fontWeight:600,textAlign:"center",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                    <PartyPopper size={13} strokeWidth={2.2}/>Desafio completo esse mês! Seu pato agradece.
                  </div>
                )}
              </div>
              );

              // ── Resumo de Cartões ── 
              dc.cartoes = showCard("cartoes")&&cartoes.length>0&&(
              <div key="cartoes" className={CARD} style={{padding:14,height:"100%",overflow:"auto",position:"relative"}}>
                {dashEditMode&&<DashDragHandle/>}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <SL style={{marginBottom:0}}>Cartões</SL>
                  <button className="arrow-btn arrow-btn-sm" onClick={()=>navTo("cartoes")} aria-label="Ver todos"><ArrowUpRight size={14} strokeWidth={1.8}/></button>
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
              );

              // Pizza gastos 
              dc.graficoGastos = showCard("graficoGastos")&&(
              <div key="graficoGastos" className={CARD} style={{padding:14,height:"100%",overflow:"auto",position:"relative"}}>
                {dashEditMode&&<DashDragHandle/>}
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
                      <CreditCard size={24} strokeWidth={1.6} style={{opacity:.4}}/>
                    </div>
                    <div style={{fontSize:10,color:"rgba(26,18,9,0.55)",textAlign:"center",fontFamily:"'DM Sans',sans-serif",lineHeight:1.4}}>Sem gastos<br/>em {monthLabel(selMes)}</div>
                    <button onClick={()=>openM("mov")} style={{background:"#B91D55",border:"1px solid #C0154A",borderRadius:99,color:"#fff",fontSize:9,fontWeight:700,padding:"4px 10px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>+ Lançar</button>
                  </div>
                )}
              </div>
              );

              // Pizza receita por empresa 
              dc.graficoEmpresas = showCard("graficoEmpresas")&&(
              <div key="graficoEmpresas" className={CARD} style={{padding:14,height:"100%",overflow:"auto",position:"relative"}}>
                {dashEditMode&&<DashDragHandle/>}
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
                      <Cross size={24} strokeWidth={1.6} style={{opacity:.4}}/>
                    </div>
                    <div style={{fontSize:10,color:"rgba(26,18,9,0.55)",textAlign:"center",fontFamily:"'DM Sans',sans-serif",lineHeight:1.4}}>Sem plantões<br/>cadastrados</div>
                    <button onClick={()=>navTo("plantoes")} style={{background:"#B91D55",border:"1px solid #C0154A",borderRadius:99,color:"#fff",fontSize:9,fontWeight:700,padding:"4px 10px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>+ Plantão</button>
                  </div>
                )}
              </div>
              );

              // Calendário 
              dc.calendario = showCard("calendario")&&(
              <div key="calendario" className={CARD} style={{padding:12,height:"100%",overflow:"auto",position:"relative"}}>
                {dashEditMode&&<DashDragHandle/>}
                <MultiCalendar plantoes={plantoes} movs={movs} onAddWithDate={(tipo,data)=>{if(tipo==="plantao"){openM("plt");setFPlt(f=>({...f,data}));}else{openM("mov");setFMov(f=>({...f,tipo,data}));}}}/>
              </div>
              );

              // Próximos recebimentos 
              dc.recebimentos = showCard("recebimentos")&&(
              <div key="recebimentos" className={CARD} style={{padding:14,height:"100%",overflow:"auto",position:"relative"}}>
                {dashEditMode&&<DashDragHandle/>}
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
                          <button onClick={()=>marcarRecebido(p.id)} style={{background:"rgba(143,196,58,0.25)",border:`1px solid ${C.green}44`,borderRadius:6,color:C.green,fontSize:9,fontWeight:700,padding:"2px 7px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",marginTop:2}}><Check size={11} strokeWidth={3}/></button>
                        </div>
                      </div>
                    );
                  })
                ):(
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"20px 0",gap:6}}>
                    <CheckCircle2 size={22} strokeWidth={1.6} style={{opacity:.4}}/>
                    <div style={{fontSize:10,color:"rgba(26,18,9,0.55)",textAlign:"center",fontFamily:"'DM Sans',sans-serif"}}>Tudo em dia!</div>
                  </div>
                )}
              </div>
              );

              // ── Ranking empresas: quem paga mais / quem atrasa mais ── 
              dc.ranking = showCard("ranking")&&(
              <div key="ranking" className={CARD} style={{height:"100%",overflow:"auto",position:"relative"}}>
                {dashEditMode&&<DashDragHandle/>}
                <SL>Ranking de empresas</SL>
                {empAnalise.length>0 ? (
                  <>
                    <div style={{marginBottom:12}}>
                      <div style={{fontSize:10,fontWeight:700,color:"rgba(26,18,9,0.55)",fontFamily:"'DM Sans',sans-serif",letterSpacing:".05em",marginBottom:7}}><Wallet size={10} strokeWidth={2.2} style={{marginRight:3,verticalAlign:"-2px"}}/>MAIOR RECEITA</div>
                      {empAnalise.slice(0,3).map((e,i)=><HBar key={e.nome} label={e.nome} value={e.total} max={empAnalise[0].total} color={e.cor||CHART_COLORS[i]}/>)}
                    </div>
                    {empAnalise.some(e=>e.atrasos>0)&&(
                      <>
                        <div style={{height:1,background:"rgba(0,0,0,0.08)",marginBottom:12}}/>
                        <div>
                          <div style={{fontSize:10,fontWeight:700,color:"rgba(26,18,9,0.55)",fontFamily:"'DM Sans',sans-serif",letterSpacing:".05em",marginBottom:7}}><Glyph e="⚠" size={10} style={{marginRight:3}}/>MAIS ATRASOS</div>
                          {[...empAnalise].filter(e=>e.atrasos>0).sort((a,b)=>b.atrasos-a.atrasos).slice(0,3).map(e=><HBar key={e.nome} label={e.nome} value={e.atrasos} max={Math.max(...empAnalise.map(x=>x.atrasos))} color={C.red} sub={`${e.atrasos}x`}/>)}
                        </div>
                      </>
                    )}
                  </>
                ):(
                  <div style={{textAlign:"center",padding:"16px 0",color:"rgba(26,18,9,0.55)",fontSize:12,fontFamily:"'DM Sans',sans-serif"}}>
                    <Cross size={24} strokeWidth={1.6} style={{display:"block",marginBottom:6,opacity:.4}}/>
                    Cadastre plantões para ver o ranking
                  </div>
                )}
              </div>
              );

              // ── Alocação ── 
              dc.alocacao = showCard("alocacao")&&(
              <div key="alocacao" className={CARD} style={{borderLeft:`3px solid ${C.magenta}`,height:"100%",overflow:"auto",position:"relative"}}>
                {dashEditMode&&<DashDragHandle/>}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <SL>Alocação de receita</SL>
                  <div style={{display:"flex",gap:6}}>
                    {alocacoes.length>0&&<button onClick={()=>setAlocExpanded(!alocExpanded)} style={{background:"rgba(0,0,0,0.06)",border:"1px solid rgba(0,0,0,0.12)",borderRadius:8,color:"#1A1209",fontSize:10,fontWeight:700,padding:"4px 10px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>{alocExpanded?"▲ Fechar":"▼ Extrato"}</button>}
                    <button onClick={()=>setModal("regras")} style={{background:"#B91D55",border:"none",borderRadius:8,color:"#fff",fontSize:10,fontWeight:700,padding:"4px 10px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}><Settings size={11} strokeWidth={2.2} style={{marginRight:4,verticalAlign:"-2px"}}/>Regras</button>
                  </div>
                </div>
                {alocacoes.length>0 ? (
                  <>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:10}}>
                      {Object.entries(resumoAloc).filter(([,v])=>v>0).map(([tipo,val])=>{const dc=DEST_COLORS[tipo];return <div key={tipo} style={{background:dc.bg,border:`1px solid ${dc.color}30`,borderRadius:10,padding:"8px 10px"}}><div style={{fontSize:9,fontWeight:700,color:dc.color,fontFamily:"'DM Sans',sans-serif",marginBottom:2,display:"flex",alignItems:"center",gap:4}}><dc.icon size={11} strokeWidth={2.2}/>{tipo.toUpperCase()}</div><div className="num" style={{fontSize:13,fontWeight:700,color:dc.color}}>{R(val)}</div></div>;})}
                    </div>
                    {alocExpanded ? (
                      <div style={{borderTop:"1px solid rgba(0,0,0,0.07)",paddingTop:10}}>
                        <div style={{fontSize:10,fontWeight:500,color:"rgba(26,18,9,0.45)",letterSpacing:".07em",textTransform:"uppercase",fontFamily:"'DM Mono',ui-monospace,monospace",marginBottom:8}}>Extrato de distribuições</div>
                        {alocacoes.map(a=>(
                          <div key={a.id} style={{background:"rgba(0,0,0,0.03)",borderRadius:10,padding:"10px 12px",marginBottom:8,border:"1px solid rgba(0,0,0,0.06)"}}>
                            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                              <div><div style={{fontSize:12,fontWeight:700,color:"#1A1209",fontFamily:"'DM Sans',sans-serif"}}>{a.empresa}</div><div style={{fontSize:10,color:"rgba(26,18,9,0.5)",fontFamily:"'DM Sans',sans-serif"}}>{a.data?new Date(a.data+"T12:00:00").toLocaleDateString("pt-BR",{day:"2-digit",month:"short",year:"numeric"}):"—"}</div></div>
                              <div className="num" style={{fontSize:13,fontWeight:700,color:"#2D5A10"}}>{R(a.totalRecebido)}</div>
                            </div>
                            {a.itens.map((it,j)=>{const dc=DEST_COLORS[it.tipo]||DEST_COLORS.livre;const inv=it.tipo==="investimento"?invests.find(x=>x.id===it.destinoId):null;return(
                              <div key={j} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderTop:"1px solid rgba(0,0,0,0.04)"}}>
                                <div style={{display:"flex",alignItems:"center",gap:6}}>
                                  <span style={{color:dc.color,display:"flex"}}><dc.icon size={13} strokeWidth={2.2}/></span>
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
                          {a.itens.map((it,j)=>{const dc=DEST_COLORS[it.tipo]||DEST_COLORS.livre;return <div key={j} style={{display:"flex",justifyContent:"space-between",marginBottom:2}}><span style={{fontSize:10,color:"rgba(26,18,9,0.7)",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:3}}><dc.icon size={11} strokeWidth={2.2}/>{it.destinoNome}</span><span className="num" style={{fontSize:10,fontWeight:700,color:dc.color}}>{R(it.valor)}</span></div>;})}
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
              );

              // ── Objetivos ── 
              dc.objetivos = showCard("objetivos")&&(
              <div key="objetivos" className={CARD} style={{height:"100%",overflow:"auto",position:"relative"}}>
                {dashEditMode&&<DashDragHandle/>}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <SL>Objetivos</SL>
                  <button className="arrow-btn arrow-btn-sm" onClick={()=>navTo("objetivos")} aria-label="Ver todos"><ArrowUpRight size={14} strokeWidth={1.8}/></button>
                </div>
                {objetivos.length>0 ? objetivos.map(o=>{const pct=o.meta>0?Math.min(o.atual/o.meta*100,100):0;
                  return <div key={o.id} style={{marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><span style={{fontSize:12,fontWeight:600,fontFamily:"'DM Sans',sans-serif",color:TXT}}>{o.nome}</span><span className="num" style={{fontSize:10,color:"rgba(26,18,9,0.85)"}}>{pct.toFixed(0)}%</span></div>
                    <Bar value={o.atual} max={o.meta} color={o.cor} h={5}/>
                    <div style={{fontSize:9,color:"rgba(26,18,9,0.55)",marginTop:2,fontFamily:"'DM Sans',sans-serif"}}>falta {R(o.meta-o.atual)}</div>
                  </div>;
                }):(
                  <div style={{textAlign:"center",padding:"14px 0",color:"rgba(26,18,9,0.55)",fontSize:12,fontFamily:"'DM Sans',sans-serif"}}>
                    <Target size={22} strokeWidth={1.6} style={{display:"block",marginBottom:6,opacity:.4}}/>
                    <button onClick={()=>navTo("objetivos")} style={{background:"none",border:"none",color:C.magenta,fontWeight:700,cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>Criar primeiro objetivo →</button>
                  </div>
                )}
              </div>
              );

              const ORDER=DASH_CARDS.map(d=>d.id);
              if(dashEditMode){
                return (
            <ResponsiveGridLayout
              layouts={dashLayoutsResolved}
              breakpoints={DASH_BREAKPOINTS}
              cols={DASH_COLS}
              rowHeight={26}
              margin={[10,10]}
              isDraggable={dashEditMode}
              isResizable={dashEditMode}
              draggableHandle=".dash-drag-handle"
              onLayoutChange={(cur,all)=>setDashLayouts(all)}
            >
                  {ORDER.map(id=>dc[id])}
                </ResponsiveGridLayout>
                );
              }
              const cw=Math.min(larguraTela,1100)-(isMobile?28:64);
              const bp=cw>=DASH_BREAKPOINTS.lg?"lg":cw>=DASH_BREAKPOINTS.md?"md":"sm";
              const ncols=DASH_COLS[bp];
              const lay=(dashLayoutsResolved[bp]||[]).filter(it=>dc[it.i]);
              const colsArr=Array.from({length:ncols},()=>[]);
              lay.filter(it=>it.i!=="resumo").sort((a,b)=>a.y-b.y||a.x-b.x).forEach(it=>{colsArr[Math.min(Math.max(it.x,0),ncols-1)].push(it.i);});
              return (
                <div className="dash-scope">
                  {dc.resumo&&<div className="dash-item" style={{marginBottom:14}}>{dc.resumo}</div>}
                  <div style={{display:"grid",gridTemplateColumns:`repeat(${ncols},minmax(0,1fr))`,gap:14,alignItems:"start"}}>
                    {colsArr.map((ids,ci)=>(
                      <div key={ci} style={{display:"flex",flexDirection:"column",gap:14,minWidth:0}}>
                        {ids.map(id=><div key={id} className="dash-item">{dc[id]}</div>)}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

          </div>
        )}

        {/* ══ MOVIMENTOS ══ */}
        {tab==="movimentos"&&(
          <div className="fade">
            <div className={CARD} style={{marginBottom:14,padding:"16px 18px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
                <div style={{display:"flex",gap:8}}>
                  <div style={{background:"rgba(255,255,255,0.9)",borderRadius:12,padding:"9px 15px",textAlign:"center",border:"1px solid rgba(45,90,16,0.35)"}}><div style={{fontSize:9.5,color:"#215010",fontWeight:700,letterSpacing:".06em",fontFamily:"'DM Sans',sans-serif"}}>ENTRADAS</div><div className="num" style={{fontSize:15,fontWeight:700,color:"#215010"}}>{R(entradas)}</div></div>
                  <div style={{background:"rgba(255,255,255,0.9)",borderRadius:12,padding:"9px 15px",textAlign:"center",border:"1px solid rgba(196,24,90,0.35)"}}><div style={{fontSize:9.5,color:"#8B1A1A",fontWeight:700,letterSpacing:".06em",fontFamily:"'DM Sans',sans-serif"}}>SAÍDAS</div><div className="num" style={{fontSize:15,fontWeight:700,color:"#8B1A1A"}}>{R(saidasTotal)}</div></div>
                </div>
                <div style={{display:"flex",gap:7}}>
                  <button onClick={()=>setImportOpen(true)} style={{background:"rgba(0,0,0,0.06)",border:"1px solid rgba(0,0,0,0.12)",borderRadius:12,padding:"9px 14px",fontSize:12,fontWeight:700,color:"#1A1209",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:6}}><Glyph e="📥" size={14}/>Importar</button>
                  <button onClick={()=>openM("mov")} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,background:"linear-gradient(135deg,#C8235F,#9B1448)",border:"none",borderRadius:12,padding:"9px 16px",fontSize:12,fontWeight:700,color:"#fff",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",boxShadow:"0 2px 8px rgba(232,32,95,0.22)"}}>
                    <Plus size={14} strokeWidth={2.5} style={{display:"inline-block",verticalAlign:"-2px"}}/> Lançamento
                  </button>
                </div>
              </div>
            </div>

            <div className={CARD} style={{marginBottom:14,padding:"14px 16px"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                <div style={{width:26,height:26,borderRadius:8,background:"rgba(232,32,95,0.12)",display:"flex",alignItems:"center",justifyContent:"center",color:"#C4185A"}}><Search size={13} strokeWidth={2.2}/></div>
                <span style={{fontSize:12,fontWeight:500,color:"#1A1209",letterSpacing:".04em",textTransform:"uppercase",fontFamily:"'DM Mono',ui-monospace,monospace"}}>Filtrar lançamentos</span>
              </div>
              <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"flex-end"}}>
                <div>
                  <div style={{fontSize:9.5,fontWeight:500,color:"rgba(26,18,9,0.45)",letterSpacing:".05em",textTransform:"uppercase",marginBottom:4,fontFamily:"'DM Mono',ui-monospace,monospace"}}>Tipo</div>
                  <select value={filtroMov.tipo} onChange={e=>setFiltroMov({...filtroMov,tipo:e.target.value})}
                    className="filter-select"
                    style={{background:"rgba(255,255,255,0.9)",border:"1.5px solid rgba(0,0,0,0.1)",borderRadius:10,padding:"8px 10px",fontSize:12,color:"#1A1209",outline:"none",fontFamily:"'DM Sans',sans-serif",fontWeight:600,cursor:"pointer",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
                    <option value="todos">Todos</option>
                    <option value="entrada">▲ Entradas</option>
                    <option value="saida">▼ Saídas</option>
                    <option value="transferencia">Transferências</option>
                  </select>
                </div>
                <div>
                  <div style={{fontSize:9.5,fontWeight:500,color:"rgba(26,18,9,0.45)",letterSpacing:".05em",textTransform:"uppercase",marginBottom:4,fontFamily:"'DM Mono',ui-monospace,monospace"}}>Categoria</div>
                  <select value={filtroMov.categoria} onChange={e=>setFiltroMov({...filtroMov,categoria:e.target.value})}
                    className="filter-select"
                    style={{background:"rgba(255,255,255,0.9)",border:"1.5px solid rgba(0,0,0,0.1)",borderRadius:10,padding:"8px 10px",fontSize:12,color:"#1A1209",outline:"none",fontFamily:"'DM Sans',sans-serif",fontWeight:600,cursor:"pointer",maxWidth:170,boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
                    <option value="todos">Todas</option>
                    {[...new Set(movs.map(m=>m.categoria.includes("·")?m.categoria.split("·")[0].trim():m.categoria))].sort().map(c=><option key={c} value={c}>{c.replace(/^\S+\s/,"")}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{fontSize:9.5,fontWeight:500,color:"rgba(26,18,9,0.45)",letterSpacing:".05em",textTransform:"uppercase",marginBottom:4,fontFamily:"'DM Mono',ui-monospace,monospace"}}>Pagamento</div>
                  <select value={filtroMov.formaPagamento} onChange={e=>setFiltroMov({...filtroMov,formaPagamento:e.target.value})}
                    className="filter-select"
                    style={{background:"rgba(255,255,255,0.9)",border:"1.5px solid rgba(0,0,0,0.1)",borderRadius:10,padding:"8px 10px",fontSize:12,color:"#1A1209",outline:"none",fontFamily:"'DM Sans',sans-serif",fontWeight:600,cursor:"pointer",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
                    <option value="todos">Todas</option>
                    <option value="dinheiro">Dinheiro</option>
                    <option value="pix">Pix</option>
                    <option value="debito">Débito</option>
                    <option value="cartao">Cartão</option>
                  </select>
                </div>
                {(filtroMov.tipo!=="todos"||filtroMov.categoria!=="todos"||filtroMov.formaPagamento!=="todos")&&(
                  <button onClick={()=>setFiltroMov({tipo:"todos",categoria:"todos",formaPagamento:"todos"})} style={{display:"flex",alignItems:"center",gap:5,background:"linear-gradient(135deg,#C8235F,#9B1448)",border:"none",borderRadius:10,color:"#fff",fontSize:12,fontWeight:700,padding:"8px 14px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",boxShadow:"0 2px 8px rgba(232,32,95,0.3)"}}>✕ Limpar</button>
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
                <div className="row-head" style={{display:"grid",gridTemplateColumns:"1fr 175px 100px 92px 26px",gap:10,marginBottom:8,padding:"0 4px"}}>
                  <div style={{fontSize:10,fontWeight:500,color:"#1A1209",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'DM Mono',ui-monospace,monospace"}}>Descrição</div>
                  <div style={{fontSize:10,fontWeight:500,color:"#1A1209",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'DM Mono',ui-monospace,monospace"}}>Categoria</div>
                  <div style={{fontSize:10,fontWeight:500,color:"#1A1209",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'DM Mono',ui-monospace,monospace"}}>Data</div>
                  <div style={{fontSize:10,fontWeight:500,color:"#1A1209",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'DM Mono',ui-monospace,monospace",textAlign:"right"}}>Valor</div>
                  <div/>
                </div>
                {[...movsFiltrados].sort((a,b)=>b.data.localeCompare(a.data)).map((m,idx)=>{
                  const opts = m.tipo==="entrada" ? (cats?.receita||DEFAULT_CATS.receita) : m.tipo==="transferencia" ? [] : (cats?.despesa||DEFAULT_CATS.despesa);
                  return (
                    <div key={m.id} className="row-mov" style={{display:"grid",gridTemplateColumns:"1fr 175px 100px 92px 26px",gap:10,alignItems:"center",padding:"10px 4px",background:idx%2===0?"rgba(0,0,0,0.025)":"transparent",borderRadius:8}}>
                      <div>
                        <input value={m.descricao} onChange={e=>setMovs(movs.map(x=>x.id===m.id?{...x,descricao:e.target.value}:x))}
                          style={{background:"transparent",border:"none",padding:"5px 4px",fontSize:13,color:"#1A1209",fontWeight:600,outline:"none",fontFamily:"'DM Sans',sans-serif",width:"100%"}}/>
                        {m.tipo==="entrada"&&regras.length>0&&(
                          <button onClick={()=>setMovDist(m)} style={{background:"rgba(232,32,95,0.1)",border:"1px solid rgba(232,32,95,0.3)",borderRadius:6,color:"#C4185A",fontSize:9,fontWeight:700,padding:"2px 7px",cursor:"pointer",fontFamily:"inherit",marginLeft:4}}>distribuir</button>
                        )}
                      </div>
                      {m.tipo==="transferencia" ? (
                        <div title={m.investId?invests.find(i=>i.id===m.investId)?.nome:""} style={{display:"flex",alignItems:"center",gap:8,background:"rgba(91,163,212,0.14)",border:"1px solid rgba(91,163,212,0.3)",borderRadius:10,padding:"6px 10px 6px 6px",minWidth:0}}>
                          <div style={{width:26,height:26,borderRadius:8,background:"rgba(91,163,212,0.25)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:"#1A4A6E"}}>{m.subtipo==="resgate"?<TrendingDown size={14} strokeWidth={2.2}/>:m.investId?<TrendingUp size={14} strokeWidth={2.2}/>:<RefreshCw size={14} strokeWidth={2.2}/>}</div>
                          <div style={{minWidth:0}}>
                            <div style={{fontSize:11.5,color:"#1A4A6E",fontWeight:700,fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{m.subtipo==="resgate"?"Resgate":"Transferência"}</div>
                            {m.investId&&<div style={{fontSize:9.5,color:"#1A4A6E",opacity:0.75,fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{invests.find(i=>i.id===m.investId)?.nome||""}</div>}
                          </div>
                        </div>
                      ) : (
                        <div title={m.categoria} style={{display:"flex",alignItems:"center",gap:8,background:m.tipo==="entrada"?"rgba(45,90,16,0.09)":"rgba(196,24,90,0.08)",border:`1px solid ${m.tipo==="entrada"?"rgba(45,90,16,0.22)":"rgba(196,24,90,0.2)"}`,borderRadius:10,padding:"6px 8px 6px 6px",minWidth:0}}>
                          <div style={{width:26,height:26,borderRadius:8,background:m.tipo==="entrada"?"rgba(45,90,16,0.16)":"rgba(196,24,90,0.14)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:m.tipo==="entrada"?"#215010":"#8B1043"}}><Glyph e={m.categoria.split(" ")[0]} size={14}/></div>
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
                <button onClick={()=>openM("plt")} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,background:"linear-gradient(135deg,#C8235F,#9B1448)",border:"none",borderRadius:12,padding:"10px 18px",fontSize:12.5,fontWeight:700,color:"#fff",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",boxShadow:"0 2px 8px rgba(232,32,95,0.22)",transition:"transform .15s"}}
                  onMouseEnter={e=>e.currentTarget.style.transform="translateY(-1px)"} onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
                  <Plus size={15} strokeWidth={2.5} style={{display:"inline-block",verticalAlign:"-2px"}}/> Plantão
                </button>
                <button onClick={()=>setModal("pltLote")} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,background:"rgba(91,163,212,0.15)",border:"1.5px solid rgba(91,163,212,0.4)",borderRadius:12,padding:"10px 18px",fontSize:12.5,fontWeight:700,color:"#1A4A6E",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"transform .15s"}}
                  onMouseEnter={e=>e.currentTarget.style.transform="translateY(-1px)"} onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
                  <Calendar size={14} strokeWidth={2.2} style={{display:"inline-block",verticalAlign:"-2px"}}/> Vários
                </button>
                <button onClick={()=>openM("emp")} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,background:"rgba(255,255,255,0.9)",border:"1.5px solid rgba(0,0,0,0.1)",borderRadius:12,padding:"10px 18px",fontSize:12.5,fontWeight:700,color:"#1A1209",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",boxShadow:"0 2px 8px rgba(0,0,0,0.08)",transition:"transform .15s"}}
                  onMouseEnter={e=>e.currentTarget.style.transform="translateY(-1px)"} onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
                  <Cross size={14} strokeWidth={2.2} style={{display:"inline-block",verticalAlign:"-2px"}}/> Empresa
                </button>
              </div>
            </div>
            {empresas.length>0&&(
              <div className={CARD} style={{marginBottom:14,padding:"14px 16px"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:11}}>
                  <div style={{width:26,height:26,borderRadius:8,background:"rgba(232,32,95,0.12)",display:"flex",alignItems:"center",justifyContent:"center",color:"#C4185A"}}><Building2 size={13} strokeWidth={2.2}/></div>
                  <span style={{fontSize:12,fontWeight:500,color:"#1A1209",letterSpacing:".04em",textTransform:"uppercase",fontFamily:"'DM Mono',ui-monospace,monospace"}}>Empresas</span>
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
              {[["tabela",BarChart3,"Tabela"],["cards",ClipboardList,"Cards"]].map(([v,Ic,l])=>(
                <button key={v} onClick={()=>setPltView(v)} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,background:pltView===v?"#B91D55":"transparent",color:pltView===v?"#fff":"#5A4A3A",border:"none",borderRadius:10,padding:"8px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",transition:"all .15s"}}><Ic size={13} strokeWidth={2.2}/>{l}</button>
              ))}
            </div>
            <div className={CARD} style={{marginBottom:14,padding:"14px 16px"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                <div style={{width:26,height:26,borderRadius:8,background:"rgba(232,32,95,0.12)",display:"flex",alignItems:"center",justifyContent:"center",color:"#C4185A"}}><Search size={13} strokeWidth={2.2}/></div>
                <span style={{fontSize:12,fontWeight:500,color:"#1A1209",letterSpacing:".04em",textTransform:"uppercase",fontFamily:"'DM Mono',ui-monospace,monospace"}}>Filtrar plantões</span>
              </div>
              <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"flex-end"}}>
                <div>
                  <div style={{fontSize:9.5,fontWeight:500,color:"rgba(26,18,9,0.45)",letterSpacing:".05em",textTransform:"uppercase",marginBottom:4,fontFamily:"'DM Mono',ui-monospace,monospace"}}>Empresa</div>
                  <select value={filtroPlt.empresa} onChange={e=>setFiltroPlt({...filtroPlt,empresa:e.target.value})}
                    className="filter-select"
                    style={{background:"rgba(255,255,255,0.9)",border:"1.5px solid rgba(0,0,0,0.1)",borderRadius:10,padding:"8px 10px",fontSize:12,color:"#1A1209",outline:"none",fontFamily:"'DM Sans',sans-serif",fontWeight:600,cursor:"pointer",maxWidth:170,boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
                    <option value="todos">Todas</option>
                    {empresas.map(e=><option key={e.id} value={e.nome}>{e.nome}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{fontSize:9.5,fontWeight:500,color:"rgba(26,18,9,0.45)",letterSpacing:".05em",textTransform:"uppercase",marginBottom:4,fontFamily:"'DM Mono',ui-monospace,monospace"}}>Status</div>
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
                  <div style={{fontSize:9.5,fontWeight:500,color:"rgba(26,18,9,0.45)",letterSpacing:".05em",textTransform:"uppercase",marginBottom:4,fontFamily:"'DM Mono',ui-monospace,monospace"}}>Previsão de pagamento</div>
                  <div style={{display:"flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.9)",border:"1.5px solid rgba(0,0,0,0.1)",borderRadius:10,padding:"5px 8px",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
                    <input type="date" value={filtroPlt.dataDe} onChange={e=>setFiltroPlt({...filtroPlt,dataDe:e.target.value})}
                      style={{background:"transparent",border:"none",padding:"3px 0",fontSize:11.5,color:"#1A1209",outline:"none",fontFamily:"'DM Sans',sans-serif",fontWeight:600,width:118}}/>
                    <span style={{fontSize:11,color:"rgba(26,18,9,0.4)",fontWeight:600}}>→</span>
                    <input type="date" value={filtroPlt.dataAte} onChange={e=>setFiltroPlt({...filtroPlt,dataAte:e.target.value})}
                      style={{background:"transparent",border:"none",padding:"3px 0",fontSize:11.5,color:"#1A1209",outline:"none",fontFamily:"'DM Sans',sans-serif",fontWeight:600,width:118}}/>
                  </div>
                </div>
                {(filtroPlt.empresa!=="todos"||filtroPlt.status!=="todos"||filtroPlt.dataDe||filtroPlt.dataAte)&&(
                  <button onClick={()=>setFiltroPlt({empresa:"todos",status:"todos",dataDe:"",dataAte:""})} style={{display:"flex",alignItems:"center",gap:5,background:"linear-gradient(135deg,#C8235F,#9B1448)",border:"none",borderRadius:10,color:"#fff",fontSize:12,fontWeight:700,padding:"8px 14px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",boxShadow:"0 2px 8px rgba(232,32,95,0.3)"}}>✕ Limpar</button>
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
                const key=mesDoPlantao(p)||"sem-data";
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
                      <div className="row-head" style={{display:"grid",gridTemplateColumns:"1fr 95px 85px 100px 92px 26px 26px",gap:6,marginBottom:8,padding:"0 4px"}}>
                        <div style={{fontSize:10,fontWeight:500,color:"rgba(26,18,9,0.5)",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'DM Mono',ui-monospace,monospace"}}>Empresa</div>
                        <div style={{fontSize:10,fontWeight:500,color:"rgba(26,18,9,0.5)",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'DM Mono',ui-monospace,monospace"}}>Dia</div>
                        <div style={{fontSize:10,fontWeight:500,color:"rgba(26,18,9,0.5)",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'DM Mono',ui-monospace,monospace"}}>Valor</div>
                        <div style={{fontSize:10,fontWeight:500,color:"rgba(26,18,9,0.5)",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'DM Mono',ui-monospace,monospace"}}>Data prov.</div>
                        <div style={{fontSize:10,fontWeight:500,color:"rgba(26,18,9,0.5)",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'DM Mono',ui-monospace,monospace"}}>Status</div>
                        <div/>
                      </div>
                      {grupo.map((p,idx)=>{
                        const emp=empNome(p.empresa);
                        return (
                          <div key={p.id} className="row-plt" style={{display:"grid",gridTemplateColumns:"1fr 95px 85px 100px 92px 26px 26px",gap:6,alignItems:"center",padding:"9px 4px",background:idx%2===0?"rgba(0,0,0,0.02)":"transparent",borderRadius:8}}>
                            <div style={{display:"flex",alignItems:"center",gap:7,minWidth:0}}>
                              <div style={{width:8,height:8,borderRadius:99,background:emp.cor||C.magenta,flexShrink:0}}/>
                              <select value={p.empresa} onChange={e=>updatePlantao(p.id,{empresa:e.target.value})}
                                className="plt-select"
                                style={{background:"transparent",border:"none",padding:"6px 4px",fontSize:14,color:"#1A1209",fontWeight:600,cursor:"pointer",fontFamily:"inherit",width:"100%",minWidth:0}}>
                                {empresas.map(e=><option key={e.id} value={e.nome}>{e.nome}</option>)}
                                {!empresas.find(e=>e.nome===p.empresa)&&<option value={p.empresa}>{p.empresa}</option>}
                              </select>
                              {p.confirmado===true&&<span title="Você confirmou que realizou esse plantão" style={{fontSize:9,fontWeight:700,color:"#215010",background:"rgba(45,90,16,0.12)",borderRadius:5,padding:"2px 5px",flexShrink:0,whiteSpace:"nowrap"}}>✓ confirmado</span>}
                              {p.confirmado===false&&<span title={p.coberturaPor?`Coberto por ${p.coberturaPor}`:"Você indicou que não realizou esse plantão"} style={{fontSize:9,fontWeight:700,color:"#8B1A1A",background:"rgba(139,26,26,0.1)",borderRadius:5,padding:"2px 5px",flexShrink:0,whiteSpace:"nowrap"}}>✗ não fiz{p.coberturaPor?` · ${p.coberturaPor}`:""}</span>}
                            </div>
                            <input type="date" value={p.data||""} onChange={e=>{
                              const novaData=e.target.value;
                              updatePlantao(p.id,{data:novaData});
                              const novaChave=monthKey(p.previsao||novaData);
                              if(novaChave&&novaChave!==pltMes)setPltMes(novaChave);
                            }}
                              style={{background:"rgba(255,255,255,0.7)",border:"1px solid rgba(0,0,0,0.12)",borderRadius:8,padding:"7px 4px",fontSize:11,color:"#1A1209",outline:"none",fontFamily:"'DM Sans',sans-serif",width:"100%"}}/>
                            <input type="number" value={p.valorTotal} onChange={e=>updatePlantao(p.id,{valorTotal:+e.target.value})}
                              className="plt-numinput"
                              style={{background:"rgba(255,255,255,0.7)",border:"1px solid rgba(0,0,0,0.12)",borderRadius:8,padding:"7px 5px",fontSize:13,color:"#2D5A10",fontWeight:700,outline:"none",fontFamily:"'DM Sans',sans-serif",width:"100%"}}/>
                            <input type="date" value={p.previsao||""} onChange={e=>{
                              const novaPrevisao=e.target.value;
                              updatePlantao(p.id,{previsao:novaPrevisao});
                              const novaChave=monthKey(novaPrevisao||p.data);
                              if(novaChave&&novaChave!==pltMes)setPltMes(novaChave);
                            }}
                              style={{background:"rgba(255,255,255,0.7)",border:"1px solid rgba(0,0,0,0.12)",borderRadius:8,padding:"7px 4px",fontSize:11,color:"#1A1209",outline:"none",fontFamily:"'DM Sans',sans-serif",width:"100%"}}/>
                            {p.status==="recebido"?(
                              <div style={{background:"rgba(143,196,58,0.2)",border:"1px solid rgba(45,90,16,0.3)",borderRadius:7,padding:"6px 4px",fontSize:10,fontWeight:700,color:"#2D5A10",textAlign:"center",fontFamily:"'DM Sans',sans-serif"}}><Check size={11} strokeWidth={3} style={{marginRight:3}}/>Recebido{recebidoSemEntrada(p)&&<button onClick={()=>marcarRecebido(p.id)} title="Este plantão está como recebido mas não entrou no caixa. Toque para informar a data." style={{display:"block",width:"100%",marginTop:3,background:"#E8A020",border:"none",borderRadius:5,color:"#fff",fontSize:9,fontWeight:700,padding:"2px 0",cursor:"pointer",fontFamily:"inherit"}}>Informar data</button>}{p.dataRecebimento&&<div style={{fontSize:9,fontWeight:600,opacity:.8}}>{fd(p.dataRecebimento)}</div>}</div>
                            ):(
                              <button onClick={()=>marcarRecebido(p.id)} style={{background:"rgba(232,32,95,0.1)",border:"1px solid rgba(232,32,95,0.35)",borderRadius:7,padding:"6px 4px",fontSize:10,fontWeight:700,color:"#B91D55",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",width:"100%"}}>Receber</button>
                            )}
                            <button onClick={()=>openM("plt",p)} title="Editar (inclui horário)" style={{background:p.horaInicio?"rgba(45,90,16,0.1)":"rgba(91,163,212,0.12)",border:"none",borderRadius:6,color:p.horaInicio?"#215010":"#1A4A6E",cursor:"pointer",lineHeight:1,width:22,height:22,display:"flex",alignItems:"center",justifyContent:"center"}}>{p.horaInicio?<Clock size={12} strokeWidth={2.2}/>:<Pencil size={12} strokeWidth={2.2}/>}</button>
                            <button onClick={()=>remove(plantoes,setPlantoes,p.id)} style={{background:"rgba(0,0,0,0.05)",border:"none",borderRadius:6,color:"#8B1A1A",fontSize:14,cursor:"pointer",lineHeight:1,width:22,height:22,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
                            <span className="mlab" data-for="dia">Dia</span><span className="mlab" data-for="valor">Valor</span><span className="mlab" data-for="prev">Previsão</span><span className="mlab" data-for="status">Status</span>
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
                        <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3,flexWrap:"wrap"}}><span style={{fontSize:14,fontWeight:600,fontFamily:"'DM Sans',sans-serif",color:TXT}}>{emp.nome}</span><Badge label={s.label} color={s.color} bg={s.bg}/>
                          {p.confirmado===true&&<span title="Você confirmou que realizou esse plantão" style={{fontSize:9,fontWeight:700,color:"#215010",background:"rgba(45,90,16,0.12)",borderRadius:5,padding:"2px 5px",whiteSpace:"nowrap"}}>✓ confirmado</span>}
                          {p.confirmado===false&&<span title={p.coberturaPor?`Coberto por ${p.coberturaPor}`:"Você indicou que não realizou esse plantão"} style={{fontSize:9,fontWeight:700,color:"#8B1A1A",background:"rgba(139,26,26,0.1)",borderRadius:5,padding:"2px 5px",whiteSpace:"nowrap"}}>✗ não fiz{p.coberturaPor?` · ${p.coberturaPor}`:""}</span>}
                        </div>
                        <div style={{fontSize:10,color:"rgba(26,18,9,0.85)",fontFamily:"'DM Sans',sans-serif"}}>{fd(p.data)}{p.horas&&` · ${p.horas}h`}{p.previsao&&` · pgto ${fd(p.previsao)}`}{p.previsao&&p.status!=="recebido"&&d!==null&&<span style={{color:d<0?C.red:d<7?C.gold:TSUB,fontWeight:600}}> ({d<0?`${Math.abs(d)}d atrasado`:d===0?"hoje":d===1?"amanhã":`${d}d`})</span>}</div>
                        {aloc&&<div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:5}}>{aloc.itens.map((it,j)=>{const dc=DEST_COLORS[it.tipo]||DEST_COLORS.livre;return <span key={j} style={{fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:99,background:dc.bg,color:dc.color,backdropFilter:"blur(4px)"}}>{it.destinoNome}: {R(it.valor)}</span>;})}</div>}
                      </div>
                      <div className="num" style={{fontSize:16,fontWeight:700,flexShrink:0,color:TXT}}>{R(p.valorTotal)}</div>
                    </div>
                    <div style={{display:"flex",gap:6}}>
                      {p.status!=="recebido"&&<Btn variant="green" style={{fontSize:10,padding:"5px 11px"}} onClick={()=>marcarRecebido(p.id)}><Check size={11} strokeWidth={3} style={{marginRight:3}}/>Recebido</Btn>}
                      {recebidoSemEntrada(p)&&<Btn variant="green" style={{fontSize:10,padding:"5px 11px",background:"#E8A020"}} onClick={()=>marcarRecebido(p.id)}>Informar data do recebimento</Btn>}
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
                  <div style={{width:26,height:26,borderRadius:8,background:"rgba(91,163,212,0.15)",display:"flex",alignItems:"center",justifyContent:"center",color:"#1A4A6E"}}><Sparkles size={13} strokeWidth={2.2}/></div>
                  <span style={{fontSize:12,fontWeight:500,color:"#1A1209",letterSpacing:".04em",textTransform:"uppercase",fontFamily:"'DM Mono',ui-monospace,monospace"}}>Presente vs Futuro</span>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                  <div style={{background:"rgba(139,26,26,0.07)",border:"1px solid rgba(139,26,26,0.18)",borderRadius:10,padding:"11px 13px"}}>
                    <div style={{fontSize:9.5,fontWeight:500,color:"#8B1A1A",letterSpacing:".05em",textTransform:"uppercase",fontFamily:"'DM Mono',ui-monospace,monospace",marginBottom:4,display:"flex",alignItems:"center",gap:3}}><Sandwich size={11} strokeWidth={2.2}/>Gasto no agora</div>
                    <div className="num" style={{fontSize:17,fontWeight:700,color:"#8B1A1A"}}>{R(presenteVsFuturo.gastoSuperfluo)}</div>
                    <div style={{fontSize:9,color:"#8B1A1A",opacity:0.7,fontFamily:"'DM Sans',sans-serif",marginTop:2}}>lazer, delivery, compras por impulso...</div>
                  </div>
                  <div style={{background:"rgba(45,90,16,0.08)",border:"1px solid rgba(45,90,16,0.2)",borderRadius:10,padding:"11px 13px"}}>
                    <div style={{fontSize:9.5,fontWeight:500,color:"#215010",letterSpacing:".05em",textTransform:"uppercase",fontFamily:"'DM Mono',ui-monospace,monospace",marginBottom:4,display:"flex",alignItems:"center",gap:3}}><Sprout size={11} strokeWidth={2.2}/>Guardado pro futuro</div>
                    <div className="num" style={{fontSize:17,fontWeight:700,color:"#215010"}}>{R(presenteVsFuturo.totalFuturo)}</div>
                    <div style={{fontSize:9,color:"#215010",opacity:0.7,fontFamily:"'DM Sans',sans-serif",marginTop:2}}>investimentos, objetivos, dívidas</div>
                  </div>
                </div>
                <div style={{background:presenteVsFuturo.diferenca>0?"rgba(212,168,67,0.15)":"rgba(45,90,16,0.08)",border:`1px solid ${presenteVsFuturo.diferenca>0?"rgba(212,168,67,0.4)":"rgba(45,90,16,0.2)"}`,borderRadius:10,padding:"10px 13px",fontSize:12,color:presenteVsFuturo.diferenca>0?"#6B4C00":"#215010",fontFamily:"'DM Sans',sans-serif",lineHeight:1.5}}>
                  {presenteVsFuturo.diferenca>0
                    ? <><Glyph e="⚠" size={13} style={{marginRight:4}}/>Você gastou <strong>{R(presenteVsFuturo.diferenca)}</strong> a mais no agora do que guardou pro futuro esse mês. Vale repensar algumas compras do momento.</>
                    : <><CheckCircle2 size={13} style={{marginRight:4}}/>Você guardou mais pro futuro do que gastou em coisas do momento — seguindo bem!</>
                  }
                </div>
              </div>
            )}

            {/* Onde economizar */}
            {analiseEconomia.length>0&&(
              <div className={CARD} style={{marginBottom:10,padding:"16px 18px"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                  <div style={{width:26,height:26,borderRadius:8,background:"rgba(212,168,67,0.18)",display:"flex",alignItems:"center",justifyContent:"center",color:"#8B6000"}}><Lightbulb size={13} strokeWidth={2.2}/></div>
                  <span style={{fontSize:12,fontWeight:500,color:"#1A1209",letterSpacing:".04em",textTransform:"uppercase",fontFamily:"'DM Mono',ui-monospace,monospace"}}>Onde você pode economizar</span>
                </div>
                {analiseEconomia.map((r,idx)=>(
                  <div key={r.cat} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 4px",borderBottom:idx<analiseEconomia.length-1?"1px solid rgba(0,0,0,0.06)":"none"}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:600,color:"#1A1209",fontFamily:"'DM Sans',sans-serif"}}><CatLabel text={r.cat} size={14}/></div>
                      <div style={{fontSize:10.5,color:r.percentualAcima>15?"#8B1A1A":"#5A4A3A",fontFamily:"'DM Sans',sans-serif",marginTop:2}}>
                        {r.percentualAcima>15
                          ? <><Glyph e="⚠" size={11} style={{marginRight:3}}/>{r.percentualAcima.toFixed(0)}% acima da sua média (últimos 3 meses: {R(r.media)})</>
                          : r.naoEssencial
                          ? <><MessageCircle size={11} style={{marginRight:3}}/>categoria não essencial — boa candidata pra cortar</>
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
                      <SL style={{marginBottom:0,display:"flex",alignItems:"center",gap:5}}><Wallet size={12} strokeWidth={2.2}/>Ganho por hora trabalhada</SL>
                      <span style={{fontSize:10,color:"rgba(26,18,9,0.45)",fontFamily:"'DM Sans',sans-serif"}}>só plantões com horas registradas</span>
                    </div>
                    {empPorHora.map((e,idx)=>(
                      <HBar key={e.nome} label={idx===0?<span style={{display:"inline-flex",alignItems:"center",gap:4}}><Trophy size={12} strokeWidth={2.2}/>{e.nome}</span>:e.nome} value={e.valorHora} max={maxValorHora} color={idx===0?"#2D9A1A":(e.cor||C.magenta)} sub={`${R(e.valorHora)}/h`}/>
                    ))}
                  </div>
                )}

                {/* Linha 3: Mais atrasos + Resumo */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                  <div className={CARD}>
                    <SL>Mais atrasos</SL>
                    {empAnalise.some(e=>e.atrasos>0)
                      ?[...empAnalise].sort((a,b)=>b.atrasos-a.atrasos).filter(e=>e.atrasos>0).map(e=><HBar key={e.nome} label={e.nome} value={e.atrasos} max={maxEmpAtraso} color={C.red} sub={`${e.atrasos}x`}/>)
                      :<div style={{color:"rgba(26,18,9,0.4)",fontSize:12,textAlign:"center",padding:"12px 0",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}><CheckCircle2 size={13} strokeWidth={2.2}/>Nenhum atraso</div>
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
                <div style={{fontSize:11,fontWeight:500,letterSpacing:".08em",textTransform:"uppercase",color:"rgba(26,18,9,0.55)",fontFamily:"'DM Mono',ui-monospace,monospace",marginBottom:4}}><TrendingUp size={11} strokeWidth={2.2} style={{marginRight:4,verticalAlign:"-2px"}}/>Investimentos</div>
                <div className="num" style={{fontSize:26,fontWeight:700,color:C.green,letterSpacing:"-.02em",lineHeight:1}}>{R(totalInvestido)}</div>
                <div style={{fontSize:10,color:"rgba(26,18,9,0.55)",fontFamily:"'DM Sans',sans-serif",marginTop:3}}>total investido</div>
              </div>
              <button onClick={()=>openM("inv")} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,background:"linear-gradient(135deg,#C8235F,#9B1448)",border:"none",borderRadius:12,padding:"10px 16px",fontSize:12.5,fontWeight:700,color:"#fff",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",boxShadow:"0 2px 8px rgba(232,32,95,0.22)"}}>
                <Plus size={15} strokeWidth={2.5} style={{display:"inline-block",verticalAlign:"-2px"}}/> Investimento
              </button>
            </div>
            {invests.length>1&&(()=>{
              const ranking=[...invests].map(i=>({...i,txEf:taxaEfetiva(i)})).sort((a,b)=>b.txEf-a.txEf);
              const maxTx=Math.max(...ranking.map(i=>i.txEf),1);
              return (
                <div className={CARD} style={{marginBottom:16,padding:"16px 18px"}}>
                  <div style={{fontSize:12,fontWeight:500,color:"#1A1209",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'DM Mono',ui-monospace,monospace",marginBottom:12}}><BarChart3 size={12} strokeWidth={2.2} style={{marginRight:4,verticalAlign:"-2px"}}/>Onde vale mais a pena alocar</div>
                  {ranking.map((i,idx)=>(
                    <div key={i.id} style={{marginBottom:10}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                        <span style={{fontSize:12,fontWeight:600,color:"#1A1209",fontFamily:"'DM Sans',sans-serif",display:"inline-flex",alignItems:"center",gap:4}}>{idx===0&&<Trophy size={12} strokeWidth={2.2}/>}{i.nome}</span>
                        <span className="num" style={{fontSize:12,fontWeight:700,color:idx===0?"#2D5A10":"#1A1209"}}>{i.txEf.toFixed(2)}% a.a.</span>
                      </div>
                      <div style={{background:"rgba(0,0,0,0.1)",borderRadius:99,height:6,overflow:"hidden"}}>
                        <div style={{width:`${(i.txEf/maxTx*100)}%`,height:"100%",background:idx===0?"#2D9A1A":"#5B7C94",borderRadius:99,transition:"width .5s"}}/>
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
                const CatIcon={fixa:BarChart3,variavel:TrendingUp,fundos:Landmark,outros:Package}[catInfo?.id]||Package;
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
                        <div style={{fontSize:10,fontWeight:500,color:"#1A1209",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'DM Mono',ui-monospace,monospace",display:"flex",alignItems:"center",justifyContent:"center",gap:4}}><CatIcon size={11} strokeWidth={2.2}/>{catInfo?.label}</div>
                        <div style={{fontSize:11,color:"rgba(26,18,9,0.5)",fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>{idx+1} de {invests.length}</div>
                      </div>
                      <button onClick={()=>setInvestIdx(idx===invests.length-1?0:idx+1)} style={{background:"rgba(255,255,255,0.75)",border:"1px solid rgba(0,0,0,0.1)",borderRadius:10,width:36,height:36,cursor:"pointer",fontSize:17,color:"#1A1209",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>›</button>
                    </div>
                    {invests.length>1&&(
                      <div style={{display:"flex",gap:5,justifyContent:"center",marginBottom:14,flexWrap:"wrap"}}>
                        {invests.map((inv,dotIdx)=>(
                          <button key={inv.id} onClick={()=>setInvestIdx(dotIdx)} title={inv.nome}
                            style={{width:dotIdx===idx?18:7,height:7,borderRadius:99,border:"none",background:dotIdx===idx?"#B91D55":"rgba(0,0,0,0.18)",cursor:"pointer",transition:"all .2s",padding:0}}/>
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
                          <div style={{fontSize:9,fontWeight:500,color:"#1A4A6E",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'DM Mono',ui-monospace,monospace",marginBottom:6}}>Reservado para</div>
                          {objsVinc.map(o=>(
                            <div key={o.id} style={{display:"flex",justifyContent:"space-between",padding:"2px 0"}}>
                              <span style={{fontSize:11,color:"#1A1209",fontFamily:"'DM Sans',sans-serif"}}><Target size={11} strokeWidth={2.2} style={{marginRight:3,verticalAlign:"-2px"}}/>{o.nome}</span>
                              <span className="num" style={{fontSize:11,fontWeight:700,color:"#1A4A6E"}}>{R(o.atual)}</span>
                            </div>
                          ))}
                          {divsVinc.map(d=>(
                            <div key={d.id} style={{display:"flex",justifyContent:"space-between",padding:"2px 0"}}>
                              <span style={{fontSize:11,color:"#1A1209",fontFamily:"'DM Sans',sans-serif"}}><Landmark size={11} strokeWidth={2.2} style={{marginRight:3,verticalAlign:"-2px"}}/>{d.credor}</span>
                              <span className="num" style={{fontSize:11,fontWeight:700,color:"#1A4A6E"}}>{R(d.pago)}</span>
                            </div>
                          ))}
                          <div style={{display:"flex",justifyContent:"space-between",padding:"4px 0 0",marginTop:4,borderTop:"1px solid rgba(91,163,212,0.2)"}}>
                            <span style={{fontSize:10,color:"#1A1209",fontFamily:"'DM Sans',sans-serif",fontWeight:700}}>Livre neste investimento</span>
                            <span className="num" style={{fontSize:11,fontWeight:700,color:livreNoInvest>=0?"#2D5A10":"#8B1A1A"}}>{R(livreNoInvest)}</span>
                          </div>
                          {livreNoInvest<0&&(
                            <div style={{marginTop:6,background:"rgba(139,26,26,0.1)",border:"1px solid rgba(139,26,26,0.3)",borderRadius:8,padding:"6px 10px",fontSize:10,color:"#5A0A0A",fontFamily:"'DM Sans',sans-serif",fontWeight:700}}>
                              <Glyph e="⚠" size={12} style={{marginRight:4}}/>Você alocou mais do que tem guardado aqui
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
                              <div style={{fontSize:10,fontWeight:500,color:"rgba(26,18,9,0.5)",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'DM Mono',ui-monospace,monospace"}}>Histórico de juros mensal</div>
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
                              <button onClick={()=>addJuros(i.id)} style={{background:"#B91D55",border:"none",borderRadius:8,padding:"7px 12px",fontSize:11,fontWeight:700,color:"#fff",cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>+ Add</button>
                            </div>
                          </div>
                        );
                      })()}

                      {(()=>{
                        // Cronologia de aportes: junta movimentos, plantões e registros manuais
                        const itens=[];
                        movs.filter(m=>m.tipo==="transferencia"&&m.investId===i.id).forEach(m=>
                          itens.push({k:"m"+m.id,data:m.data,valor:m.subtipo==="resgate"?-m.valor:m.valor,origem:"Movimento",obs:m.descricao,onDel:()=>removeMov(m.id)}));
                        alocacoes.forEach(a=>(a.itens||[]).forEach((it,ix)=>{
                          if(it.tipo==="investimento"&&it.destinoId===i.id)
                            itens.push({k:"a"+a.id+"_"+ix,data:a.data,valor:+it.valor,origem:"Plantão",obs:a.empresa||""});
                        }));
                        (i.aportesManuais||[]).forEach(e=>
                          itens.push({k:"r"+e.id,data:e.data,valor:+e.valor,origem:e.origem==="objetivo"?"Objetivo":"Registro",obs:e.obs||"",onDel:()=>removeAporteManual(i.id,e.id)}));
                        const liquido=itens.reduce((s,x)=>s+x.valor,0);
                        const resto=+(i.aporte-liquido).toFixed(2);
                        if(Math.abs(resto)>=0.01)
                          itens.push({k:"base",data:i.data,valor:resto,origem:resto>0?"Saldo anterior":"Ajuste",obs:resto>0?"Valor que já existia antes do histórico":"Diferença com o valor editado"});
                        itens.sort((a,b)=>(b.data||"").localeCompare(a.data||""));
                        const aberto=cronoAberto===i.id;
                        const lista=aberto?itens:itens.slice(0,3);
                        const cor=o=>({"Movimento":"#1A4A6E","Plantão":"#2D5A10","Registro":"#7A0E3A","Objetivo":"#8A5A00"}[o]||"#555");
                        return (
                          <div style={{background:"rgba(0,0,0,0.03)",borderRadius:10,padding:"10px 12px",marginBottom:9,border:"1px solid rgba(0,0,0,0.06)"}}>
                            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                              <div style={{fontSize:10,fontWeight:500,color:"rgba(26,18,9,0.5)",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'DM Mono',ui-monospace,monospace"}}>Cronologia de aportes</div>
                              <button onClick={()=>openM("aporteInv",null,i.id)} style={{display:"flex",alignItems:"center",gap:4,background:"linear-gradient(135deg,#9BD046,#7AB02A)",border:"none",borderRadius:8,padding:"6px 11px",fontSize:11,fontWeight:700,color:"#fff",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}><Plus size={12} strokeWidth={2.6}/>Aporte</button>
                            </div>
                            {itens.length===0&&<div style={{fontSize:11,color:"rgba(26,18,9,0.45)",fontFamily:"'DM Sans',sans-serif"}}>Nenhum aporte registrado ainda.</div>}
                            {lista.map((x,ix)=>(
                              <div key={x.k} style={{display:"flex",alignItems:"flex-start",gap:9,padding:"6px 0",borderTop:ix?"1px solid rgba(0,0,0,0.05)":"none"}}>
                                <div style={{width:8,height:8,borderRadius:99,background:x.valor<0?"#8B1A1A":cor(x.origem),marginTop:5,flexShrink:0}}/>
                                <div style={{flex:1,minWidth:0}}>
                                  <div style={{fontSize:11.5,fontWeight:700,color:"#1A1209",fontFamily:"'DM Sans',sans-serif"}}>{x.data?fdFull(x.data):"—"} <span style={{fontSize:9,fontWeight:500,color:cor(x.origem),textTransform:"uppercase",letterSpacing:".06em",marginLeft:4,fontFamily:"'DM Mono',ui-monospace,monospace"}}>{x.valor<0?"Resgate":x.origem}</span></div>
                                  {x.obs&&<div style={{fontSize:10.5,color:"#3D3226",fontFamily:"'DM Sans',sans-serif",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{x.obs}</div>}
                                </div>
                                <span className="num" style={{fontSize:12,fontWeight:700,color:x.valor<0?"#8B1A1A":"#2D5A10",whiteSpace:"nowrap"}}>{x.valor<0?"−":"+"}{R(Math.abs(x.valor))}</span>
                                {x.onDel?<button onClick={x.onDel} style={{background:"none",border:"none",color:"#aaa",fontSize:15,cursor:"pointer",lineHeight:1,padding:"0 2px"}}>×</button>:<span style={{width:14}}/>}
                              </div>
                            ))}
                            {itens.length>3&&(
                              <button onClick={()=>setCronoAberto(aberto?null:i.id)} style={{width:"100%",marginTop:4,background:"none",border:"none",color:"#1A4A6E",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",padding:"4px 0"}}>{aberto?"▲ Mostrar menos":`▼ Ver todos (${itens.length})`}</button>
                            )}
                            <div style={{display:"flex",justifyContent:"space-between",marginTop:6,paddingTop:6,borderTop:"1px solid rgba(0,0,0,0.08)"}}>
                              <span style={{fontSize:10,fontWeight:700,color:"#1A1209",fontFamily:"'DM Sans',sans-serif"}}>Total investido</span>
                              <span className="num" style={{fontSize:11.5,fontWeight:700,color:"#2D5A10"}}>{R(i.aporte)}</span>
                            </div>
                          </div>
                        );
                      })()}

                      <div style={{display:"flex",gap:7}}>
                        <button onClick={()=>setInvestExpandido(investExpandido===i.id?null:i.id)} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:5,background:"rgba(91,163,212,0.12)",border:"1px solid rgba(91,163,212,0.3)",borderRadius:10,color:"#1A4A6E",fontSize:11.5,fontWeight:700,padding:"8px 10px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>{investExpandido===i.id?"▲ Fechar":<><BarChart3 size={12} strokeWidth={2.2}/>Juros</>}</button>
                        <button onClick={()=>openM("inv",i)} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:5,background:"rgba(0,0,0,0.06)",border:"1px solid rgba(0,0,0,0.12)",borderRadius:10,color:"#1A1209",fontSize:11.5,fontWeight:700,padding:"8px 10px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}><Pencil size={13} strokeWidth={2.2}/>Editar</button>
                        <button onClick={()=>{remove(invests,setInvests,i.id);setInvestIdx(0);}} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:5,background:"rgba(139,26,26,0.1)",border:"1px solid rgba(139,26,26,0.28)",borderRadius:10,color:"#8B1A1A",fontSize:11.5,fontWeight:700,padding:"8px 12px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}><Trash2 size={13} strokeWidth={2.2}/></button>
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
                <div style={{fontSize:11,fontWeight:500,letterSpacing:".08em",textTransform:"uppercase",color:"rgba(26,18,9,0.55)",fontFamily:"'DM Mono',ui-monospace,monospace",marginBottom:4}}><Target size={11} strokeWidth={2.2} style={{marginRight:4,verticalAlign:"-2px"}}/>Objetivos</div>
                <div className="num" style={{fontSize:26,fontWeight:700,color:C.magenta,letterSpacing:"-.02em",lineHeight:1}}>{objetivos.length}</div>
                <div style={{fontSize:10,color:"rgba(26,18,9,0.55)",fontFamily:"'DM Sans',sans-serif",marginTop:3}}>{objetivos.length===1?"meta cadastrada":"metas cadastradas"}</div>
              </div>
              <button onClick={()=>openM("obj")} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,background:"linear-gradient(135deg,#C8235F,#9B1448)",border:"none",borderRadius:12,padding:"10px 16px",fontSize:12.5,fontWeight:700,color:"#fff",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",boxShadow:"0 2px 8px rgba(232,32,95,0.22)"}}>
                <Plus size={15} strokeWidth={2.5} style={{display:"inline-block",verticalAlign:"-2px"}}/> Objetivo
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
                      <div style={{width:34,height:34,borderRadius:10,background:`22`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1,color:o.cor}}><Target size={16} strokeWidth={2}/></div>
                      <div>
                        <div style={{fontSize:14,fontWeight:700,fontFamily:"'DM Sans',sans-serif",color:"#1A1209",display:"flex",alignItems:"center",gap:6}}>{o.nome}<span style={{fontSize:10,color:TMUT}}>{isExp?"▲":"▼"}</span></div>
                      {invVinc&&<div style={{fontSize:10,color:"#2D5A10",fontFamily:"'DM Sans',sans-serif",marginTop:2,fontWeight:600}}><TrendingUp size={10} strokeWidth={2.2} style={{marginRight:3,verticalAlign:"-2px"}}/>{invVinc.nome}{invVinc.banco?" · "+invVinc.banco:""}{invVinc.taxa?" · "+invVinc.taxa+"% a.a.":""}</div>}
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
                      <div style={{fontSize:10,fontWeight:500,color:"rgba(26,18,9,0.5)",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'DM Mono',ui-monospace,monospace",marginBottom:8}}>Onde está esse dinheiro e para quê</div>
                      {partes.length===0&&<div style={{fontSize:11,color:TMUT,fontFamily:"'DM Sans',sans-serif",marginBottom:8}}>Nenhum detalhamento ainda. Adicione abaixo.</div>}
                      {partes.map(p=>{
                        const pInv=p.investId?invests.find(i=>i.id===p.investId):null;
                        return (
                          <div key={p.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"1px solid rgba(0,0,0,0.05)"}}>
                            <div>
                              <div style={{fontSize:12,fontWeight:600,color:"#1A1209",fontFamily:"'DM Sans',sans-serif"}}>{p.descricao}</div>
                              <div style={{fontSize:10,color:pInv?"#2D5A10":TMUT,fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:3}}>{pInv?<><TrendingUp size={10} strokeWidth={2.2}/>{`${pInv.nome}${pInv.banco?" · "+pInv.banco:""}`}</>:"Sem vínculo"}</div>
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
                          <button onClick={()=>addParte(o.id)} style={{background:"#B91D55",border:"none",borderRadius:8,padding:"7px 14px",fontSize:11,fontWeight:700,color:"#fff",cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>+ Adicionar</button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div style={{display:"flex",gap:8}}>
                    <button onClick={()=>openM("aporte",null,o.id)} style={{flex:1.4,display:"flex",alignItems:"center",justifyContent:"center",gap:6,background:"linear-gradient(135deg,rgba(58,120,25,0.95),rgba(33,80,16,0.95))",border:"none",borderRadius:11,color:"#fff",fontSize:12,fontWeight:700,padding:"9px 12px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",boxShadow:"0 3px 10px rgba(45,90,16,0.3)",transition:"transform .12s"}}>
                      <Plus size={14} strokeWidth={2.5} style={{display:"inline-block",verticalAlign:"-2px"}}/> Aporte
                    </button>
                    <button onClick={()=>openM("obj",o)} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:5,background:"rgba(255,255,255,0.9)",border:"1px solid rgba(0,0,0,0.12)",borderRadius:11,color:"#1A1209",fontSize:12,fontWeight:700,padding:"9px 10px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",boxShadow:"0 2px 6px rgba(0,0,0,0.05)"}}>
                      <Pencil size={13} strokeWidth={2.2}/> Editar
                    </button>
                    <button onClick={()=>remove(objetivos,setObjetivos,o.id)} style={{width:42,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(139,26,26,0.1)",border:"1px solid rgba(139,26,26,0.3)",borderRadius:11,color:"#8B1A1A",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                      <Trash2 size={14} strokeWidth={2.2}/>
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
                <div style={{fontSize:11,fontWeight:500,letterSpacing:".08em",textTransform:"uppercase",color:"rgba(26,18,9,0.55)",fontFamily:"'DM Mono',ui-monospace,monospace",marginBottom:4}}><CreditCard size={11} strokeWidth={2.2} style={{marginRight:4,verticalAlign:"-2px"}}/>Dívidas</div>
                <div className="num" style={{fontSize:26,fontWeight:700,color:"#8B1A1A",letterSpacing:"-.02em",lineHeight:1}}>{R(totalDividas)}</div>
                <div style={{fontSize:10,color:"rgba(26,18,9,0.55)",fontFamily:"'DM Sans',sans-serif",marginTop:3}}>em aberto</div>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>openM("div")} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,background:"rgba(0,0,0,0.06)",border:"1px solid rgba(0,0,0,0.12)",borderRadius:12,padding:"10px 14px",fontSize:12,fontWeight:700,color:"#1A1209",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                  <Plus size={14} strokeWidth={2.5} style={{display:"inline-block",verticalAlign:"-2px"}}/> Dívida
                </button>
                <button onClick={()=>setModal("cartaoRenegoc")} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,background:"linear-gradient(135deg,#C8235F,#9B1448)",border:"none",borderRadius:12,padding:"10px 16px",fontSize:12,fontWeight:700,color:"#fff",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",boxShadow:"0 2px 8px rgba(232,32,95,0.22)"}}>
                  <CreditCard size={14} strokeWidth={2.2}/> Cartão Renegociado
                </button>
              </div>
            </div>

            {/* ── Cartão Renegociado (com desconto pontualidade) ── */}
            {dividas.filter(d=>d.tipo==="cartao_desconto").length>0&&(
              <div style={{marginBottom:18}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,padding:"9px 14px",background:"rgba(255,255,255,0.75)",borderRadius:10,boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
                  <CreditCard size={14} strokeWidth={2}/>
                  <span style={{fontSize:12,fontWeight:500,color:"#8B1043",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'DM Mono',ui-monospace,monospace"}}>Cartão Renegociado — desconto por pontualidade</span>
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
                            {diasProxima<0?<><Glyph e="⚠" size={12} style={{marginRight:4}}/>{`Parcela ${proxima.numero} atrasada há ${Math.abs(diasProxima)}d`}</>:diasProxima===0?<><Glyph e="🔔" size={12} style={{marginRight:4}}/>{`Parcela ${proxima.numero} vence hoje!`}</>:`Próxima: parcela ${proxima.numero} em ${diasProxima}d`}
                          </div>
                          <div style={{fontSize:10,color:TMUT,fontFamily:"'DM Sans',sans-serif",marginTop:1}}>Vence {fdFull(proxima.dataVencimento)} · pague até lá pra manter o desconto</div>
                          <button onClick={()=>{setPagarParcelaData(today());setPagarParcelaModal({divId:d.id,parcelaIdx:parcelas.indexOf(proxima)});}} style={{marginTop:6,background:"#C4185A",border:"none",borderRadius:8,color:"#fff",fontSize:11,fontWeight:700,padding:"6px 12px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Marcar parcela {proxima.numero} como paga</button>
                        </div>
                      )}
                      <div style={{background:"rgba(45,90,16,0.08)",border:"1px solid rgba(45,90,16,0.2)",borderRadius:10,padding:"9px 12px",marginBottom:9}}>
                        <div style={{display:"flex",justifyContent:"space-between"}}>
                          <span style={{fontSize:10,fontWeight:700,color:"#215010",fontFamily:"'DM Sans',sans-serif"}}><Wallet size={10} strokeWidth={2.2} style={{marginRight:3,verticalAlign:"-2px"}}/>Economia se pagar tudo em dia</span>
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
                                <button onClick={()=>{setPagarParcelaData(today());setPagarParcelaModal({divId:d.id,parcelaIdx:idx});}} style={{background:"rgba(196,24,90,0.1)",border:"1px solid rgba(196,24,90,0.3)",borderRadius:7,color:"#C4185A",fontSize:10,fontWeight:700,padding:"4px 9px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Marcar paga</button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      <button onClick={()=>remove(dividas,setDividas,d.id)} style={{display:"flex",alignItems:"center",gap:5,background:"rgba(139,26,26,0.1)",border:"1px solid rgba(139,26,26,0.28)",borderRadius:10,color:"#8B1A1A",fontSize:11.5,fontWeight:700,padding:"7px 12px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}><Trash2 size={13} strokeWidth={2.2}/>Excluir</button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── Fundo de Dívidas ── */}
            {dividas.filter(d=>d.tipo==="fundo").length>0&&(
              <div style={{marginBottom:18}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,padding:"9px 14px",background:"rgba(255,255,255,0.75)",borderRadius:10,boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
                  <Landmark size={14} strokeWidth={2}/>
                  <span style={{fontSize:12,fontWeight:500,color:"#8B6000",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'DM Mono',ui-monospace,monospace"}}>Fundo de Dívidas — acumulando para quitar</span>
                </div>
                {dividas.filter(d=>d.tipo==="fundo").map(d=>{
                  const pct=+d.total>0?Math.min(+d.pago/+d.total*100,100):0;
                  const falta=Math.max(+d.total-+d.pago,0);
                  const invVinc=d.investId?invests.find(i=>i.id===d.investId):null;
                  return <div key={d.id} className={CARD} style={{marginBottom:10,borderLeft:"3px solid #FFB347"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                      <div><div style={{fontSize:14,fontWeight:600,fontFamily:"'DM Sans',sans-serif",color:TXT}}>{d.credor}</div>
                        {invVinc&&<div style={{fontSize:10,color:"#2D5A10",fontFamily:"'DM Sans',sans-serif",marginTop:2,fontWeight:600}}><TrendingUp size={10} strokeWidth={2.2} style={{marginRight:3,verticalAlign:"-2px"}}/>{invVinc.nome}{invVinc.banco?" · "+invVinc.banco:""}{invVinc.taxa?" · "+invVinc.taxa+"% a.a.":""}</div>}
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
                    {pct>=100&&<div style={{background:"rgba(143,196,58,0.15)",border:"1px solid rgba(143,196,58,0.4)",borderRadius:8,padding:"8px 12px",fontSize:12,color:"#2D5A10",fontFamily:"'DM Sans',sans-serif",marginBottom:8,fontWeight:600}}><CheckCircle2 size={13} strokeWidth={2.2} style={{marginRight:4,verticalAlign:"-2px"}}/>Pronto para quitar!</div>}
                    <div style={{display:"flex",gap:7}}>
                      <button onClick={()=>openM("div",d)} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:5,background:"rgba(0,0,0,0.06)",border:"1px solid rgba(0,0,0,0.12)",borderRadius:10,color:"#1A1209",fontSize:11.5,fontWeight:700,padding:"8px 10px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}><Pencil size={13} strokeWidth={2.2}/>Editar</button>
                      {pct>=100&&<button onClick={()=>{setDividas(dividas.map(x=>x.id===d.id?{...x,quitada:true}:x));}} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:5,background:"rgba(45,90,16,0.1)",border:"1px solid rgba(45,90,16,0.28)",borderRadius:10,color:"#215010",fontSize:11.5,fontWeight:700,padding:"8px 10px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}><Check size={13} strokeWidth={2.5} style={{marginRight:4}}/>Quitar agora</button>}
                      <button onClick={()=>remove(dividas,setDividas,d.id)} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:5,background:"rgba(139,26,26,0.1)",border:"1px solid rgba(139,26,26,0.28)",borderRadius:10,color:"#8B1A1A",fontSize:11.5,fontWeight:700,padding:"8px 12px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}><Trash2 size={13} strokeWidth={2.2}/></button>
                    </div>
                  </div>;
                })}
              </div>
            )}

            {/* ── Dívidas Ativas ── */}
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,padding:"9px 14px",background:"rgba(255,255,255,0.75)",borderRadius:10,boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
              <CreditCard size={14} strokeWidth={2}/>
              <span style={{fontSize:12,fontWeight:500,color:"#1A1209",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'DM Mono',ui-monospace,monospace"}}>Dívidas Ativas — pagamento mensal</span>
            </div>
            {dividas.filter(d=>!d.tipo||d.tipo==="ativa").length===0
              ?<div className={CARD} style={{textAlign:"center",padding:24,color:TMUT,fontSize:13,fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><CheckCircle2 size={14} strokeWidth={2.2}/>Nenhuma dívida ativa</div>
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
                    <button onClick={()=>openM("pgto",null,d.id)} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:5,background:"rgba(45,90,16,0.1)",border:"1px solid rgba(45,90,16,0.28)",borderRadius:10,color:"#215010",fontSize:11.5,fontWeight:700,padding:"8px 10px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Pagamento</button>
                    <button onClick={()=>openM("div",d)} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:5,background:"rgba(0,0,0,0.06)",border:"1px solid rgba(0,0,0,0.12)",borderRadius:10,color:"#1A1209",fontSize:11.5,fontWeight:700,padding:"8px 10px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}><Pencil size={13} strokeWidth={2.2}/>Editar</button>
                    <button onClick={()=>remove(dividas,setDividas,d.id)} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:5,background:"rgba(139,26,26,0.1)",border:"1px solid rgba(139,26,26,0.28)",borderRadius:10,color:"#8B1A1A",fontSize:11.5,fontWeight:700,padding:"8px 12px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}><Trash2 size={13} strokeWidth={2.2}/></button>
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
                        <div style={{fontSize:10,fontWeight:500,color:"rgba(26,18,9,0.5)",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'DM Mono',ui-monospace,monospace"}}>▭ Cartões</div>
                        <div style={{fontSize:11,color:"rgba(26,18,9,0.45)",fontFamily:"'DM Sans',sans-serif"}}>{idx+1} de {cartoes.length}</div>
                      </div>
                      <button onClick={()=>setCartaoIdx(idx===cartoes.length-1?0:idx+1)} style={{background:"rgba(255,255,255,0.75)",border:"1px solid rgba(0,0,0,0.1)",borderRadius:10,width:36,height:36,cursor:"pointer",fontSize:17,color:"#1A1209",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>›</button>
                    </div>
                    {cartoes.length>1&&(
                      <div style={{display:"flex",gap:5,justifyContent:"center",marginBottom:14,flexWrap:"wrap"}}>
                        {cartoes.map((cd,dotIdx)=>(
                          <button key={cd.id} onClick={()=>setCartaoIdx(dotIdx)} title={cd.nome}
                            style={{width:dotIdx===idx?18:7,height:7,borderRadius:99,border:"none",background:dotIdx===idx?"#B91D55":"rgba(0,0,0,0.18)",cursor:"pointer",transition:"all .2s",padding:0}}/>
                        ))}
                      </div>
                    )}
                    <div className={CARD} style={{background:alerta?"rgba(224,82,82,0.22)":"rgba(255,255,255,0.85)",border:`1px solid ${alerta?C.red+"55":"rgba(0,0,0,0.08)"}`,marginBottom:14}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:11}}>
                        <div><div style={{fontSize:16,fontWeight:700,fontFamily:"'DM Sans',sans-serif",color:TXT}}>{c.nome}</div><div style={{fontSize:10,color:"rgba(26,18,9,0.85)",marginTop:1,fontFamily:"'DM Sans',sans-serif"}}>{c.bandeira&&`${c.bandeira} · `}Fecha dia {c.fechamento} · Vence dia {c.vencimento}</div></div>
                        <div style={{textAlign:"right"}}><div className="num" style={{fontSize:18,fontWeight:700,color:alerta?C.red:TXT}}>{R(usado)}</div><div style={{fontSize:10,color:"rgba(26,18,9,0.85)",fontFamily:"'DM Sans',sans-serif"}}>de {R(+c.limite)}</div></div>
                      </div>
                      <Bar value={usado} max={+c.limite} color={alerta?C.red:C.magenta} h={6}/>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"rgba(26,18,9,0.85)",fontFamily:"'DM Sans',sans-serif",marginTop:4}}><span>{pct.toFixed(0)}%</span>{alerta&&<span style={{color:C.red,fontWeight:700}}><Glyph e="⚠" size={11} style={{marginRight:3}}/>Limite próximo</span>}<span>Disponível: {R(+c.limite-usado)}</span></div>
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
                        <div className="row-head" style={{display:"grid",gridTemplateColumns:"1fr 95px 85px 100px 26px",gap:6,marginBottom:8,padding:"0 4px"}}>
                          <div style={{fontSize:10,fontWeight:500,color:"rgba(26,18,9,0.5)",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'DM Mono',ui-monospace,monospace"}}>Descrição</div>
                          <div style={{fontSize:10,fontWeight:500,color:"rgba(26,18,9,0.5)",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'DM Mono',ui-monospace,monospace"}}>Categoria</div>
                          <div style={{fontSize:10,fontWeight:500,color:"rgba(26,18,9,0.5)",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'DM Mono',ui-monospace,monospace"}}>Data</div>
                          <div style={{fontSize:10,fontWeight:500,color:"rgba(26,18,9,0.5)",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'DM Mono',ui-monospace,monospace",textAlign:"right"}}>Valor</div>
                          <div/>
                        </div>
                        {cc.map((m,rowIdx)=>{
                          const opts=cats?.despesa||DEFAULT_CATS.despesa;
                          return (
                            <div key={m.id} className="row-mov" style={{display:"grid",gridTemplateColumns:"1fr 95px 85px 100px 26px",gap:6,alignItems:"center",padding:"9px 4px",background:rowIdx%2===0?"rgba(0,0,0,0.025)":"transparent",borderRadius:8}}>
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
                  <div style={{fontSize:11,fontWeight:500,letterSpacing:".08em",textTransform:"uppercase",color:"rgba(26,18,9,0.55)",fontFamily:"'DM Mono',ui-monospace,monospace",marginBottom:4}}><Calendar size={11} strokeWidth={2.2} style={{marginRight:4,verticalAlign:"-2px"}}/>Previsão</div>
                  <div style={{fontSize:26,fontWeight:300,fontFamily:"'DM Sans',sans-serif",color:"#1A1209",letterSpacing:"-.01em",lineHeight:1}}>Próximos 8 meses</div>
                  <div style={{fontSize:11,color:"rgba(26,18,9,0.5)",fontFamily:"'DM Sans',sans-serif",marginTop:5}}>Plantões agendados · investimentos · histórico</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:10,fontWeight:500,letterSpacing:".06em",textTransform:"uppercase",color:"rgba(26,18,9,0.45)",fontFamily:"'DM Mono',ui-monospace,monospace",marginBottom:2}}>saldo projetado total</div>
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
                      <div style={{width:11,background:isNow?"linear-gradient(180deg,#4ABE2A,#215010)":"linear-gradient(180deg,#6F956099,#21501099)",borderRadius:"6px 6px 2px 2px",height:`${Math.max(hE,3)}%`,transition:"height .6s ease",boxShadow:isNow?"0 0 10px rgba(45,90,16,0.35)":"none"}}/>
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
                      <div style={{fontSize:17,fontWeight:500,fontFamily:"'DM Sans',sans-serif",color:isNow?"#8B1043":"#1A1209",textTransform:"capitalize"}}>{monthLabel(f.ym)}</div>
                      {isNow&&<span style={{fontSize:9,fontWeight:700,background:"linear-gradient(135deg,#C8235F,#9B1448)",color:"#fff",borderRadius:99,padding:"3px 10px",letterSpacing:".04em",textTransform:"uppercase",boxShadow:"0 2px 6px rgba(232,32,95,0.3)"}}>✦ Atual</span>}
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
                        <div style={{fontSize:9,color:r.c,fontFamily:"'DM Sans',sans-serif",fontWeight:700,letterSpacing:".05em",marginBottom:3,opacity:0.85,display:"flex",alignItems:"center",justifyContent:"center",gap:3}}><Glyph e={r.ic} size={10}/>{r.l}</div>
                        <div className="num" style={{fontSize:12.5,fontWeight:700,color:r.c}}>{R(r.v)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ══ AGENDA ══ */}
        {tab==="agenda"&&(()=>{
          const hojeS=today();
          const accA=STY[palBg.hero.s].acc;
          const DS=["dom","seg","ter","qua","qui","sex","sáb"], DSL=["DOMINGO","SEGUNDA","TERÇA","QUARTA","QUINTA","SEXTA","SÁBADO"];
          const MESES=["JANEIRO","FEVEREIRO","MARÇO","ABRIL","MAIO","JUNHO","JULHO","AGOSTO","SETEMBRO","OUTUBRO","NOVEMBRO","DEZEMBRO"];
          const hd=new Date(hojeS+"T12:00:00");
          const corEmp=nome=>empresas.find(e=>e.nome===nome)?.cor||C.magenta;
          const hSem=horasPorSemana.semanaAtual?.horas||0, media=horasPorSemana.mediaHoras||0;
          const cargaPct=media>0?Math.round(hSem/media*100):(hSem>0?100:0);
          const prox=[...plantoes].filter(p=>p.data&&p.data>=hojeS).sort((a,b)=>(a.data+(a.horaInicio||"99")).localeCompare(b.data+(b.horaInicio||"99")))[0];
          const proxD=prox?new Date(prox.data+"T12:00:00"):null;
          const diasLivres=agendaDias.filter(d=>d.plantoes.length===0&&d.plantoesSemHorario.length===0).length;
          const mono={fontFamily:"'DM Mono',ui-monospace,monospace",fontSize:10,letterSpacing:".12em",textTransform:"uppercase",color:"rgba(29,26,28,.62)"};
          const Gauge=({pct})=>(<div style={{position:"relative",width:6,height:40,borderRadius:99,background:`linear-gradient(180deg,${accA},${mixHex(accA,PANEL,.6)})`,flexShrink:0}}><i style={{position:"absolute",left:-4,right:-4,top:`${Math.max(4,Math.min(96,100-pct))}%`,height:2,background:"#1D1A1C",display:"block"}}/></div>);
          const gm=(()=>{const[y,m]=agMes.split("-").map(Number);const prim=new Date(y,m-1,1);const nd=new Date(y,m,0).getDate();return {y,m,off:prim.getDay(),nd};})();
          const cells=[...Array(gm.off).fill(null),...Array.from({length:gm.nd},(_,i)=>{const ds=`${agMes}-${String(i+1).padStart(2,"0")}`;const ps=plantoes.filter(p=>p.data===ds);return {ds,n:i+1,ps};})];
          const selPs=plantoes.filter(p=>p.data===agSel).sort((a,b)=>(a.horaInicio||"").localeCompare(b.horaInicio||""));
          const selD=new Date(agSel+"T12:00:00");
          const shiftMes=n=>setAgMes(shiftMonth(agMes,n));
          const btn={background:"transparent",border:"1px solid rgba(29,26,28,.18)",borderRadius:999,width:34,height:34,cursor:"pointer",fontSize:15,color:"#1D1A1C",display:"inline-flex",alignItems:"center",justifyContent:"center"};
          return (
          <div className="fade">
            {/* ── Hero: ilustração botânica (mesmo estilo do Início) ── */}
            <div className="ag-wrap" style={{borderRadius:32,overflow:"hidden",marginBottom:16,background:"#FFFCF4",border:"1px solid rgba(35,21,25,.10)"}}>
              <div style={{position:"relative",minHeight:isMobile?330:340,padding:14,background:STY[palBg.hero.s].paper,color:"#2A1E14",display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
                <Motif s={palBg.hero.s} style={{position:"absolute",inset:0,zIndex:0,pointerEvents:"none"}}/>
                <div style={{position:"relative",zIndex:1,display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div className="goal-pill"><span className="ring"><CalendarDays size={14} strokeWidth={1.6}/></span><span style={{fontSize:12.5,lineHeight:1.15}}><span className="mono" style={{fontSize:9.5,letterSpacing:".12em",textTransform:"uppercase",opacity:.7}}>Hoje</span><br/><b style={{fontWeight:600}}>{DS[hd.getDay()]}, {hd.toLocaleDateString("pt-BR")}</b></span></div>
                  <button onClick={()=>openM("plt")} className="arrow-btn" style={{width:"auto",padding:"0 18px",borderRadius:999,fontSize:13,fontWeight:700,gap:6,background:PANEL}}><span style={{fontSize:16,lineHeight:1}}>+</span> Plantão</button>
                </div>
                <div className="goal-panel" style={{position:"relative",zIndex:1,display:"flex",alignItems:"flex-end",justifyContent:"space-between",gap:12,padding:isMobile?"14px 18px 12px":"16px 22px 14px"}}>
                  <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:800,fontSize:isMobile?92:112,lineHeight:.82,letterSpacing:"-.06em",color:accA}}>{hd.getDate()}</div>
                  <div style={{textAlign:"right",fontFamily:"'DM Sans',sans-serif",paddingBottom:4}}>
                    <div style={{fontSize:isMobile?17:20,fontWeight:800,letterSpacing:".02em"}}>{MESES[hd.getMonth()]}</div>
                    <div style={{fontSize:isMobile?17:20,fontWeight:500,color:"#9A8468"}}>{hd.getFullYear()}</div>
                    <div className="mono" style={{fontSize:10,letterSpacing:".14em",marginTop:8,opacity:.7}}>{DSL[hd.getDay()]}</div>
                  </div>
                </div>
              </div>
              <div style={{padding:isMobile?"22px 20px 22px":"26px 30px 28px",color:"#1D1A1C"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:20}}>
                  <span style={mono}>Plantões de hoje</span>
                  <span style={{...mono,marginLeft:"auto"}}>{hd.toLocaleDateString("pt-BR")}</span>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:isMobile?"22px 18px":"26px 40px"}}>
                  <div><div style={mono}>Essa semana</div><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:8,gap:10}}><span style={{fontFamily:"'DM Sans',sans-serif",fontSize:isMobile?30:38,fontWeight:400,letterSpacing:"-.03em"}}>{hSem}<small style={{fontSize:"45%",opacity:.5,marginLeft:3}}>h</small></span><Gauge pct={media>0?Math.min(100,hSem/(media*1.5)*100):(hSem>0?60:5)}/></div></div>
                  <div><div style={mono}>Média · 8 semanas</div><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:8,gap:10}}><span style={{fontFamily:"'DM Sans',sans-serif",fontSize:isMobile?30:38,fontWeight:400,letterSpacing:"-.03em"}}>{media.toFixed(0)}<small style={{fontSize:"45%",opacity:.5,marginLeft:3}}>h</small></span><Gauge pct={50}/></div></div>
                  <div><div style={mono}>Próximo plantão</div><div style={{marginTop:8,fontFamily:"'DM Sans',sans-serif",fontSize:isMobile?19:23,fontWeight:500,letterSpacing:"-.02em",lineHeight:1.15}}>{prox?<>{prox.data===hojeS?"Hoje":DS[proxD.getDay()]+" "+proxD.getDate()}{prox.horaInicio?<span style={{opacity:.55}}> · {prox.horaInicio}</span>:null}<div style={{fontSize:12.5,fontWeight:500,opacity:.6,marginTop:3,display:"flex",alignItems:"center",gap:6}}><i style={{width:8,height:8,borderRadius:99,background:corEmp(prox.empresa),display:"inline-block"}}/>{prox.empresa}</div></>:<span style={{opacity:.5}}>nenhum agendado</span>}</div></div>
                  <div><div style={mono}>Dias livres · {agendaView} dias</div><div style={{marginTop:8,fontFamily:"'DM Sans',sans-serif",fontSize:isMobile?30:38,fontWeight:400,letterSpacing:"-.03em"}}>{diasLivres}<small style={{fontSize:"45%",opacity:.5,marginLeft:3}}>de {agendaView}</small></div></div>
                </div>
                <div style={{...mono,margin:"26px 0 10px"}}>% carga da semana vs média</div>
                <div style={{position:"relative",height:isMobile?54:60,borderRadius:16,background:mixHex(accA,PANEL,.86),overflow:"hidden"}}>
                  <div style={{position:"absolute",left:0,top:0,bottom:0,width:`${Math.min(100,cargaPct)}%`,minWidth:cargaPct>0?60:0,background:`linear-gradient(90deg,${mixHex(accA,PANEL,.55)},${accA})`,borderRadius:16,transition:"width .6s"}}/>
                  <div style={{position:"relative",height:"100%",display:"flex",alignItems:"center",paddingLeft:18,fontFamily:"'DM Sans',sans-serif",fontSize:isMobile?26:30,letterSpacing:"-.03em"}}>{cargaPct}<small style={{fontSize:"48%",opacity:.45,marginLeft:2}}>%</small></div>
                </div>
              </div>
            </div>

            {/* ── Calendário de bolinhas ── */}
            <div className={CARD} style={{marginBottom:16,padding:isMobile?"22px 18px":"28px 30px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:isMobile?18:24,gap:10}}>
                <div style={{fontFamily:"'DM Sans',sans-serif",lineHeight:1.05}}>
                  <div style={{fontSize:isMobile?26:32,fontWeight:800,letterSpacing:"-.03em",color:"#1D1A1C"}}>{MESES[gm.m-1]}</div>
                  <div style={{fontSize:isMobile?26:32,fontWeight:500,letterSpacing:"-.03em",color:"#9A8468"}}>{gm.y}</div>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <button style={btn} onClick={()=>shiftMes(-1)} aria-label="Mês anterior">‹</button>
                  <button style={{...btn,width:"auto",padding:"0 14px",fontSize:11.5,fontWeight:700}} onClick={()=>{setAgMes(hojeS.slice(0,7));setAgSel(hojeS);}}>Hoje</button>
                  <button style={btn} onClick={()=>shiftMes(1)} aria-label="Próximo mês">›</button>
                </div>
              </div>
              <div style={{display:isMobile?"block":"grid",gridTemplateColumns:"minmax(0,520px) minmax(0,1fr)",gap:56,alignItems:"start"}}>
              <div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:isMobile?6:10,marginBottom:10}}>
                {DS.map(d=><div key={d} style={{...mono,fontSize:isMobile?8.5:9.5,textAlign:"center",letterSpacing:".08em"}}>{d}</div>)}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:isMobile?6:10}}>
                {cells.map((c,i)=>{
                  if(!c)return <div key={"e"+i}/>;
                  const passado=c.ds<hojeS, ehHoje=c.ds===hojeS, sel=c.ds===agSel, tem=c.ps.length>0;
                  const cores=[...new Set(c.ps.map(p=>corEmp(p.empresa)))];
                  let bg=passado?"#1D1A1C":"#DDD5C6", fg=passado?"#F3E8CF":"#9A8F7C";
                  if(tem){bg=cores.length>1?`linear-gradient(135deg,${cores[0]} 50%,${cores[1]} 50%)`:cores[0];fg="#fff";}
                  if(ehHoje&&!tem){bg=accA;fg="#fff";}
                  return (
                    <div key={c.ds} style={{position:"relative"}}>
                    {ehHoje&&<svg viewBox="-50 -50 100 100" style={{position:"absolute",left:"-30%",top:"-30%",width:"160%",height:"160%",pointerEvents:"none",overflow:"visible"}} aria-hidden="true">{Array.from({length:10}).map((_,k)=><ellipse key={k} cx="0" cy="-36" rx="9" ry="17" fill={accA} opacity={k%2?.38:.55} transform={`rotate(${k*36})`}/>)}</svg>}
                    <button onClick={()=>setAgSel(c.ds)} title={tem?c.ps.map(p=>p.empresa+(p.horaInicio?" · "+p.horaInicio+"–"+p.horaFim:"")).join("\n"):"Sem plantão"}
                      style={{aspectRatio:"1",width:"100%",borderRadius:"50%",border:"none",background:bg,color:fg,fontFamily:"'DM Sans',sans-serif",fontSize:isMobile?10.5:12.5,fontWeight:600,cursor:"pointer",padding:0,position:"relative",outline:sel?"2px solid #1D1A1C":"none",outlineOffset:3,boxShadow:ehHoje&&tem?"0 0 0 3px "+accA:"none",transition:"transform .15s"}}>
                      {c.n}
                    </button></div>);
                })}
              </div>
              <div style={{display:"flex",gap:16,flexWrap:"wrap",marginTop:20,...mono,fontSize:9.5}}>
                <span style={{display:"flex",alignItems:"center",gap:6}}><i style={{width:9,height:9,borderRadius:99,background:"#1D1A1C",display:"inline-block"}}/>Passou</span>
                <span style={{display:"flex",alignItems:"center",gap:6}}><i style={{width:9,height:9,borderRadius:99,background:accA,display:"inline-block"}}/>Hoje</span>
                <span style={{display:"flex",alignItems:"center",gap:6}}><i style={{width:9,height:9,borderRadius:99,background:"linear-gradient(135deg,#B8643A,#6F7B3C)",display:"inline-block"}}/>Plantão (cor da empresa)</span>
                <span style={{display:"flex",alignItems:"center",gap:6}}><i style={{width:9,height:9,borderRadius:99,background:"#DDD5C6",display:"inline-block"}}/>Livre</span>
              </div>
              </div>
              {/* dia selecionado */}
              <div style={isMobile?{marginTop:22,paddingTop:20,borderTop:"1px solid rgba(29,26,28,.1)"}:{paddingTop:6}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,gap:10}}>
                  <div style={{display:"flex",alignItems:"baseline",gap:10}}>
                    <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:38,fontWeight:800,letterSpacing:"-.05em",color:accA,lineHeight:1}}>{selD.getDate()}</span>
                    <span style={mono}>{DSL[selD.getDay()]} · {MESES[selD.getMonth()].slice(0,3)}</span>
                  </div>
                  <button onClick={()=>{openM("plt");setFPlt(f=>({...f,data:agSel}));}} style={{background:"#1D1A1C",color:"#FBF4E2",border:"none",borderRadius:999,padding:"9px 16px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>+ Plantão neste dia</button>
                </div>
                {selPs.length===0?<div style={{display:"flex",alignItems:"center",gap:16}}><div style={{width:96,height:96,borderRadius:24,overflow:"hidden",flexShrink:0}}>{(agSel.slice(-2)|0)%2?<Motif s="manteiga" z={1.5} x={22} y={0}/>:<Motif s="tulipa" z={1.55} x={0} y={36}/>}</div><div style={{fontSize:13.5,lineHeight:1.4,color:"rgba(29,26,28,.6)",fontFamily:"'DM Sans',sans-serif"}}>Dia livre.<br/>Sem plantões agendados.</div></div>:selPs.map(p=>(
                  <div key={p.id} onClick={()=>openM("plt",p)} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:"1px solid rgba(29,26,28,.07)",cursor:"pointer"}}>
                    <i style={{width:12,height:12,borderRadius:99,background:corEmp(p.empresa),flexShrink:0}}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:14,fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>{p.empresa}</div>
                      <div style={{...mono,marginTop:3,fontSize:9.5}}>{p.horaInicio&&p.horaFim?`${p.horaInicio} – ${p.horaFim}`:"sem horário"}{p.horas?` · ${p.horas}h`:""}</div>
                    </div>
                    <div className="num" style={{fontSize:16}}>{R(+p.valorTotal||0)}</div>
                  </div>))}
              </div>
              </div>
            </div>

            {/* ── Próximos dias: linhas de 24h ── */}
            <div className={CARD} style={{marginBottom:16,padding:isMobile?"22px 18px":"26px 30px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10,marginBottom:18}}>
                <div>
                  <div style={mono}>Linha do tempo</div>
                  <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:isMobile?19:22,fontWeight:700,letterSpacing:"-.02em",marginTop:4}}>{fd(agendaDias[0]?.data)} – {fd(agendaDias[agendaDias.length-1]?.data)}</div>
                </div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <div style={{display:"flex",background:"rgba(29,26,28,.07)",borderRadius:999,padding:3}}>
                    {[["7","7 dias"],["14","14 dias"]].map(([v,l])=><button key={v} onClick={()=>setAgendaView(v)} style={{background:agendaView===v?"#1D1A1C":"transparent",color:agendaView===v?"#FBF4E2":"#1D1A1C",border:"none",borderRadius:999,padding:"7px 13px",fontSize:11.5,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{l}</button>)}
                  </div>
                  <button style={btn} onClick={()=>{const d=new Date(agendaInicio+"T12:00:00");d.setDate(d.getDate()-(+agendaView));setAgendaInicio(d.toISOString().slice(0,10));}}>‹</button>
                  <button style={{...btn,width:"auto",padding:"0 14px",fontSize:11.5,fontWeight:700}} onClick={()=>{const h=new Date(hojeS+"T12:00:00");h.setDate(h.getDate()-h.getDay());setAgendaInicio(h.toISOString().slice(0,10));}}>Hoje</button>
                  <button style={btn} onClick={()=>{const d=new Date(agendaInicio+"T12:00:00");d.setDate(d.getDate()+(+agendaView));setAgendaInicio(d.toISOString().slice(0,10));}}>›</button>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:(isMobile?"46px":"64px")+" 1fr "+(isMobile?"34px":"44px"),gap:isMobile?8:14,alignItems:"center",marginBottom:6}}>
                <span/><div style={{display:"flex",justifyContent:"space-between",...mono,fontSize:8.5}}>{["00","06","12","18","24"].map(h=><span key={h}>{h}</span>)}</div><span/>
              </div>
              {agendaDias.map(dia=>{
                const ehHoje=dia.data===hojeS, hrs=dia.plantoes.reduce((s,p)=>s+(p.fimMin-p.iniMin)/60,0);
                return (
                  <div key={dia.data} onClick={()=>{setAgSel(dia.data);setAgMes(dia.data.slice(0,7));}} style={{display:"grid",gridTemplateColumns:(isMobile?"46px":"64px")+" 1fr "+(isMobile?"34px":"44px"),gap:isMobile?8:14,alignItems:"center",padding:"7px 0",cursor:"pointer"}}>
                    <div style={{display:"flex",alignItems:"baseline",gap:5}}>
                      <b style={{fontFamily:"'DM Sans',sans-serif",fontSize:isMobile?17:20,fontWeight:800,letterSpacing:"-.04em",color:ehHoje?accA:"#1D1A1C"}}>{dia.diaNum}</b>
                      <span style={{...mono,fontSize:9,color:ehHoje?accA:undefined}}>{DS[dia.diaSemana]}</span>
                    </div>
                    <div style={{position:"relative",height:18,borderRadius:99,background:"#E6DFD0",overflow:"hidden"}}>
                      {[25,50,75].map(l=><i key={l} style={{position:"absolute",left:l+"%",top:0,bottom:0,width:1,background:"rgba(29,26,28,.12)"}}/>)}
                      {dia.plantoes.map(p=><i key={p.id} onClick={e=>{e.stopPropagation();openM("plt",p);}} title={`${p.empresa} · ${p.horaInicio}–${p.horaFim}`} style={{position:"absolute",top:2,bottom:2,left:(p.iniMin/1440*100)+"%",width:Math.max((p.fimMin-p.iniMin)/1440*100,2.5)+"%",background:p.cor,borderRadius:99,display:"block"}}/>)}
                      {dia.plantoesSemHorario.length>0&&<span style={{position:"absolute",right:6,top:0,bottom:0,display:"flex",alignItems:"center",gap:3}}>{dia.plantoesSemHorario.map(p=><i key={p.id} title={p.empresa+" (sem horário)"} style={{width:9,height:9,borderRadius:99,background:p.cor,display:"block",border:"1.5px solid #E6DFD0"}}/>)}</span>}
                    </div>
                    <span className="mono" style={{fontSize:11,textAlign:"right",color:"rgba(29,26,28,.6)"}}>{hrs>0?Math.round(hrs)+"h":""}</span>
                  </div>);
              })}
            </div>

            {/* ── Horas por semana: colunas de bolinhas ── */}
            {(()=>{
              const sems=horasPorSemana.semanas;
              const maxH=Math.max(...sems.map(x=>x.horas),1);
              const POR=6, maxDots=Math.max(4,Math.ceil(maxH/POR));
              const idxAtual=sems.findIndex(x=>x.ehAtual);
              const selI=hoveredWeek??idxAtual;
              const sw=sems[selI]||sems[idxAtual];
              const dotSz=isMobile?15:22;
              return (
            <div className={CARD} style={{marginBottom:16,padding:isMobile?"22px 18px":"28px 30px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,marginBottom:22}}>
                <div>
                  <div style={mono}>Horas por semana</div>
                  <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:isMobile?26:32,fontWeight:800,letterSpacing:"-.03em",marginTop:6,lineHeight:1}}>Ritmo de trabalho</div>
                </div>
                <div style={{display:"flex",gap:isMobile?18:34,textAlign:"right"}}>
                  <div><div style={{...mono,whiteSpace:"nowrap"}}>Essa semana</div><div style={{fontFamily:"'DM Sans',sans-serif",fontSize:isMobile?28:36,letterSpacing:"-.04em",marginTop:6,color:accA,fontWeight:700}}>{hSem}<small style={{fontSize:"45%",opacity:.6,marginLeft:2}}>h</small></div></div>
                  <div><div style={{...mono,whiteSpace:"nowrap"}}>Média</div><div style={{fontFamily:"'DM Sans',sans-serif",fontSize:isMobile?28:36,letterSpacing:"-.04em",marginTop:6}}>{media.toFixed(0)}<small style={{fontSize:"45%",opacity:.5,marginLeft:2}}>h</small></div></div>
                </div>
              </div>
              <div style={{display:"flex",gap:isMobile?4:10,alignItems:"flex-end"}}>
                {sems.map((sem,idx)=>{
                  const n=Math.floor(sem.horas/POR), rem=sem.horas/POR-n, ativo=idx===selI;
                  const cor=sem.ehAtual?accA:sem.ehFutura?"transparent":"#1D1A1C";
                  const borda=sem.ehFutura?`1.5px solid ${accA}`:"none";
                  return (
                    <div key={idx} onMouseEnter={()=>setHoveredWeek(idx)} onMouseLeave={()=>setHoveredWeek(null)} onClick={()=>setHoveredWeek(hoveredWeek===idx?null:idx)}
                      style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:isMobile?4:5,cursor:"pointer",minWidth:0}}>
                      <div style={{display:"flex",flexDirection:"column-reverse",gap:isMobile?4:5,height:maxDots*(dotSz+(isMobile?4:5)),justifyContent:"flex-start",alignItems:"center",width:"100%"}}>
                        {Array.from({length:n}).map((_,k)=><i key={k} style={{width:dotSz,height:dotSz,borderRadius:"50%",background:cor,border:borda,display:"block",flexShrink:0,opacity:ativo||selI===idxAtual||hoveredWeek===null?1:.55}}/>)}
                        {rem>.12&&<i style={{width:dotSz,height:dotSz,borderRadius:"50%",background:cor,border:borda,display:"block",flexShrink:0,opacity:.35+.4*rem}}/>}
                        {sem.horas===0&&<i style={{width:dotSz,height:dotSz,borderRadius:"50%",background:"#DDD5C6",display:"block",flexShrink:0}}/>}
                      </div>
                      <span style={{...mono,fontSize:isMobile?8:9,letterSpacing:".04em",marginTop:6,color:ativo?"#1D1A1C":undefined,fontWeight:ativo?700:400}}>{fd(sem.inicio).split(" ")[0]}</span>
                    </div>);
                })}
              </div>
              <div style={{marginTop:20,paddingTop:16,borderTop:"1px solid rgba(29,26,28,.1)",display:"flex",justifyContent:"space-between",alignItems:"baseline",gap:12,flexWrap:"wrap"}}>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:15,fontWeight:600}}>{fd(sw?.inicio)} – {fd(sw?.fim)}</span>
                <span style={mono}>{sw?.horas||0}h {sw?.ehFutura?"agendadas":"trabalhadas"} · {sw?.qtdPlantoes||0} {sw?.qtdPlantoes===1?"plantão":"plantões"}</span>
              </div>
              <div style={{display:"flex",gap:16,flexWrap:"wrap",marginTop:14,...mono,fontSize:9.5}}>
                <span style={{display:"flex",alignItems:"center",gap:6}}><i style={{width:9,height:9,borderRadius:99,background:"#1D1A1C",display:"inline-block"}}/>Trabalhado</span>
                <span style={{display:"flex",alignItems:"center",gap:6}}><i style={{width:9,height:9,borderRadius:99,background:accA,display:"inline-block"}}/>Semana atual</span>
                <span style={{display:"flex",alignItems:"center",gap:6}}><i style={{width:9,height:9,borderRadius:99,border:`1.5px solid ${accA}`,display:"inline-block"}}/>Agendado</span>
                <span style={{marginLeft:"auto"}}>1 bolinha = {POR}h</span>
              </div>
            </div>);
            })()}

            {/* ── Períodos livres ── */}
            <div className={CARD} style={{padding:isMobile?"22px 18px":"28px 30px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:14,marginBottom:20}}>
                <div>
                  <div style={mono}>Meus períodos livres</div>
                  <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:isMobile?26:32,fontWeight:800,letterSpacing:"-.03em",marginTop:6,lineHeight:1}}>Pra pegar mais plantão</div>
                </div>
                <div style={{width:isMobile?64:84,height:isMobile?64:84,borderRadius:22,overflow:"hidden",flexShrink:0}}><Motif s={palBg.tiles[1].s} z={1.6} x={palBg.tiles[1].x} y={palBg.tiles[1].y}/></div>
              </div>
              {agendaDias.map(dia=>{
                const nome=DS[dia.diaSemana];
                const head=(
                  <div style={{display:"flex",alignItems:"baseline",gap:6,minWidth:isMobile?58:78,flexShrink:0}}>
                    <b style={{fontFamily:"'DM Sans',sans-serif",fontSize:isMobile?20:24,fontWeight:800,letterSpacing:"-.04em",color:dia.data===hojeS?accA:"#1D1A1C"}}>{dia.diaNum}</b>
                    <span style={{...mono,fontSize:9.5,color:dia.data===hojeS?accA:undefined}}>{nome}</span>
                  </div>);
                const chip={fontFamily:"'DM Mono',ui-monospace,monospace",fontSize:11.5,letterSpacing:".04em",border:"1px solid rgba(29,26,28,.2)",borderRadius:999,padding:"5px 12px",color:"#1D1A1C",background:"transparent"};
                let corpo;
                if(dia.plantoesSemHorario.length>0) corpo=<span style={{...chip,borderStyle:"dashed",color:"rgba(29,26,28,.55)"}}>plantão sem horário definido</span>;
                else if(dia.plantoes.length===0&&dia.livres.length===1&&dia.livres[0].fim-dia.livres[0].ini>=1439) corpo=<span style={{...chip,background:mixHex(accA,PANEL,.88),borderColor:"transparent",color:accA,fontWeight:600}}>livre o dia todo</span>;
                else if(dia.livres.length===0) corpo=<span style={{...mono,fontSize:10.5}}>sem folga</span>;
                else corpo=dia.livres.map((l,li)=><span key={li} style={chip}>{String(Math.floor(l.ini/60)).padStart(2,"0")}h – {l.fim>=1440?"24h":String(Math.floor(l.fim/60)).padStart(2,"0")+"h"}</span>);
                return (
                  <div key={dia.data} style={{display:"flex",alignItems:"center",gap:isMobile?10:18,padding:"11px 0",borderTop:"1px solid rgba(29,26,28,.08)"}}>
                    {head}
                    <div style={{display:"flex",gap:7,flexWrap:"wrap",alignItems:"center"}}>{corpo}</div>
                  </div>);
              })}
              <div style={{marginTop:6,paddingTop:14,borderTop:"1px solid rgba(29,26,28,.08)",...mono,fontSize:9.5,letterSpacing:".06em",textTransform:"none"}}>
                Só considera plantões com horário de início e fim preenchidos.
              </div>
            </div>
          </div>
          );
        })()}

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
      </div>

      {/* ══ MODAIS ══ */}
      <Modal open={modal==="mov"} onClose={closeM} title="Novo Lançamento">
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{display:"flex",background:"#EDE8E0",borderRadius:12,padding:4,gap:3}}>
            <button onClick={()=>setFMov({...fMov,tipo:"saida",categoria:CATS_OUT[0]})} style={{flex:1,background:fMov.tipo==="saida"?C.magentaDark:"transparent",color:fMov.tipo==="saida"?"#fff":C.modalSub,border:"none",borderRadius:10,padding:"9px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all .15s"}}>▼ Saída</button>
            <button onClick={()=>setFMov({...fMov,tipo:"entrada",categoria:CATS_IN[0]})} style={{flex:1,background:fMov.tipo==="entrada"?"rgba(143,196,58,0.7)":"transparent",color:fMov.tipo==="entrada"?"#fff":C.modalSub,border:"none",borderRadius:10,padding:"9px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all .15s"}}>▲ Entrada</button>
            <button onClick={()=>setFMov({...fMov,tipo:"transferencia",categoria:"🔄 Transferência"})} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:5,background:fMov.tipo==="transferencia"?"rgba(91,163,212,0.7)":"transparent",color:fMov.tipo==="transferencia"?"#fff":C.modalSub,border:"none",borderRadius:10,padding:"9px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all .15s"}}><RefreshCw size={13} strokeWidth={2.2}/>Transfer.</button>
          </div>
          <Inp label="Descrição" placeholder="Ex: Salário, Aluguel..." value={fMov.descricao} onChange={e=>setFMov({...fMov,descricao:e.target.value})}/>
          <G2><Inp label="Valor (R$)" placeholder="0,00" value={fMov.valor} onChange={e=>setFMov({...fMov,valor:e.target.value})}/><Inp label="Data" type="date" value={fMov.data} onChange={e=>setFMov({...fMov,data:e.target.value})}/></G2>
          {fMov.tipo==="transferencia" ? (
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <div style={{background:"rgba(91,163,212,0.1)",border:"1px solid rgba(91,163,212,0.3)",borderRadius:10,padding:"9px 13px",fontSize:12,color:"#1A4A6E",fontFamily:"'DM Sans',sans-serif"}}>
                <RefreshCw size={12} strokeWidth={2.2} style={{marginRight:4,verticalAlign:"-2px"}}/>Transferência — não conta como gasto nem como receita
              </div>
              <div style={{display:"flex",background:"#EDE8E0",borderRadius:12,padding:3,gap:3}}>
                <button onClick={()=>setFMov({...fMov,subtipo:"aporte"})} style={{flex:1,background:fMov.subtipo==="aporte"?"rgba(45,90,16,0.75)":"transparent",color:fMov.subtipo==="aporte"?"#fff":C.modalSub,border:"none",borderRadius:10,padding:"8px",fontSize:11.5,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}><TrendingUp size={12} strokeWidth={2.2} style={{marginRight:4,verticalAlign:"-2px"}}/>Investimento (aporte)</button>
                <button onClick={()=>setFMov({...fMov,subtipo:"resgate"})} style={{flex:1,background:fMov.subtipo==="resgate"?"rgba(196,24,90,0.75)":"transparent",color:fMov.subtipo==="resgate"?"#fff":C.modalSub,border:"none",borderRadius:10,padding:"8px",fontSize:11.5,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}><TrendingDown size={12} strokeWidth={2.2} style={{marginRight:4,verticalAlign:"-2px"}}/>Resgate</button>
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
                  ? (cats?.receita||DEFAULT_CATS.receita).map(c=><option key={c.id} value={`${c.emoji} ${c.nome}`}>{c.nome}</option>)
                  : (cats?.despesa||DEFAULT_CATS.despesa).map(c=>(
                      <optgroup key={c.id} label={c.nome}>
                        <option value={`${c.emoji} ${c.nome}`}>{c.nome}</option>
                        {c.subcats.map(s=><option key={s.id} value={`${c.emoji} ${c.nome} · ${s.nome}`}>{c.nome} · {s.nome}</option>)}
                      </optgroup>
                    ))
                }
              </Sel>
              {fMov.tipo==="saida"&&(
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  <div>
                    <div style={{fontSize:11,fontWeight:600,color:C.modalSub,letterSpacing:".06em",textTransform:"uppercase",marginBottom:5}}>Forma de pagamento</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:4}}>
                      {[["dinheiro",Banknote],["pix",Smartphone],["debito",CreditCard],["cartao",PenLine]].map(([v,Ic])=>(
                        <button key={v} onClick={()=>setFMov({...fMov,formaPagamento:v})} style={{background:fMov.formaPagamento===v?C.magentaDark:"rgba(0,0,0,0.05)",color:fMov.formaPagamento===v?"#fff":C.modalSub,border:"none",borderRadius:9,padding:"8px 2px",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",gap:3}}><Ic size={15} strokeWidth={2}/>{v==="dinheiro"?"Dinheiro":v==="pix"?"Pix":v==="debito"?"Débito":"Cartão"}</button>
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
          <G2>
            <Inp label="Início" type="time" value={fPlt.horaInicio} onChange={e=>{
              const horaInicio=e.target.value;
              let horas=fPlt.horas;
              if(horaInicio&&fPlt.horaFim){
                let diff=(parseInt(fPlt.horaFim.split(":")[0])*60+parseInt(fPlt.horaFim.split(":")[1]))-(parseInt(horaInicio.split(":")[0])*60+parseInt(horaInicio.split(":")[1]));
                if(diff<=0)diff+=24*60;
                horas=(diff/60).toFixed(1).replace(/\.0$/,"");
              }
              setFPlt({...fPlt,horaInicio,horas});
            }}/>
            <Inp label="Fim" type="time" value={fPlt.horaFim} onChange={e=>{
              const horaFim=e.target.value;
              let horas=fPlt.horas;
              if(fPlt.horaInicio&&horaFim){
                let diff=(parseInt(horaFim.split(":")[0])*60+parseInt(horaFim.split(":")[1]))-(parseInt(fPlt.horaInicio.split(":")[0])*60+parseInt(fPlt.horaInicio.split(":")[1]));
                if(diff<=0)diff+=24*60;
                horas=(diff/60).toFixed(1).replace(/\.0$/,"");
              }
              setFPlt({...fPlt,horaFim,horas});
            }}/>
          </G2>
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
              <button key={v} onClick={()=>setFInv({...fInv,taxaModo:v})} style={{flex:1,background:fInv.taxaModo===v?"#B91D55":"transparent",color:fInv.taxaModo===v?"#fff":"#5A4A3A",border:"none",borderRadius:10,padding:"9px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",transition:"all .15s"}}>{l}</button>
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

      <Modal open={modal==="aporteInv"} onClose={closeM} title="Novo Aporte">
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {(()=>{const inv=invests.find(x=>x.id===extra);return <div style={{fontSize:14,color:C.modalSub,fontFamily:"'DM Sans',sans-serif"}}>Investimento: <strong style={{color:C.modalText}}>{inv?.nome}{inv?.banco?` · ${inv.banco}`:""}</strong></div>;})()}
          <Inp label="Valor (R$)" placeholder="0,00" inputMode="decimal" value={fAporteInv.valor} onChange={e=>setFAporteInv({...fAporteInv,valor:e.target.value})} autoFocus/>
          <Inp label="Data do aporte" type="date" value={fAporteInv.data} onChange={e=>setFAporteInv({...fAporteInv,data:e.target.value})}/>
          <Inp label="Observação" placeholder="Opcional" value={fAporteInv.obs} onChange={e=>setFAporteInv({...fAporteInv,obs:e.target.value})}/>
          <div style={{display:"flex",gap:6,background:"rgba(0,0,0,0.06)",borderRadius:12,padding:3}}>
            <button onClick={()=>setFAporteInv({...fAporteInv,descontar:true})} style={{flex:1,background:fAporteInv.descontar?"rgba(45,90,16,0.75)":"transparent",color:fAporteInv.descontar?"#fff":C.modalSub,border:"none",borderRadius:10,padding:"9px 6px",fontSize:11.5,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Tirar do meu saldo</button>
            <button onClick={()=>setFAporteInv({...fAporteInv,descontar:false})} style={{flex:1,background:!fAporteInv.descontar?"rgba(91,163,212,0.7)":"transparent",color:!fAporteInv.descontar?"#fff":C.modalSub,border:"none",borderRadius:10,padding:"9px 6px",fontSize:11.5,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Só registrar</button>
          </div>
          <div style={{fontSize:11,color:C.modalSub,fontFamily:"'DM Sans',sans-serif",lineHeight:1.4}}>{fAporteInv.descontar?"O valor sai do saldo do mês da data escolhida e aparece em Movimentos como transferência.":"Não mexe no saldo — use para aportes antigos ou dinheiro que não estava no app."}</div>
          <Btn variant="green" onClick={saveAporteInv}>Confirmar aporte</Btn>
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
            {[["ativa",CreditCard,"Dívida Ativa"],["fundo",Landmark,"Fundo de Dívida"]].map(([v,Ic,l])=>(
              <button key={v} onClick={()=>setFDiv({...fDiv,tipo:v})} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,background:(fDiv.tipo||"ativa")===v?(v==="fundo"?"rgba(255,179,71,0.8)":"#B91D55"):"transparent",color:(fDiv.tipo||"ativa")===v?"#fff":"#5A4A3A",border:"none",borderRadius:10,padding:"9px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",transition:"all .15s"}}><Ic size={13} strokeWidth={2.2}/>{l}</button>
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

      <Modal open={modal==="pltLote"} onClose={closeM} title={<><Calendar size={16} strokeWidth={2.2} style={{marginRight:6,verticalAlign:"-3px"}}/>Vários Plantões</>}>
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
            <Inp label="Horas por plantão" placeholder="Ex: 12" value={fPltLote.horas} onChange={e=>setFPltLote({...fPltLote,horas:e.target.value})}/>
          </G2>
          <G2>
            <Inp label="Início (opcional)" type="time" value={fPltLote.horaInicio} onChange={e=>{
              const horaInicio=e.target.value;
              let horas=fPltLote.horas;
              if(horaInicio&&fPltLote.horaFim){
                let diff=(parseInt(fPltLote.horaFim.split(":")[0])*60+parseInt(fPltLote.horaFim.split(":")[1]))-(parseInt(horaInicio.split(":")[0])*60+parseInt(horaInicio.split(":")[1]));
                if(diff<=0)diff+=24*60;
                horas=(diff/60).toFixed(1).replace(/\.0$/,"");
              }
              setFPltLote({...fPltLote,horaInicio,horas});
            }}/>
            <Inp label="Fim (opcional)" type="time" value={fPltLote.horaFim} onChange={e=>{
              const horaFim=e.target.value;
              let horas=fPltLote.horas;
              if(fPltLote.horaInicio&&horaFim){
                let diff=(parseInt(horaFim.split(":")[0])*60+parseInt(horaFim.split(":")[1]))-(parseInt(fPltLote.horaInicio.split(":")[0])*60+parseInt(fPltLote.horaInicio.split(":")[1]));
                if(diff<=0)diff+=24*60;
                horas=(diff/60).toFixed(1).replace(/\.0$/,"");
              }
              setFPltLote({...fPltLote,horaFim,horas});
            }}/>
          </G2>
          <Inp label="Data de previsão de pagamento" type="date" value={fPltLote.previsao} onChange={e=>setFPltLote({...fPltLote,previsao:e.target.value})}/>

          <div style={{background:C.inputBg,border:`1.5px solid ${C.inputBorder}`,borderRadius:10,padding:"12px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <button onClick={()=>setFPltLote({...fPltLote,mesLote:shiftMonth(fPltLote.mesLote,-1),diasSelecionados:[]})} style={{background:"rgba(0,0,0,0.06)",border:"none",borderRadius:8,width:28,height:28,cursor:"pointer",fontSize:14,color:C.modalText}}>‹</button>
              <div style={{fontSize:13,fontWeight:700,color:C.modalText,fontFamily:"'DM Sans',sans-serif",textTransform:"capitalize"}}>{monthLabel(fPltLote.mesLote)}</div>
              <button onClick={()=>setFPltLote({...fPltLote,mesLote:shiftMonth(fPltLote.mesLote,1),diasSelecionados:[]})} style={{background:"rgba(0,0,0,0.06)",border:"none",borderRadius:8,width:28,height:28,cursor:"pointer",fontSize:14,color:C.modalText}}>›</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:5,marginBottom:5}}>
              {["D","S","T","Q","Q","S","S"].map((d,i)=>(
                <div key={i} style={{textAlign:"center",fontSize:10,fontWeight:700,color:"rgba(26,18,9,0.4)",fontFamily:"'DM Sans',sans-serif"}}>{d}</div>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:5}}>
              {(()=>{
                const [y,m]=fPltLote.mesLote.split("-").map(Number);
                const numDias=new Date(y,m,0).getDate();
                const primeiroDiaSemana=new Date(y,m-1,1).getDay(); // 0=domingo
                const espacos=Array.from({length:primeiroDiaSemana},(_,i)=><div key={`e${i}`}/>);
                const dias=Array.from({length:numDias},(_,i)=>i+1).map(dia=>{
                  const sel=fPltLote.diasSelecionados.includes(dia);
                  return (
                    <button key={dia} onClick={()=>{
                      const novos=sel?fPltLote.diasSelecionados.filter(d=>d!==dia):[...fPltLote.diasSelecionados,dia];
                      setFPltLote({...fPltLote,diasSelecionados:novos});
                    }} style={{aspectRatio:"1",background:sel?"#B91D55":"rgba(255,255,255,0.7)",color:sel?"#fff":C.modalText,border:`1px solid ${sel?"#B91D55":"rgba(0,0,0,0.1)"}`,borderRadius:8,fontSize:11.5,fontWeight:sel?700:500,cursor:"pointer",fontFamily:"inherit"}}>{dia}</button>
                  );
                });
                return [...espacos,...dias];
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

      <Modal open={modal==="cartaoRenegoc"} onClose={closeM} title={<><CreditCard size={16} strokeWidth={2.2} style={{marginRight:6,verticalAlign:"-3px"}}/>Cartão Renegociado</>}>
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
              <Wallet size={13} strokeWidth={2.2} style={{marginRight:4,verticalAlign:"-2px"}}/>Economia total se pagar tudo em dia: <strong>{R((+String(fCartaoRenegoc.valorSemDesconto).replace(",",".")-(+String(fCartaoRenegoc.valorComDesconto).replace(",",".")))*(+fCartaoRenegoc.numParcelas||0))}</strong>
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
              <Inp label="Data do pagamento" type="date" value={pagarParcelaData} onChange={e=>setPagarParcelaData(e.target.value)}/>
              <div style={{fontSize:11,color:"#5A4A3A",fontFamily:"'DM Sans',sans-serif",lineHeight:1.4,marginTop:-6}}>O valor pago sai do saldo do mês dessa data e aparece em Movimentos.</div>
              <button onClick={()=>marcarParcelaPaga(d.id,pagarParcelaModal.parcelaIdx,true)}
                style={{background:"rgba(45,90,16,0.1)",border:"2px solid rgba(45,90,16,0.35)",borderRadius:12,padding:"14px",textAlign:"left",cursor:"pointer"}}>
                <div style={{fontSize:13,fontWeight:700,color:"#215010",fontFamily:"'DM Sans',sans-serif"}}><Check size={13} strokeWidth={2.5} style={{marginRight:4}}/>Paguei com desconto (em dia)</div>
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

      <ImportacaoModal open={importOpen} onClose={()=>setImportOpen(false)} onImport={importarMovs} cats={cats} movsHistorico={movs}/>

      <SimularCompraModal open={simularOpen} onClose={()=>setSimularOpen(false)} movs={movs} dividas={dividas} objetivos={objetivos} setObjetivos={setObjetivos} mediaSaldoLivre3Meses={mediaSaldoLivre3Meses} categoriaMaiorGasto={categoriaMaiorGasto} navTo={navTo}/>
      <Modal open={!!temDinheiroPergunta} onClose={()=>setTemDinheiroPergunta(null)} title={<><CreditCard size={16} strokeWidth={2.2} style={{marginRight:6,verticalAlign:"-3px"}}/>Compra no cartão</>}>
        {temDinheiroPergunta&&(
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={{fontSize:13,color:"#5A4A3A",fontFamily:"'DM Sans',sans-serif",lineHeight:1.5}}>
              Você registrou <strong style={{color:"#1A1209"}}>{temDinheiroPergunta.descricao}</strong> — {R(temDinheiroPergunta.valorTotal)}.
              <br/>Você já tem esse valor guardado pra pagar a fatura?
            </div>
            <div style={{display:"flex",gap:8}}>
              <Btn variant="green" style={{flex:1}} onClick={()=>setTemDinheiroPergunta(null)}><Check size={14} strokeWidth={2.5} style={{marginRight:4}}/>Sim, já tenho</Btn>
              <Btn variant="danger" style={{flex:1}} onClick={()=>{setPlanoAcaoAberto(temDinheiroPergunta);setTemDinheiroPergunta(null);}}>Ainda não</Btn>
            </div>
          </div>
        )}
      </Modal>
      <Modal open={!!planoAcaoAberto} onClose={()=>setPlanoAcaoAberto(null)} title={<><ClipboardList size={16} strokeWidth={2.2} style={{marginRight:6,verticalAlign:"-3px"}}/>Plano para conseguir pagar</>}>
        {planoAcaoAberto&&(()=>{
          const mesesNecessarios=mediaSaldoLivre3Meses>0?Math.ceil(planoAcaoAberto.valorTotal/mediaSaldoLivre3Meses):null;
          return (
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div style={{background:"rgba(232,32,95,0.08)",border:"1px solid rgba(232,32,95,0.25)",borderRadius:12,padding:"12px 16px",textAlign:"center"}}>
                <div style={{fontSize:11,fontWeight:500,color:"#8B1043",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'DM Mono',ui-monospace,monospace",marginBottom:4}}>{planoAcaoAberto.descricao}</div>
                <div className="num" style={{fontSize:20,fontWeight:700,color:"#8B1043"}}>{R(planoAcaoAberto.valorTotal)}</div>
              </div>

              <div style={{background:"rgba(91,163,212,0.1)",border:"1px solid rgba(91,163,212,0.3)",borderRadius:12,padding:"12px 14px"}}>
                <div style={{fontSize:11,fontWeight:500,color:"#1A4A6E",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'DM Mono',ui-monospace,monospace",marginBottom:6,display:"flex",alignItems:"center",gap:5}}><Timer size={12} strokeWidth={2.2}/>Tempo estimado</div>
                <div style={{fontSize:12,color:"#1A4A6E",fontFamily:"'DM Sans',sans-serif",lineHeight:1.5}}>
                  {mesesNecessarios
                    ? <>Com sua média de <strong>{R(mediaSaldoLivre3Meses)}</strong> livre por mês, levaria cerca de <strong>{mesesNecessarios} {mesesNecessarios===1?"mês":"meses"}</strong> pra juntar esse valor guardando tudo que sobra.</>
                    : <>Seus últimos meses não deixaram sobra pra guardar. Vale reduzir gastos antes de assumir esse compromisso.</>
                  }
                </div>
              </div>

              {categoriaMaiorGasto&&(
                <div style={{background:"rgba(212,168,67,0.15)",border:"1px solid rgba(212,168,67,0.4)",borderRadius:12,padding:"12px 14px"}}>
                  <div style={{fontSize:11,fontWeight:500,color:"#8B6000",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'DM Mono',ui-monospace,monospace",marginBottom:6,display:"flex",alignItems:"center",gap:5}}><Scissors size={12} strokeWidth={2.2}/>Onde cortar</div>
                  <div style={{fontSize:12,color:"#6B4C00",fontFamily:"'DM Sans',sans-serif",lineHeight:1.5}}>
                    Sua maior categoria de gasto esse mês é <strong>{categoriaMaiorGasto.nome}</strong> ({R(categoriaMaiorGasto.valor)}). Reduzir um pouco ali pode liberar dinheiro pra essa compra mais rápido.
                  </div>
                </div>
              )}

              <div style={{background:"rgba(45,90,16,0.08)",border:"1px solid rgba(45,90,16,0.25)",borderRadius:12,padding:"12px 14px"}}>
                <div style={{fontSize:11,fontWeight:500,color:"#215010",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'DM Mono',ui-monospace,monospace",marginBottom:8}}><Target size={11} strokeWidth={2.2} style={{marginRight:4,verticalAlign:"-2px"}}/>Acompanhar como meta</div>
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
            <Btn variant="primary" onClick={()=>{setSaldoMensal({...saldoMensal,[confirmSaldoMes.mes]:+confirmSaldoMes.valor||0});setConfirmSaldoMes(null);}}><Check size={14} strokeWidth={2.5} style={{marginRight:4}}/>Confirmar</Btn>
          </div>
        )}
      </Modal>

      <Modal open={!!confirmandoPlt} onClose={()=>{}} title="🏥 Confirmar plantão">
        {confirmandoPlt&&(()=>{
          const p=plantoes.find(x=>x.id===confirmandoPlt.plantaoId);
          if(!p)return null;
          return (
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div style={{fontSize:13,color:"#5A4A3A",fontFamily:"'DM Sans',sans-serif",lineHeight:1.5}}>
                {filaConfirmacaoPlt.length>1&&<div style={{fontSize:10.5,color:"rgba(90,74,58,0.6)",fontWeight:700,marginBottom:6}}>{filaConfirmacaoPlt.indexOf(confirmandoPlt.plantaoId)+1} de {filaConfirmacaoPlt.length}</div>}
                Você realizou esse plantão?
              </div>
              <div style={{background:"rgba(0,0,0,0.04)",borderRadius:12,padding:"14px 16px"}}>
                <div style={{fontSize:14,fontWeight:700,color:"#1A1209",fontFamily:"'DM Sans',sans-serif"}}>{p.empresa}</div>
                <div style={{fontSize:12,color:"#5A4A3A",fontFamily:"'DM Sans',sans-serif",marginTop:2}}>{fdFull(p.data)}</div>
                <div className="num" style={{fontSize:18,fontWeight:700,color:"#215010",marginTop:6}}>{R(p.valorTotal)}</div>
              </div>

              {!confirmandoPlt.mostrarCobertura ? (
                <div style={{display:"flex",gap:8}}>
                  <Btn variant="green" style={{flex:1}} onClick={()=>confirmarPlantaoRealizado(p.id,true)}>✓ Sim, eu fiz</Btn>
                  <Btn variant="secondary" style={{flex:1,color:"#1A1209",background:"rgba(0,0,0,0.06)",border:"1px solid rgba(0,0,0,0.1)"}} onClick={()=>setConfirmandoPlt({...confirmandoPlt,mostrarCobertura:true})}>✗ Não fiz</Btn>
                </div>
              ) : (
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  <div style={{fontSize:12,color:"#5A4A3A",fontFamily:"'DM Sans',sans-serif"}}>Quem cobriu esse plantão? (opcional)</div>
                  <Inp placeholder="Nome de quem fez no seu lugar" value={confirmandoPlt.coberturaPor||""} onChange={e=>setConfirmandoPlt({...confirmandoPlt,coberturaPor:e.target.value})}/>
                  <div style={{background:"rgba(212,168,67,0.15)",border:"1px solid rgba(212,168,67,0.4)",borderRadius:10,padding:"9px 12px",fontSize:11.5,color:"#6B4C00",fontFamily:"'DM Sans',sans-serif"}}>
                    O valor desse plantão vai ficar zerado nas suas contas, já que quem recebeu não foi você.
                  </div>
                  <Btn variant="danger" onClick={()=>confirmarPlantaoRealizado(p.id,false,confirmandoPlt.coberturaPor)}>Confirmar que não fiz</Btn>
                </div>
              )}
            </div>
          );
        })()}
      </Modal>
      <Modal open={editSaldoMes!==null} onClose={()=>setEditSaldoMes(null)} title="Ajustar saldo inicial">
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{fontSize:13,color:"#5A4A3A",fontFamily:"'DM Sans',sans-serif",lineHeight:1.5}}>
            Corrija o saldo inicial de <strong style={{color:"#1A1209"}}>{monthLabel(selMes)}</strong>. O app vai recalcular o saldo desse mês em diante a partir desse valor.
          </div>
          <Inp label="Saldo inicial deste mês (R$)" type="text" inputMode="decimal" value={editSaldoMes||""}
            onChange={e=>setEditSaldoMes(e.target.value.replace(",","."))}/>
          {editSaldoMes!==null&&(()=>{
            const calc=+saldoFimDoMes(shiftMonth(selMes,-1)).toFixed(2);
            return (
              <div style={{background:"rgba(0,0,0,0.04)",borderRadius:10,padding:"10px 12px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}>
                <div style={{fontSize:11.5,color:"#5A4A3A",fontFamily:"'DM Sans',sans-serif",lineHeight:1.4}}>
                  Calculado pelas movimentações de {monthLabel(shiftMonth(selMes,-1))}: <strong style={{color:"#1A1209"}}>{R(calc)}</strong>
                </div>
                <Btn variant="secondary" style={{fontSize:11,padding:"6px 10px",whiteSpace:"nowrap"}} onClick={()=>setEditSaldoMes(String(calc))}>Usar</Btn>
              </div>
            );
          })()}
          <Btn variant="primary" onClick={()=>{setSaldoMensal({...saldoMensal,[selMes]:+editSaldoMes||0});setEditSaldoMes(null);}}><Check size={14} strokeWidth={2.5} style={{marginRight:4}}/>Salvar ajuste</Btn>
        </div>
      </Modal>
      <Modal open={mortoReportOpen} onClose={()=>setMortoReportOpen(false)} title="Relatório do mês">
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{background:"rgba(139,26,26,0.1)",border:"1px solid rgba(139,26,26,0.3)",borderRadius:12,padding:"14px 16px",textAlign:"center"}}>
            <div style={{fontSize:11,fontWeight:500,color:"#8B1A1A",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'DM Mono',ui-monospace,monospace",marginBottom:4}}>Saldo negativo em {monthLabel(selMes)}</div>
            <div className="num" style={{fontSize:22,fontWeight:700,color:"#8B1A1A"}}>{R(saldo)}</div>
          </div>
          <div>
            <div style={{fontSize:12,fontWeight:700,color:"#1A1209",fontFamily:"'DM Sans',sans-serif",marginBottom:8}}>O que passou do planejado:</div>
            {categoriasEstouradas.length===0?(
              <div style={{fontSize:12,color:"#5A4A3A",fontFamily:"'DM Sans',sans-serif"}}>Nenhuma categoria específica estourou — o saldo negativo veio do total geral de gastos ter passado das entradas do mês.</div>
            ):(
              categoriasEstouradas.map((c,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid rgba(0,0,0,0.06)"}}>
                  <span style={{fontSize:12,color:"#1A1209",fontFamily:"'DM Sans',sans-serif"}}><CatLabel text={c.nome} size={13}/></span>
                  <span className="num" style={{fontSize:12,fontWeight:700,color:"#8B1A1A"}}>+{R(c.excesso)}</span>
                </div>
              ))
            )}
          </div>
          <div style={{background:"rgba(91,163,212,0.1)",border:"1px solid rgba(91,163,212,0.3)",borderRadius:12,padding:"12px 14px"}}>
            <div style={{fontSize:11,fontWeight:500,color:"#1A4A6E",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'DM Mono',ui-monospace,monospace",marginBottom:6}}>Como melhorar</div>
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
          confirmarDistribuicao({...movDist,empresa:movDist.descricao,valorTotal:movDist.valor,id:movDist.id+"_dist",_dataEscolhida:movDist.data},alocs,true);
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
          <Btn variant="green" onClick={confirmarDataRecebimento}><Check size={14} strokeWidth={2.5} style={{marginRight:4}}/>Confirmar recebimento</Btn>
        </div>
      </Modal>
      <RegrasModal open={modal==="regras"} onClose={closeM} regras={regras} setRegras={setRegras} invests={invests} objetivos={objetivos} dividas={dividas}/>
      <AlocacaoModal open={!!pltDist} onClose={()=>setPltDist(null)} plantao={pltDist} regras={regras} invests={invests} objetivos={objetivos} dividas={dividas} onConfirm={(alocs)=>confirmarDistribuicao(pltDist,alocs,false)}/>
      <Modal open={modal==="dashCustom"} onClose={closeM} title="O que mostrar no Início">
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          <div style={{fontSize:12.5,color:C.modalSub,fontFamily:"'DM Sans',sans-serif",marginBottom:4,lineHeight:1.5}}>
            Escolha quais cards você quer ver na aba Início.
          </div>
          {DASH_CARDS.map(dc=>{
            const visivel=dashCards[dc.id]!==false;
            return (
              <button key={dc.id} onClick={()=>setDashCards({...dashCards,[dc.id]:!visivel})}
                style={{display:"flex",alignItems:"center",gap:10,background:visivel?"rgba(232,32,95,0.06)":"rgba(0,0,0,0.04)",border:`1px solid ${visivel?"rgba(232,32,95,0.2)":"rgba(0,0,0,0.1)"}`,borderRadius:10,padding:"10px 12px",cursor:"pointer",textAlign:"left",fontFamily:"inherit"}}>
                {visivel?<Eye size={16} strokeWidth={2.2} color={C.magenta}/>:<EyeOff size={16} strokeWidth={2.2} color="rgba(26,18,9,0.4)"/>}
                <span style={{fontSize:13,fontWeight:600,color:visivel?"#1A1209":"rgba(26,18,9,0.5)",flex:1}}>{dc.label}</span>
              </button>
            );
          })}
          <Btn variant="secondary" style={{marginTop:6}} onClick={()=>setDashCards({})}>Mostrar todos</Btn>
        </div>
      </Modal>
    </div>
  );
}