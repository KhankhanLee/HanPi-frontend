import React, { useState, useEffect } from 'react';
import { Bookmark, FolderPlus } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { cn } from '@/lib/utils';

interface BookmarkButtonProps {
  documentId: number;
  initialBookmarked?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

interface BookmarkFolder {
  id: number;
  name: string;
  count: number;
}

export function BookmarkButton({
  documentId,
  initialBookmarked = false,
  size = 'md',
  showLabel = false,
  className,
}: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [folders, setFolders] = useState<BookmarkFolder[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { toast } = useToast();

  // 북마크 상태 확인
  useEffect(() => {
    checkBookmarkStatus();
    loadFolders();
  }, [documentId]);

  const checkBookmarkStatus = async () => {
    try {
      const response = await apiClient.post('/bookmarks/check', {
        documentIds: [documentId],
      });
      
      const data = response.data.data || response.data;
      if (Array.isArray(data) && data.length > 0) {
        setIsBookmarked(data[0].isBookmarked);
      }
    } catch (error) {
      console.error('Failed to check bookmark status:', error);
    }
  };

  const loadFolders = async () => {
    try {
      const response = await apiClient.get('/bookmarks/folders');
      const data = response.data.data || response.data || [];
      setFolders(data);
    } catch (error) {
      console.error('Failed to load folders:', error);
    }
  };

  // 북마크 토글 (기본 폴더)
  const handleToggleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;

    setLoading(true);
    try {
      const response = await apiClient.post('/bookmarks/toggle', {
        documentId,
        folder: 'default',
      });

      const result = response.data.data || response.data;
      setIsBookmarked(result.isBookmarked);

      toast({
        title: result.isBookmarked ? '북마크 추가' : '북마크 제거',
        description: result.isBookmarked
          ? '북마크에 추가되었습니다.'
          : '북마크에서 제거되었습니다.',
      });
    } catch (error: any) {
      console.error('Failed to toggle bookmark:', error);
      toast({
        title: '오류',
        description: error.response?.data?.message || '북마크 처리에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // 폴더에 북마크 추가
  const handleAddToFolder = async (folder: string) => {
    if (loading) return;

    setLoading(true);
    try {
      await apiClient.post('/bookmarks/toggle', {
        documentId,
        folder,
      });

      setIsBookmarked(true);
      setShowDropdown(false);

      toast({
        title: '북마크 추가',
        description: `"${folder}" 폴더에 추가되었습니다.`,
      });
    } catch (error: any) {
      console.error('Failed to add to folder:', error);
      toast({
        title: '오류',
        description: error.response?.data?.message || '북마크 추가에 실패했습니다.',
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

  // 간단한 북마크 버튼 (드롭다운 없음)
  if (!showDropdown) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggleBookmark}
        disabled={loading}
        style={isBookmarked ? { 
          backgroundColor: '#3b82f6', 
          color: 'white',
          borderColor: '#3b82f6'
        } : undefined}
        className={cn(
          sizeClasses[size],
          'transition-all',
          isBookmarked 
            ? 'hover:bg-blue-600' 
            : 'hover:bg-accent hover:text-accent-foreground',
          className
        )}
      >
        <Bookmark
          className={cn(
            iconSizes[size],
            'transition-all'
          )}
          style={isBookmarked ? { 
            color: 'white', 
            fill: 'white',
            stroke: 'white'
          } : undefined}
        />
        {showLabel && (
          <span 
            className="ml-2"
            style={isBookmarked ? { color: 'white' } : undefined}
          >
            {isBookmarked ? '북마크됨' : '북마크'}
          </span>
        )}
      </Button>
    );
  }

  // 폴더 선택 드롭다운이 있는 북마크 버튼
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={loading}
          style={isBookmarked ? { 
            backgroundColor: '#3b82f6', 
            color: 'white',
            borderColor: '#3b82f6'
          } : undefined}
          className={cn(
            sizeClasses[size],
            'transition-all',
            isBookmarked 
              ? 'hover:bg-blue-600' 
              : 'hover:bg-accent hover:text-accent-foreground',
            className
          )}
        >
          <Bookmark
            className={cn(
              iconSizes[size],
              'transition-all'
            )}
            style={isBookmarked ? { 
              color: 'white', 
              fill: 'white',
              stroke: 'white'
            } : undefined}
          />
          {showLabel && (
            <span 
              className="ml-2"
              style={isBookmarked ? { color: 'white' } : undefined}
            >
              {isBookmarked ? '북마크됨' : '북마크'}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleToggleBookmark}>
          <Bookmark className="mr-2 h-4 w-4" />
          {isBookmarked ? '북마크 제거' : '기본 폴더에 추가'}
        </DropdownMenuItem>
        
        {folders.length > 0 && (
          <>
            <DropdownMenuSeparator />
            {folders.map(folder => (
              <DropdownMenuItem
                key={folder.id}
                onClick={() => handleAddToFolder(folder.name)}
              >
                <FolderPlus className="mr-2 h-4 w-4" />
                {folder.name} ({folder.count})
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
