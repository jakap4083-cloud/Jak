import React, { useState, useEffect } from 'react';
import { Bell, Crown, ArrowUpCircle, ArrowDownCircle, Briefcase, Zap, History, MessageSquare, Info, RefreshCw, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../App';
import { cn } from '../lib/utils';
import { api } from '../services/api';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Link } from 'react-router-dom';
import { cryptoService } from '../services/cryptoService';

const mockChartData = [
  { name: 'Mon', profit: 400 },
  { name: 'Tue', profit: 300 },
  { name: 'Wed', profit: 600 },
  { name: 'Thu', profit: 800 },
  { name: 'Fri', profit: 500 },
  { name: 'Sat', profit: 900 },
  { name: 'Sun', profit: 1100 },
];

import CryptoMarket from '../components/CryptoMarket';
import DailyTasks from '../components/DailyTasks';

export default function Dashboard() {
  const { user } = useAuth();
  const [balanceNx, setBalanceNx] = useState(0);
  const [balanceIdr, setBalanceIdr] = useState(0);
  const [marketPulse, setMarketPulse] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await api.getNotifications();
        const unread = res.notifications.filter((n: any) => !n.read).length;
        setUnreadCount(unread);
      } catch (e) {
        console.error(e);
      }
    };
    fetchUnread();
  }, []);

  useEffect(() => {
    return cryptoService.subscribe((prices) => {
      const btc = prices.find(p => p.symbol === 'BTC');
      if (btc && btc.price !== "0") {
        setMarketPulse(`• LIVE MARKET: BTC/USDT $${btc.price} (${btc.change}) `);
      }
    });
  }, []);

  useEffect(() => {
    if (user) {
      // Counter animation
      const nxTarget = user.balance_nx;
      const idrTarget = user.balance_idr;
      const duration = 1500;
      const frameRate = 1000 / 60;
      const totalFrames = Math.round(duration / frameRate);
      
      let frame = 0;
      const timer = setInterval(() => {
        frame++;
        const progress = frame / totalFrames;
        setBalanceNx(Math.floor(nxTarget * progress));
        setBalanceIdr(Math.floor(idrTarget * progress));
        
        if (frame === totalFrames) {
          setBalanceNx(nxTarget);
          setBalanceIdr(idrTarget);
          clearInterval(timer);
        }
      }, frameRate);
      
      return () => clearInterval(timer);
    }
  }, [user]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img 
              src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} 
              alt="Avatar" 
              className="h-12 w-12 rounded-full border-2 border-[#00f2ff] p-0.5"
            />
            <div className="absolute -bottom-1 -right-1 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 p-0.5 shadow-lg">
              <Crown className="text-[#050b18]" size={10} fill="currentColor" />
            </div>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Halo,</p>
            <div className="flex items-center">
              <p className="font-bold text-white">{user?.username}</p>
              <span className="ml-2 px-1.5 py-0.5 bg-gradient-to-r from-yellow-400 to-amber-600 rounded text-[8px] font-black italic shadow-lg shadow-yellow-500/20">
                {user?.tier}
              </span>
            </div>
          </div>
        </div>
        <Link to="/notifications" className="relative p-2 rounded-xl glass border-white/10 text-gray-400 bg-white/5 hover:text-[#00f2ff] transition-colors">
          <Bell size={24} />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 h-4 w-4 rounded-full bg-red-500 border-2 border-[#050b18] text-[8px] font-black text-white flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>
      </div>

      {/* Running Text */}
      <div className="-mx-4 bg-[#0a1529] border-y border-white/5 py-1.5 overflow-hidden whitespace-nowrap">
        <div className="flex items-center px-4 space-x-3">
          <div className="bg-[#00f2ff]/20 text-[#00f2ff] text-[8px] px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">NEWS</div>
          <motion.div 
            animate={{ x: [400, -1200] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="inline-block text-[10px] italic font-medium text-gray-300 tracking-wide"
          >
            {marketPulse} • Member user_829 baru saja melakukan WD sebesar Rp 2.500.000 via QRIS • Harga NX Coin hari ini Rp 7.000 • Maintenance terjadwal pada 15 Mei 2026 • Selamat Datang di Naxora Modern Mining •
          </motion.div>
        </div>
      </div>

      {/* Balance Card */}
      <div className="relative overflow-hidden rounded-[40px] p-8 glass border-white/10 cyber-gradient">
        <div className="absolute top-0 right-0 p-4 opacity-10 scale-150 rotate-12">
          <Zap size={120} className="text-[#00f2ff]" />
        </div>
        
        <div className="space-y-6 relative z-10">
          <div>
            <p className="text-[10px] text-[#00f2ff] font-bold uppercase tracking-widest">Total Saldo NX Coin</p>
            <div className="flex items-baseline space-x-2 mt-1">
              <h1 className="text-4xl font-black text-white tracking-tighter">{balanceNx.toLocaleString()}</h1>
              <span className="text-gray-400 font-light">NX</span>
            </div>
            <p className="text-sm text-gray-400 font-medium">≈ Rp {(balanceNx * 7000).toLocaleString()}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Link to="/deposit" className="neon-btn h-14 rounded-2xl text-[#050b18] font-black uppercase text-xs tracking-widest shadow-[0_0_20px_rgba(0,242,255,0.4)] flex items-center justify-center">
              Deposit
            </Link>
            <Link to="/withdraw" className="h-14 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black uppercase text-xs tracking-widest transition-colors flex items-center justify-center text-center">
              Penarikan
            </Link>
          </div>
        </div>
      </div>

      <DailyTasks />

      {/* Crypto Market Live */}
      <CryptoMarket />

      {/* Profit Graph */}
      <div className="p-6 glass rounded-[32px] border-white/5 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Grafik Mining</p>
            <p className="text-sm font-black text-[#00f2ff] italic uppercase">+12.5% Profit Hari Ini</p>
          </div>
          <div className="flex space-x-1.5 items-end pb-1">
            <div className="w-1.5 h-6 bg-white/10 rounded-full"></div>
            <div className="w-1.5 h-10 bg-white/10 rounded-full"></div>
            <div className="w-1.5 h-14 bg-[#00f2ff] rounded-full shadow-[0_0_8px_#00f2ff]"></div>
            <div className="w-1.5 h-8 bg-white/10 rounded-full"></div>
            <div className="w-1.5 h-12 bg-[#4d00ff] rounded-full shadow-[0_0_8px_#4d00ff]"></div>
          </div>
        </div>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockChartData}>
              <XAxis dataKey="name" hide />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0a1529', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', backdropFilter: 'blur(10px)' }}
                itemStyle={{ color: '#00f2ff', fontWeight: 'bold' }}
              />
              <Line 
                type="monotone" 
                dataKey="profit" 
                stroke="#00f2ff" 
                strokeWidth={4} 
                dot={false}
                activeDot={{ r: 6, strokeWidth: 0, fill: '#00f2ff' }}
               />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Menu */}
      <div className="grid grid-cols-3 gap-6">
        {[
          { icon: Zap, label: 'Kerja', color: 'text-[#00f2ff]', to: '/work' },
          { icon: Briefcase, label: 'Investasi', color: 'text-purple-400', to: '/investment' },
          { icon: RefreshCw, label: 'Convert', color: 'text-emerald-400', to: '/convert' },
        ].map((item, i) => (
          <Link 
            key={i} 
            to={item.to}
            className="flex flex-col items-center space-y-2 group"
          >
            <div className={cn("h-14 w-14 rounded-2xl glass flex items-center justify-center border-white/10 group-hover:scale-110 transition-transform", item.color)}>
              <item.icon size={22} />
            </div>
            <span className="text-[9px] uppercase font-black tracking-widest text-gray-500">{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
         <div className="p-5 glass rounded-[28px] border-white/5">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Total Member</p>
            <p className="text-xl font-black text-white">1,420</p>
         </div>
         <div className="p-5 glass rounded-[28px] border-white/5">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Online User</p>
            <p className="text-xl font-black text-emerald-400">842</p>
         </div>
      </div>

      {/* Banner Mock */}
      <div className="h-32 w-full rounded-[32px] overflow-hidden relative border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-r from-[#4d00ff]/60 to-transparent z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=800&h=400&auto=format&fit=crop" 
          className="w-full h-full object-cover"
          alt="Bonus"
        />
        <div className="absolute inset-0 flex flex-col justify-center px-8 z-20">
          <p className="text-[10px] font-black text-[#00f2ff] uppercase tracking-widest">Event Spesial</p>
          <h4 className="text-2xl font-black leading-none uppercase tracking-tighter mt-1 italic">BONUS DEPOSIT<br />Hingga 20%</h4>
        </div>
      </div>

      {/* Floating Support Button */}
      <Link 
        to="/support"
        className="fixed bottom-24 right-6 z-40 h-14 w-14 rounded-2xl bg-[#00f2ff] text-[#050b18] flex items-center justify-center shadow-[0_0_30px_rgba(0,242,255,0.4)] hover:scale-110 active:scale-95 transition-all"
      >
        <MessageSquare size={24} />
      </Link>
    </div>
  );
}
