import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { cn } from '@/lib/utils';

interface LikeButtonProps {
  targetType: 'document' | 'comment';
  targetId: number;
  initialLiked?: boolean;
  initialCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  className?: string;
}

export function LikeButton({
  targetType,
  targetId,
  initialLiked = false,
  initialCount = 0,
  size = 'md',
  showCount = true,
  className,
}: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // 좋아요 상태 확인
  useEffect(() => {
    checkLikeStatus();
  }, [targetId, targetType]);

  const checkLikeStatus = async () => {
    try {
      const response = await apiClient.post('/likes/check', {
        items: [{ targetType, targetId }],
      });
      
      const data = response.data.data || response.data;
      if (Array.isArray(data) && data.length > 0) {
        setIsLiked(data[0].isLiked);
      }
    } catch (error) {
      console.error('Failed to check like status:', error);
    }
  };

  // 좋아요 토글
  const handleToggleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;

    setLoading(true);
    try {
      const response = await apiClient.post('/toggle', {
        targetType,
        targetId,
      });

      const result = response.data.data || response.data;
      setIsLiked(result.isLiked);
      setLikeCount(prev => result.isLiked ? prev + 1 : Math.max(0, prev - 1));

      if (result.isLiked) {
        toast({
          title: '좋아요!',
          description: '좋아요를 눌렀습니다.',
        });
      }
    } catch (error: any) {
      console.error('Failed to toggle like:', error);
      toast({
        title: '오류',
        description: error.response?.data?.message || '좋아요 처리에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'h-8 px-2',
    md: 'h-9 px-3',
    lg: 'h-10 px-4',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggleLike}
      disabled={loading}
      style={isLiked ? { 
        backgroundColor: '#ec4899', 
        color: 'white',
        borderColor: '#ec4899'
      } : undefined}
      className={cn(
        sizeClasses[size],
        'transition-all',
        isLiked 
          ? 'hover:bg-pink-600' 
          : 'hover:bg-accent hover:text-accent-foreground',
        className
      )}
    >
      <Heart
        className={cn(
          iconSizes[size],
          'transition-all'
        )}
        style={isLiked ? { 
          color: 'white', 
          fill: 'white',
          stroke: 'white'
        } : undefined}
      />
      {showCount && (
        <span 
          className="ml-1 text-sm font-medium"
          style={isLiked ? { color: 'white' } : undefined}
        >
          {likeCount > 0 ? likeCount : ''}
        </span>
      )}
    </Button>
  );
}
