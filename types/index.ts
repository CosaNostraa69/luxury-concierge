export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: 'CLIENT' | 'CONCIERGE' | 'ADMIN';
  specialties?: string[];
  bio?: string;
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  status: 'active' | 'inactive' | 'sold';
  userId: string;
  user: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  sender: User;
  receiver: User;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  userId: string;
  conciergeId: string;
  user: User;
  concierge: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface Request {
  id: string;
  service: string;
  details: string;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  userId: string;
  conciergeId: string;
  user: User;
  concierge: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due';
  stripeSubscriptionId: string;
  currentPeriodEnd: Date;
  createdAt: Date;
  updatedAt: Date;
} 