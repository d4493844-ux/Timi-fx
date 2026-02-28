import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Dashboard from "./components/Dashboard";
import Trades from "./components/Trades";
import Signals from "./components/Signals";
import History from "./components/History";
import Settings from "./components/Settings";
import Backtest from "./components/Backtest";
import Growth from "./components/Growth";
import BottomNav from "./components/BottomNav";
import SplashScreen from "./components/SplashScreen";
import VoiceButton from "./components/VoiceButton";
import useDerivWS from "./hooks/useDerivWS";
import useVoice from "./hooks/useVoice";
import "./index.css";

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [ready, setReady] = useState(false);
  const derivData = useDerivWS();
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
    history: History, settings: Settings, backtest: Backtest, growth: Growth
  };
  const PageComponent = pages[page] || Dashboard;

  return (
    <>
      <AnimatePresence>{!ready && <SplashScreen />}</AnimatePresence>
      {ready && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <PageComponent {...derivData} />
          <VoiceButton {...voice} />
          <BottomNav page={page} setPage={setPage} />
        </motion.div>
      )}
    </>
  );
}
