import { useState, useEffect } from 'react';
import { CreatorPage, PageLink } from '@/hooks/useCreatorPages';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { TapCheck as Check, TapPalette as Palette } from '@/components/icons/TapIcons';
import { Code, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAutoSave } from '@/hooks/useAutoSave';
import { Slider } from '@/components/ui/slider';

interface AppearanceEditorProps {
  page: CreatorPage;
  links?: PageLink[];
  plan?: string;
  onUpdate: (updates: Partial<CreatorPage>) => Promise<{ error: any }>;
  onPreviewChange?: (overrides: Partial<CreatorPage>) => void;
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

// ═══ COLOR PICKER ═══
const ColorPick = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div className="flex items-center justify-between gap-3 py-0.5">
    <span className="text-[12px] text-muted-foreground">{label}</span>
    <div className="flex items-center gap-1.5">
      <div className="w-7 h-7 rounded-lg border border-border/30 overflow-hidden cursor-pointer shrink-0 hover:shadow-sm hover:border-border/50 transition-all"
        style={{ backgroundColor: value || 'transparent',
          backgroundImage: !value ? 'linear-gradient(45deg,#eee 25%,transparent 25%,transparent 75%,#eee 75%),linear-gradient(45deg,#eee 25%,transparent 25%,transparent 75%,#eee 75%)' : 'none',
          backgroundSize: '6px 6px', backgroundPosition: '0 0,3px 3px' }}>
        <input type="color" value={value || '#000000'} onChange={e => onChange(e.target.value)} className="w-full h-full opacity-0 cursor-pointer" />
      </div>
      <Input value={value || ''} onChange={e => onChange(e.target.value)} placeholder="—"
        className="w-[72px] h-7 text-[11px] font-mono px-2 text-center" />
      {value && (
        <button onClick={() => onChange('')}
          className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground/30 hover:text-foreground hover:bg-muted transition-colors">
          <span className="text-[10px]">✕</span>
        </button>
      )}
    </div>
  </div>
);

// ═══ MAIN ═══
const AppearanceEditor = ({ page, links = [], plan = 'free', onUpdate, onPreviewChange }: AppearanceEditorProps) => {
  const [bgColor, setBgColor] = useState(page.custom_bg_color || '');
  const [textColor, setTextColor] = useState(page.custom_text_color || '');
  const [accentColor, setAccentColor] = useState(page.custom_accent_color || '');
  const [btnColor, setBtnColor] = useState(page.custom_btn_color || '');
  const [btnTextColor, setBtnTextColor] = useState(page.custom_btn_text_color || '');
  const [font, setFont] = useState(page.custom_font || 'default');
  const [layout, setLayout] = useState(page.link_layout || 'list');
  const [customCss, setCustomCss] = useState(page.custom_css || '');
  const [saved, setSaved] = useState(false);
  const [connectedLabel, setConnectedLabel] = useState(page.connected_label || 'Active now');
  const [location, setLocation] = useState(page.location || '');
  const [geoEnabled, setGeoEnabled] = useState(page.geo_greeting_enabled ?? true);
  const [btnRadius, setBtnRadius] = useState(page.button_radius ?? 16);
  const [btnStyle, setBtnStyle] = useState(page.button_style || 'filled');
  const [avatarShape, setAvatarShape] = useState(page.avatar_shape || 'circle');
  const [spacing, setSpacing] = useState(page.content_spacing || 'default');

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
    setBtnRadius(page.button_radius ?? 16);
    setBtnStyle(page.button_style || 'filled');
    setAvatarShape(page.avatar_shape || 'circle');
    setSpacing(page.content_spacing || 'default');
  }, [page.id, page.custom_bg_color, page.custom_text_color, page.custom_accent_color,
      page.custom_btn_color, page.custom_btn_text_color, page.custom_font, page.link_layout,
      page.custom_css, page.connected_label, page.location, page.geo_greeting_enabled,
      page.button_radius, page.button_style, page.avatar_shape, page.content_spacing]);

  // Check if design control columns exist (migration applied)
  const hasDesignControls = page.button_radius !== undefined;

  const triggerSave = useAutoSave(async () => {
    const updates: Record<string, any> = {
      custom_bg_color: bgColor || null, custom_text_color: textColor || null,
      custom_accent_color: accentColor || null, custom_btn_color: btnColor || null,
      custom_btn_text_color: btnTextColor || null, custom_font: font,
      link_layout: layout, custom_css: customCss || null,
      connected_label: connectedLabel, location, geo_greeting_enabled: geoEnabled,
    };
    if (hasDesignControls) {
      updates.button_radius = btnRadius;
      updates.button_style = btnStyle;
      updates.avatar_shape = avatarShape;
      updates.content_spacing = spacing;
    }
    const result = await onUpdate(updates as any);
    if (!result?.error) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
    else toast.error(result.error.message);
  }, 1200);

  const save = () => {
    triggerSave();
  };

  // Live preview — fires on every state change, always reads fresh values
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    onPreviewChange?.({
      theme: 'immersive',
      custom_bg_color: bgColor || null,
      custom_text_color: textColor || null,
      custom_accent_color: accentColor || null,
      custom_btn_color: btnColor || null,
      custom_btn_text_color: btnTextColor || null,
      custom_font: font,
      link_layout: layout,
      connected_label: connectedLabel,
      location,
      button_radius: btnRadius,
      button_style: btnStyle,
      avatar_shape: avatarShape,
      content_spacing: spacing,
    } as Partial<CreatorPage>);
  }, [bgColor, textColor, accentColor, btnColor, btnTextColor, font, layout,
      connectedLabel, location, btnRadius, btnStyle, avatarShape, spacing]);

  // Auto-migrate to immersive theme if not already set
  useEffect(() => {
    if (page.theme !== 'immersive') {
      onUpdate({ theme: 'immersive' } as any);
    }
  }, [page.id]);

  const activeColors = [bgColor, textColor, accentColor, btnColor, btnTextColor].filter(Boolean).length;
  const isImmersive = true;
  const [showColors, setShowColors] = useState(activeColors > 0);
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="space-y-6">
      {/* Save indicator */}
      <AnimatePresence>
        {saved && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="text-[11px] text-emerald-600 flex items-center gap-1">
            <Check className="w-3 h-3" /> Sauvegardé
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ARRONDI ── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[12px] text-muted-foreground">Arrondi</span>
          <span className="text-[10px] text-muted-foreground/40 tabular-nums">{btnRadius}px</span>
        </div>
        <Slider value={[btnRadius]} onValueChange={([v]) => { setBtnRadius(v); save(); }} min={0} max={50} step={2} />
      </div>

      {/* ── STYLE ── */}
      <div className="flex gap-1.5">
        {([
          { value: 'filled', label: 'Plein' },
          { value: 'outline', label: 'Contour' },
          { value: 'ghost', label: 'Ghost' },
          { value: 'shadow', label: 'Ombre' },
        ] as const).map(s => (
          <button key={s.value} onClick={() => { setBtnStyle(s.value); save(); }}
            className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
              btnStyle === s.value ? 'bg-foreground text-background' : 'bg-muted/40 text-muted-foreground hover:bg-muted'}`}>
            {s.label}
          </button>
        ))}
      </div>

      {/* ── AVATAR · LAYOUT · ESPACEMENT — one row each ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-muted-foreground">Avatar</span>
          <div className="flex gap-1">
            {([
              { value: 'circle', r: '50%' },
              { value: 'rounded', r: '20%' },
              { value: 'square', r: '0' },
            ] as const).map(s => (
              <button key={s.value} onClick={() => { setAvatarShape(s.value); save(); }}
                className={`w-8 h-8 bg-muted transition-all ${avatarShape === s.value ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : 'hover:bg-muted/80'}`}
                style={{ borderRadius: s.r }} />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[12px] text-muted-foreground">Disposition</span>
          <div className="flex gap-1">
            {[{ value: 'list', label: 'Liste' }, { value: 'grid', label: 'Grille' }].map(l => (
              <button key={l.value} onClick={() => { setLayout(l.value); save(); }}
                className={`px-3 py-1 rounded-lg text-[10px] font-medium transition-all ${
                  layout === l.value ? 'bg-foreground text-background' : 'bg-muted/40 text-muted-foreground hover:bg-muted'}`}>
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[12px] text-muted-foreground">Espacement</span>
          <div className="flex gap-1">
            {([
              { value: 'compact', label: 'Serré' },
              { value: 'default', label: 'Normal' },
              { value: 'spacious', label: 'Aéré' },
            ] as const).map(s => (
              <button key={s.value} onClick={() => { setSpacing(s.value); save(); }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
                  spacing === s.value ? 'bg-foreground text-background' : 'bg-muted/40 text-muted-foreground hover:bg-muted'}`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[12px] text-muted-foreground">Police</span>
          <Select value={font} onValueChange={v => { setFont(v); save(); }}>
            <SelectTrigger className="w-36 h-7 text-[11px]"><SelectValue /></SelectTrigger>
            <SelectContent>{FONTS.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      {/* ── COULEURS — toggle ── */}
      <div>
        <button onClick={() => setShowColors(!showColors)}
          className="text-[12px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
          <Palette className="w-3 h-3" />
          {showColors ? 'Masquer les couleurs' : 'Personnaliser les couleurs'}
          {activeColors > 0 && <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{activeColors}</span>}
        </button>
        {showColors && (
          <div className="mt-3 space-y-1.5">
            {activeColors > 0 && (
              <button onClick={() => { setBgColor(''); setTextColor(''); setAccentColor(''); setBtnColor(''); setBtnTextColor(''); save(); }}
                className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2">
                <RotateCcw className="w-2.5 h-2.5" /> Réinitialiser
              </button>
            )}
            <ColorPick label="Fond" value={bgColor} onChange={v => { setBgColor(v); save(); }} />
            <ColorPick label="Texte" value={textColor} onChange={v => { setTextColor(v); save(); }} />
            <ColorPick label="Accent" value={accentColor} onChange={v => { setAccentColor(v); save(); }} />
            <ColorPick label="Boutons" value={btnColor} onChange={v => { setBtnColor(v); save(); }} />
            <ColorPick label="Texte btn" value={btnTextColor} onChange={v => { setBtnTextColor(v); save(); }} />
          </div>
        )}
      </div>

      {/* ── AVANCÉ — toggle ── */}
      <div>
        <button onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-[12px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
          <Code className="w-3 h-3" />
          {showAdvanced ? 'Masquer les options avancées' : 'Options avancées'}
        </button>
        {showAdvanced && (
          <div className="mt-3 space-y-3">
            {isImmersive && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-muted-foreground">Statut</span>
                  <Input value={connectedLabel} onChange={e => { setConnectedLabel(e.target.value); save(); }} className="w-28 h-7 text-[11px]" placeholder="Active now" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-muted-foreground">Ville</span>
                  <Input value={location} onChange={e => { setLocation(e.target.value); save(); }} className="w-28 h-7 text-[11px]" placeholder="Paris, FR" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-muted-foreground">Salutation géo</span>
                  <Switch checked={geoEnabled} onCheckedChange={v => { setGeoEnabled(v); save(); }} />
                </div>
              </>
            )}
            <Textarea value={customCss} onChange={e => { setCustomCss(e.target.value); save(); }}
              placeholder={`.page-container { }`} className="font-mono text-[11px] h-16 resize-none" />
          </div>
        )}
      </div>
    </div>
  );
};

export default AppearanceEditor;
