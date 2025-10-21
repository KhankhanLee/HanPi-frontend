import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import type { WalletInfo } from '../types';

export function useWallet() {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchWalletInfo = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('useWallet: 지갑 정보 API 호출...');
      const response = await api.getWalletInfo();
      console.log('useWallet: 지갑 정보 API 응답:', response.data);
      setWalletInfo(response.data);
    } catch (err) {
      console.error('useWallet: 지갑 정보 가져오기 실패:', err);
      setError(err instanceof Error ? err : new Error('알 수 없는 오류'));
      setWalletInfo(null); // 에러 시 null
    } finally {
      setIsLoading(false);
    }
  };

  const refreshWallet = () => {
    return fetchWalletInfo();
  };

  useEffect(() => {
    fetchWalletInfo();

    // 30초마다 자동 새로고침
    const interval = setInterval(fetchWalletInfo, 30000);

    return () => clearInterval(interval);
  }, []);

  return {
    walletInfo,
    isLoading,
    error,
    refreshWallet
  };
}
