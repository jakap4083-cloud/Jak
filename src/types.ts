export type UserRole = 'MEMBER' | 'ADMIN';
export type UserTier = 'REGULAR' | 'VIP';

export interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  role: UserRole;
  tier: UserTier;
  balance_nx: number;
  balance_idr: number;
  avatar?: string;
  referral_code: string;
  referred_by?: string;
  bank_name?: string;
  bank_account?: string;
  bank_holder?: string;
  transfer_pin?: string;
  completed_tasks?: string[];
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  category: 'BASIC' | 'MEDIUM' | 'HARD';
  price_nx: number;
  reward_per_mining: number;
  mining_per_day: number;
  cooldown_minutes: number;
  duration_days: number;
  image_url: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface UserProduct {
  id: string;
  user_id: string;
  product_id: string;
  purchase_date: string;
  expiry_date: string;
  mining_count_today: number;
  last_mining_date: string;
  status: 'ACTIVE' | 'EXPIRED';
}

export interface MiningSession {
  id: string;
  user_product_id: string;
  start_time: string;
  end_time: string;
  status: 'MINING' | 'READY_TO_CLAIM' | 'CLAIMED';
  reward_amount: number;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'DEPOSIT' | 'WITHDRAW' | 'BONUS' | 'CONVERT' | 'INVEST' | 'MINING';
  amount: number;
  currency: 'NX' | 'IDR';
  description: string;
  status: 'PENDING' | 'SUCCESS' | 'REJECTED' | 'CANCELLED';
  created_at: string;
}

export interface Banner {
  id: string;
  imageUrl: string;
  link?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface PopupEvent {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  waLink?: string;
  tgLink?: string;
  status: 'ACTIVE' | 'INACTIVE';
}
