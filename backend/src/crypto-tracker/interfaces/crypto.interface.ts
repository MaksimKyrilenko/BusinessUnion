export interface CoinPrice {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  total_volume: number;
  market_cap: number;
  image: string;
  last_updated: string;
}

export interface SocialMetrics {
  symbol: string;
  name: string;
  galaxy_score?: number;
  alt_rank?: number;
  social_volume?: number;
  social_score?: number;
  social_contributors?: number;
  social_influence?: number;
  market_cap_rank?: number;
  price_btc?: number;
  price_change_24h?: number;
}

export interface MarketHeatmapItem {
  id: string;
  symbol: string;
  name: string;
  price_change_percentage_24h: number;
  market_cap: number;
  volume_24h: number;
  category?: string;
}

export interface TrustIndex {
  symbol: string;
  score: number; // 0-100
  factors: {
    volatility: number;
    volume: number;
    social: number;
    news: number;
  };
}

export interface AnomalyAlert {
  id: string;
  symbol: string;
  type: 'price_spike' | 'volume_surge' | 'social_spike';
  value: number;
  change_percentage: number;
  timestamp: Date;
}

export interface WhaleTransaction {
  id: string;
  symbol: string;
  amount: number;
  amount_usd: number;
  from: string;
  to: string;
  timestamp: Date;
  type: 'transfer' | 'exchange';
}

export interface Tokenomics {
  symbol: string;
  total_supply: number;
  circulating_supply: number;
  max_supply?: number;
  market_cap: number;
  fully_diluted_valuation?: number;
  inflation_rate?: number;
  unlock_schedule?: Array<{
    date: Date;
    amount: number;
    percentage: number;
  }>;
}

export interface PriceForecast {
  symbol: string;
  direction: 'up' | 'down' | 'neutral';
  confidence: number; // 0-100
  target_price?: number;
  timeframe: string;
  factors: string[];
}

export interface ScamCheck {
  symbol: string;
  risk_score: number; // 0-100, где 100 = максимальный риск
  checks: {
    contract_verified: boolean;
    liquidity_locked: boolean;
    renounced_ownership: boolean;
    honeypot: boolean;
    team_verified: boolean;
  };
  warnings: string[];
}

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  published_at: Date;
  sentiment?: 'positive' | 'negative' | 'neutral';
  related_coins?: string[];
}

export interface InvestorCase {
  symbol: string;
  strategy: 'long_term' | 'swing' | 'high_risk';
  entry_price?: number;
  target_price?: number;
  stop_loss?: number;
  risk_reward_ratio?: number;
  reasoning: string;
  timeframe: string;
}



