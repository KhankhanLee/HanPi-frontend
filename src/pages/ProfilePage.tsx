import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Edit, Settings, Wallet, BookOpen, Heart, MessageCircle } from "lucide-react";

export function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);

  const userProfile = {
    name: "김한파이",
    username: "hanpi_dev",
    avatar: "",
    bio: "React와 TypeScript를 사랑하는 개발자입니다. 커뮤니티와 함께 성장하고 싶어요!",
    stats: {
      posts: 12,
      followers: 156,
      following: 89,
      piEarned: 1247.5
    },
    tags: ["React", "TypeScript", "Next.js", "개발자", "한국어"]
  };

  const userPosts = [
    {
      id: "1",
      title: "React 18의 새로운 기능들과 Concurrent Features 완벽 가이드",
      content: "React 18에서 도입된 Concurrent Rendering, Suspense, useTransition 등의 새로운 기능들을 실습 예제와 함께 자세히 알아보겠습니다.",
      stats: { likes: 127, comments: 23, views: 892, piEarned: 45.7 },
      timestamp: "2시간 전"
    },
    {
      id: "2", 
      title: "TypeScript 고급 타입 시스템 마스터하기",
      content: "TypeScript의 고급 타입 기능들을 활용하여 더 안전하고 표현력 있는 코드를 작성하는 방법을 다룹니다.",
      stats: { likes: 89, comments: 15, views: 567, piEarned: 23.4 },
      timestamp: "4시간 전"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Profile Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={userProfile.avatar} />
                <AvatarFallback className="text-lg">
                  {userProfile.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{userProfile.name}</CardTitle>
                <p className="text-muted-foreground">@{userProfile.username}</p>
                <p className="mt-2 text-sm">{userProfile.bio}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {userProfile.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">#{tag}</Badge>
                  ))}
                </div>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setIsEditing(!isEditing)}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              {isEditing ? "완료" : "편집"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{userProfile.stats.posts}</div>
              <div className="text-sm text-muted-foreground">게시물</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{userProfile.stats.followers}</div>
              <div className="text-sm text-muted-foreground">팔로워</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{userProfile.stats.following}</div>
              <div className="text-sm text-muted-foreground">팔로잉</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{userProfile.stats.piEarned}π</div>
              <div className="text-sm text-muted-foreground">Pi 수익</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Tabs */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="posts" className="gap-2">
            <BookOpen className="h-4 w-4" />
            게시물
          </TabsTrigger>
          <TabsTrigger value="liked" className="gap-2">
            <Heart className="h-4 w-4" />
            좋아요
          </TabsTrigger>
          <TabsTrigger value="comments" className="gap-2">
            <MessageCircle className="h-4 w-4" />
            댓글
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4">
          {userPosts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <CardTitle className="text-lg">{post.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{post.timestamp}</p>
              </CardHeader>
              <CardContent>
                <p className="text-sm line-clamp-3">{post.content}</p>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {post.stats.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {post.stats.comments}
                    </span>
                    <span className="text-purple-600 font-medium">
                      {post.stats.piEarned}π
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="liked" className="space-y-4">
          <div className="text-center py-12 text-muted-foreground">
            <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>좋아요한 게시물이 없습니다.</p>
          </div>
        </TabsContent>

        <TabsContent value="comments" className="space-y-4">
          <div className="text-center py-12 text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>작성한 댓글이 없습니다.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
