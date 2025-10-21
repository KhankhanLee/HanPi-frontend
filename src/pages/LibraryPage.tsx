import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Input } from "../components/ui/input";
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

export function LibraryPage() {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("saved");
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'views'>('recent');
  const [selectedFolders, setSelectedFolders] = useState<string[]>([]);
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');

  const libraryItems = [
    {
      id: "1",
      title: "React 18의 새로운 기능들과 Concurrent Features 완벽 가이드",
      content: "React 18에서 도입된 Concurrent Rendering, Suspense, useTransition 등의 새로운 기능들을 실습 예제와 함께 자세히 알아보겠습니다.",
      author: {
        name: "김지수",
        avatar: "",
        username: "jisu_dev"
      },
      image: "https://images.unsplash.com/photo-1737358054558-2d1d81018bb2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2N1bWVudGF0aW9uJTIwc2hhcmluZyUyMHdvcmtzcGFjZXxlbnwxfHx8fDE3NTg4NjcwMTF8MA&ixlib=rb-4.0.3&q=80&w=1080",
      tags: ["React", "JavaScript", "Frontend", "한국어"],
      stats: {
        likes: 127,
        comments: 23,
        views: 892,
        piEarned: 45.7
      },
      timestamp: "2시간 전",
      isLiked: true,
      isBookmarked: true,
      pricePi: 0,
      folder: "Frontend",
      savedAt: "2024-01-20",
      type: "saved"
    },
    {
      id: "2",
      title: "TypeScript 고급 타입 시스템 마스터하기",
      content: "TypeScript의 고급 타입 기능들을 활용하여 더 안전하고 표현력 있는 코드를 작성하는 방법을 다룹니다.",
      author: {
        name: "이민호",
        avatar: "",
        username: "minho_ts"
      },
      tags: ["TypeScript", "JavaScript", "타입", "개발"],
      stats: {
        likes: 89,
        comments: 15,
        views: 567,
        piEarned: 23.4
      },
      timestamp: "4시간 전",
      isLiked: false,
      isBookmarked: true,
      pricePi: 50,
      folder: "Languages",
      savedAt: "2024-01-18",
      type: "saved"
    },
    {
      id: "3",
      title: "Next.js 13 App Router 완전 정복",
      content: "Next.js 13의 새로운 App Router를 활용한 현대적인 웹 애플리케이션 개발 방법을 단계별로 설명합니다.",
      author: {
        name: "박서연",
        avatar: "",
        username: "seoyeon_next"
      },
      tags: ["Next.js", "React", "SSR", "웹개발"],
      stats: {
        likes: 156,
        comments: 31,
        views: 1024,
        piEarned: 62.1
      },
      timestamp: "6시간 전",
      isLiked: true,
      isBookmarked: false,
      pricePi: 0,
      folder: "Frameworks",
      savedAt: "2024-01-15",
      type: "downloaded"
    },
    {
      id: "4",
      title: "한국 웹 개발자 커뮤니티 가이드 2025",
      content: "2024년 한국의 주요 웹 개발 커뮤니티, 컨퍼런스, 스터디 그룹을 종합적으로 정리한 가이드입니다.",
      author: {
        name: "최현우",
        avatar: "",
        username: "hyunwoo_dev"
      },
      tags: ["커뮤니티", "네트워킹", "한국", "개발자"],
      stats: {
        likes: 234,
        comments: 45,
        views: 1567,
        piEarned: 89.3
      },
      timestamp: "1일 전",
      isLiked: false,
      isBookmarked: true,
      pricePi: 0,
      folder: "Community",
      savedAt: "2024-01-10",
      type: "saved"
    }
  ];

  const folders = [
    { name: "Frontend", count: 5, color: "bg-blue-100 text-blue-800" },
    { name: "Backend", count: 3, color: "bg-green-100 text-green-800" },
    { name: "Languages", count: 4, color: "bg-purple-100 text-purple-800" },
    { name: "Frameworks", count: 2, color: "bg-orange-100 text-orange-800" },
    { name: "Community", count: 1, color: "bg-pink-100 text-pink-800" }
  ];

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
        priceFilter === 'free' ? item.pricePi === 0 :
        priceFilter === 'paid' ? item.pricePi > 0 : true;
      
      return matchesSearch && matchesTab && matchesFolders && matchesPrice;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
        case 'popular':
          return b.stats.likes - a.stats.likes;
        case 'views':
          return b.stats.views - a.stats.views;
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
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          {t.library.newFolder}
        </Button>
      </div>

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
              {filteredItems.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t.library.noItems}</p>
                  <p>라이브러리에 문서가 없습니다.</p>
                  <p className="text-sm">관심 있는 문서를 저장해보세요!</p>
                </div>
              ) : (
                filteredItems.map((item) => (
                  <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getTypeIcon(item.type)}
                            {getTypeBadge(item.type)}
                            <Badge variant="outline" className={folders.find(f => f.name === item.folder)?.color}>
                              {item.folder}
                            </Badge>
                          </div>
                          <CardTitle className="text-xl mb-2">{item.title}</CardTitle>
                          <p className="text-muted-foreground mb-4 line-clamp-2">{item.content}</p>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={item.author.avatar} />
                                <AvatarFallback className="text-xs">{item.author.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span>{item.author.name}</span>
                              <span>@{item.author.username}</span>
                            </div>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              저장일: {new Date(item.savedAt).toLocaleDateString()}
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
                                {item.stats.views.toLocaleString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Heart className="h-4 w-4" />
                                {item.stats.likes}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageCircle className="h-4 w-4" />
                                {item.stats.comments}
                              </span>
                              <span className="flex items-center gap-1 text-purple-600">
                                <Coins className="h-4 w-4" />
                                {item.stats.piEarned}π
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Bookmark className="h-4 w-4" />
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
              {folders.map((folder) => (
                <div key={folder.name} className="flex items-center justify-between p-2 rounded hover:bg-muted cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Folder className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{folder.name}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {folder.count}
                  </Badge>
                </div>
              ))}
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
