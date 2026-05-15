import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const DB_FILE = path.join(process.cwd(), 'data/db.json');

// Initialize data if not exists
if (!fs.existsSync(path.dirname(DB_FILE))) {
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
}

const initialData = {
  users: [],
  products: [
    {
      id: 'b1',
      name: 'Nano Spark',
      category: 'BASIC',
      price_nx: 10,
      reward_per_mining: 0.15,
      mining_per_day: 3,
      cooldown_minutes: 180,
      duration_days: 30,
      image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=300&h=300&auto=format&fit=crop',
      description: 'Compact entry-level neural extractor.',
      status: 'ACTIVE'
    },
    {
      id: 'b2',
      name: 'Aether Node',
      category: 'BASIC',
      price_nx: 25,
      reward_per_mining: 0.4,
      mining_per_day: 3,
      cooldown_minutes: 180,
      duration_days: 30,
      image_url: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=300&h=300&auto=format&fit=crop',
      description: 'Stabilized node for consistent small gains.',
      status: 'ACTIVE'
    },
    {
      id: 'b3',
      name: 'Pulse Engine',
      category: 'BASIC',
      price_nx: 50,
      reward_per_mining: 0.85,
      mining_per_day: 3,
      cooldown_minutes: 180,
      duration_days: 45,
      image_url: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?q=80&w=300&h=300&auto=format&fit=crop',
      description: 'High-frequency pulse engine for rapid sorting.',
      status: 'ACTIVE'
    },
    {
      id: 'b4',
      name: 'Flux Rig',
      category: 'BASIC',
      price_nx: 100,
      reward_per_mining: 1.8,
      mining_per_day: 3,
      cooldown_minutes: 180,
      duration_days: 45,
      image_url: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=300&h=300&auto=format&fit=crop',
      description: 'Industrial-grade starter hardware.',
      status: 'ACTIVE'
    },
    {
      id: 'm1',
      name: 'Vortex Core',
      category: 'MEDIUM',
      price_nx: 250,
      reward_per_mining: 4.5,
      mining_per_day: 3,
      cooldown_minutes: 180,
      duration_days: 60,
      image_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=300&h=300&auto=format&fit=crop',
      description: 'Advanced centrifugal mining technology.',
      status: 'ACTIVE'
    },
    {
      id: 'm2',
      name: 'Quasar Matrix',
      category: 'MEDIUM',
      price_nx: 500,
      reward_per_mining: 9.5,
      mining_per_day: 3,
      cooldown_minutes: 180,
      duration_days: 60,
      image_url: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=300&h=300&auto=format&fit=crop',
      description: 'Multi-threaded matrix for high-load operations.',
      status: 'ACTIVE'
    },
    {
      id: 'm3',
      name: 'Spectral Unit',
      category: 'MEDIUM',
      price_nx: 1000,
      reward_per_mining: 20,
      mining_per_day: 3,
      cooldown_minutes: 180,
      duration_days: 90,
      image_url: 'https://images.unsplash.com/photo-1563206767-5b18f218e7de?q=80&w=300&h=300&auto=format&fit=crop',
      description: 'Spectral-alignment processor for deep mining.',
      status: 'ACTIVE'
    },
    {
      id: 'm4',
      name: 'Omni Driver',
      category: 'MEDIUM',
      price_nx: 2500,
      reward_per_mining: 55,
      mining_per_day: 3,
      cooldown_minutes: 180,
      duration_days: 90,
      image_url: 'https://images.unsplash.com/photo-1534972195531-d756b9bfa9f2?q=80&w=300&h=300&auto=format&fit=crop',
      description: 'All-purpose high-performance driver.',
      status: 'ACTIVE'
    },
    {
      id: 'h1',
      name: 'Nebula Forge',
      category: 'HARD',
      price_nx: 5000,
      reward_per_mining: 120,
      mining_per_day: 3,
      cooldown_minutes: 180,
      duration_days: 120,
      image_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=300&h=300&auto=format&fit=crop',
      description: 'Massive gravitational forge for raw NX power.',
      status: 'ACTIVE'
    },
    {
      id: 'h2',
      name: 'Titan Dynamo',
      category: 'HARD',
      price_nx: 10000,
      reward_per_mining: 250,
      mining_per_day: 3,
      cooldown_minutes: 180,
      duration_days: 120,
      image_url: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=300&h=300&auto=format&fit=crop',
      description: 'The backbone of large-scale neural operations.',
      status: 'ACTIVE'
    },
    {
      id: 'h3',
      name: 'Supernova Grid',
      category: 'HARD',
      price_nx: 25000,
      reward_per_mining: 650,
      mining_per_day: 3,
      cooldown_minutes: 180,
      duration_days: 180,
      image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=300&h=300&auto=format&fit=crop',
      description: 'A grid-scale array for absolute dominance.',
      status: 'ACTIVE'
    },
    {
      id: 'h4',
      name: 'Infinity Core',
      category: 'HARD',
      price_nx: 50000,
      reward_per_mining: 1400,
      mining_per_day: 3,
      cooldown_minutes: 180,
      duration_days: 180,
      image_url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=300&h=300&auto=format&fit=crop',
      description: 'Endless energy, infinite extraction.',
      status: 'ACTIVE'
    }
  ],
  user_products: [],
  mining_sessions: [],
  transactions: [],
  withdrawals: [],
  deposits: [],
  chats: [],
  daily_tasks: [
    { id: 'task_1', title: 'Check-in Harian', reward: 0.1, icon: 'CalendarDays' },
    { id: 'task_2', title: 'Mulai Mining Pertama', reward: 0.2, icon: 'Zap' },
    { id: 'task_3', title: 'Promosi ke Teman', reward: 0.5, icon: 'Share2' },
    { id: 'task_4', title: 'Gabung Channel Telegram', reward: 0.3, icon: 'Send' }
  ],
  banners: [
    { id: 'b1', imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=800&h=400&auto=format&fit=crop', link: '#', status: 'ACTIVE' },
    { id: 'b2', imageUrl: 'https://images.unsplash.com/photo-1642104704074-907c0698bcd9?q=80&w=800&h=400&auto=format&fit=crop', link: '#', status: 'ACTIVE' }
  ],
  popups: [],
  settings: {
    nx_to_idr: 7000,
    exchange_rate_updated_at: new Date().toISOString(),
    min_deposit: 10000,
    min_withdraw: 50000,
    withdraw_fee: 2500,
    withdraw_fee_pct: 5,
    exchange_rate: 7000,
    registration_bonus_nx: 3,
    referral_reward_pct: 10,
    maintenance: false,
    manual_bank_name: 'BCA',
    manual_bank_account: '9876543210',
    manual_bank_holder: 'ADMIN NAXORA',
    wa_admin: '628123456789',
    tg_admin: '@naxora_admin'
  },
  admin_logs: [],
  system_logs: []
};

if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
}

export const getDb = () => {
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
};

export const saveDb = (data: any) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// Helper for UUID
export const generateId = () => uuidv4();
