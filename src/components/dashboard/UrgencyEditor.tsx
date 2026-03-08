import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CreatorPage } from '@/hooks/useCreatorPages';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, Flame, Users, MapPin, Zap, Eye, Save, Trash2, BookmarkPlus } from 'lucide-react';

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

// Presets
const urgencyPresets: { id: string; label: string; emoji: string; desc: string; config: UrgencyConfig }[] = [
  {
    id: 'flash-sale', label: 'Flash Sale', emoji: '⚡', desc: 'Countdown rouge + places limitées',
    config: {
      banner: { enabled: true, text: '⚡ FLASH SALE — Prix cassé pendant', ctaText: 'Acheter maintenant', ctaLink: '', bgColor: '#dc2626', textColor: '#ffffff', ctaBgColor: '#ffffff', ctaTextColor: '#dc2626', position: 'top', showCountdown: true, countdownMinutes: 30, emoji: '🔥' },
      scarcity: { enabled: true, spotsEnabled: true, spotsInitial: 5, spotsText: 'Plus que {{count}} à ce prix', liveViewersEnabled: true, liveViewersText: '{{count}} personnes regardent', locationToastEnabled: true, position: 'below-bio' },
    },
  },
  {
    id: 'launch', label: 'Lancement', emoji: '🚀', desc: 'Offre early bird + hype',
    config: {
      banner: { enabled: true, text: '🚀 Lancement exclusif — Accès early bird', ctaText: 'Rejoindre', ctaLink: '', bgColor: '#7c3aed', textColor: '#ffffff', ctaBgColor: '#fbbf24', ctaTextColor: '#1e1b4b', position: 'top', showCountdown: true, countdownMinutes: 60, emoji: '🎉' },
      scarcity: { enabled: true, spotsEnabled: true, spotsInitial: 12, spotsText: '{{count}} places early bird restantes', liveViewersEnabled: true, liveViewersText: '{{count}} en attente', locationToastEnabled: true, position: 'above-links' },
    },
  },
  {
    id: 'event', label: 'Événement', emoji: '🎤', desc: 'Countdown event + places limitées',
    config: {
      banner: { enabled: true, text: '🎤 L\'événement commence dans', ctaText: 'Réserver ma place', ctaLink: '', bgColor: '#0ea5e9', textColor: '#ffffff', ctaBgColor: '#ffffff', ctaTextColor: '#0369a1', position: 'top', showCountdown: true, countdownMinutes: 120, emoji: '🎫' },
      scarcity: { enabled: true, spotsEnabled: true, spotsInitial: 8, spotsText: '{{count}} places disponibles', liveViewersEnabled: false, liveViewersText: '', locationToastEnabled: true, position: 'below-bio' },
    },
  },
  {
    id: 'exclusive', label: 'Contenu exclusif', emoji: '🔒', desc: 'Rareté + FOMO discret',
    config: {
      banner: { enabled: false, text: '', ctaText: '', ctaLink: '', bgColor: '#18181b', textColor: '#ffffff', ctaBgColor: '#ffffff', ctaTextColor: '#18181b', position: 'top', showCountdown: false, countdownMinutes: 15, emoji: '🔒' },
      scarcity: { enabled: true, spotsEnabled: true, spotsInitial: 3, spotsText: 'Accès limité — {{count}} restants', liveViewersEnabled: true, liveViewersText: '{{count}} personnes connectées', locationToastEnabled: true, position: 'below-bio' },
    },
  },
  {
    id: 'drop', label: 'Drop / Restock', emoji: '👟', desc: 'Urgence stock limité',
    config: {
      banner: { enabled: true, text: '👟 DROP EN COURS — Stock très limité', ctaText: 'Shop now', ctaLink: '', bgColor: '#000000', textColor: '#ffffff', ctaBgColor: '#22c55e', ctaTextColor: '#000000', position: 'top', showCountdown: true, countdownMinutes: 10, emoji: '🏃' },
      scarcity: { enabled: true, spotsEnabled: true, spotsInitial: 4, spotsText: 'Seulement {{count}} en stock', liveViewersEnabled: true, liveViewersText: '{{count}} acheteurs actifs', locationToastEnabled: true, position: 'above-links' },
    },
  },
];

interface Props {
  page: CreatorPage;
  onUpdate: (updates: Partial<CreatorPage>) => Promise<{ error: any }>;
}

const UrgencyEditor = ({ page, onUpdate }: Props) => {
  const { t } = useTranslation();
  const existing = (page as any).urgency_config as UrgencyConfig | null;
  const [config, setConfig] = useState<UrgencyConfig>(existing || defaultUrgencyConfig);
  const [saving, setSaving] = useState(false);

  const applyPreset = (preset: typeof urgencyPresets[0]) => {
    setConfig(c => ({
      ...preset.config,
      abTest: c.abTest, // preserve A/B test settings
    }));
    toast({ title: `Template "${preset.label}" appliqué !`, description: 'Personnalisez puis sauvegardez.' });
  };

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
      {/* === PRESETS === */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Templates rapides</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {urgencyPresets.map(preset => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset)}
              className="group text-left p-3 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all"
            >
              <span className="text-lg">{preset.emoji}</span>
              <p className="text-xs font-semibold text-foreground mt-1">{preset.label}</p>
              <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{preset.desc}</p>
            </button>
          ))}
        </div>
      </section>

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

      {/* === A/B TEST === */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Eye className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-foreground">A/B Test</h3>
              <p className="text-xs text-muted-foreground">Compare avec/sans widgets</p>
            </div>
          </div>
          <Switch
            checked={config.abTest?.enabled ?? false}
            onCheckedChange={(v) => updateAbTest({ enabled: v })}
          />
        </div>

        {config.abTest?.enabled && (
          <div className="space-y-4 pl-10 border-l-2 border-primary/20">
            <div className="p-3 rounded-lg bg-secondary/50 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold">A</span>
                  <span className="font-medium text-foreground">Avec widgets</span>
                </div>
                <span className="font-mono font-bold text-foreground">{config.abTest.splitPercent}%</span>
              </div>
              <Slider
                value={[config.abTest.splitPercent ?? 50]}
                onValueChange={([v]) => updateAbTest({ splitPercent: v })}
                min={10} max={90} step={5}
              />
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-muted text-muted-foreground flex items-center justify-center text-[10px] font-bold">B</span>
                  <span className="font-medium text-foreground">Sans widgets</span>
                </div>
                <span className="font-mono font-bold text-foreground">{100 - (config.abTest.splitPercent ?? 50)}%</span>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Les visiteurs sont assignés aléatoirement. Les clics sont taggés A ou B pour comparer les conversions dans l'onglet Analytics.
            </p>
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
