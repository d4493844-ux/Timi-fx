import { useState } from "react";
import { motion } from "framer-motion";

const SYMS = ["R_75","R_25","R_50","BOOM1000","BOOM500","CRASH1000","CRASH500","frxEURUSD","cryBTCUSD"];
const NAMES = {
  R_75:"VIX 75", R_25:"VIX 25", R_50:"VIX 50", R_100:"VIX 100",
  "1HZ100V":"VIX 100 (1s)", "1HZ75V":"VIX 75 (1s)",
  BOOM1000:"BOOM 1000", BOOM500:"BOOM 500",
  CRASH1000:"CRASH 1000", CRASH500:"CRASH 500",
  frxEURUSD:"EUR/USD", frxGBPUSD:"GBP/USD", frxUSDJPY:"USD/JPY",
  frxGBPJPY:"GBP/JPY", frxEURJPY:"EUR/JPY", frxAUDUSD:"AUD/USD",
  frxUSDCAD:"USD/CAD", frxGBPAUD:"GBP/AUD", frxEURGBP:"EUR/GBP",
  frxAUDJPY:"AUD/JPY", frxNZDUSD:"NZD/USD", frxUSDCHF:"USD/CHF",
  cryBTCUSD:"BTC/USD", cryETHUSD:"ETH/USD",
  frxXAUUSD:"Gold/USD", frxXAGUSD:"Silver/USD",
};

const s = {
  page:{ padding:"20px 20px 100px" },
  title:{ fontFamily:"'Orbitron',monospace", fontSize:18, fontWeight:700, color:"#fff", marginBottom:4 },
  sub:{ fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:"#3a6080", letterSpacing:2, marginBottom:16 },
  manualCard:{ background:"#071525", border:"1px solid rgba(0,212,255,0.2)", borderRadius:14, padding:16, marginBottom:16 },
  manualTitle:{ fontFamily:"'Orbitron',monospace", fontSize:10, color:"#00d4ff", letterSpacing:3, marginBottom:12 },
  symSelect:{ background:"#0a2540", border:"1px solid #1a3550", borderRadius:8, padding:"8px 12px", color:"#fff", fontFamily:"'Share Tech Mono',monospace", fontSize:12, width:"100%", outline:"none", marginBottom:10 },
  stakeRow:{ display:"flex", gap:8, marginBottom:12 },
  stakeInput:{ background:"#0a2540", border:"1px solid #1a3550", borderRadius:8, padding:"8px 12px", color:"#fff", fontFamily:"'Share Tech Mono',monospace", fontSize:12, flex:1, outline:"none" },
  tradeRow:{ display:"flex", gap:8 },
  buyBtn:{ flex:1, padding:"12px", borderRadius:10, border:"none", background:"linear-gradient(135deg,rgba(0,255,157,0.15),rgba(0,255,157,0.05))", border:"1px solid rgba(0,255,157,0.4)", color:"#00ff9d", fontFamily:"'Orbitron',monospace", fontSize:11, fontWeight:700, cursor:"pointer", letterSpacing:1 },
  sellBtn:{ flex:1, padding:"12px", borderRadius:10, border:"1px solid rgba(255,51,102,0.4)", background:"linear-gradient(135deg,rgba(255,51,102,0.15),rgba(255,51,102,0.05))", color:"#ff3366", fontFamily:"'Orbitron',monospace", fontSize:11, fontWeight:700, cursor:"pointer", letterSpacing:1 },
  card:{ background:"#071525", borderRadius:14, padding:"14px 16px", marginBottom:10, border:"1px solid #0a2540", position:"relative", overflow:"hidden" },
  empty:{ textAlign:"center", color:"#3a6080", fontFamily:"'Share Tech Mono',monospace", fontSize:12, marginTop:40 },
  closeBtn:{ fontFamily:"'Share Tech Mono',monospace", fontSize:9, padding:"4px 10px", borderRadius:6, border:"1px solid rgba(255,51,102,0.3)", background:"rgba(255,51,102,0.08)", color:"#ff3366", cursor:"pointer" },
};

export default function Trades({ openTrades=[], manualTrade, closeTrade, closeAllTrades, accounts=[] }) {
  const [selSym, setSelSym] = useState("R_75");
  const [stake, setStake] = useState("");

  return (
    <div style={s.page}>
      <div style={s.title}>Trades</div>
      <div style={s.sub}>// MANUAL CONTROL + LIVE POSITIONS</div>

      {/* MANUAL TRADE */}
      <div style={s.manualCard}>
        <div style={s.manualTitle}>⚡ MANUAL TRADE</div>
        <select style={s.symSelect} value={selSym} onChange={e=>setSelSym(e.target.value)}>
          {SYMS.map(s=><option key={s} value={s}>{NAMES[s]||s}</option>)}
        </select>
        <div style={s.stakeRow}>
          <input style={s.stakeInput} type="number" placeholder="Stake amount (blank = auto)" value={stake} onChange={e=>setStake(e.target.value)}/>
        </div>
        <div style={s.tradeRow}>
          <motion.button style={s.buyBtn} whileTap={{scale:0.97}} onClick={()=>manualTrade(selSym,"BUY",stake?parseFloat(stake):null)}>
            ▲ BUY
          </motion.button>
          <motion.button style={s.sellBtn} whileTap={{scale:0.97}} onClick={()=>manualTrade(selSym,"SELL",stake?parseFloat(stake):null)}>
            ▼ SELL
          </motion.button>
        </div>
        {accounts.length > 1 && (
          <div style={{fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:"#00d4ff", marginTop:8, textAlign:"center"}}>
            Trading on {accounts.filter(a=>a.active).length} active account{accounts.filter(a=>a.active).length!==1?"s":""}
          </div>
        )}
      </div>

      {/* OPEN TRADES */}
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10}}>
        <div style={{fontFamily:"'Orbitron',monospace", fontSize:10, color:"#3a6080", letterSpacing:3}}>LIVE POSITIONS</div>
        {openTrades.length > 0 && (
          <button style={{fontFamily:"'Share Tech Mono',monospace", fontSize:9, padding:"5px 12px", borderRadius:6, border:"1px solid rgba(255,51,102,0.3)", background:"rgba(255,51,102,0.08)", color:"#ff3366", cursor:"pointer"}} onClick={closeAllTrades}>
            🛑 Close All
          </button>
        )}
      </div>

      {openTrades.length===0 && (
        <div style={s.empty}>
          <div style={{fontSize:32, marginBottom:12}}>⏳</div>
          No open trades.<br/>Use manual buttons above or wait for TIMI signal.
        </div>
      )}

      {openTrades.map((t,i)=>{
        const color = t.pnl>=0?"#00ff9d":"#ff3366";
        return (
          <motion.div key={t.id} style={{...s.card, borderLeft:"3px solid "+color}} initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{delay:i*0.08}}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start"}}>
              <div>
                <div style={{fontFamily:"'Orbitron',monospace", fontSize:14, fontWeight:700, color:"#fff"}}>{NAMES[t.symbol]||t.symbol}</div>
                <div style={{fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:t.type==="BUY"?"#00ff9d":"#ff3366", marginTop:2}}>
                  {t.type==="BUY"?"▲":"▼"} {t.type} · ${t.stake}
                  {t.accountName && <span style={{color:"#3a6080"}}> · {t.accountName}</span>}
                </div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:"'Orbitron',monospace", fontSize:15, fontWeight:700, color}}>{t.pnl>=0?"+":""}${t.pnl?.toFixed(2)}</div>
                <button style={{...s.closeBtn, marginTop:4}} onClick={()=>closeTrade(t.contractId)}>Close</button>
              </div>
            </div>
            <div style={{fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:"#3a6080", marginTop:6}}>
              {Math.floor((Date.now()-t.openTime)/60000)}m open · {t.status}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
