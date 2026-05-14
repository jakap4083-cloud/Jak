import React, { useState, useEffect } from 'react';
import { History, Filter, ArrowUpRight, ArrowDownRight, Zap, RefreshCw, Briefcase, Gift } from 'lucide-react';
import { api } from '../services/api';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

import { toast } from 'sonner';

export default function HistoryPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await api.get('/user/transactions');
      setTransactions(data.transactions);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    setCancellingId(id);
    try {
      await api.post('/transactions/cancel', { id });
      toast.success('Penarikan Dibatalkan', {
        description: 'Saldo Anda telah dikembalikan sepenuhnya.',
      });
      loadHistory();
    } catch (err: any) {
      toast.error('Gagal Membatalkan', {
        description: err.message || 'Hanya penarikan tertunda yang bisa dibatalkan.',
      });
    } finally {
      setCancellingId(null);
    }
  };

  const filters = [
    { id: 'ALL', label: 'Semua' },
    { id: 'DEPOSIT', label: 'Deposit' },
    { id: 'WITHDRAW', label: 'Penarikan' },
    { id: 'MINING', label: 'Mining' },
    { id: 'REFERRAL_REWARD', label: 'Reward' },
    { id: 'CONVERT', label: 'Konversi' },
  ];

  const filtered = transactions.filter(t => filter === 'ALL' || t.type === filter);

  const getIcon = (type: string) => {
    switch (type) {
      case 'DEPOSIT': return { icon: ArrowUpRight, color: 'text-emerald-400', bg: 'bg-emerald-400/5' };
      case 'WITHDRAW': return { icon: ArrowDownRight, color: 'text-rose-400', bg: 'bg-rose-400/5' };
      case 'MINING': return { icon: Zap, color: 'text-[#00f2ff]', bg: 'bg-[#00f2ff]/5' };
      case 'CONVERT': return { icon: RefreshCw, color: 'text-blue-400', bg: 'bg-blue-400/5' };
      case 'INVEST': return { icon: Briefcase, color: 'text-purple-400', bg: 'bg-purple-400/5' };
      case 'REFERRAL_REWARD': return { icon: Gift, color: 'text-amber-400', bg: 'bg-amber-400/5' };
      default: return { icon: Gift, color: 'text-[#00f2ff]', bg: 'bg-[#00f2ff]/5' };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 rounded-2xl bg-[#00f2ff]/10 flex items-center justify-center text-[#00f2ff] border border-[#00f2ff]/20">
          <History size={22} className="drop-shadow-[0_0_8px_#00f2ff]" />
        </div>
        <h1 className="text-xl font-black uppercase tracking-tighter italic">Riwayat Transaksi</h1>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-3 overflow-x-auto pb-4 scrollbar-hide px-1">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              "px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300 border shadow-lg",
              filter === f.id 
                ? "bg-gradient-to-br from-[#00f2ff] to-[#00b4d8] text-[#050b18] border-transparent shadow-[0_0_15px_rgba(0,242,255,0.3)]" 
                : "bg-white/5 text-gray-500 border-white/5 hover:border-white/10"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {loading ? (
          Array(5).fill(0).map((_, i) => <div key={i} className="h-24 glass rounded-[32px] animate-pulse" />)
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 glass rounded-[40px] border-white/5 bg-[#0a1529]/20">
            <History size={60} className="mx-auto mb-4 text-gray-800" />
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-700 italic">No Data Nodes Found</p>
          </div>
        ) : (
          filtered.map((t) => {
            const { icon: Icon, color, bg } = getIcon(t.type);
            return (
              <div key={t.id} className="glass rounded-[32px] p-6 flex items-center justify-between border-white/5 bg-[#0a1529]/30 hover:border-white/10 transition-colors">
                <div className="flex items-center space-x-5">
                  <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center border border-white/5", bg, color)}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase italic tracking-tighter w-40 truncate leading-none">{t.description}</h4>
                    <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mt-1.5 tracking-tighter">{format(new Date(t.created_at), 'dd MMM yyyy, HH:mm')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn("text-lg font-black italic tracking-tighter leading-none", 
                    ['DEPOSIT', 'MINING', 'REFERRAL_REWARD'].includes(t.type) || (t.type === 'CONVERT' && t.currency === 'IDR') 
                    ? 'text-emerald-400' : 'text-rose-400')}>
                    {['DEPOSIT', 'MINING', 'REFERRAL_REWARD'].includes(t.type) || (t.type === 'CONVERT' && t.currency === 'IDR') ? '+' : '-'}
                    {t.amount.toLocaleString()} <span className="text-[10px] uppercase font-black ml-0.5">{t.currency}</span>
                  </p>
                  <div className="mt-1.5 flex justify-end">
                    <span className="text-[8px] font-black uppercase tracking-widest text-gray-700 px-2.5 py-0.5 rounded-full border border-white/5">{t.status}</span>
                  </div>
                  {t.type === 'WITHDRAW' && t.status === 'PENDING' && (
                    <button 
                      onClick={() => handleCancel(t.id)}
                      disabled={cancellingId === t.id}
                      className="mt-2 text-[8px] font-black uppercase text-rose-500 hover:text-rose-400 transition-colors tracking-widest block w-full text-right"
                    >
                      {cancellingId === t.id ? 'Cancelling...' : 'Batalkan'}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
