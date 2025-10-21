export type Post = {
  id: string;
  title: string;
  content: string;
  status: string;
  pricePi: number;
  stats: {
    likes: number;
    comments: number;
    views: number;
    piEarned: number;
  };
  author: {
    name: string;
    avatar: string;
    username: string;
  };
  createdAt: string;
  updatedAt: string;
  tags: string[];
  timestamp: string;
  isLiked?: boolean;
  isBookmarked?: boolean;
  image?: string;
};

export type Notification = {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'payment' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedUser?: {
    name: string;
    avatar: string;
    username: string;
  };
  relatedPost?: {
    id: string;
    title: string;
  };
  actionUrl?: string;
};

export type Transaction = {
  id: string;
  type: 'earn' | 'spend' | 'receive' | 'send';
  amount: number;
  description: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  relatedUser?: {
    name: string;
    username: string;
    avatar: string;
  };
  relatedPost?: {
    id: string;
    title: string;
  };
};

export type WalletInfo = {
  balance: number;
  totalEarned: number;
  totalSpent: number;
  pendingAmount: number;
  transactions: Transaction[];
};

export type MyDocsPageProps = {
  onNewDocumentClick: () => void;
};

