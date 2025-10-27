"use client";

import { motion } from "framer-motion";
import {
  Activity,
  TrendingUp,
  BarChart3,
  Percent,
  Target,
  Gauge,
} from "lucide-react";

interface MetricsGridProps {
  status: {
    rsi: number;
    macd: number;
    macd_histogram: number;
    volume_ratio: number;
    channel_width_pct: number;
    composite_score: number;
  };
}

export default function MetricsGrid({ status }: MetricsGridProps) {
  const metrics = [
    {
      label: "RSI (14)",
      value: status.rsi.toFixed(2),
      icon: <Gauge className="w-5 h-5" />,
      color:
        status.rsi > 70
          ? "text-red-400"
          : status.rsi < 30
          ? "text-green-400"
          : "text-primary",
      status:
        status.rsi > 70
          ? "Aşırı Alım"
          : status.rsi < 30
          ? "Aşırı Satım"
          : "Nötr",
    },
    {
      label: "MACD",
      value: status.macd.toFixed(4),
      icon: <TrendingUp className="w-5 h-5" />,
      color: status.macd > 0 ? "text-green-400" : "text-red-400",
      status: status.macd > 0 ? "Pozitif" : "Negatif",
    },
    {
      label: "MACD Histogram",
      value: status.macd_histogram.toFixed(4),
      icon: <BarChart3 className="w-5 h-5" />,
      color: status.macd_histogram > 0 ? "text-green-400" : "text-red-400",
      status: status.macd_histogram > 0 ? "Yükseliş" : "Düşüş",
    },
    {
      label: "Volume Ratio",
      value: `${status.volume_ratio.toFixed(2)}x`,
      icon: <Activity className="w-5 h-5" />,
      color:
        status.volume_ratio > 1.5
          ? "text-primary"
          : status.volume_ratio < 0.5
          ? "text-orange-400"
          : "text-gray-400",
      status:
        status.volume_ratio > 1.5
          ? "Yüksek"
          : status.volume_ratio < 0.5
          ? "Düşük"
          : "Normal",
    },
    {
      label: "Kanal Genişliği",
      value: `${status.channel_width_pct.toFixed(2)}%`,
      icon: <Target className="w-5 h-5" />,
      color: "text-primary",
      status: status.channel_width_pct > 10 ? "Geniş" : "Dar",
    },
    {
      label: "Kompozit Skor",
      value: `${status.composite_score} / 7`,
      icon: <Percent className="w-5 h-5" />,
      color:
        status.composite_score >= 4
          ? "text-green-400"
          : status.composite_score <= -4
          ? "text-red-400"
          : "text-gray-400",
      status:
        status.composite_score >= 4
          ? "Güçlü Alım"
          : status.composite_score <= -4
          ? "Güçlü Satım"
          : "Nötr",
    },
  ];
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.label}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -4 }}
          className="metric-card"
        >
          <div className="flex items-start justify-between mb-3">
            <div className={`${metric.color}`}>{metric.icon}</div>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                metric.status === "Aşırı Alım" || metric.status === "Güçlü Satım"
                  ? "bg-red-500/20 text-red-400"
                  : metric.status === "Aşırı Satım" || metric.status === "Güçlü Alım"
                  ? "bg-green-500/20 text-green-400"
                  : "bg-primary/20 text-primary"
              }`}
            >
              {metric.status}
            </span>
          </div>
          
          <div className="text-2xl font-bold font-mono mb-1 text-white">
            {metric.value}
          </div>
          
          <div className="text-xs text-gray-400">{metric.label}</div>
        </motion.div>
      ))}
    </div>
  );
}

