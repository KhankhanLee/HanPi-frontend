import { Heart, MessageCircle, Share, Bookmark, MoreHorizontal, Eye, Coins } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { LikeButton } from "./LikeButton";
import { BookmarkButton } from "./BookmarkButton";

interface PostCardProps {
  post: {
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
    isLiked?: boolean;
    isBookmarked?: boolean;
  };
}

export function PostCard({ post }: PostCardProps) {
  const navigate = useNavigate();

  const handleCardClick = (e: React.MouseEvent) => {
    // 버튼 클릭은 무시
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    navigate(`/document/${post.id}`);
  };

  return (
    <Card className="w-full cursor-pointer hover:shadow-lg transition-shadow" onClick={handleCardClick}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.author.avatar} />
              <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{post.author.name}</p>
              <p className="text-sm text-muted-foreground">@{post.author.username} · {post.timestamp}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">{post.title}</h3>
          <p className="text-muted-foreground line-clamp-3">{post.content}</p>
        </div>

        {post.image && (
          <div className="rounded-lg overflow-hidden">
            <ImageWithFallback 
              src={post.image} 
              alt={post.title}
              className="w-full h-48 object-cover"
            />
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              #{tag}
            </Badge>
          ))}
        </div>

        {/* Pi Earnings Indicator */}
        {post.stats.piEarned > 0 && (
          <div className="flex items-center space-x-2 bg-purple-50 p-2 rounded-lg">
            <Coins className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-600">
              +{post.stats.piEarned} π 수익 발생
            </span>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-1">
            {/* 좋아요 버튼 */}
            <LikeButton
              targetType="document"
              targetId={parseInt(post.id)}
              initialLiked={post.isLiked}
              initialCount={post.stats.likes}
              size="sm"
              showCount
            />
            
            {/* 댓글 버튼 */}
            <Button variant="ghost" size="sm" onClick={(e) => {
              e.stopPropagation();
              navigate(`/document/${post.id}#comments`);
            }}>
              <MessageCircle className="h-4 w-4 mr-1" />
              {post.stats.comments}
            </Button>
            
            {/* 조회수 */}
            <Button variant="ghost" size="sm" disabled>
              <Eye className="h-4 w-4 mr-1" />
              {post.stats.views}
            </Button>
          </div>

          <div className="flex items-center space-x-1">
            {/* 공유 버튼 */}
            <Button variant="ghost" size="icon" onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(`${window.location.origin}/document/${post.id}`);
            }}>
              <Share className="h-4 w-4" />
            </Button>
            
            {/* 북마크 버튼 */}
            <BookmarkButton
              documentId={parseInt(post.id)}
              initialBookmarked={post.isBookmarked}
              size="sm"
            />
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}