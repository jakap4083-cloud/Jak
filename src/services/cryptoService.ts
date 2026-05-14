export interface CryptoPrice {
  symbol: string;
  price: string;
  change: string;
  isUp: boolean;
}

type MarketCallback = (prices: CryptoPrice[]) => void;

class CryptoService {
  private ws: WebSocket | null = null;
  private callbacks: MarketCallback[] = [];
  private prices: Record<string, CryptoPrice> = {
    BTCUSDT: { symbol: 'BTC', price: '0', change: '0', isUp: true },
    ETHUSDT: { symbol: 'ETH', price: '0', change: '0', isUp: true },
    BNBUSDT: { symbol: 'BNB', price: '0', change: '0', isUp: true },
    SOLUSDT: { symbol: 'SOL', price: '0', change: '0', isUp: true },
  };

  constructor() {
    if (typeof window !== 'undefined') {
      this.connect();
    }
  }

  private connect() {
    try {
      const streams = ['btcusdt', 'ethusdt', 'bnbusdt', 'solusdt'].map(s => `${s}@ticker`).join('/');
      this.ws = new WebSocket(`wss://stream.binance.com:9443/ws/${streams}`);

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const symbol = data.s;
        const currentPrice = parseFloat(data.c);
        const change = parseFloat(data.P);
        
        const priceStr = currentPrice.toLocaleString(undefined, { 
          minimumFractionDigits: currentPrice < 100 ? 4 : 2,
          maximumFractionDigits: currentPrice < 100 ? 4 : 2
        });

        this.prices[symbol] = {
          symbol: symbol.replace('USDT', ''),
          price: priceStr,
          change: change > 0 ? `+${change.toFixed(2)}%` : `${change.toFixed(2)}%`,
          isUp: change >= 0
        };

        this.notify();
      };

      this.ws.onclose = () => {
        console.log('Crypto WS closed, reconnecting...');
        setTimeout(() => this.connect(), 5000);
      };

      this.ws.onerror = (err) => {
        console.error('Crypto WS error:', err);
        this.ws?.close();
      };
    } catch (e) {
      console.error('Failed to connect to crypto WS:', e);
    }
  }

  private notify() {
    const priceList = Object.values(this.prices);
    this.callbacks.forEach(cb => cb(priceList));
  }

  subscribe(cb: MarketCallback) {
    this.callbacks.push(cb);
    cb(Object.values(this.prices));
    return () => {
      this.callbacks = this.callbacks.filter(c => c !== cb);
    };
  }
}

export const cryptoService = new CryptoService();
