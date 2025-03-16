export interface IProfile {
  avatar?: string;
  bio?: string;
  company?: string;
  position?: string;
  website?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    telegram?: string;
  };
  specialization?: string[];
  interests?: string[];
  investmentSize?: number;
} 