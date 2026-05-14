import React, { useState, useEffect } from 'react';
import { Briefcase, Zap, Shield, Rocket, ChevronRight, ShoppingCart, Check, RefreshCw, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../services/api';
import { Product } from '../types';
import { cn } from '../lib/utils';
import { useAuth } from '../App';
import { Link } from 'react-router-dom';

import { toast } from 'sonner';

export default function Investment() {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<'BASIC' | 'MEDIUM' | 'HARD'>('BASIC');
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<any>(null);
  const { user, refreshUser } = useAuth();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await api.get('/products');
      setProducts(data.products);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (user && user.balance_nx < product.price_nx) {
      toast.error('Saldo NX Tidak Mencukupi', {
        description: `Anda butuh ${product.price_nx} NX untuk membeli paket ini.`,
      });
      return;
    }

    setBuyingId(productId);
    try {
      const res = await api.post('/invest/buy', { productId });
      toast.success('Pembelian Berhasil!', {
        description: `${product.name} telah diaktifkan ke akun Anda.`,
      });
      setReceipt({ ...res.userProduct, product });
      refreshUser();
    } catch (e: any) {
      toast.error('Gagal membeli produk', {
        description: e.message || 'Silakan coba beberapa saat lagi.',
      });
    } finally {
      setBuyingId(null);
    }
  };

  const filteredProducts = products.filter(p => p.category === category);

  const categories = [
    { id: 'BASIC', label: 'Basic', icon: Shield },
    { id: 'MEDIUM', label: 'Medium', icon: Zap },
    { id: 'HARD', label: 'Hard', icon: Rocket },
  ];

  if (receipt) {
    const p = receipt.product;
    const dailyProfit = p.reward_per_mining * p.mining_per_day;
    const totalIncome = dailyProfit * p.duration_days;
    const roi = (totalIncome / p.price_nx) * 100;

    return (
      <div className="space-y-6">
        <button 
          onClick={() => setReceipt(null)}
          className="flex items-center space-x-2 text-gray-500 hover:text-white transition-colors"
        >
          <ChevronRight className="rotate-180" size={18} />
          <span className="text-[10px] font-black uppercase tracking-widest">Kembali</span>
        </button>

        <div className="glass rounded-[40px] overflow-hidden border border-[#00f2ff]/20 bg-[#0a1529]/60 backdrop-blur-3xl p-8 relative">
          <div className="absolute top-0 right-0 p-8">
             <CheckCircle2 size={40} className="text-emerald-400 opacity-20" />
          </div>
          
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="h-32 w-32 rounded-[32px] overflow-hidden border-2 border-[#00f2ff]/30 shadow-[0_0_30px_rgba(0,242,255,0.2)]">
              <img src={p.image_url} className="w-full h-full object-cover" alt={p.name} />
            </div>
            
            <div className="space-y-1">
              <h1 className="text-3xl font-black italic tracking-tighter uppercase text-white">{p.name}</h1>
              <p className="text-[10px] font-black text-[#00f2ff] uppercase tracking-[0.2em]">Neural Selection Confirmed</p>
            </div>

            <div className="w-full grid grid-cols-2 gap-3 mt-4">
               <div className="p-4 glass rounded-3xl bg-white/5 space-y-1">
                 <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Daily Revenue</p>
                 <p className="text-lg font-black text-[#00f2ff] italic">{dailyProfit} NX</p>
               </div>
               <div className="p-4 glass rounded-3xl bg-white/5 space-y-1">
                 <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Total Forecast</p>
                 <p className="text-lg font-black text-white italic">{totalIncome} NX</p>
               </div>
            </div>

            <div className="w-full space-y-3 pt-4 border-t border-white/5">
               <div className="flex justify-between items-center px-2">
                 <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Transaction ID</span>
                 <span className="text-[10px] font-black text-gray-300 font-mono">#{receipt.id.substring(0, 12).toUpperCase()}</span>
               </div>
               <div className="flex justify-between items-center px-2">
                 <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Start Protocol</span>
                 <span className="text-[10px] font-black text-white">{new Date(receipt.purchase_date).toLocaleString()}</span>
               </div>
               <div className="flex justify-between items-center px-2">
                 <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">End Protocol</span>
                 <span className="text-[10px] font-black text-rose-400">{new Date(receipt.expiry_date).toLocaleString()}</span>
               </div>
               <div className="flex justify-between items-center px-2">
                 <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Contract ROI</span>
                 <span className="text-[10px] font-black text-emerald-400">{roi.toFixed(1)}% Yield</span>
               </div>
            </div>

            <div className="w-full pt-6 space-y-3">
              <Link to="/work" className="w-full neon-btn h-14 rounded-2xl text-[#050b18] font-black uppercase text-[11px] tracking-widest flex items-center justify-center space-x-2">
                <Rocket size={18} />
                <span>Mulai Mining Sekarang</span>
              </Link>
              <button 
                onClick={() => setReceipt(null)}
                className="w-full h-14 glass rounded-2xl border-white/5 text-gray-500 font-black uppercase text-[10px] tracking-widest hover:text-white transition-colors"
              >
                Kembali ke Katalog
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-2xl bg-[#00f2ff]/10 flex items-center justify-center text-[#00f2ff] border border-[#00f2ff]/20">
            <Briefcase size={22} />
          </div>
          <h1 className="text-xl font-black uppercase tracking-tighter italic">Investasi</h1>
        </div>
        <div className="bg-white/5 px-3 py-1 rounded-full border border-white/10">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Saldo: <span className="text-[#00f2ff]">12,450 NX</span></p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1.5 glass rounded-[24px] border-white/5 bg-[#0a1529]/40 backdrop-blur-xl">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id as any)}
            className={cn(
              "flex-1 flex flex-col items-center justify-center py-3 rounded-2xl transition-all duration-300 space-y-1 relative overflow-hidden",
              category === cat.id ? "text-[#050b18] font-bold" : "text-gray-500 hover:text-white"
            )}
          >
            {category === cat.id && (
              <motion.div 
                layoutId="activeTab"
                className="absolute inset-0 bg-gradient-to-br from-[#00f2ff] to-[#00b4d8] rounded-2xl shadow-[0_0_15px_rgba(0,242,255,0.3)]"
              />
            )}
            <cat.icon size={18} className="relative z-10" />
            <span className="text-[10px] uppercase font-black tracking-widest relative z-10">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Product List */}
      <div className="space-y-4">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-48 w-full glass rounded-3xl animate-pulse" />
          ))
        ) : (
          filteredProducts.map((product) => {
            const dailyProfit = product.reward_per_mining * product.mining_per_day;
            const totalIncome = dailyProfit * product.duration_days;
            const roi = (totalIncome / product.price_nx) * 100;

            return (
              <motion.div 
                key={product.id}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative overflow-hidden glass rounded-[32px] p-6 border-white/5 hover:border-[#00f2ff]/30 transition-all group"
              >
                <div className="flex space-x-5">
                  <div className="relative h-28 w-28 rounded-3xl overflow-hidden glass shrink-0 border border-white/10 shadow-2xl">
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="font-black text-xl uppercase tracking-tighter leading-none italic">{product.name}</h3>
                      </div>
                      <span className="inline-block mt-1 text-[8px] font-black text-[#00f2ff] bg-[#00f2ff]/10 px-2 py-0.5 rounded uppercase tracking-tighter border border-[#00f2ff]/20">
                        Level {product.category}
                      </span>
                    </div>
                    <div className="flex items-baseline space-x-1.5">
                      <span className="text-3xl font-black text-white tracking-tighter italic">{product.price_nx}</span>
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none">NX Coin</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-3 gap-1 px-2 py-5 bg-white/5 rounded-3xl border border-white/5">
                  <div className="text-center">
                    <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mb-1.5">Profit Harian</p>
                    <p className="text-sm font-black text-[#00f2ff] italic">+{dailyProfit}</p>
                  </div>
                  <div className="text-center border-x border-white/10">
                    <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mb-1.5">Total Income</p>
                    <p className="text-sm font-black text-white italic">{totalIncome}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mb-1.5">ROI Kontrak</p>
                    <p className="text-sm font-black text-emerald-400 italic">{roi.toFixed(0)}%</p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                      <div className="w-1 h-1 rounded-full bg-gray-500" />
                      <span>{product.duration_days} Hari Kontrak</span>
                    </div>
                    <div className="flex items-center space-x-2 text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                      <div className="w-1 h-1 rounded-full bg-gray-500" />
                      <span>{product.mining_per_day} Sesi / Hari</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleBuy(product.id)}
                    disabled={buyingId === product.id}
                    className="neon-btn h-14 min-w-[140px] flex items-center justify-center space-x-2 px-6 rounded-2xl text-[#050b18] font-black uppercase text-xs tracking-widest disabled:opacity-50 active:scale-95 transition-transform"
                  >
                    {buyingId === product.id ? (
                      <RefreshCw className="animate-spin" size={18} />
                    ) : (
                      <>
                        <ShoppingCart size={18} strokeWidth={3} />
                        <span>Investasi</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
