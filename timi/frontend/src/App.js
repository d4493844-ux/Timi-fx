import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Dashboard from "./components/Dashboard";
import Trades from "./components/Trades";
import Signals from "./components/Signals";
import History from "./components/History";
import Settings from "./components/Settings";
import BottomNav from "./components/BottomNav";
import SplashScreen from "./components/SplashScreen";
import useDerivWS from "./hooks/useDerivWS";
import "./index.css";

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [ready, setReady] = useState(false);
  const derivData = useDerivWS();

  useEffect(() => { setTimeout(() => setReady(true), 3200); }, []);

  const pages = {
    dashboard: Dashboard,
    trades: Trades,
    signals: Signals,
    history: History,
    settings: Settings
  };
  const PageComponent = pages[page];

  return (
    <>
      <AnimatePresence>{!ready && <SplashScreen />}</AnimatePresence>
      {ready && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <PageComponent {...derivData} />
          <BottomNav page={page} setPage={setPage} />
        </motion.div>
      )}
    </>
  );
}
