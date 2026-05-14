import React, { useState, useEffect } from 'react';
import { User, Shield, CreditCard, Lock, MessageSquare, Info, LogOut, ChevronRight, Crown, Phone, Mail, User2, LayoutDashboard, Copy, Check, Briefcase, Clock, Calendar, CheckCircle2, AlertCircle, History } from 'lucide-react';
import { useAuth } from '../App';
import { api } from '../services/api';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';

interface InvestmentRecord {
  id: string;
  product: {
    name: string;
    reward_per_mining: number;
    price_nx: number;
  };
  purchase_date: string;
  expiry_date: string;
  status: string;
}

import { toast } from 'sonner';

export default function Profile() {
  const { user, setUser, refreshUser } = useAuth();
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<InvestmentRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  
  const [bankForm, setBankForm] = useState({
    bank_name: user?.bank_name || '',
    bank_account: user?.bank_account || '',
    bank_holder: user?.bank_holder || '',
  });

  useEffect(() => {
    if (user) {
      setBankForm({
        bank_name: user.bank_name || '',
        bank_account: user.bank_account || '',
        bank_holder: user.bank_holder || '',
      });
    }
  }, [user]);

  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinForm, setPinForm] = useState({
    old_pin: '',
    new_pin: '',
    confirm_pin: '',
  });

  const handleUpdatePin = async () => {
    if (user?.transfer_pin && !pinForm.old_pin) {
       return toast.error('Silakan isi PIN lama');
    }
    if (pinForm.new_pin.length !== 6 || pinForm.new_pin !== pinForm.confirm_pin) {
       return toast.error('PIN baru tidak valid atau tidak cocok');
    }

    try {
      if (user?.transfer_pin) {
        // Verification step first if changing
        await api.post('/user/pin/verify', { pin: pinForm.old_pin });
      }
      await api.post('/user/pin/set', { pin: pinForm.new_pin });
      toast.success('PIN Berhasil Diperbarui');
      setIsPinModalOpen(false);
      setPinForm({ old_pin: '', new_pin: '', confirm_pin: '' });
      refreshUser();
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Gagal memperbarui PIN');
    }
  };

  const handleUpdateBank = async () => {
    if (!bankForm.bank_name || !bankForm.bank_account || !bankForm.bank_holder) {
      toast.error('Data Tidak Lengkap', {
        description: 'Silakan isi semua kolom informasi bank.',
      });
      return;
    }

    try {
      await api.post('/user/bank', bankForm);
      toast.success('Bank Berhasil Dikaitkan', {
        description: 'Informasi rekening Anda telah diperbarui.',
      });
      refreshUser();
      setIsBankModalOpen(false);
    } catch (e: any) {
      toast.error('Gagal Memperbarui Bank', {
        description: e.message || 'Terjadi kesalahan sistem.',
      });
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout', {});
      setUser(null);
      toast.info('Sesi Berakhir', {
        description: 'Anda telah keluar dari aplikasi.',
      });
    } catch (e) {
      console.error(e);
    }
  };

  const copyReferralLink = () => {
    if (!user) return;
    const link = `${window.location.origin}/auth?ref=${user.referral_code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const menuItems = [
    { label: 'Data Akun', icon: User2, value: user?.username },
    { label: 'Nama Lengkap', icon: User, value: 'User Premium' },
    { label: 'Email', icon: Mail, value: user?.email },
    { label: 'Nomor HP', icon: Phone, value: user?.phone },
    { label: 'Ubah Kata Sandi', icon: Lock, action: () => toast.info('Fitur segera hadir') },
    { label: 'Kaitkan Bank', icon: CreditCard, action: () => setIsBankModalOpen(true) },
    { label: 'Keamanan PIN', icon: Shield, action: () => setIsPinModalOpen(true) },
    { label: 'WhatsApp Admin', icon: MessageSquare, isExternal: true, path: 'https://wa.me/628123456789' },
    { label: 'Telegram Admin', icon: MessageSquare, isExternal: true, path: 'https://t.me/naxora' },
    { label: 'Tentang Naxora', icon: Info, path: '#' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 rounded-2xl bg-[#00f2ff]/10 flex items-center justify-center text-[#00f2ff] border border-[#00f2ff]/20">
          <User size={22} className="drop-shadow-[0_0_8px_#00f2ff]" />
        </div>
        <h1 className="text-xl font-black uppercase tracking-tighter italic">Profil Saya</h1>
      </div>

      {/* User Card */}
      <div className="glass rounded-[48px] p-8 text-center relative overflow-hidden border-white/5 cyber-gradient">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Crown size={80} className="rotate-12" />
        </div>
        
        <div className="relative inline-block mb-4">
          <div className="h-32 w-32 rounded-full border-2 border-[#00f2ff] p-1.5 relative z-10">
            <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} 
              className="h-full w-full rounded-full bg-[#0a1529]/80 backdrop-blur-xl border border-white/10"
              alt="User"
            />
            <div className="absolute inset-0 bg-[#00f2ff] rounded-full blur-2xl opacity-10 -z-10" />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-yellow-400 to-amber-600 p-2 rounded-full shadow-lg ring-4 ring-[#050b18] z-20">
            <Crown size={18} className="text-[#050b18]" fill="currentColor" />
          </div>
        </div>
        <h2 className="text-2xl font-black italic uppercase tracking-tighter">{user?.username}</h2>
        <div className="flex items-center justify-center space-x-2 mt-2">
          <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-amber-600 rounded text-[9px] font-black italic uppercase tracking-widest text-[#050b18]">
            {user?.tier} Member
          </span>
        </div>
        
        <div className="mt-8 grid grid-cols-2 gap-4 bg-white/5 rounded-[2rem] p-5 border border-white/5">
           <div className="text-center relative group">
              <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1.5">Referral ID</p>
              <div className="flex items-center justify-center space-x-2">
                <p className="font-black text-[#00f2ff] tracking-widest italic">{user?.referral_code}</p>
                <button 
                  onClick={copyReferralLink}
                  className={cn(
                    "p-1.5 rounded-lg transition-all duration-300",
                    copied ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-gray-500 hover:text-[#00f2ff]"
                  )}
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                </button>
              </div>
           </div>
           <div className="text-center border-l border-white/10">
              <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1.5">Loyalty Rank</p>
              <p className="font-black text-white italic">Elite {user?.tier === 'VIP' ? 'II' : 'I'}</p>
           </div>
        </div>
      </div>

      {/* Admin Quick Entry */}
      {user?.role === 'ADMIN' && (
        <Link 
          to="/admin" 
          className="glass rounded-[32px] p-6 border-white/5 bg-gradient-to-br from-[#4d00ff]/20 to-transparent flex items-center justify-between group"
        >
          <div className="flex items-center space-x-5">
            <div className="h-12 w-12 rounded-2xl glass flex items-center justify-center text-[#00f2ff] bg-[#00f2ff]/10 border-[#00f2ff]/20">
              <LayoutDashboard size={22} />
            </div>
            <div>
              <p className="text-[11px] font-black text-[#00f2ff] uppercase tracking-widest italic">Core Access</p>
              <p className="text-sm font-bold text-white mt-0.5">Admin Dashboard</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-[#00f2ff] group-hover:translate-x-1 transition-all" />
        </Link>
      )}

      {/* Menu List */}
      <div className="glass rounded-[32px] overflow-hidden border-white/5 divide-y divide-white/5">
        {menuItems.map((item, i) => {
          const content = (
            <div className="flex items-center justify-between p-6 hover:bg-white/5 transition-all duration-300 group">
              <div className="flex items-center space-x-5">
                <div className="h-12 w-12 rounded-2xl glass flex items-center justify-center text-gray-400 group-hover:text-[#00f2ff] group-hover:bg-[#00f2ff]/10 group-hover:border-[#00f2ff]/20 transition-all">
                  <item.icon size={22} />
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest group-hover:text-white transition-colors">{item.label}</p>
                  {item.value && <p className="text-sm font-bold text-white mt-0.5">{item.value}</p>}
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-700 group-hover:text-[#00f2ff] group-hover:translate-x-1 transition-all" />
            </div>
          );

          if (item.isExternal) {
            return (
              <a key={i} href={item.path} target="_blank" rel="noopener noreferrer">
                {content}
              </a>
            );
          }

          if (item.path && item.path !== '#') {
            return (
              <Link key={i} to={item.path}>
                {content}
              </Link>
            );
          }

          return (
            <button key={i} onClick={item.action} className="w-full">
              {content}
            </button>
          );
        })}
      </div>

      {/* Investment History Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center space-x-2">
            <Briefcase size={16} className="text-[#00f2ff]" />
            <h3 className="text-[10px] font-black uppercase tracking-widest text-[#00f2ff]">Investment History</h3>
          </div>
          <Link to="/investment" className="text-[9px] font-black text-gray-500 hover:text-white uppercase tracking-widest transition-colors">
            Lihat Produk
          </Link>
        </div>

        <div className="glass rounded-[32px] overflow-hidden border-white/5 p-2 bg-[#0a1529]/40">
          {loadingHistory ? (
            <div className="p-8 text-center text-gray-500 animate-pulse uppercase text-[10px] font-black tracking-widest">
              Connecting Neural History...
            </div>
          ) : history.length > 0 ? (
            <div className="space-y-2">
              {history.map((record) => (
                <div 
                  key={record.id} 
                  className="glass rounded-2xl p-4 border-white/5 flex items-center justify-between bg-white/[0.02]"
                >
                  <div className="flex items-center space-x-4">
                    <div className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center border",
                      record.status === 'ACTIVE' ? "bg-emerald-400/10 border-emerald-400/20 text-emerald-400" : "bg-gray-400/10 border-white/10 text-gray-500"
                    )}>
                      {record.status === 'ACTIVE' ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                    </div>
                    <div>
                      <h4 className="text-[11px] font-black text-white uppercase italic tracking-tight">{record.product.name}</h4>
                      <div className="flex items-center space-x-2 mt-0.5 text-[#00f2ff]">
                         <Calendar size={10} />
                         <span className="text-[8px] font-bold uppercase tracking-widest opacity-60">
                           {format(new Date(record.purchase_date), 'dd MMM yyyy', { locale: id })}
                         </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={cn(
                      "text-[9px] font-black uppercase leading-none mb-1",
                      record.status === 'ACTIVE' ? "text-emerald-400" : "text-gray-500"
                    )}>
                      {record.status}
                    </p>
                    <p className="text-[10px] font-black italic text-gray-400">
                      {record.product.reward_per_mining} NX/Mining
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center space-y-3 opacity-40">
              <History size={40} className="mx-auto text-gray-600" />
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Belum ada riwayat investasi</p>
            </div>
          )}
        </div>
      </div>

      <button 
        onClick={handleLogout}
        className="w-full h-16 flex items-center justify-center space-x-2 glass border-rose-500/20 text-rose-400 rounded-3xl hover:bg-rose-500/10 transition-colors font-bold uppercase tracking-widest text-sm"
      >
        <LogOut size={20} />
        <span>Keluar Aplikasi</span>
      </button>

      {/* Bank Binding Modal */}
      <AnimatePresence>
        {isBankModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBankModalOpen(false)}
              className="absolute inset-0 bg-[#050b18]/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm glass rounded-[40px] p-8 border-white/10 bg-[#0a1529]/90 shadow-2xl space-y-6"
            >
              <div className="text-center space-y-2">
                <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">Kaitkan Bank</h3>
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest italic">Secure Withdrawal Linkage</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-[#00f2ff] uppercase tracking-widest px-2">Nama Bank / E-Wallet</label>
                  <input 
                    type="text"
                    placeholder="BCA, DANA, OVO, etc."
                    value={bankForm.bank_name}
                    onChange={(e) => setBankForm({ ...bankForm, bank_name: e.target.value })}
                    className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl px-5 focus:border-[#00f2ff]/30 outline-none text-sm font-bold placeholder:text-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-[#00f2ff] uppercase tracking-widest px-2">Nomor Rekening / HP</label>
                  <input 
                    type="text"
                    placeholder="0812xxxx or 1234xxxx"
                    value={bankForm.bank_account}
                    onChange={(e) => setBankForm({ ...bankForm, bank_account: e.target.value })}
                    className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl px-5 focus:border-[#00f2ff]/30 outline-none text-sm font-bold placeholder:text-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-[#00f2ff] uppercase tracking-widest px-2">Nama Pemilik</label>
                  <input 
                    type="text"
                    placeholder="Nama sesuai rekening"
                    value={bankForm.bank_holder}
                    onChange={(e) => setBankForm({ ...bankForm, bank_holder: e.target.value })}
                    className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl px-5 focus:border-[#00f2ff]/30 outline-none text-sm font-bold placeholder:text-gray-700"
                  />
                </div>
              </div>

              <div className="pt-2 space-y-3">
                <button 
                  onClick={handleUpdateBank}
                  className="w-full neon-btn h-14 rounded-2xl text-[#050b18] font-black uppercase tracking-widest text-[10px] flex items-center justify-center"
                >
                  Simpan Perubahan
                </button>
                <button 
                  onClick={() => setIsBankModalOpen(false)}
                  className="w-full h-14 glass rounded-2xl border-white/5 text-gray-500 font-bold uppercase tracking-widest text-[9px]"
                >
                  Kembali
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PIN Security Modal */}
      <AnimatePresence>
        {isPinModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPinModalOpen(false)}
              className="absolute inset-0 bg-[#050b18]/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm glass rounded-[40px] p-8 border-white/10 bg-[#0a1529]/90 shadow-2xl space-y-6"
            >
              <div className="text-center space-y-2">
                <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">Keamanan PIN</h3>
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest italic">
                  {user?.transfer_pin ? 'Update Security Node' : 'Initialize Access PIN'}
                </p>
              </div>

              <div className="space-y-4">
                {user?.transfer_pin && (
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-[#00f2ff] uppercase tracking-widest px-2">PIN Lama</label>
                    <input 
                      type="password"
                      maxLength={6}
                      value={pinForm.old_pin}
                      onChange={(e) => setPinForm({ ...pinForm, old_pin: e.target.value.replace(/\D/g, '') })}
                      className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl px-5 text-center text-xl font-black tracking-widest outline-none focus:border-[#00f2ff]/30"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-[#00f2ff] uppercase tracking-widest px-2">PIN Baru (6 Digit)</label>
                  <input 
                    type="password"
                    maxLength={6}
                    value={pinForm.new_pin}
                    onChange={(e) => setPinForm({ ...pinForm, new_pin: e.target.value.replace(/\D/g, '') })}
                    className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl px-5 text-center text-xl font-black tracking-widest outline-none focus:border-[#00f2ff]/30 placeholder:text-gray-800"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-[#00f2ff] uppercase tracking-widest px-2">Konfirmasi PIN Baru</label>
                  <input 
                    type="password"
                    maxLength={6}
                    value={pinForm.confirm_pin}
                    onChange={(e) => setPinForm({ ...pinForm, confirm_pin: e.target.value.replace(/\D/g, '') })}
                    className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl px-5 text-center text-xl font-black tracking-widest outline-none focus:border-[#00f2ff]/30 placeholder:text-gray-800"
                  />
                </div>
              </div>

              <div className="pt-2 space-y-3">
                <button 
                  onClick={handleUpdatePin}
                  className="w-full neon-btn h-14 rounded-2xl text-[#050b18] font-black uppercase tracking-widest text-[10px] flex items-center justify-center"
                >
                  Otorisasi PIN
                </button>
                <button 
                  onClick={() => setIsPinModalOpen(false)}
                  className="w-full h-14 glass rounded-2xl border-white/5 text-gray-500 font-bold uppercase tracking-widest text-[9px]"
                >
                  Kembali
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <p className="text-center text-[10px] text-white/20 uppercase tracking-widest py-4">Naxora v1.0.4 Premium Edition</p>
    </div>
  );
}
