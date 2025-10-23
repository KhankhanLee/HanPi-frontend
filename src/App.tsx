import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { useIsMobile } from "./components/ui/use-mobile";
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
import { Drawer, DrawerContent } from "./components/ui/drawer";

export default function App() {
  const [isCreatePostModalOpen, setCreatePostModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    autoMockLogin();
  }, []);

  const handlePostCreated = () => {
    setCreatePostModalOpen(false);
    setRefreshKey(prevKey => prevKey + 1);
  };

  const openCreatePostModal = () => setCreatePostModalOpen(true);

  const isMobile = useIsMobile();

  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Header 
          onNewDocumentClick={openCreatePostModal} 
          onMenuClick={() => setMobileMenuOpen(true)} 
        />
        <div className="flex">
          {/* 데스크탑: Sidebar는 모바일이 아닐 때만 렌더합니다 (useIsMobile) */}
          {!isMobile && (
            <aside className="w-64">
              <Sidebar />
            </aside>
          )}
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
          {/* 모바일에서만 Drawer로 Sidebar 표시 */}
          <div className="md:hidden">
            <Drawer open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <DrawerContent className="p-0 w-full max-w-xs">
                <Sidebar />
              </DrawerContent>
            </Drawer>
          </div>
      </div>
    </Router>
  );
}
