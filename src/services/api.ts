const API_BASE = '/api';

export const api = {
  get: async (url: string) => {
    const res = await fetch(`${API_BASE}${url}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  post: async (url: string, data: any) => {
    const res = await fetch(`${API_BASE}${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  patch: async (url: string, data: any) => {
    const res = await fetch(`${API_BASE}${url}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  withdraw: async (data: any) => api.post('/transactions/withdraw', data),
  getSettings: async () => api.get('/settings'),
  getAdminStats: async () => api.get('/admin/stats'),
  getAllUsers: async () => api.get('/admin/users'),
  getAllTransactions: async () => api.get('/admin/transactions'),
  updateTransaction: async (id: string, status: string) => api.patch(`/admin/transactions/${id}`, { status }),
  updateSettings: async (settings: any) => api.post('/admin/settings', settings),
  createQRIS: async (amount: number) => api.post('/deposit/qris', { amount }),
  getDepositStatus: async (id: string) => api.get(`/deposit/status/${id}`),
  getNotifications: async () => api.get('/notifications'),
  markNotificationsRead: async () => api.post('/notifications/read-all', {}),
  convert: async (from: string, amount: number) => api.post('/wallet/convert', { from, amount }),
  getInvestmentHistory: async () => api.get('/user/investments/history'),
};
