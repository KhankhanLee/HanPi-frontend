import { Home, FileText, Users, TrendingUp, BookOpen, Tag, Settings, Coins } from "lucide-react";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { usePi } from "../contexts/PiContext";

interface TrendingTopic {
  name: string;
  count: number;
}

interface TopContributor {
  name: string;
  avatar: string;
  points: number;
}

interface WeeklyEarnings {
  total: number;
  breakdown: {
    views: number;
    likes: number;
    comments: number;
  };
  period: string;
}

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { user } = usePi();
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [topContributors, setTopContributors] = useState<TopContributor[]>([]);
  const [weeklyEarnings, setWeeklyEarnings] = useState<number>(0);
  const [isLoadingEarnings, setIsLoadingEarnings] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Trending Topics 가져오기
        const topicsResponse = await api.getTrendingTopics();
        if (topicsResponse.data.success) {
          setTrendingTopics(topicsResponse.data.data);
        }

        // Top Contributors 가져오기
        const contributorsResponse = await api.getTopContributors();
        if (contributorsResponse.data.success) {
          setTopContributors(contributorsResponse.data.data);
        }
      } catch (error) {
        console.error('사이드바 데이터 로드 실패:', error);
      }
    };

    fetchData();
  }, []);

  // 주간 수익 가져오기 (로그인 시에만)
  useEffect(() => {
    const fetchWeeklyEarnings = async () => {
      if (!user) {
        setWeeklyEarnings(0);
        return;
      }

      setIsLoadingEarnings(true);
      try {
        const response = await api.getWeeklyEarnings();
        if (response.data.success) {
          setWeeklyEarnings(response.data.data.total);
        }
      } catch (error) {
        console.error('주간 수익 로드 실패:', error);
        setWeeklyEarnings(0);
      } finally {
        setIsLoadingEarnings(false);
      }
    };

    fetchWeeklyEarnings();
  }, [user]);

  const navigationItems = [
    { icon: Home, label: t.nav.home, badge: null, path: "/" },
    { icon: FileText, label: t.nav.myDocs, badge: null , path: "/my-docs" },
    { icon: Users, label: t.nav.community, badge: null , path: "/community" },
    { icon: TrendingUp, label: t.nav.trending, badge: null, path: "/trending" },
    { icon: BookOpen, label: t.nav.library, badge: null, path: "/library" },
    { icon: Tag, label: t.nav.tags, badge: null, path: "/tags" },
  ];

  return (
  <aside className="h-full border-r bg-muted/30 p-4 space-y-6">
      {/* Navigation */}
      <nav className="space-y-2">
        {navigationItems.map((item) => (
          <Button
            key={item.label}
            variant={location.pathname === item.path ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => navigate(item.path)}
          >
            <item.icon className="h-4 w-4 mr-3" />
            {item.label}
            {item.badge && (
              <Badge variant="secondary" className="ml-auto">
                {item.badge}
              </Badge>
            )}
          </Button>
        ))}
      </nav>

      <Separator />

      {/* Pi Earnings */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 p-4 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Coins className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          <span className="font-medium">{t.home.weeklyEarnings}</span>
        </div>
        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
          {isLoadingEarnings ? (
            <span className="animate-pulse">...</span>
          ) : user ? (
            `+${weeklyEarnings.toFixed(1)} π`
          ) : (
            <span className="text-base text-muted-foreground">로그인 필요</span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{t.home.earnedFromDocs}</p>
      </div>

      <Separator />

      {/* Trending Topics */}
      <div>
        <h3 className="font-medium mb-3">{t.home.trendingTopics}</h3>
        <div className="space-y-2">
          {trendingTopics.length > 0 ? (
            trendingTopics.map((topic) => (
              <div key={topic.name} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{topic.name}</span>
                <Badge variant="outline" className="text-xs">
                  {topic.count}
                </Badge>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">최근 인기 토픽이 없습니다</p>
          )}
        </div>
      </div>

      <Separator />

      {/* Top Contributors */}
      <div>
        <h3 className="font-medium mb-3">{t.home.topContributors}</h3>
        <div className="space-y-3">
          {topContributors.length > 0 ? (
            topContributors.map((contributor, index) => (
              <div key={contributor.name} className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 flex-1">
                  <span className="w-4 text-xs text-muted-foreground">#{index + 1}</span>
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={contributor.avatar} />
                    <AvatarFallback className="text-xs">
                      {contributor.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{contributor.name}</span>
                </div>
                <span className="text-xs text-purple-600 font-medium">
                  {contributor.points}π
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">최근 활동 기여자가 없습니다</p>
          )}
        </div>
      </div>

      <Separator />

      {/* Settings */}
      <Button 
        variant={location.pathname === "/settings" ? "secondary" : "ghost"} 
        className="w-full justify-start"
        onClick={() => navigate("/settings")}
      >
        <Settings className="h-4 w-4 mr-3" />
        {t.nav.settings}
      </Button>
    </aside>
  );
}