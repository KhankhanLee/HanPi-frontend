import { MainContent } from "../components/MainContent";

// App.tsx로부터 받을 props 타입 정의
interface HomePageProps {
  onNewDocumentClick: () => void;
  refreshKey: number;
}

export function HomePage({ onNewDocumentClick, refreshKey }: HomePageProps) {
  // MainContent로 props를 그대로 전달
  return <MainContent onNewDocumentClick={onNewDocumentClick} refreshKey={refreshKey} />;
}
