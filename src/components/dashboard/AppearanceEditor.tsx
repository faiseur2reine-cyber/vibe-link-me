import { useState } from 'react';
import { CreatorPage } from '@/hooks/useCreatorPages';
import { THEMES, canAccessTheme } from '@/lib/themes';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Check, Lock, ChevronDown, Palette, Type, LayoutGrid, Code, Sparkles, MapPin, Wifi } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAutoSave } from '@/hooks/useAutoSave';

interface AppearanceEditorProps {
  page: CreatorPage;
  plan?: string;
  onUpdate: (updates: Partial<CreatorPage>) => Promise<{ error: any }>;
}

const FONTS = [
  { value: 'default', label: 'System (par défaut)' },
  { value: 'inter', label: 'Inter' },
  { value: 'poppins', label: 'Poppins' },
  { value: 'dm-sans', label: 'DM Sans' },
  { value: 'playfair', label: 'Playfair Display' },
  { value: 'space-grotesk', label: 'Space Grotesk' },
  { value: 'jetbrains', label: 'JetBrains Mono' },
];

const LAYOUTS = [
  { value: 'list', label: 'Liste' },
  { value: 'grid', label: 'Grille' },
];

// Collapsible section
const Section = ({ title, icon: Icon, children, defaultOpen = false }: {
  title: string; icon: any; children: React.ReactNode; defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border/30 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2.5 px-4 py-3 text-left hover:bg-accent/30 transition-colors"
      >
        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-[13px] font-medium flex-1">{title}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4">
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
  <div className="flex items-center justify-between gap-3">
    <span className="text-[12px] text-muted-foreground">{label}</span>
    <div className="flex items-center gap-1.5">
      <div className="w-7 h-7 rounded-lg border border-border/40 overflow-hidden cursor-pointer shrink-0" style={{ backgroundColor: value || 'transparent' }}>
        <input type="color" value={value || '#000000'} onChange={e => onChange(e.target.value)} className="w-full h-full opacity-0 cursor-pointer" />
      </div>
      <Input
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder="auto"
        className="w-20 h-7 text-[11px] font-mono px-2"
      />
      {value && (
        <button onClick={() => onChange('')} className="text-[10px] text-muted-foreground hover:text-foreground">✕</button>
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

  // Auto-save everything
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

  const s = () => triggerSave(); // shorthand

  // Theme selection (instant save, no debounce)
  const selectTheme = async (key: string) => {
    const theme = THEMES[key];
    if (!canAccessTheme(theme.tier, plan)) {
      toast.error(`Ce thème est réservé au plan ${theme.tier === 'pro' ? 'Pro' : 'Starter'}.`);
      return;
    }
    const result = await onUpdate({ theme: key } as any);
    if (!result?.error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const isImmersive = page.theme === 'immersive';

  return (
    <div className="space-y-5">
      {/* Save indicator */}
      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-1.5 text-[11px] text-emerald-600"
          >
            <Check className="w-3 h-3" /> Sauvegardé
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ THEME GRID ═══ */}
      <div>
        <p className="text-[12px] text-muted-foreground mb-3">Style de base</p>
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
          {Object.entries(THEMES).map(([key, theme]) => {
            const isSelected = page.theme === key;
            const isLocked = !canAccessTheme(theme.tier, plan);

            return (
              <button
                key={key}
                onClick={() => selectTheme(key)}
                className={`relative rounded-xl p-1.5 border transition-all duration-200 text-center ${
                  isSelected
                    ? 'border-primary ring-1 ring-primary/20'
                    : 'border-border/30 hover:border-border/60'
                } ${isLocked ? 'opacity-50' : ''}`}
              >
                {/* Mini swatch */}
                <div className={`h-10 rounded-lg mb-1 ${theme.preview} flex items-center justify-center`}>
                  {isSelected && <Check className="w-3 h-3 text-white drop-shadow" />}
                  {isLocked && !isSelected && <Lock className="w-2.5 h-2.5 text-white/60" />}
                </div>
                <span className="text-[10px] font-medium text-foreground/80 leading-none">{theme.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══ COLLAPSIBLE SECTIONS ═══ */}

      <Section title="Couleurs" icon={Palette}>
        <p className="text-[11px] text-muted-foreground -mt-1">Laissez vide pour utiliser les couleurs du thème.</p>
        <div className="space-y-2.5">
          <ColorPick label="Fond" value={bgColor} onChange={v => { setBgColor(v); s(); }} />
          <ColorPick label="Texte" value={textColor} onChange={v => { setTextColor(v); s(); }} />
          <ColorPick label="Accent" value={accentColor} onChange={v => { setAccentColor(v); s(); }} />
          <ColorPick label="Boutons" value={btnColor} onChange={v => { setBtnColor(v); s(); }} />
          <ColorPick label="Texte boutons" value={btnTextColor} onChange={v => { setBtnTextColor(v); s(); }} />
        </div>
      </Section>

      <Section title="Typographie & Layout" icon={Type}>
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <Label className="text-[12px] text-muted-foreground">Police</Label>
            <Select value={font} onValueChange={v => { setFont(v); s(); }}>
              <SelectTrigger className="w-40 h-8 text-[12px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONTS.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between gap-3">
            <Label className="text-[12px] text-muted-foreground">Layout des liens</Label>
            <Select value={layout} onValueChange={v => { setLayout(v); s(); }}>
              <SelectTrigger className="w-40 h-8 text-[12px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LAYOUTS.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Section>

      {/* Immersive settings — only when theme = immersive */}
      {isImmersive && (
        <Section title="Immersive" icon={Sparkles} defaultOpen>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <Wifi className="w-3 h-3 text-muted-foreground" />
                <Label className="text-[12px]">Label connecté</Label>
              </div>
              <Input
                value={connectedLabel}
                onChange={e => { setConnectedLabel(e.target.value); s(); }}
                className="w-36 h-7 text-[11px]"
                placeholder="Active now"
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-muted-foreground" />
                <Label className="text-[12px]">Localisation</Label>
              </div>
              <Input
                value={location}
                onChange={e => { setLocation(e.target.value); s(); }}
                className="w-36 h-7 text-[11px]"
                placeholder="Paris, FR"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-[12px]">Salutation géolocalisée</Label>
              <Switch checked={geoEnabled} onCheckedChange={v => { setGeoEnabled(v); s(); }} />
            </div>
          </div>
        </Section>
      )}

      {/* CSS avancé — hidden by default */}
      <Section title="CSS avancé" icon={Code}>
        <Textarea
          value={customCss}
          onChange={e => { setCustomCss(e.target.value); s(); }}
          placeholder={`.page-container {\n  /* votre CSS ici */\n}`}
          className="font-mono text-[11px] h-24 resize-none"
        />
        <p className="text-[10px] text-muted-foreground">CSS injecté sur votre page publique. Utilisez .page-container, .link-item, etc.</p>
      </Section>
    </div>
  );
};

export default AppearanceEditor;
