import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { HomePage } from "./pages/HomePage";
import { ProfilePage } from "./pages/ProfilePage";
import { SettingsPage } from "./pages/SettingsPage";
import { MyDocsPage } from "./pages/MyDocsPage";
import { CommunityPage } from "./pages/CommunityPage";
import { TrendingPage } from "./pages/TrendingPage";
import { LibraryPage } from "./pages/LibraryPage";
import { TagsPage } from "./pages/TagsPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { DocumentDetailPage } from "./pages/DocumentDetailPage";
import { CreatePostModal } from "./components/CreatePostModal";
import { Toaster } from "./components/ui/toaster";
import { autoMockLogin } from "./utils/mockAuth";

export default function App() {
  const [isCreatePostModalOpen, setCreatePostModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // 새로고침을 위한 상태

  // 개발 환경에서 자동 Mock 로그인
  useEffect(() => {
    autoMockLogin();
  }, []);

  const handlePostCreated = () => {
    setCreatePostModalOpen(false);
    setRefreshKey(prevKey => prevKey + 1); // 새 글 작성 시 key를 업데이트하여 새로고침 트리거
  };

  const openCreatePostModal = () => setCreatePostModalOpen(true);

  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Header onNewDocumentClick={openCreatePostModal} />
        <div className="flex">
          <Sidebar />
          <main className="flex-1">
            <Routes>
              <Route 
                path="/" 
                element={<HomePage onNewDocumentClick={openCreatePostModal} refreshKey={refreshKey} />} 
              />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route 
                path="/my-docs" 
                element={<MyDocsPage onNewDocumentClick={openCreatePostModal} />} 
              />
              <Route path="/community" element={<CommunityPage />} />
              <Route path="/trending" element={<TrendingPage />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/tags" element={<TagsPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/document/:id" element={<DocumentDetailPage />} />
            </Routes>
          </main>
        </div>
        <CreatePostModal
          isOpen={isCreatePostModalOpen}
          onClose={() => setCreatePostModalOpen(false)}
          onPostCreated={handlePostCreated}
        />
        <Toaster />
      </div>
    </Router>
  );
}
