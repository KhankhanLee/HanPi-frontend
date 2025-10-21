import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import { useLanguage } from "../contexts/LanguageContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "../components/ui/dropdown-menu";
import { EditDocumentModal } from "../components/EditDocumentModal";
import type { Post, MyDocsPageProps } from '../types';
import { api } from '../lib/api';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Heart, 
  MessageCircle, 
  Coins,
  Calendar,
  BarChart3,
  ArrowUpDown,
  X
} from "lucide-react";

// App.tsx로부터 모달을 여는 함수를 받기 위한 타입 정의
interface AppProps {
  onNewDocumentClick: () => void;
}

export function MyDocsPage({onNewDocumentClick}: MyDocsPageProps) {
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'views' | 'earnings'>('recent');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [docToEdit, setDocToEdit] = useState<string | null>(null);

  // React Query로 문서 목록 가져오기
  const { data: myDocs = [], isLoading, error, refetch } = useQuery({
    queryKey: ['myDocs'],
    queryFn: async () => {
      console.log('내 문서 API 호출 시작...');
      try {
        const response = await api.getMyDocs();
        console.log('내 문서 API 응답:', response.data);
        return response.data as Post[];
      } catch (err) {
        console.error('내 문서 API 오류:', err);
        throw err;
      }
    },
    staleTime: 30000, // 30초 동안 fresh 상태 유지
    refetchOnWindowFocus: true, // 창이 포커스될 때 자동 새로고침
  });

  // 문서 삭제 mutation
  const deleteMutation = useMutation({
    mutationFn: (docId: string) => api.deleteDoc(docId),
    onSuccess: () => {
      // 캐시에서 삭제된 문서 제거하거나 전체 목록 다시 가져오기
      queryClient.invalidateQueries({ queryKey: ['myDocs'] });
      alert(t.myDocs.deleteSuccess);
      setDeleteDialogOpen(false);
      setDocToDelete(null);
    },
    onError: (error) => {
      console.error('Error deleting document:', error);
      alert(t.myDocs.deleteError);
    },
  });

  // 모든 태그 추출
  const allTags = Array.from(new Set(myDocs.flatMap(doc => doc.tags)));

  // 필터링 및 정렬
  const filteredDocs = myDocs
    .filter(doc => {
      const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.content.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTab = 
        activeTab === "all" ? true :
        activeTab === "published" ? doc.status === "published" :
        activeTab === "draft" ? doc.status === "draft" :
        activeTab === "paid" ? doc.pricePi > 0 :
        activeTab === "free" ? doc.pricePi === 0 : true;
      
      const matchesTags = selectedTags.length === 0 || 
                         selectedTags.some(tag => doc.tags.includes(tag));
      
      const matchesPrice = 
        priceFilter === 'all' ? true :
        priceFilter === 'free' ? doc.pricePi === 0 :
        priceFilter === 'paid' ? doc.pricePi > 0 : true;
      
      return matchesSearch && matchesTab && matchesTags && matchesPrice;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'popular':
          return b.stats.likes - a.stats.likes;
        case 'views':
          return b.stats.views - a.stats.views;
        case 'earnings':
          return b.stats.piEarned - a.stats.piEarned;
        default:
          return 0;
      }
    });

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSortBy('recent');
    setSelectedTags([]);
    setPriceFilter('all');
    setSearchTerm('');
  };

  const hasActiveFilters = sortBy !== 'recent' || selectedTags.length > 0 || 
                          priceFilter !== 'all' || searchTerm !== '';

  // 문서 수정 핸들러
  const handleEditDoc = (docId: string) => {
    setDocToEdit(docId);
    setEditModalOpen(true);
  };

  // 문서 수정 후 목록 새로고침
  const handleDocSaved = () => {
    // React Query 캐시 무효화하여 최신 데이터 가져오기
    queryClient.invalidateQueries({ queryKey: ['myDocs'] });
    console.log('Document saved, cache invalidated and list refreshed');
  };

  // 문서 삭제 확인 다이얼로그 열기
  const handleDeleteClick = (docId: string) => {
    setDocToDelete(docId);
    setDeleteDialogOpen(true);
  };

  // 문서 삭제 실행
  const handleDeleteConfirm = () => {
    if (docToDelete) {
      deleteMutation.mutate(docToDelete);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-100 text-green-800">{t.myDocs.status.published}</Badge>;
      case "draft":
        return <Badge variant="secondary">{t.myDocs.status.draft}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{t.myDocs.title}</h1>
          <p className="text-muted-foreground mt-2">{t.myDocs.description}</p>
        </div>
        {/* App.tsx에서 받은 onNewDocumentClick 함수를 사용 */}
        <Button onClick={onNewDocumentClick} className="gap-2">
          <Plus className="h-4 w-4" />
          {t.myDocs.newDocument}
        </Button>
      </div>

      {/* 로딩 상태 */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">{t.common.loading}</p>
          </div>
        </div>
      )}

      {/* 에러 상태 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-red-800 mb-2">
            <X className="h-5 w-5" />
            <h3 className="font-semibold">{t.common.error}</h3>
          </div>
          <p className="text-red-700 text-sm">
            {t.myDocs.deleteError}
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            className="mt-3"
          >
            {t.common.reset}
          </Button>
        </div>
      )}

      {/* Stats Cards - 로딩 중이 아닐 때만 표시 */}
      {!isLoading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.myDocs.totalDocs}</p>
                <p className="text-2xl font-bold">{myDocs.length}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.myDocs.published}</p>
                <p className="text-2xl font-bold">{myDocs.filter(d => d.status === "published").length}</p>
              </div>
              <Eye className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.myDocs.totalViews}</p>
                <p className="text-2xl font-bold">{myDocs.reduce((sum, doc) => sum + (Number(doc.stats.views) || 0), 0).toLocaleString()}</p>
              </div>
              <Eye className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.myDocs.piEarnings}</p>
                <p className="text-2xl font-bold text-purple-600">{myDocs.reduce((sum, doc) => sum + (Number(doc.stats.piEarned) || 0), 0).toFixed(1)}π</p>
              </div>
              <Coins className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="my-docs-search"
              name="search"
              type="search"
              placeholder={t.common.searchPlaceholder}
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
                {t.common.sort}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 z-50">
              <DropdownMenuLabel>{t.common.sort}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
                <DropdownMenuRadioItem value="recent">{t.myDocs.sortByRecent}</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="popular">{t.myDocs.sortByPopular}</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="views">{t.myDocs.sortByViews}</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="earnings">{t.myDocs.sortByEarnings}</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 필터 드롭다운 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                {t.common.filter}
                {(selectedTags.length > 0 || priceFilter !== 'all') && (
                  <Badge variant="secondary" className="ml-1">
                    {selectedTags.length + (priceFilter !== 'all' ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 z-50">
              <div className="px-2 py-1.5">
                <div className="text-sm font-medium mb-2">{t.filters.price}</div>
                <DropdownMenuRadioGroup value={priceFilter} onValueChange={(value) => setPriceFilter(value as typeof priceFilter)}>
                  <DropdownMenuRadioItem value="all">{t.filters.priceAll}</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="free">{t.filters.priceFree}</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="paid">{t.filters.pricePaid}</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </div>
              
              <DropdownMenuSeparator />
              
              <div className="px-2 py-1.5">
                <div className="text-sm font-medium mb-2">{t.filters.tags}</div>
                <div className="max-h-48 overflow-y-auto">
                  {allTags.map(tag => (
                    <DropdownMenuCheckboxItem
                      key={tag}
                      checked={selectedTags.includes(tag)}
                      onCheckedChange={() => toggleTag(tag)}
                    >
                      #{tag}
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
                      {t.filters.resetFilters}
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
            <span className="text-sm text-muted-foreground">{t.filters.active}:</span>
            
            {sortBy !== 'recent' && (
              <Badge variant="secondary" className="gap-1">
                {t.common.sort}: {
                  sortBy === 'popular' ? t.myDocs.sortByPopular :
                  sortBy === 'views' ? t.myDocs.sortByViews :
                  t.myDocs.sortByEarnings
                }
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
                {priceFilter === 'free' ? t.filters.priceFree : t.filters.pricePaid}
                <button
                  onClick={() => setPriceFilter('all')}
                  className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            
            {selectedTags.map(tag => (
              <Badge key={tag} variant="secondary" className="gap-1">
                #{tag}
                <button
                  onClick={() => toggleTag(tag)}
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
              {t.common.clearAll}
            </Button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">{t.myDocs.all}</TabsTrigger>
          <TabsTrigger value="published">{t.myDocs.status.published}</TabsTrigger>
          <TabsTrigger value="draft">{t.myDocs.status.draft}</TabsTrigger>
          <TabsTrigger value="paid">{t.myDocs.paid}</TabsTrigger>
          <TabsTrigger value="free">{t.myDocs.free}</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-6">
          {filteredDocs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t.myDocs.noDocuments}</p>
              <p className="text-sm">{t.myDocs.noDocumentsDesc}</p>
            </div>
          ) : (
            filteredDocs.map((doc) => (
              <Card key={doc.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{doc.title}</CardTitle>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{doc.content}</p>
                      <div className="flex items-center gap-2 mb-3">
                        {getStatusBadge(doc.status)}
                        {doc.pricePi > 0 ? (
                          <Badge variant="outline" className="text-purple-600">
                            {doc.pricePi}π
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-green-600">
                            {t.post.free}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {doc.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditDoc(doc.id)}
                        title={t.common.edit}
                        className="hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteClick(doc.id)}
                        title={t.common.delete}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {doc.stats.views.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {doc.stats.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        {doc.stats.comments}
                      </span>
                      <span className="flex items-center gap-1 text-purple-600">
                        <Coins className="h-4 w-4" />
                        {doc.stats.piEarned}π
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(doc.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
      </>
      )}

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.myDocs.deleteConfirm}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.myDocs.deleteDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDocToDelete(null)}>
              {t.common.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
            >
              {t.common.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 문서 수정 모달 */}
      {docToEdit && (
        <EditDocumentModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          documentId={docToEdit}
          onSaved={handleDocSaved}
        />
      )}
    </div>
  );
}
