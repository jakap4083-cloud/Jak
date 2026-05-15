import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Home, Users, Briefcase, Zap, History, User, Bell, ChevronRight, Wallet, ArrowUpCircle, ArrowDownCircle, RefreshCw, LogOut, LayoutDashboard, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { api } from './services/api';
import { User as UserType } from './types';

// Pages
import Dashboard from './pages/Dashboard';
import Investment from './pages/Investment';
import Work from './pages/Work';
import HistoryPage from './pages/History';
import Team from './pages/Team';
import Profile from './pages/Profile';
import Withdrawal from './pages/Withdrawal';
import Deposit from './pages/Deposit';
import Notifications from './pages/Notifications';
import Convert from './pages/Convert';
import Support from './pages/Support';
import Maintenance from './pages/Maintenance';
import Auth from './pages/Auth';
import Admin from './pages/Admin';

const AuthContext = createContext<{ 
  user: UserType | null; 
  setUser: (u: UserType | null) => void;
  loading: boolean;
  refreshUser: () => void;
  isMaintenance: boolean;
}>({ user: null, setUser: () => {}, loading: true, refreshUser: () => {}, isMaintenance: false });

export const useAuth = () => useContext(AuthContext);

import { Toaster } from 'sonner';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: any, errorInfo: any) { console.error('FATAL_CRASH:', error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050b18] flex items-center justify-center p-10 text-center">
          <div className="space-y-4">
            <h1 className="text-2xl font-black text-rose-500 uppercase italic">Neural Error</h1>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Sistem mengalami gangguan transmisi. Silakan muat ulang halaman.</p>
            <button onClick={() => window.location.reload()} className="px-6 h-12 glass rounded-xl border-white/10 text-white font-black uppercase text-[10px] tracking-widest">Muat Ulang</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMaintenance, setIsMaintenance] = useState(false);

  const refreshUser = async () => {
    try {
      const data = await api.get('/auth/me');
      setUser(data.user);
    } catch (e: any) {
      if (e.message.includes('Maintenance')) {
        setIsMaintenance(true);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial check for settings/maintenance
    api.get('/settings').then(s => setIsMaintenance(s.maintenance)).catch(() => {});
  }, []);

  useEffect(() => {
    refreshUser();
    
    // Neural Reality: Balance Synchronizer
    // Polls user data every 5 seconds to ensure real-time balance updates
    const interval = setInterval(() => {
      if (user) {
        refreshUser();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [user?.id]);

  if (loading) return (
    <div className="flex h-screen w-full items-center justify-center bg-[#050b18]">
      <motion.div 
        animate={{ rotate: 360, scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="h-12 w-12 rounded-full border-b-2 border-t-2 border-[#00f2ff] neon-glow"
      />
    </div>
  );

  return (
    <AuthContext.Provider value={{ user, setUser, loading, refreshUser, isMaintenance }}>
      <ErrorBoundary>
        <BrowserRouter>
          <div className="min-h-screen bg-[#050b18] text-white selection:bg-[#00f2ff]/30 relative overflow-hidden">
          <Toaster 
            theme="dark" 
            position="top-center" 
            toastOptions={{
              style: {
                background: 'rgba(10, 21, 41, 0.8)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                color: 'white',
                fontFamily: 'inherit',
                borderRadius: '24px',
                padding: '20px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
              },
            }}
          />
          <div className="bg-glow-cyan top-[-10%] left-[-5%]" />
          <div className="bg-glow-purple bottom-[-10%] right-[-5%]" />
          
          <Routes>
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/" />} />
            <Route path="/admin/*" element={user?.role === 'ADMIN' ? <Admin /> : <Navigate to="/" />} />
            <Route path="/*" element={isMaintenance && user?.role !== 'ADMIN' ? <Navigate to="/maintenance" /> : (user ? <MainLayout /> : <Navigate to="/auth" />)} />
          </Routes>
        </div>
      </BrowserRouter>
      </ErrorBoundary>
    </AuthContext.Provider>
  );
}

function MainLayout() {
  const location = useLocation();

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/investment" element={<Investment />} />
            <Route path="/work" element={<Work />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/team" element={<Team />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/withdraw" element={<Withdrawal />} />
            <Route path="/deposit" element={<Deposit />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/convert" element={<Convert />} />
            <Route path="/support" element={<Support />} />
          </Routes>
        </motion.div>
      </AnimatePresence>

      <Navbar />
    </div>
  );
}

function Navbar() {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/team', icon: Users, label: 'Tim' },
    { path: '/investment', icon: Briefcase, label: 'Investasi' },
    { path: '/work', icon: Zap, label: 'Kerja' },
    { path: '/history', icon: History, label: 'Riwayat' },
    { path: '/profile', icon: User, label: 'Profil' },
  ];

  return (
    <nav className="bottom-nav flex items-center justify-around h-20 px-2 rounded-t-[40px] border-white/5">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link 
            key={item.path} 
            to={item.path}
            className={cn(
              "flex flex-col items-center justify-center space-y-1 transition-all duration-300",
              isActive ? "text-[#00f2ff]" : "text-gray-500"
            )}
          >
            <div className={cn(
              "p-2 rounded-xl text-xs",
              isActive && "bg-[#00f2ff]/10"
            )}>
              <item.icon size={isActive ? 22 : 20} className={cn(isActive && "drop-shadow-[0_0_8px_rgba(0,242,255,0.5)]")} />
            </div>
            <span className="text-[8px] font-bold uppercase tracking-wider">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
