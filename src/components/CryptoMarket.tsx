import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cryptoService, CryptoPrice } from '../services/cryptoService';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function CryptoMarket() {
  const [prices, setPrices] = useState<CryptoPrice[]>([]);

  useEffect(() => {
    return cryptoService.subscribe(setPrices);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-[#00f2ff] italic">Market Live Feed</h3>
        <div className="flex items-center space-x-1">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Live Streams</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {prices.map((p) => (
          <motion.div 
            key={p.symbol} 
            layout
            className="p-5 glass rounded-[28px] border-white/5 bg-[#0a1529]/40 backdrop-blur-xl relative overflow-hidden group transition-all hover:border-[#00f2ff]/20"
          >
            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
              {p.isUp ? <TrendingUp size={48} className="text-emerald-400" /> : <TrendingDown size={48} className="text-rose-400" />}
            </div>
            
            <div className="flex justify-between items-start mb-2">
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.1em]">{p.symbol}</span>
                <span className="text-[7px] text-gray-700 font-bold uppercase tracking-tighter">USDT PERPETUAL</span>
              </div>
              <AnimatePresence mode='wait'>
                <motion.span 
                  key={p.change}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "text-[8px] font-black px-2 py-0.5 rounded-full tracking-tighter italic border",
                    p.isUp 
                      ? "bg-emerald-400/5 text-emerald-400 border-emerald-400/20" 
                      : "bg-rose-400/5 text-rose-400 border-rose-400/20"
                  )}
                >
                  {p.change}
                </motion.span>
              </AnimatePresence>
            </div>
            
            <div className="flex items-baseline space-x-1">
              <span className="text-sm font-bold text-gray-600 tracking-tighter italic">$</span>
              <AnimatePresence mode='wait'>
                <motion.span 
                  key={p.price}
                  initial={{ opacity: 0.8 }}
                  animate={{ opacity: 1 }}
                  className="text-xl font-black text-white tracking-tighter italic"
                >
                  {p.price}
                </motion.span>
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
