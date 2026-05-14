import React, { useState } from 'react';
import { Mail, Lock, User, Phone, Zap, ChevronRight, MessageSquare, ShieldCheck, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api';
import { useAuth } from '../App';
import { cn } from '../lib/utils';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setUser } = useAuth();

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [referral, setReferral] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaQuest, setCaptchaQuest] = useState({ a: 0, b: 0, res: 0 });

  React.useEffect(() => {
    generateCaptcha();
  }, []);

  const generateCaptcha = () => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    setCaptchaQuest({ a, b, res: a + b });
    setCaptchaInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (parseInt(captchaInput) !== captchaQuest.res) {
      setError("Captcha salah!");
      generateCaptcha();
      return;
    }

    setLoading(true);
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const data = isLogin 
        ? { username, password } 
        : { username, email, phone, password, referral };
      
      const res = await api.post(endpoint, data);
      setUser(res.user);
    } catch (e: any) {
      setError(e.message || "Gagal masuk");
      generateCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#050b18] relative overflow-hidden">
      <div className="bg-glow-cyan top-[-10%] left-[-5%]" />
      <div className="bg-glow-purple bottom-[-10%] right-[-5%]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-10 relative z-10"
      >
        <div className="text-center space-y-3">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-[32px] glass border-[#00f2ff]/20 bg-[#00f2ff]/5 mb-2 relative group overflow-hidden">
             <div className="absolute inset-0 bg-[#00f2ff]/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
             <Zap size={40} className="text-[#00f2ff] drop-shadow-[0_0_12px_#00f2ff]" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic tracking-[0.2em]">Naxora</h1>
          <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest italic tracking-tighter">Atmospheric Crypto Mining Platform</p>
        </div>

        <div className="glass rounded-[48px] p-10 border-white/5 space-y-8 cyber-gradient backdrop-blur-3xl shadow-2xl">
          <div className="flex p-1.5 bg-[#0a1529] rounded-[24px] border border-white/5">
            <button 
              onClick={() => setIsLogin(true)}
              className={cn("flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all duration-500", isLogin ? "bg-gradient-to-r from-[#00f2ff] to-[#00b4d8] text-[#050b18] shadow-lg shadow-[#00f2ff]/20" : "text-gray-600 hover:text-gray-300")}
            >
              Masuk
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={cn("flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all duration-500", !isLogin ? "bg-gradient-to-r from-[#00f2ff] to-[#00b4d8] text-[#050b18] shadow-lg shadow-[#00f2ff]/20" : "text-gray-600 hover:text-gray-300")}
            >
              Daftar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              <motion.div 
                key={isLogin ? 'login' : 'register'}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="relative group">
                   <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#00f2ff] transition-colors" size={18} />
                   <input 
                     type="text" 
                     placeholder="USERNAME" 
                     required
                     value={username}
                     onChange={(e) => setUsername(e.target.value)}
                     className="w-full bg-[#0a1529]/60 border border-white/5 rounded-3xl py-5 pl-14 pr-4 focus:border-[#00f2ff]/50 outline-none transition-all placeholder:text-gray-700 text-sm font-bold tracking-widest text-[#00f2ff]"
                   />
                </div>

                {!isLogin && (
                  <>
                    <div className="relative group">
                       <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#00f2ff] transition-colors" size={18} />
                       <input 
                         type="email" 
                         placeholder="EMAIL ADDRESS" 
                         required
                         value={email}
                         onChange={(e) => setEmail(e.target.value)}
                         className="w-full bg-[#0a1529]/60 border border-white/5 rounded-3xl py-5 pl-14 pr-4 focus:border-[#00f2ff]/50 outline-none transition-all placeholder:text-gray-700 text-sm font-bold tracking-widest text-white"
                       />
                    </div>
                    <div className="relative group">
                       <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#00f2ff] transition-colors" size={18} />
                       <input 
                         type="tel" 
                         placeholder="PHONE NUMBER" 
                         required
                         value={phone}
                         onChange={(e) => setPhone(e.target.value)}
                         className="w-full bg-[#0a1529]/60 border border-white/5 rounded-3xl py-5 pl-14 pr-4 focus:border-[#00f2ff]/50 outline-none transition-all placeholder:text-gray-700 text-sm font-bold tracking-widest text-white"
                       />
                    </div>
                  </>
                )}

                <div className="relative group">
                   <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#00f2ff] transition-colors" size={18} />
                   <input 
                     type="password" 
                     placeholder="PASSWORD" 
                     required
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     className="w-full bg-[#0a1529]/60 border border-white/5 rounded-3xl py-5 pl-14 pr-4 focus:border-[#00f2ff]/50 outline-none transition-all placeholder:text-gray-700 text-sm font-bold tracking-widest text-white"
                   />
                </div>

                {!isLogin && (
                  <div className="relative group">
                     <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#00f2ff] transition-colors" size={18} />
                     <input 
                       type="text" 
                       placeholder="REFERRAL CODE (OPTIONAL)" 
                       value={referral}
                       onChange={(e) => setReferral(e.target.value)}
                       className="w-full bg-[#0a1529]/60 border border-white/5 rounded-3xl py-5 pl-14 pr-4 focus:border-[#00f2ff]/50 outline-none transition-all placeholder:text-gray-700 text-[10px] font-black uppercase tracking-widest text-white"
                     />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Captcha */}
            <div className="flex items-center space-x-3 bg-white/5 p-2 rounded-3xl border border-white/5">
               <div className="bg-[#00f2ff]/10 text-[#00f2ff] font-black text-[10px] px-5 py-3 rounded-2xl border border-[#00f2ff]/20 shrink-0 italic">
                 {captchaQuest.a} + {captchaQuest.b} =
               </div>
               <input 
                 type="number" 
                 placeholder="RES?" 
                 required
                 value={captchaInput}
                 onChange={(e) => setCaptchaInput(e.target.value)}
                 className="flex-1 bg-transparent outline-none font-black text-white italic placeholder:text-gray-800 text-center text-sm"
               />
               <button type="button" onClick={generateCaptcha} className="p-3 text-gray-600 hover:text-white transition-colors">
                 <RefreshCw size={18} />
               </button>
            </div>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-rose-400 text-[10px] text-center font-black uppercase tracking-widest italic">
                Error Node: {error}
              </motion.p>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full neon-btn h-16 rounded-3xl text-[#050b18] font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center space-x-3 disabled:opacity-50 shadow-[0_0_25px_rgba(0,242,255,0.4)] active:scale-95 transition-all"
            >
              {loading ? <RefreshCw className="animate-spin" size={24} /> : (
                <>
                  <span>{isLogin ? 'Masuk Sekarang' : 'Daftar Akun'}</span>
                  <ChevronRight size={20} strokeWidth={3} />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="text-center space-y-6">
           <p className="text-gray-600 font-bold uppercase tracking-widest text-[9px] italic">Forget Access Key? Contact Neural Support.</p>
           <a 
             href="https://wa.me/628123456789" 
             target="_blank" 
             rel="noreferrer"
             className="inline-flex items-center space-x-3 px-6 py-3 rounded-full bg-emerald-400/5 border border-emerald-400/10 text-emerald-400 font-black uppercase tracking-widest text-[10px] italic hover:bg-emerald-400/10 transition-colors"
           >
             <MessageSquare size={18} strokeWidth={3} />
             <span>Neural Admin Support</span>
           </a>
        </div>
      </motion.div>
    </div>
  );
}
