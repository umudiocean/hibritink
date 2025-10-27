"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ChartComponentProps {
  data: any[];
}

export default function ChartComponent({ data }: ChartComponentProps) {
  const [activeChart, setActiveChart] = useState<"price" | "indicators" | "score">("price");
  
  if (!data || data.length === 0) {
    return (
      <div className="chart-container flex items-center justify-center">
        <p className="text-gray-400">Veri yükleniyor...</p>
      </div>
    );
  }
  
  // Veriyi formatla
  const chartData = data.map((item) => ({
    ...item,
    time: new Date(item.time).toLocaleDateString("tr-TR", {
      month: "short",
      day: "numeric",
    }),
  }));
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-200 border border-dark-400 rounded-lg p-4 shadow-xl">
          <p className="text-sm font-mono text-gray-400 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: entry.color }}
              />
              <span className="text-gray-300">{entry.name}:</span>
              <span className="font-mono font-bold text-white">
                {typeof entry.value === "number"
                  ? entry.value.toFixed(2)
                  : entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };
  
  return (
    <div>
      {/* Chart Selector */}
      <div className="flex gap-2 mb-6">
        {[
          { id: "price", label: "Fiyat & Kanallar" },
          { id: "indicators", label: "RSI & MACD" },
          { id: "score", label: "Kompozit Skor" },
        ].map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveChart(tab.id as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeChart === tab.id
                ? "bg-primary text-black"
                : "bg-dark-300 text-gray-400 hover:text-white"
            }`}
          >
            {tab.label}
          </motion.button>
        ))}
      </div>
      
      {/* Price Chart */}
      {activeChart === "price" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="chart-container"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#282828" />
              <XAxis
                dataKey="time"
                stroke="#666"
                style={{ fontSize: "12px", fontFamily: "JetBrains Mono" }}
              />
              <YAxis
                stroke="#666"
                style={{ fontSize: "12px", fontFamily: "JetBrains Mono" }}
                domain={["dataMin - 100", "dataMax + 100"]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: "12px", fontFamily: "JetBrains Mono" }}
              />
              
              <Line
                type="monotone"
                dataKey="composite_upper"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
                name="Üst Kanal"
                strokeDasharray="5 5"
              />
              <Line
                type="monotone"
                dataKey="composite_mid"
                stroke="#62cbc1"
                strokeWidth={2}
                dot={false}
                name="Orta Kanal"
                strokeDasharray="3 3"
              />
              <Line
                type="monotone"
                dataKey="composite_lower"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
                name="Alt Kanal"
                strokeDasharray="5 5"
              />
              <Line
                type="monotone"
                dataKey="close"
                stroke="#DBC658"
                strokeWidth={3}
                dot={false}
                name="Fiyat"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}
      
      {/* Indicators Chart */}
      {activeChart === "indicators" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {/* RSI */}
          <div className="chart-container" style={{ height: "250px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#282828" />
                <XAxis
                  dataKey="time"
                  stroke="#666"
                  style={{ fontSize: "12px", fontFamily: "JetBrains Mono" }}
                />
                <YAxis
                  stroke="#666"
                  domain={[0, 100]}
                  style={{ fontSize: "12px", fontFamily: "JetBrains Mono" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                
                {/* Aşırı alım/satım bölgeleri */}
                <Area
                  type="monotone"
                  dataKey={() => 70}
                  stroke="none"
                  fill="#ef4444"
                  fillOpacity={0.1}
                  name="Aşırı Alım"
                />
                <Area
                  type="monotone"
                  dataKey={() => 30}
                  stroke="none"
                  fill="#22c55e"
                  fillOpacity={0.1}
                  name="Aşırı Satım"
                />
                
                <Area
                  type="monotone"
                  dataKey="rsi"
                  stroke="#9333ea"
                  fill="#9333ea"
                  fillOpacity={0.3}
                  strokeWidth={2}
                  name="RSI"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          {/* MACD */}
          <div className="chart-container" style={{ height: "250px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#282828" />
                <XAxis
                  dataKey="time"
                  stroke="#666"
                  style={{ fontSize: "12px", fontFamily: "JetBrains Mono" }}
                />
                <YAxis
                  stroke="#666"
                  style={{ fontSize: "12px", fontFamily: "JetBrains Mono" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                
                <Line
                  type="monotone"
                  dataKey="macd"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  name="MACD"
                />
                <Line
                  type="monotone"
                  dataKey="macd_signal"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                  name="Signal"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}
      
      {/* Score Chart */}
      {activeChart === "score" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="chart-container"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#282828" />
              <XAxis
                dataKey="time"
                stroke="#666"
                style={{ fontSize: "12px", fontFamily: "JetBrains Mono" }}
              />
              <YAxis
                stroke="#666"
                domain={[-7, 7]}
                style={{ fontSize: "12px", fontFamily: "JetBrains Mono" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              <Bar
                dataKey="composite_score"
                fill="#62cbc1"
                name="Kompozit Skor"
                radius={[4, 4, 0, 0]}
              >
                {chartData.map((entry, index) => (
                  <rect
                    key={`bar-${index}`}
                    fill={entry.composite_score >= 0 ? "#22c55e" : "#ef4444"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </div>
  );
}

