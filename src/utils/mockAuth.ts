/**
 * 개발용 Mock 인증 유틸리티
 * 실제 Pi SDK 없이 로컬에서 테스트할 수 있도록 합니다.
 */

const MOCK_USER = {
  uid: 'mock-user-123',
  username: 'test_user',
  accessToken: 'mock-token-' + Date.now(),
};

/**
 * Mock 로그인 - localStorage에 테스트 토큰 저장
 */
export const mockLogin = () => {
  localStorage.setItem('pi_token', MOCK_USER.accessToken);
  localStorage.setItem('pi_user', JSON.stringify(MOCK_USER));
  console.log('Mock 로그인 완료:', MOCK_USER);
  return MOCK_USER;
};

/**
 * Mock 로그아웃 - localStorage 클리어
 */
export const mockLogout = () => {
  localStorage.removeItem('pi_token');
  localStorage.removeItem('pi_user');
  console.log('Mock 로그아웃 완료');
};

/**
 * 현재 Mock 사용자 정보 가져오기
 */
export const getMockUser = () => {
  const userStr = localStorage.getItem('pi_user');
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Mock 인증 상태 확인
 */
export const isMockAuthenticated = () => {
  return !!localStorage.getItem('pi_token');
};

/**
 * 개발 환경 여부 확인
 */
export const isDevelopment = () => {
  return import.meta.env.DEV || import.meta.env.MODE === 'development';
};

/**
 * 자동 Mock 로그인 (개발 환경에서만)
 */
export const autoMockLogin = () => {
  if (isDevelopment() && !isMockAuthenticated()) {
    console.log('개발 환경: 자동 Mock 로그인 실행');
    return mockLogin();
  }
  return getMockUser();
};
