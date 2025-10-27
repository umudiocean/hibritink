"use client";

import { motion } from "framer-motion";
import ChartComponent from "./ChartComponent";
import SignalDisplay from "./SignalDisplay";
import BacktestResults from "./BacktestResults";
import MetricsGrid from "./MetricsGrid";
import { AnalysisData, BacktestData } from "@/app/page";

interface DashboardProps {
  analysisData: AnalysisData | null;
  backtestData: BacktestData | null;
  loading: boolean;
}

export default function Dashboard({
  analysisData,
  backtestData,
  loading,
}: DashboardProps) {
  if (loading && !analysisData) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="loading-dots mb-4">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <p className="text-gray-400">Veri yükleniyor...</p>
        </div>
      </div>
    );
  }
  
  if (!analysisData) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-gray-400 text-lg mb-4">
            Analiz Et butonuna tıklayarak başlayın
          </p>
          <p className="text-gray-500 text-sm">
            7 İndikatörü birleştirerek profesyonel sinyal üretimi
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Sinyal Göstergesi */}
      <SignalDisplay status={analysisData.current_status} />
      
      {/* Metrikler */}
      <MetricsGrid status={analysisData.current_status} />
      
      {/* Grafik */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="glass-effect rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {analysisData.symbol}
            </h2>
            <p className="text-sm text-gray-400">
              Kompozit Kanal & İndikatörler
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-3xl font-bold font-mono text-primary">
              ${analysisData.current_status.price.toFixed(2)}
            </div>
            <div className="text-sm text-gray-400">
              {new Date(analysisData.current_status.date).toLocaleString("tr-TR")}
            </div>
          </div>
        </div>
        
        <ChartComponent data={analysisData.chart_data} />
      </motion.div>
      
      {/* Backtest Sonuçları */}
      {backtestData && <BacktestResults data={backtestData} />}
    </motion.div>
  );
}

