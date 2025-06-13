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
    vk?: string;
    instagram?: string;
    facebook?: string;
  };
  specialization?: string[];
  interests?: string[];
  investmentSize?: number;
  gallery?: string[];
  phoneNumber?: string;
  address?: string;
  region?: string;
  education?: string;
  certifications?: string[];
  languages?: string[];
} 