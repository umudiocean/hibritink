"use client";

import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

export default function Header() {
  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="border-b border-dark-400 bg-dark-100"
    >
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="bg-gradient-to-br from-primary to-gold p-3 rounded-xl"
            >
              <TrendingUp className="w-8 h-8 text-black" />
            </motion.div>
            
            <div>
              <h1 className="text-3xl font-bold font-mono gradient-text">
                HİBRİT İNK
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Kompozit Kanal İndikatörü - 7 İndikatör Gücü
              </p>
            </div>
          </div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="hidden md:flex items-center gap-6 text-sm"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-gray-400">Canlı Veri</span>
            </div>
            
            <div className="h-6 w-px bg-dark-400" />
            
            <div className="text-gray-400">
              Otomatik Güncelleme: <span className="text-primary font-mono">15 dk</span>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}

