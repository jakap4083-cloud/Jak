import React, { useState, useEffect } from 'react';
import { Package, Search, Edit3, Trash2, Save, X, RefreshCw, Briefcase, Zap, Shield, Rocket } from 'lucide-react';
import { api } from '../../services/api';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.products);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (product: any) => {
    setEditingId(product.id);
    setEditForm({
      ...product,
      per_day: product.reward_per_mining * product.mining_per_day
    });
  };

  const handleSave = async () => {
    if (!editForm) return;
    setSaving(true);
    try {
      // Calculate reward_per_mining based on per_day
      const updatedProduct = {
        ...editForm,
        reward_per_mining: editForm.per_day / 3
      };
      
      // Since I don't have a specific update product endpoint, I'll update via settings if I have to, 
      // but actually I'll add an endpoint to server.ts for this.
      await api.post('/admin/products/update', updatedProduct);
      
      toast.success('Produk Berhasil Diperbarui');
      setEditingId(null);
      loadProducts();
    } catch (e: any) {
      toast.error('Gagal memperbarui produk', { description: e.message });
    } finally {
      setSaving(false);
    }
  };

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const categories = {
    BASIC: { color: 'text-blue-400', icon: Shield },
    MEDIUM: { color: 'text-purple-400', icon: Zap },
    HARD: { color: 'text-amber-400', icon: Rocket }
  };

  if (loading) return <div className="p-10 text-center animate-pulse text-[#00f2ff] font-black uppercase tracking-widest italic">Loading Neural Assets...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase italic tracking-tighter text-white">Product Matrix</h1>
          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Manage 12 Mining Nodes</p>
        </div>
      </div>

      <div className="relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#00f2ff] transition-colors" size={18} />
        <input 
          type="text"
          placeholder="SEARCH BY NAME OR CATEGORY..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full h-14 bg-[#0a1529]/60 border border-white/5 rounded-3xl pl-14 pr-4 focus:border-[#00f2ff]/50 outline-none text-[10px] font-black uppercase tracking-widest text-[#00f2ff] placeholder:text-gray-800"
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filtered.map((p) => {
          const isEditing = editingId === p.id;
          const CatIcon = (categories as any)[p.category]?.icon || Briefcase;
          const dailyProfit = p.reward_per_mining * p.mining_per_day;
          const totalIncome = dailyProfit * p.duration_days;
          const roi = (totalIncome / p.price_nx) * 100;

          return (
            <motion.div 
              key={p.id}
              layout
              className={cn(
                "glass rounded-[32px] p-6 border transition-all relative overflow-hidden",
                isEditing ? "border-[#00f2ff]/50 bg-[#0a1529]/80 shadow-[0_0_30px_rgba(0,242,255,0.1)]" : "border-white/5 bg-[#0a1529]/40"
              )}
            >
              <div className="flex items-center space-x-5">
                <div className="h-20 w-20 rounded-2xl overflow-hidden glass border border-white/10 shrink-0">
                  <img src={p.image_url} className="w-full h-full object-cover" alt={p.name} />
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="font-black text-white uppercase tracking-tighter italic">{p.name}</h3>
                      <div className="flex items-center space-x-2">
                        <CatIcon size={12} className={(categories as any)[p.category]?.color} />
                        <span className={cn("text-[8px] font-black uppercase tracking-widest", (categories as any)[p.category]?.color)}>
                          {p.category} NODE
                        </span>
                      </div>
                    </div>
                    {!isEditing && (
                      <button 
                        onClick={() => startEdit(p)}
                        className="p-2 glass rounded-xl border-white/5 text-gray-500 hover:text-[#00f2ff] transition-all"
                      >
                        <Edit3 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {isEditing ? (
                <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest px-2">Price (NX)</label>
                      <input 
                        type="number"
                        value={editForm.price_nx}
                        onChange={e => setEditForm({ ...editForm, price_nx: parseFloat(e.target.value) })}
                        className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 outline-none focus:border-[#00f2ff]/50 text-white font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest px-2">Duration (Days)</label>
                      <input 
                        type="number"
                        value={editForm.duration_days}
                        onChange={e => setEditForm({ ...editForm, duration_days: parseInt(e.target.value) })}
                        className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 outline-none focus:border-[#00f2ff]/50 text-white font-bold"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest px-2">Daily Revenue (Total NX)</label>
                    <div className="relative">
                      <input 
                        type="number"
                        step="0.01"
                        value={editForm.per_day}
                        onChange={e => setEditForm({ ...editForm, per_day: parseFloat(e.target.value) })}
                        className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 outline-none focus:border-[#00f2ff]/50 text-white font-bold"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-[#00f2ff] uppercase tracking-widest">
                        { (editForm.per_day / 3).toFixed(2) } NX / Mining
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex space-x-3">
                    <button 
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1 neon-btn h-12 rounded-xl text-[#050b18] font-black uppercase text-[10px] tracking-widest flex items-center justify-center space-x-2"
                    >
                      {saving ? <RefreshCw className="animate-spin" size={14} /> : <Save size={14} />}
                      <span>Save Changes</span>
                    </button>
                    <button 
                      onClick={() => setEditingId(null)}
                      className="px-6 glass rounded-xl border-white/5 text-gray-500 font-bold uppercase text-[10px] tracking-widest"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-6 grid grid-cols-4 gap-2">
                  <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                    <p className="text-[7px] text-gray-600 font-bold uppercase tracking-widest mb-1">Price</p>
                    <p className="text-xs font-black text-white">{p.price_nx}</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                    <p className="text-[7px] text-gray-600 font-bold uppercase tracking-widest mb-1">Duration</p>
                    <p className="text-xs font-black text-white">{p.duration_days}D</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                    <p className="text-[7px] text-gray-600 font-bold uppercase tracking-widest mb-1">Daily</p>
                    <p className="text-xs font-black text-[#00f2ff] italic">{dailyProfit.toFixed(2)}</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                    <p className="text-[7px] text-gray-600 font-bold uppercase tracking-widest mb-1">ROI</p>
                    <p className="text-xs font-black text-emerald-400 italic">{roi.toFixed(0)}%</p>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
