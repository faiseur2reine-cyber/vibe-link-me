import { useState, useEffect } from 'react';
import { CreatorPage } from '@/hooks/useCreatorPages';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { TapSparkles as Sparkles, TapMapPin as MapPin, TapWifi as Wifi, TapGlobe as Globe, TapCheck as Check } from '@/components/icons/TapIcons';
import { useAutoSave } from '@/hooks/useAutoSave';

interface ImmersiveSettingsProps {
  page: CreatorPage;
  onUpdate: (updates: Partial<CreatorPage>) => Promise<{ error: any }>;
}

const ImmersiveSettings = ({ page, onUpdate }: ImmersiveSettingsProps) => {
  const [connectedLabel, setConnectedLabel] = useState(page.connected_label || 'Active now');
  const [location, setLocation] = useState(page.location || '');
  const [geoEnabled, setGeoEnabled] = useState(page.geo_greeting_enabled ?? true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setConnectedLabel(page.connected_label || 'Active now');
    setLocation(page.location || '');
    setGeoEnabled(page.geo_greeting_enabled ?? true);
  }, [page.id, page.connected_label, page.location, page.geo_greeting_enabled]);

  const triggerSave = useAutoSave(async () => {
    const result = await onUpdate({
      connected_label: connectedLabel,
      location: location,
      geo_greeting_enabled: geoEnabled,
    });
    if (!result.error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      toast.error(result.error.message);
    }
  }, 1500);

  if (page.theme !== 'immersive') return null;

  return (
    <div className="space-y-6 p-4 rounded-xl border border-border/60 bg-muted/20">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-amber-500" />
        <h4 className="text-[12px] font-semibold text-foreground">Paramètres Immersive</h4>
      </div>

      {/* Connected label */}
      <div className="space-y-2">
        <Label className="text-[12px] flex items-center gap-1.5">
          <Wifi className="w-3.5 h-3.5 text-emerald-500" /> Label de connexion
        </Label>
        <Input
          value={connectedLabel}
          onChange={e => { setConnectedLabel(e.target.value); triggerSave(); }}
          placeholder="Active now"
          className="h-8 text-[12px]"
        />
        <p className="text-[10px] text-muted-foreground">
          Texte affiché à côté du point vert (ex: "Active now", "Online", "Disponible").
        </p>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label className="text-[12px] flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-blue-500" /> Localisation affichée
        </Label>
        <Input
          value={location}
          onChange={e => { setLocation(e.target.value); triggerSave(); }}
          placeholder="Paris, Tallinn, Bali..."
          className="h-8 text-[12px]"
        />
        <p className="text-[10px] text-muted-foreground">
          Ville affichée à côté du label. Laissez vide pour masquer.
        </p>
      </div>

      {/* Geo greeting */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-purple-500" />
          <div>
            <Label className="text-[12px]">Geo greeting</Label>
            <p className="text-[10px] text-muted-foreground">Affiche "Hey Paris 👋" basé sur la ville du visiteur.</p>
          </div>
        </div>
        <Switch checked={geoEnabled} onCheckedChange={(v) => { setGeoEnabled(v); triggerSave(); }} />
      </div>

      {saved && (
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-600">
          <Check className="w-3 h-3" /> Sauvegardé
        </div>
      )}
    </div>
  );
};

export default ImmersiveSettings;
