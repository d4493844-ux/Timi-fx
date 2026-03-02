import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error("App crash:", error, info); }
  render() {
    if (this.state.error) return (
      <div style={{ background:"#020810", minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:20 }}>
        <div style={{ fontFamily:"'Orbitron',monospace", fontSize:16, color:"#ff3366", marginBottom:16 }}>TIMI ERROR</div>
        <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:11, color:"#3a6080", textAlign:"center", marginBottom:24, lineHeight:1.7 }}>
          {this.state.error.message}
        </div>
        <button onClick={() => window.location.reload()}
          style={{ padding:"12px 24px", borderRadius:10, border:"none", cursor:"pointer", background:"linear-gradient(90deg,#00d4ff,#00ff9d)", color:"#020810", fontFamily:"'Orbitron',monospace", fontSize:11, fontWeight:700 }}>
          RESTART TIMI
        </button>
      </div>
    );
    return this.props.children;
  }
}
