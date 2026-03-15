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

// ── DOMAINS WITH NATIVE APPS (universal links) ──
// iOS opens these in their native app automatically when you navigate to them.
// We just need to do window.location.href — NO x-safari, NO custom schemes.
const HAS_NATIVE_APP = [
  'twitter.com', 'x.com',
  'tiktok.com',
  'youtube.com', 'youtu.be',
  'instagram.com',
  'snapchat.com',
  'open.spotify.com', 'spotify.com',
  't.me', 'telegram.me', 'telegram.org',
  'facebook.com', 'fb.com',
  'linkedin.com',
  'pinterest.com',
  'reddit.com',
  'twitch.tv',
  'discord.com', 'discord.gg',
  'amazon.com', 'amazon.fr', 'amazon.co.uk',
];

function hasNativeApp(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    return HAS_NATIVE_APP.some(d => host === d || host.endsWith(`.${d}`));
  } catch { return false; }
}

function getIOSVersion(): number {
  const m = navigator.userAgent.match(/OS (\d+)/);
  return m ? parseInt(m[1]) : 0;
}

/**
 * Navigate to URL, breaking out of in-app browser if needed.
 * 
 * CRITICAL: This must be called directly from a click handler
 * to preserve the user gesture context.
 *
 * Strategy:
 * - Native browser → new tab
 * - In-app + target has app (X, TikTok, YT...) → direct navigate (universal links open the app)
 * - In-app + target has NO app (MYM, OF...) → x-safari breakout to Safari
 * - Android → intent:// to open in Chrome
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

  // ── In-app + target has native app → let iOS universal links handle it ──
  if (hasNativeApp(safeUrl)) {
    window.location.href = safeUrl;
    return true;
  }

  // ── Android: intent:// to open in Chrome ──
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

  // ── iOS 17+: x-safari breakout (for sites WITHOUT native apps) ──
  if (b.isIOS && getIOSVersion() >= 17) {
    const safariUrl = safeUrl.startsWith('https://')
      ? safeUrl.replace('https://', 'x-safari-https://')
      : safeUrl.replace('http://', 'x-safari-http://');

    if (b.isIG) {
      // Instagram iOS: window.open preserves gesture context better
      window.open(safariUrl, '_blank');
    } else {
      window.location.href = safariUrl;
    }

    // If still here after 2.5s → x-safari failed → fallback page
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
