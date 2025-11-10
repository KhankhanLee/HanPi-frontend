
# HanPi - Pi Network 문서 공유 플랫폼 (Frontend)

> A revolutionary document sharing platform built on the Pi Network ecosystem

[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://vercel.com)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://typescriptjs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3-blue)](https://tailwindcss.com)

## 🌟 개요

HanPi는 Pi Network 생태계를 기반으로 한 혁신적인 문서 공유 플랫폼의 프론트엔드 애플리케이션입니다. 사용자들은 Pi 코인을 사용하여 프리미엄 콘텐츠를 구매하고, 자신만의 지식을 공유할 수 있습니다.

## ✨ 주요 기능

### 🔐 Pi Network 통합
- **Pi SDK 2.0** 기반 사용자 인증
- **Pi Browser** 최적화
- **Pi 코인 결제** 시스템

### 📚 콘텐츠 관리
- **마크다운** 기반 문서 작성/편집
- **실시간 프리뷰** 지원
- **태그 시스템** 및 카테고리화
- **검색 및 필터링**

### 💰 경제 시스템
- **유료 콘텐츠** 판매/구매
- **Pi 코인 지갑** 연동
- **수익 관리** 시스템
- **결제 히스토리**

### 🌍 커뮤니티 기능
- **댓글 시스템** (대댓글 지원)
- **좋아요 및 북마크**
- **사용자 프로필**
- **알림 시스템**

### 🎨 사용자 경험
- **반응형 디자인** (모바일/태블릿/데스크톱)
- **다크/라이트 테마**
- **다국어 지원** (한국어/영어)
- **접근성** 준수

## 🚀 빠른 시작

### 필수 조건
- Node.js 18+ 
- npm 또는 yarn
- Pi Browser (Pi Network 기능용)

### 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/KhankhanLee/hanpi-frontend.git
cd hanpi-frontend

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일에서 API URL 등 설정

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 프리뷰
npm run preview
```

### 환경 변수

```env
VITE_API_URL=https://your-backend-api-url
VITE_PI_APP_ID=your-pi-app-id
VITE_APP_TITLE=HanPi
```

## 🏗️ 기술 스택

### Frontend Framework
- **React 18** with Hooks
- **TypeScript** for type safety
- **Vite** for fast development

### Styling & UI
- **Tailwind CSS** for utility-first CSS
- **Shadcn/ui** component library
- **Lucide React** icons
- **Framer Motion** animations

### State Management
- **React Query** for server state
- **React Context** for global state
- **Zustand** for client state

### Pi Network Integration
- **Pi SDK 2.0** for authentication
- **Pi Wallet** for payments
- **Pi Browser APIs**

### Development Tools
- **ESLint** & **Prettier** for code quality
- **Husky** for git hooks
- **TypeScript** strict mode
- **Vite PWA** plugin

## 🔧 개발 가이드

### 프로젝트 구조

```
src/
├── components/          # 재사용 가능한 컴포넌트
│   ├── ui/             # Shadcn/ui 컴포넌트
│   ├── layout/         # 레이아웃 컴포넌트
│   └── feature/        # 기능별 컴포넌트
├── contexts/           # React Context
├── hooks/              # 커스텀 훅
├── pages/              # 페이지 컴포넌트
├── lib/                # 유틸리티 라이브러리
├── types/              # TypeScript 타입 정의
├── locales/            # 다국어 파일
└── styles/             # 글로벌 스타일
```

### 코딩 컨벤션

- **컴포넌트**: PascalCase (`UserProfile.tsx`)
- **훅**: camelCase, use 접두사 (`useUserData.ts`)
- **유틸리티**: camelCase (`formatDate.ts`)
- **타입**: PascalCase, 인터페이스는 I 접두사 (`IUser`)

## 📦 빌드 및 배포

### Vercel 배포

1. Vercel 계정에 저장소 연결
2. 환경 변수 설정
3. 자동 배포 트리거

### 수동 배포

```bash
# 프로덕션 빌드
npm run build

# 정적 파일 서빙
npm run preview
```

## 🔗 관련 링크

- [백엔드 API](https://github.com/KhankhanLee/hanpi-api)
- [Pi Developer Portal](https://developers.minepi.com)
- [프로젝트 문서](./PROJECT_DOCUMENTATION.md)

## 🐛 문제 해결

### 자주 발생하는 문제

#### Pi SDK 로드 실패
```javascript
// Pi Browser 환경 확인
if (!window.Pi) {
  console.error('Pi SDK not loaded. Please use Pi Browser.');
}
```

#### 결제 실패
```javascript
// 테스트넷 vs 메인넷 확인
console.log('Environment:', process.env.NODE_ENV);
```

## 📈 로드맵

### v1.0.0 (현재)
- ✅ 기본 문서 CRUD
- ✅ Pi Network 인증
- ✅ 결제 시스템 기초
- ✅ 댓글 시스템

### v1.1.0 (계획)
- 🔄 실시간 알림
- 🔄 고급 검색 기능
- 🔄 문서 협업 기능

## 📄 라이선스

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 개발자

**KhankhanLee**
- GitHub: [@KhankhanLee](https://github.com/KhankhanLee)

## 🙏 감사의 말

- [Pi Network](https://minepi.com) - 혁신적인 암호화폐 플랫폼 제공
- [Shadcn/ui](https://ui.shadcn.com) - 아름다운 UI 컴포넌트
- [Vercel](https://vercel.com) - 훌륭한 배포 플랫폼

---

**Made with ❤️ for the Pi Network community**
  