import { useState, useEffect, useMemo } from 'react';
import { CreatorPage, PageLink } from '@/hooks/useCreatorPages';
import { THEMES, canAccessTheme, getTheme } from '@/lib/themes';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Check, Lock, ChevronDown, Palette, Type, Code, Sparkles, MapPin, Wifi, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAutoSave } from '@/hooks/useAutoSave';
import { detectPlatform } from '@/lib/platforms';
import LinkFavicon from '@/components/LinkFavicon';

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

// ═══ INLINE MINI PREVIEW ═══
const MiniPreview = ({ page, links, design }: {
  page: CreatorPage; links: PageLink[];
  design: { bgColor: string; textColor: string; btnColor: string; btnTextColor: string };
}) => {
  const theme = getTheme(page.theme);
  const bg = design.bgColor || undefined;
  const text = design.textColor || undefined;
  const btn = design.btnColor || undefined;
  const btnText = design.btnTextColor || undefined;
  const name = page.display_name || page.username;
  const previewLinks = links.slice(0, 3);

  return (
    <div
      className="rounded-2xl overflow-hidden border border-border/20 shadow-sm transition-all duration-300"
      style={{ backgroundColor: bg, color: text }}
    >
      <div className={`p-5 pb-6 flex flex-col items-center ${!bg ? theme.bg : ''}`}>
        <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-white/20 shadow-lg mb-2.5">
          {page.avatar_url ? (
            <img src={page.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
              <span className="text-base font-bold text-primary/70">{name[0]?.toUpperCase()}</span>
            </div>
          )}
        </div>
        <p className={`text-[13px] font-bold ${!text ? theme.text : ''}`} style={{ color: text }}>{name}</p>
        <p className={`text-[9px] mt-0.5 ${!text ? theme.subtleText : 'opacity-40'}`}>@{page.username}</p>
        <div className="w-full mt-3 space-y-1.5 max-w-[200px]">
          {previewLinks.length > 0 ? previewLinks.map(link => {
            const platform = detectPlatform(link.url);
            const lBg = link.bg_color || btn;
            const lText = link.text_color || btnText;
            return (
              <div key={link.id}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium ${!lBg ? theme.btn : ''}`}
                style={{ ...(lBg ? { backgroundColor: lBg } : {}), ...(lText ? { color: lText } : {}) }}
              >
                <div className="w-4 h-4 rounded flex items-center justify-center shrink-0"
                  style={{ backgroundColor: platform?.bgColor || 'rgba(0,0,0,0.05)' }}>
                  <LinkFavicon url={link.url} size="sm" className={platform ? 'text-white' : ''} style={{ width: 10, height: 10 }} />
                </div>
                <span className="truncate">{link.title}</span>
              </div>
            );
          }) : [1, 2].map(i => (
            <div key={i} className={`h-7 rounded-lg ${!btn ? 'bg-black/[0.04]' : ''}`}
              style={btn ? { backgroundColor: btn, opacity: 0.3 + i * 0.2 } : {}} />
          ))}
        </div>
      </div>
    </div>
  );
};

// ═══ COLLAPSIBLE SECTION ═══
const Section = ({ title, icon: Icon, children, defaultOpen = false, badge }: {
  title: string; icon: any; children: React.ReactNode; defaultOpen?: boolean; badge?: string;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`rounded-xl transition-all duration-150 ${open ? 'bg-muted/20 ring-1 ring-border/15' : 'hover:bg-muted/10'}`}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left">
        <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${open ? 'bg-primary/10' : 'bg-muted/40'}`}>
          <Icon className={`w-3 h-3 transition-colors ${open ? 'text-primary' : 'text-muted-foreground'}`} />
        </div>
        <span className="text-[13px] font-medium flex-1">{title}</span>
        {badge && <span className="text-[9px] text-primary bg-primary/10 px-1.5 py-0.5 rounded-full font-medium">{badge}</span>}
        <ChevronDown className={`w-3 h-3 text-muted-foreground/30 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.12 }} className="overflow-hidden">
            <div className="px-3.5 pb-3.5 pt-0.5 space-y-2.5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

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

// Saturated swatch colors for theme picker grid (must pop at tiny size)
const SWATCH_COLORS: Record<string, { bg: string; dot: string; bar1: string; bar2: string }> = {
  default:    { bg: '#e8e8eb', dot: 'rgba(0,0,0,0.15)', bar1: 'rgba(0,0,0,0.08)', bar2: 'rgba(0,0,0,0.05)' },
  sunset:     { bg: 'linear-gradient(135deg, #fdba74, #f87171)', dot: 'rgba(255,255,255,0.5)', bar1: 'rgba(255,255,255,0.35)', bar2: 'rgba(255,255,255,0.2)' },
  ocean:      { bg: 'linear-gradient(135deg, #7dd3fc, #6366f1)', dot: 'rgba(255,255,255,0.5)', bar1: 'rgba(255,255,255,0.35)', bar2: 'rgba(255,255,255,0.2)' },
  midnight:   { bg: '#0a0a12', dot: 'rgba(255,255,255,0.15)', bar1: 'rgba(255,255,255,0.08)', bar2: 'rgba(255,255,255,0.05)' },
  forest:     { bg: 'linear-gradient(135deg, #6ee7b7, #34d399)', dot: 'rgba(255,255,255,0.5)', bar1: 'rgba(255,255,255,0.35)', bar2: 'rgba(255,255,255,0.2)' },
  neon:       { bg: 'linear-gradient(135deg, #d946ef, #7c3aed)', dot: 'rgba(255,255,255,0.4)', bar1: 'rgba(255,255,255,0.25)', bar2: 'rgba(255,255,255,0.15)' },
  glass_dark: { bg: 'linear-gradient(135deg, #27272a, #18181b)', dot: 'rgba(255,255,255,0.12)', bar1: 'rgba(255,255,255,0.06)', bar2: 'rgba(255,255,255,0.04)' },
  pastel:     { bg: 'linear-gradient(135deg, #f9a8d4, #c4b5fd)', dot: 'rgba(255,255,255,0.5)', bar1: 'rgba(255,255,255,0.35)', bar2: 'rgba(255,255,255,0.2)' },
  brutalist:  { bg: '#f5f0e8', dot: '#000', bar1: '#000', bar2: '#000' },
  aurora:     { bg: 'linear-gradient(135deg, #7c3aed, #34d399)', dot: 'rgba(255,255,255,0.4)', bar1: 'rgba(255,255,255,0.25)', bar2: 'rgba(255,255,255,0.15)' },
  cyber:      { bg: 'linear-gradient(135deg, #0891b2, #06b6d4)', dot: 'rgba(255,255,255,0.4)', bar1: 'rgba(255,255,255,0.25)', bar2: 'rgba(255,255,255,0.15)' },
  marble:     { bg: '#d6d3d1', dot: 'rgba(0,0,0,0.12)', bar1: 'rgba(0,0,0,0.06)', bar2: 'rgba(0,0,0,0.04)' },
  minimal:    { bg: '#ffffff', dot: 'rgba(0,0,0,0.1)', bar1: 'rgba(0,0,0,0.06)', bar2: 'rgba(0,0,0,0.04)' },
  immersive:  { bg: 'linear-gradient(135deg, #1e1b4b, #0f172a)', dot: 'rgba(255,255,255,0.4)', bar1: 'rgba(255,255,255,0.25)', bar2: 'rgba(255,255,255,0.15)' },
};

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
  const [selectedTheme, setSelectedTheme] = useState(page.theme || 'default');

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
    setSelectedTheme(page.theme || 'default');
  }, [page.id, page.theme, page.custom_bg_color, page.custom_text_color, page.custom_accent_color,
      page.custom_btn_color, page.custom_btn_text_color, page.custom_font, page.link_layout,
      page.custom_css, page.connected_label, page.location, page.geo_greeting_enabled]);

  const triggerSave = useAutoSave(async () => {
    const result = await onUpdate({
      custom_bg_color: bgColor || null, custom_text_color: textColor || null,
      custom_accent_color: accentColor || null, custom_btn_color: btnColor || null,
      custom_btn_text_color: btnTextColor || null, custom_font: font,
      link_layout: layout, custom_css: customCss || null,
      connected_label: connectedLabel, location, geo_greeting_enabled: geoEnabled,
    } as any);
    if (!result?.error) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
    else toast.error(result.error.message);
  }, 1200);

  // Build complete preview state (theme + all design fields)
  const buildPreview = (extra?: Partial<CreatorPage>): Partial<CreatorPage> => ({
    theme: selectedTheme,
    custom_bg_color: bgColor || null,
    custom_text_color: textColor || null,
    custom_accent_color: accentColor || null,
    custom_btn_color: btnColor || null,
    custom_btn_text_color: btnTextColor || null,
    custom_font: font,
    link_layout: layout,
    connected_label: connectedLabel,
    location,
    ...extra,
  } as Partial<CreatorPage>);

  const save = () => {
    triggerSave();
    onPreviewChange?.(buildPreview());
  };

  const selectTheme = async (key: string) => {
    const t = THEMES[key];
    if (!canAccessTheme(t.tier, plan)) {
      toast.error(`Plan ${t.tier === 'pro' ? 'Pro' : 'Starter'} requis`);
      return;
    }
    setSelectedTheme(key); // instant local update
    onPreviewChange?.(buildPreview({ theme: key } as Partial<CreatorPage>));
    const result = await onUpdate({ theme: key } as any);
    if (!result?.error) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
  };

  const activeColors = [bgColor, textColor, accentColor, btnColor, btnTextColor].filter(Boolean).length;
  const isImmersive = selectedTheme === 'immersive';
  const designState = useMemo(() => ({ bgColor, textColor, btnColor, btnTextColor }), [bgColor, textColor, btnColor, btnTextColor]);

  return (
    <div className="space-y-5">
      {/* ═══ PREVIEW ═══ */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] text-muted-foreground/50 uppercase tracking-wider font-medium">Aperçu</p>
          <AnimatePresence>
            {saved && (
              <motion.span initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}
                className="text-[11px] text-emerald-600 flex items-center gap-1">
                <Check className="w-3 h-3" /> Sauvegardé
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <MiniPreview page={{...page, theme: selectedTheme} as CreatorPage} links={links} design={designState} />
      </div>

      {/* ═══ THEMES ═══ */}
      <div>
        <p className="text-[11px] text-muted-foreground/50 uppercase tracking-wider font-medium mb-2.5">Thème</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
          {Object.entries(THEMES).map(([key, theme]) => {
            const sel = selectedTheme === key;
            const locked = !canAccessTheme(theme.tier, plan);
            const sc = SWATCH_COLORS[key] || SWATCH_COLORS.default;
            return (
              <button key={key} onClick={() => selectTheme(key)}
                className={`relative rounded-xl overflow-hidden transition-all duration-150 ${
                  sel ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' :
                  locked ? 'opacity-30 grayscale' : 'hover:ring-1 hover:ring-border/50'}`}>
                <div className="h-14 flex items-center justify-center" style={{ background: sc.bg }}>
                  <div className="flex flex-col items-center gap-[3px]">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: sc.dot }} />
                    <div className="w-10 h-[4px] rounded-full" style={{ backgroundColor: sc.bar1 }} />
                    <div className="w-12 h-[5px] rounded-sm" style={{ backgroundColor: sc.bar2 }} />
                  </div>
                  {sel && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center shadow-sm">
                    <Check className="w-2.5 h-2.5 text-primary-foreground" />
                  </motion.div>}
                  {locked && <Lock className="absolute top-1 right-1 w-3 h-3 text-white/40" />}
                </div>
                <div className="py-1 bg-card text-center"><span className="text-[9px] font-medium">{theme.name}</span></div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══ SECTIONS ═══ */}
      <Section title="Couleurs" icon={Palette} badge={activeColors > 0 ? String(activeColors) : undefined}>
        <div className="flex items-center justify-between mb-0.5">
          <p className="text-[10px] text-muted-foreground/40">Vide = couleurs du thème</p>
          {activeColors > 0 && (
            <button onClick={() => { setBgColor(''); setTextColor(''); setAccentColor(''); setBtnColor(''); setBtnTextColor(''); save(); }}
              className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
              <RotateCcw className="w-2.5 h-2.5" /> Reset
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
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            <Label className="text-[12px] text-muted-foreground shrink-0">Police</Label>
            <Select value={font} onValueChange={v => { setFont(v); save(); }}>
              <SelectTrigger className="w-36 sm:w-44 h-8 text-[11px] sm:text-[12px]"><SelectValue /></SelectTrigger>
              <SelectContent>{FONTS.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            <Label className="text-[12px] text-muted-foreground shrink-0">Disposition</Label>
            <div className="flex gap-1">
              {[{ value: 'list', label: 'Liste' }, { value: 'grid', label: 'Grille' }].map(l => (
                <button key={l.value} onClick={() => { setLayout(l.value); save(); }}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-medium transition-all ${
                    layout === l.value ? 'bg-foreground text-background' : 'bg-muted/50 text-muted-foreground hover:bg-muted'}`}>
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {isImmersive && (
        <Section title="Mode Immersif" icon={Sparkles} defaultOpen>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 sm:gap-3">
              <div className="flex items-center gap-1.5 shrink-0"><Wifi className="w-3 h-3 text-muted-foreground" /><Label className="text-[12px]">Statut</Label></div>
              <Input value={connectedLabel} onChange={e => { setConnectedLabel(e.target.value); save(); }} className="w-28 sm:w-36 h-7 text-[11px]" placeholder="Active now" />
            </div>
            <div className="flex items-center justify-between gap-2 sm:gap-3">
              <div className="flex items-center gap-1.5 shrink-0"><MapPin className="w-3 h-3 text-muted-foreground" /><Label className="text-[12px]">Ville</Label></div>
              <Input value={location} onChange={e => { setLocation(e.target.value); save(); }} className="w-28 sm:w-36 h-7 text-[11px]" placeholder="Paris, FR" />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-[12px]">Salutation géo</Label>
              <Switch checked={geoEnabled} onCheckedChange={v => { setGeoEnabled(v); save(); }} />
            </div>
          </div>
        </Section>
      )}

      <Section title="CSS personnalisé" icon={Code}>
        <Textarea value={customCss} onChange={e => { setCustomCss(e.target.value); save(); }}
          placeholder={`.page-container {\n  /* votre CSS */\n}`} className="font-mono text-[11px] h-20 resize-none bg-background" />
        <p className="text-[10px] text-muted-foreground/40">.page-container · .link-item</p>
      </Section>
    </div>
  );
};

export default AppearanceEditor;
