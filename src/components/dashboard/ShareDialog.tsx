import { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TapCheck as Check, TapCopy as Copy, TapShare as Share2 } from '@/components/icons/TapIcons';
import { Download, QrCode } from 'lucide-react';
import { toast } from 'sonner';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  username: string;
  displayName: string;
}

const ShareDialog = ({ open, onOpenChange, username, displayName }: ShareDialogProps) => {
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  const pageUrl = `${window.location.origin}/${username}`;

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
      // White background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 1024, 1024);
      // QR with padding
      ctx.drawImage(img, 64, 64, 896, 896);
      // Download
      const a = document.createElement('a');
      a.download = `${username}-qr.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `${displayName} — Links`,
        url: pageUrl,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Partager @{username}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* QR Code */}
          <div
            ref={qrRef}
            className="flex items-center justify-center p-6 bg-white rounded-2xl border border-border/60"
          >
            <QRCodeSVG
              value={pageUrl}
              size={180}
              level="H"
              bgColor="#ffffff"
              fgColor="#000000"
              imageSettings={{
                src: '/icon-32.png',
                x: undefined,
                y: undefined,
                height: 32,
                width: 32,
                excavate: true,
              }}
            />
          </div>

          {/* URL + Copy */}
          <div className="flex gap-2">
            <Input
              value={pageUrl}
              readOnly
              className="h-9 text-[12px] bg-muted/30 select-all"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <Button
              onClick={handleCopy}
              variant="outline"
              size="sm"
              className="h-9 px-3 shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </Button>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={handleDownloadQR}
              variant="outline"
              size="sm"
              className="h-9 text-[12px] gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              QR PNG
            </Button>
            <Button
              onClick={() => {
                // Short URL for Instagram bio (no https://)
                const short = pageUrl.replace(/^https?:\/\//, '');
                navigator.clipboard.writeText(short);
                toast.success('Copié pour la bio Instagram');
              }}
              variant="outline"
              size="sm"
              className="h-9 text-[12px] gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              Bio IG
            </Button>
          </div>

          {/* Native share */}
          {typeof navigator.share === 'function' && (
            <Button
              onClick={handleNativeShare}
              size="sm"
              className="w-full h-9 text-[12px] gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              Partager
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;
