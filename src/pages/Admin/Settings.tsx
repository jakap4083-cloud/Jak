import React, { useState, useEffect } from 'react';
import { Settings, Save, AlertTriangle, Globe, Lock, ShieldCheck, RefreshCw, MessageCircle, Send, Cpu, Zap, Database, Shield } from 'lucide-react';
import { api } from '../../services/api';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

export default function AdminSettings() {
  const [settings, setSettings] = useState<any>({
    nx_to_idr: 7000,
    min_deposit: 10000,
    min_withdraw: 50000,
    withdraw_fee: 2500,
    referral_reward_pct: 10,
    maintenance: false,
    wa_admin: '628123456789',
    tg_admin: 'naxora_official'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getSettings().then(setSettings).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateSettings(settings);
      alert('Neural Protocols Updated Successfully');
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setSaving(false), 800);
    }
  };

  if (loading) return <div className="p-10 text-center animate-pulse text-[#00f2ff] font-black uppercase tracking-widest italic">Synchronizing Neural Core...</div>;

  return (
    <form onSubmit={handleSave} className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase italic tracking-tighter text-white">System Configuration</h1>
          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Global Protocol Management</p>
        </div>
        <button 
          disabled={saving}
          className="relative group p-4 bg-[#00f2ff] text-[#050b18] rounded-2xl shadow-[0_0_30px_rgba(0,242,255,0.4)] hover:scale-105 active:scale-95 transition-all"
        >
          {saving ? <RefreshCw className="animate-spin" size={24} /> : <Save size={24} />}
          <div className="absolute -inset-1 bg-[#00f2ff]/20 blur-xl rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Core Economy */}
        <section className="glass rounded-[32px] p-8 border-white/5 bg-[#0a1529]/40 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 h-32 w-32 bg-blue-500/10 blur-[80px] rounded-full" />
          
          <div className="flex items-center space-x-3 text-[#00f2ff] mb-8">
             <Cpu size={18} />
             <h3 className="text-[10px] font-black uppercase tracking-widest italic">Neural Economy Protocol</h3>
          </div>
          
          <div className="space-y-6">
             <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest px-2">NX Conversion Rate (IDR)</label>
                <div className="relative">
                   <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold italic">$</div>
                   <input 
                    type="number"
                    value={settings.nx_to_idr}
                    onChange={e => setSettings({...settings, nx_to_idr: parseInt(e.target.value)})}
                    className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 outline-none focus:border-[#00f2ff]/50 text-white font-black italic text-xl transition-all"
                  />
                </div>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest px-2 group">Min Deposit (IDR)</label>
                   <input 
                     type="number"
                     value={settings.min_deposit}
                     onChange={e => setSettings({...settings, min_deposit: parseInt(e.target.value)})}
                     className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 outline-none focus:border-[#00f2ff]/50 text-white font-bold transition-all"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest px-2">Min WD (IDR)</label>
                   <input 
                     type="number"
                     value={settings.min_withdraw}
                     onChange={e => setSettings({...settings, min_withdraw: parseInt(e.target.value)})}
                     className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 outline-none focus:border-[#00f2ff]/50 text-white font-bold transition-all"
                   />
                </div>
             </div>
             
             <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest px-2">Withdrawal Service Fee (IDR)</label>
                <input 
                  type="number"
                  value={settings.withdraw_fee}
                  onChange={e => setSettings({...settings, withdraw_fee: parseInt(e.target.value)})}
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 outline-none focus:border-[#00f2ff]/50 text-white font-bold transition-all"
                />
             </div>

             <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest px-2">Referral Reward Percentage (%)</label>
                <div className="relative">
                   <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[#00f2ff] font-black italic">%</div>
                   <input 
                    type="number"
                    min="0"
                    max="100"
                    value={settings.referral_reward_pct ?? 10}
                    onChange={e => {
                      const val = parseInt(e.target.value);
                      setSettings({...settings, referral_reward_pct: isNaN(val) ? 0 : Math.min(100, Math.max(0, val))});
                    }}
                    className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl px-6 outline-none focus:border-[#00f2ff]/50 text-white font-black italic text-xl transition-all"
                  />
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest px-2 group">Registration Bonus (NX)</label>
                <div className="relative">
                   <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[#00f2ff] font-black italic">NX</div>
                   <input 
                    type="number"
                    value={settings.registration_bonus_nx}
                    onChange={e => setSettings({...settings, registration_bonus_nx: parseFloat(e.target.value)})}
                    className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl px-6 outline-none focus:border-[#00f2ff]/50 text-white font-black italic text-xl transition-all"
                  />
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest px-2 group">Withdraw Fee (%)</label>
                <div className="relative">
                   <div className="absolute right-6 top-1/2 -translate-y-1/2 text-rose-400 font-black italic">%</div>
                   <input 
                    type="number"
                    value={settings.withdraw_fee_pct}
                    onChange={e => setSettings({...settings, withdraw_fee_pct: parseFloat(e.target.value)})}
                    className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl px-6 outline-none focus:border-[#00f2ff]/50 text-white font-black italic text-xl transition-all"
                  />
                </div>
             </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-[#00f2ff] italic flex items-center space-x-2">
            <Shield size={14} />
            <span>Manual Deposit Gateway</span>
          </h2>
          <div className="glass rounded-[32px] p-8 border-white/5 bg-[#0a1529]/40 space-y-6">
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest px-2">Bank Name</label>
                  <input 
                    type="text"
                    value={settings.manual_bank_name}
                    onChange={e => setSettings({...settings, manual_bank_name: e.target.value})}
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 outline-none focus:border-[#00f2ff]/50 text-white font-bold"
                    placeholder="BCA / BRI / DANA"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest px-2">Account Name</label>
                  <input 
                    type="text"
                    value={settings.manual_bank_holder}
                    onChange={e => setSettings({...settings, manual_bank_holder: e.target.value})}
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 outline-none focus:border-[#00f2ff]/50 text-white font-bold"
                    placeholder="ADMIN NAME"
                  />
                </div>
             </div>
             <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest px-2">Account Number</label>
                <input 
                  type="text"
                  value={settings.manual_bank_account}
                  onChange={e => setSettings({...settings, manual_bank_account: e.target.value})}
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 outline-none focus:border-[#00f2ff]/50 text-white font-black tracking-widest"
                  placeholder="000111222333"
                />
             </div>
          </div>
        </section>

        {/* Support Channels */}
        <section className="glass rounded-[32px] p-8 border-white/5 bg-[#0a1529]/40 relative overflow-hidden">
          <div className="flex items-center space-x-3 text-emerald-400 mb-8">
             <Zap size={18} />
             <h3 className="text-[10px] font-black uppercase tracking-widest italic">Support Frequency</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
             <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest px-2 flex items-center">
                   <MessageCircle size={10} className="mr-1" /> WhatsApp Admin High-Link
                </label>
                <input 
                  type="text"
                  value={settings.wa_admin}
                  onChange={e => setSettings({...settings, wa_admin: e.target.value})}
                  placeholder="e.g. 628123456789"
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 outline-none focus:border-emerald-400/50 text-white font-bold transition-all"
                />
             </div>
             
             <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest px-2 flex items-center">
                   <Send size={10} className="mr-1" /> Telegram Official Group
                </label>
                <input 
                  type="text"
                  value={settings.tg_admin}
                  onChange={e => setSettings({...settings, tg_admin: e.target.value})}
                  placeholder="e.g. naxora_channel"
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 outline-none focus:border-emerald-400/50 text-white font-bold transition-all"
                />
             </div>
          </div>
        </section>

        {/* Hard Security */}
        <section className="glass rounded-[32px] p-8 border-white/5 bg-[#0a1529]/40 relative overflow-hidden">
          <div className="flex items-center space-x-3 text-rose-500 mb-8">
             <Lock size={18} />
             <h3 className="text-[10px] font-black uppercase tracking-widest italic">System Sentinel</h3>
          </div>
          
          <div className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-rose-500/20 transition-all">
             <div className="flex items-center space-x-4">
                <div className={cn("p-3 rounded-2xl glass transition-colors", settings.maintenance ? "text-rose-500" : "text-gray-600")}>
                   <ShieldCheck size={20} />
                </div>
                <div>
                   <p className="text-sm font-black uppercase italic tracking-tighter">Maintenance Lockdown</p>
                   <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Restrict user auth & transactions</p>
                </div>
             </div>
             <button 
                type="button"
                onClick={() => setSettings({...settings, maintenance: !settings.maintenance})}
                className={cn(
                  "w-16 h-9 rounded-full transition-all relative overflow-hidden p-1 shadow-inner",
                  settings.maintenance ? "bg-rose-500/20 ring-1 ring-rose-500/50" : "bg-gray-800"
                )}
             >
                <div className={cn(
                   "w-7 h-full rounded-full transition-all shadow-lg",
                   settings.maintenance ? "ml-auto bg-rose-500" : "mr-auto bg-gray-600"
                )} />
             </button>
          </div>
        </section>
      </div>

      {/* Safety Buffer */}
      <div className="p-6 glass rounded-2xl border-white/5 bg-white/5 flex items-start space-x-4">
         <AlertTriangle className="text-yellow-400 shrink-0 mt-1" size={18} />
         <p className="text-[10px] font-medium text-gray-500 leading-relaxed uppercase tracking-wider">
            Warning: modifying core parameters will instantly affect all active nodes and transaction routing. Verify all data before commitment.
         </p>
      </div>
    </form>
  );
}