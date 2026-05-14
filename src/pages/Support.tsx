import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, ArrowLeft, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export default function Support() {
  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadMessages = async () => {
    try {
      const res = await api.get('/chats');
      setMessages(res.messages || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || sending) return;
    
    setSending(true);
    try {
      await api.post('/chats/send', { content });
      setContent('');
      loadMessages();
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-140px)]">
      <div className="flex items-center space-x-4">
        <button onClick={() => navigate(-1)} className="p-2 glass rounded-2xl text-gray-500 hover:text-white">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-black uppercase italic tracking-tighter">Support Core</h1>
          <p className="text-[10px] text-[#00f2ff] font-black uppercase tracking-widest">Neural Link Active</p>
        </div>
      </div>

      <div className="glass rounded-[40px] flex-1 overflow-hidden border-white/5 bg-[#0a1529]/60 backdrop-blur-3xl flex flex-col">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center py-10"><RefreshCw className="animate-spin text-[#00f2ff]" /></div>
          ) : messages.length === 0 ? (
            <div className="text-center py-20 px-10 space-y-4">
              <MessageSquare size={40} className="mx-auto text-gray-700" />
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
                Belum ada pesan. Kirim sinyal kepada tim dukungan kami jika Anda butuh bantuan.
              </p>
            </div>
          ) : (
            messages.map((m) => {
              const isAdmin = m.sender_role === 'ADMIN';
              return (
                <div key={m.id} className={cn("flex", !isAdmin ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[85%] p-4 rounded-2xl space-y-1",
                    !isAdmin ? "bg-[#00f2ff] text-[#050b18] rounded-tr-none shadow-[0_0_20px_rgba(0,242,255,0.2)]" : "glass bg-white/5 text-white rounded-tl-none border-white/5"
                  )}>
                    <p className="text-sm font-medium leading-relaxed">{m.content}</p>
                    <p className={cn("text-[7px] font-black uppercase tracking-widest text-right", !isAdmin ? "text-[#050b18]/60" : "text-gray-500")}>
                      {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <form onSubmit={handleSend} className="p-6 bg-[#0a1529]/80 border-t border-white/5 flex items-center space-x-3">
          <input 
            type="text"
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 h-12 bg-white/5 border border-white/10 rounded-xl px-6 outline-none focus:border-[#00f2ff]/50 text-white text-sm"
          />
          <button 
            type="submit"
            disabled={sending || !content.trim()}
            className="h-12 w-12 rounded-xl bg-[#00f2ff] text-[#050b18] flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shadow-[0_0_20px_rgba(0,242,255,0.3)]"
          >
            {sending ? <RefreshCw className="animate-spin" size={18} /> : <Send size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
}
