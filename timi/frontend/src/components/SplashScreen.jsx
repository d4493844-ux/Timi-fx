import { motion } from "framer-motion";

const styles = {
  wrap: { position:"fixed", inset:0, background:"#020810", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", zIndex:1000 },
  ring: { position:"relative", width:100, height:100, marginBottom:32 },
  logo: { fontFamily:"'Orbitron',monospace", fontSize:42, fontWeight:900, background:"linear-gradient(135deg,#00d4ff,#00ff9d)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", letterSpacing:6 },
  sub: { fontFamily:"'Share Tech Mono',monospace", fontSize:11, color:"#3a6080", letterSpacing:4, marginTop:8 },
  bar: { marginTop:40, width:160, height:2, background:"#0a2540", borderRadius:2, overflow:"hidden" },
  fill: { height:"100%", background:"linear-gradient(90deg,#00d4ff,#00ff9d)", borderRadius:2 },
  status: { fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:"#00d4ff", marginTop:12, letterSpacing:2 }
};

export default function SplashScreen() {
  return (
    <motion.div style={styles.wrap} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
      <motion.div style={styles.ring}
        animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
        <svg viewBox="0 0 100 100" width="100" height="100">
          <circle cx="50" cy="50" r="45" stroke="#00d4ff" strokeWidth="1.5" strokeDasharray="8 5" fill="none" opacity="0.6"/>
          <circle cx="50" cy="50" r="32" stroke="#00ff9d" strokeWidth="0.8" strokeDasharray="4 8" fill="none" opacity="0.4"/>
          <circle cx="50" cy="5" r="4" fill="#00d4ff"/>
          <circle cx="95" cy="50" r="3" fill="#00ff9d"/>
          <circle cx="50" cy="95" r="3" fill="#00d4ff" opacity="0.5"/>
        </svg>
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <motion.div style={{ width:20, height:20, borderRadius:"50%", background:"radial-gradient(circle,#00d4ff,transparent)" }}
            animate={{ scale:[0.8,1.2,0.8], opacity:[0.5,1,0.5] }} transition={{ duration:2, repeat:Infinity }} />
        </div>
      </motion.div>
      <motion.div style={styles.logo} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5 }}>TIMI</motion.div>
      <motion.div style={styles.sub} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.8 }}>INTELLIGENT TRADING SYSTEM</motion.div>
      <motion.div style={styles.bar} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.2 }}>
        <motion.div style={styles.fill} initial={{ width:"0%" }} animate={{ width:"100%" }} transition={{ delay:1.4, duration:1.6, ease:"easeInOut" }} />
      </motion.div>
      <motion.div style={styles.status} initial={{ opacity:0 }} animate={{ opacity:[0,1,0] }} transition={{ delay:1.5, duration:1.2, repeat:2 }}>
        INITIALIZING NEURAL CORE...
      </motion.div>
    </motion.div>
  );
}
