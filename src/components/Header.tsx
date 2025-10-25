import { useState, useEffect } from "react";
import { Search, Wallet, Plus, Menu, LogIn, LogOut, User } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useNavigate, useSearchParams } from "react-router-dom";
import { NotificationDropdown } from "./NotificationDropdown";
import { WalletModal } from "./WalletModal";
import { useWallet } from "../hooks/useWallet";
import { useLanguage } from "../contexts/LanguageContext";
import { usePi } from "../contexts/PiContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

// Header가 받을 props 타입을 정의합니다.
interface HeaderProps {
  onNewDocumentClick: () => void;
  onMenuClick: () => void; // Add this prop
}

export function Header({ onNewDocumentClick, onMenuClick }: HeaderProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const { walletInfo } = useWallet();
  const { t } = useLanguage();
  const { user, isAuthenticated, isLoading, signIn, signOut } = usePi();

  // URL 쿼리 파라미터 변경 시 검색어 동기화
  useEffect(() => {
    const urlSearchTerm = searchParams.get('search') || '';
    setSearchTerm(urlSearchTerm);
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // 홈페이지로 이동하면서 검색어를 쿼리 파라미터로 전달
      navigate(`/?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      // 검색어가 없으면 홈페이지로 이동 (검색 초기화)
      navigate('/');
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo and App Name */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="block md:block"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              // Prevent the click from bubbling to overlays or other global click handlers
              e.stopPropagation();
              // stopImmediatePropagation helps in some environments where multiple listeners exist
              // @ts-ignore - React's SyntheticEvent does not type nativeEvent.stopImmediatePropagation
              (e.nativeEvent as Event).stopImmediatePropagation?.();
              onMenuClick();
            }}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div 
            className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate("/")}
          >
            <img src="/hanpi-logo.png" alt="Han Pi Logo" className="h-8 w-8 rounded-lg object-cover" />
            <span className="font-semibold text-lg">Han Pi</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-4">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search-input"
              name="search"
              type="search"
              placeholder={t.common.searchPlaceholder}
              className="pl-10 bg-muted/50"
              value={searchTerm}
              onChange={handleSearchInputChange}
              onKeyDown={handleSearchKeyDown}
              autoComplete="off"
            />
          </form>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-3">
          {/* Pi Wallet - 클릭 가능하도록 수정 */}
          <button
            onClick={() => setIsWalletModalOpen(true)}
            className="hidden sm:flex items-center space-x-2 bg-muted/50 rounded-lg px-3 py-2 hover:bg-muted transition-colors cursor-pointer"
          >
            <Wallet className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium">
              {walletInfo ? `${walletInfo.balance.toFixed(1)} π` : '... π'}
            </span>
          </button>

          {/* Create Content Button with onClick event */}
          <Button size="sm" className="hidden sm:flex" onClick={onNewDocumentClick}>
            <Plus className="h-4 w-4 mr-2" />
            {t.common.newDocument}
          </Button>

          {/* Notifications - 새로운 알림 드롭다운 컴포넌트 */}
          <NotificationDropdown />

          {/* User Avatar & Pi Login */}
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full p-0 h-8 w-8">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} />
                    <AvatarFallback>
                      {user.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.username}</p>
                    <p className="text-xs text-muted-foreground">@{user.uid.substring(0, 8)}...</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  프로필
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/my-docs")}>
                  <Plus className="mr-2 h-4 w-4" />
                  내 문서
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsWalletModalOpen(true)}>
                  <Wallet className="mr-2 h-4 w-4" />
                  지갑
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  로그아웃
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              size="sm" 
              variant="default"
              onClick={signIn}
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <>로그인 중...</>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Pi로 로그인
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Wallet Modal */}
      <WalletModal isOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} />
    </header>
  );
}