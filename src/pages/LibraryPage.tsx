import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "../components/ui/dropdown-menu";
import { 
  Search, 
  BookOpen, 
  Star, 
  MessageCircle, 
  Heart, 
  Eye, 
  Coins,
  Calendar,
  Filter,
  Clock,
  Download,
  Bookmark,
  Folder,
  Plus,
  ArrowUpDown,
  X
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { usePi } from "../contexts/PiContext";
import { api } from "../lib/api";
import { useNavigate } from "react-router-dom";
import { useToast } from "../hooks/use-toast";

interface LibraryItem {
  id: number;
  bookmark_id: number;
  title: string;
  content: string;
  author_name: string;
  author_username: string;
  author_avatar: string;
  image?: string;
  tags: string[];
  likes: number;
  comments: number;
  views: number;
  price_pi: number;
  created_at: string;
  bookmarked_at: string;
  folder: string;
  is_liked: boolean;
  type: 'saved' | 'downloaded' | 'recent';
}

interface FolderData {
  folder: string;
  count: number;
  last_updated: string;
}

export function LibraryPage() {
  const { t } = useLanguage();
  const { user } = usePi();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("saved");
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'views'>('recent');
  const [selectedFolders, setSelectedFolders] = useState<string[]>([]);
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isNewFolderDialogOpen, setIsNewFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedDocForFolder, setSelectedDocForFolder] = useState<number | null>(null);

  // 북마크 데이터 로드
  useEffect(() => {
    fetchBookmarks();
  }, [user]);

  const fetchBookmarks = async () => {
    if (!user) {
      setLibraryItems([]);
      setFolders([]);
      return;
    }

    setIsLoading(true);
    try {
      // 북마크된 문서 가져오기
      const bookmarksResponse = await api.getMyBookmarks({ limit: 100 });
      
      if (bookmarksResponse.data.success) {
        const items = bookmarksResponse.data.data.map((item: any) => ({
          ...item,
          type: 'saved' as const,
        }));
        setLibraryItems(items);
      }

      // 폴더 목록 가져오기
      const foldersResponse = await api.getBookmarkFolders();
      if (foldersResponse.data.success) {
        setFolders(foldersResponse.data.data);
      }
    } catch (error) {
      console.error('북마크 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 새 폴더 생성 (실제로는 첫 북마크 추가 시 생성됨)
  const handleCreateFolder = () => {
    if (!user) {
      toast({
        title: "로그인 필요",
        description: "폴더를 생성하려면 로그인이 필요합니다.",
        variant: "destructive",
      });
      return;
    }
    setIsNewFolderDialogOpen(true);
  };

  const handleFolderCreated = async () => {
    if (!newFolderName.trim()) {
      toast({
        title: "폴더명 입력",
        description: "폴더 이름을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    // 이미 존재하는 폴더명인지 확인
    if (folders.some(f => f.folder === newFolderName.trim())) {
      toast({
        title: "중복된 폴더명",
        description: "이미 존재하는 폴더 이름입니다.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "폴더 생성 준비",
      description: `"${newFolderName}" 폴더를 생성했습니다. 이제 이 폴더에 문서를 추가할 수 있습니다.`,
    });

    // 임시로 폴더 목록에 추가 (북마크 추가 시 실제 생성됨)
    setFolders([...folders, {
      folder: newFolderName.trim(),
      count: 0,
      last_updated: new Date().toISOString()
    }]);

    setIsNewFolderDialogOpen(false);
    setNewFolderName("");
  };

  // 북마크 폴더 이동
  const handleMoveToFolder = async (bookmarkId: number, newFolder: string) => {
    try {
      await api.moveBookmark(bookmarkId.toString(), newFolder);
      
      toast({
        title: "폴더 이동 완료",
        description: `문서를 "${newFolder}" 폴더로 이동했습니다.`,
      });

      // 북마크 목록 다시 로드
      fetchBookmarks();
    } catch (error) {
      console.error('폴더 이동 실패:', error);
      toast({
        title: "이동 실패",
        description: "폴더 이동에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  // 사용 가능한 폴더 목록
  const availableFolders = Array.from(new Set(libraryItems.map(item => item.folder)));

  // 필터 초기화
  const clearFilters = () => {
    setSortBy('recent');
    setSelectedFolders([]);
    setPriceFilter('all');
    setSearchTerm('');
  };

  const hasActiveFilters = sortBy !== 'recent' || selectedFolders.length > 0 || 
                          priceFilter !== 'all' || searchTerm !== '';

  const filteredItems = libraryItems
    .filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesTab = 
        activeTab === "saved" ? item.type === "saved" :
        activeTab === "downloaded" ? item.type === "downloaded" :
        activeTab === "recent" ? true : true;
      
      const matchesFolders = selectedFolders.length === 0 || 
                            selectedFolders.includes(item.folder);
      
      const matchesPrice = 
        priceFilter === 'all' ? true :
        priceFilter === 'free' ? item.price_pi === 0 :
        priceFilter === 'paid' ? item.price_pi > 0 : true;
      
      return matchesSearch && matchesTab && matchesFolders && matchesPrice;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.bookmarked_at).getTime() - new Date(a.bookmarked_at).getTime();
        case 'popular':
          return b.likes - a.likes;
        case 'views':
          return b.views - a.views;
        default:
          return 0;
      }
    });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "saved":
        return <Bookmark className="h-4 w-4 text-blue-500" />;
      case "downloaded":
        return <Download className="h-4 w-4 text-green-500" />;
      default:
        return <BookOpen className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "saved":
        return <Badge className="bg-blue-100 text-blue-800">저장됨</Badge>;
      case "downloaded":
        return <Badge className="bg-green-100 text-green-800">다운로드됨</Badge>;
      default:
        return <Badge variant="outline">기타</Badge>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-blue-500" />
            {t.library.title}
          </h1>
          <p className="text-muted-foreground mt-2">{t.library.description}</p>
        </div>
        <Button className="gap-2" onClick={handleCreateFolder}>
          <Plus className="h-4 w-4" />
          {t.library.newFolder}
        </Button>
      </div>

      {/* New Folder Dialog */}
      <Dialog open={isNewFolderDialogOpen} onOpenChange={setIsNewFolderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 폴더 만들기</DialogTitle>
            <DialogDescription>
              북마크를 정리할 새 폴더를 만들 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="folder-name" className="text-right">
                폴더명
              </Label>
              <Input
                id="folder-name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="예: 개발 자료, 학습 자료..."
                className="col-span-3"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleFolderCreated();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsNewFolderDialogOpen(false);
                setNewFolderName("");
              }}
            >
              취소
            </Button>
            <Button onClick={handleFolderCreated}>
              <Folder className="h-4 w-4 mr-2" />
              폴더 만들기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Search and Filter */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="library-search"
                  name="search"
                  type="search"
                  placeholder={t.library.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  autoComplete="off"
                />
              </div>
              
              {/* 정렬 드롭다운 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <ArrowUpDown className="h-4 w-4" />
                    정렬
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 z-50">
                  <DropdownMenuLabel>정렬 기준</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
                    <DropdownMenuRadioItem value="recent">최신순</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="popular">인기순</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="views">조회수순</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* 필터 드롭다운 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    필터
                    {(selectedFolders.length > 0 || priceFilter !== 'all') && (
                      <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                        {selectedFolders.length + (priceFilter !== 'all' ? 1 : 0)}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 z-50">
                  <div className="px-2 py-1.5">
                    <div className="text-sm font-medium mb-2">가격</div>
                    <DropdownMenuRadioGroup value={priceFilter} onValueChange={(value) => setPriceFilter(value as typeof priceFilter)}>
                      <DropdownMenuRadioItem value="all">전체</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="free">무료</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="paid">유료</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </div>
                  
                  <DropdownMenuSeparator />
                  
                  <div className="px-2 py-1.5">
                    <div className="text-sm font-medium mb-2">폴더</div>
                    <div className="max-h-48 overflow-y-auto">
                      {availableFolders.map((folder) => (
                        <DropdownMenuCheckboxItem
                          key={folder}
                          checked={selectedFolders.includes(folder)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedFolders([...selectedFolders, folder]);
                            } else {
                              setSelectedFolders(selectedFolders.filter((f) => f !== folder));
                            }
                          }}
                        >
                          📁 {folder}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </div>
                  </div>
                  
                  {hasActiveFilters && (
                    <>
                      <DropdownMenuSeparator />
                      <div className="px-2 py-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-center"
                          onClick={clearFilters}
                        >
                          필터 초기화
                        </Button>
                      </div>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* 활성 필터 표시 */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">활성 필터:</span>
                
                {sortBy !== 'recent' && (
                  <Badge variant="secondary" className="gap-1">
                    정렬: {sortBy === 'popular' ? '인기순' : '조회수순'}
                    <button
                      onClick={() => setSortBy('recent')}
                      className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                
                {priceFilter !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    {priceFilter === 'free' ? '무료' : '유료'}
                    <button
                      onClick={() => setPriceFilter('all')}
                      className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                
                {selectedFolders.map((folder) => (
                  <Badge key={folder} variant="secondary" className="gap-1">
                    📁 {folder}
                    <button
                      onClick={() => setSelectedFolders(selectedFolders.filter((f) => f !== folder))}
                      className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-6 px-2 text-xs"
                >
                  모두 지우기
                </Button>
              </div>
            )}
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="saved">{t.library.saved}</TabsTrigger>
              <TabsTrigger value="downloaded">{t.library.downloaded}</TabsTrigger>
              <TabsTrigger value="recent">{t.library.recent}</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4 mt-6">
              {isLoading ? (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="animate-pulse">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>로딩 중...</p>
                  </div>
                </div>
              ) : !user ? (
                <div className="text-center py-12 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>로그인이 필요합니다</p>
                  <p className="text-sm">Pi Network로 로그인하여 북마크를 확인하세요</p>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t.library.noItems}</p>
                  <p>라이브러리에 문서가 없습니다.</p>
                  <p className="text-sm">관심 있는 문서를 저장해보세요!</p>
                </div>
              ) : (
                filteredItems.map((item) => (
                  <Card 
                    key={item.id} 
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/docs/${item.id}`)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getTypeIcon(item.type)}
                            {getTypeBadge(item.type)}
                            <Badge variant="outline">
                              📁 {item.folder}
                            </Badge>
                          </div>
                          <CardTitle className="text-xl mb-2">{item.title}</CardTitle>
                          <p className="text-muted-foreground mb-4 line-clamp-2">{item.content}</p>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={item.author_avatar} />
                                <AvatarFallback className="text-xs">
                                  {item.author_name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span>{item.author_name}</span>
                              <span>@{item.author_username}</span>
                            </div>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              저장일: {new Date(item.bookmarked_at).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-1">
                              {item.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                {item.views.toLocaleString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Heart className="h-4 w-4" />
                                {item.likes}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageCircle className="h-4 w-4" />
                                {item.comments}
                              </span>
                              {item.price_pi > 0 && (
                                <span className="flex items-center gap-1 text-purple-600">
                                  <Coins className="h-4 w-4" />
                                  {item.price_pi}π
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              // TODO: 다운로드 기능
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              // TODO: 북마크 해제
                            }}
                          >
                            <Bookmark className="h-4 w-4 fill-current" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Folders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Folder className="h-5 w-5" />
                폴더
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {folders.length === 0 ? (
                <p className="text-sm text-muted-foreground">폴더가 없습니다</p>
              ) : (
                folders.map((folder) => (
                  <div 
                    key={folder.folder} 
                    className="flex items-center justify-between p-2 rounded hover:bg-muted cursor-pointer"
                    onClick={() => {
                      if (selectedFolders.includes(folder.folder)) {
                        setSelectedFolders(selectedFolders.filter(f => f !== folder.folder));
                      } else {
                        setSelectedFolders([...selectedFolders, folder.folder]);
                      }
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Folder className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{folder.folder}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {folder.count}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                통계
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">총 저장된 문서</span>
                <span className="font-medium">{libraryItems.filter(i => i.type === "saved").length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">다운로드된 문서</span>
                <span className="font-medium">{libraryItems.filter(i => i.type === "downloaded").length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">총 폴더</span>
                <span className="font-medium">{folders.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">총 조회수</span>
                <span className="font-medium">
                  {libraryItems.reduce((sum, item) => sum + item.views, 0).toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
