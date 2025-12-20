export interface CurrencyPair {
  symbol: string;
  name: string;
  price: number;
  change: number;
}

export interface ChartData {
  timestamp: number;
  value?: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
}

export interface TechnicalIndicator {
  name: string;
  value: string;
  signal: 'BUY' | 'SELL' | 'NEUTRAL';
}

export interface MarketSummary {
  id: number;
  title: string;
  text: string;
  type: 'technical' | 'fundamental' | 'sentiment';
  analyst: string;
  rating: number;
  timestamp: Date;
} 