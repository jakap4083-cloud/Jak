import React from 'react';
import { Settings, AlertTriangle, MessageCircle, Send } from 'lucide-react';
import { motion } from 'motion/react';

export default function Maintenance() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050b18] px-6">
      <div className="absolute inset-0 bg-glow-cyan opacity-20" />
      
      <div className="max-w-md w-full glass rounded-[40px] p-10 border border-white/10 bg-[#0a1529]/80 backdrop-blur-3xl text-center space-y-8 relative z-10">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="mx-auto h-24 w-24 rounded-full border-4 border-dashed border-[#00f2ff] flex items-center justify-center"
        >
          <Settings size={40} className="text-[#00f2ff]" />
        </motion.div>
        
        <div className="space-y-4">
          <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white">System Under Maintenance</h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] leading-relaxed">
            Protokol kami sedang menjalani pemutakhiran berkala untuk performa ekstra. Kami akan segera kembali online.
          </p>
        </div>

        <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-4 text-left">
           <div className="flex items-center space-x-3">
              <AlertTriangle className="text-yellow-500" size={16} />
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Estimated Downtime: ~2 Hours</p>
           </div>
           <div className="flex items-center space-x-3">
              <MessageCircle className="text-[#00f2ff]" size={16} />
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Support: WA Admin Live</p>
           </div>
        </div>

        <div className="pt-4">
           <a 
             href="https://t.me/naxora_official" 
             target="_blank" 
             rel="noreferrer"
             className="w-full neon-btn h-14 rounded-2xl text-[#050b18] font-black uppercase tracking-widest text-[10px] flex items-center justify-center space-x-2"
           >
             <Send size={18} />
             <span>Join Telegram Official</span>
           </a>
        </div>
      </div>
    </div>
  );
}
