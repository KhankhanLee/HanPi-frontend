import { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { createPortal } from "react-dom";
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
  const justOpenedRef = useRef(false);

  useEffect(() => {
    autoMockLogin();
  }, []);

  const handlePostCreated = () => {
    setCreatePostModalOpen(false);
    setRefreshKey(prevKey => prevKey + 1);
  };

  const openCreatePostModal = () => setCreatePostModalOpen(true);

  const isMobile = useIsMobile();

  // lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [isMobileMenuOpen]);

  // Clear justOpened ref after a short delay
  useEffect(() => {
    if (justOpenedRef.current) {
      const timer = setTimeout(() => {
        justOpenedRef.current = false;
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isMobileMenuOpen]); 

  // Close mobile drawer when route changes
  function RouteWatcher() {
    const location = useLocation();
    const prevPathRef = useRef(location.pathname);
    useEffect(() => {
      if (prevPathRef.current !== location.pathname) {
        setMobileMenuOpen(false);
        prevPathRef.current = location.pathname;
      }
    }, [location.pathname]);
    return null;
  }

  return (
    <Router>
      <RouteWatcher />
      <div className="min-h-screen bg-background">
        <Header 
          onNewDocumentClick={openCreatePostModal} 
          onMenuClick={() => {
            justOpenedRef.current = true;
            setMobileMenuOpen(prev => !prev);
          }} 
        />
        <div className="flex">
          {/* 데스크탑: Sidebar는 모바일이 아닐 때만 렌더합니다 (useIsMobile) */}
          {!isMobile && (
            <aside className="w-64">
              <Sidebar onNavigate={() => setMobileMenuOpen(false)} />
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
        
        {/* 모바일 사이드바를 Portal로 body에 마운트 */}
        {isMobileMenuOpen && typeof document !== 'undefined' && createPortal(
          <div className="md:hidden">
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => {
                if (!justOpenedRef.current) {
                  setMobileMenuOpen(false);
                }
                justOpenedRef.current = false;
              }}
              style={{ 
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 9998,
                pointerEvents: 'auto'
              }}
            />

            {/* Sliding sidebar */}
            <aside
              className="fixed top-16 bottom-0 left-0 w-3/4 max-w-xs bg-background overflow-y-auto shadow-2xl border-r"
              style={{ 
                position: 'fixed',
                top: '64px',
                left: 0,
                bottom: 0,
                width: '75%',
                maxWidth: '320px',
                zIndex: 9999,
                WebkitOverflowScrolling: 'touch'
              }}
            >
              <div className="h-full flex flex-col">
                <Sidebar onNavigate={() => setMobileMenuOpen(false)} />
              </div>
            </aside>
          </div>,
          document.body
        )}
      </div>
    </Router>
  );
}
