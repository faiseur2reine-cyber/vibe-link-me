import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CreatorPage, SocialLink } from '@/hooks/useCreatorPages';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Camera, Loader2, ImagePlus, Plus, Trash2, ShieldAlert } from 'lucide-react';

const SOCIAL_PLATFORMS = ['instagram', 'tiktok', 'twitter', 'youtube', 'spotify', 'linkedin', 'github', 'facebook', 'twitch', 'discord', 'snapchat', 'whatsapp', 'telegram', 'website'];

interface PageProfileEditorProps {
  page: CreatorPage;
  onUpdate: (updates: Partial<CreatorPage>) => Promise<{ error: any }>;
  onRefetch: () => void;
}

const PageProfileEditor = ({ page, onUpdate, onRefetch }: PageProfileEditorProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const [displayName, setDisplayName] = useState(page.display_name || '');
  const [bio, setBio] = useState(page.bio || '');
  const [isNsfw, setIsNsfw] = useState(page.is_nsfw || false);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(page.social_links || []);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${user.id}/pages/${page.id}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    if (uploadError) { toast.error(uploadError.message); setUploading(false); return; }
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    await onUpdate({ avatar_url: `${data.publicUrl}?t=${Date.now()}` });
    onRefetch();
    setUploading(false);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingCover(true);
    const ext = file.name.split('.').pop();
    const path = `${user.id}/pages/${page.id}/cover.${ext}`;
    const { error: uploadError } = await supabase.storage.from('media').upload(path, file, { upsert: true });
    if (uploadError) { toast.error(uploadError.message); setUploadingCover(false); return; }
    const { data } = supabase.storage.from('media').getPublicUrl(path);
    await onUpdate({ cover_url: `${data.publicUrl}?t=${Date.now()}` });
    onRefetch();
    setUploadingCover(false);
  };

  const addSocialLink = () => setSocialLinks([...socialLinks, { platform: 'instagram', url: '' }]);
  const updateSocialLink = (index: number, field: keyof SocialLink, value: string) => {
    const updated = [...socialLinks];
    updated[index] = { ...updated[index], [field]: value };
    setSocialLinks(updated);
  };
  const removeSocialLink = (index: number) => setSocialLinks(socialLinks.filter((_, i) => i !== index));

  const handleSave = async () => {
    setSaving(true);
    const validSocials = socialLinks.filter(s => s.url.trim());
    const result = await onUpdate({
      display_name: displayName,
      bio,
      is_nsfw: isNsfw,
      social_links: validSocials,
    });
    if (result?.error) {
      toast.error(result.error.message);
    } else {
      toast.success(t('common.success') );
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Cover Photo */}
      <div className="space-y-2">
        <Label>Cover Photo</Label>
        <div
          className="relative w-full h-32 rounded-2xl overflow-hidden bg-muted cursor-pointer group"
          onClick={() => coverRef.current?.click()}
        >
          {page.cover_url ? (
            <img src={page.cover_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <ImagePlus className="w-6 h-6" />
            </div>
          )}
          {/* Crop guide overlay — shows safe zone for immersive hero */}
          {page.theme === 'immersive' && page.cover_url && (
            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute inset-x-0 bottom-0 h-[35%] bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 h-[35%] flex items-end justify-center pb-1">
                <span className="text-[9px] text-white/70 font-medium">← zone gradient + texte →</span>
              </div>
              <div className="absolute left-2 top-2 text-[9px] text-white/60 bg-black/40 px-1.5 py-0.5 rounded">9:16</div>
            </div>
          )}
          <div className="absolute inset-0 bg-foreground/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            {uploadingCover ? <Loader2 className="w-6 h-6 text-primary-foreground animate-spin" /> : <Camera className="w-6 h-6 text-primary-foreground" />}
          </div>
          <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
        </div>
        {page.theme === 'immersive' && (
          <p className="text-[10px] text-muted-foreground">
            🎯 Format portrait 9:16 recommandé. Le visage doit être dans le tiers supérieur — le tiers inférieur sera couvert par le gradient + nom.
          </p>
        )}
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
          <div className="w-20 h-20 rounded-full bg-primary overflow-hidden flex items-center justify-center">
            {page.avatar_url ? (
              <img src={page.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-primary-foreground">
                {(page.display_name || page.username)?.[0]?.toUpperCase()}
              </span>
            )}
          </div>
          <div className="absolute inset-0 rounded-full bg-foreground/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            {uploading ? <Loader2 className="w-5 h-5 text-primary-foreground animate-spin" /> : <Camera className="w-5 h-5 text-primary-foreground" />}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
        </div>
        <div>
          <p className="font-semibold text-foreground">{page.display_name || page.username}</p>
          <p className="text-sm text-muted-foreground">@{page.username}</p>
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Nom affiché</Label>
          <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={100} />
        </div>
        <div className="space-y-2">
          <Label>Bio / Description</Label>
          <Textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={300} rows={3} placeholder="Description de cette page..." />
        </div>
      </div>

      {/* Social Links */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Réseaux sociaux</Label>
          <Button variant="ghost" size="sm" onClick={addSocialLink} className="gap-1 text-xs">
            <Plus className="w-3.5 h-3.5" /> Ajouter
          </Button>
        </div>
        {socialLinks.map((link, i) => (
          <div key={i} className="flex items-center gap-2">
            <select
              value={link.platform}
              onChange={(e) => updateSocialLink(i, 'platform', e.target.value)}
              className="h-9 rounded-lg border border-border bg-background px-2 text-sm text-foreground min-w-[110px]"
            >
              {SOCIAL_PLATFORMS.map(p => (
                <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
              ))}
            </select>
            <Input
              value={link.url}
              onChange={(e) => updateSocialLink(i, 'url', e.target.value)}
              placeholder="https://..."
              className="flex-1"
            />
            <Button variant="ghost" size="icon" onClick={() => removeSocialLink(i)} className="shrink-0 text-destructive hover:text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* NSFW */}
      <div className="flex items-center justify-between rounded-2xl border border-border p-4 bg-muted/30">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-orange-500" />
          <div>
            <p className="text-sm font-medium text-foreground">Vérification d'âge (+18)</p>
            <p className="text-xs text-muted-foreground">Les visiteurs doivent confirmer leur âge avant de voir cette page</p>
          </div>
        </div>
        <Switch checked={isNsfw} onCheckedChange={setIsNsfw} />
      </div>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? <Loader2 className="animate-spin" /> : 'Sauvegarder'}
      </Button>
    </div>
  );
};

export default PageProfileEditor;
