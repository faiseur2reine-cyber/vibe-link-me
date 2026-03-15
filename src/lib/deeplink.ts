// src/lib/deeplink.ts
// ═══ DEEPLINK ENGINE v4 ═══
// Native browser → direct navigation
// In-app browser → server-side breakout via edge function /go
// The edge function serves raw HTML with intent://, x-safari, and fallback UI.
// This works because Instagram can't sandbox a full page navigation like it
// sandboxes JavaScript inside its WebView.

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export interface BrowserInfo {
  isInApp: boolean;
  isIG: boolean;
  isFB: boolean;
  isTT: boolean;
  isSN: boolean;
  isX: boolean;
  isLI: boolean;
  isTG: boolean;
  isLine: boolean;
  isPin: boolean;
  isReddit: boolean;
  isWeChat: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  appName: string | null;
}

export function detectBrowser(): BrowserInfo {
  const ua = navigator.userAgent || '';

  const isIG = /Instagram/i.test(ua);
  const isFB = /FBAN|FBAV/i.test(ua);
  const isTT = /BytedanceWebview|TikTok|musical_ly/i.test(ua);
  const isSN = /Snapchat/i.test(ua);
  const isX = /Twitter/i.test(ua);
  const isLI = /LinkedInApp/i.test(ua);
  const isTG = /Telegram/i.test(ua);
  const isLine = /\bLine\//i.test(ua);
  const isPin = /Pinterest/i.test(ua);
  const isReddit = /Reddit/i.test(ua);
  const isWeChat = /MicroMessenger/i.test(ua);

  const isInApp = isIG || isFB || isTT || isSN || isX || isLI || isTG || isLine || isPin || isReddit || isWeChat;

  return {
    isInApp,
    isIG, isFB, isTT, isSN, isX, isLI, isTG, isLine, isPin, isReddit, isWeChat,
    isIOS: /iPhone|iPad|iPod/i.test(ua),
    isAndroid: /Android/i.test(ua),
    appName: isIG ? 'Instagram' : isFB ? 'Facebook' : isTT ? 'TikTok'
      : isSN ? 'Snapchat' : isX ? 'X' : isLI ? 'LinkedIn' : isTG ? 'Telegram'
      : isLine ? 'Line' : isPin ? 'Pinterest' : isReddit ? 'Reddit'
      : isWeChat ? 'WeChat' : null,
  };
}

export function deeplinkNavigate(url: string): boolean {
  // Special schemes — direct navigation
  if (/^(tel:|mailto:|sms:|facetime:|geo:|maps:)/i.test(url)) {
    window.location.href = url;
    return true;
  }

  // Block dangerous schemes
  if (/^(javascript:|data:|vbscript:|blob:)/i.test(url)) {
    return false;
  }

  // Ensure protocol
  const safeUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  const b = detectBrowser();

  // ── Native browser → new tab ──
  if (!b.isInApp) {
    const a = document.createElement('a');
    a.href = safeUrl;
    a.target = '_blank';
    a.rel = 'noreferrer';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return true;
  }

  // ── In-app browser → navigate to server-side breakout page ──
  // The /go edge function serves HTML that handles intent://, x-safari,
  // and shows a manual "Open in browser" button as fallback.
  // This is a FULL PAGE NAVIGATION — not JavaScript inside the WebView sandbox.
  const goUrl = `${SUPABASE_URL}/functions/v1/go?url=${encodeURIComponent(safeUrl)}`;
  window.location.href = goUrl;
  return true;
}
