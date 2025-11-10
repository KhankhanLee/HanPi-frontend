# HanPi Web Application - 프론트엔드

> Pi Network 기반 문서 공유 플랫폼의 웹 프론트엔드

## 📋 프로젝트 개요

HanPi는 Pi Network 생태계를 활용한 혁신적인 문서 공유 플랫폼입니다. 사용자들은 Pi 코인을 사용하여 프리미엄 콘텐츠를 구매하고, 자신만의 지식을 공유할 수 있습니다. (Pi Browser용) (일반 브라우저에선
UI정도랑 구성정도만 볼수있게 결제 시스템, 로그인 시스템 이용불가)

### 🎯 주요 기능

- **Pi Network 인증**: Pi SDK를 통한 안전한 사용자 인증
- **문서 관리**: 마크다운 기반 문서 작성/편집/조회
- **결제 시스템**: Pi 코인을 활용한 프리미엄 콘텐츠 구매
- **커뮤니티**: 댓글, 좋아요, 북마크 기능
- **다국어 지원**: 한국어/영어 지원
- **반응형 디자인**: 모바일/데스크톱 최적화

## 🚀 기술 스택

### Frontend
- **React 18** + **TypeScript**
- **Vite** (빌드 도구)
- **Tailwind CSS** (스타일링)
- **Shadcn/ui** (UI 컴포넌트)
- **React Query** (상태 관리)
- **React Router** (라우팅)

### Pi Network Integration
- **Pi SDK 2.0** (인증 및 결제)
- **Pi Browser** 최적화

### 배포
- **Vercel** (프론트엔드 호스팅)
- **환경별 배포** (개발/스테이징/프로덕션)

## 📱 주요 페이지

### 1. 홈 페이지 (`/`)
- 최신 문서 목록
- 트렌딩 콘텐츠
- 카테고리별 탐색

### 2. 문서 상세 (`/document/:id`)
- 마크다운 렌더링
- 댓글 시스템
- 좋아요/북마크
- Pi 코인 결제 (유료 콘텐츠)

### 3. 라이브러리 (`/library`)
- 개인 문서 관리
- 북마크한 문서
- 구매한 문서

### 4. 커뮤니티 (`/community`)
- 커뮤니티 목록
- 태그 기반 필터링

### 5. 설정 (`/settings`)
- 프로필 관리
- 언어 설정
- 테마 설정

## 🔧 개발 환경 설정

### 필수 조건
- Node.js 18+
- npm 또는 yarn

### 설치 및 실행
```bash
# 의존성 설치
npm install

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
```

## 🏗️ 프로젝트 구조

```
src/
├── components/          # 재사용 가능한 컴포넌트
│   ├── ui/             # Shadcn/ui 컴포넌트
│   ├── Header.tsx      # 상단 헤더
│   ├── Sidebar.tsx     # 사이드바
│   └── ...
├── contexts/           # React Context
│   ├── PiContext.tsx   # Pi SDK 상태 관리
│   └── LanguageContext.tsx
├── hooks/              # 커스텀 훅
│   ├── usePosts.ts
│   └── useWallet.ts
├── pages/              # 페이지 컴포넌트
│   ├── HomePage.tsx
│   ├── DocumentDetailPage.tsx
│   └── ...
├── lib/                # 유틸리티
│   ├── api.ts          # API 클라이언트
│   ├── utils.ts        # 헬퍼 함수
│   └── queryClient.ts  # React Query 설정
├── locales/            # 다국어 지원
│   ├── en.ts
│   └── ko.ts
└── types/              # TypeScript 타입 정의
    └── pi.d.ts
```

## 🎨 디자인 시스템

### 컬러 팔레트
- **Primary**: Purple gradient (#8B5CF6 → #A855F7)
- **Secondary**: Blue (#3B82F6)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Error**: Red (#EF4444)

### 반응형 브레이크포인트
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## 📊 주요 기능 구현 상세

### 1. Pi Network 인증
```typescript
// PiContext.tsx에서 Pi SDK 초기화 및 관리
const signIn = async () => {
  const scopes = ['username', 'payments'];
  const auth = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
  // JWT 토큰 생성 및 저장
};
```

### 2. 결제 시스템
```typescript
// 문서 구매 플로우
const handlePurchase = async () => {
  // 1. 백엔드에서 결제 정보 준비
  const { paymentRequest } = await api.initiatePurchase(documentId);
  
  // 2. Pi SDK로 결제 생성
  const payment = await createPayment(
    paymentRequest.amount,
    paymentRequest.memo,
    paymentRequest.metadata
  );
  
  // 3. 결제 승인
  await api.approvePurchase(payment.identifier, documentId);
};
```

### 3. 다국어 지원
```typescript
// LanguageContext.tsx에서 언어 상태 관리
const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('ko');
  const t = (key: string) => translations[language][key];
  // ...
};
```

## 🔗 백엔드 연동

### API 클라이언트
- Axios 기반 HTTP 클라이언트
- JWT 토큰 자동 관리
- 에러 처리 및 재시도 로직

### 주요 API 엔드포인트
- `GET /documents` - 문서 목록
- `GET /documents/:id` - 문서 상세
- `POST /documents` - 문서 작성
- `POST /purchases/:id/initiate` - 구매 시작
- `POST /comments` - 댓글 작성
- `POST /likes/toggle` - 좋아요 토글

## 🚀 배포 및 CI/CD

### Vercel 배포 설정
```json
// vercel.json
{
  "rewrites": [
    {
      "source": "/((?!api/).*)",
      "destination": "/index.html"
    }
  ]
}
```

### 환경별 배포
- **Development**: 개발 브랜치 자동 배포
- **Staging**: 테스트 환경
- **Production**: 메인 브랜치 배포

## 📈 성능 최적화

### 코드 분할
- React.lazy를 활용한 페이지별 코드 스플리팅
- 동적 임포트를 통한 번들 크기 최적화

### 이미지 최적화
- WebP 포맷 지원
- 이미지 압축 및 리사이징

### 캐싱 전략
- React Query를 활용한 API 응답 캐싱
- 브라우저 캐시 활용

## 🐛 알려진 이슈 및 해결 과제

### 해결된 이슈
- ✅ 모바일 사이드바 UI 개선
- ✅ JWT 토큰 자동 갱신
- ✅ 댓글 시스템 권한 관리
- ✅ API 경로 중복 문제 해결

### 진행 중인 과제
- 🔄 Pi Platform 결제 시스템 완성
- 🔄 실시간 알림 기능
- 🔄 문서 검색 기능 개선

### 향후 개선 계획
- 📝 오프라인 지원 (PWA)
- 📝 다크 모드 지원
- 📝 소셜 공유 기능
- 📝 고급 에디터 기능

## 👥 기여 및 개발 참여

### 개발 가이드라인
- TypeScript 엄격 모드 사용
- ESLint + Prettier 코드 스타일 준수
- 컴포넌트별 단위 테스트 작성
- Git 커밋 메시지 컨벤션 준수

## 📞 문의 및 지원
- **개발자**: KhankhanLee
- **이슈 트래킹**: GitHub Issues
- **Wiki**: [프로젝트 Wiki](링크)

---

*이 프로젝트는 Pi Network 생태계의 발전과 한국 개발자 커뮤니티에 기여하기 위해 개발되었습니다.*