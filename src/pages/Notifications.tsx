import React, { useState, useEffect } from 'react';
import { ArrowLeft, Bell, CheckCircle2, AlertCircle, Info, Gift, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { api } from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'GIFT';
  read: boolean;
  created_at: string;
}

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.getNotifications();
      setNotifications(res.notifications);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllRead = async () => {
    try {
      await api.markNotificationsRead();
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS': return { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10' };
      case 'WARNING': return { icon: AlertCircle, color: 'text-rose-400', bg: 'bg-rose-400/10' };
      case 'GIFT': return { icon: Gift, color: 'text-amber-400', bg: 'bg-amber-400/10' };
      default: return { icon: Info, color: 'text-blue-400', bg: 'bg-blue-400/10' };
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate(-1)} className="p-2 glass rounded-2xl border-white/5 text-gray-500 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-black uppercase tracking-tighter italic">Notifikasi</h1>
        </div>
        {notifications.some(n => !n.read) && (
          <button 
            onClick={markAllRead}
            className="text-[9px] font-black uppercase tracking-widest text-[#00f2ff] hover:opacity-80 transition-opacity"
          >
            Tandai Semua Dibaca
          </button>
        )}
      </div>

      <div className="space-y-3">
        {loading ? (
          Array(5).fill(0).map((_, i) => (
            <div key={i} className="h-24 w-full glass rounded-3xl border-white/5 animate-pulse" />
          ))
        ) : notifications.length > 0 ? (
          notifications.map((n) => {
            const { icon: Icon, color, bg } = getIcon(n.type);
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "glass rounded-3xl p-5 border-white/5 relative overflow-hidden transition-all duration-300",
                  !n.read ? "bg-white/[0.03] border-[#00f2ff]/20" : "opacity-60"
                )}
              >
                {!n.read && (
                  <div className="absolute top-0 right-0 h-10 w-10 overflow-hidden">
                    <div className="absolute top-0 right-0 h-1 w-12 bg-[#00f2ff] rotate-45 translate-x-4 translate-y-[-10px] shadow-[0_0_10px_#00f2ff]" />
                  </div>
                )}
                
                <div className="flex items-start space-x-4">
                  <div className={cn("p-3 rounded-2xl shrink-0", bg, color)}>
                    <Icon size={20} />
                  </div>
                  <div className="space-y-1 pr-4">
                    <div className="flex items-center justify-between">
                       <h3 className="text-[11px] font-black uppercase tracking-widest text-white italic">{n.title}</h3>
                    </div>
                    <p className="text-[10px] text-gray-400 font-medium leading-relaxed">{n.message}</p>
                    <p className="text-[8px] text-gray-600 font-bold uppercase tracking-widest pt-1">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: id })}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-20 space-y-4 opacity-50">
            <Bell size={48} className="text-gray-600" />
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Tidak ada notifikasi</p>
          </div>
        )}
      </div>
    </div>
  );
}
