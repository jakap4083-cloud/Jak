import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, User, ChevronLeft, RefreshCw, Clock, Search } from 'lucide-react';
import { api } from '../../services/api';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../App';

export default function AdminChat() {
  const [rooms, setRooms] = useState<any>({});
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadRooms();
    const interval = setInterval(loadRooms, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedUser) {
      loadMessages(selectedUser);
    }
  }, [selectedUser]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadRooms = async () => {
    try {
      const res = await api.get('/chats');
      setRooms(res.rooms || {});
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (userId: string) => {
    try {
      const res = await api.get(`/chats/${userId}`);
      setMessages(res.messages || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !selectedUser || sending) return;
    
    setSending(true);
    try {
      await api.post('/chats/send', { content, targetUserId: selectedUser });
      setContent('');
      loadMessages(selectedUser);
      loadRooms();
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  const roomList = Object.keys(rooms).map(uId => ({
    userId: uId,
    ...rooms[uId]
  })).sort((a, b) => new Date(b.last_message.created_at).getTime() - new Date(a.last_message.created_at).getTime());

  const filteredRooms = roomList.filter(r => 
    r.last_message.sender_name.toLowerCase().includes(search.toLowerCase()) || 
    r.userId.includes(search)
  );

  if (selectedUser) {
    return (
      <div className="flex flex-col h-[calc(100vh-280px)] glass rounded-[40px] overflow-hidden border-white/5 bg-[#0a1529]/60">
        <div className="p-6 border-b border-white/5 flex items-center space-x-4">
          <button onClick={() => setSelectedUser(null)} className="p-2 glass rounded-xl text-gray-500 hover:text-white transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h3 className="font-black text-white uppercase italic tracking-tighter">Chat with {rooms[selectedUser]?.messages[0]?.sender_name || 'User'}</h3>
            <p className="text-[8px] text-[#00f2ff] font-bold uppercase tracking-widest italic">{selectedUser}</p>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {messages.map((m) => {
            const isAdmin = m.sender_role === 'ADMIN';
            return (
              <div key={m.id} className={cn("flex", isAdmin ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[80%] p-4 rounded-2xl space-y-1",
                  isAdmin ? "bg-[#00f2ff] text-[#050b18] rounded-tr-none" : "glass bg-white/5 text-white rounded-tl-none border-white/5"
                )}>
                  <p className="text-sm font-medium leading-relaxed">{m.content}</p>
                  <p className={cn("text-[7px] font-black uppercase tracking-widest text-right", isAdmin ? "text-[#050b18]/60" : "text-gray-500")}>
                    {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <form onSubmit={handleSend} className="p-6 bg-[#0a1529]/80 backdrop-blur-xl border-t border-white/5 flex items-center space-x-3">
          <input 
            type="text"
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Type your response..."
            className="flex-1 h-12 bg-white/5 border border-white/10 rounded-xl px-6 outline-none focus:border-[#00f2ff]/50 text-white text-sm"
          />
          <button 
            type="submit"
            disabled={sending || !content.trim()}
            className="h-12 w-12 rounded-xl bg-[#00f2ff] text-[#050b18] flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {sending ? <RefreshCw className="animate-spin" size={18} /> : <Send size={18} />}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase italic tracking-tighter text-white">Neural Comms</h1>
          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Global Support Feedback Matrix</p>
        </div>
      </div>

      <div className="relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#00f2ff] transition-colors" size={18} />
        <input 
          type="text"
          placeholder="SEARCH USER..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full h-14 bg-[#0a1529]/60 border border-white/5 rounded-3xl pl-14 pr-4 focus:border-[#00f2ff]/50 outline-none text-[10px] font-black uppercase tracking-widest text-[#00f2ff] placeholder:text-gray-800"
        />
      </div>

      <div className="space-y-3">
        {loading ? (
          Array(5).fill(0).map((_, i) => <div key={i} className="h-24 glass rounded-[32px] animate-pulse" />)
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-20 italic text-gray-600 font-bold uppercase tracking-[0.2em] text-xs">No active signals</div>
        ) : (
          filteredRooms.map((room) => (
            <button 
              key={room.userId}
              onClick={() => setSelectedUser(room.userId)}
              className="w-full text-left glass rounded-[32px] p-6 border-white/5 bg-[#0a1529]/40 hover:bg-[#0a1529]/60 transition-all group flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#00f2ff]">
                  <User size={24} />
                </div>
                <div>
                   <h4 className="font-black text-white uppercase italic tracking-tighter group-hover:text-[#00f2ff] transition-colors">
                     {room.last_message.sender_name}
                   </h4>
                   <p className="text-[10px] text-gray-500 font-bold truncate max-w-[200px]">
                     {room.last_message.sender_role === 'ADMIN' ? 'You: ' : ''}{room.last_message.content}
                   </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[8px] font-black text-[#00f2ff] uppercase tracking-widest">
                  {new Date(room.last_message.created_at).toLocaleDateString()}
                </p>
                <Clock size={12} className="text-gray-700 ml-auto mt-1" />
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
