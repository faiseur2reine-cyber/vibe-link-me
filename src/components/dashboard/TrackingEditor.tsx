import { useState, useEffect } from 'react';
import { CreatorPage } from '@/hooks/useCreatorPages';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { BarChart3, Facebook, Hash, Music, Check } from 'lucide-react';
import { useAutoSave } from '@/hooks/useAutoSave';

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
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setMetaPixel(page.tracking_meta_pixel || '');
    setGa4(page.tracking_ga4 || '');
    setTiktokPixel(page.tracking_tiktok_pixel || '');
    setUtmSource(page.utm_source || 'instagram');
    setUtmMedium(page.utm_medium || 'bio');
    setUtmCampaign(page.utm_campaign || '');
  }, [page.id, page.tracking_meta_pixel, page.tracking_ga4, page.tracking_tiktok_pixel, page.utm_source, page.utm_medium, page.utm_campaign]);

  const triggerSave = useAutoSave(async () => {
    const result = await onUpdate({
      tracking_meta_pixel: metaPixel,
      tracking_ga4: ga4,
      tracking_tiktok_pixel: tiktokPixel,
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
    });
    if (!result.error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      toast.error(result.error.message);
    }
  }, 1500);

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
            onChange={e => { setMetaPixel(e.target.value); triggerSave(); }}
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
            onChange={e => { setGa4(e.target.value); triggerSave(); }}
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
            onChange={e => { setTiktokPixel(e.target.value); triggerSave(); }}
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
            <Input value={utmSource} onChange={e => { setUtmSource(e.target.value); triggerSave(); }} placeholder="instagram" className="h-8 text-[12px]" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px]">utm_medium</Label>
            <Input value={utmMedium} onChange={e => { setUtmMedium(e.target.value); triggerSave(); }} placeholder="bio" className="h-8 text-[12px]" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px]">utm_campaign</Label>
            <Input value={utmCampaign} onChange={e => { setUtmCampaign(e.target.value); triggerSave(); }} placeholder="summer2025" className="h-8 text-[12px]" />
          </div>
        </div>
      </div>

      {/* Auto-save status */}
      {saved && (
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-600">
          <Check className="w-3 h-3" /> Sauvegardé
        </div>
      )}
    </div>
  );
};

export default TrackingEditor;
