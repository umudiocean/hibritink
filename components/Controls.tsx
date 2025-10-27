"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  RefreshCw,
  TrendingUp,
  Settings,
  Activity,
  ChevronDown,
} from "lucide-react";
import axios from "axios";

interface ControlsProps {
  symbol: string;
  setSymbol: (symbol: string) => void;
  interval: string;
  setInterval: (interval: string) => void;
  period: string;
  setPeriod: (period: string) => void;
  strategy: string;
  setStrategy: (strategy: string) => void;
  weights: any;
  setWeights: (weights: any) => void;
  onAnalyze: () => void;
  onBacktest: () => void;
  loading: boolean;
}

export default function Controls({
  symbol,
  setSymbol,
  interval,
  setInterval,
  period,
  setPeriod,
  strategy,
  setStrategy,
  weights,
  setWeights,
  onAnalyze,
  onBacktest,
  loading,
}: ControlsProps) {
  const [symbols, setSymbols] = useState<any[]>([]);
  const [showWeights, setShowWeights] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Sembolleri yükle
  useEffect(() => {
    axios.get("/api/symbols").then((res) => {
      if (res.data.success) {
        setSymbols(res.data.symbols);
      }
    });
  }, []);
  
  const intervals = [
    { value: "15m", label: "15 Dakika" },
    { value: "1h", label: "1 Saat" },
    { value: "4h", label: "4 Saat" },
    { value: "1d", label: "Günlük" },
    { value: "1wk", label: "Haftalık" },
  ];
  
  const periods = [
    { value: "1mo", label: "1 Ay" },
    { value: "3mo", label: "3 Ay" },
    { value: "6mo", label: "6 Ay" },
    { value: "1y", label: "1 Yıl" },
    { value: "2y", label: "2 Yıl" },
  ];
  
  const strategies = [
    { value: "balanced", label: "Dengeli", icon: "⚖️" },
    { value: "trend", label: "Trend Takip", icon: "📈" },
    { value: "meanReversion", label: "Mean Reversion", icon: "🔄" },
    { value: "momentum", label: "Momentum", icon: "🚀" },
  ];
  
  const filteredSymbols = symbols.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="glass-effect rounded-2xl p-6 mb-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Sembol Seçici */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Sembol
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchTerm || symbol}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ara veya seç..."
              className="w-full bg-dark-300 border border-dark-400 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-primary transition-colors"
            />
            {searchTerm && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-dark-200 border border-dark-400 rounded-lg max-h-60 overflow-y-auto z-50">
                {filteredSymbols.map((s) => (
                  <button
                    key={s.symbol}
                    onClick={() => {
                      setSymbol(s.symbol);
                      setSearchTerm("");
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-dark-300 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="font-mono text-white">{s.symbol}</div>
                      <div className="text-sm text-gray-400">{s.name}</div>
                    </div>
                    <span className="text-xs text-primary">{s.category}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Zaman Dilimi */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Zaman Dilimi
          </label>
          <select
            value={interval}
            onChange={(e) => setInterval(e.target.value)}
            className="w-full bg-dark-300 border border-dark-400 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
          >
            {intervals.map((i) => (
              <option key={i.value} value={i.value}>
                {i.label}
              </option>
            ))}
          </select>
        </div>
        
        {/* Periyot */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Periyot
          </label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="w-full bg-dark-300 border border-dark-400 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
          >
            {periods.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        
        {/* Strategi */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Strategi
          </label>
          <select
            value={strategy}
            onChange={(e) => setStrategy(e.target.value)}
            className="w-full bg-dark-300 border border-dark-400 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
          >
            {strategies.map((s) => (
              <option key={s.value} value={s.value}>
                {s.icon} {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Ağırlık Ayarları */}
      <motion.div
        initial={false}
        animate={{ height: showWeights ? "auto" : 0 }}
        className="overflow-hidden"
      >
        <div className="border-t border-dark-400 pt-6 mb-6">
          <h3 className="text-sm font-medium text-gray-400 mb-4">
            İndikatör Ağırlıkları (Toplam: {Object.values(weights).reduce((a: number, b: any) => a + b, 0).toFixed(2)})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {Object.keys(weights).map((key) => (
              <div key={key}>
                <label className="block text-xs text-gray-400 mb-2 capitalize">
                  {key}
                </label>
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.05"
                  value={weights[key]}
                  onChange={(e) =>
                    setWeights({ ...weights, [key]: parseFloat(e.target.value) })
                  }
                  className="w-full bg-dark-300 border border-dark-400 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-primary"
                />
                <div className="mt-2 h-2 bg-dark-400 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-gold transition-all"
                    style={{ width: `${weights[key] * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
      
      {/* Butonlar */}
      <div className="flex flex-wrap gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAnalyze}
          disabled={loading}
          className="btn-primary flex items-center gap-2"
        >
          {loading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Yükleniyor...
            </>
          ) : (
            <>
              <Activity className="w-5 h-5" />
              Analiz Et
            </>
          )}
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBacktest}
          disabled={loading}
          className="btn-secondary flex items-center gap-2"
        >
          <TrendingUp className="w-5 h-5" />
          Backtest Yap
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowWeights(!showWeights)}
          className="btn-secondary flex items-center gap-2"
        >
          <Settings className="w-5 h-5" />
          Ağırlıkları {showWeights ? "Gizle" : "Göster"}
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              showWeights ? "rotate-180" : ""
            }`}
          />
        </motion.button>
      </div>
    </motion.div>
  );
}

