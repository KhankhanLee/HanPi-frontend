import { useState, useEffect } from "react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Send,
  Download,
  Clock,
  Check,
  X,
  ArrowUpRight,
  ArrowDownLeft,
  History,
  RefreshCw,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { api } from "../lib/api";
import type { WalletInfo, Transaction } from "../types";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  
  return date.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric'
  });
};

const getTransactionIcon = (type: Transaction['type']) => {
  switch (type) {
    case 'earn':
      return <TrendingUp className="h-5 w-5 text-green-500" />;
    case 'spend':
      return <TrendingDown className="h-5 w-5 text-red-500" />;
    case 'receive':
      return <ArrowDownLeft className="h-5 w-5 text-blue-500" />;
    case 'send':
      return <ArrowUpRight className="h-5 w-5 text-orange-500" />;
    default:
      return <Wallet className="h-5 w-5 text-gray-500" />;
  }
};

const getStatusBadge = (status: Transaction['status']) => {
  switch (status) {
    case 'completed':
      return <Badge className="bg-green-500"><Check className="h-3 w-3 mr-1" /> 완료</Badge>;
    case 'pending':
      return <Badge className="bg-yellow-500"><Clock className="h-3 w-3 mr-1" /> 대기중</Badge>;
    case 'failed':
      return <Badge className="bg-red-500"><X className="h-3 w-3 mr-1" /> 실패</Badge>;
    default:
      return null;
  }
};

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const [walletInfo, setWalletInfo] = useState<WalletInfo>({
    balance: 0,
    totalEarned: 0,
    totalSpent: 0,
    pendingAmount: 0,
    transactions: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // 송금 폼 상태
  const [sendAmount, setSendAmount] = useState('');
  const [sendTo, setSendTo] = useState('');
  const [sendNote, setSendNote] = useState('');

  const fetchWalletInfo = async () => {
    try {
      setIsLoading(true);
      console.log('지갑 정보 API 호출 시작...');
      const response = await api.getWalletInfo();
      console.log('지갑 정보 API 응답:', response.data);
      setWalletInfo(response.data);
    } catch (error) {
      console.error('지갑 정보를 가져오는데 실패했습니다:', error);
      // 에러 시 빈 데이터 유지
    } finally {
      setIsLoading(false);
    }
  };

  const refreshWallet = async () => {
    setIsRefreshing(true);
    await fetchWalletInfo();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  useEffect(() => {
    if (isOpen) {
      fetchWalletInfo();
    }
  }, [isOpen]);

  const handleSendPi = async () => {
    if (!sendAmount || !sendTo) {
      alert('수신자와 금액을 입력해주세요.');
      return;
    }

    const amount = parseFloat(sendAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('올바른 금액을 입력해주세요.');
      return;
    }

    if (amount > walletInfo.balance) {
      alert('잔액이 부족합니다.');
      return;
    }

    try {
      // 실제 API 호출
      // await api.sendPi({ to: sendTo, amount, note: sendNote });
      
      alert(`${sendTo}님에게 ${amount}π를 송금했습니다.`);
      setSendAmount('');
      setSendTo('');
      setSendNote('');
      setActiveTab('overview');
      refreshWallet();
    } catch (error) {
      console.error('송금 실패:', error);
      alert('송금에 실패했습니다.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0 gap-0 overflow-hidden flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle>Pi 지갑</DialogTitle>
                <DialogDescription>
                  Pi Network 디지털 지갑
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={refreshWallet}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-6 mt-4 grid w-[calc(100%-3rem)] grid-cols-3">
            <TabsTrigger value="overview">개요</TabsTrigger>
            <TabsTrigger value="history">거래 내역</TabsTrigger>
            <TabsTrigger value="send">송금</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 px-6">
            <TabsContent value="overview" className="mt-4 pb-6 space-y-4">{isLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                {/* 잔액 카드 */}
                <Card className="bg-gradient-to-br from-purple-500 to-blue-600 text-white border-0 shadow-lg">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-white/80">현재 잔액</span>
                      <Wallet className="h-5 w-5 text-white/80" />
                    </div>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-4xl font-bold">{walletInfo.balance.toFixed(1)}</span>
                      <span className="text-2xl">π</span>
                    </div>
                    {walletInfo.pendingAmount > 0 && (
                      <p className="text-sm text-white/70 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        대기 중: {walletInfo.pendingAmount.toFixed(1)}π
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* 통계 - 컴팩트하게 */}
                <div className="grid grid-cols-2 gap-3">
                  <Card className="border shadow-sm">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="text-xs text-muted-foreground">총 수익</span>
                      </div>
                      <div className="text-xl font-bold text-green-600">
                        +{walletInfo.totalEarned.toFixed(1)}π
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border shadow-sm">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        </div>
                        <span className="text-xs text-muted-foreground">총 지출</span>
                      </div>
                      <div className="text-xl font-bold text-red-600">
                        -{walletInfo.totalSpent.toFixed(1)}π
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 최근 거래 - 리스트 형태로 정돈 */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <History className="h-4 w-4" />
                      최근 거래
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => setActiveTab('history')}
                    >
                      전체보기
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {walletInfo.transactions.slice(0, 5).map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {transaction.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatTimeAgo(transaction.timestamp)}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className={`text-sm font-bold ${
                            transaction.type === 'earn' || transaction.type === 'receive'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}>
                            {transaction.type === 'earn' || transaction.type === 'receive' ? '+' : '-'}
                            {transaction.amount.toFixed(1)}π
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
            </TabsContent>

            <TabsContent value="history" className="mt-4 pb-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold">전체 거래 내역</h3>
                  <Badge variant="outline">{walletInfo.transactions.length}건</Badge>
                </div>
                {walletInfo.transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    {transaction.relatedUser ? (
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage src={transaction.relatedUser.avatar} />
                        <AvatarFallback>
                          {transaction.relatedUser.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        {getTransactionIcon(transaction.type)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {transaction.description}
                      </p>
                      {transaction.relatedUser && (
                        <p className="text-xs text-muted-foreground">
                          @{transaction.relatedUser.username}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-muted-foreground">
                          {formatTimeAgo(transaction.timestamp)}
                        </p>
                        {getStatusBadge(transaction.status)}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm font-bold ${
                        transaction.type === 'earn' || transaction.type === 'receive'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {transaction.type === 'earn' || transaction.type === 'receive' ? '+' : '-'}
                        {transaction.amount.toFixed(1)}π
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="send" className="mt-4 pb-6">
              <div className="space-y-4">
                <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">사용 가능한 잔액</p>
                        <p className="text-2xl font-bold text-purple-600">{walletInfo.balance.toFixed(1)}π</p>
                      </div>
                      <Wallet className="h-8 w-8 text-purple-400" />
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="sendTo" className="text-sm font-medium">
                      수신자
                    </Label>
                    <Input
                      id="sendTo"
                      placeholder="@username 또는 Pi 주소"
                      value={sendTo}
                      onChange={(e) => setSendTo(e.target.value)}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sendAmount" className="text-sm font-medium">
                      송금 금액
                    </Label>
                    <div className="relative">
                      <Input
                        id="sendAmount"
                        type="number"
                        placeholder="0.0"
                        value={sendAmount}
                        onChange={(e) => setSendAmount(e.target.value)}
                        min="0"
                        step="0.1"
                        className="h-11 pr-8"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        π
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sendNote" className="text-sm font-medium">
                      메모 <span className="text-xs text-muted-foreground">(선택사항)</span>
                    </Label>
                    <Input
                      id="sendNote"
                      placeholder="송금 메모"
                      value={sendNote}
                      onChange={(e) => setSendNote(e.target.value)}
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 h-11"
                    onClick={() => {
                      setSendAmount('');
                      setSendTo('');
                      setSendNote('');
                    }}
                  >
                    취소
                  </Button>
                  <Button
                    className="flex-1 h-11 gap-2 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
                    onClick={handleSendPi}
                    disabled={!sendAmount || !sendTo}
                  >
                    <Send className="h-4 w-4" />
                    송금하기
                  </Button>
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}