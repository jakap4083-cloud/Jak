import React, { useState } from 'react';
import { Users, UserPlus, Award, Zap, ChevronRight, User, Check, Copy } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../App';
import { cn } from '../lib/utils';

export default function Team() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const copyReferralLink = () => {
    if (!user) return;
    const link = `${window.location.origin}/auth?ref=${user.referral_code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const stats = [
    { label: 'Total Anggota', value: '12', color: 'text-[#38bdf8]' },
    { label: 'Bonus Aktif', value: '1.2M', color: 'text-emerald-400' },
    { label: 'Level Tim', value: '3', color: 'text-purple-400' },
  ];

  const hierarchy = [
    { level: 'Lvl 1 (Direct)', members: 5, bonus: '10%', status: 'Aktif' },
    { level: 'Lvl 2 (Indirect)', members: 8, bonus: '5%', status: 'Aktif' },
    { level: 'Lvl 3 (Legacy)', members: 24, bonus: '2%', status: 'Non-aktif' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 rounded-2xl bg-[#00f2ff]/10 flex items-center justify-center text-[#00f2ff] border border-[#00f2ff]/20">
          <Users size={22} className="drop-shadow-[0_0_8px_#00f2ff]" />
        </div>
        <h1 className="text-xl font-black uppercase tracking-tighter italic">Komunitas</h1>
      </div>

      {/* Referral Info */}
      <div className="glass rounded-[40px] p-10 relative overflow-hidden border-white/5 cyber-gradient">
         <div className="absolute top-0 right-0 p-8 opacity-5">
            <UserPlus size={100} className="rotate-12" />
         </div>
         <div className="flex flex-col items-center relative z-10">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Kode Referral Anda</p>
            <h2 className="text-4xl font-black text-white italic tracking-[0.2em] mb-8">{user?.referral_code}</h2>
            <button 
              onClick={copyReferralLink}
              className={cn(
                "h-14 w-full rounded-2xl font-black uppercase text-xs tracking-widest shadow-[0_0_20px_rgba(0,242,255,0.4)] flex items-center justify-center space-x-3 active:scale-95 transition-all",
                copied ? "bg-emerald-500 text-[#050b18] shadow-emerald-500/40" : "neon-btn text-[#050b18]"
              )}
            >
               {copied ? (
                 <>
                   <Check size={18} strokeWidth={3} />
                   <span>Salin Berhasil</span>
                 </>
               ) : (
                 <>
                   <UserPlus size={18} strokeWidth={3} />
                   <span>Undang Sekarang</span>
                 </>
               )}
            </button>
         </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
         {stats.map((s, i) => (
           <div key={i} className="glass rounded-3xl p-5 border-white/5 bg-[#0a1529]/40">
              <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mb-1.5 leading-none">{s.label}</p>
              <p className={cn("text-sm font-black italic", s.color === 'text-[#38bdf8]' ? 'text-[#00f2ff]' : s.color)}>{s.value}</p>
           </div>
         ))}
      </div>

      {/* Hierarchy View */}
      <div className="space-y-6">
         <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 italic">Distribusi Komisi Tim</h3>
         <div className="space-y-4">
            {hierarchy.map((h, i) => (
              <div key={i} className="glass rounded-[32px] p-6 flex items-center justify-between border-white/5 bg-[#0a1529]/30 backdrop-blur-xl">
                 <div className="flex items-center space-x-5">
                    <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10">
                       <Award size={22} className={i === 0 ? "text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" : "text-gray-600"} />
                    </div>
                    <div>
                       <h4 className="text-xs font-black uppercase italic tracking-tighter">{h.level}</h4>
                       <p className="text-[10px] text-emerald-400 font-bold tracking-widest mt-0.5">KOMISI {h.bonus}</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="text-sm font-black italic">{h.members} <span className="text-gray-600 text-[10px] not-italic uppercase font-bold tracking-widest ml-1">Member</span></p>
                    <div className="mt-1 flex justify-end">
                      <span className={cn(
                        "text-[8px] font-black uppercase tracking-widest py-1 px-3 rounded-full border",
                        h.status === 'Aktif' ? 'bg-emerald-400/5 text-emerald-400 border-emerald-400/20' : 'bg-white/5 text-gray-600 border-white/5'
                      )}>
                         {h.status}
                      </span>
                    </div>
                 </div>
              </div>
            ))}
         </div>
      </div>

      {/* Tree Illustration Mockup */}
      <div className="p-10 glass rounded-[40px] flex flex-col items-center space-y-6 border-white/5 bg-[#0a1529]/20 relative">
         <div className="h-14 w-14 rounded-2xl bg-[#00f2ff] flex items-center justify-center shadow-[0_0_20px_rgba(0,242,255,0.4)] relative z-10">
            <User size={24} className="text-[#050b18]" strokeWidth={3} />
         </div>
         <div className="w-px h-8 bg-gradient-to-b from-[#00f2ff]/60 to-transparent" />
         <div className="flex space-x-12 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-px bg-white/10" />
            <div className="flex flex-col items-center">
               <div className="h-10 w-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <User size={18} className="text-gray-600" />
               </div>
               <div className="w-px h-6 bg-white/5" />
               <div className="flex space-x-4">
                  <div className="h-4 w-4 rounded-lg bg-white/5 border border-white/5" />
                  <div className="h-4 w-4 rounded-lg bg-white/5 border border-white/5" />
               </div>
            </div>
            <div className="flex flex-col items-center">
               <div className="h-10 w-10 rounded-2xl bg-white/5 border border-[#00f2ff]/30 flex items-center justify-center">
                  <User size={18} className="text-gray-400" />
               </div>
               <div className="w-px h-6 bg-white/5" />
               <div className="h-8 w-8 rounded-2xl bg-white/5 border border-white/5" />
            </div>
         </div>
         <div className="pt-2">
           <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest italic opacity-50">Visualizing Network Nodes...</p>
         </div>
      </div>
    </div>
  );
}
