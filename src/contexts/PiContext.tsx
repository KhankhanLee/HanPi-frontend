import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import type { PiUser, PiPayment } from "../types/pi.d";
import { api, apiClient } from "../lib/api";

interface PiContextType {
  user: PiUser | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => void;
  createPayment: (amount: number, memo: string, metadata?: Record<string, any>) => Promise<PiPayment | null>;
}

const PiContext = createContext<PiContextType | undefined>(undefined);

interface PiProviderProps {
  children: ReactNode;
}

export function PiProvider({ children }: PiProviderProps) {
  const [user, setUser] = useState<PiUser | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Pi SDK 초기화
  useEffect(() => {
    const initializePi = async () => {
      try {
        // 개발 환경에서는 Pi SDK 초기화 건너뛰기
        const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';
        
        if (isDevelopment) {
          console.log('개발 환경: Pi SDK 초기화 건너뛰기 (Mock 인증 사용)');
          setIsInitialized(true);
          
          // Mock 사용자 정보 복원
          const savedUser = localStorage.getItem('pi_user');
          if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
            
            if (parsedUser.accessToken) {
              console.log('Setting Authorization header with token:', parsedUser.accessToken);
              apiClient.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.accessToken}`;
            }
          }
          return;
        }

        // 프로덕션 환경에서만 Pi SDK 초기화
        if (typeof window !== 'undefined' && window.Pi) {
          // Pi SDK 초기화 디버깅
          console.log('Initializing Pi SDK with sandbox mode:', import.meta.env.VITE_PI_SANDBOX_MODE === 'true');
          try {
            await window.Pi.init({ 
              version: "2.0",
              sandbox: import.meta.env.VITE_PI_SANDBOX_MODE === 'true' 
            });
            console.log('Pi SDK initialized successfully');
            setIsInitialized(true);
          } catch (initError) {
            console.error('Failed to initialize Pi SDK:', initError);
            alert('Pi SDK 초기화에 실패했습니다. Pi Browser에서 다시 시도해주세요.');
            setIsInitialized(false);
            return;
          }

          console.log('Pi SDK initialized');

          // 저장된 사용자 정보 복원
          const savedUser = localStorage.getItem('pi_user');
          if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
            
            // 백엔드에 토큰 설정
            if (parsedUser.accessToken) {
              console.log('Setting Authorization header with token:', parsedUser.accessToken);
              apiClient.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.accessToken}`;
            }
          }
        } else {
          console.warn('Pi SDK not loaded - Pi Browser 필요');
          setIsInitialized(true); // 초기화 상태만 true로 설정
        }
      } catch (error) {
        console.error('Failed to initialize Pi SDK:', error);
        setIsInitialized(true); // 에러 발생해도 앱은 계속 실행
      }
    };

    initializePi();
  }, []);

  // 로그인
  const signIn = useCallback(async () => {
    const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';

    // 개발 환경에서는 Mock 로그인 사용
    if (isDevelopment) {
      console.log("개발 환경: Mock 로그인을 시도합니다.");
      setIsLoading(true);
      // 실제 네트워크 요청을 흉내 내기 위해 약간의 딜레이 추가
      setTimeout(() => {
        const mockUser = {
          uid: 'mock-user-123',
          username: 'test_user',
          accessToken: 'mock-token-' + Date.now(),
        };

        const userData = {
          uid: mockUser.uid,
          username: mockUser.username,
          accessToken: mockUser.accessToken
        };

        setUser(userData);
        localStorage.setItem('pi_user', JSON.stringify(userData));
        console.log('Setting Authorization header with token:', userData.accessToken);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${userData.accessToken}`;
        
        console.log("Mock 로그인 성공:", userData);
        setIsLoading(false);
      }, 500);
      return;
    }

    // --- 프로덕션 환경 (Pi 브라우저) ---
    if (!window.Pi) {
      alert('Pi SDK가 로드되지 않았습니다. Pi 브라우저에서 앱을 실행해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      // Pi SDK 인증 디버깅
      try {
        const piUser = await window.Pi.authenticate(
          ['username', 'payments', 'wallet_address'],
          (payment: PiPayment) => {
            console.log('Incomplete payment found:', payment);
          }
        );

        console.log('Pi authentication successful:', piUser);

        const response = await api.piLogin({
          accessToken: piUser.accessToken || '',
          uid: piUser.uid,
          username: piUser.username
        });

        const userData = {
          uid: piUser.uid,
          username: piUser.username,
          accessToken: response.data.token || piUser.accessToken
        };

        setUser(userData);
        localStorage.setItem('pi_user', JSON.stringify(userData));
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${userData.accessToken}`;
        console.log('Backend authentication successful');
      } catch (authError) {
        console.error('Pi authentication failed:', authError);
        alert('Pi Network 로그인에 실패했습니다. 다시 시도해주세요.');
        setUser(null);
      }
    } catch (error) {
      console.error('Pi authentication failed:', error);
      alert('Pi Network 로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 로그아웃
  const signOut = useCallback(() => {
    setUser(null);
    localStorage.removeItem('pi_user');
    delete apiClient.defaults.headers.common['Authorization'];
    console.log('Signed out');
  }, []);

  // 결제 생성
  const createPayment = useCallback(async (
    amount: number,
    memo: string,
    metadata: Record<string, any> = {}
  ): Promise<PiPayment | null> => {
    if (!window.Pi) {
      alert('Pi SDK가 로드되지 않았습니다.');
      return null;
    }

    if (!user) {
      alert('먼저 로그인해주세요.');
      return null;
    }

    try {
      const paymentData = {
        amount,
        memo,
        metadata: {
          ...metadata,
          userId: user.uid,
          username: user.username
        }
      };

      const payment = await window.Pi.createPayment(paymentData, {
        // 서버 승인 대기
        onReadyForServerApproval: (paymentId: string) => {
          console.log('Payment ready for server approval:', paymentId);
          // 백엔드에 승인 요청
          api.approvePayment(paymentId)
            .then(() => console.log('Payment approved'))
            .catch((err: Error) => console.error('Payment approval failed:', err));
        },
        
        // 서버 완료 대기
        onReadyForServerCompletion: (paymentId: string, txid: string) => {
          console.log('Payment ready for completion:', paymentId, txid);
          // 백엔드에 완료 요청
          api.completePayment(paymentId, txid)
            .then(() => {
              console.log('Payment completed');
              alert('결제가 완료되었습니다!');
            })
            .catch((err: Error) => console.error('Payment completion failed:', err));
        },
        
        // 취소
        onCancel: (paymentId: string) => {
          console.log('Payment cancelled:', paymentId);
          alert('결제가 취소되었습니다.');
        },
        
        // 에러
        onError: (error: Error, payment?: PiPayment) => {
          console.error('Payment error:', error, payment);
          alert(`결제 중 오류가 발생했습니다: ${error.message}`);
        }
      });

      return payment;
    } catch (error) {
      console.error('Failed to create payment:', error);
      alert('결제 생성에 실패했습니다.');
      return null;
    }
  }, [user]);

  // API 요청 전 토큰 확인
  if (!apiClient.defaults.headers.common['Authorization']) {
    const savedUser = localStorage.getItem('pi_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      if (parsedUser.accessToken) {
        console.log('Restoring Authorization header with token:', parsedUser.accessToken);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.accessToken}`;
      } else {
        console.warn('No accessToken found in localStorage');
      }
    } else {
      console.warn('No user data found in localStorage');
    }
  }

  const value: PiContextType = {
    user,
    isAuthenticated: !!user,
    isInitialized,
    isLoading,
    signIn,
    signOut,
    createPayment
  };

  return (
    <PiContext.Provider value={value}>
      {children}
    </PiContext.Provider>
  );
}

export function usePi() {
  const context = useContext(PiContext);
  if (context === undefined) {
    throw new Error('usePi must be used within a PiProvider');
  }
  return context;
}
