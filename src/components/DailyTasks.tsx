import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, CalendarDays, Zap, Share2, Send, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import { useAuth } from '../App';

const ICON_MAP: any = {
  CalendarDays: CalendarDays,
  Zap: Zap,
  Share2: Share2,
  Send: Send
};

export default function DailyTasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);
  const { refreshUser } = useAuth();

  const fetchTasks = async () => {
    try {
      const res = await api.get('/user/tasks');
      setTasks(res.tasks);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleComplete = async (taskId: string) => {
    setClaiming(taskId);
    try {
      await api.post(`/user/tasks/${taskId}/complete`, {});
      toast.success('Misi selesai!');
      fetchTasks();
      refreshUser();
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Gagal menyelesaikan misi');
    } finally {
      setClaiming(null);
    }
  };

  if (loading && tasks.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] italic">Misi Harian (Alpha)</h2>
        <motion.button 
          whileTap={{ rotate: 180 }}
          onClick={fetchTasks} 
          className="text-gray-600 hover:text-[#00f2ff]"
        >
          <RefreshCw size={14} className={cn(loading && "animate-spin")} />
        </motion.button>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => {
          const Icon = ICON_MAP[task.icon] || Circle;
          const isCompleted = task.isCompleted;

          return (
            <motion.div 
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "glass rounded-2xl p-4 border transition-all duration-300 flex items-center justify-between group",
                isCompleted ? "border-emerald-500/20 bg-emerald-500/5" : "border-white/5 bg-white/2"
              )}
            >
              <div className="flex items-center space-x-4">
                <div className={cn(
                  "h-10 w-10 rounded-xl flex items-center justify-center transition-colors",
                  isCompleted ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-gray-500"
                )}>
                  <Icon size={20} className={cn(isCompleted && "drop-shadow-[0_0_8px_#10b981]")} />
                </div>
                <div>
                  <h3 className={cn(
                    "text-xs font-black uppercase tracking-tight italic transition-all",
                    isCompleted ? "text-gray-500 line-through decoration-emerald-500/40" : "text-white"
                  )}>
                    {task.title}
                  </h3>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <span className="text-[8px] font-black text-[#00f2ff] uppercase tracking-widest">Reward:</span>
                    <span className={cn("text-[8px] font-black uppercase tracking-widest", isCompleted ? "text-gray-700" : "text-white")}>
                      {task.reward} NX
                    </span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => !isCompleted && handleComplete(task.id)}
                disabled={isCompleted || claiming === task.id}
                className={cn(
                  "h-8 px-4 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center space-x-1.5",
                  isCompleted 
                    ? "bg-emerald-500/10 text-emerald-400 cursor-default" 
                    : claiming === task.id
                      ? "bg-white/5 text-gray-500"
                      : "neon-btn text-[#050b18] active:scale-95"
                )}
              >
                {isCompleted ? (
                  <>
                    <CheckCircle2 size={12} />
                    <span>Done</span>
                  </>
                ) : claiming === task.id ? (
                  <RefreshCw size={12} className="animate-spin" />
                ) : (
                  <span>Ambil</span>
                )}
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
