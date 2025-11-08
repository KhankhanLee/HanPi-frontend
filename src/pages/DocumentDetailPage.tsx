import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, MoreVertical, Edit2, Trash2, Eye, Lock, ShoppingCart, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CommentSection } from '@/components/CommentSection';
import { LikeButton } from '@/components/LikeButton';
import { BookmarkButton } from '@/components/BookmarkButton';
import { useToast } from '@/hooks/use-toast';
import { api, apiClient } from '@/lib/api';
import { getMockUser } from '@/utils/mockAuth';
import { io, Socket } from 'socket.io-client';
import { usePi } from '@/contexts/PiContext';

interface Document {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
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
  pricePi?: number;
  status?: string;
  createdAt: string;
  updatedAt: string;
}

export function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [checkingPurchase, setCheckingPurchase] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const { toast } = useToast();
  const { user, isAuthenticated, createPayment } = usePi();
  const currentUser = getMockUser();

  // Socket.IO 연결 설정
  useEffect(() => {
    const newSocket = io('http://localhost:3001', {
      transports: ['websocket'],
      autoConnect: true,
    });

    newSocket.on('connect', () => {
      console.log('Socket 연결됨:', newSocket.id);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket 연결 해제');
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // 실시간 조회수 업데이트 리스너
  useEffect(() => {
    if (!socket || !id) return;

    const handleViewUpdate = (data: { documentId: number; views: number }) => {
      if (data.documentId === parseInt(id)) {
        console.log('실시간 조회수 업데이트:', data.views);
        setDocument(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            stats: {
              ...prev.stats,
              views: data.views,
            },
          };
        });
      }
    };

    socket.on('view:updated', handleViewUpdate);

    return () => {
      socket.off('view:updated', handleViewUpdate);
    };
  }, [socket, id]);

  useEffect(() => {
    if (id) {
      loadDocument(parseInt(id));
      checkPurchaseStatus(parseInt(id));
    }
  }, [id]);

  // 구매 여부 확인
  const checkPurchaseStatus = async (docId: number) => {
    if (!isAuthenticated || !user) {
      setHasPurchased(false);
      return;
    }

    setCheckingPurchase(true);
    try {
      const response = await api.checkPurchase(docId.toString());
      setHasPurchased(response.data.hasPurchased);
      console.log('구매 여부:', response.data.hasPurchased);
    } catch (error) {
      console.error('구매 여부 확인 실패:', error);
      setHasPurchased(false);
    } finally {
      setCheckingPurchase(false);
    }
  };

  // 중복 조회 확인 함수 (LocalStorage 사용)
  const hasRecentlyViewed = (docId: number): boolean => {
    const key = `doc_view_${docId}`;
    const lastView = localStorage.getItem(key);
    
    if (!lastView) return false;
    
    const lastViewTime = parseInt(lastView);
    const now = Date.now();
    const timeDiff = now - lastViewTime;
    
    // 5분 이내 재방문은 조회수 증가 안 함
    return timeDiff < 5 * 60 * 1000;
  };

  // 조회 기록 저장
  const markAsViewed = (docId: number) => {
    const key = `doc_view_${docId}`;
    localStorage.setItem(key, Date.now().toString());
  };

  const loadDocument = async (docId: number) => {
    setLoading(true);
    try {
      console.log('문서 로드 시작:', docId);
      const response = await apiClient.get(`/docs/${docId}`);
      console.log('문서 API 응답:', response.data);
      
      const loadedDoc = response.data;
      
      // 데이터 검증
      if (!loadedDoc.id || !loadedDoc.title) {
        console.error('잘못된 문서 데이터:', loadedDoc);
        throw new Error('문서 데이터가 올바르지 않습니다.');
      }
      
      setDocument(loadedDoc);
      
      // 조회수 증가 로직
      const isAuthor = currentUser && loadedDoc.author.username === currentUser.piId;
      const alreadyViewed = hasRecentlyViewed(docId);

      if (isAuthor) {
        console.log('작성자 본인: 조회수 증가 안 함');
      } else if (alreadyViewed) {
        console.log('최근 조회 기록 있음: 조회수 증가 안 함');
      } else {
        // 조회수 증가 API 호출
        try {
          const viewResponse = await apiClient.post(`/docs/${docId}/view`);
          console.log('조회수 증가 완료:', viewResponse.data.views);
          
          // LocalStorage에 조회 기록 저장
          markAsViewed(docId);
          
          // 로컬 상태 업데이트
          setDocument(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              stats: {
                ...prev.stats,
                views: viewResponse.data.views,
              },
            };
          });
        } catch (viewError) {
          console.error('조회수 증가 실패:', viewError);
        }
      }
    } catch (error: any) {
      console.error('문서 로드 실패:', error);
      console.error('에러 상세:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      
      toast({
        title: '오류',
        description: error.response?.data?.message || '문서를 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/edit/${id}`);
  };

  const handleGoBack = () => {
    // 이전 페이지가 있으면 뒤로가기, 없으면 홈으로
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate('/');
    }
  };

  const handleDelete = async () => {
    if (!confirm('정말 이 문서를 삭제하시겠습니까?')) return;

    try {
      await apiClient.delete(`/api/docs/${id}`);
      toast({
        title: '성공',
        description: '문서가 삭제되었습니다.',
      });
      navigate('/my-docs');
    } catch (error: any) {
      console.error('Failed to delete document:', error);
      toast({
        title: '오류',
        description: '문서 삭제에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast({
      title: '링크 복사됨',
      description: '문서 링크가 클립보드에 복사되었습니다.',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // 문서 구매 처리
  const handlePurchase = async () => {
    if (!isAuthenticated || !user) {
      toast({
        title: '로그인 필요',
        description: 'Pi로 로그인해주세요.',
        variant: 'destructive',
      });
      return;
    }

    if (!document || !document.pricePi || document.pricePi <= 0) {
      toast({
        title: '오류',
        description: '구매할 수 없는 문서입니다.',
        variant: 'destructive',
      });
      return;
    }

    setPurchasing(true);

    try {
      console.log('문서 구매 시작:', { documentId: document.id, price: document.pricePi });

      // 1. 백엔드에 구매 요청 (Pi Platform에 결제 생성)
      const initiateResponse = await api.initiatePurchase(document.id);
      const { payment, purchase } = initiateResponse.data;

      console.log('구매 요청 성공:', { payment, purchase });

      // 2. Pi SDK로 결제 진행
      const piPayment = await createPayment(
        document.pricePi,
        `문서 구매: ${document.title}`,
        {
          documentId: document.id,
          documentTitle: document.title,
          type: 'document_purchase'
        }
      );

      if (!piPayment) {
        throw new Error('Pi 결제 생성 실패');
      }

      console.log('Pi 결제 완료:', piPayment);

      // 3. 구매 성공 - 페이지 새로고침
      toast({
        title: '구매 완료!',
        description: '문서를 구매했습니다.',
      });

      // 구매 상태 업데이트
      setHasPurchased(true);
      
      // 문서 다시 로드
      await loadDocument(parseInt(document.id));

    } catch (error: any) {
      console.error('문서 구매 실패:', error);
      toast({
        title: '구매 실패',
        description: error.response?.data?.message || '문서 구매에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-lg text-gray-500 mb-4">문서를 찾을 수 없습니다.</p>
            <Button onClick={handleGoBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              뒤로 가기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isAuthor = currentUser?.uid === document.author.username;
  const isPaidDocument = document.pricePi && document.pricePi > 0;
  const canViewContent = isAuthor || !isPaidDocument || hasPurchased;

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      {/* 뒤로 가기 버튼 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleGoBack}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        뒤로 가기
      </Button>

      {/* 문서 헤더 */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{document.title}</h1>
              
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={document.author.avatar} />
                    <AvatarFallback>{document.author.name?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{document.author.name || '익명'}</span>
                </div>
                <span>·</span>
                <span>{formatDate(document.createdAt)}</span>
                <span>·</span>
                <span>조회 {document.stats.views}</span>
              </div>

              <div className="flex gap-2 mb-4">
                {document.tags && document.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">{tag}</Badge>
                ))}
                {isPaidDocument && (
                  <Badge className="bg-purple-500 text-white">
                    <ShoppingCart className="h-3 w-3 mr-1" />
                    {document.pricePi}π
                  </Badge>
                )}
                {hasPurchased && isPaidDocument && (
                  <Badge className="bg-green-500 text-white">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    구매 완료
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              {isAuthor && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleEdit}>
                      <Edit2 className="mr-2 h-4 w-4" />
                      수정
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      삭제
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* 좋아요, 북마크, 공유 버튼 */}
          <div className="flex gap-2 pt-4 border-t">
            <LikeButton
              targetType="document"
              targetId={parseInt(document.id)}
              initialCount={document.stats.likes}
              showCount
            />
            <BookmarkButton
              documentId={parseInt(document.id)}
              showLabel
            />
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              공유
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* 유료 문서 구매 필요 */}
          {!canViewContent && (
            <div className="flex flex-col items-center justify-center py-16 px-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border-2 border-dashed border-purple-300">
              <Lock className="h-16 w-16 text-purple-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">유료 콘텐츠</h3>
              <p className="text-gray-600 mb-6 text-center">
                이 문서는 <span className="font-bold text-purple-600">{document.pricePi}π</span>로 구매할 수 있습니다.
              </p>
              <Button
                onClick={handlePurchase}
                disabled={purchasing || checkingPurchase}
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-bold"
              >
                {purchasing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    구매 중...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    {document.pricePi}π로 구매하기
                  </>
                )}
              </Button>
              <p className="text-xs text-gray-500 mt-4">
                구매 후 언제든지 열람할 수 있습니다
              </p>
            </div>
          )}

          {/* 문서 내용 (무료 or 구매 완료 시) */}
          {canViewContent && (
            <div className="prose max-w-none">
              <div 
                className="text-base leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: document.content }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* 댓글 섹션 */}
      <Card>
        <CardContent className="pt-6">
          <CommentSection
            documentId={parseInt(document.id)}
            currentUserId={currentUser?.uid}
          />
        </CardContent>
      </Card>
    </div>
  );
}
