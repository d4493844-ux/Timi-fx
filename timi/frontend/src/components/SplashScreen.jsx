import { motion } from "framer-motion";

export default function SplashScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.6 }}
      style={{ position:"fixed", inset:0, background:"#020810", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", zIndex:9999 }}
    >
      {/* Outer rings */}
      {[80, 120, 160].map((size, i) => (
        <motion.div key={size} style={{ position:"absolute", width:size*2, height:size*2, borderRadius:"50%", border:`1px solid rgba(0,212,255,${0.15 - i*0.04})` }}
          animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
          transition={{ duration: 8 + i * 4, repeat: Infinity, ease: "linear" }}
        />
      ))}

      {/* Logo image */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "backOut" }}
        style={{ position:"relative", zIndex:2, marginBottom:32 }}
      >
        <motion.div
          animate={{ boxShadow: ["0 0 20px rgba(0,212,255,0.3)", "0 0 60px rgba(0,212,255,0.7)", "0 0 20px rgba(0,212,255,0.3)"] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ width:120, height:120, borderRadius:"50%", overflow:"hidden", border:"3px solid #00d4ff" }}
        >
          <img src="/timi-logo.jpg" alt="TIMI" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
        </motion.div>
      </motion.div>

      {/* Brand name */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{ fontFamily:"'Orbitron',monospace", fontSize:36, fontWeight:900, background:"linear-gradient(135deg,#00d4ff,#00ff9d)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", letterSpacing:8, zIndex:2 }}
      >
        TIMI
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:11, color:"#3a6080", letterSpacing:4, marginTop:8, zIndex:2 }}
      >
        Technical Indicator Market Intelligence
      </motion.div>

      {/* Progress bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        style={{ position:"absolute", bottom:80, width:"60%", zIndex:2 }}
      >
        <div style={{ height:2, background:"#0a2540", borderRadius:2, overflow:"hidden" }}>
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2.5, ease: "easeInOut" }}
            style={{ height:"100%", background:"linear-gradient(90deg,#00d4ff,#00ff9d)", borderRadius:2 }}
          />
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.8, repeat: 3, delay: 0.5 }}
          style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:"#3a6080", textAlign:"center", marginTop:8, letterSpacing:2 }}
        >
          INITIALIZING NEURAL CORE...
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
