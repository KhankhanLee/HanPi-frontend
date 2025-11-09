import React, { useState, useEffect } from 'react';
import { MessageCircle, Reply, Edit2, Trash2, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Card, CardContent, CardFooter } from './ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';

interface Comment {
  id: number;
  content: string;
  user_id: string;
  username: string; 
  user_avatar?: string;
  created_at: string;
  updated_at: string;
  parent_id: number | null;
  reply_count: number;
  deleted_at: string | null;
}

interface CommentSectionProps {
  documentId: number;
  currentUserId?: string;
}

export function CommentSection({ documentId, currentUserId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingComment, setEditingComment] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [expandedReplies, setExpandedReplies] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // 댓글 목록 로드
  const loadComments = async () => {
    try {
      alert('loadComments 시작');
      console.log('댓글 로드 시작:', documentId);
      const response = await apiClient.get(`/comments/documents/${documentId}/comments`);
      console.log('댓글 API 응답:', response.data);
      alert(`API 응답 받음: ${JSON.stringify(response.data).substring(0, 100)}`);
      
      // API 응답 구조 확인 후 데이터 추출
      let data = [];
      if (response.data.success && response.data.data) {
        data = response.data.data;
      } else if (Array.isArray(response.data)) {
        data = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        data = response.data.data;
      }
      
      console.log('처리된 댓글 데이터:', data);
      setComments(data);
      
      // 디버깅을 위해 임시로 alert 추가
      alert(`댓글 로드 완료: ${data.length}개`);
    } catch (error) {
      alert('loadComments 오류 발생: ' + String(error));
      console.error('댓글 로드 실패:', error);
      toast({
        title: '오류',
        description: '댓글을 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  // 대댓글 목록 로드
  const loadReplies = async (commentId: number) => {
    try {
      console.log('대댓글 로드 시작:', commentId);
      const response = await apiClient.get(`/comments/comments/${commentId}/replies`);
      console.log('대댓글 API 응답:', response.data);
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      
      // 대댓글을 comments 배열에 병합
      setComments(prev => {
        const existingIds = new Set(prev.map(c => c.id));
        const newReplies = data.filter((r: Comment) => !existingIds.has(r.id));
        return [...prev, ...newReplies];
      });
    } catch (error) {
      console.error('대댓글 로드 실패:', error);
      toast({
        title: '오류',
        description: '답글을 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    loadComments();
  }, [documentId]);

  // 새 댓글 작성
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      console.log('댓글 작성 시작:', documentId, newComment);
      alert('댓글 작성 시도 중...');
      
      const response = await apiClient.post(`/comments/documents/${documentId}/comments`, {
        content: newComment,
      });
      console.log('댓글 작성 응답:', response.data);
      alert('댓글 작성 성공! 이제 새로고침 중...');
      
      setNewComment('');
      
      // 댓글 목록 새로고침
      await loadComments();
      
      toast({
        title: '성공',
        description: '댓글이 작성되었습니다.',
      });
    } catch (error) {
      console.error('댓글 작성 실패:', error);
      toast({
        title: '오류',
        description: '댓글 작성에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // 대댓글 작성
  const handleSubmitReply = async (parentId: number) => {
    if (!replyContent.trim()) return;

    setLoading(true);
    try {
      console.log('대댓글 작성 시작:', documentId, parentId, replyContent);
      await apiClient.post(`/comments/comments/${parentId}/replies`, {
        content: replyContent,
      });
      
      setReplyContent('');
      setReplyingTo(null);
      
      // 대댓글 표시 상태로 설정
      setExpandedReplies(prev => {
        const newSet = new Set(prev);
        newSet.add(parentId);
        return newSet;
      });
      
      // 대댓글 목록 다시 로드
      await loadReplies(parentId);
      
      toast({
        title: '성공',
        description: '답글이 작성되었습니다.',
      });
    } catch (error) {
      console.error('대댓글 작성 실패:', error);
      toast({
        title: '오류',
        description: '답글 작성에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // 댓글 수정
  const handleUpdateComment = async (commentId: number) => {
    if (!editContent.trim()) return;

    setLoading(true);
    try {
      console.log('댓글 수정 시작:', commentId, editContent);
      await apiClient.put(`/comments/comments/${commentId}`, {
        content: editContent,
      });
      
      setEditingComment(null);
      setEditContent('');
      await loadComments();
      
      toast({
        title: '성공',
        description: '댓글이 수정되었습니다.',
      });
    } catch (error) {
      console.error('댓글 수정 실패:', error);
      toast({
        title: '오류',
        description: '댓글 수정에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // 댓글 삭제
  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('정말 이 댓글을 삭제하시겠습니까?')) return;

    setLoading(true);
    try {
      console.log('댓글 삭제 시작:', commentId);
      await apiClient.delete(`/comments/comments/${commentId}`);
      await loadComments();
      
      toast({
        title: '성공',
        description: '댓글이 삭제되었습니다.',
      });
    } catch (error) {
      console.error('댓글 삭제 실패:', error);
      toast({
        title: '오류',
        description: '댓글 삭제에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // 대댓글 토글
  const toggleReplies = async (commentId: number) => {
    if (expandedReplies.has(commentId)) {
      // 대댓글 숨기기
      setExpandedReplies(prev => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
      
      // 대댓글 제거
      setComments(prev => prev.filter(c => c.parent_id !== commentId));
    } else {
      // 대댓글 표시로 설정
      setExpandedReplies(prev => {
        const newSet = new Set(prev);
        newSet.add(commentId);
        return newSet;
      });
      
      // 대댓글 로드
      await loadReplies(commentId);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    
    return date.toLocaleDateString('ko-KR');
  };

  const renderComment = (comment: Comment, isReply: boolean = false) => {
    if (comment.deleted_at) {
      return (
        <div key={comment.id} className={`py-4 ${isReply ? 'ml-12 border-l-2 pl-4' : ''}`}>
          <p className="text-sm text-gray-400 italic">삭제된 댓글입니다.</p>
        </div>
      );
    }

    const isEditing = editingComment === comment.id;
    const isReplying = replyingTo === comment.id;
    const isOwner = currentUserId === comment.user_id;

    return (
      <Card key={comment.id} className={`mb-4 ${isReply ? 'ml-12 border-l-2' : ''}`}>
        <CardContent className="pt-4">
          <div className="flex gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={comment.user_avatar} />
              <AvatarFallback>{comment.username?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-semibold text-sm">{comment.username || '익명'}</span>
                  <span className="text-xs text-gray-500 ml-2">
                    {formatDate(comment.created_at)}
                    {comment.updated_at !== comment.created_at && ' (수정됨)'}
                  </span>
                </div>
                
                {isOwner && !isEditing && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingComment(comment.id);
                        setEditContent(comment.content);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteComment(comment.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              
              {isEditing ? (
                <div className="space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleUpdateComment(comment.id)}
                      disabled={loading}
                    >
                      수정
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingComment(null);
                        setEditContent('');
                      }}
                    >
                      취소
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
              )}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="pt-0 pb-3 flex gap-2">
          {!isReply && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyingTo(isReplying ? null : comment.id)}
              >
                <Reply className="h-4 w-4 mr-1" />
                답글
              </Button>
              
              {comment.reply_count > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleReplies(comment.id)}
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  {expandedReplies.has(comment.id) ? '답글 숨기기' : `답글 ${comment.reply_count}개 보기`}
                </Button>
              )}
            </>
          )}
        </CardFooter>
        
        {isReplying && (
          <div className="px-4 pb-4">
            <div className="flex gap-2">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="답글을 입력하세요..."
                className="min-h-[80px]"
              />
            </div>
            <div className="flex gap-2 mt-2">
              <Button
                size="sm"
                onClick={() => handleSubmitReply(comment.id)}
                disabled={loading || !replyContent.trim()}
              >
                <Send className="h-4 w-4 mr-1" />
                답글 작성
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setReplyingTo(null);
                  setReplyContent('');
                }}
              >
                취소
              </Button>
            </div>
          </div>
        )}
      </Card>
    );
  };

  const topLevelComments = comments.filter(c => !c.parent_id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="h-5 w-5" />
        <h3 className="text-lg font-semibold">댓글 {topLevelComments.length}개</h3>
      </div>
      
      {/* 디버깅 정보 */}
      <div className="bg-yellow-100 p-2 text-xs rounded">
        <div>전체 댓글: {comments.length}개</div>
        <div>최상위 댓글: {topLevelComments.length}개</div>
        <div>Document ID: {documentId}</div>
        <div>로딩 상태: {loading ? 'true' : 'false'}</div>
      </div>
      
      {/* 새 댓글 작성 */}
      <form onSubmit={handleSubmitComment} className="space-y-3">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="댓글을 입력하세요..."
          className="min-h-[100px]"
        />
        <Button type="submit" disabled={loading || !newComment.trim()}>
          <Send className="h-4 w-4 mr-2" />
          댓글 작성
        </Button>
      </form>
      
      {/* 댓글 목록 */}
      <div className="space-y-4">
        {topLevelComments.length === 0 ? (
          <p className="text-center text-gray-500 py-8">첫 댓글을 작성해보세요!(write first comment!)</p>
        ) : (
          topLevelComments.map(comment => (
            <React.Fragment key={comment.id}>
              {renderComment(comment, false)}
              {expandedReplies.has(comment.id) &&
                comments
                  .filter(c => c.parent_id && c.parent_id === comment.id)
                  .map(reply => renderComment(reply, true))}
            </React.Fragment>
          ))
        )}
      </div>
    </div>
  );
}
