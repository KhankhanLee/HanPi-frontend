# Contributing to HanPi Frontend

안녕하세요! HanPi 프론트엔드 프로젝트에 기여해주셔서 감사합니다. 

## 🚨 중요 공지

**현재 프로젝트 관리자는 한국군 의무복무 중입니다 (2024년 말 ~ 2026년 중순).**

복무 기간 중에는 제한적인 지원만 가능하니 양해 부탁드립니다. 긴급한 버그나 보안 이슈는 이메일로 연락해주세요.

## 🤝 기여 방법

### 1. 개발 환경 설정

```bash
# 프로젝트 클론
git clone https://github.com/KhankhanLee/hanpi-frontend.git
cd hanpi-frontend

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일을 편집하여 필요한 값들을 설정하세요

# 개발 서버 실행
npm run dev
```

### 2. 브랜치 전략

- `main`: 프로덕션 코드
- `develop`: 개발 중인 기능들
- `feature/[기능명]`: 새로운 기능 개발
- `bugfix/[버그명]`: 버그 수정
- `hotfix/[수정명]`: 긴급 수정

### 3. 커밋 메시지 규칙

```
타입(범위): 설명

예시:
feat(auth): Pi Network 로그인 기능 추가
fix(payment): 결제 실패 시 에러 처리 개선
docs(readme): 설치 가이드 업데이트
style(ui): 다크 테마 색상 조정
refactor(hooks): useAuth 훅 성능 최적화
test(payment): 결제 플로우 테스트 추가
```

#### 타입 설명:
- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 코드 포맷팅, 세미콜론 누락 등 (기능 변경 없음)
- `refactor`: 코드 리팩토링
- `test`: 테스트 추가
- `chore`: 빌드 업무 수정, 패키지 매니저 설정 등

### 4. Pull Request 가이드라인

1. **이슈 생성**: 새로운 기능이나 버그 수정 전에 이슈를 먼저 생성해주세요
2. **브랜치 생성**: `develop` 브랜치에서 새로운 브랜치를 생성하세요
3. **코드 작성**: 코딩 컨벤션을 따라 코드를 작성하세요
4. **테스트**: 변경사항에 대한 테스트를 작성하고 실행하세요
5. **PR 생성**: 명확한 제목과 설명으로 PR을 생성하세요

#### PR 템플릿:

```markdown
## 변경사항 설명
무엇을 변경했는지 간단히 설명해주세요.

## 관련 이슈
Fixes #[이슈번호]

## 변경 타입
- [ ] 새로운 기능
- [ ] 버그 수정
- [ ] 문서 업데이트
- [ ] 스타일 변경
- [ ] 리팩토링
- [ ] 테스트 추가

## 테스트 확인
- [ ] 로컬에서 테스트 완료
- [ ] 기존 테스트 통과
- [ ] 새로운 테스트 추가 (필요시)

## 스크린샷 (UI 변경 시)
변경사항의 스크린샷을 첨부해주세요.

## 체크리스트
- [ ] 코드 리뷰 준비 완료
- [ ] 문서 업데이트 완료
- [ ] TypeScript 타입 체크 통과
- [ ] ESLint 규칙 준수
```

## 📝 코딩 컨벤션

### TypeScript/React 규칙

1. **컴포넌트 작성**:
```tsx
// ✅ Good
export const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
  // 컴포넌트 로직
};

// ❌ Bad
export default function UserProfile(props) {
  // 컴포넌트 로직
}
```

2. **Hooks 사용**:
```tsx
// ✅ Good - 커스텀 훅은 use로 시작
export const useUserData = (userId: string) => {
  // 훅 로직
};

// ✅ Good - 적절한 의존성 배열
useEffect(() => {
  fetchUserData();
}, [userId]);
```

3. **타입 정의**:
```tsx
// ✅ Good - 인터페이스 사용
interface User {
  id: string;
  name: string;
  email: string;
}

// ✅ Good - Props 타입 정의
interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
}
```

### CSS/Styling 규칙

1. **Tailwind CSS 사용**:
```tsx
// ✅ Good - 클래스 순서: 레이아웃 → 스페이싱 → 색상 → 기타
<div className="flex items-center p-4 bg-white border rounded-lg shadow-sm">

// ❌ Bad - 무작위 순서
<div className="bg-white shadow-sm flex rounded-lg border p-4 items-center">
```

2. **커스텀 CSS**:
```css
/* ✅ Good - BEM 방식 */
.user-profile__avatar {
  @apply w-12 h-12 rounded-full;
}

/* ❌ Bad - 중첩된 선택자 */
.user-profile .avatar img {
  width: 48px;
  height: 48px;
}
```

## 🧪 테스트 가이드라인

### 1. 단위 테스트
```tsx
// ✅ 컴포넌트 테스트 예시
describe('UserCard', () => {
  it('should display user information', () => {
    const user = { id: '1', name: 'John', email: 'john@example.com' };
    render(<UserCard user={user} onEdit={jest.fn()} />);
    
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });
});
```

### 2. 통합 테스트
```tsx
// ✅ 훅 테스트 예시
describe('useUserData', () => {
  it('should fetch user data on mount', async () => {
    const { result } = renderHook(() => useUserData('1'));
    
    await waitFor(() => {
      expect(result.current.user).toBeDefined();
    });
  });
});
```

## 🚨 보안 및 성능

### 보안 체크리스트
- [ ] 사용자 입력 데이터 검증
- [ ] XSS 방지 (dangerouslySetInnerHTML 사용 금지)
- [ ] 민감한 정보 환경변수 처리
- [ ] Pi Network API 키 보안

### 성능 체크리스트
- [ ] React.memo, useMemo, useCallback 적절한 사용
- [ ] 이미지 최적화 (lazy loading)
- [ ] 번들 크기 확인
- [ ] 불필요한 리렌더링 방지

## 📚 추가 리소스

- [React 공식 문서](https://reactjs.org/docs)
- [TypeScript 핸드북](https://www.typescriptlang.org/docs)
- [Tailwind CSS 가이드](https://tailwindcss.com/docs)
- [Pi Network 개발 문서](https://developers.minepi.com)

## 🙋‍♂️ 도움이 필요하다면?

1. **이슈 생성**: 궁금한 점이나 버그를 발견하면 이슈를 생성해주세요
2. **토론**: GitHub Discussions를 활용해주세요
3. **이메일**: 긴급한 사항은 이메일로 연락해주세요

---

HanPi 프로젝트에 기여해주시는 모든 분들께 진심으로 감사드립니다! 🙏

**군 복무 후 더 큰 프로젝트로 발전시켜 나가겠습니다!** 🇰🇷🚀