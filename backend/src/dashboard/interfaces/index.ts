import { UserRole } from '../../users/enums/user-role.enum';

export interface DashboardStats {
  totalConnections: number;
  unreadMessages: number;
  pendingRequests: number;
  recentActivities: number;
}

export interface RecentMessage {
  id: number;
  senderId: number;
  senderName: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  chatId?: number;
  chatName?: string;
  chatType?: string;
}

export interface Activity {
  id: number;
  type: string;
  title: string;
  description: string;
  timestamp: Date;
}

// Интерфейсы для стартапера
export interface StartupInfo {
  name: string;
  stage: string;
  industry: string;
  teamSize: number;
  fundingGoal: number;
  currentFunding: number;
}

export interface StartupMilestone {
  id: number;
  title: string;
  description: string;
  dueDate: Date;
  status: 'pending' | 'completed' | 'delayed';
}

export interface StartupMetrics {
  revenue: number;
  users: number;
  growth: number;
  burnRate: number;
  runway: number;
}

export interface StartupUpdate {
  id: number;
  title: string;
  content: string;
  timestamp: Date;
  type: 'product' | 'team' | 'financial' | 'other';
}

export interface StartupMentor {
  id: number;
  name: string;
  expertise: string[];
  company: string;
  position: string;
  availability: boolean;
}

// Интерфейсы для инвестора
export interface InvestorStats {
  totalInvestments: number;
  activeInvestments: number;
  totalAmount: number;
  averageReturn: number;
  portfolioValue: number;
}

export interface PendingProject {
  id: number;
  name: string;
  industry: string;
  stage: string;
  requestedAmount: number;
  equity: number;
  submitDate: Date;
}

export interface InvestorTransaction {
  id: number;
  projectId: number;
  projectName: string;
  amount: number;
  type: 'investment' | 'return' | 'dividend';
  date: Date;
  status: 'pending' | 'completed' | 'failed';
}

// Интерфейсы для крипто-трейдера
export interface CryptoStats {
  totalPortfolioValue: number;
  dailyPnL: number;
  weeklyPnL: number;
  monthlyPnL: number;
  totalTrades: number;
  winRate: number;
}

export interface CryptoPosition {
  id: number;
  symbol: string;
  amount: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  openDate: Date;
}

export interface CryptoTransaction {
  id: number;
  symbol: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  total: number;
  fee: number;
  timestamp: Date;
}

export interface CryptoMarket {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  lastUpdate: Date;
}

export interface CommunityActivity {
  id: number;
  type: 'post' | 'like';
  userId: number;
  userName: string;
  userAvatar?: string;
  communityId: number;
  communityName: string;
  postId?: number;
  postContent?: string;
  timestamp: Date;
}

export interface CommunityStats {
  totalMembers: number;
  activeDiscussions: number;
  yourContributions: number;
  activities: CommunityActivity[];
} 