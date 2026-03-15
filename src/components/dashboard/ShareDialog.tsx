import { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TapCheck as Check, TapCopy as Copy, TapShare as Share2 } from '@/components/icons/TapIcons';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  username: string;
  displayName: string;
}

const SOCIALS = [
  {
    name: 'X',
    color: '#000',
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    url: (pageUrl: string, text: string) =>
      `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(pageUrl)}`,
  },
  {
    name: 'WhatsApp',
    color: '#25D366',
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
    url: (pageUrl: string, text: string) =>
      `https://wa.me/?text=${encodeURIComponent(text + ' ' + pageUrl)}`,
  },
  {
    name: 'Telegram',
    color: '#229ED9',
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
    url: (pageUrl: string, text: string) =>
      `https://t.me/share/url?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(text)}`,
  },
];

const ShareDialog = ({ open, onOpenChange, username, displayName }: ShareDialogProps) => {
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  const pageUrl = `${window.location.origin}/${username}`;
  const shareText = `Check out my page`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(pageUrl);
    setCopied(true);
    toast.success('Lien copié');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = 1024;
    canvas.height = 1024;
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 1024, 1024);
      ctx.drawImage(img, 64, 64, 896, 896);
      const a = document.createElement('a');
      a.download = `${username}-qr.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Partager @{username}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* URL + Copy */}
          <div className="flex gap-2">
            <Input
              value={pageUrl}
              readOnly
              className="h-9 text-[12px] bg-muted/30 select-all"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <Button onClick={handleCopy} variant="outline" size="sm" className="h-9 px-3 shrink-0">
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </Button>
          </div>

          {/* Social sharing */}
          <div className="flex items-center gap-2">
            {SOCIALS.map((s) => (
              <a
                key={s.name}
                href={s.url(pageUrl, shareText)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl border border-border/40 text-[12px] font-medium text-foreground hover:bg-muted/50 transition-colors"
              >
                {s.icon}
                {s.name}
              </a>
            ))}
          </div>

          {/* Quick copy for IG bio */}
          <Button
            onClick={() => {
              const short = pageUrl.replace(/^https?:\/\//, '');
              navigator.clipboard.writeText(short);
              toast.success('Copié pour ta bio');
            }}
            variant="outline"
            size="sm"
            className="w-full h-9 text-[12px] gap-1.5"
          >
            <Copy className="w-3.5 h-3.5" />
            Copier pour bio Instagram
          </Button>

          {/* QR Code */}
          <div className="relative">
            <div
              ref={qrRef}
              className="flex items-center justify-center p-5 bg-white rounded-2xl border border-border/60"
            >
              <QRCodeSVG
                value={pageUrl}
                size={160}
                level="H"
                bgColor="#ffffff"
                fgColor="#000000"
              />
            </div>
            <Button
              onClick={handleDownloadQR}
              variant="ghost"
              size="sm"
              className="absolute bottom-2 right-2 h-7 px-2 text-[10px] gap-1 bg-white/80 hover:bg-white border border-border/40"
            >
              <Download className="w-3 h-3" />
              PNG
            </Button>
          </div>

          {/* Native share (mobile) */}
          {typeof navigator.share === 'function' && (
            <Button
              onClick={() => navigator.share({ title: `${displayName}`, url: pageUrl })}
              size="sm"
              className="w-full h-10 rounded-xl text-[13px] gap-2 font-semibold"
            >
              <Share2 className="w-4 h-4" />
              Plus d'options de partage
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;
