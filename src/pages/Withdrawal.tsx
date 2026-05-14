import React, { useState, useEffect } from 'react';
import { ArrowLeft, Wallet, AlertCircle, RefreshCw, CheckCircle2, Shield, Lock, CreditCard, Building2, Check, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../App';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

export default function Withdrawal() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Info/Bank Check, 2: Amount, 3: PIN, 4: Done
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('DANA');
  const [address, setAddress] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    api.get('/settings').then(setSettings).catch(console.error);
    
    if (user?.bank_account) {
      setMethod(user.bank_name || 'BANK');
      setAddress(`${user.bank_account} (${user.bank_holder})`);
    }
  }, [user]);

  const valAmount = parseFloat(amount) || 0;
  const feePct = settings?.withdraw_fee_pct || 5;
  const fee = (valAmount * feePct) / 100;
  const minWithdraw = settings?.min_withdraw || 50000;
  const nett = valAmount > 0 ? valAmount - fee : 0;

  const handleNext = () => {
    if (step === 1) {
      if (!user?.bank_account) {
        toast.error('Bank Belum Dikaitkan', {
          description: 'Harap lengkapi informasi bank di profil Anda.'
        });
        navigate('/profile');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (valAmount < minWithdraw) {
        toast.error(`Minimum penarikan Rp ${minWithdraw.toLocaleString()}`);
        return;
      }
      if (valAmount > (user?.balance_idr || 0)) {
         toast.error('Saldo tidak mencukupi');
         return;
      }
      if (!user?.transfer_pin) {
        setStep(3); // Go to set PIN if not set
      } else {
        setStep(4); // Go to verify PIN
      }
    }
  };

  const handleSetPin = async () => {
    if (pin.length !== 6) return toast.error('PIN harus 6 digit');
    setLoading(true);
    try {
      await api.post('/user/pin/set', { pin });
      toast.success('PIN Keamanan Berhasil Dibuat');
      refreshUser();
      setStep(4);
      setPin('');
    } catch (e: any) {
      toast.error('Gagal membuat PIN');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (pin.length !== 6) return toast.error('PIN harus 6 digit');
    setLoading(true);
    try {
      // First verify PIN
      await api.post('/user/pin/verify', { pin });
      // Then process withdrawal
      await api.withdraw({ amount: valAmount, method, address });
      setStep(5);
      toast.success('Pengajuan Berhasil!', {
        description: 'Dana akan segera dikirim ke rekening Anda.'
      });
      refreshUser();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Gagal memproses penarikan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center space-x-4">
        <button onClick={() => step > 1 && step < 5 ? setStep(step - 1) : navigate(-1)} className="p-2 glass rounded-2xl border-white/5 text-gray-500 hover:text-white">
          <ArrowLeft size={20} />
        </button>
        <div>
           <h1 className="text-xl font-black uppercase tracking-tighter italic">Withdrawal Hub</h1>
           <p className="text-[10px] text-rose-400 font-bold uppercase tracking-widest leading-none">Neural Asset Liquidator</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
             <div className="glass rounded-[32px] p-8 border-white/5 bg-[#0a1529]/40 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   <Shield size={80} className="text-[#00f2ff]" />
                </div>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Transfer Destination</p>
                {user?.bank_account ? (
                  <div className="space-y-4">
                     <div className="flex items-center space-x-4">
                        <div className="h-14 w-14 rounded-2xl glass bg-[#00f2ff]/10 flex items-center justify-center text-[#00f2ff] border border-[#00f2ff]/20">
                           <Building2 size={24} />
                        </div>
                        <div>
                           <h3 className="text-lg font-black text-white uppercase italic">{user.bank_name}</h3>
                           <p className="text-[11px] font-mono text-[#00f2ff] font-bold tracking-widest">{user.bank_account}</p>
                        </div>
                     </div>
                     <div className="p-4 glass rounded-2xl bg-white/5 border-white/5">
                        <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Account Holder</p>
                        <p className="text-xs font-black text-white uppercase tracking-wider">{user.bank_holder}</p>
                     </div>
                  </div>
                ) : (
                  <div className="py-10 text-center space-y-4">
                     <AlertCircle className="mx-auto text-rose-500" size={40} />
                     <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mx-auto max-w-[200px]">Node penarikan belum terkonfigurasi.</p>
                     <button onClick={() => navigate('/profile')} className="px-6 h-10 glass rounded-xl border-[#00f2ff]/30 text-[#00f2ff] text-[9px] font-black uppercase tracking-widest hover:bg-[#00f2ff]/10">
                        Konfigurasi Sekarang
                     </button>
                  </div>
                )}
             </div>

             <div className="glass rounded-[40px] p-10 bg-white/5 border-white/5 space-y-6">
                <div className="flex justify-between items-center">
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Ready to Liquidate</p>
                      <h4 className="text-3xl font-black italic text-white tracking-tighter">Rp {user?.balance_idr.toLocaleString()}</h4>
                   </div>
                   <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                      <Check size={20} />
                   </div>
                </div>
                
                <button 
                  onClick={handleNext}
                  className="w-full neon-btn h-16 rounded-2xl text-[#050b18] font-black uppercase text-xs tracking-widest flex items-center justify-center group"
                >
                  Proses Pencairan
                  <ChevronRight size={18} className="ml-2 group-hover:translate-x-1 transition-all" />
                </button>
             </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
             <div className="space-y-4">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2 italic">Input Outbound Amount</p>
                <div className="glass rounded-[32px] p-8 border-white/5 bg-[#0a1529]/40 space-y-8">
                   <div className="relative">
                      <span className="absolute left-0 bottom-3 text-3xl font-black italic text-gray-800">Rp</span>
                      <input 
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0"
                        className="w-full bg-transparent border-b-2 border-white/10 pb-2 pl-12 text-5xl font-black italic outline-none focus:border-[#00f2ff] transition-all text-white placeholder:text-gray-900"
                      />
                   </div>

                   <div className="space-y-3">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                         <span className="text-gray-600">Satoshi Fee ({feePct}%)</span>
                         <span className="text-rose-500">- Rp {fee.toLocaleString()}</span>
                      </div>
                      <div className="h-px bg-white/5" />
                      <div className="flex justify-between items-center">
                         <span className="text-[10px] font-black text-white uppercase tracking-widest italic">Net Liquidity Received</span>
                         <span className="text-2xl font-black italic text-[#00f2ff]">Rp {nett.toLocaleString()}</span>
                      </div>
                   </div>

                   <div className="grid grid-cols-3 gap-3">
                      {[50000, 100000, 250000, 500000, 1000000, 5000000].map(v => (
                        <button 
                          key={v}
                          onClick={() => setAmount(v.toString())}
                          className="h-12 glass rounded-xl border-white/5 text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-white hover:border-[#00f2ff]/30 transition-all"
                        >
                          {v >= 1000000 ? `${v/1000000}JT` : `${v/1000}RB`}
                        </button>
                      ))}
                   </div>
                </div>
             </div>

             <button 
                onClick={handleNext}
                className="w-full neon-btn h-16 rounded-2xl text-[#050b18] font-black uppercase text-xs tracking-widest flex items-center justify-center transition-all disabled:opacity-50"
             >
                Verify Connection
             </button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
             <div className="glass rounded-[40px] p-10 bg-[#0a1529]/60 border-white/5 text-center space-y-6">
                <div className="h-20 w-20 rounded-[32px] bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mx-auto">
                   <Lock size={32} />
                </div>
                <div className="space-y-2">
                   <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">Create Security PIN</h3>
                   <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest px-4">Neural verification requires a 6-digit access code for all liquidity outflows.</p>
                </div>
                
                <input 
                  type="password"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••••"
                  className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl text-center text-3xl font-black tracking-[1em] text-[#00f2ff] outline-none focus:border-[#00f2ff]/50"
                />

                <button 
                   onClick={handleSetPin}
                   disabled={loading || pin.length !== 6}
                   className="w-full h-14 rounded-2xl bg-white text-[#050b18] font-black uppercase text-[10px] tracking-widest disabled:opacity-30"
                >
                   {loading ? <RefreshCw className="animate-spin mx-auto" /> : 'Set Access Node'}
                </button>
             </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
             <div className="glass rounded-[40px] p-10 bg-[#0a1529]/60 border-white/5 text-center space-y-8">
                <div className="space-y-6">
                  <div className="h-16 w-16 rounded-2xl bg-[#00f2ff]/10 border border-[#00f2ff]/30 flex items-center justify-center text-[#00f2ff] mx-auto animate-pulse">
                     <Lock size={24} />
                  </div>
                  <div className="space-y-2">
                     <h3 className="text-lg font-black uppercase italic tracking-tighter text-white">Identity Verification</h3>
                     <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Enter 6-Digit PIN to authorize transfer</p>
                  </div>
                </div>

                <div className="space-y-8">
                   <input 
                     type="password"
                     maxLength={6}
                     value={pin}
                     onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                     placeholder="••••••"
                     className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl text-center text-3xl font-black tracking-[1em] text-[#00f2ff] outline-none focus:border-[#00f2ff]/50"
                   />

                   <div className="p-5 glass rounded-3xl bg-amber-400/5 border border-amber-400/20 text-left">
                      <div className="flex items-center space-x-3 text-amber-400 mb-2">
                         <AlertCircle size={14} />
                         <span className="text-[10px] font-black uppercase tracking-widest">Transaction Scope</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] text-gray-500 font-bold uppercase">OUTBOUND: <span className="text-white italic">Rp {parseFloat(amount).toLocaleString()}</span></p>
                        <p className="text-[9px] text-gray-500 font-bold uppercase">DESTINATION: <span className="text-white italic">{user?.bank_account}</span></p>
                      </div>
                   </div>
                </div>

                <div className="flex space-x-3">
                   <button 
                      onClick={() => setStep(2)}
                      className="flex-1 h-14 rounded-2xl glass border-white/5 text-gray-500 font-black uppercase text-[10px] tracking-widest"
                   >
                      Cancel
                   </button>
                   <button 
                      onClick={handleWithdraw}
                      disabled={loading || pin.length !== 6}
                      className="flex-[2] h-14 rounded-2xl bg-[#00f2ff] text-[#050b18] font-black uppercase text-[10px] tracking-widest shadow-[0_0_20px_rgba(0,242,255,0.3)]"
                   >
                      {loading ? <RefreshCw className="animate-spin mx-auto" /> : 'Authorize Liquid'}
                   </button>
                </div>
             </div>
          </motion.div>
        )}

        {step === 5 && (
           <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="py-20 text-center space-y-8">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-emerald-400 blur-3xl opacity-20" />
                <CheckCircle2 size={100} className="text-emerald-400 relative" />
              </div>
              
              <div className="space-y-3">
                 <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">Withdrawal Initiated</h2>
                 <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] leading-relaxed max-w-[280px] mx-auto">
                   Permintaan likuidasi aset Anda sedang diproses oleh moderator. Dana akan tiba dalam estimasi 5-60 menit.
                 </p>
              </div>

              <div className="flex flex-col space-y-4">
                 <button 
                   onClick={() => navigate('/history')}
                   className="neon-btn h-14 w-full rounded-2xl text-[#050b18] font-black uppercase text-[10px] tracking-widest shadow-xl"
                 >
                   View Transaction Logs
                 </button>
                 <button 
                   onClick={() => navigate('/')}
                   className="h-14 w-full rounded-2xl glass border-white/5 text-gray-500 font-black uppercase text-[10px] tracking-widest hover:text-white"
                 >
                   Return to Dashboard
                 </button>
              </div>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
