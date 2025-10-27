"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

interface SignalDisplayProps {
  status: {
    signal: number;
    signal_name: string;
    composite_score: number;
    price: number;
    composite_upper: number;
    composite_mid: number;
    composite_lower: number;
  };
}

export default function SignalDisplay({ status }: SignalDisplayProps) {
  const getSignalConfig = (signal: number) => {
    switch (signal) {
      case 2:
        return {
          icon: <TrendingUp className="w-8 h-8" />,
          color: "text-green-500",
          bg: "bg-green-500/20",
          border: "border-green-500",
          text: "🟢🟢 GÜÇLÜ ALIM",
          description: "Tüm indikatörler güçlü alım sinyali veriyor",
        };
      case 1:
        return {
          icon: <TrendingUp className="w-8 h-8" />,
          color: "text-green-400",
          bg: "bg-green-400/20",
          border: "border-green-400",
          text: "🟢 ALIM",
          description: "Alım pozisyonu açmak için uygun",
        };
      case -1:
        return {
          icon: <TrendingDown className="w-8 h-8" />,
          color: "text-orange-400",
          bg: "bg-orange-400/20",
          border: "border-orange-400",
          text: "🔴 SATIM",
          description: "Satım pozisyonu açmak için uygun",
        };
      case -2:
        return {
          icon: <TrendingDown className="w-8 h-8" />,
          color: "text-red-500",
          bg: "bg-red-500/20",
          border: "border-red-500",
          text: "🔴🔴 GÜÇLÜ SATIM",
          description: "Tüm indikatörler güçlü satım sinyali veriyor",
        };
      default:
        return {
          icon: <Minus className="w-8 h-8" />,
          color: "text-gray-400",
          bg: "bg-gray-400/20",
          border: "border-gray-400",
          text: "⚪ NÖTR",
          description: "Net bir sinyal yok, pozisyon açmayın",
        };
    }
  };
  
  const config = getSignalConfig(status.signal);
  
  // Fiyatın kanaldaki pozisyonu
  const channelRange = status.composite_upper - status.composite_lower;
  const pricePosition = ((status.price - status.composite_lower) / channelRange) * 100;
  
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`glass-effect rounded-2xl p-8 border-2 ${config.border}`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Ana Sinyal */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className={`${config.bg} ${config.color} rounded-2xl p-6 flex flex-col items-center justify-center text-center`}
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {config.icon}
            </motion.div>
            
            <h2 className="text-3xl font-bold font-mono mt-4 mb-2">
              {config.text}
            </h2>
            
            <p className="text-sm opacity-80">{config.description}</p>
            
            <div className="mt-6 w-full">
              <div className="flex items-center justify-between text-xs mb-2">
                <span>Kompozit Skor</span>
                <span className="font-mono font-bold">{status.composite_score} / 7</span>
              </div>
              <div className="h-3 bg-black/30 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(Math.abs(status.composite_score) / 7) * 100}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className={`h-full ${
                    status.composite_score > 0
                      ? "bg-gradient-to-r from-green-400 to-green-600"
                      : "bg-gradient-to-r from-red-600 to-red-400"
                  }`}
                />
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Kanal Bilgisi */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-300 mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-primary" />
            Kompozit Kanal Pozisyonu
          </h3>
          
          <div className="space-y-6">
            {/* Kanal Görseli */}
            <div className="relative">
              <div className="h-32 bg-gradient-to-b from-red-900/20 via-gray-900/20 to-green-900/20 rounded-lg relative overflow-hidden">
                {/* Üst Kanal */}
                <div className="absolute top-0 left-0 right-0 h-px bg-red-500" />
                <div className="absolute top-0 left-0 right-0 text-xs text-red-400 px-4 py-1">
                  Üst Kanal: ${status.composite_upper.toFixed(2)}
                </div>
                
                {/* Orta Kanal */}
                <div className="absolute top-1/2 left-0 right-0 h-px bg-primary transform -translate-y-1/2" />
                <div className="absolute top-1/2 left-0 right-0 text-xs text-primary px-4 transform -translate-y-3">
                  Orta: ${status.composite_mid.toFixed(2)}
                </div>
                
                {/* Alt Kanal */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-green-500" />
                <div className="absolute bottom-0 left-0 right-0 text-xs text-green-400 px-4 py-1">
                  Alt Kanal: ${status.composite_lower.toFixed(2)}
                </div>
                
                {/* Fiyat Pozisyonu */}
                <motion.div
                  initial={{ top: "50%" }}
                  animate={{ top: `${100 - pricePosition}%` }}
                  transition={{ duration: 1, type: "spring" }}
                  className="absolute left-0 right-0 transform -translate-y-1/2"
                >
                  <div className="flex items-center px-4">
                    <div className="w-3 h-3 bg-primary rounded-full animate-pulse shadow-lg shadow-primary/50" />
                    <div className="ml-2 text-sm font-mono font-bold text-primary">
                      ${status.price.toFixed(2)}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
            
            {/* Mesafe Bilgileri */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-dark-300 rounded-lg p-4">
                <div className="text-xs text-gray-400 mb-1">Üst Kanala</div>
                <div className="text-lg font-bold font-mono text-red-400">
                  {((status.composite_upper - status.price) / status.price * 100).toFixed(2)}%
                </div>
                <div className="text-xs text-gray-500">
                  ${(status.composite_upper - status.price).toFixed(2)}
                </div>
              </div>
              
              <div className="bg-dark-300 rounded-lg p-4">
                <div className="text-xs text-gray-400 mb-1">Orta Kanala</div>
                <div className="text-lg font-bold font-mono text-primary">
                  {Math.abs((status.composite_mid - status.price) / status.price * 100).toFixed(2)}%
                </div>
                <div className="text-xs text-gray-500">
                  ${Math.abs(status.composite_mid - status.price).toFixed(2)}
                </div>
              </div>
              
              <div className="bg-dark-300 rounded-lg p-4">
                <div className="text-xs text-gray-400 mb-1">Alt Kanala</div>
                <div className="text-lg font-bold font-mono text-green-400">
                  {((status.price - status.composite_lower) / status.price * 100).toFixed(2)}%
                </div>
                <div className="text-xs text-gray-500">
                  ${(status.price - status.composite_lower).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

