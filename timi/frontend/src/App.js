import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Dashboard from "./components/Dashboard";
import Trades from "./components/Trades";
import Signals from "./components/Signals";
import History from "./components/History";
import Settings from "./components/Settings";
import Backtest from "./components/Backtest";
import Growth from "./components/Growth";
import AIBrain from "./components/AIBrain";
import RemoteControl from "./components/RemoteControl";
import BottomNav from "./components/BottomNav";
import SplashScreen from "./components/SplashScreen";
import VoiceButton from "./components/VoiceButton";
import NotificationToast from "./components/NotificationToast";
import useDerivWS from "./hooks/useDerivWS";
import useVoice from "./hooks/useVoice";
import useAI from "./hooks/useAI";
import { requestPushPermission } from "./lib/firebase";
import { supabase } from "./lib/supabase";
import { setupNotificationChannel, requestNotificationPermission } from "./lib/notify";
import "./index.css";

export default function App() {
  const [ready, setReady] = useState(false);
  const [page,  setPage]  = useState("dashboard");

  const ai       = useAI();
  const derivData = useDerivWS({ ai });
  const voice    = useVoice({ derivData });

  useEffect(() => {
    setTimeout(() => setReady(true), 3200);

    const initNotifications = async () => {
      try {
        const { Capacitor } = await import("@capacitor/core");
        
        if (Capacitor.isNativePlatform()) {
          // Wait for Capacitor bridge to be fully ready
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Step 1: Create channel
          await setupNotificationChannel();
          console.log("🔔 Channel created");
          
          // Step 2: Request permission
          await new Promise(resolve => setTimeout(resolve, 1000));
          const granted = await requestNotificationPermission();
          console.log("🔔 Permission:", granted ? "GRANTED" : "DENIED");
          
          // Step 3: Send test notification to confirm it works
          if (granted) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const { sendNotification } = await import("./lib/notify");
            await sendNotification(
              "🤖 TIMI Ready!",
              "Trading bot is active and notifications are working.",
              {}
            );
          }
        } else {
          // Web
          await setupNotificationChannel();
          const granted = await requestNotificationPermission();
          console.log("🌐 Web permission:", granted ? "GRANTED" : "DENIED");
          if (granted) setTimeout(() => requestPushPermission(supabase), 2000);
        }
      } catch(e) {
        console.error("Notification init error:", e);
      }
    };

    // Wait for splash then init notifications
    setTimeout(initNotifications, 3500);
  }, []);

  const pages = {
    dashboard: Dashboard,
    trades:    Trades,
    signals:   Signals,
    history:   History,
    settings:  Settings,
    backtest:  Backtest,
    growth:    Growth,
    ai:        AIBrain,
    remote:    RemoteControl,
  };

  const PageComponent = pages[page] || Dashboard;

  if (!ready) return <SplashScreen />;

  return (
    <div style={{ background: "#020810", minHeight: "100vh" }}>
      <NotificationToast />
      <AnimatePresence mode="wait">
        <motion.div
          key={page}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.18 }}
        >
          <PageComponent {...derivData} {...ai} />
        </motion.div>
      </AnimatePresence>
      <VoiceButton {...voice} />
      <BottomNav page={page} setPage={setPage} />
    </div>
  );
}
