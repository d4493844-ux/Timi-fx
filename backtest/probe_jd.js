const WebSocket=require("ws");
const ws=new WebSocket("wss://ws.derivws.com/websockets/v3?app_id=1089");
const to=setTimeout(()=>{console.log("timeout");ws.close();process.exit(0);},20000);
ws.on("open",()=>ws.send(JSON.stringify({active_symbols:"brief",product_type:"basic"})));
ws.on("message",(d)=>{
  const m=JSON.parse(d);
  if(m.active_symbols){
    clearTimeout(to);
    const jumps=m.active_symbols.filter(s=>
      /jump|JD/i.test(s.symbol)||/jump/i.test(s.display_name));
    console.log("=== ALL JUMP-type symbols Deriv offers ===");
    for(const s of jumps) console.log(`  ${s.symbol.padEnd(12)} ${s.display_name}`);
    console.log("\n=== also: any symbol with 'JD' or 'Jump' we might've missed ===");
    const all=m.active_symbols.filter(s=>s.symbol.startsWith("JD")||/jump/i.test(s.display_name));
    console.log("count:",all.length);
    ws.close();process.exit(0);
  }
  if(m.error){console.log("error:",m.error.message);ws.close();process.exit(0);}
});
ws.on("error",(e)=>{console.log("ws error",e.message);process.exit(0);});
