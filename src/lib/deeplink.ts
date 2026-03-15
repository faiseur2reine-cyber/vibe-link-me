// src/lib/deeplink.ts
// ═══ DEEPLINK ENGINE v6 ═══
// Key insight: breakout must happen IN the user click context.
// Navigating to go.html first loses the gesture context, so
// Instagram blocks window.open(). GetMySocial runs the deeplink
// JS on the profile page itself — we do the same.

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
    isInApp, isIG, isFB, isTT, isSN, isX, isLI, isTG, isLine, isPin, isReddit, isWeChat,
    isIOS: /iPhone|iPad|iPod/i.test(ua),
    isAndroid: /Android/i.test(ua),
    appName: isIG ? 'Instagram' : isFB ? 'Facebook' : isTT ? 'TikTok'
      : isSN ? 'Snapchat' : isX ? 'X' : isLI ? 'LinkedIn' : isTG ? 'Telegram'
      : isLine ? 'Line' : isPin ? 'Pinterest' : isReddit ? 'Reddit'
      : isWeChat ? 'WeChat' : null,
  };
}

// ── APP URL SCHEMES ──
// Apps with native schemes can be opened directly from any webview.
// This is how GetMySocial opens Twitter/TikTok/YouTube — not via x-safari.
const APP_SCHEMES: Record<string, (url: string) => string | null> = {
  'twitter.com':      (u) => { const m = u.match(/twitter\.com\/([^/?#]+)/); return m ? `twitter://user?screen_name=${m[1]}` : null; },
  'x.com':            (u) => { const m = u.match(/x\.com\/([^/?#]+)/); return m ? `twitter://user?screen_name=${m[1]}` : null; },
  'tiktok.com':       (u) => { const m = u.match(/tiktok\.com\/@([^/?#]+)/); return m ? `snssdk1233://user/profile/${m[1]}` : null; },
  'youtube.com':      (u) => `vnd.youtube://${u.replace(/^https?:\/\/(www\.)?youtube\.com/, '')}`,
  'youtu.be':         (u) => { const m = u.match(/youtu\.be\/([^/?#]+)/); return m ? `vnd.youtube://watch?v=${m[1]}` : null; },
  'instagram.com':    (u) => { const m = u.match(/instagram\.com\/([^/?#]+)/); return m ? `instagram://user?username=${m[1]}` : null; },
  'snapchat.com':     (u) => { const m = u.match(/snapchat\.com\/add\/([^/?#]+)/); return m ? `snapchat://add/${m[1]}` : null; },
  'open.spotify.com': (u) => u.replace('https://open.spotify.com', 'spotify://'),
  't.me':             (u) => { const m = u.match(/t\.me\/([^/?#]+)/); return m ? `tg://resolve?domain=${m[1]}` : null; },
  'telegram.me':      (u) => { const m = u.match(/telegram\.me\/([^/?#]+)/); return m ? `tg://resolve?domain=${m[1]}` : null; },
};

function getAppScheme(url: string): string | null {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    for (const key in APP_SCHEMES) {
      if (host === key || host.endsWith(`.${key}`)) {
        return APP_SCHEMES[key](url);
      }
    }
  } catch {}
  return null;
}

function getIOSVersion(): number {
  const m = navigator.userAgent.match(/OS (\d+)/);
  return m ? parseInt(m[1]) : 0;
}

/**
 * Navigate to URL, breaking out of in-app browser if needed.
 * 
 * CRITICAL: This must be called directly from a click handler
 * to preserve the user gesture context. window.open() is blocked
 * without a gesture in Instagram's webview.
 */
export function deeplinkNavigate(url: string): boolean {
  // Special schemes — direct
  if (/^(tel:|mailto:|sms:|facetime:|geo:|maps:)/i.test(url)) {
    window.location.href = url;
    return true;
  }

  // Block dangerous schemes
  if (/^(javascript:|data:|vbscript:|blob:)/i.test(url)) {
    return false;
  }

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

  // ── In-app: try app URL scheme first ──
  const scheme = getAppScheme(safeUrl);
  if (scheme) {
    window.location.href = scheme;
    // Fallback: if app not installed, open in webview after 1.5s
    setTimeout(() => {
      if (!document.hidden) window.location.href = safeUrl;
    }, 1500);
    return true;
  }

  // ── Android: intent:// ──
  if (b.isAndroid) {
    try {
      const parsed = new URL(safeUrl);
      const intentUrl = `intent://${parsed.host}${parsed.pathname}${parsed.search}#Intent;scheme=${parsed.protocol.replace(':', '')};package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(safeUrl)};end`;
      window.location.href = intentUrl;
      setTimeout(() => {
        if (!document.hidden) window.location.href = safeUrl;
      }, 1500);
    } catch {
      window.location.href = safeUrl;
    }
    return true;
  }

  // ── iOS 17+: x-safari (MUST run in click context!) ──
  if (b.isIOS && getIOSVersion() >= 17) {
    const safariUrl = safeUrl.startsWith('https://')
      ? safeUrl.replace('https://', 'x-safari-https://')
      : safeUrl.replace('http://', 'x-safari-http://');

    if (b.isIG) {
      // Instagram iOS: window.open works better than location.href
      // This is GetMySocial's exact technique
      window.open(safariUrl, '_blank');
    } else {
      window.location.href = safariUrl;
    }

    // If still here after 2.5s → x-safari failed → go to fallback page
    setTimeout(() => {
      if (!document.hidden) {
        window.location.href = `/go.html?url=${encodeURIComponent(safeUrl)}`;
      }
    }, 2500);
    return true;
  }

  // ── Older iOS or unknown → fallback page ──
  window.location.href = `/go.html?url=${encodeURIComponent(safeUrl)}`;
  return true;
}
