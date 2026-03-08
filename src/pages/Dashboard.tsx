import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile, useLinks } from '@/hooks/useDashboard';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProfileEditor from '@/components/dashboard/ProfileEditor';
import LinksManager from '@/components/dashboard/LinksManager';
import LinkPreview from '@/components/dashboard/LinkPreview';
import LanguageSelector from '@/components/LanguageSelector';
import { LogOut, User, Link2, Eye, ExternalLink } from 'lucide-react';

const Dashboard = () => {
  const { t } = useTranslation();
  const { user, loading: authLoading, signOut } = useAuth();
  const { profile, loading: profileLoading, updateProfile, refetch: refetchProfile } = useProfile();
  const { links, loading: linksLoading, addLink, updateLink, deleteLink, reorderLinks } = useLinks();
  const [activeTab, setActiveTab] = useState('links');

  if (authLoading || profileLoading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">{t('common.loading')}</div>;
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (!profile) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">{t('common.error')}</div>;

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="flex items-center justify-between px-4 md:px-6 py-4 max-w-7xl mx-auto border-b border-border">
        <Link to="/" className="font-display text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          MyTaptap
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-full gap-1" asChild>
            <a href={`/${profile.username}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-3 h-3" /> {t('dashboard.preview')}
            </a>
          </Button>
          <LanguageSelector />
          <Button variant="ghost" size="sm" onClick={signOut} className="gap-1">
            <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">{t('nav.logout')}</span>
          </Button>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6 bg-muted rounded-full p-1">
                <TabsTrigger value="links" className="rounded-full gap-1 data-[state=active]:bg-background">
                  <Link2 className="w-4 h-4" /> {t('dashboard.links')}
                </TabsTrigger>
                <TabsTrigger value="profile" className="rounded-full gap-1 data-[state=active]:bg-background">
                  <User className="w-4 h-4" /> {t('dashboard.profile')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="links">
                <Card>
                  <CardContent className="p-4 md:p-6">
                    <LinksManager
                      links={links}
                      plan={profile.plan}
                      onAdd={addLink}
                      onUpdate={updateLink}
                      onDelete={deleteLink}
                      onReorder={reorderLinks}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-display">{t('dashboard.profile')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProfileEditor profile={profile} onUpdate={updateProfile} onRefetch={refetchProfile} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Preview Sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-6">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">{t('dashboard.preview')}</span>
              </div>
              <LinkPreview profile={profile} links={links} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
