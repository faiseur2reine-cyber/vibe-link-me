import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CreatorPage } from '@/hooks/useCreatorPages';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { toast } from '@/hooks/use-toast';
import { Clock, Flame, Users, MapPin, Zap, Eye } from 'lucide-react';

export interface UrgencyConfig {
  banner: {
    enabled: boolean;
    text: string;
    ctaText: string;
    ctaLink: string;
    bgColor: string;
    textColor: string;
    ctaBgColor: string;
    ctaTextColor: string;
    position: 'top' | 'bottom';
    showCountdown: boolean;
    countdownMinutes: number;
    emoji: string;
  };
  scarcity: {
    enabled: boolean;
    spotsEnabled: boolean;
    spotsInitial: number;
    spotsText: string;
    liveViewersEnabled: boolean;
    liveViewersText: string;
    locationToastEnabled: boolean;
    position: 'above-links' | 'below-bio' | 'bottom';
  };
  abTest?: {
    enabled: boolean;
    splitPercent: number; // % shown variant A (with widgets)
  };
}

export const defaultUrgencyConfig: UrgencyConfig = {
  banner: {
    enabled: false,
    text: '🔥 Offre limitée — Plus que quelques places !',
    ctaText: "J'en profite",
    ctaLink: '',
    bgColor: '#dc2626',
    textColor: '#ffffff',
    ctaBgColor: '#ffffff',
    ctaTextColor: '#dc2626',
    position: 'top',
    showCountdown: true,
    countdownMinutes: 15,
    emoji: '⚡',
  },
  scarcity: {
    enabled: false,
    spotsEnabled: true,
    spotsInitial: 7,
    spotsText: 'Plus que {{count}} places',
    liveViewersEnabled: true,
    liveViewersText: '{{count}} personnes en ligne',
    locationToastEnabled: true,
    position: 'below-bio',
  },
};

interface Props {
  page: CreatorPage;
  onUpdate: (updates: Partial<CreatorPage>) => Promise<{ error: any }>;
}

const UrgencyEditor = ({ page, onUpdate }: Props) => {
  const { t } = useTranslation();
  const existing = (page as any).urgency_config as UrgencyConfig | null;
  const [config, setConfig] = useState<UrgencyConfig>(existing || defaultUrgencyConfig);
  const [saving, setSaving] = useState(false);

  const updateBanner = (updates: Partial<UrgencyConfig['banner']>) => {
    setConfig(c => ({ ...c, banner: { ...c.banner, ...updates } }));
  };
  const updateScarcity = (updates: Partial<UrgencyConfig['scarcity']>) => {
    setConfig(c => ({ ...c, scarcity: { ...c.scarcity, ...updates } }));
  };
  const updateAbTest = (updates: Partial<NonNullable<UrgencyConfig['abTest']>>) => {
    setConfig(c => ({ ...c, abTest: { enabled: false, splitPercent: 50, ...c.abTest, ...updates } }));
  };

  const handleSave = async () => {
    setSaving(true);
    const result = await onUpdate({ urgency_config: config } as any);
    setSaving(false);
    if (!result.error) {
      toast({ title: 'Widgets d\'urgence sauvegardés !' });
    } else {
      toast({ title: 'Erreur', description: result.error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-8">
      {/* === BANNER === */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-destructive" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-foreground">Bandeau urgence</h3>
              <p className="text-xs text-muted-foreground">Sticky avec countdown + CTA</p>
            </div>
          </div>
          <Switch checked={config.banner.enabled} onCheckedChange={(v) => updateBanner({ enabled: v })} />
        </div>

        {config.banner.enabled && (
          <div className="space-y-4 pl-10 border-l-2 border-destructive/20">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Texte</Label>
                <Input value={config.banner.text} onChange={e => updateBanner({ text: e.target.value })} className="text-xs h-8" />
              </div>
              <div>
                <Label className="text-xs">Emoji</Label>
                <Input value={config.banner.emoji} onChange={e => updateBanner({ emoji: e.target.value })} className="text-xs h-8" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Texte CTA</Label>
                <Input value={config.banner.ctaText} onChange={e => updateBanner({ ctaText: e.target.value })} className="text-xs h-8" />
              </div>
              <div>
                <Label className="text-xs">Lien CTA (vide = premier lien)</Label>
                <Input value={config.banner.ctaLink} onChange={e => updateBanner({ ctaLink: e.target.value })} className="text-xs h-8" placeholder="https://..." />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Couleur fond</Label>
                <div className="flex items-center gap-2">
                  <input type="color" value={config.banner.bgColor} onChange={e => updateBanner({ bgColor: e.target.value })} className="w-8 h-8 rounded cursor-pointer border-0" />
                  <Input value={config.banner.bgColor} onChange={e => updateBanner({ bgColor: e.target.value })} className="text-xs h-8 font-mono" />
                </div>
              </div>
              <div>
                <Label className="text-xs">Couleur texte</Label>
                <div className="flex items-center gap-2">
                  <input type="color" value={config.banner.textColor} onChange={e => updateBanner({ textColor: e.target.value })} className="w-8 h-8 rounded cursor-pointer border-0" />
                  <Input value={config.banner.textColor} onChange={e => updateBanner({ textColor: e.target.value })} className="text-xs h-8 font-mono" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Couleur bouton CTA</Label>
                <div className="flex items-center gap-2">
                  <input type="color" value={config.banner.ctaBgColor} onChange={e => updateBanner({ ctaBgColor: e.target.value })} className="w-8 h-8 rounded cursor-pointer border-0" />
                  <Input value={config.banner.ctaBgColor} onChange={e => updateBanner({ ctaBgColor: e.target.value })} className="text-xs h-8 font-mono" />
                </div>
              </div>
              <div>
                <Label className="text-xs">Couleur texte CTA</Label>
                <div className="flex items-center gap-2">
                  <input type="color" value={config.banner.ctaTextColor} onChange={e => updateBanner({ ctaTextColor: e.target.value })} className="w-8 h-8 rounded cursor-pointer border-0" />
                  <Input value={config.banner.ctaTextColor} onChange={e => updateBanner({ ctaTextColor: e.target.value })} className="text-xs h-8 font-mono" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Position</Label>
                <Select value={config.banner.position} onValueChange={(v: 'top' | 'bottom') => updateBanner({ position: v })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top">Haut de page</SelectItem>
                    <SelectItem value="bottom">Bas de page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 pt-5">
                <Switch checked={config.banner.showCountdown} onCheckedChange={v => updateBanner({ showCountdown: v })} />
                <Label className="text-xs">Afficher countdown</Label>
              </div>
            </div>

            {config.banner.showCountdown && (
              <div>
                <Label className="text-xs">Durée countdown (minutes) : {config.banner.countdownMinutes}</Label>
                <Slider
                  value={[config.banner.countdownMinutes]}
                  onValueChange={([v]) => updateBanner({ countdownMinutes: v })}
                  min={1} max={120} step={1}
                  className="mt-2"
                />
              </div>
            )}

            {/* Preview */}
            <div className="rounded-lg overflow-hidden">
              <div className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium"
                style={{ backgroundColor: config.banner.bgColor, color: config.banner.textColor }}>
                <span>{config.banner.emoji}</span>
                <span className="truncate">{config.banner.text}</span>
                {config.banner.showCountdown && (
                  <span className="font-mono rounded px-1.5 py-0.5 text-[10px]" style={{ backgroundColor: `${config.banner.textColor}20` }}>
                    {String(config.banner.countdownMinutes).padStart(2, '0')}:00
                  </span>
                )}
                <span className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                  style={{ backgroundColor: config.banner.ctaBgColor, color: config.banner.ctaTextColor }}>
                  {config.banner.ctaText}
                </span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* === SCARCITY WIDGETS === */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Flame className="w-4 h-4 text-orange-500" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-foreground">Widgets de rareté</h3>
              <p className="text-xs text-muted-foreground">Places restantes, viewers, toasts</p>
            </div>
          </div>
          <Switch checked={config.scarcity.enabled} onCheckedChange={(v) => updateScarcity({ enabled: v })} />
        </div>

        {config.scarcity.enabled && (
          <div className="space-y-4 pl-10 border-l-2 border-orange-500/20">
            <div>
              <Label className="text-xs">Emplacement</Label>
              <Select value={config.scarcity.position} onValueChange={(v: any) => updateScarcity({ position: v })}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="below-bio">Sous la bio</SelectItem>
                  <SelectItem value="above-links">Au-dessus des liens</SelectItem>
                  <SelectItem value="bottom">En bas de page</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Spots */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                <div>
                  <p className="text-xs font-medium text-foreground">Places restantes</p>
                  <p className="text-[10px] text-muted-foreground">Compteur qui diminue</p>
                </div>
              </div>
              <Switch checked={config.scarcity.spotsEnabled} onCheckedChange={v => updateScarcity({ spotsEnabled: v })} />
            </div>
            {config.scarcity.spotsEnabled && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Nombre initial</Label>
                  <Input type="number" value={config.scarcity.spotsInitial} onChange={e => updateScarcity({ spotsInitial: parseInt(e.target.value) || 5 })} className="text-xs h-8" />
                </div>
                <div>
                  <Label className="text-xs">Texte</Label>
                  <Input value={config.scarcity.spotsText} onChange={e => updateScarcity({ spotsText: e.target.value })} className="text-xs h-8" />
                </div>
              </div>
            )}

            {/* Live viewers */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-xs font-medium text-foreground">Personnes en ligne</p>
                  <p className="text-[10px] text-muted-foreground">Compteur live simulé</p>
                </div>
              </div>
              <Switch checked={config.scarcity.liveViewersEnabled} onCheckedChange={v => updateScarcity({ liveViewersEnabled: v })} />
            </div>
            {config.scarcity.liveViewersEnabled && (
              <div>
                <Label className="text-xs">Texte</Label>
                <Input value={config.scarcity.liveViewersText} onChange={e => updateScarcity({ liveViewersText: e.target.value })} className="text-xs h-8" />
              </div>
            )}

            {/* Location toast */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-xs font-medium text-foreground">Toasts de localisation</p>
                  <p className="text-[10px] text-muted-foreground">"Lucas 🇫🇷 vient de cliquer"</p>
                </div>
              </div>
              <Switch checked={config.scarcity.locationToastEnabled} onCheckedChange={v => updateScarcity({ locationToastEnabled: v })} />
            </div>
          </div>
        )}
      </section>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? 'Sauvegarde...' : 'Sauvegarder les widgets'}
      </Button>
    </div>
  );
};

export default UrgencyEditor;
