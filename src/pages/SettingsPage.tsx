import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Separator } from "../components/ui/separator";
import { Settings, User, Bell, Shield, Palette, Wallet } from "lucide-react";
import { useTheme } from "../components/ThemeProvider";
import { useLanguage } from "../contexts/LanguageContext";

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      marketing: false
    },
    privacy: {
      profilePublic: true,
      showEmail: false,
      showPiEarnings: true
    },
    account: {
      username: "hanpi_dev",
      email: "hanpi@example.com",
      piWallet: "1,247.5π"
    }
  });

  const handleSettingChange = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="h-8 w-8" />
          {t.settings.title}
        </h1>
        <p className="text-muted-foreground mt-2">{t.settings.description}</p>
      </div>

      <div className="space-y-6">
        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t.settings.account.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="username">{t.settings.account.username}</Label>
                <Input
                  id="username"
                  value={settings.account.username}
                  onChange={(e) => handleSettingChange('account', 'username', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="email">{t.settings.account.email}</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.account.email}
                  onChange={(e) => handleSettingChange('account', 'email', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label>{t.settings.account.wallet}</Label>
              <div className="flex items-center gap-2 mt-1">
                <Wallet className="h-4 w-4 text-purple-600" />
                <span className="font-medium">{settings.account.piWallet}</span>
              </div>
            </div>
            <Button className="w-full md:w-auto">{t.settings.account.save}</Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              {t.settings.notifications.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>{t.settings.notifications.email}</Label>
                <p className="text-sm text-muted-foreground">{t.settings.notifications.emailDesc}</p>
              </div>
              <Switch
                checked={settings.notifications.email}
                onCheckedChange={(checked: boolean) => handleSettingChange('notifications', 'email', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>{t.settings.notifications.push}</Label>
                <p className="text-sm text-muted-foreground">{t.settings.notifications.pushDesc}</p>
              </div>
              <Switch
                checked={settings.notifications.push}
                onCheckedChange={(checked: boolean) => handleSettingChange('notifications', 'push', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>{t.settings.notifications.marketing}</Label>
                <p className="text-sm text-muted-foreground">{t.settings.notifications.marketingDesc}</p>
              </div>
              <Switch
                checked={settings.notifications.marketing}
                onCheckedChange={(checked: boolean) => handleSettingChange('notifications', 'marketing', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {t.settings.privacy.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>{t.settings.privacy.publicProfile}</Label>
                <p className="text-sm text-muted-foreground">{t.settings.privacy.publicProfileDesc}</p>
              </div>
              <Switch
                checked={settings.privacy.profilePublic}
                onCheckedChange={(checked: boolean) => handleSettingChange('privacy', 'profilePublic', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>{t.settings.privacy.showEmail}</Label>
                <p className="text-sm text-muted-foreground">{t.settings.privacy.showEmailDesc}</p>
              </div>
              <Switch
                checked={settings.privacy.showEmail}
                onCheckedChange={(checked: boolean) => handleSettingChange('privacy', 'showEmail', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>{t.settings.privacy.showEarnings}</Label>
                <p className="text-sm text-muted-foreground">{t.settings.privacy.showEarningsDesc}</p>
              </div>
              <Switch
                checked={settings.privacy.showPiEarnings}
                onCheckedChange={(checked: boolean) => handleSettingChange('privacy', 'showPiEarnings', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              {t.settings.appearance.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="theme">{t.settings.appearance.theme}</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  {t.settings.appearance.currentTheme}: {theme === 'light' ? t.settings.appearance.themeLight : theme === 'dark' ? t.settings.appearance.themeDark : t.settings.appearance.themeSystem}
                </p>
                <select
                  id="theme"
                  className="w-full p-2 border rounded-md bg-background text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as "light" | "dark" | "system")}
                >
                  <option value="light">☀️ {t.settings.appearance.themeLight}</option>
                  <option value="dark">🌙 {t.settings.appearance.themeDark}</option>
                  <option value="system">💻 {t.settings.appearance.themeSystem}</option>
                </select>
              </div>
              <div>
                <Label htmlFor="language">{t.settings.appearance.language}</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  {t.settings.appearance.languageDesc}
                </p>
                <select
                  id="language"
                  className="w-full p-2 border rounded-md bg-background text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as "ko" | "en")}
                >
                  <option value="ko">🇰🇷 한국어</option>
                  <option value="en">🇺🇸 English</option>
                </select>
              </div>
            </div>
            
            {/* Theme Preview */}
            <div className="mt-4 p-4 border rounded-md bg-muted/50">
              <p className="text-sm font-medium mb-2">{t.settings.appearance.themePreview}</p>
              <div className="flex gap-2">
                <div className="flex-1 p-3 rounded border bg-background">
                  <div className="text-xs text-muted-foreground mb-1">{t.settings.appearance.background}</div>
                  <div className="h-8 rounded bg-card border"></div>
                </div>
                <div className="flex-1 p-3 rounded border bg-background">
                  <div className="text-xs text-muted-foreground mb-1">{t.settings.appearance.text}</div>
                  <div className="text-foreground font-medium">Sample Text</div>
                </div>
                <div className="flex-1 p-3 rounded border bg-background">
                  <div className="text-xs text-muted-foreground mb-1">{t.settings.appearance.accent}</div>
                  <div className="h-8 rounded bg-primary"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
