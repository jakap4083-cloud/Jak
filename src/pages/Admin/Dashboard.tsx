import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, CreditCard, Settings, TrendingUp, ArrowUpRight, ArrowDownRight, UserCheck, Clock } from 'lucide-react';
import { api } from '../../services/api';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.getAdminStats().then(setStats).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-10 text-center animate-pulse text-[#00f2ff] font-black uppercase tracking-widest italic">Loading Admin Core...</div>;

  const cards = [
    { label: 'Total User', value: stats?.total_users || 0, icon: Users, color: 'text-blue-400', path: '/admin/users' },
    { label: 'Total Deposit', value: `Rp ${(stats?.total_deposits || 0).toLocaleString()}`, icon: ArrowUpRight, color: 'text-emerald-400', path: '/admin/transactions' },
    { label: 'Total WD', value: `Rp ${(stats?.total_withdrawals || 0).toLocaleString()}`, icon: ArrowDownRight, color: 'text-rose-400', path: '/admin/transactions' },
    { label: 'Pending WD', value: stats?.pending_withdrawals || 0, icon: Clock, color: 'text-yellow-400', path: '/admin/transactions' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black uppercase italic tracking-tighter text-white">Central Intelligence</h1>
        <div className="px-3 py-1 bg-emerald-400/10 border border-emerald-400/20 rounded-full text-[10px] font-black text-emerald-400 uppercase tracking-widest animate-pulse">
           System Online
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {cards.map((card, i) => (
          <div 
            key={i} 
            onClick={() => navigate(card.path)}
            className="glass rounded-[32px] p-6 border-white/5 bg-[#0a1529]/40 relative overflow-hidden cursor-pointer hover:border-[#00f2ff]/20 transition-all active:scale-95 group"
          >
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                <card.icon size={48} className={card.color} />
             </div>
             <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{card.label}</p>
             <h2 className={cn("text-xl font-black italic mt-1 tracking-tighter", card.color)}>{card.value}</h2>
          </div>
        ))}
      </div>

      {/* Member Growth Chart */}
      <div className="glass rounded-[32px] p-6 border-white/5 bg-[#0a1529]/60 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Member Growth (7 Days)</h3>
          <UserCheck size={14} className="text-[#00f2ff]" />
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats?.registrations || []}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00f2ff" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00f2ff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Tooltip 
                contentStyle={{ backgroundColor: '#0a1529', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}
                itemStyle={{ color: '#00f2ff', fontWeight: 'bold', fontSize: '10px', textTransform: 'uppercase' }}
                labelStyle={{ display: 'none' }}
              />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="#00f2ff" 
                fillOpacity={1} 
                fill="url(#colorCount)" 
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-[#00f2ff] italic ml-2">Quick Access Nodes</h3>
        <div className="grid grid-cols-1 gap-4">
          <div className="glass rounded-[32px] p-6 border-white/5 bg-[#0a1529]/60 flex items-center justify-between group cursor-pointer hover:border-[#00f2ff]/20 transition-all">
             <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-[#00f2ff] transition-all">
                   <UserCheck size={24} />
                </div>
                <div>
                   <h4 className="font-black uppercase italic tracking-tighter">Verifikasi Member</h4>
                   <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Aktivasi manual akun member</p>
                </div>
             </div>
             <ArrowUpRight className="text-gray-700 group-hover:text-[#00f2ff] transition-all" />
          </div>

          <div className="glass rounded-[32px] p-6 border-white/5 bg-[#0a1529]/60 flex items-center justify-between group cursor-pointer hover:border-[#00f2ff]/20 transition-all">
             <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-[#00f2ff] transition-all">
                   <TrendingUp size={24} />
                </div>
                <div>
                   <h4 className="font-black uppercase italic tracking-tighter">Setting Sinyal</h4>
                   <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Manipulasi grafik mining</p>
                </div>
             </div>
             <ArrowUpRight className="text-gray-700 group-hover:text-[#00f2ff] transition-all" />
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="p-6 glass rounded-[32px] border-white/5 bg-white/5">
         <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Memory Utilization</span>
            <span className="text-[10px] font-black text-[#00f2ff]">42%</span>
         </div>
         <div className="h-1.5 w-full bg-[#0a1529] rounded-full overflow-hidden">
            <motion.div 
               initial={{ width: 0 }}
               animate={{ width: '42%' }}
               className="h-full bg-gradient-to-r from-[#00f2ff] to-[#4d00ff]"
            />
         </div>
      </div>
    </div>
  );
}
