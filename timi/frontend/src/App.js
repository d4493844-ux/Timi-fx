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
import BottomNav from "./components/BottomNav";
import SplashScreen from "./components/SplashScreen";
import VoiceButton from "./components/VoiceButton";
import NotificationToast from "./components/NotificationToast";
import useDerivWS from "./hooks/useDerivWS";
import useVoice from "./hooks/useVoice";
import useAI from "./hooks/useAI";
import "./index.css";

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [ready, setReady] = useState(false);

  const ai = useAI();
  const derivData = useDerivWS({ ai });
  const voice = useVoice({
    balance: derivData.balance,
    signals: derivData.signals,
    autoTrade: derivData.autoTrade,
    setAutoTrade: derivData.setAutoTrade,
    manualTrade: derivData.manualTrade,
    closeAllTrades: derivData.closeAllTrades,
  });

  useEffect(() => { setTimeout(() => setReady(true), 3200); }, []);

  const pages = {
    dashboard: Dashboard, trades: Trades, signals: Signals,
    history: History, settings: Settings, backtest: Backtest,
    growth: Growth, ai: AIBrain,
  };
  const PageComponent = pages[page] || Dashboard;

  return (
    <>
      <AnimatePresence>{!ready && <SplashScreen />}</AnimatePresence>
      {ready && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <PageComponent {...derivData} {...ai} />
          <NotificationToast />
          <VoiceButton {...voice} />
          <BottomNav page={page} setPage={setPage} />
        </motion.div>
      )}
    </>
  );
}
