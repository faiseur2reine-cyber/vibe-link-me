import { useState, useEffect } from 'react';
import { CreatorPage } from '@/hooks/useCreatorPages';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { BarChart3, Facebook, Hash, Music } from 'lucide-react';

interface TrackingEditorProps {
  page: CreatorPage;
  onUpdate: (updates: Partial<CreatorPage>) => Promise<{ error: any }>;
}

const TrackingEditor = ({ page, onUpdate }: TrackingEditorProps) => {
  const [metaPixel, setMetaPixel] = useState(page.tracking_meta_pixel || '');
  const [ga4, setGa4] = useState(page.tracking_ga4 || '');
  const [tiktokPixel, setTiktokPixel] = useState(page.tracking_tiktok_pixel || '');
  const [utmSource, setUtmSource] = useState(page.utm_source || 'instagram');
  const [utmMedium, setUtmMedium] = useState(page.utm_medium || 'bio');
  const [utmCampaign, setUtmCampaign] = useState(page.utm_campaign || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setMetaPixel(page.tracking_meta_pixel || '');
    setGa4(page.tracking_ga4 || '');
    setTiktokPixel(page.tracking_tiktok_pixel || '');
    setUtmSource(page.utm_source || 'instagram');
    setUtmMedium(page.utm_medium || 'bio');
    setUtmCampaign(page.utm_campaign || '');
  }, [page.id, page.tracking_meta_pixel, page.tracking_ga4, page.tracking_tiktok_pixel, page.utm_source, page.utm_medium, page.utm_campaign]);

  const handleSave = async () => {
    setSaving(true);
    const result = await onUpdate({
      tracking_meta_pixel: metaPixel,
      tracking_ga4: ga4,
      tracking_tiktok_pixel: tiktokPixel,
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
    });
    setSaving(false);
    if (!result.error) toast.success('Tracking sauvegardé');
    else toast.error(result.error.message);
  };

  return (
    <div className="space-y-6">
      {/* Pixels */}
      <div className="space-y-4">
        <h4 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Pixels de tracking</h4>

        <div className="space-y-2">
          <Label className="text-[12px] flex items-center gap-1.5">
            <Facebook className="w-3.5 h-3.5 text-blue-500" /> Meta Pixel ID
          </Label>
          <Input
            value={metaPixel}
            onChange={e => setMetaPixel(e.target.value)}
            placeholder="123456789012345"
            className="h-8 text-[12px]"
          />
          <p className="text-[10px] text-muted-foreground">Votre ID de pixel Meta/Facebook pour le suivi des conversions.</p>
        </div>

        <div className="space-y-2">
          <Label className="text-[12px] flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-orange-500" /> Google Analytics 4 (Measurement ID)
          </Label>
          <Input
            value={ga4}
            onChange={e => setGa4(e.target.value)}
            placeholder="G-XXXXXXXXXX"
            className="h-8 text-[12px]"
          />
          <p className="text-[10px] text-muted-foreground">ID de mesure GA4 pour le suivi du trafic.</p>
        </div>

        <div className="space-y-2">
          <Label className="text-[12px] flex items-center gap-1.5">
            <Music className="w-3.5 h-3.5" /> TikTok Pixel ID
          </Label>
          <Input
            value={tiktokPixel}
            onChange={e => setTiktokPixel(e.target.value)}
            placeholder="CXXXXXXXXXXXXXXXXX"
            className="h-8 text-[12px]"
          />
          <p className="text-[10px] text-muted-foreground">Pixel TikTok pour le suivi des événements.</p>
        </div>
      </div>

      {/* UTM */}
      <div className="space-y-4">
        <h4 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Paramètres UTM</h4>
        <p className="text-[10px] text-muted-foreground">Ces paramètres seront automatiquement ajoutés aux liens sortants.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label className="text-[11px]">utm_source</Label>
            <Input value={utmSource} onChange={e => setUtmSource(e.target.value)} placeholder="instagram" className="h-8 text-[12px]" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px]">utm_medium</Label>
            <Input value={utmMedium} onChange={e => setUtmMedium(e.target.value)} placeholder="bio" className="h-8 text-[12px]" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px]">utm_campaign</Label>
            <Input value={utmCampaign} onChange={e => setUtmCampaign(e.target.value)} placeholder="summer2025" className="h-8 text-[12px]" />
          </div>
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving} size="sm" className="h-8 text-[12px]">
        {saving ? 'Sauvegarde…' : 'Sauvegarder le tracking'}
      </Button>
    </div>
  );
};

export default TrackingEditor;
