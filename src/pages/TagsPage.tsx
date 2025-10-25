import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import { 
  Search, 
  Tag, 
  TrendingUp, 
  Star, 
  MessageCircle, 
  Heart, 
  Eye, 
  Coins,
  Calendar,
  Filter,
  Clock,
  Users,
  Hash,
  Plus
} from "lucide-react";
import { api } from "../lib/api";
import { TAGModal } from "../components/ui/tag_modal";

interface TagPost {
  id: number;
  title: string;
  author: {
    name: string;
    username: string;
    avatar: string;
  };
  timestamp: string;
  stats: {
    views: number;
    likes: number;
    comments: number;
  };
}

interface Tag {
  name: string;
  postCount: number;
  followerCount: number;
  trendingScore: number;
  change: string;
  description: string;
  color: string;
  isFollowing: boolean;
  recentPosts?: TagPost[];
}

export function TagsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("trending");
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagDescription, setNewTagDescription] = useState("");

  // 태그 데이터 로드
  useEffect(() => {
    const fetchTags = async () => {
      setIsLoading(true);
      try {
        const response = await api.getTags(searchTerm);
        if (response.data.success) {
          const tagsData = response.data.data;
          
          // 각 태그의 최근 게시물 로드 (상위 5개만)
          const tagsWithPosts = await Promise.all(
            tagsData.slice(0, 10).map(async (tag: Tag) => {
              try {
                const postsResponse = await api.getTagPosts(tag.name, 3);
                return {
                  ...tag,
                  recentPosts: postsResponse.data.success ? postsResponse.data.data : []
                };
              } catch (error) {
                console.error(`태그 ${tag.name} 게시물 로드 실패:`, error);
                return {
                  ...tag,
                  recentPosts: []
                };
              }
            })
          );

          setTags(tagsWithPosts);
        }
      } catch (error) {
        console.error('태그 로드 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchTags();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const fetchTags = async () => {
    try {
      const response = await api.getTags();
      setTags(response.data.tags);
    } catch (error) {
      console.error("태그 목록을 가져오는 중 오류 발생:", error);
    }
  };

  const filteredTags = tags.filter(tag => {
    const matchesSearch = tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tag.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === "trending") return matchesSearch && tag.trendingScore > 80;
    if (activeTab === "following") return matchesSearch && tag.isFollowing;
    if (activeTab === "popular") return matchesSearch && tag.postCount > 50;
    if (activeTab === "all") return matchesSearch;
    
    return matchesSearch;
  });

  const getTrendingIcon = (score: number) => {
    if (score > 90) return <TrendingUp className="h-4 w-4 text-red-500" />;
    if (score > 80) return <TrendingUp className="h-4 w-4 text-orange-500" />;
    return <Star className="h-4 w-4 text-yellow-500" />;
  };

  const getTrendingBadge = (score: number) => {
    if (score > 90) return <Badge className="bg-red-100 text-red-800">HOT</Badge>;
    if (score > 80) return <Badge className="bg-orange-100 text-orange-800">RISING</Badge>;
    return <Badge variant="outline">POPULAR</Badge>;
  };

  const handleCreateTag = async () => {
    try {
      const response = await api.createTag({ name: newTagName, description: newTagDescription });
      if (response.data.success) {
        alert("태그가 성공적으로 생성되었습니다!");
        setIsModalOpen(false);
        setNewTagName("");
        setNewTagDescription("");
        // 태그 목록 새로고침
        fetchTags();
      } else {
        alert("태그 생성에 실패했습니다.");
      }
    } catch (error) {
      console.error("태그 생성 중 오류 발생:", error);
      alert("태그 생성 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Hash className="h-8 w-8 text-purple-500" />
            태그
          </h1>
          <p className="text-muted-foreground mt-2">관심 있는 주제의 태그를 팔로우하고 최신 콘텐츠를 확인하세요.</p>
        </div>
        <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4" />
          새 태그 만들기
        </Button>
      </div>

      {/* Modal for creating a new tag */}
      <TAGModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2 className="text-xl font-bold mb-4">새 태그 만들기</h2>
        <div className="space-y-4">
          <Input
            placeholder="태그 이름"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
          />
          <Input
            placeholder="태그 설명"
            value={newTagDescription}
            onChange={(e) => setNewTagDescription(e.target.value)}
          />
        </div>
        <div className="flex justify-end mt-6">
          <Button variant="outline" onClick={() => setIsModalOpen(false)}>
            취소
          </Button>
          <Button className="ml-2" onClick={handleCreateTag}>
            생성
          </Button>
        </div>
      </TAGModal>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Search and Filter */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="tags-search"
                name="search"
                type="search"
                placeholder="태그 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                autoComplete="off"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              필터
            </Button>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="trending">트렌딩</TabsTrigger>
              <TabsTrigger value="following">팔로잉</TabsTrigger>
              <TabsTrigger value="popular">인기</TabsTrigger>
              <TabsTrigger value="all">전체</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4 mt-6">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="text-muted-foreground mt-4">태그를 불러오는 중...</p>
                </div>
              ) : filteredTags.length === 0 ? (
                <div className="text-center py-12">
                  <Hash className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">태그를 찾을 수 없습니다.</p>
                  {searchTerm && (
                    <p className="text-sm text-muted-foreground mt-2">
                      검색어를 변경하거나 필터를 조정해보세요.
                    </p>
                  )}
                </div>
              ) : (
                <>
                  {filteredTags.map((tag) => (
                <Card key={tag.name} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Hash className="h-5 w-5 text-muted-foreground" />
                          <span className="text-2xl font-bold">#{tag.name}</span>
                          {getTrendingIcon(tag.trendingScore)}
                          {getTrendingBadge(tag.trendingScore)}
                          <Badge variant="outline" className="text-xs">
                            점수: {tag.trendingScore}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-4">{tag.description}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4" />
                            {tag.postCount}개 게시물
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {tag.followerCount.toLocaleString()}명 팔로워
                          </span>
                          <span className="flex items-center gap-1 text-green-600">
                            <TrendingUp className="h-4 w-4" />
                            {tag.change}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <Badge className={tag.color}>
                            {tag.name}
                          </Badge>
                          <div className="flex items-center gap-2">
                            {tag.isFollowing ? (
                              <Button variant="outline" size="sm">
                                팔로잉
                              </Button>
                            ) : (
                              <Button size="sm">
                                팔로우
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  {tag.recentPosts && tag.recentPosts.length > 0 && (
                    <CardContent>
                      <h4 className="font-medium mb-3">최근 게시물</h4>
                      <div className="space-y-3">
                        {tag.recentPosts.map((post) => (
                          <div key={post.id} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={post.author.avatar} />
                              <AvatarFallback className="text-xs">{post.author.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h5 className="font-medium text-sm line-clamp-1">{post.title}</h5>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                                <span>{post.author.name}</span>
                                <span>@{post.author.username}</span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {post.timestamp}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                                <span className="flex items-center gap-1">
                                  <Eye className="h-3 w-3" />
                                  {post.stats.views}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Heart className="h-3 w-3" />
                                  {post.stats.likes}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MessageCircle className="h-3 w-3" />
                                  {post.stats.comments}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Top Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                인기 태그
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tags
                .sort((a, b) => b.trendingScore - a.trendingScore)
                .slice(0, 5)
                .map((tag, index) => (
                <div key={tag.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-4 text-xs text-muted-foreground">#{index + 1}</span>
                    <span className="text-sm font-medium">#{tag.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {tag.postCount}
                    </Badge>
                  </div>
                  <span className="text-xs text-green-600 font-medium">
                    {tag.change}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Following Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                팔로잉 중인 태그
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {tags
                .filter(tag => tag.isFollowing)
                .map((tag) => (
                <div key={tag.name} className="flex items-center justify-between p-2 rounded hover:bg-muted cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">#{tag.name}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {tag.postCount}
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
                <span className="text-sm text-muted-foreground">총 태그</span>
                <span className="font-medium">{tags.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">팔로잉 중</span>
                <span className="font-medium">{tags.filter(t => t.isFollowing).length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">총 게시물</span>
                <span className="font-medium">{tags.reduce((sum, tag) => sum + tag.postCount, 0)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
