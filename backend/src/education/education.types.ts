export interface Course {
  id: string;
  title: string;
  description: string;
  platform: string;
  url: string;
  price: number;
  rating: number;
  duration: string;
  level: string;
  icon: string;
  color: string;
  category: string;
  features: string[];
  oldPrice?: number;
}

export interface Platform {
  id: string;
  name: string;
  icon: string;
  color: string;
}
