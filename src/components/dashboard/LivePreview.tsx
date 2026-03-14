import { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Monitor, Smartphone, Tablet, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreatorPage } from '@/hooks/useCreatorPages';

interface LivePreviewProps {
  page: CreatorPage;
  links: Array<{ id: string; title: string; url: string; [key: string]: any }>;
}

type DeviceSize = 'mobile' | 'tablet' | 'desktop';

const deviceSizes = {
  mobile: { width: 375, height: 667, label: 'Mobile', icon: Smartphone },
  tablet: { width: 768, height: 1024, label: 'Tablette', icon: Tablet },
  desktop: { width: 1280, height: 720, label: 'Desktop', icon: Monitor },
};

export const LivePreview = ({ page, links }: LivePreviewProps) => {
  const [device, setDevice] = useState<DeviceSize>('mobile');
  const [scale, setScale] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const prevDataRef = useRef<string>('');

  // Auto-refresh when page or links change
  useEffect(() => {
    const dataFingerprint = JSON.stringify({
      username: page.username,
      display_name: page.display_name,
      bio: page.bio,
      avatar_url: page.avatar_url,
      cover_url: page.cover_url,
      theme: page.theme,
      custom_bg_color: page.custom_bg_color,
      custom_text_color: page.custom_text_color,
      custom_accent_color: page.custom_accent_color,
      custom_btn_color: page.custom_btn_color,
      custom_btn_text_color: page.custom_btn_text_color,
      custom_font: page.custom_font,
      link_layout: page.link_layout,
      custom_css: page.custom_css,
      social_links: page.social_links,
      is_nsfw: page.is_nsfw,
      links: links.map(l => ({ id: l.id, title: l.title, url: l.url })),
    });

    if (prevDataRef.current && prevDataRef.current !== dataFingerprint) {
      // Debounce refresh
      const timer = setTimeout(() => setRefreshKey(k => k + 1), 600);
      return () => clearTimeout(timer);
    }
    prevDataRef.current = dataFingerprint;
  }, [page, links]);

  useEffect(() => {
    const updateScale = () => {
      const container = document.getElementById('preview-container');
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const deviceWidth = deviceSizes[device].width;
      const deviceHeight = deviceSizes[device].height;

      const scaleX = (containerRect.width - 32) / deviceWidth;
      const scaleY = (containerRect.height - 32) / deviceHeight;
      setScale(Math.min(scaleX, scaleY, 1));
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [device]);

  const handleRefresh = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  const currentDevice = deviceSizes[device];
  const previewUrl = `/${page.username}?preview=true`;

  return (
    <Card className="flex flex-col h-full border-border/60 bg-muted/30">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 p-3 border-b border-border/60">
        <h3 className="text-sm font-semibold text-foreground">Aperçu en direct</h3>
        <div className="flex items-center gap-1">
          {(Object.keys(deviceSizes) as DeviceSize[]).map((size) => {
            const DeviceIcon = deviceSizes[size].icon;
            return (
              <Button
                key={size}
                variant={device === size ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setDevice(size)}
                className="h-7 w-7 p-0"
              >
                <DeviceIcon className="w-3.5 h-3.5" />
              </Button>
            );
          })}
          <div className="w-px h-4 bg-border mx-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="h-7 w-7 p-0"
            title="Rafraîchir"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Preview Frame */}
      <div id="preview-container" className="flex-1 flex items-center justify-center p-4 overflow-hidden bg-muted/20">
        <AnimatePresence mode="wait">
          <motion.div
            key={device}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative bg-background rounded-2xl shadow-2xl border border-border overflow-hidden"
            style={{
              width: currentDevice.width,
              height: currentDevice.height,
              transform: `scale(${scale})`,
              transformOrigin: 'center center',
            }}
          >
            <iframe
              ref={iframeRef}
              key={refreshKey}
              src={previewUrl}
              title="Aperçu de la page"
              className="w-full h-full border-0"
              style={{ pointerEvents: 'none' }}
            />

            {/* Device notch for mobile */}
            {device === 'mobile' && (
              <div className="absolute top-0 left-0 right-0 h-6 bg-background/80 backdrop-blur-sm flex items-center justify-center pointer-events-none">
                <div className="w-20 h-1 rounded-full bg-border" />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-border/60 text-xs text-muted-foreground text-center">
        {currentDevice.label} · {currentDevice.width}×{currentDevice.height}
      </div>
    </Card>
  );
};
