import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { PostCard } from "./PostCard";
import { Button } from "./ui/button";
import { CreatePostModal } from "./CreatePostModal";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Plus, TrendingUp, Clock, Users, Search } from "lucide-react";
import { api, testApiConnection } from "../lib/api";
import { useLanguage } from "../contexts/LanguageContext";
import type { Post } from "../types";

// props 타입 정의
interface MainContentProps {
  onNewDocumentClick: () => void;
  refreshKey: number;
}

// Debounce function
interface DebounceFunction<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): void;
}

function debounce<T extends (...args: any[]) => any>(func: T, delay: number): DebounceFunction<T> {
  let timeout: ReturnType<typeof setTimeout>;
  return function(this: unknown, ...args: Parameters<T>) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
}

export function MainContent({onNewDocumentClick, refreshKey}: MainContentProps) {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("latest");
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [createPostOpen, setCreatePostOpen] = useState(false);
  
  const handlePostCreated = () => {
    setCreatePostOpen(false);
    fetchPosts();
  }

  const fetchPosts = async (search = "") => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.getDocs(search || undefined);
      const data = response.data;
      
      // Map fetched data to the expected post type
      const mappedPosts = data.map((item: any) => ({
        id: item.id,
        title: item.title ?? "",
        content: item.content ?? "",
        author: item.author ?? { name: "", username: "", avatar: "" },
        image: item.image,
        tags: item.tags ?? [],
        stats: {
          likes: item.stats?.likes ?? 0,
          comments: item.stats?.comments ?? 0,
          views: item.stats?.views ?? 0,
          piEarned: item.stats?.piEarned ?? 0,
        },
        timestamp: item.timestamp ?? "",
        isLiked: item.isLiked,
        isBookmarked: item.isBookmarked,
      }));
      setPosts(mappedPosts);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setIsLoading(false);
    }
  };
  
  const debouncedFetchPosts = useCallback(debounce(fetchPosts, 500), []);

  // URL 쿼리 파라미터 변경 감지
  useEffect(() => {
    const urlSearchTerm = searchParams.get('search') || '';
    setSearchTerm(urlSearchTerm);
  }, [searchParams]);

  useEffect(() => {
    testApiConnection();
    if (searchTerm) {
      debouncedFetchPosts(searchTerm);
    } else {
      fetchPosts();
    }
  }, [searchTerm, refreshKey]);

  // 로컬 검색 입력 변경 시 URL 업데이트
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    
    if (newSearchTerm.trim()) {
      setSearchParams({ search: newSearchTerm.trim() });
    } else {
      setSearchParams({});
    }
  }; 

  return (
    <main className="flex-1 p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            {searchTerm ? `"${searchTerm}" ${t.home.searchResults}` : t.home.documentFeed}
          </h1>
          <p className="text-muted-foreground">
            {searchTerm 
              ? `"${searchTerm}" ${t.home.searchResultsFor}`
              : t.home.latestDocuments
            }
          </p>
        </div>
        <Button onClick={onNewDocumentClick} className="gap-2">
          <Plus className="h-4 w-4" />
          {t.myDocs.newDocument}
        </Button>
      </div>

      {/* Search Input */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          id="main-search"
          name="search"
          type="search"
          placeholder={t.home.searchPlaceholder}
          value={searchTerm}
          onChange={handleSearchChange}
          className="pl-10"
          autoComplete="off"
        />
      </div>

      {/* Filter Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="latest" className="gap-2">
            <Clock className="h-4 w-4" />
            {t.home.latest}
          </TabsTrigger>
          <TabsTrigger value="trending" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            {t.home.trending}
          </TabsTrigger>
          <TabsTrigger value="community" className="gap-2">
            <Users className="h-4 w-4" />
            {t.home.community}
          </TabsTrigger>
          <TabsTrigger value="following" className="gap-2">
            {t.home.following}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="latest" className="space-y-6">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t.home.loadingDocs}</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              <p>{t.home.loadError}</p>
              <p className="text-sm text-muted-foreground mt-2">
                {error instanceof Error ? error.message : t.home.unknownError}
              </p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>
                {searchTerm 
                  ? `"${searchTerm}" ${t.home.noSearchResults}`
                  : t.home.noDocs
                }
              </p>
              <p className="text-sm mt-2">
                {searchTerm 
                  ? t.home.tryNewSearch
                  : t.home.tryNewDocument
                }
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          )}
        </TabsContent>

        <TabsContent value="trending" className="space-y-6">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t.home.loadingPopular}</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              <p>{t.home.loadError}</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>
                {searchTerm 
                  ? `"${searchTerm}" ${t.home.noSearchResults}`
                  : t.home.noPopularDocs
                }
              </p>
            </div>
          ) : (
            [...posts]
              .sort((a, b) => b.stats.likes - a.stats.likes)
              .map((post) => (
                <PostCard key={post.id} post={post} />
              ))
          )}
        </TabsContent>

        <TabsContent value="community" className="space-y-6">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t.home.loadingCommunity}</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              <p>{t.home.loadError}</p>
            </div>
          ) : (() => {
              const filteredPosts = posts.filter((post) => 
                post.tags.includes("커뮤니티") || post.tags.includes("한국")
              );
              
              return filteredPosts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>
                    {searchTerm 
                      ? `"${searchTerm}" ${t.home.noSearchResults}`
                      : t.home.noCommunityDocs
                    }
                  </p>
                </div>
              ) : (
                filteredPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))
              );
            })()
          }
        </TabsContent>

        <TabsContent value="following" className="space-y-6">
          <div className="text-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t.home.noFollowing}</p>
            <p className="text-sm">{t.home.followDevelopers}</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Post Modal */}
      <CreatePostModal 
        isOpen={createPostOpen} 
        onClose={() => setCreatePostOpen(false)}
        onPostCreated={handlePostCreated}
      />
    </main>
  );
}
