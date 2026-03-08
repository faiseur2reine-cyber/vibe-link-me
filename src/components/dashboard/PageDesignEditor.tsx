import { useState } from 'react';
import { CreatorPage } from '@/hooks/useCreatorPages';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Loader2, Paintbrush, Type, LayoutGrid, Code, RotateCcw, Sparkles } from 'lucide-react';

const FONT_OPTIONS = [
  { value: 'default', label: 'Par défaut (système)' },
  { value: 'inter', label: 'Inter' },
  { value: 'poppins', label: 'Poppins' },
  { value: 'playfair', label: 'Playfair Display' },
  { value: 'roboto', label: 'Roboto' },
  { value: 'montserrat', label: 'Montserrat' },
  { value: 'space-grotesk', label: 'Space Grotesk' },
  { value: 'dm-sans', label: 'DM Sans' },
  { value: 'outfit', label: 'Outfit' },
  { value: 'sora', label: 'Sora' },
];

interface DesignPreset {
  name: string;
  emoji: string;
  bgColor: string;
  textColor: string;
  accentColor: string;
  btnColor: string;
  btnTextColor: string;
  font: string;
  layout: string;
}

const DESIGN_PRESETS: DesignPreset[] = [
  { name: 'Dark Luxury', emoji: '🖤', bgColor: '#0a0a0a', textColor: '#f5f0e8', accentColor: '#c9a96e', btnColor: '#1a1a1a', btnTextColor: '#c9a96e', font: 'playfair', layout: 'list' },
  { name: 'Neon Glow', emoji: '💜', bgColor: '#0d0221', textColor: '#ffffff', accentColor: '#ff00ff', btnColor: '#1a0533', btnTextColor: '#00ffff', font: 'space-grotesk', layout: 'list' },
  { name: 'Pastel Soft', emoji: '🌸', bgColor: '#fdf2f8', textColor: '#4a2040', accentColor: '#e879a8', btnColor: '#ffffff', btnTextColor: '#9d4b7a', font: 'poppins', layout: 'cards' },
  { name: 'Ocean Breeze', emoji: '🌊', bgColor: '#0c1929', textColor: '#e0f2fe', accentColor: '#38bdf8', btnColor: '#0f2942', btnTextColor: '#7dd3fc', font: 'dm-sans', layout: 'list' },
  { name: 'Forest Zen', emoji: '🌿', bgColor: '#f0fdf4', textColor: '#14532d', accentColor: '#22c55e', btnColor: '#ffffff', btnTextColor: '#15803d', font: 'outfit', layout: 'minimal' },
  { name: 'Retro Pop', emoji: '🟠', bgColor: '#fef3c7', textColor: '#78350f', accentColor: '#f97316', btnColor: '#ffffff', btnTextColor: '#ea580c', font: 'montserrat', layout: 'grid-2' },
  { name: 'Monochrome', emoji: '⚪', bgColor: '#ffffff', textColor: '#171717', accentColor: '#525252', btnColor: '#171717', btnTextColor: '#ffffff', font: 'inter', layout: 'minimal' },
  { name: 'Cyber Punk', emoji: '⚡', bgColor: '#18181b', textColor: '#fef08a', accentColor: '#facc15', btnColor: '#27272a', btnTextColor: '#fde047', font: 'space-grotesk', layout: 'grid-2' },
];

const LAYOUT_OPTIONS = [
  { value: 'list', label: 'Liste classique', description: 'Liens empilés verticalement' },
  { value: 'grid-2', label: 'Grille 2 colonnes', description: 'Liens en grille compacte' },
  { value: 'cards', label: 'Cards avec images', description: 'Grandes cards visuelles' },
  { value: 'minimal', label: 'Minimal', description: 'Style épuré et minimaliste' },
];

interface PageDesignEditorProps {
  page: CreatorPage;
  onUpdate: (updates: Partial<CreatorPage>) => Promise<{ error: any }>;
}

const ColorInput = ({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) => (
  <div className="space-y-1.5">
    <Label className="text-xs">{label}</Label>
    <div className="flex items-center gap-2">
      <div
        className="w-9 h-9 rounded-lg border border-border shrink-0 cursor-pointer overflow-hidden"
        style={{ backgroundColor: value || '#ffffff' }}
      >
        <input
          type="color"
          value={value || '#ffffff'}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-full opacity-0 cursor-pointer"
        />
      </div>
      <Input
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || '#000000'}
        className="font-mono text-xs"
      />
    </div>
  </div>
);

const PageDesignEditor = ({ page, onUpdate }: PageDesignEditorProps) => {
  const [bgColor, setBgColor] = useState(page.custom_bg_color || '');
  const [textColor, setTextColor] = useState(page.custom_text_color || '');
  const [accentColor, setAccentColor] = useState(page.custom_accent_color || '');
  const [btnColor, setBtnColor] = useState(page.custom_btn_color || '');
  const [btnTextColor, setBtnTextColor] = useState(page.custom_btn_text_color || '');
  const [font, setFont] = useState(page.custom_font || 'default');
  const [layout, setLayout] = useState(page.link_layout || 'list');
  const [customCss, setCustomCss] = useState(page.custom_css || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const result = await onUpdate({
      custom_bg_color: bgColor || null,
      custom_text_color: textColor || null,
      custom_accent_color: accentColor || null,
      custom_btn_color: btnColor || null,
      custom_btn_text_color: btnTextColor || null,
      custom_font: font,
      link_layout: layout,
      custom_css: customCss || null,
    } as any);
    if (result?.error) {
      toast({ title: result.error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Design sauvegardé !' });
    }
    setSaving(false);
  };

  const handleReset = () => {
    setBgColor('');
    setTextColor('');
    setAccentColor('');
    setBtnColor('');
    setBtnTextColor('');
    setFont('default');
    setLayout('list');
    setCustomCss('');
  };

  const applyPreset = (preset: DesignPreset) => {
    setBgColor(preset.bgColor);
    setTextColor(preset.textColor);
    setAccentColor(preset.accentColor);
    setBtnColor(preset.btnColor);
    setBtnTextColor(preset.btnTextColor);
    setFont(preset.font);
    setLayout(preset.layout);
  };

  return (
    <div className="space-y-6">
      {/* Presets Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold text-sm text-foreground">Presets</h3>
        </div>
        <p className="text-xs text-muted-foreground">Applique un style prédéfini en un clic, puis personnalise-le.</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {DESIGN_PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset)}
              className="group relative rounded-xl border border-border hover:border-primary/50 transition-all overflow-hidden"
            >
              <div className="h-10 flex items-center justify-center text-xs font-medium" style={{ backgroundColor: preset.bgColor, color: preset.textColor }}>
                <span className="opacity-80 group-hover:opacity-100 transition-opacity">{preset.emoji}</span>
              </div>
              <div className="px-2 py-1.5 text-[10px] font-medium text-foreground text-center truncate">{preset.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Colors Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Paintbrush className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold text-sm text-foreground">Couleurs</h3>
        </div>
        <p className="text-xs text-muted-foreground">Personnalise les couleurs de ta page. Laisse vide pour utiliser les couleurs du thème.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ColorInput label="Fond de page" value={bgColor} onChange={setBgColor} placeholder="#1a1a2e" />
          <ColorInput label="Texte principal" value={textColor} onChange={setTextColor} placeholder="#ffffff" />
          <ColorInput label="Couleur d'accent" value={accentColor} onChange={setAccentColor} placeholder="#e94560" />
          <ColorInput label="Fond des boutons" value={btnColor} onChange={setBtnColor} placeholder="#16213e" />
          <ColorInput label="Texte des boutons" value={btnTextColor} onChange={setBtnTextColor} placeholder="#ffffff" />
        </div>

        {/* Live preview strip */}
        {(bgColor || btnColor) && (
          <Card className="border-border overflow-hidden">
            <CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground mb-2">Aperçu rapide</p>
              <div
                className="rounded-xl p-4 flex flex-col items-center gap-2"
                style={{ backgroundColor: bgColor || '#1a1a2e' }}
              >
                <span className="text-sm font-bold" style={{ color: textColor || '#ffffff' }}>
                  {page.display_name || page.username}
                </span>
                <div
                  className="px-6 py-2 rounded-xl text-xs font-medium"
                  style={{
                    backgroundColor: btnColor || '#16213e',
                    color: btnTextColor || '#ffffff',
                  }}
                >
                  Exemple de lien
                </div>
                <span className="text-[10px]" style={{ color: accentColor || '#e94560' }}>
                  Couleur d'accent
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Font Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Type className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold text-sm text-foreground">Police d'écriture</h3>
        </div>
        <Select value={font} onValueChange={setFont}>
          <SelectTrigger className="bg-muted/50 border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONT_OPTIONS.map(f => (
              <SelectItem key={f.value} value={f.value}>
                <span style={{ fontFamily: f.value === 'default' ? 'inherit' : f.label }}>{f.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Layout Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <LayoutGrid className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold text-sm text-foreground">Mise en page des liens</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {LAYOUT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setLayout(opt.value)}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                layout === opt.value
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border hover:border-primary/40'
              }`}
            >
              <p className="text-xs font-medium text-foreground">{opt.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{opt.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Custom CSS Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold text-sm text-foreground">CSS personnalisé</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Ajoute du CSS pour personnaliser encore plus ta page. Utilise les classes <code className="bg-muted px-1 rounded">.page-container</code>, <code className="bg-muted px-1 rounded">.link-item</code>, <code className="bg-muted px-1 rounded">.profile-header</code>.
        </p>
        <Textarea
          value={customCss}
          onChange={(e) => setCustomCss(e.target.value)}
          placeholder={`.page-container {\n  /* Tes styles ici */\n}\n.link-item {\n  border-radius: 999px;\n}`}
          rows={8}
          className="font-mono text-xs bg-muted/30 border-border"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="outline" onClick={handleReset} className="rounded-full gap-1.5 flex-1">
          <RotateCcw className="w-3.5 h-3.5" /> Réinitialiser
        </Button>
        <Button onClick={handleSave} disabled={saving} className="rounded-full flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90">
          {saving ? <Loader2 className="animate-spin" /> : 'Sauvegarder le design'}
        </Button>
      </div>
    </div>
  );
};

export default PageDesignEditor;
