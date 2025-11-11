export type Tool = {
  title: string;
  description: string;
  category: string;
  url: string;
  rating: number;
  upvotes: number;
  bookmarks: number;
  isPaid?: boolean;
  badge?: string;
  type: 'free' | 'premium' | 'paid';
  features?: string[];
};

export type Filter = {
  category: string;
  type: 'all' | 'free' | 'premium' | 'paid';
  sort: 'rating' | 'upvotes' | 'newest';
  search: string;
};
