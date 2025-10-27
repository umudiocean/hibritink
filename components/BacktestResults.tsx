"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  DollarSign,
  Target,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { BacktestData } from "@/app/page";

interface BacktestResultsProps {
  data: BacktestData;
}

export default function BacktestResults({ data }: BacktestResultsProps) {
  if (!data.success || !data.results) {
    return (
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass-effect rounded-2xl p-6"
      >
        <p className="text-center text-gray-400">
          Backtest sonuçları yüklenemedi veya hiç işlem yapılmadı
        </p>
      </motion.div>
    );
  }
  
  const { metrics, equity_curve, trades } = data.results;
  
  // Equity curve formatla
  const equityData = equity_curve.map((item) => ({
    date: new Date(item.date).toLocaleDateString("tr-TR", {
      month: "short",
      day: "numeric",
    }),
    equity: item.equity,
    position: item.position,
  }));
  
  const statCards = [
    {
      icon: <DollarSign className="w-6 h-6" />,
      label: "Final Sermaye",
      value: `$${metrics.final_capital.toFixed(2)}`,
      change: metrics.total_return,
      color: metrics.total_return >= 0 ? "text-green-400" : "text-red-400",
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      label: "Toplam Getiri",
      value: `${metrics.total_return.toFixed(2)}%`,
      change: metrics.excess_return,
      color: metrics.total_return >= 0 ? "text-green-400" : "text-red-400",
    },
    {
      icon: <Target className="w-6 h-6" />,
      label: "Kazanma Oranı",
      value: `${metrics.win_rate.toFixed(1)}%`,
      change: null,
      color: metrics.win_rate >= 50 ? "text-green-400" : "text-orange-400",
    },
    {
      icon: <Activity className="w-6 h-6" />,
      label: "Profit Factor",
      value: metrics.profit_factor.toFixed(2),
      change: null,
      color:
        metrics.profit_factor >= 2
          ? "text-green-400"
          : metrics.profit_factor >= 1
          ? "text-primary"
          : "text-red-400",
    },
    {
      icon: <AlertTriangle className="w-6 h-6" />,
      label: "Max Drawdown",
      value: `${metrics.max_drawdown.toFixed(2)}%`,
      change: null,
      color:
        Math.abs(metrics.max_drawdown) < 10
          ? "text-green-400"
          : Math.abs(metrics.max_drawdown) < 20
          ? "text-primary"
          : "text-red-400",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      label: "Toplam İşlem",
      value: metrics.total_trades,
      change: null,
      color: "text-primary",
    },
  ];
  
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="glass-effect rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Backtest Sonuçları</h2>
          <p className="text-sm text-gray-400">
            Başlangıç: ${metrics.initial_capital.toFixed(2)} • Final: $
            {metrics.final_capital.toFixed(2)}
          </p>
        </div>
        
        <div className="text-right">
          <div
            className={`text-3xl font-bold font-mono ${
              metrics.total_return >= 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            {metrics.total_return >= 0 ? "+" : ""}
            {metrics.total_return.toFixed(2)}%
          </div>
          <div className="text-sm text-gray-400">
            vs Buy & Hold: {metrics.excess_return >= 0 ? "+" : ""}
            {metrics.excess_return.toFixed(2)}%
          </div>
        </div>
      </div>
      
      {/* Metrik Kartları */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 * index }}
            className="bg-dark-300 rounded-lg p-4"
          >
            <div className={`${stat.color} mb-2`}>{stat.icon}</div>
            <div className={`text-2xl font-bold font-mono mb-1 ${stat.color}`}>
              {stat.value}
            </div>
            <div className="text-xs text-gray-400">{stat.label}</div>
            {stat.change !== null && (
              <div
                className={`text-xs mt-1 ${
                  stat.change >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {stat.change >= 0 ? "+" : ""}
                {stat.change.toFixed(2)}%
              </div>
            )}
          </motion.div>
        ))}
      </div>
      
      {/* Equity Curve */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">Equity Curve</h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={equityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#282828" />
              <XAxis
                dataKey="date"
                stroke="#666"
                style={{ fontSize: "12px", fontFamily: "JetBrains Mono" }}
              />
              <YAxis
                stroke="#666"
                style={{ fontSize: "12px", fontFamily: "JetBrains Mono" }}
              />
              <Tooltip
                contentStyle={{
                  background: "#141414",
                  border: "1px solid #282828",
                  borderRadius: "8px",
                  fontFamily: "JetBrains Mono",
                }}
              />
              <Line
                type="monotone"
                dataKey="equity"
                stroke="#62cbc1"
                strokeWidth={3}
                dot={false}
                name="Sermaye"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* İşlem Detayları */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">
            İşlem Geçmişi ({trades.length})
          </h3>
          
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-gray-400">
                {metrics.winning_trades} Kazanan
              </span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-400" />
              <span className="text-gray-400">{metrics.losing_trades} Kaybeden</span>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-400">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Tip</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">
                  Giriş
                </th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">
                  Çıkış
                </th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">
                  Giriş Fiyat
                </th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">
                  Çıkış Fiyat
                </th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">
                  Getiri %
                </th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">
                  P&L
                </th>
              </tr>
            </thead>
            <tbody>
              {trades.slice(-10).reverse().map((trade, index) => (
                <tr
                  key={index}
                  className="border-b border-dark-500 hover:bg-dark-300 transition-colors"
                >
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-mono ${
                        trade.type === "LONG"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {trade.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-400 font-mono text-xs">
                    {new Date(trade.entry_date).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="py-3 px-4 text-gray-400 font-mono text-xs">
                    {new Date(trade.exit_date).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-white">
                    ${trade.entry_price.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-white">
                    ${trade.exit_price.toFixed(2)}
                  </td>
                  <td
                    className={`py-3 px-4 text-right font-mono font-bold ${
                      trade.return_pct >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {trade.return_pct >= 0 ? "+" : ""}
                    {trade.return_pct.toFixed(2)}%
                  </td>
                  <td
                    className={`py-3 px-4 text-right font-mono font-bold ${
                      trade.pnl >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {trades.length > 10 && (
          <p className="text-center text-sm text-gray-500 mt-4">
            Son 10 işlem gösteriliyor (Toplam: {trades.length})
          </p>
        )}
      </div>
    </motion.div>
  );
}

