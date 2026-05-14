import React, { useState, useEffect } from 'react';
import { Users, Search, Edit2, Shield, Trash2, CheckCircle2, XCircle, Snowflake, Flame, Plus, Minus, Save, X, RefreshCw, CreditCard } from 'lucide-react';
import { api } from '../../services/api';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<any>(null);
  const [viewingUser, setViewingUser] = useState<any>(null); // Full user details object
  const [adjustingBalance, setAdjustingBalance] = useState<any>(null); // { userId, type, currency, amount }
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const handleViewUser = async (userId: string) => {
    setProcessing(true);
    try {
      const data = await api.get(`/admin/users/${userId}/details`);
      setViewingUser(data);
    } catch (e: any) {
      toast.error('Gagal mengambil detail member');
    } finally {
      setProcessing(false);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await api.getAllUsers();
      setUsers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (userId: string, updates: any) => {
    setProcessing(true);
    try {
      await api.post('/admin/users/status', { userId, ...updates });
      toast.success('Status Member Diperbarui');
      loadUsers();
    } catch (e: any) {
      toast.error('Gagal update status', { description: e.message });
    } finally {
      setProcessing(false);
    }
  };

  const handleBalanceAdjust = async () => {
    if (!adjustingBalance || !adjustingBalance.amount) return;
    setProcessing(true);
    try {
      await api.post('/admin/users/balance', adjustingBalance);
      toast.success('Saldo Berhasil Disesuaikan');
      setAdjustingBalance(null);
      loadUsers();
    } catch (e: any) {
      toast.error('Gagal menyesuaikan saldo', { description: e.message });
    } finally {
      setProcessing(false);
    }
  };

  const filtered = users.filter(u => 
    u.username.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase italic tracking-tighter text-white">Member Database</h1>
          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Global Protocol Management</p>
        </div>
      </div>

      <div className="relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#00f2ff] transition-colors" size={18} />
        <input 
          type="text"
          placeholder="SEARCH BY USERNAME, EMAIL OR ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full h-14 bg-[#0a1529]/60 border border-white/5 rounded-3xl pl-14 pr-4 focus:border-[#00f2ff]/50 outline-none text-[10px] font-black uppercase tracking-widest text-[#00f2ff] placeholder:text-gray-800"
        />
      </div>

      <div className="space-y-4">
        {loading ? (
          Array(5).fill(0).map((_, i) => <div key={i} className="h-20 glass rounded-3xl animate-pulse" />)
        ) : (
          filtered.map((u) => (
            <motion.div 
              layout
              key={u.id} 
              className={cn(
                "glass rounded-[32px] p-6 border transition-all bg-[#0a1529]/30",
                u.status === 'BLOCKED' ? "border-rose-500/30 opacity-60" : "border-white/5"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} 
                      className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10"
                      alt="U"
                    />
                    {u.is_frozen && (
                      <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1 border-2 border-[#0a1529]">
                        <Snowflake size={10} className="text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                     <div className="flex items-center space-x-2">
                        <h4 className="text-lg font-black uppercase italic tracking-tighter text-white">{u.username}</h4>
                        {u.role === 'ADMIN' && <Shield size={12} className="text-[#00f2ff]" />}
                     </div>
                     <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest font-mono">{u.id.substring(0, 8)} • Joined {new Date(u.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                   <button 
                     onClick={() => handleViewUser(u.id)}
                     disabled={processing}
                     className="px-4 py-2 glass rounded-xl border-white/5 text-[9px] font-black uppercase tracking-widest text-[#00f2ff] hover:bg-[#00f2ff]/10 transition-colors"
                   >
                     View Data
                   </button>
                   <button 
                     onClick={() => setAdjustingBalance({ userId: u.id, type: 'ADD', currency: 'NX', amount: 0 })}
                     className="px-4 py-2 glass rounded-xl border-white/5 text-[9px] font-black uppercase tracking-widest text-emerald-400 hover:bg-emerald-400/10 transition-colors"
                   >
                     Adjust Saldo
                   </button>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="p-4 glass rounded-2xl bg-white/5">
                  <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">NX Balance</p>
                  <p className="text-lg font-black text-[#00f2ff] italic">{u.balance_nx.toLocaleString()}</p>
                </div>
                <div className="p-4 glass rounded-2xl bg-white/5">
                  <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">IDR Balance</p>
                  <p className="text-lg font-black text-white italic">Rp {u.balance_idr.toLocaleString()}</p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex space-x-4">
                  <button 
                    disabled={processing}
                    onClick={() => handleStatusUpdate(u.id, { status: u.status === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED' })}
                    className={cn(
                      "flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest transition-colors",
                      u.status === 'BLOCKED' ? "text-emerald-400" : "text-rose-500"
                    )}
                  >
                    {u.status === 'BLOCKED' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    <span>{u.status === 'BLOCKED' ? 'Unlock Account' : 'Block Account'}</span>
                  </button>

                  <button 
                    disabled={processing}
                    onClick={() => handleStatusUpdate(u.id, { is_frozen: !u.is_frozen })}
                    className={cn(
                      "flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest transition-colors",
                      u.is_frozen ? "text-orange-400" : "text-blue-400"
                    )}
                  >
                    <Snowflake size={14} />
                    <span>{u.is_frozen ? 'Thaw Funds' : 'Freeze Funds'}</span>
                  </button>
                </div>

                <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest">
                  {u.status} • {u.is_frozen ? 'FROZEN' : 'LIQUID'}
                </p>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* User Details Modal */}
      <AnimatePresence>
        {viewingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-12">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingUser(null)}
              className="absolute inset-0 bg-[#050b18]/90 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="relative w-full max-w-2xl glass rounded-[40px] border-white/10 bg-[#0a1529]/95 shadow-2xl flex flex-col h-full max-h-[90vh] overflow-hidden"
            >
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#00f2ff]">
                    <Users size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">{viewingUser.user.username} Profile</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{viewingUser.user.id}</p>
                  </div>
                </div>
                <button onClick={() => setViewingUser(null)} className="h-12 w-12 glass rounded-2xl flex items-center justify-center text-gray-500 hover:text-white transition-all">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-10">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 glass rounded-3xl bg-white/5 space-y-1">
                    <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">NX Balance</p>
                    <p className="text-lg font-black text-[#00f2ff] italic">{viewingUser.user.balance_nx.toLocaleString()}</p>
                  </div>
                  <div className="p-4 glass rounded-3xl bg-white/5 space-y-1">
                    <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">IDR Balance</p>
                    <p className="text-lg font-black text-white italic">Rp {viewingUser.user.balance_idr.toLocaleString()}</p>
                  </div>
                  <div className="p-4 glass rounded-3xl bg-white/5 space-y-1">
                    <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Referrals</p>
                    <p className="text-lg font-black text-purple-400 italic">{viewingUser.referrals}</p>
                  </div>
                  <div className="p-4 glass rounded-3xl bg-white/5 space-y-1">
                    <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Auth Tier</p>
                    <p className="text-lg font-black text-orange-400 italic">{viewingUser.user.tier}</p>
                  </div>
                </div>

                {/* Bank Info */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-[#00f2ff] italic flex items-center space-x-2">
                    <CreditCard size={14} />
                    <span>Neural Bank Credentials</span>
                  </h4>
                  <div className="glass rounded-[32px] p-6 border-white/5 bg-white/5 space-y-4">
                     <div className="grid grid-cols-2 gap-8">
                        <div>
                           <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Bank Node</p>
                           <p className="text-sm font-black text-white uppercase italic">{viewingUser.user.bank_name || 'NOT SET'}</p>
                        </div>
                        <div>
                           <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Account Proxy</p>
                           <p className="text-sm font-black text-white underline decoration-[#00f2ff]/30">{viewingUser.user.bank_account || 'NOT SET'}</p>
                        </div>
                     </div>
                     <div>
                        <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Holder Identity</p>
                        <p className="text-sm font-black text-white uppercase tracking-wider">{viewingUser.user.bank_holder || 'NOT SET'}</p>
                     </div>
                  </div>
                </div>

                {/* Active Assets */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-[#00f2ff] italic flex items-center space-x-2">
                    <Flame size={14} />
                    <span>Active Mining Assets ({viewingUser.userProducts.length})</span>
                  </h4>
                  <div className="space-y-3">
                    {viewingUser.userProducts.length === 0 ? (
                      <p className="text-xs text-gray-700 italic text-center py-4 uppercase font-black tracking-widest">No Active Assets Found</p>
                    ) : (
                      viewingUser.userProducts.map((up: any) => (
                        <div key={up.id} className="glass rounded-2xl p-4 border-white/5 flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-[#00f2ff]">
                              <Flame size={18} />
                            </div>
                            <div>
                              <p className="text-xs font-black text-white uppercase italic">{up.product.name}</p>
                              <p className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">{up.status} • Exp {new Date(up.expiry_date).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="text-right">
                             <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Daily Mining</p>
                             <p className="text-xs font-black text-white">{up.mining_count_today} / {up.product.mining_per_day}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Recent Transactions */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-[#00f2ff] italic flex items-center space-x-2">
                    <RefreshCw size={14} />
                    <span>Recent Log Entries</span>
                  </h4>
                  <div className="space-y-2">
                     {viewingUser.transactions.map((tx: any) => (
                       <div key={tx.id} className="flex items-center justify-between p-4 glass rounded-2xl border-white/5 bg-white/5">
                          <div className="flex items-center space-x-3">
                             <div className={cn(
                               "h-8 w-8 rounded-lg flex items-center justify-center",
                               tx.type === 'DEPOSIT' || tx.type === 'REWARD' ? "bg-emerald-500/20 text-emerald-400" : 
                               tx.type === 'WITHDRAW' ? "bg-rose-500/20 text-rose-500" : "bg-white/5 text-gray-400"
                             )}>
                               <CreditCard size={14} />
                             </div>
                             <div>
                                <p className="text-[10px] font-black text-white uppercase italic leading-none">{tx.type}</p>
                                <p className="text-[7px] text-gray-600 font-bold uppercase tracking-widest mt-1">{new Date(tx.created_at).toLocaleString()}</p>
                             </div>
                          </div>
                          <div className="text-right">
                             <p className={cn(
                               "text-xs font-black italic",
                               tx.type === 'DEPOSIT' || tx.type === 'REWARD' || tx.type === 'MINING' ? "text-emerald-400" : "text-rose-500"
                             )}>
                               {tx.type === 'DEPOSIT' || tx.type === 'REWARD' || tx.type === 'MINING' ? '+' : '-'} {tx.amount.toLocaleString()} {tx.currency}
                             </p>
                             <p className="text-[7px] text-gray-700 font-black uppercase tracking-widest">{tx.status}</p>
                          </div>
                       </div>
                     ))}
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-white/5 bg-white/5 flex space-x-4">
                <button 
                  onClick={() => {
                    handleStatusUpdate(viewingUser.user.id, { status: viewingUser.user.status === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED' });
                    setViewingUser(null);
                  }}
                  className={cn(
                    "flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[9px] flex items-center justify-center space-x-2 border transition-all",
                    viewingUser.user.status === 'BLOCKED' ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/20" : "bg-rose-500/10 border-rose-500/50 text-rose-500 hover:bg-rose-500/20"
                  )}
                >
                  {viewingUser.user.status === 'BLOCKED' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                  <span>{viewingUser.user.status === 'BLOCKED' ? 'Unlock Account' : 'Block Account'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Balance Adjust Modal */}
      <AnimatePresence>
        {adjustingBalance && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAdjustingBalance(null)}
              className="absolute inset-0 bg-[#050b18]/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm glass rounded-[40px] p-8 border-white/10 bg-[#0a1529]/95 shadow-2xl space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">Adjust Protocol</h3>
                <button onClick={() => setAdjustingBalance(null)} className="p-2 text-gray-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setAdjustingBalance({ ...adjustingBalance, currency: 'NX' })}
                  className={cn(
                    "h-12 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                    adjustingBalance.currency === 'NX' ? "bg-[#00f2ff]/20 border-[#00f2ff] text-[#00f2ff]" : "glass border-white/5 text-gray-500"
                  )}
                >
                  Neural (NX)
                </button>
                <button 
                  onClick={() => setAdjustingBalance({ ...adjustingBalance, currency: 'IDR' })}
                  className={cn(
                    "h-12 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                    adjustingBalance.currency === 'IDR' ? "bg-white/10 border-white text-white" : "glass border-white/5 text-gray-500"
                  )}
                >
                  Fiat (IDR)
                </button>
              </div>

              <div className="flex rounded-xl overflow-hidden border border-white/5">
                <button 
                  onClick={() => setAdjustingBalance({ ...adjustingBalance, type: 'ADD' })}
                  className={cn(
                    "flex-1 h-12 flex items-center justify-center space-x-2 transition-all",
                    adjustingBalance.type === 'ADD' ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-gray-500"
                  )}
                >
                  <Plus size={16} />
                </button>
                <button 
                  onClick={() => setAdjustingBalance({ ...adjustingBalance, type: 'SUB' })}
                  className={cn(
                    "flex-1 h-12 flex items-center justify-center space-x-2 transition-all",
                    adjustingBalance.type === 'SUB' ? "bg-rose-500/20 text-rose-500" : "bg-white/5 text-gray-500"
                  )}
                >
                  <Minus size={16} />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">Amount</label>
                <input 
                  type="number"
                  value={adjustingBalance.amount || ''}
                  onChange={e => setAdjustingBalance({ ...adjustingBalance, amount: parseFloat(e.target.value) })}
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 outline-none focus:border-[#00f2ff]/50 text-white font-black text-lg text-center"
                  placeholder="0.00"
                />
              </div>

              <button 
                onClick={handleBalanceAdjust}
                disabled={processing}
                className="w-full neon-btn h-14 rounded-2xl text-[#050b18] font-black uppercase tracking-widest text-[10px] flex items-center justify-center space-x-2"
              >
                {processing ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                <span>Authorize Change</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
