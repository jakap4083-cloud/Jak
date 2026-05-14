import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, Settings, LogOut, ArrowLeft, Package, MessageSquare } from 'lucide-react';
import { cn } from '../lib/utils';
import AdminDashboard from './Admin/Dashboard';
import AdminTransactions from './Admin/Transactions';
import AdminSettings from './Admin/Settings';
import AdminUsers from './Admin/Users';
import AdminProducts from './Admin/Products';
import AdminChat from './Admin/Chat';

export default function Admin() {
  const location = useLocation();

  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Control' },
    { path: '/admin/transactions', icon: CreditCard, label: 'Traffic' },
    { path: '/admin/users', icon: Users, label: 'Members' },
    { path: '/admin/products', icon: Package, label: 'Assets' },
    { path: '/admin/chats', icon: MessageSquare, label: 'Chats' },
    { path: '/admin/settings', icon: Settings, label: 'System' },
  ];

  return (
    <div className="space-y-8 pb-32">
      {/* Admin Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
           <Link to="/" className="p-2 glass rounded-2xl border-white/5 text-gray-500 hover:text-white">
              <ArrowLeft size={18} />
           </Link>
           <div>
              <h1 className="text-xl font-black uppercase italic tracking-tighter">NX Core</h1>
              <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest leading-none">Administration Interface</p>
           </div>
        </div>
        <div className="h-10 w-10 rounded-2xl glass border-rose-500/20 flex items-center justify-center text-rose-500">
           <LogOut size={18} />
        </div>
      </div>

      {/* Admin Nav */}
      <div className="grid grid-cols-6 gap-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center p-3 rounded-[24px] border transition-all space-y-2",
                isActive 
                  ? "bg-[#00f2ff]/10 border-[#00f2ff]/30 text-[#00f2ff] shadow-[0_0_20px_rgba(0,242,255,0.1)]" 
                  : "glass border-white/5 text-gray-500"
              )}
            >
              <item.icon size={16} />
              <span className="text-[6px] font-black uppercase tracking-widest">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Content Area */}
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/transactions" element={<AdminTransactions />} />
        <Route path="/users" element={<AdminUsers />} />
        <Route path="/products" element={<AdminProducts />} />
        <Route path="/chats" element={<AdminChat />} />
        <Route path="/settings" element={<AdminSettings />} />
      </Routes>
    </div>
  );
}
