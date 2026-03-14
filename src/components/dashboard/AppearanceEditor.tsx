import { useState, useEffect } from 'react';
import { CreatorPage } from '@/hooks/useCreatorPages';
import { THEMES, canAccessTheme } from '@/lib/themes';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Check, Lock, ChevronDown, Palette, Type, Code, Sparkles, MapPin, Wifi, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAutoSave } from '@/hooks/useAutoSave';

interface AppearanceEditorProps {
  page: CreatorPage;
  plan?: string;
  onUpdate: (updates: Partial<CreatorPage>) => Promise<{ error: any }>;
}

const FONTS = [
  { value: 'default', label: 'Système' },
  { value: 'inter', label: 'Inter' },
  { value: 'poppins', label: 'Poppins' },
  { value: 'dm-sans', label: 'DM Sans' },
  { value: 'playfair', label: 'Playfair Display' },
  { value: 'space-grotesk', label: 'Space Grotesk' },
  { value: 'jetbrains', label: 'JetBrains Mono' },
];

// Collapsible section
const Section = ({ title, icon: Icon, children, defaultOpen = false, badge }: {
  title: string; icon: any; children: React.ReactNode; defaultOpen?: boolean; badge?: string;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`rounded-xl transition-colors ${open ? 'bg-muted/30' : 'hover:bg-muted/20'}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2.5 px-4 py-3 text-left"
      >
        <div className="w-6 h-6 rounded-lg bg-background flex items-center justify-center border border-border/30">
          <Icon className="w-3 h-3 text-muted-foreground" />
        </div>
        <span className="text-[13px] font-medium flex-1">{title}</span>
        {badge && <span className="text-[10px] text-muted-foreground/50 bg-muted px-1.5 py-0.5 rounded">{badge}</span>}
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground/40 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 space-y-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Compact color picker
const ColorPick = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div className="flex items-center justify-between gap-3 py-1">
    <span className="text-[12px] text-muted-foreground">{label}</span>
    <div className="flex items-center gap-1.5">
      <div
        className="w-7 h-7 rounded-lg border border-border/40 overflow-hidden cursor-pointer shrink-0 transition-shadow hover:shadow-sm"
        style={{ backgroundColor: value || 'transparent', backgroundImage: !value ? 'linear-gradient(45deg, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%), linear-gradient(45deg, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%)' : 'none', backgroundSize: '6px 6px', backgroundPosition: '0 0, 3px 3px' }}
      >
        <input type="color" value={value || '#000000'} onChange={e => onChange(e.target.value)} className="w-full h-full opacity-0 cursor-pointer" />
      </div>
      <Input
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder="—"
        className="w-[72px] h-7 text-[11px] font-mono px-2 text-center"
      />
      {value && (
        <button onClick={() => onChange('')} className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground/40 hover:text-foreground hover:bg-muted transition-colors">
          <span className="text-[10px]">✕</span>
        </button>
      )}
    </div>
  </div>
);

const AppearanceEditor = ({ page, plan = 'free', onUpdate }: AppearanceEditorProps) => {
  // Design state
  const [bgColor, setBgColor] = useState(page.custom_bg_color || '');
  const [textColor, setTextColor] = useState(page.custom_text_color || '');
  const [accentColor, setAccentColor] = useState(page.custom_accent_color || '');
  const [btnColor, setBtnColor] = useState(page.custom_btn_color || '');
  const [btnTextColor, setBtnTextColor] = useState(page.custom_btn_text_color || '');
  const [font, setFont] = useState(page.custom_font || 'default');
  const [layout, setLayout] = useState(page.link_layout || 'list');
  const [customCss, setCustomCss] = useState(page.custom_css || '');
  const [saved, setSaved] = useState(false);

  // Immersive state
  const [connectedLabel, setConnectedLabel] = useState(page.connected_label || 'Active now');
  const [location, setLocation] = useState(page.location || '');
  const [geoEnabled, setGeoEnabled] = useState(page.geo_greeting_enabled ?? true);

  // Re-sync when page data changes (theme switch, external update)
  useEffect(() => {
    setBgColor(page.custom_bg_color || '');
    setTextColor(page.custom_text_color || '');
    setAccentColor(page.custom_accent_color || '');
    setBtnColor(page.custom_btn_color || '');
    setBtnTextColor(page.custom_btn_text_color || '');
    setFont(page.custom_font || 'default');
    setLayout(page.link_layout || 'list');
    setCustomCss(page.custom_css || '');
    setConnectedLabel(page.connected_label || 'Active now');
    setLocation(page.location || '');
    setGeoEnabled(page.geo_greeting_enabled ?? true);
  }, [page.id, page.theme, page.custom_bg_color, page.custom_text_color, page.custom_accent_color, page.custom_btn_color, page.custom_btn_text_color, page.custom_font, page.link_layout, page.custom_css, page.connected_label, page.location, page.geo_greeting_enabled]);

  // Auto-save design fields
  const triggerSave = useAutoSave(async () => {
    const result = await onUpdate({
      custom_bg_color: bgColor || null,
      custom_text_color: textColor || null,
      custom_accent_color: accentColor || null,
      custom_btn_color: btnColor || null,
      custom_btn_text_color: btnTextColor || null,
      custom_font: font,
      link_layout: layout,
      custom_css: customCss || null,
      connected_label: connectedLabel,
      location,
      geo_greeting_enabled: geoEnabled,
    } as any);
    if (!result?.error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      toast.error(result.error.message);
    }
  }, 1200);

  const save = () => triggerSave();

  // Theme selection (instant save)
  const selectTheme = async (key: string) => {
    const theme = THEMES[key];
    if (!canAccessTheme(theme.tier, plan)) {
      toast.error(`Ce thème nécessite le plan ${theme.tier === 'pro' ? 'Pro' : 'Starter'}`);
      return;
    }
    const result = await onUpdate({ theme: key } as any);
    if (!result?.error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const hasCustomColors = !!(bgColor || textColor || accentColor || btnColor || btnTextColor);

  const resetColors = () => {
    setBgColor(''); setTextColor(''); setAccentColor('');
    setBtnColor(''); setBtnTextColor('');
    save();
  };

  const isImmersive = page.theme === 'immersive';

  return (
    <div className="space-y-4">

      {/* ═══ THEME GRID ═══ */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[12px] text-muted-foreground">Style de base</p>
          <AnimatePresence>
            {saved && (
              <motion.span
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                className="text-[11px] text-emerald-600 flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Sauvegardé
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {Object.entries(THEMES).map(([key, theme]) => {
            const isSelected = page.theme === key;
            const isLocked = !canAccessTheme(theme.tier, plan);

            return (
              <button
                key={key}
                onClick={() => selectTheme(key)}
                className={`relative rounded-xl transition-all duration-200 text-center overflow-hidden ${
                  isSelected
                    ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                    : 'hover:ring-1 hover:ring-border'
                } ${isLocked ? 'opacity-40 grayscale' : ''}`}
              >
                <div className={`h-14 ${theme.preview} flex items-center justify-center gap-1`}>
                  {/* Mini page mockup inside swatch */}
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="w-4 h-4 rounded-full bg-white/30" />
                    <div className="w-8 h-1 rounded-full bg-white/25" />
                    <div className="w-10 h-1.5 rounded-sm bg-white/15" />
                    <div className="w-10 h-1.5 rounded-sm bg-white/10" />
                  </div>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center"
                    >
                      <Check className="w-2.5 h-2.5 text-primary-foreground" />
                    </motion.div>
                  )}
                  {isLocked && (
                    <div className="absolute top-1.5 right-1.5">
                      <Lock className="w-3 h-3 text-white/50" />
                    </div>
                  )}
                </div>
                <div className="py-1.5 bg-card">
                  <span className="text-[10px] font-medium">{theme.name}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══ COLLAPSIBLE SECTIONS ═══ */}

      <Section title="Couleurs" icon={Palette} badge={hasCustomColors ? `${[bgColor,textColor,accentColor,btnColor,btnTextColor].filter(Boolean).length} actives` : undefined}>
        <div className="flex items-center justify-between mb-1">
          <p className="text-[11px] text-muted-foreground/60">Vide = couleurs du thème</p>
          {hasCustomColors && (
            <button onClick={resetColors} className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
              <RotateCcw className="w-2.5 h-2.5" /> Réinitialiser
            </button>
          )}
        </div>
        <ColorPick label="Fond" value={bgColor} onChange={v => { setBgColor(v); save(); }} />
        <ColorPick label="Texte" value={textColor} onChange={v => { setTextColor(v); save(); }} />
        <ColorPick label="Accent" value={accentColor} onChange={v => { setAccentColor(v); save(); }} />
        <ColorPick label="Boutons" value={btnColor} onChange={v => { setBtnColor(v); save(); }} />
        <ColorPick label="Texte boutons" value={btnTextColor} onChange={v => { setBtnTextColor(v); save(); }} />
      </Section>

      <Section title="Typographie & Layout" icon={Type}>
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <Label className="text-[12px] text-muted-foreground">Police</Label>
            <Select value={font} onValueChange={v => { setFont(v); save(); }}>
              <SelectTrigger className="w-44 h-8 text-[12px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONTS.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between gap-3">
            <Label className="text-[12px] text-muted-foreground">Disposition</Label>
            <div className="flex gap-1">
              {[
                { value: 'list', label: 'Liste' },
                { value: 'grid', label: 'Grille' },
              ].map(l => (
                <button
                  key={l.value}
                  onClick={() => { setLayout(l.value); save(); }}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                    layout === l.value ? 'bg-foreground text-background' : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Immersive settings — only when theme = immersive */}
      {isImmersive && (
        <Section title="Mode Immersif" icon={Sparkles} defaultOpen>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <Wifi className="w-3 h-3 text-muted-foreground" />
                <Label className="text-[12px]">Statut</Label>
              </div>
              <Input
                value={connectedLabel}
                onChange={e => { setConnectedLabel(e.target.value); save(); }}
                className="w-36 h-7 text-[11px]"
                placeholder="Active now"
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-muted-foreground" />
                <Label className="text-[12px]">Ville</Label>
              </div>
              <Input
                value={location}
                onChange={e => { setLocation(e.target.value); save(); }}
                className="w-36 h-7 text-[11px]"
                placeholder="Paris, FR"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-[12px]">Salutation géo</Label>
              <Switch checked={geoEnabled} onCheckedChange={v => { setGeoEnabled(v); save(); }} />
            </div>
          </div>
        </Section>
      )}

      <Section title="CSS personnalisé" icon={Code}>
        <Textarea
          value={customCss}
          onChange={e => { setCustomCss(e.target.value); save(); }}
          placeholder={`.page-container {\n  /* votre CSS */\n}`}
          className="font-mono text-[11px] h-20 resize-none bg-background"
        />
        <p className="text-[10px] text-muted-foreground/50">Ciblez .page-container ou .link-item</p>
      </Section>
    </div>
  );
};

export default AppearanceEditor;
