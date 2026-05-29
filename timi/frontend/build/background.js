// TIMI Background Service - runs even when app is closed
addEventListener("timiBackground", async (resolve, reject, args) => {
  try {
    // Connect to Deriv WebSocket
    const ws = new WebSocket("wss://ws.binaryws.com/websockets/v3?app_id=1089");
    const token = args.token || "03WRbkfQGjbZWTH";

    ws.onopen = () => ws.send(JSON.stringify({ authorize: token }));

    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data);

      if (data.msg_type === "authorize" && !data.error) {
        // Subscribe to balance
        ws.send(JSON.stringify({ balance: 1, account: "current" }));
        // Get signals for active symbols
        const symbols = args.symbols || ["R_75", "R_25", "BOOM1000", "CRASH1000"];
        symbols.forEach(sym => {
          ws.send(JSON.stringify({
            ticks_history: sym, adjust_start_time: 1,
            count: 50, end: "latest", granularity: 60, style: "candles"
          }));
        });
      }

      if (data.msg_type === "candles" && data.candles) {
        const sym = data.echo_req?.ticks_history;
        const closes = data.candles.map(c => parseFloat(c.close));

        // Quick EMA signal check
        const ema9 = closes.slice(-9).reduce((a, b) => a + b) / 9;
        const ema21 = closes.slice(-21).reduce((a, b) => a + b) / 21;

        if (Math.abs(ema9 - ema21) / ema21 > 0.001) {
          const action = ema9 > ema21 ? "BUY" : "SELL";
          // Send notification
          await CapacitorNotifications.schedule({
            notifications: [{
              title: `🤖 TIMI Signal: ${action} ${sym}`,
              body: `EMA crossover detected. Open TIMI to trade.`,
              id: Math.floor(Math.random() * 1000),
              schedule: { at: new Date() },
              sound: "beep",
              actionTypeId: "OPEN_APP",
              extra: { sym, action }
            }]
          });
        }
        ws.close();
        resolve();
      }
    };

    ws.onerror = () => reject("WebSocket error");
    setTimeout(() => { ws.close(); resolve(); }, 10000);
  } catch(e) {
    reject(e.toString());
  }
});
