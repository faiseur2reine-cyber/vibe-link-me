import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TapLoader as Loader2, TapUser as User, TapCalendar as Calendar } from '@/components/icons/TapIcons';
import { Mail, Upload } from 'lucide-react';

const DashboardProfile = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    username: '',
    display_name: '',
    bio: '',
    avatar_url: '',
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('username, display_name, bio, avatar_url')
      .eq('user_id', user!.id)
      .single();

    if (data) {
      setProfile({
        username: data.username || '',
        display_name: data.display_name || '',
        bio: data.bio || '',
        avatar_url: data.avatar_url || '',
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: profile.display_name,
        bio: profile.bio,
      })
      .eq('user_id', user!.id);

    if (error) {
      toast.error(t('common.error'));
    } else {
      toast.success(t('profile.updated'));
    }
    setSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop();
    const filePath = `${user!.id}/${Math.random()}.${fileExt}`;

    setSaving(true);
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast.error(t('common.error'));
      setSaving(false);
      return;
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    const avatarUrl = data.publicUrl;

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl })
      .eq('user_id', user!.id);

    if (updateError) {
      toast.error(t('common.error'));
    } else {
      setProfile({ ...profile, avatar_url: avatarUrl });
      toast.success(t('profile.avatarUpdated') );
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-3xl w-full mx-auto px-5 sm:px-8 py-8 sm:py-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">{t('profile.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('profile.subtitle')}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('profile.personalInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback className="text-lg">
                  {profile.display_name?.[0]?.toUpperCase() || profile.username?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <Label htmlFor="avatar" className="cursor-pointer">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background hover:bg-accent transition-colors">
                    <Upload className="w-4 h-4" />
                    <span className="text-sm">{t('profile.changeAvatar')}</span>
                  </div>
                </Label>
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                Email
              </Label>
              <Input value={user?.email || ''} disabled className="bg-muted/50" />
              <p className="text-xs text-muted-foreground">{t('profile.emailReadonly')}</p>
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                {t('auth.username')}
              </Label>
              <Input value={profile.username} disabled className="bg-muted/50" />
              <p className="text-xs text-muted-foreground">{t('profile.usernameReadonly')}</p>
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="display_name">{t('auth.displayName')}</Label>
              <Input
                id="display_name"
                value={profile.display_name}
                onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                placeholder={t('profile.displayNamePlaceholder')}
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">{t('dashboard.bio')}</Label>
              <textarea
                id="bio"
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder={t('profile.bioPlaceholder')}
                className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            {/* Created At */}
            {user?.created_at && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  {t('profile.memberSince')}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {new Date(user.created_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            )}

            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {t('profile.saveChanges')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardProfile;
