import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Input } from "../components/ui/input";
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
import { 
  Search, 
  TrendingUp, 
  Flame, 
  Star, 
  MessageCircle, 
  Heart, 
  Eye, 
  Coins,
  Calendar,
  Filter,
  Clock,
  Users,
  ArrowUpDown,
  X
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { apiClient } from "../lib/api";

interface TrendingPost {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    username: string;
  };
  image?: string;
  tags: string[];
  stats: {
    likes: number;
    comments: number;
    views: number;
    piEarned: number;
  };
  timestamp: string;
  isLiked: boolean;
  isBookmarked: boolean;
  pricePi: number;
  trendingScore: number;
  trendingReason: 'hot' | 'rising' | 'trending';
}

interface TrendingTag {
  name: string;
  count: number;
}

interface TopAuthor {
  name: string;
  username: string;
  avatar: string;
  posts: number;
  views: number;
  points: number;
}

export function TrendingPage() {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("today");
  const [sortBy, setSortBy] = useState<'trending' | 'likes' | 'views' | 'comments'>('trending');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [trendingFilter, setTrendingFilter] = useState<'all' | 'hot' | 'rising'>('all');
  
  const [trendingPosts, setTrendingPosts] = useState<TrendingPost[]>([]);
  const [trendingTags, setTrendingTags] = useState<TrendingTag[]>([]);
  const [topAuthors, setTopAuthors] = useState<TopAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 데이터 가져오기
  useEffect(() => {
    const fetchTrendingData = async () => {
      try {
        setIsLoading(true);
        
        // 트렌딩 문서 가져오기
        const docsResponse = await apiClient.get('/docs', {
          params: {
            sortBy: 'trending',
            limit: 50
          }
        });
        
        const docs = docsResponse.data.data || docsResponse.data || [];
        
        // 트렌딩 점수 계산 및 포맷팅
        const formattedPosts: TrendingPost[] = docs.map((doc: any) => {
          const likes = doc.stats?.likes || 0;
          const views = doc.stats?.views || 0;
          const comments = doc.stats?.comments || 0;
          
          // 트렌딩 점수 계산 (최근성 + 인기도)
          const hoursAgo = (Date.now() - new Date(doc.created_at).getTime()) / (1000 * 60 * 60);
          const recencyScore = Math.max(0, 100 - hoursAgo * 2);
          const popularityScore = (likes * 3 + comments * 2 + views * 0.1);
          const trendingScore = recencyScore * 0.3 + popularityScore * 0.7;
          
          // 트렌딩 이유 결정
          let trendingReason: 'hot' | 'rising' | 'trending' = 'trending';
          if (trendingScore > 85) trendingReason = 'hot';
          else if (hoursAgo < 24 && popularityScore > 50) trendingReason = 'rising';
          
          return {
            id: doc.id,
            title: doc.title,
            content: doc.content,
            author: {
              name: doc.author?.name || doc.user?.username || 'Unknown',
              avatar: doc.author?.avatar || doc.user?.avatar || '',
              username: doc.author?.username || doc.user?.username || 'unknown'
            },
            image: doc.image,
            tags: Array.isArray(doc.tags) ? doc.tags : [],
            stats: {
              likes: likes,
              comments: comments,
              views: views,
              piEarned: doc.stats?.piEarned || 0
            },
            timestamp: doc.created_at,
            isLiked: doc.isLiked || false,
            isBookmarked: doc.isBookmarked || false,
            pricePi: doc.pricePi || 0,
            trendingScore: trendingScore,
            trendingReason: trendingReason
          };
        });
        
        setTrendingPosts(formattedPosts);
        
        // 트렌딩 태그 계산
        const tagCounts: { [key: string]: number } = {};
        formattedPosts.forEach(post => {
          post.tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        });
        
        const sortedTags = Object.entries(tagCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);
        
        setTrendingTags(sortedTags);
        
        // 인기 작가 가져오기
        try {
          const authorsResponse = await apiClient.get('/community/top-contributors');
          const authorsData = authorsResponse.data.data || authorsResponse.data || [];
          setTopAuthors(authorsData.slice(0, 10)); // 상위 10명만 표시
        } catch (error) {
          console.error('Failed to fetch top authors:', error);
          setTopAuthors([]);
        }
        
      } catch (error) {
        console.error('Failed to fetch trending data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendingData();
  }, []);

  // 모든 태그 목록 (필터링용)
  const availableTags = Array.from(new Set(trendingPosts.flatMap(post => post.tags)));

  // 필터링 및 정렬
  const filteredPosts = trendingPosts
    .filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesTab = 
        activeTab === "today" ? post.trendingScore > 80 :
        activeTab === "week" ? post.trendingScore > 70 :
        activeTab === "month" ? post.trendingScore > 60 :
        activeTab === "all";
      
      const matchesTags = selectedTags.length === 0 || 
                         selectedTags.some(tag => post.tags.includes(tag));
      
      const matchesPrice = 
        priceFilter === 'all' ? true :
        priceFilter === 'free' ? post.pricePi === 0 :
        priceFilter === 'paid' ? post.pricePi > 0 : true;
      
      const matchesTrending = 
        trendingFilter === 'all' ? true :
        post.trendingReason === trendingFilter;
      
      return matchesSearch && matchesTab && matchesTags && matchesPrice && matchesTrending;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'trending':
          return b.trendingScore - a.trendingScore;
        case 'likes':
          return b.stats.likes - a.stats.likes;
        case 'views':
          return b.stats.views - a.stats.views;
        case 'comments':
          return b.stats.comments - a.stats.comments;
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
    setSortBy('trending');
    setSelectedTags([]);
    setPriceFilter('all');
    setTrendingFilter('all');
    setSearchTerm('');
  };

  const hasActiveFilters = sortBy !== 'trending' || selectedTags.length > 0 || 
                          priceFilter !== 'all' || trendingFilter !== 'all' || searchTerm !== '';


  const getTrendingIcon = (reason: string) => {
    switch (reason) {
      case "hot":
        return <Flame className="h-4 w-4 text-red-500" />;
      case "rising":
        return <TrendingUp className="h-4 w-4 text-orange-500" />;
      default:
        return <Star className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getTrendingBadge = (reason: string) => {
    switch (reason) {
      case "hot":
        return <Badge className="bg-red-100 text-red-800">HOT</Badge>;
      case "rising":
        return <Badge className="bg-orange-100 text-orange-800">RISING</Badge>;
      default:
        return <Badge variant="outline">TRENDING</Badge>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-orange-500" />
            {t.trending.title}
          </h1>
          <p className="text-muted-foreground mt-2">{t.trending.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Search and Filter */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="trending-search"
                name="search"
                type="search"
                placeholder={t.trending.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                autoComplete="off"
              />
            </div>
            
            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <ArrowUpDown className="h-4 w-4" />
                  {t.common.sort}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 z-50">
                <DropdownMenuLabel>{t.common.sort}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
                  <DropdownMenuRadioItem value="trending">{t.trending.sortByTrending}</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="likes">{t.trending.sortByLikes}</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="views">{t.trending.sortByViews}</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="comments">{t.trending.sortByComments}</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  {t.common.filter}
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                      {(selectedTags.length > 0 ? 1 : 0) + (priceFilter !== 'all' ? 1 : 0) + (trendingFilter !== 'all' ? 1 : 0)}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 z-50">
                <DropdownMenuLabel>{t.common.filter}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* Trending Type Filter */}
                <div className="px-2 py-1.5">
                  <div className="text-sm font-medium mb-2">{t.trending.trendingType}</div>
                  <DropdownMenuRadioGroup value={trendingFilter} onValueChange={(value) => setTrendingFilter(value as typeof trendingFilter)}>
                    <DropdownMenuRadioItem value="all">{t.trending.all}</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="hot">🔥 {t.trending.hot}</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="rising">📈 {t.trending.rising}</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </div>
                
                <DropdownMenuSeparator />
                
                {/* Price Filter */}
                <div className="px-2 py-1.5">
                  <div className="text-sm font-medium mb-2">{t.filters.price}</div>
                  <DropdownMenuRadioGroup value={priceFilter} onValueChange={(value) => setPriceFilter(value as typeof priceFilter)}>
                    <DropdownMenuRadioItem value="all">{t.filters.priceAll}</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="free">{t.filters.priceFree}</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="paid">{t.filters.pricePaid}</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </div>
                
                <DropdownMenuSeparator />
                
                {/* Tag Filter */}
                <div className="px-2 py-1.5">
                  <div className="text-sm font-medium mb-2">{t.filters.tags}</div>
                  <div className="max-h-48 overflow-y-auto">
                    {availableTags.map((tag) => (
                      <DropdownMenuCheckboxItem
                        key={tag}
                        checked={selectedTags.includes(tag)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedTags([...selectedTags, tag]);
                          } else {
                            setSelectedTags(selectedTags.filter((t) => t !== tag));
                          }
                        }}
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
                        필터 초기화
                      </Button>
                    </div>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-sm text-muted-foreground">활성 필터:</span>
              
              {sortBy !== 'trending' && (
                <Badge variant="secondary" className="gap-1">
                  정렬: {sortBy === 'likes' ? '좋아요' : sortBy === 'views' ? '조회수' : '댓글'}
                  <button
                    onClick={() => setSortBy('trending')}
                    className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              
              {trendingFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {trendingFilter === 'hot' ? '🔥 HOT' : '📈 RISING'}
                  <button
                    onClick={() => setTrendingFilter('all')}
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
              
              {selectedTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  #{tag}
                  <button
                    onClick={() => setSelectedTags(selectedTags.filter((t) => t !== tag))}
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

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="today">{t.trending.today}</TabsTrigger>
              <TabsTrigger value="week">{t.trending.week}</TabsTrigger>
              <TabsTrigger value="month">{t.trending.month}</TabsTrigger>
              <TabsTrigger value="all">{t.trending.all}</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-6 mt-6">
              {isLoading ? (
                <div className="text-center py-12 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50 animate-pulse" />
                  <p>{t.common.loading}</p>
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t.trending.noTrending}</p>
                </div>
              ) : (
                filteredPosts.map((post, index) => (
                  <Card key={post.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl font-bold text-orange-500">#{index + 1}</span>
                          {getTrendingIcon(post.trendingReason)}
                          {getTrendingBadge(post.trendingReason)}
                          <Badge variant="outline" className="text-xs">
                            점수: {post.trendingScore}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl mb-2">{post.title}</CardTitle>
                        <p className="text-muted-foreground mb-4 line-clamp-2">{post.content}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={post.author.avatar} />
                              <AvatarFallback className="text-xs">{post.author.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span>{post.author.name}</span>
                            <span>@{post.author.username}</span>
                          </div>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {post.timestamp}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-1">
                            {post.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              {post.stats.views.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="h-4 w-4" />
                              {post.stats.likes}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="h-4 w-4" />
                              {post.stats.comments}
                            </span>
                            <span className="flex items-center gap-1 text-purple-600">
                              <Coins className="h-4 w-4" />
                              {post.stats.piEarned}π
                            </span>
                          </div>
                        </div>
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
          {/* Trending Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                인기 태그
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t.common.loading}
                </p>
              ) : trendingTags.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t.trending.noTrending}
                </p>
              ) : (
                trendingTags.map((tag) => (
                  <div key={tag.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">#{tag.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {tag.count}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Top Authors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                인기 작가
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t.common.loading}
                </p>
              ) : topAuthors.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  아직 데이터가 없습니다
                </p>
              ) : (
                topAuthors.map((author, index) => (
                  <div key={author.username} className="flex items-center space-x-3">
                    <span className="w-4 text-xs text-muted-foreground">#{index + 1}</span>
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={author.avatar} />
                      <AvatarFallback className="text-xs">{author.name?.charAt(0) || '?'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{author.name || 'Anonymous'}</p>
                      <p className="text-xs text-muted-foreground">@{author.username}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{author.posts}개</p>
                      <p className="text-xs text-muted-foreground">{Number(author.views).toLocaleString()}조회</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
