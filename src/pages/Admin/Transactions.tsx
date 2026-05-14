import React, { useState, useEffect } from 'react';
import { Check, X, Clock, ArrowUpRight, ArrowDownRight, Search, RefreshCw, Filter } from 'lucide-react';
import { api } from '../../services/api';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');

  const [search, setSearch] = useState('');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const data = await api.getAllTransactions();
      setTransactions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await api.updateTransaction(id, status);
      loadTransactions();
    } catch (err) {
      alert('Gagal update status');
    }
  };

  const filtered = transactions.filter(t => {
    const matchesFilter = filter === 'ALL' || t.status === filter;
    const matchesSearch = 
      t.username.toLowerCase().includes(search.toLowerCase()) ||
      t.type.toLowerCase().includes(search.toLowerCase()) ||
      (t.method && t.method.toLowerCase().includes(search.toLowerCase())) ||
      (t.address && t.address.toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase italic tracking-tighter text-white">Transaction Nodes</h1>
          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Global Traffic Monitor</p>
        </div>
        <button onClick={loadTransactions} className="p-3 glass rounded-2xl border-white/5 text-gray-500 hover:text-[#00f2ff] transition-all">
           <RefreshCw size={24} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#00f2ff] transition-colors" size={18} />
        <input 
          type="text"
          placeholder="SEARCH USER, TYPE, OR METHOD..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full h-14 bg-[#0a1529]/60 border border-white/5 rounded-3xl pl-14 pr-4 focus:border-[#00f2ff]/50 outline-none text-[10px] font-black uppercase tracking-widest text-[#00f2ff] placeholder:text-gray-800"
        />
      </div>

      {/* Filters */}
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
        {['PENDING', 'COMPLETED', 'FAILED', 'ALL'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-5 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all border",
              filter === f ? "bg-[#00f2ff] text-[#050b18] border-transparent" : "glass text-gray-500 border-white/5"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {loading ? (
          Array(5).fill(0).map((_, i) => <div key={i} className="h-24 glass rounded-[32px] animate-pulse" />)
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 glass rounded-[40px] border-white/5">
            <Clock size={48} className="mx-auto mb-4 text-gray-800" />
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-700 italic">No Pending Signals</p>
          </div>
        ) : (
          filtered.map((t) => (
            <div key={t.id} className="glass rounded-[32px] p-6 border-white/5 bg-[#0a1529]/30 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={cn(
                    "h-12 w-12 rounded-2xl flex items-center justify-center",
                    t.type === 'DEPOSIT' ? 'bg-emerald-400/5 text-emerald-400' : 'bg-rose-400/5 text-rose-400'
                  )}>
                    {t.type === 'DEPOSIT' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase italic tracking-tighter">{t.type} Request</h4>
                    <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mt-1">{t.username}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black italic tracking-tighter text-white">Rp {t.amount.toLocaleString()}</p>
                  <p className="text-[8px] text-gray-700 font-black uppercase tracking-widest">{format(new Date(t.created_at), 'dd/MM HH:mm')}</p>
                </div>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                 <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Target Address / Method</p>
                 <p className="text-xs font-mono text-[#00f2ff]">{t.method} {t.address}</p>
              </div>

              {t.status === 'PENDING' && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button 
                    onClick={() => handleStatusUpdate(t.id, 'COMPLETED')}
                    className="flex items-center justify-center space-x-2 py-3 bg-emerald-400/10 text-emerald-400 rounded-2xl border border-emerald-400/20 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400/20"
                  >
                    <Check size={16} />
                    <span>Approve</span>
                  </button>
                  <button 
                    onClick={() => handleStatusUpdate(t.id, 'FAILED')}
                    className="flex items-center justify-center space-x-2 py-3 bg-rose-400/10 text-rose-400 rounded-2xl border border-rose-400/20 text-[10px] font-black uppercase tracking-widest hover:bg-rose-400/20"
                  >
                    <X size={16} />
                    <span>Reject</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
