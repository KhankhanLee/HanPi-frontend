import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - 토큰 자동 추가
apiClient.interceptors.request.use(
  (config) => {
    // PiContext에서 저장한 사용자 정보에서 토큰 가져오기
    const userDataStr = localStorage.getItem('pi_user');
    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        if (userData.accessToken) {
          config.headers.Authorization = `Bearer ${userData.accessToken}`;
        }
      } catch (error) {
        console.error('사용자 토큰 파싱 실패:', error);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터 - 에러 처리 및 토큰 갱신
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.warn('인증 토큰이 없거나 만료되었습니다.');
      
      // JWT 토큰 만료 시 자동 갱신 시도
      const userDataStr = localStorage.getItem('pi_user');
      if (userDataStr) {
        try {
          const userData = JSON.parse(userDataStr);
          
          // Pi SDK가 있고 프로덕션 환경인 경우 토큰 갱신 시도
          if (window.Pi && !import.meta.env.DEV) {
            console.log('토큰 갱신 시도 중...');
            try {
              const piUser = await window.Pi.authenticate(
                ['username', 'payments', 'wallet_address'],
                () => {}
              );
              
              // 백엔드에 새 토큰으로 로그인
              const response = await apiClient.post('/auth/pi-login', {
                accessToken: piUser.accessToken || '',
                uid: piUser.uid,
                username: piUser.username
              });
              
              if (response.data?.success && response.data.token) {
                // 새 토큰으로 업데이트
                const newUserData = {
                  ...userData,
                  accessToken: response.data.token
                };
                localStorage.setItem('pi_user', JSON.stringify(newUserData));
                
                // 원래 요청을 새 토큰으로 재시도
                error.config.headers.Authorization = `Bearer ${response.data.token}`;
                return apiClient.request(error.config);
              }
            } catch (refreshError) {
              console.error('토큰 갱신 실패:', refreshError);
            }
          }
          
          // 토큰 갱신 실패 시 로그아웃
          localStorage.removeItem('pi_user');
          delete apiClient.defaults.headers.common['Authorization'];
        } catch (parseError) {
          console.error('사용자 데이터 파싱 실패:', parseError);
        }
      }
    }
    return Promise.reject(error);
  }
);

// API 엔드포인트 타입 정의
export interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    username: string;
  };
  image?: string;
  tags: string[];
  stats: {
    likes: number;
    comments: number;
    views: number;
    piEarned: number;
  };
  timestamp: string;
  isLiked?: boolean;
  isBookmarked?: boolean;
  pricePi?: number;
}

export interface CreatePostData {
  title: string;
  content: string;
  tags: string[];
  piEnabled: boolean;
  piPrice: number;
}

export interface UpdateDocData {
  title?: string;
  content?: string;
  tags?: string[];
  image?: string | null;
  pricePi?: number;
  status?: 'published' | 'draft';
}

// API 함수들
export const api = {
  // 문서 관련
  getDocs: (search?: string) => {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    return apiClient.get(`/docs${params}`);
  },
  getMyDocs: (search?: string) => {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    return apiClient.get(`/docs/my${params}`);
  },
  getDoc: (id: string) => apiClient.get(`/docs/${id}`),
  createDoc: (data: CreatePostData) => {
    // tags를 배열로, pricePi 추가
    const payload = {
      title: data.title,
      content: data.content,
      tags: data.tags,
      pricePi: data.piEnabled ? data.piPrice : 0,
    };
    console.log('문서 생성 API 호출:', payload);
    return apiClient.post('/docs', payload);
  },
  updateDoc: (id: string, data: UpdateDocData) => apiClient.put(`/docs/${id}`, data),
  deleteDoc: (id: string) => apiClient.delete(`/docs/${id}`),
  
  // 알림 관련
  getNotifications: () => apiClient.get('/notifications'),
  markNotificationAsRead: (id: string) => apiClient.patch(`/notifications/${id}/read`),
  markAllNotificationsAsRead: () => apiClient.patch('/notifications/read-all'),
  deleteNotification: (id: string) => apiClient.delete(`/notifications/${id}`),
  
  // 북마크 관련
  getMyBookmarks: (params?: { page?: number; limit?: number; folder?: string }) => 
    apiClient.get('/bookmarks/my', { params }),
  getBookmarkFolders: () => apiClient.get('/bookmarks/folders'),
  toggleBookmark: (documentId: string, folder?: string) => 
    apiClient.post('/bookmarks/toggle', { documentId, folder }),
  checkBookmarks: (documentIds: string[]) => 
    apiClient.post('/bookmarks/check', { documentIds }),
  moveBookmark: (id: string, folder: string) => 
    apiClient.put(`/bookmarks/${id}/move`, { folder }),
  deleteBookmark: (id: string) => apiClient.delete(`/bookmarks/${id}`),
  
  // 지갑 관련
  getWalletInfo: () => apiClient.get('/wallet'),
  getWeeklyEarnings: () => apiClient.get('/wallet/weekly-earnings'),
  getTransactions: (params?: { limit?: number; offset?: number; type?: string }) => 
    apiClient.get('/wallet/transactions', { params }),
  sendPi: (data: { to: string; amount: number; note?: string }) => 
    apiClient.post('/wallet/send', data),
  
  // 결제 관련
  initiatePayment: (itemId: string) => apiClient.post('/payments/initiate', { itemId }),
  approvePayment: (paymentId: string) => apiClient.post(`/payment/approve/${paymentId}`),
  completePayment: (paymentId: string, txid: string) => apiClient.post(`/payment/complete/${paymentId}`, { txid }),
  getPaymentStatus: (paymentId: string) => apiClient.get(`/payment/status/${paymentId}`),
  
  // 문서 구매 관련
  checkPurchase: (documentId: string) => apiClient.get(`/purchases/check/${documentId}`),
  initiatePurchase: (documentId: string) => apiClient.post(`/purchases/${documentId}/initiate`),
  approvePurchase: (paymentId: string, documentId: string) => apiClient.post(`/purchases/${documentId}/approve`, { paymentId }),
  completePurchase: (documentId: string, paymentId: string, txid: string) => apiClient.post(`/purchases/${documentId}/complete`, { paymentId, txid }),
  getMyPurchases: () => apiClient.get('/purchases/my'),
  
  // Pi 인증 관련
  piLogin: (data: { accessToken: string; uid: string; username: string }) => 
    apiClient.post('/auth/pi-login', data),
  
  // 사용자 관련
  getMe: () => apiClient.get('/private/me'),
  
  // 커뮤니티 통계
  getTrendingTopics: () => apiClient.get('/community/trending-topics'),
  getTopContributors: () => apiClient.get('/community/top-contributors'),
  
  // 태그 관련
  getTags: (search?: string) => {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    return apiClient.get(`/tags${params}`);
  },
  getTagPosts: (tag: string, limit = 5) => 
    apiClient.get(`/tags/${encodeURIComponent(tag)}/posts?limit=${limit}`),
  getTrendingTags: () => apiClient.get('/tags/trending'),
  
  // 헬스체크
  health: () => apiClient.get('/health'),
  createTag: (data: { name: string; description: string }) => {
    return apiClient.post('/tags', data);
  },
  deleteTag: (tagName: string) => {
    return apiClient.delete(`/tags/${encodeURIComponent(tagName)}`);
  },
};

// API 연결 테스트 함수
export const testApiConnection = async () => {
  try {
    const response = await api.health();
    console.log('API 연결 성공:', response.data);
    return true;
  } catch (error) {
    console.error('API 연결 실패:', error);
    return false;
  }
};
