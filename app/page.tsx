"use client";

import { useState, useEffect, useCallback } from "react";
import Dashboard from "@/components/Dashboard";
import Header from "@/components/Header";
import Controls from "@/components/Controls";
import axios from "axios";

export interface AnalysisData {
  success: boolean;
  symbol: string;
  interval: string;
  current_status: {
    date: string;
    price: number;
    composite_upper: number;
    composite_mid: number;
    composite_lower: number;
    channel_width_pct: number;
    rsi: number;
    macd: number;
    macd_histogram: number;
    volume_ratio: number;
    composite_score: number;
    signal: number;
    signal_name: string;
  };
  chart_data: any[];
  weights: any;
  data_points: number;
}

export interface BacktestData {
  success: boolean;
  symbol: string;
  results: {
    trades: any[];
    equity_curve: any[];
    metrics: {
      initial_capital: number;
      final_capital: number;
      total_return: number;
      total_trades: number;
      winning_trades: number;
      losing_trades: number;
      win_rate: number;
      profit_factor: number;
      max_drawdown: number;
      avg_win: number;
      avg_loss: number;
      buy_hold_return: number;
      excess_return: number;
    };
  };
}

export default function Home() {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [backtestData, setBacktestData] = useState<BacktestData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Parametreler
  const [symbol, setSymbol] = useState("BTC-USD");
  const [interval, setInterval] = useState("1d");
  const [period, setPeriod] = useState("1y");
  const [weights, setWeights] = useState({
    donchian: 0.20,
    bollinger: 0.20,
    ema: 0.15,
    rsi: 0.15,
    macd: 0.15,
    volume: 0.10,
    fibonacci: 0.05,
  });
  const [strategy, setStrategy] = useState("balanced");
  
  // Analiz fonksiyonu
  const fetchAnalysis = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post("/api/analyze", {
        symbol,
        period,
        interval,
        weights,
        use_adaptive: false,
      });
      
      setAnalysisData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Analiz sırasında hata oluştu");
      console.error("Analysis error:", err);
    } finally {
      setLoading(false);
    }
  }, [symbol, period, interval, weights]);
  
  // Backtest fonksiyonu
  const fetchBacktest = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post("/api/backtest", {
        symbol,
        period,
        interval,
        weights,
        initial_capital: 10000,
        commission: 0.001,
      });
      
      setBacktestData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Backtest sırasında hata oluştu");
      console.error("Backtest error:", err);
    } finally {
      setLoading(false);
    }
  }, [symbol, period, interval, weights]);
  
  // İlk yükleme
  useEffect(() => {
    fetchAnalysis();
  }, []);
  
  // Otomatik 15 dakika güncelleme
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchAnalysis();
    }, 15 * 60 * 1000) as NodeJS.Timeout; // 15 dakika
    
    return () => clearInterval(intervalId);
  }, [fetchAnalysis]);
  
  // Strategi değiştiğinde ağırlıkları güncelle
  useEffect(() => {
    const strategies: Record<string, any> = {
      balanced: {
        donchian: 0.20,
        bollinger: 0.20,
        ema: 0.15,
        rsi: 0.15,
        macd: 0.15,
        volume: 0.10,
        fibonacci: 0.05,
      },
      trend: {
        donchian: 0.30,
        ema: 0.25,
        macd: 0.20,
        bollinger: 0.10,
        rsi: 0.05,
        volume: 0.05,
        fibonacci: 0.05,
      },
      meanReversion: {
        bollinger: 0.35,
        rsi: 0.30,
        fibonacci: 0.15,
        donchian: 0.10,
        ema: 0.05,
        macd: 0.05,
        volume: 0.00,
      },
      momentum: {
        macd: 0.30,
        rsi: 0.25,
        volume: 0.20,
        ema: 0.15,
        donchian: 0.05,
        bollinger: 0.05,
        fibonacci: 0.00,
      },
    };
    
    if (strategies[strategy]) {
      setWeights(strategies[strategy]);
    }
  }, [strategy]);
  
  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <Controls
          symbol={symbol}
          setSymbol={setSymbol}
          interval={interval}
          setInterval={setInterval}
          period={period}
          setPeriod={setPeriod}
          strategy={strategy}
          setStrategy={setStrategy}
          weights={weights}
          setWeights={setWeights}
          onAnalyze={fetchAnalysis}
          onBacktest={fetchBacktest}
          loading={loading}
        />
        
        {error && (
          <div className="mt-6 p-4 bg-red-900/20 border border-red-500 rounded-lg text-red-400">
            ❌ {error}
          </div>
        )}
        
        <Dashboard
          analysisData={analysisData}
          backtestData={backtestData}
          loading={loading}
        />
      </main>
    </div>
  );
}

