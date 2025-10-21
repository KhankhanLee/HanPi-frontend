import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
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
  Users, 
  TrendingUp, 
  Star, 
  MessageCircle, 
  Calendar,
  Filter,
  Plus,
  ArrowUpDown,
  X
} from "lucide-react";
import { CreateCommunityModal } from "../components/CreateCommunityModal";
import { apiClient } from "../lib/api";
import { useLanguage } from "../contexts/LanguageContext";

export function CommunityPage() {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState<'members' | 'posts' | 'recent'>('members');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [memberFilter, setMemberFilter] = useState<'all' | 'small' | 'medium' | 'large'>('all');
  interface CommunityData {
    id?: string | number;
    name: string;
    description?: string;
    avatar?: string;
    category?: string;
    tags?: string[];
    member_count?: number;
    post_count?: number;
    created_at?: string;
  }

  const [communities, setCommunities] = useState<CommunityData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [topContributors, setTopContributors] = useState<Array<{
    name: string;
    avatar: string;
    posts: number;
    points: number;
  }>>([]);
  const [trendingTopics, setTrendingTopics] = useState<Array<{
    name: string;
    count: number;
  }>>([]);

  const fetchCommunities = async () => {
    try {
      const response = await apiClient.get('/communities');
      setCommunities(response.data);
    } catch (error) {
      console.error('Failed to fetch communities:', error);
    }
  };

  const fetchTopContributors = async () => {
    try {
      const response = await apiClient.get('/community/top-contributors');
      const data = response.data.data || response.data;
      setTopContributors(Array.isArray(data) ? data.slice(0, 5) : []); // 상위 5명만
    } catch (error) {
      console.error('Failed to fetch top contributors:', error);
      setTopContributors([]);
    }
  };

  const fetchTrendingTopics = async () => {
    try {
      const response = await apiClient.get('/community/trending-topics');
      const data = response.data.data || response.data;
      setTrendingTopics(Array.isArray(data) ? data.slice(0, 5) : []); // 상위 5개만
    } catch (error) {
      console.error('Failed to fetch trending topics:', error);
      setTrendingTopics([]);
    }
  };

  useEffect(() => {
    fetchCommunities();
    fetchTopContributors();
    fetchTrendingTopics();
  }, []);

  interface CommunityData {
    name: string;
    description?: string;
    avatar?: string;
    category?: string;
    tags?: string[];
  }

    const handleCreateCommunity = async (communityData: CommunityData): Promise<void> => {
    try {
      await apiClient.post('/communities', communityData);
      fetchCommunities();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating community:', error);
    }
  };

  const availableCategories = Array.from(new Set(communities.map(c => c.category).filter((cat): cat is string => Boolean(cat))));

  // 필터 초기화
  const clearFilters = () => {
    setSortBy('members');
    setSelectedCategories([]);
    setMemberFilter('all');
    setSearchTerm('');
  };

  const hasActiveFilters = sortBy !== 'members' || selectedCategories.length > 0 || 
                          memberFilter !== 'all' || searchTerm !== '';

  const filteredCommunities = communities
    .filter(community => {
      const matchesSearch = community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (community.description && community.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesTab = 
        activeTab === "all" ? true :
        activeTab === "joined" ? true : // 백엔드에서 isJoined 정보 필요
        activeTab === "trending" ? (community.member_count ?? 0) > 1000 :
        activeTab === "new" ? true : true; // 생성일 정보 필요
      
      const matchesCategories = selectedCategories.length === 0 || 
                               (community.category && selectedCategories.includes(community.category));
      
      const matchesMemberFilter = 
        memberFilter === 'all' ? true :
        memberFilter === 'small' ? (community.member_count ?? 0) < 100 :
        memberFilter === 'medium' ? (community.member_count ?? 0) >= 100 && (community.member_count ?? 0) < 1000 :
        memberFilter === 'large' ? (community.member_count ?? 0) >= 1000 : true;
      
      return matchesSearch && matchesTab && matchesCategories && matchesMemberFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'members':
          return (b.member_count ?? 0) - (a.member_count ?? 0);
        case 'posts':
          return (b.post_count ?? 0) - (a.post_count ?? 0);
        case 'recent':
          return new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime();
        default:
          return 0;
      }
    });

  return (
    <div className="max-w-6xl mx-auto p-6">
      <CreateCommunityModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        onCreate={handleCreateCommunity} 
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{t.community.title}</h1>
          <p className="text-muted-foreground mt-2">{t.community.description}</p>
        </div>
        <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4" />
          {t.community.createCommunity}
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
                  id="community-search"
                  name="search"
                  type="search"
                  placeholder={t.community.searchPlaceholder}
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
                    <DropdownMenuRadioItem value="members">{t.community.sortByMembers}</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="posts">{t.community.sortByPosts}</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="recent">{t.community.sortByRecent}</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* 필터 드롭다운 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    {t.common.filter}
                    {(selectedCategories.length > 0 || memberFilter !== 'all') && (
                      <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                        {selectedCategories.length + (memberFilter !== 'all' ? 1 : 0)}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 z-50">
                  <div className="px-2 py-1.5">
                    <div className="text-sm font-medium mb-2">{t.community.members}</div>
                    <DropdownMenuRadioGroup value={memberFilter} onValueChange={(value) => setMemberFilter(value as typeof memberFilter)}>
                      <DropdownMenuRadioItem value="all">{t.community.memberFilter.all}</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="small">{t.community.memberFilter.small}</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="medium">{t.community.memberFilter.medium}</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="large">{t.community.memberFilter.large}</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </div>
                  
                  <DropdownMenuSeparator />
                  
                  <div className="px-2 py-1.5">
                    <div className="text-sm font-medium mb-2">{t.community.categories}</div>
                    <div className="max-h-48 overflow-y-auto">
                      {availableCategories.map((category) => (
                        <DropdownMenuCheckboxItem
                          key={category}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedCategories([...selectedCategories, category]);
                            } else {
                              setSelectedCategories(selectedCategories.filter((c) => c !== category));
                            }
                          }}
                        >
                          {category}
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
                
                {sortBy !== 'members' && (
                  <Badge variant="secondary" className="gap-1">
                    {t.common.sort}: {sortBy === 'posts' ? t.community.sortByPosts : t.community.sortByRecent}
                    <button
                      onClick={() => setSortBy('members')}
                      className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                
                {memberFilter !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    {memberFilter === 'small' ? t.community.memberFilter.small : memberFilter === 'medium' ? t.community.memberFilter.medium : t.community.memberFilter.large}
                    <button
                      onClick={() => setMemberFilter('all')}
                      className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                
                {selectedCategories.map((category) => (
                  <Badge key={category} variant="secondary" className="gap-1">
                    {category}
                    <button
                      onClick={() => setSelectedCategories(selectedCategories.filter((c) => c !== category))}
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
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">{t.community.all}</TabsTrigger>
              <TabsTrigger value="joined">{t.community.joined}</TabsTrigger>
              <TabsTrigger value="trending">{t.community.trending}</TabsTrigger>
              <TabsTrigger value="new">{t.community.new}</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4 mt-6">
              {filteredCommunities.map((community) => (
                <Card key={community.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={community.avatar} />
                          <AvatarFallback>{community.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">{community.name}</CardTitle>
                          <p className="text-muted-foreground mb-3">{community.description}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {(community.member_count ?? 0).toLocaleString()} {t.community.members}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="h-4 w-4" />
                              {community.post_count} {t.community.posts}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {community.created_at
                                ? new Date(community.created_at).toLocaleDateString()
                                : "날짜 정보 없음"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{community.category}</Badge>
                            {community.tags && community.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* 사용자 데이터에 따라 처리 필요 */}
                        <Button size="sm">
                          {t.community.join}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Top Contributors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                {t.community.topContributors}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topContributors.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t.community.noCommunities}
                </p>
              ) : (
                topContributors.map((contributor, index) => (
                  <div key={`${contributor.name}-${index}`} className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 flex-1">
                      <span className="w-4 text-xs text-muted-foreground">#{index + 1}</span>
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={contributor.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${contributor.name}`} />
                        <AvatarFallback className="text-xs">
                          {contributor.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{contributor.name}</p>
                        <p className="text-xs text-muted-foreground">{contributor.posts}개 게시물</p>
                      </div>
                    </div>
                    <span className="text-xs text-purple-600 font-medium">
                      {contributor.points}{t.community.points}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Trending Topics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {t.home.trendingTopics}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {trendingTopics.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  아직 인기 주제가 없습니다
                </p>
              ) : (
                trendingTopics.map((topic) => (
                  <div key={topic.name} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">#{topic.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {topic.count}
                    </Badge>
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
