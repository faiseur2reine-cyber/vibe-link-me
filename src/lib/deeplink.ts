// src/lib/deeplink.ts
// ═══ DEEPLINK ENGINE v2 ═══
// Detects in-app browsers (Instagram, Facebook, TikTok, Snapchat, X, etc.)
// and forces the system browser (Chrome, Safari, Samsung Internet, etc.)
//
// Supports: Instagram, Facebook, TikTok, Snapchat, X/Twitter, LinkedIn,
//           Telegram, Line, Pinterest, Reddit, WeChat
// Platforms: iOS (Safari), Android (Chrome, Samsung Internet, any default)

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
  const isX = /Twitter/i.test(ua); // X/Twitter in-app uses "Twitter" in UA
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

/**
 * Navigate to URL, breaking out of in-app browser if needed.
 *
 * Strategy per platform:
 * - Native browser → <a target="_blank"> click (clean, no redirect)
 * - Android in-app → intent:// with action VIEW (opens default browser, not just Chrome)
 * - iOS 17.4+ in-app → x-safari-https:// scheme
 * - iOS < 17.4 in-app → auto-copy + floating toast with instructions
 * - Unknown in-app → direct navigation with copy fallback
 */
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

  // Ensure URL has a protocol
  const safeUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  const b = detectBrowser();

  // ── Native browser → open in new tab ──
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

  // ── In-app browser → server-side breakout via /go edge function ──
  // The edge function serves HTML with intent://, x-safari, and fallback UI.
  // Full page navigation — Instagram can't sandbox this.
  const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  if (supabaseUrl) {
    window.location.href = `${supabaseUrl}/functions/v1/go?url=${encodeURIComponent(safeUrl)}`;
  } else {
    window.location.href = safeUrl;
  }
  return true;
}

