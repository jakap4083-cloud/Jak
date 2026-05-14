import React, { useState, useEffect } from 'react';
import { CreditCard, ArrowLeft, Check, AlertCircle, RefreshCw, Smartphone, Building2, Wallet, QrCode, Shield, ChevronRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { cn } from '../lib/utils';
import { useAuth } from '../App';
import { toast } from 'sonner';

const BANK_OPTIONS = [
  { id: 'BCA', name: 'BCA Mobile / Virtual Account', icon: Building2 },
  { id: 'BNI', name: 'BNI Mobile Banking', icon: Building2 },
  { id: 'MANDIRI', name: 'Mandiri Livin', icon: Building2 },
  { id: 'DANA', name: 'E-Wallet DANA', icon: Wallet },
  { id: 'OVO', name: 'E-Wallet OVO', icon: Wallet },
  { id: 'GOPAY', name: 'E-Wallet GoPay', icon: Smartphone },
];

export default function Deposit() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [type, setType] = useState<'AUTO' | 'MANUAL' | null>(null);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [qrisData, setQrisData] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [confirmed, setConfirmed] = useState(false);
  const { user, refreshUser } = useAuth();

  useEffect(() => {
    api.get('/settings').then(setSettings).catch(console.error);
  }, []);

  const exchangeRate = settings?.exchange_rate || 7000;
  const nxReceived = amount ? (parseFloat(amount) / exchangeRate).toFixed(2) : '0';

  const handleNext = () => {
    if (step === 1 && !type) {
      toast.error('Pilih metode pengisian terlebih dahulu');
      return;
    }
    if (step === 2 && (parseFloat(amount) < 10000 || isNaN(parseFloat(amount)))) {
      toast.error('Minimal deposit Rp 10.000');
      return;
    }
    if (step === 3 && !method) {
      toast.error('Pilih channel pembayaran');
      return;
    }
    if (step === 4 && !confirmed) {
      toast.error('Konfirmasi transaksi diperlukan');
      return;
    }
    setStep(step + 1);
  };

  const handleDeposit = async () => {
    setLoading(true);
    try {
      if (type === 'AUTO') {
        const res = await api.createQRIS(parseFloat(amount));
        setQrisData(res.deposit);
        setStep(6);
      } else {
        await api.post('/deposit/manual', { amount: parseFloat(amount), method: `MANUAL ${method}` });
        setStep(5); // Show instructions
        toast.success('Pengajuan Deposit Berhasil');
      }
    } catch (e: any) {
      toast.error('Gagal memproses deposit');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let interval: any;
    if (step === 6 && qrisData?.id) {
       interval = setInterval(async () => {
         try {
           const res = await api.getDepositStatus(qrisData.id);
           if (res.status === 'SUCCESS') {
             clearInterval(interval);
             setStep(7);
             refreshUser();
           } else if (res.status === 'FAILED' || res.status === 'EXPIRED') {
             clearInterval(interval);
             toast.error('Deposit Gagal atau Kadaluarsa');
             setStep(1);
           }
         } catch (e) {
           console.error('Polling error', e);
         }
       }, 3000);
    }
    return () => clearInterval(interval);
  }, [step, qrisData, refreshUser]);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center space-x-4">
        {step > 1 && step < 7 && (
          <button onClick={() => setStep(step - 1)} className="p-2 glass rounded-2xl border-white/5 text-gray-500 hover:text-white">
            <ArrowLeft size={20} />
          </button>
        )}
        <div>
          <h1 className="text-xl font-black uppercase italic tracking-tighter">Top-Up Central</h1>
          <p className="text-[10px] text-[#00f2ff] font-black uppercase tracking-widest leading-none">Neural Balance Recharge</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
             <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-2 italic">Select Protocol Type</p>
             <div className="grid grid-cols-1 gap-4">
               {[
                 { id: 'AUTO', label: 'OTOMATIS (QRIS)', sub: 'Verifikasi instan via QR', icon: QrCode, color: 'text-[#00f2ff]' },
                 { id: 'MANUAL', label: 'MANUAL BANK', sub: 'Pengecekan admin (1-10 menit)', icon: Building2, color: 'text-amber-400' }
               ].map((item) => (
                 <button 
                   key={item.id}
                   onClick={() => { setType(item.id as any); setStep(2); }}
                   className={cn(
                     "glass rounded-[32px] p-6 border text-left transition-all relative overflow-hidden group",
                     type === item.id ? "border-[#00f2ff] bg-[#00f2ff]/10" : "border-white/5 bg-[#0a1529]/40"
                   )}
                 >
                   <div className="flex items-center space-x-5 relative z-10">
                      <div className={cn("h-14 w-14 rounded-2xl glass flex items-center justify-center border-white/10", type === item.id ? "bg-[#00f2ff]/20" : "bg-white/5")}>
                        <item.icon size={24} className={item.color} />
                      </div>
                      <div>
                        <h4 className="font-black text-white uppercase italic tracking-tighter text-lg">{item.label}</h4>
                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{item.sub}</p>
                      </div>
                   </div>
                 </button>
               ))}
             </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="space-y-4">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-2 italic">Input Nominal (Rp)</p>
              <div className="glass rounded-[32px] p-8 border-white/5 bg-[#0a1529]/40 space-y-6">
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
                
                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest p-4 glass rounded-2xl bg-white/5">
                  <div className="space-y-1">
                    <p className="text-gray-500">Rate: 1 NX = Rp {exchangeRate.toLocaleString()}</p>
                    <p className="text-[#00f2ff]">ESTIMASI SALDO MASUK:</p>
                  </div>
                  <p className="text-xl italic text-white">{nxReceived} <span className="text-[#00f2ff]">NX</span></p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[50000, 100000, 250000, 500000, 1000000, 2500000].map((val) => (
                    <button 
                      key={val}
                      onClick={() => setAmount(val.toString())}
                      className="h-12 glass rounded-xl border-white/5 bg-white/5 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:border-[#00f2ff]/30 transition-all"
                    >
                      {val >= 1000000 ? `${val/1000000}JT` : `${val/1000}RB`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <button 
              onClick={handleNext}
              className="w-full neon-btn h-16 rounded-2xl text-[#050b18] font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center group"
            >
              Lanjutkan
              <ChevronRight size={18} className="ml-2 group-hover:translate-x-1 transition-all" />
            </button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-2 italic">Select Payment Gateway</p>
            <div className="grid grid-cols-1 gap-3">
              {BANK_OPTIONS.map((opt) => (
                <button 
                  key={opt.id}
                  onClick={() => { setMethod(opt.id); setStep(4); }}
                  className={cn(
                    "glass rounded-[28px] p-5 border text-left transition-all flex items-center space-x-4",
                    method === opt.id ? "border-[#00f2ff] bg-[#00f2ff]/10" : "border-white/5 bg-[#0a1529]/40"
                  )}
                >
                  <div className={cn("h-12 w-12 rounded-xl glass flex items-center justify-center border-white/10", method === opt.id ? "bg-[#00f2ff]/20" : "bg-white/5")}>
                    <opt.icon size={20} className={method === opt.id ? "text-[#00f2ff]" : "text-gray-500"} />
                  </div>
                  <span className={cn("text-[11px] font-black uppercase tracking-widest", method === opt.id ? "text-white" : "text-gray-600")}>
                    {opt.name}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-8">
            <div className="glass rounded-[40px] p-8 border-white/5 bg-[#0a1529]/40 space-y-8">
               <div className="text-center space-y-2">
                 <Shield size={48} className="mx-auto text-[#00f2ff] opacity-20" />
                 <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">Konfirmasi Deposit</h3>
                 <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Verify Transaction Scope</p>
               </div>

               <div className="space-y-4 pt-4 border-t border-white/5">
                 <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                   <span className="text-gray-500">Nominal Top-Up</span>
                   <span className="text-white">Rp {parseFloat(amount).toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                   <span className="text-gray-500">Method</span>
                   <span className="text-[#00f2ff]">{method}</span>
                 </div>
                 <div className="p-4 rounded-3xl bg-[#00f2ff]/5 border border-[#00f2ff]/20 flex justify-between items-center">
                   <span className="text-[10px] font-black uppercase tracking-widest text-[#00f2ff]">ESTIMASI SALDO</span>
                   <span className="text-xl font-black italic text-[#00f2ff]">{nxReceived} NX</span>
                 </div>
               </div>

               <button 
                 onClick={() => setConfirmed(!confirmed)}
                 className={cn(
                   "w-full h-14 rounded-2xl border transition-all flex items-center justify-center space-x-3",
                   confirmed ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "glass border-white/5 text-gray-600"
                 )}
               >
                 <div className={cn("h-5 w-5 rounded-md border flex items-center justify-center transition-all", confirmed ? "bg-emerald-500 border-emerald-500" : "border-white/20")}>
                   {confirmed && <Check size={14} className="text-[#050b18]" />}
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest">Setujui Transaksi</span>
               </button>

               <button 
                 onClick={handleDeposit}
                 disabled={loading || !confirmed}
                 className="w-full neon-btn h-16 rounded-2xl text-[#050b18] font-black uppercase text-xs tracking-widest flex items-center justify-center disabled:opacity-50"
               >
                 {loading ? <RefreshCw className="animate-spin" size={20} /> : 'Finalisasi Request'}
               </button>
            </div>
          </motion.div>
        )}

        {step === 5 && (
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="glass rounded-[40px] p-8 bg-[#0a1529]/40 border-white/5 space-y-6">
                 <div className="text-center space-y-2">
                   <Building2 size={40} className="mx-auto text-amber-500" />
                   <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">Manual Transfer</h3>
                   <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest italic">Silakan transfer sesuai detail di bawah</p>
                 </div>

                 <div className="p-6 glass rounded-3xl bg-white/5 border-white/5 space-y-4">
                    <div className="space-y-1 text-center">
                       <p className="text-[10px] font-black text-gray-600 uppercase">Transfer Nominal</p>
                       <p className="text-3xl font-black italic text-[#00f2ff]">Rp {parseFloat(amount).toLocaleString()}</p>
                    </div>
                    <div className="h-px bg-white/5" />
                    <div className="space-y-3">
                       <div className="flex justify-between items-center text-[10px] font-black uppercase">
                          <span className="text-gray-500">Bank</span>
                          <span className="text-white">{settings?.manual_bank_name || 'BCA'}</span>
                       </div>
                       <div className="flex justify-between items-center text-[10px] font-black uppercase">
                          <span className="text-gray-500">Account</span>
                          <span className="text-white font-mono tracking-widest">{settings?.manual_bank_account || '1234567890'}</span>
                       </div>
                       <div className="flex justify-between items-center text-[10px] font-black uppercase">
                          <span className="text-gray-500">Holder</span>
                          <span className="text-white">{settings?.manual_bank_holder || 'ADMIN NAXORA'}</span>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start space-x-3 text-amber-400">
                       <AlertCircle size={14} className="mt-0.5" />
                       <p className="text-[9px] font-bold uppercase tracking-wide leading-relaxed">
                          Harap screenshot bukti transfer dan kirimkan ke admin WhatsApp untuk verifikasi cepat.
                       </p>
                    </div>
                    <button 
                      onClick={() => window.open('https://wa.me/628123456789', '_blank')}
                      className="w-full h-14 bg-emerald-500 text-[#050b18] rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center space-x-2"
                    >
                       <Smartphone size={18} />
                       <span>Confirm via WhatsApp</span>
                    </button>
                    <button 
                      onClick={() => navigate('/')}
                      className="w-full h-14 glass rounded-2xl border-white/5 text-gray-500 font-black uppercase text-[10px] tracking-widest"
                    >
                       Back to Dashboard
                    </button>
                 </div>
              </div>
           </motion.div>
        )}

        {step === 6 && qrisData && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pt-4">
             <div className="glass rounded-[40px] p-8 bg-white border-white/10 shadow-[0_0_40px_rgba(255,255,255,0.1)] text-center space-y-6">
                <div className="space-y-1">
                  <p className="text-[11px] font-black uppercase tracking-widest text-[#050b18]/60">Scan QRIS Untuk Bayar</p>
                  <h3 className="text-2xl font-black italic text-[#050b18] uppercase tracking-tighter">Rp {parseFloat(amount).toLocaleString()}</h3>
                </div>

                <div className="bg-white p-4 rounded-3xl border-2 border-gray-100 inline-block shadow-inner">
                  <img src={qrisData.qris_data} className="h-64 w-64" alt="QRIS" />
                </div>

                <div className="flex items-center justify-center space-x-3 text-[10px] font-black uppercase tracking-widest text-emerald-600 animate-pulse bg-emerald-50 py-3 rounded-2xl">
                   <RefreshCw className="animate-spin" size={14} />
                   <span>Waiting for payment node...</span>
                </div>
             </div>
          </motion.div>
        )}

        {step === 7 && (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="py-20 text-center space-y-8">
             <div className="relative inline-block">
               <div className="absolute inset-0 bg-emerald-400 blur-3xl opacity-20" />
               <CheckCircle2 size={100} className="text-emerald-400 relative" />
             </div>
             
             <div className="space-y-3">
                <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">Deposit {type === 'AUTO' ? 'Berhasil' : 'Processed'}</h2>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] leading-relaxed max-w-[280px] mx-auto">
                   {type === 'AUTO' ? 'Asset liquidity successfully updated.' : 'Manual request submitted for admin review.'}
                </p>
             </div>

             <button 
               onClick={() => navigate('/')}
               className="neon-btn px-12 h-14 rounded-2xl text-[#050b18] font-black uppercase text-[10px] tracking-widest"
             >
               Dashboard Core
             </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
