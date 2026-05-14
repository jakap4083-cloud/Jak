import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, ChevronRight, Zap, CheckCircle2, Loader2, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { api } from '../services/api';
import { useAuth } from '../App';

import { toast } from 'sonner';

import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function Convert() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [rate, setRate] = useState(7000);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [status, setStatus] = useState('IDLE');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await api.getSettings();
        setRate(settings.nx_to_idr || 7000);
        setLastUpdated(settings.exchange_rate_updated_at || null);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSettings();
  }, []);

  const handleNext = () => {
    if (!amount || isNaN(parseInt(amount)) || parseInt(amount) <= 0) return;
    if (parseInt(amount) > (user?.balance_nx || 0)) {
        toast.error('Saldo NX Tidak Mencukupi', {
          description: 'Anda tidak memiliki cukup NX untuk dikonversi.',
        });
        return;
    }
    setStep(2);
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await api.convert('NX', parseInt(amount));
      toast.success('Neural Swap Berhasil!', {
        description: `Berhasil mengonversi ${amount} NX ke IDR.`,
      });
      refreshUser();
      setStatus('SUCCESS');
    } catch (err: any) {
      toast.error('Neural Swap Gagal', {
        description: err.message || 'Terjadi gangguan pada core exchange.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (status === 'SUCCESS') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in duration-500">
        <div className="h-24 w-24 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-[0_0_50px_rgba(16,185,129,0.3)]">
          <CheckCircle2 size={48} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">Konversi Berhasil</h2>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest italic">Neural Assets Successfully Swapped</p>
        </div>
        <button 
          onClick={() => navigate('/')}
          className="px-10 h-14 bg-emerald-500 text-[#050b18] rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-transform"
        >
          Kembali ke Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center space-x-4">
        <button onClick={() => step === 2 ? setStep(1) : navigate(-1)} className="p-2 glass rounded-2xl border-white/5 text-gray-500 hover:text-white">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-black uppercase tracking-tighter italic">Swap NX - IDR</h1>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="glass rounded-[40px] p-8 border-white/5 space-y-6 bg-[#0a1529]/40">
              <div className="flex items-center justify-between px-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Input Amount (NX)</label>
                <button 
                   onClick={() => setAmount(Math.floor(user?.balance_nx || 0).toString())}
                   className="text-[8px] font-black text-[#00f2ff] uppercase tracking-widest"
                >
                    Max: {user?.balance_nx.toLocaleString()}
                </button>
              </div>
              
              <div className="relative group">
                <Zap className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#00f2ff] transition-colors" size={18} />
                <input 
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full h-20 bg-white/5 border border-white/10 rounded-[30px] pl-14 pr-24 outline-none focus:border-[#00f2ff]/30 text-white font-black italic text-3xl transition-all"
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 font-black italic text-gray-700 text-xl">NX</div>
              </div>

              <div className="flex justify-center">
                 <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <RefreshCw size={16} className="text-[#00f2ff]" />
                 </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">Estimate Received (IDR)</label>
                <div className="h-20 bg-white/5 border border-white/5 rounded-[30px] px-8 flex items-center justify-between">
                   <span className="text-2xl font-black italic text-gray-500">
                     Rp {(parseInt(amount || '0') * rate).toLocaleString()}
                   </span>
                   <span className="font-black italic text-gray-700 text-sm">IDR</span>
                </div>
              </div>

              <div className="p-4 bg-[#00f2ff]/5 border border-[#00f2ff]/10 rounded-2xl flex flex-col items-center space-y-2">
                 <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest text-center leading-relaxed">
                    Neural Exchange Rate: <span className="text-[#00f2ff]">1 NX = Rp {rate.toLocaleString()}</span>
                 </p>
                 {lastUpdated && (
                   <p className="text-[7px] font-bold text-gray-600 uppercase tracking-widest text-center flex items-center space-x-1">
                     <Clock size={8} />
                     <span>Terakhir diperbarui: {format(new Date(lastUpdated), 'dd MMM yyyy, HH:mm', { locale: id })}</span>
                   </p>
                 )}
              </div>

              <button
                disabled={!amount || isNaN(parseInt(amount)) || parseInt(amount) <= 0}
                onClick={handleNext}
                className="w-full neon-btn h-16 rounded-3xl text-[#050b18] font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center space-x-3 disabled:opacity-50 shadow-[0_0_25px_rgba(0,242,255,0.4)] transition-all"
              >
                <span>Preview Swap</span>
                <ChevronRight size={20} strokeWidth={3} />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="glass rounded-[40px] p-8 border-white/5 bg-[#0a1529]/40 space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-black uppercase italic tracking-tighter">Konfirmasi Swap</h2>
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest text-center">Review Neutral Exchange Transaction</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-6 glass rounded-3xl border-white/5 bg-white/5">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">You Pay</span>
                  <div className="text-right">
                    <p className="text-lg font-black italic tracking-tighter text-white">{parseInt(amount).toLocaleString()} NX</p>
                    <p className="text-[8px] text-gray-600 font-bold uppercase italic">NX Coin Network</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-6 glass rounded-3xl border-white/5 bg-white/5">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">You Get</span>
                  <div className="text-right">
                    <p className="text-lg font-black italic tracking-tighter text-emerald-400">Rp {(parseInt(amount) * rate).toLocaleString()}</p>
                    <p className="text-[8px] text-gray-600 font-bold uppercase italic">Indonesian Rupiah</p>
                  </div>
                </div>

                <div className="flex items-center justify-between px-6">
                  <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Fee Swap</span>
                  <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">0.00% (Alpha Free)</span>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <button
                  disabled={loading}
                  onClick={handleConfirm}
                  className="w-full neon-btn h-16 rounded-3xl text-[#050b18] font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center space-x-3 shadow-[0_0_25px_rgba(0,242,255,0.4)] transition-all"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : (
                    <>
                      <span>Execute Swap</span>
                      <ChevronRight size={20} strokeWidth={3} />
                    </>
                  )}
                </button>
                <button
                  onClick={() => setStep(1)}
                  className="w-full h-16 rounded-3xl glass border-white/5 text-gray-500 font-black uppercase tracking-widest text-[10px] hover:text-white transition-colors"
                >
                  Cancel Neural Swap
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
