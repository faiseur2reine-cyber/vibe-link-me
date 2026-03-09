import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Monitor, Smartphone, Tablet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreatorPage } from '@/hooks/useCreatorPages';

interface LivePreviewProps {
  page: CreatorPage;
  links: Array<{ id: string; title: string; url: string }>;
}

type DeviceSize = 'mobile' | 'tablet' | 'desktop';

const deviceSizes = {
  mobile: { width: 375, height: 667, label: 'Mobile', icon: Smartphone },
  tablet: { width: 768, height: 1024, label: 'Tablette', icon: Tablet },
  desktop: { width: 1280, height: 720, label: 'Desktop', icon: Monitor },
};

export const LivePreview = ({ page, links }: LivePreviewProps) => {
  const [device, setDevice] = useState<DeviceSize>('desktop');
  const [scale, setScale] = useState(1);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateScale = () => {
      const container = document.getElementById('preview-container');
      if (!container) return;
      
      const containerRect = container.getBoundingClientRect();
      setContainerSize({ width: containerRect.width, height: containerRect.height });
      
      const deviceWidth = deviceSizes[device].width;
      const deviceHeight = deviceSizes[device].height;
      
      const scaleX = (containerRect.width - 40) / deviceWidth;
      const scaleY = (containerRect.height - 40) / deviceHeight;
      setScale(Math.min(scaleX, scaleY, 1));
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [device]);

  const currentDevice = deviceSizes[device];

  return (
    <Card className="flex flex-col h-full border-border/60 bg-muted/30">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 p-3 border-b border-border/60">
        <h3 className="text-sm font-semibold">Aperçu en direct</h3>
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
        </div>
      </div>

      {/* Preview Frame */}
      <div id="preview-container" className="flex-1 flex items-center justify-center p-5 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={device}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative bg-background rounded-xl shadow-2xl border border-border overflow-hidden"
            style={{
              width: currentDevice.width,
              height: currentDevice.height,
              transform: `scale(${scale})`,
              transformOrigin: 'center center',
            }}
          >
            {/* Mock Preview Content */}
            <div className="w-full h-full overflow-y-auto">
              <div className="flex flex-col items-center p-6 space-y-4">
                {/* Avatar */}
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  {page.avatar_url ? (
                    <img src={page.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-primary">
                      {(page.display_name || page.username)?.[0]?.toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="text-center space-y-1">
                  <h2 className="text-lg font-bold">{page.display_name || page.username}</h2>
                  <p className="text-sm text-muted-foreground">@{page.username}</p>
                  {page.bio && <p className="text-sm mt-2">{page.bio}</p>}
                </div>

                {/* Links */}
                <div className="w-full max-w-md space-y-2 mt-4">
                  {links.slice(0, 5).map((link, index) => (
                    <motion.div
                      key={link.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="w-full p-3 rounded-lg bg-card border border-border text-center text-sm font-medium hover:bg-accent/50 transition-colors cursor-pointer"
                    >
                      {link.title}
                    </motion.div>
                  ))}
                  {links.length === 0 && (
                    <div className="text-center text-sm text-muted-foreground py-8">
                      Aucun lien pour le moment
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Device chrome for mobile/tablet */}
            {device !== 'desktop' && (
              <div className="absolute top-0 left-0 right-0 h-6 bg-background/95 backdrop-blur-sm border-b border-border/40 flex items-center justify-center">
                <div className="w-16 h-1 rounded-full bg-border" />
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
