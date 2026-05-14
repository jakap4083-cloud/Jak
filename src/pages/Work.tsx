import React, { useState, useEffect, useRef } from 'react';
import { Zap, Play, CheckCircle2, Timer, RefreshCw, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api';
import { useAuth } from '../App';
import { cn } from '../lib/utils';
import { formatDistanceToNow, isAfter } from 'date-fns';
import { id } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function Work() {
  const [userProducts, setUserProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const { refreshUser } = useAuth();
  const timerRef = useRef<any>(null);

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const loadMyProducts = async () => {
    try {
      const data = await api.get('/user/products');
      setUserProducts(data.products);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyProducts();
    timerRef.current = setInterval(loadMyProducts, 10000); // Polling every 10s for status updates
    return () => clearInterval(timerRef.current);
  }, []);

  const handleStartMining = async (upId: string) => {
    setActionId(upId);
    try {
      await api.post('/mining/start', { userProductId: upId });
      loadMyProducts();
      setShowSuccessModal(true);
    } catch (e: any) {
      toast.error('Gagal Mulai Mining', {
        description: e.message || 'Silakan coba beberapa saat lagi.',
      });
    } finally {
      setActionId(null);
    }
  };

  const handleClaim = async (sessionId: string) => {
    setActionId(sessionId);
    try {
      await api.post('/mining/claim', { sessionId });
      refreshUser();
      loadMyProducts();
      toast.success('Reward Berhasil Diklaim!', {
        description: 'Saldo NX Anda telah diperbarui.',
      });
    } catch (e: any) {
      toast.error('Gagal Klaim', {
        description: e.message || 'Silakan coba lagi.',
      });
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-2xl bg-[#00f2ff]/10 flex items-center justify-center text-[#00f2ff] border border-[#00f2ff]/20">
            <Zap size={22} className="drop-shadow-[0_0_8px_#00f2ff]" />
          </div>
          <h1 className="text-xl font-black uppercase tracking-tighter italic">Mining Center</h1>
        </div>
        <button onClick={loadMyProducts} className="p-2 glass rounded-2xl border-white/5 text-gray-500 bg-white/5">
          <RefreshCw size={20} className={cn(loading && "animate-spin")} />
        </button>
      </div>

      <div className="space-y-4">
        {loading && userProducts.length === 0 ? (
          <div className="text-center py-20 text-white/40">
            <RefreshCw className="animate-spin mx-auto mb-4" size={40} />
            <p>Memuat mesin mining...</p>
          </div>
        ) : userProducts.length === 0 ? (
          <div className="text-center py-16 glass rounded-3xl space-y-4">
            <Zap size={48} className="mx-auto text-white/20" />
            <p className="text-white/60">Belum ada mesin aktif.</p>
            <Link to="/investment" className="text-[#00f2ff] font-black uppercase text-[10px] tracking-widest underline decoration-[#00f2ff]/30 underline-offset-4">Beli Mesin Sekarang</Link>
          </div>
        ) : (
          userProducts.map((up) => (
            <MiningCard 
              key={up.id} 
              up={up} 
              onStart={() => handleStartMining(up.id)}
              onClaim={(sid) => handleClaim(sid)}
              isActioning={actionId === up.id || (up.current_session && actionId === up.current_session.id)}
            />
          ))
        )}
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSuccessModal(false)}
              className="absolute inset-0 bg-[#050b18]/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm glass rounded-[40px] p-10 border-white/10 bg-[#0a1529]/90 shadow-2xl text-center space-y-8"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-[#00f2ff] blur-2xl opacity-20" />
                <CheckCircle2 size={72} className="mx-auto text-[#00f2ff] relative" />
              </div>
              
              <div className="space-y-3">
                <h3 className="text-3xl font-black uppercase italic tracking-tighter text-white">Selamat!</h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] leading-relaxed">
                  Neural mining protokol berhasil diaktifkan. Mesin Anda kini mulai mengekstrak NX Coin.
                </p>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full neon-btn h-14 rounded-2xl text-[#050b18] font-black uppercase tracking-widest text-[10px] flex items-center justify-center"
                >
                  Mining Sekarang
                </button>
                <Link 
                  to="/dashboard"
                  className="w-full h-14 glass rounded-2xl border-white/5 text-gray-400 font-bold uppercase tracking-widest text-[9px] flex items-center justify-center"
                >
                  Kembali ke Home
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MiningCard({ up, onStart, onClaim, isActioning }: any) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (up.current_session && up.current_session.status === 'MINING') {
      const interval = setInterval(() => {
        const now = new Date();
        const end = new Date(up.current_session.end_time);
        const start = new Date(up.current_session.start_time);
        
        const diffMs = end.getTime() - now.getTime();
        
        if (diffMs <= 0) {
          setTimeLeft('READY');
          setProgress(100);
          clearInterval(interval);
        } else {
          const total = end.getTime() - start.getTime();
          const elapsed = now.getTime() - start.getTime();
          setProgress(Math.min(100, (elapsed / total) * 100));
          
          if (diffMs < 60000) {
            setTimeLeft(`${Math.ceil(diffMs / 1000)} DETIK LAGI`);
          } else {
            setTimeLeft(formatDistanceToNow(end, { locale: id, addSuffix: true }));
          }
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [up.current_session]);

  const hasSession = !!up.current_session;
  const isMining = up.current_session?.status === 'MINING';
  const canClaim = up.current_session?.status === 'READY_TO_CLAIM' || (isMining && timeLeft === 'READY');

  return (
    <div className={cn(
      "glass rounded-[40px] p-8 border relative overflow-hidden transition-all duration-500",
      canClaim 
        ? "border-emerald-500/40 bg-emerald-500/5 shadow-[0_10px_40px_rgba(16,185,129,0.1)]" 
        : isMining 
          ? "border-[#00f2ff]/20 bg-[#00f2ff]/5" 
          : "border-white/5 bg-[#0a1529]/30"
    )}>
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <Zap size={100} className="rotate-12" />
      </div>

      {(isMining || canClaim) && (
        <div 
          className={cn(
            "absolute top-0 left-0 h-1 transition-all duration-1000",
            canClaim ? "bg-emerald-400 shadow-[0_0_15px_#10b981]" : "bg-[#00f2ff] shadow-[0_0_15px_#00f2ff]"
          )} 
          style={{ width: `${progress}%` }} 
        />
      )}

      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className={cn(
            "h-14 w-14 rounded-3xl glass flex items-center justify-center border-white/10 transition-colors",
            isMining ? "bg-[#00f2ff]/10 text-[#00f2ff]" : canClaim ? "bg-emerald-400/20 text-emerald-400" : "bg-white/5 text-gray-700"
          )}>
            <div className="relative">
              <Zap size={24} className={cn(isMining && "animate-pulse drop-shadow-[0_0_8px_#00f2ff]", canClaim && "text-emerald-400 drop-shadow-[0_0_8px_#10b981]")} />
              {(isMining || canClaim) && <div className={cn("absolute inset-0 blur-md opacity-20", isMining ? "bg-[#00f2ff]" : "bg-emerald-400")} />}
            </div>
          </div>
          <div>
            <h3 className="font-black text-lg uppercase tracking-tighter italic">{up.product.name}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest leading-none">Status:</span>
              <div className={cn(
                "h-1.5 w-1.5 rounded-full",
                isMining ? "bg-[#00f2ff] animate-ping" : canClaim ? "bg-emerald-400 shadow-[0_0_8px_#10b981]" : "bg-white/10"
              )} />
              <span className={cn(
                "text-[9px] font-black uppercase tracking-widest leading-none underline-offset-4 decoration-[#00f2ff]/30",
                isMining ? "text-[#00f2ff] underline" : canClaim ? "text-emerald-400 underline decoration-emerald-400/30 font-black" : "text-gray-600"
              )}>
                {isMining ? 'Mining Aktif' : canClaim ? 'PULSA TERSEDIA (SIAP KLAIM)' : 'Menunggu'}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Sesi Hari Ini</p>
          <p className={cn("text-sm font-black italic", up.mining_count_today >= up.product.mining_per_day ? "text-gray-500" : "text-white")}>
            {up.mining_count_today} <span className="text-gray-600">/ {up.product.mining_per_day}</span>
          </p>
        </div>
      </div>

      {/* Animation Area */}
      <div className={cn(
        "h-32 glass rounded-[32px] border flex flex-col items-center justify-center relative mb-8 overflow-hidden backdrop-blur-xl transition-all duration-500",
        canClaim ? "bg-emerald-400/10 border-emerald-400/20" : isMining ? "bg-[#0a1529]/60 border-[#00f2ff]/10" : "bg-[#0a1529]/40 border-white/5"
      )}>
        {isMining ? (
          <div className="flex flex-col items-center">
             <div className="flex space-x-3 mb-2">
                {[1, 2, 3].map((i) => (
                  <motion.div 
                    key={i}
                    animate={{ height: [20, 40, 20], opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                    className="w-1.5 bg-[#00f2ff] rounded-full shadow-[0_0_8px_#00f2ff]"
                  />
                ))}
             </div>
             <p className="text-[11px] font-black text-[#00f2ff] uppercase tracking-tighter italic animate-pulse">{timeLeft}</p>
          </div>
        ) : canClaim ? (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }} 
            animate={{ scale: [1, 1.05, 1], opacity: 1 }} 
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center"
          >
            <div className="relative">
              <CheckCircle2 size={48} className="text-emerald-400 mb-2 drop-shadow-[0_0_15px_rgba(52,211,153,0.8)]" />
              <motion.div 
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-emerald-400 rounded-full blur-xl -z-10"
              />
            </div>
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest italic animate-pulse">Extraction Complete</p>
          </motion.div>
        ) : (
          <div className="text-center group-hover:scale-110 transition-transform duration-500">
            <Zap size={32} className="text-gray-800 mx-auto" />
            <p className="text-[9px] font-black text-gray-700 uppercase tracking-widest mt-2">Mesin Siaga</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-1">
           <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Earning</p>
           <div className="flex items-baseline space-x-1">
             <p className={cn("text-2xl font-black tracking-tighter italic transition-colors", canClaim ? "text-emerald-400" : "text-white")}>
               {up.product.reward_per_mining}
             </p>
             <span className={cn("text-[8px] font-black uppercase tracking-widest transition-colors", canClaim ? "text-emerald-400" : "text-[#00f2ff]")}>
               NX
             </span>
           </div>
        </div>
        
        {canClaim ? (
           <button 
             onClick={() => onClaim(up.current_session.id)}
             disabled={isActioning}
             className="bg-emerald-500 hover:bg-emerald-400 px-8 h-14 rounded-2xl text-[#050b18] font-black uppercase text-xs tracking-widest transition-all shadow-[0_0_30px_rgba(16,185,129,0.4)] active:scale-95 group relative overflow-hidden"
           >
             <div className="relative z-10 flex items-center justify-center space-x-2">
               {isActioning ? <RefreshCw className="animate-spin" size={20} /> : (
                 <>
                   <CheckCircle2 size={18} />
                   <span>Klaim Hadiah</span>
                 </>
               )}
             </div>
             <motion.div 
               animate={{ x: ['100%', '-100%'] }}
               transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
               className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
             />
           </button>
        ) : !isMining ? (
           <button 
             onClick={onStart}
             disabled={isActioning || up.mining_count_today >= up.product.mining_per_day}
             className={cn(
               "h-14 min-w-[160px] rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-lg active:scale-95 flex items-center justify-center space-x-2",
               up.mining_count_today >= up.product.mining_per_day ? "bg-white/5 text-gray-600 cursor-not-allowed border border-white/5" : "neon-btn text-[#050b18]"
             )}
           >
             {isActioning ? <RefreshCw className="animate-spin" size={20} /> : (
               <>
                 <Play size={18} fill="currentColor" strokeWidth={0} />
                 <span>Mulai Mining</span>
               </>
             )}
           </button>
        ) : (
           <div className="flex items-center space-x-3 px-6 h-14 rounded-2xl glass border-[#00f2ff]/20 text-[#00f2ff]">
             <Timer size={18} className="animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-widest italic animate-pulse">Extracting...</span>
           </div>
        )}
      </div>
    </div>
  );
}
