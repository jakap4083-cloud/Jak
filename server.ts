import express from "express";
import path from "path";
import cors from "cors";
import session from "express-session";

declare module 'express-session' {
  interface SessionData {
    userId: string;
  }
}

import { createServer as createViteServer } from "vite";
import { getDb, saveDb, generateId } from "./src/services/database.ts";
import { addMinutes, isAfter } from "date-fns";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cors());
  app.use(
    session({
      secret: "naxora-secret-key-premium",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 },
    })
  );

  // Auth Middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const db = getDb();
    const user = db.users.find((u: any) => u.id === req.session.userId);
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    
    // Blocked check
    if (user.status === "BLOCKED") {
      req.session.destroy(() => {});
      return res.status(403).json({ error: "Akun Anda telah ditangguhkan (Blocked)." });
    }

    // Maintenance check
    if (db.settings.maintenance && user.role !== "ADMIN" && !req.path.startsWith('/api/auth')) {
      return res.status(503).json({ error: "Sistem sedang dalam pemeliharaan (Maintenance Mode)." });
    }

    next();
  };

  const requireAdmin = (req: any, res: any, next: any) => {
    const db = getDb();
    const user = db.users.find((u: any) => u.id === req.session.userId);
    if (!user || user.role !== "ADMIN") {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };

  const processReferralReward = (db: any, userId: string, amount: number, currency: string, description: string) => {
    const user = db.users.find((u: any) => u.id === userId);
    if (!user || !user.referred_by) return;

    const referrer = db.users.find((u: any) => u.referral_code === user.referred_by);
    if (!referrer) return;

    const rewardPct = db.settings.referral_reward_pct || 10;
    const rewardAmount = (amount * rewardPct) / 100;

    if (currency === 'NX') {
      referrer.balance_nx += rewardAmount;
    } else {
      referrer.balance_idr += rewardAmount;
    }

    db.transactions.push({
      id: generateId(),
      user_id: referrer.id,
      type: "REFERRAL_REWARD",
      amount: rewardAmount,
      currency,
      description: `Referral reward from ${user.username}: ${description}`,
      status: "SUCCESS",
      created_at: new Date().toISOString()
    });

    createNotification(db, referrer.id, "Referral Reward", `Anda menerima reward referral sebesar ${rewardAmount.toLocaleString()} ${currency} dari ${user.username}.`, "GIFT");
  };

  const createNotification = (db: any, userId: string, title: string, message: string, type: string = "INFO") => {
    db.notifications = db.notifications || [];
    db.notifications.push({
      id: generateId(),
      user_id: userId,
      title,
      message,
      type, // INFO, SUCCESS, WARNING, GIFT
      read: false,
      created_at: new Date().toISOString()
    });
  };

  // --- AUTH ROUTES ---
  app.post("/api/auth/register", (req, res) => {
    const { username, email, phone, password, referral } = req.body;
    const db = getDb();

    if (db.users.find((u: any) => u.username === username || u.email === email)) {
      return res.status(400).json({ error: "User already exists" });
    }

    const bonus = db.settings.registration_bonus_nx || 3;
    const newUser = {
      id: generateId(),
      username,
      email,
      phone,
      password, // In real app, hash this!
      role: "MEMBER",
      tier: "REGULAR",
      balance_nx: bonus,
      balance_idr: 0,
      referral_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
      referred_by: referral || null,
      status: "ACTIVE", // ACTIVE, BLOCKED
      is_frozen: false,
      transfer_pin: null, // User must set this later
      created_at: new Date().toISOString(),
    };

    db.users.push(newUser);

    if (bonus > 0) {
      db.transactions.push({
        id: generateId(),
        user_id: newUser.id,
        type: "REWARD",
        amount: bonus,
        currency: "NX",
        description: "Bonus pendaftaran baru",
        status: "SUCCESS",
        created_at: new Date().toISOString()
      });
      createNotification(db, newUser.id, "Bonus Selamat Datang", `Selamat! Anda mendapatkan bonus ${bonus} NX secara gratis.`, "GIFT");
    }
    saveDb(db);

    req.session.userId = newUser.id;
    res.json({ message: "Registration successful", user: newUser });
  });

  app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body;
    const db = getDb();

    // Default admin check
    if (username === "admin" && password === "admin123") {
      let admin = db.users.find((u: any) => u.username === "admin");
      if (!admin) {
        admin = {
          id: generateId(),
          username: "admin",
          email: "admin@naxora.page",
          role: "ADMIN",
          tier: "VIP",
          balance_nx: 0,
          balance_idr: 0,
          referral_code: "ADMIN",
          created_at: new Date().toISOString(),
        };
        db.users.push(admin);
        saveDb(db);
      }
      req.session.userId = admin.id;
      return res.json({ message: "Admin login successful", user: admin });
    }

    const user = db.users.find((u: any) => u.username === username && u.password === password);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    req.session.userId = user.id;
    res.json({ message: "Login successful", user });
  });

  app.get("/api/auth/me", (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: "Not logged in" });
    const db = getDb();
    const user = db.users.find((u: any) => u.id === req.session.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  });

  app.post("/api/user/bank", requireAuth, (req, res) => {
    const { bank_name, bank_account, bank_holder } = req.body;
    const db = getDb();
    const user = db.users.find((u: any) => u.id === req.session.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.bank_name = bank_name;
    user.bank_account = bank_account;
    user.bank_holder = bank_holder;

    createNotification(db, user.id, "Informasi Bank Diperbarui", "Informasi rekening bank Anda telah berhasil diperbarui.", "INFO");

    saveDb(db);
    res.json({ message: "Bank info updated", user });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out" });
    });
  });

  // --- PRODUCTS & INVESTMENTS ---
  app.get("/api/products", (req, res) => {
    const db = getDb();
    res.json({ products: db.products.filter((p: any) => p.status === "ACTIVE") });
  });

  app.post("/api/invest/buy", requireAuth, (req, res) => {
    const { productId } = req.body;
    const db = getDb();
    const user = db.users.find((u: any) => u.id === req.session.userId);
    const product = db.products.find((p: any) => p.id === productId);

    if (!user || !product) return res.status(404).json({ error: "Not found" });
    if (user.balance_nx < product.price_nx) return res.status(400).json({ error: "Insufficient NX balance" });

    // Deduct balance
    user.balance_nx -= product.price_nx;

    createNotification(db, user.id, "Pembelian Paket", `Anda telah berhasil membeli ${product.name} seharga ${product.price_nx.toLocaleString()} NX.`, "INFO");

    const userProduct = {
      id: generateId(),
      user_id: user.id,
      product_id: product.id,
      purchase_date: new Date().toISOString(),
      expiry_date: addMinutes(new Date(), product.duration_days * 24 * 60).toISOString(),
      mining_count_today: 0,
      last_mining_date: null,
      status: "ACTIVE",
    };

    db.user_products.push(userProduct);
    
    // Transaction log
    db.transactions.push({
      id: generateId(),
      user_id: user.id,
      type: "INVEST",
      amount: product.price_nx,
      currency: "NX",
      description: `Purchase product: ${product.name}`,
      status: "SUCCESS",
      created_at: new Date().toISOString()
    });

    // Referral Reward for Purchase
    processReferralReward(db, user.id, product.price_nx, "NX", `Purchase product: ${product.name}`);

    saveDb(db);
    res.json({ message: "Product purchased successfully", userProduct });
  });

  app.get("/api/user/products", requireAuth, (req, res) => {
    const db = getDb();
    const myProducts = db.user_products
      .filter((up: any) => up.user_id === req.session.userId && up.status === "ACTIVE")
      .map((up: any) => {
        const product = db.products.find((p: any) => p.id === up.product_id);
        const session = db.mining_sessions.find((s: any) => s.user_product_id === up.id && (s.status === 'MINING' || s.status === 'READY_TO_CLAIM'));
        return { ...up, product, current_session: session };
      });
    res.json({ products: myProducts });
  });

  app.get("/api/user/investments/history", requireAuth, (req, res) => {
    const db = getDb();
    const history = db.user_products
      .filter((up: any) => up.user_id === req.session.userId)
      .map((up: any) => {
        const product = db.products.find((p: any) => p.id === up.product_id);
        return { ...up, product };
      });
    res.json({ history: history.reverse() });
  });

  // --- MINING WORK ---
  app.post("/api/mining/start", requireAuth, (req, res) => {
    const { userProductId } = req.body;
    const db = getDb();
    const up = db.user_products.find((u: any) => u.id === userProductId && u.user_id === req.session.userId);
    if (!up) return res.status(404).json({ error: "User product not found" });

    const product = db.products.find((p: any) => p.id === up.product_id);
    
    // Check daily limit
    const today = new Date().toDateString();
    const lastDate = up.last_mining_date ? new Date(up.last_mining_date).toDateString() : null;
    if (lastDate === today && up.mining_count_today >= product.mining_per_day) {
      return res.status(400).json({ error: "Daily mining limit reached" });
    }

    // Check existing active session
    const activeSession = db.mining_sessions.find((s: any) => s.user_product_id === up.id && (s.status === 'MINING' || s.status === 'READY_TO_CLAIM'));
    if (activeSession) return res.status(400).json({ error: "Mining session already active" });

    const startTime = new Date();
    const endTime = addMinutes(startTime, product.cooldown_minutes);

    const session = {
      id: generateId(),
      user_product_id: up.id,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      status: "MINING",
      reward_amount: product.reward_per_mining
    };

    db.mining_sessions.push(session);
    saveDb(db);

    res.json({ message: "Mining started", session });
  });

  app.post("/api/mining/claim", requireAuth, (req, res) => {
    const { sessionId } = req.body;
    const db = getDb();
    const session = db.mining_sessions.find((s: any) => s.id === sessionId);
    if (!session || session.status !== "READY_TO_CLAIM") {
      // Logic for checking time if not already marked as READY_TO_CLAIM
      if (session && session.status === 'MINING' && isAfter(new Date(), new Date(session.end_time))) {
         session.status = 'READY_TO_CLAIM';
      } else {
         return res.status(400).json({ error: "Reward not ready for claim" });
      }
    }

    const up = db.user_products.find((u: any) => u.id === session.user_product_id);
    const user = db.users.find((u: any) => u.id === up.user_id);

    // Update User Wallet
    user.balance_nx += session.reward_amount;
    session.status = "CLAIMED";

    // Update User Product Stats
    const today = new Date().toDateString();
    const lastDate = up.last_mining_date ? new Date(up.last_mining_date).toDateString() : null;
    if (lastDate === today) {
      up.mining_count_today += 1;
    } else {
      up.mining_count_today = 1;
    }
    up.last_mining_date = new Date().toISOString();

    // Transaction
    db.transactions.push({
      id: generateId(),
      user_id: user.id,
      type: "MINING",
      amount: session.reward_amount,
      currency: "NX",
      description: "Mining reward",
      status: "SUCCESS",
      created_at: new Date().toISOString()
    });

    createNotification(db, user.id, "Mining Selesai", `Sesi mining Anda telah selesai. Reward sebesar ${session.reward_amount.toLocaleString()} NX telah ditambahkan ke saldo Anda.`, "SUCCESS");

    saveDb(db);
    res.json({ message: "Reward claimed successfully", balance_nx: user.balance_nx });
  });

  // --- WALLET & TRANSACTIONS ---
  app.get("/api/user/transactions", requireAuth, (req, res) => {
    const db = getDb();
    const history = db.transactions.filter((t: any) => t.user_id === req.session.userId);
    res.json({ transactions: history.reverse() });
  });

  app.post("/api/wallet/convert", requireAuth, (req, res) => {
    const { from, amount } = req.body; // from: 'NX' or 'IDR'
    const db = getDb();
    const user = db.users.find((u: any) => u.id === req.session.userId);
    const rate = db.settings.nx_to_idr;

    if (from === 'NX') {
      if (user.balance_nx < amount) return res.status(400).json({ error: "Insufficient NX" });
      user.balance_nx -= amount;
      user.balance_idr += amount * rate;
    } else {
      if (user.balance_idr < amount) return res.status(400).json({ error: "Insufficient IDR" });
      user.balance_idr -= amount;
      user.balance_nx += amount / rate;
    }

    db.transactions.push({
      id: generateId(),
      user_id: user.id,
      type: "CONVERT",
      amount: amount,
      currency: from,
      description: `Convert ${amount} ${from}`,
      status: "SUCCESS",
      created_at: new Date().toISOString()
    });

    createNotification(db, user.id, "Konversi Saldo", `Anda telah mengonversi ${amount.toLocaleString()} ${from} secara berhasil.`, "INFO");

    saveDb(db);
    res.json({ message: "Convert success", user });
  });

  app.post("/api/transactions/withdraw", requireAuth, (req, res) => {
    const { amount, method, address } = req.body;
    const db = getDb();
    const user = db.users.find((u: any) => u.id === req.session.userId);

    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.balance_idr < amount) return res.status(400).json({ error: "Insufficient balance" });

    // Deduct balance
    user.balance_idr -= amount;

    // Create transaction
    const transaction = {
      id: generateId(),
      user_id: user.id,
      username: user.username,
      type: "WITHDRAW",
      amount,
      method,
      address,
      status: "PENDING",
      created_at: new Date().toISOString()
    };

    db.transactions.push(transaction);
    createNotification(db, user.id, "Penarikan Diajukan", `Permintaan penarikan Anda sebesar Rp ${amount.toLocaleString()} telah kami terima dan sedang diproses.`, "INFO");
    saveDb(db);

    res.json({ message: "Withdrawal request submitted", transaction });
  });

  app.post("/api/transactions/cancel", requireAuth, (req, res) => {
    const { id } = req.body;
    const db = getDb();
    const tx = db.transactions.find((t: any) => t.id === id && t.user_id === req.session.userId);

    if (!tx) return res.status(404).json({ error: "Transaction not found" });
    if (tx.type !== 'WITHDRAW' || tx.status !== 'PENDING') {
      return res.status(400).json({ error: "Only pending withdrawals can be cancelled" });
    }

    // Refund balance
    const user = db.users.find((u: any) => u.id === req.session.userId);
    if (user) {
      user.balance_idr += tx.amount;
    }

    tx.status = 'CANCELLED';
    createNotification(db, req.session.userId, "Penarikan Dibatalkan", `Penarikan sebesar Rp ${tx.amount.toLocaleString()} telah dibatalkan oleh pengguna. Saldo dikembalikan.`, "WARNING");

    saveDb(db);
    res.json({ message: "Transaction cancelled", balance_idr: user?.balance_idr });
  });

  // --- SETTINGS ---
  app.get("/api/settings", (req, res) => {
    const db = getDb();
    res.json(db.settings);
  });

  // --- ADMIN ROUTES ---
  app.get("/api/admin/stats", requireAdmin, (req, res) => {
    const db = getDb();
    const total_users = db.users.length;
    const total_deposits = db.transactions
      .filter((t: any) => t.type === 'DEPOSIT' && t.status === 'SUCCESS')
      .reduce((sum: number, t: any) => sum + t.amount, 0);
    const total_withdrawals = db.transactions
      .filter((t: any) => t.type === 'WITHDRAW' && t.status === 'COMPLETED')
      .reduce((sum: number, t: any) => sum + t.amount, 0);
    const pending_withdrawals = db.transactions.filter((t: any) => t.type === 'WITHDRAW' && t.status === 'PENDING').length;

    // Member growth chart data (last 7 days)
    const registrations: any[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const count = db.users.filter((u: any) => u.created_at.startsWith(dateStr)).length;
      registrations.push({ date: dateStr, count });
    }

    res.json({
      total_users,
      total_deposits,
      total_withdrawals,
      pending_withdrawals,
      registrations
    });
  });

  app.post("/api/admin/users/balance", requireAdmin, (req, res) => {
    const { userId, type, currency, amount } = req.body;
    const db = getDb();
    const user = db.users.find((u: any) => u.id === userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (currency === 'NX') {
      if (type === 'ADD') user.balance_nx += amount;
      else user.balance_nx -= amount;
    } else {
      if (type === 'ADD') user.balance_idr += amount;
      else user.balance_idr -= amount;
    }

    db.transactions.push({
      id: generateId(),
      user_id: user.id,
      type: "SYSTEM_ADJUST",
      amount,
      currency,
      description: `Penyesuaian saldo oleh sistem (${type === 'ADD' ? '+' : '-'})`,
      status: "SUCCESS",
      created_at: new Date().toISOString()
    });

    createNotification(db, user.id, "Penyesuaian Saldo", `Saldo Anda telah disesuaikan oleh administrator sebesar ${amount.toLocaleString()} ${currency}.`, type === 'ADD' ? "GIFT" : "WARNING");

    saveDb(db);
    res.json({ message: "Balance updated", user });
  });

  app.post("/api/admin/users/status", requireAdmin, (req, res) => {
    const { userId, status, is_frozen } = req.body;
    const db = getDb();
    const user = db.users.find((u: any) => u.id === userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (status !== undefined) user.status = status;
    if (is_frozen !== undefined) user.is_frozen = is_frozen;

    saveDb(db);
    res.json({ message: "User status updated", user });
  });

  app.get("/api/admin/users/:userId/details", requireAdmin, (req, res) => {
    const { userId } = req.params;
    const db = getDb();
    const user = db.users.find((u: any) => u.id === userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const transactions = db.transactions.filter((t: any) => t.user_id === userId).reverse().slice(0, 20);
    const userProducts = db.user_products
      .filter((up: any) => up.user_id === userId)
      .map((up: any) => {
        const product = db.products.find((p: any) => p.id === up.product_id);
        return { ...up, product };
      });

    const referrals = db.users.filter((u: any) => u.referred_by === user.referral_code).length;

    res.json({
      user,
      transactions,
      userProducts,
      referrals
    });
  });

  // --- CHAT SYSTEM ---
  app.get("/api/chats", requireAuth, (req, res) => {
    const db = getDb();
    const user = db.users.find((u: any) => u.id === req.session.userId);
    let messages = [];
    
    if (user.role === 'ADMIN') {
      // Admins see all conversations grouped by user
      const allMessages = db.chats || [];
      const rooms: any = {};
      allMessages.forEach((m: any) => {
        const uId = m.user_id;
        if (!rooms[uId]) rooms[uId] = { messages: [], last_message: m };
        rooms[uId].messages.push(m);
        if (new Date(m.created_at) > new Date(rooms[uId].last_message.created_at)) {
           rooms[uId].last_message = m;
        }
      });
      return res.json({ rooms });
    } else {
      messages = (db.chats || []).filter((m: any) => m.user_id === req.session.userId);
      res.json({ messages });
    }
  });

  app.post("/api/chats/send", requireAuth, (req, res) => {
    const { content, targetUserId } = req.body; // targetUserId only for admin
    const db = getDb();
    const user = db.users.find((u: any) => u.id === req.session.userId);
    
    const newMessage = {
      id: generateId(),
      user_id: user.role === 'ADMIN' ? targetUserId : user.id,
      sender_id: user.id,
      sender_name: user.username,
      sender_role: user.role,
      content,
      created_at: new Date().toISOString()
    };

    db.chats = db.chats || [];
    db.chats.push(newMessage);
    saveDb(db);
    res.json({ message: "Message sent", chat: newMessage });
  });

  app.get("/api/chats/:userId", requireAdmin, (req, res) => {
    const { userId } = req.params;
    const db = getDb();
    const messages = (db.chats || []).filter((m: any) => m.user_id === userId);
    res.json({ messages });
  });

  app.get("/api/admin/users", requireAdmin, (req, res) => {
    const db = getDb();
    res.json(db.users);
  });

  app.get("/api/admin/transactions", requireAdmin, (req, res) => {
    const db = getDb();
    const txs = db.transactions.map((t: any) => {
      const user = db.users.find((u: any) => u.id === t.user_id);
      return { ...t, username: user?.username || 'Unknown' };
    });
    res.json(txs.reverse());
  });

  app.patch("/api/admin/transactions/:id", requireAdmin, (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const db = getDb();
    const tx = db.transactions.find((t: any) => t.id === id);

    if (!tx) return res.status(404).json({ error: "Transaction not found" });

    // If rejecting a withdrawal, refund balance
    if (tx.type === 'WITHDRAW' && tx.status === 'PENDING' && status === 'FAILED') {
      const user = db.users.find((u: any) => u.id === tx.user_id);
      if (user) {
        user.balance_idr += tx.amount;
        createNotification(db, user.id, "Penarikan Gagal", `Permintaan penarikan Anda sebesar Rp ${tx.amount.toLocaleString()} telah ditolak. Saldo Anda telah dikembalikan.`, "WARNING");
      }
    }

    // If approving a deposit, trigger reward
    if (tx.type === 'DEPOSIT' && tx.status === 'PENDING' && (status === 'SUCCESS' || status === 'COMPLETED')) {
       const user = db.users.find((u: any) => u.id === tx.user_id);
       if (user) {
          // Add balance if it wasn't added yet (assuming manual deposit needs balance update)
          // For now, let's assume successful deposit adds balance here if not already handled
          user.balance_idr += tx.amount;
          processReferralReward(db, tx.user_id, tx.amount, "IDR", "Manual Deposit Success");
          createNotification(db, user.id, "Deposit Berhasil", `Deposit Anda sebesar Rp ${tx.amount.toLocaleString()} telah berhasil dikonfirmasi.`, "SUCCESS");
       }
    }

    if (tx.type === 'WITHDRAW' && status === 'COMPLETED') {
        const user = db.users.find((u: any) => u.id === tx.user_id);
        if (user) {
            createNotification(db, user.id, "Penarikan Berhasil", `Penarikan Anda sebesar Rp ${tx.amount.toLocaleString()} telah berhasil diproses.`, "SUCCESS");
        }
    }

    tx.status = status;
    saveDb(db);
    res.json({ message: "Transaction updated", tx });
  });

  app.post("/api/admin/settings", requireAdmin, (req, res) => {
    const newSettings = req.body;
    const db = getDb();
    db.settings = { ...db.settings, ...newSettings };
    saveDb(db);
    res.json({ message: "Settings updated", settings: db.settings });
  });

  app.post("/api/deposit/manual", requireAuth, (req, res) => {
    const { amount, method } = req.body;
    const db = getDb();
    
    const deposit = {
      id: generateId(),
      user_id: req.session.userId,
      username: db.users.find((u: any) => u.id === req.session.userId).username,
      amount,
      method: method || 'MANUAL BANK',
      status: 'PENDING',
      type: 'DEPOSIT',
      created_at: new Date().toISOString()
    };

    db.transactions.push(deposit);
    saveDb(db);

    createNotification(db, req.session.userId, "Deposit Berhasil Diajukan", `Admin akan segera memverifikasi deposit Anda sebesar Rp ${amount.toLocaleString()}.`, "INFO");

    res.json({ message: "Deposit request submitted", deposit });
  });

  app.post("/api/user/pin/set", requireAuth, (req, res) => {
    const { pin } = req.body;
    const db = getDb();
    const user = db.users.find((u: any) => u.id === req.session.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.transfer_pin = pin;
    saveDb(db);
    res.json({ message: "PIN set successfully" });
  });

  app.post("/api/user/pin/verify", requireAuth, (req, res) => {
    const { pin } = req.body;
    const db = getDb();
    const user = db.users.find((u: any) => u.id === req.session.userId);
    if (user.transfer_pin === pin) {
      res.json({ success: true });
    } else {
      res.status(400).json({ error: "PIN tidak valid" });
    }
  });

  app.get("/api/notifications", requireAuth, (req, res) => {
    const db = getDb();
    const notifications = (db.notifications || [])
      .filter((n: any) => n.user_id === req.session.userId)
      .reverse();
    res.json({ notifications: notifications.slice(0, 50) });
  });

  app.post("/api/notifications/read-all", requireAuth, (req, res) => {
    const db = getDb();
    const myNotifications = (db.notifications || []).filter((n: any) => n.user_id === req.session.userId);
    myNotifications.forEach((n: any) => n.read = true);
    saveDb(db);
    res.json({ message: "All notifications marked as read" });
  });

  // --- QRIS API LOGIC ---
  app.post("/api/deposit/qris", requireAuth, async (req, res) => {
    const { amount } = req.body;
    const db = getDb();
    const id = generateId();
    
    // Provided credentials usage
    const qrisId = process.env.QRIS_ID || "33d0b12f-24a0-4926-93c0-8c52c73ed861";
    const qrisKey = process.env.QRIS_API_KEY || "cashify_...";
    
    console.log(`Generating QRIS with ID: ${qrisId} and Key starts with: ${qrisKey.substring(0, 10)}...`);
    
    // In a real production scenario, we would call the gateway API here:
    // const response = await fetch("https://api.qris.id/v1/create", { ... });
    
    const deposit = {
      id,
      user_id: req.session.userId,
      amount,
      method: "QRIS",
      qris_data: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=QRIS_ID_${qrisId}_KEY_${qrisKey.substring(0, 8)}_ID_${id}`,
      status: "PENDING",
      created_at: new Date().toISOString()
    };
    
    db.deposits.push(deposit);
    saveDb(db);
    res.json({ deposit });
  });

  app.get("/api/deposit/status/:id", requireAuth, (req, res) => {
    const { id } = req.params;
    const db = getDb();
    const deposit = db.deposits.find((d: any) => d.id === id && d.user_id === req.session.userId);
    if (!deposit) return res.status(404).json({ error: "Deposit not found" });
    res.json({ status: deposit.status });
  });

  // --- CRON LOGIC (Simulated) ---
  setInterval(() => {
    const db = getDb();
    let changed = false;

    // Check mining sessions
    db.mining_sessions.forEach((s: any) => {
      if (s.status === 'MINING' && isAfter(new Date(), new Date(s.end_time))) {
        s.status = 'READY_TO_CLAIM';
        changed = true;
      }
    });

    // Check pending QRIS (Simulated success after 20s for demo)
    db.deposits.forEach((d: any) => {
      if (d.status === 'PENDING' && d.method === 'QRIS' && isAfter(new Date(), addMinutes(new Date(d.created_at), 0.33))) {
        d.status = 'SUCCESS';
        const user = db.users.find((u: any) => u.id === d.user_id);
        if (user) {
          user.balance_idr += d.amount;
          db.transactions.push({
            id: generateId(),
            user_id: user.id,
            type: "DEPOSIT",
            amount: d.amount,
            currency: "IDR",
            description: "Deposit QRIS Success",
            status: "SUCCESS",
            created_at: new Date().toISOString()
          });
          processReferralReward(db, user.id, d.amount, "IDR", "QRIS Deposit Success");
          createNotification(db, user.id, "Deposit QRIS Berhasil", `Neural Balance: Deposit Rp ${d.amount.toLocaleString()} via QRIS telah berhasil diverifikasi.`, "SUCCESS");
        }
        changed = true;
      }
    });

    // Check product expiry
    db.user_products.forEach((up: any) => {
      if (up.status === 'ACTIVE' && isAfter(new Date(), new Date(up.expiry_date))) {
        up.status = 'EXPIRED';
        changed = true;
      }
    });

    if (changed) saveDb(db);
  }, 5000);

  // Serve static UI
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
