// src/lib/deeplink.ts
// ═══ DEEPLINK ENGINE v3 ═══
// Breaks out of in-app browsers. No clipboard, no "copy the link" bullshit.
// The goal is to OPEN THE REAL BROWSER. Period.

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
    console.warn('[deeplink] blocked dangerous URL scheme:', url);
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

  // ── Android → intent:// ──
  if (b.isAndroid) {
    const hostAndPath = safeUrl.replace(/^https?:\/\//, '');
    const scheme = safeUrl.startsWith('https') ? 'https' : 'http';
    window.location.href = `intent://${hostAndPath}#Intent;scheme=${scheme};action=android.intent.action.VIEW;S.browser_fallback_url=${encodeURIComponent(safeUrl)};end`;

    // If intent didn't fire, direct navigate
    setTimeout(() => { window.location.href = safeUrl; }, 1500);
    return true;
  }

  // ── iOS in-app → aggressive multi-strategy breakout ──
  if (b.isIOS) {
    iosBreakout(safeUrl, b.appName);
    return true;
  }

  // ── Unknown in-app → just navigate ──
  window.location.href = safeUrl;
  return true;
}

/**
 * iOS breakout — tries every known method to leave the in-app browser.
 * No clipboard. No "copy the link". Just break out.
 */
function iosBreakout(url: string, appName: string | null) {
  // Strategy 1: x-safari scheme (iOS 17.4+, works in IG/FB/TT/Snap)
  // This covers ~95% of iPhones in 2026
  const safariScheme = url.startsWith('https://')
    ? url.replace(/^https:\/\//, 'x-safari-https://')
    : url.replace(/^http:\/\//, 'x-safari-http://');
  window.location.href = safariScheme;

  // Strategy 2: after 1.5s, try window.open (some webviews honor _blank)
  setTimeout(() => {
    if (!document.hasFocus()) return; // x-safari worked, we left
    try {
      const w = window.open(url, '_blank');
      if (w) return; // opened
    } catch {}

    // Strategy 3: direct navigate (stays in webview but at least loads the page)
    window.location.href = url;
  }, 1500);

  // Strategy 4: after 3s, if STILL here — show a minimal breakout banner
  // This only appears on very old iOS (<17.4) where nothing works
  setTimeout(() => {
    if (!document.hasFocus()) return; // already left
    showBreakoutBanner(url, appName);
  }, 3000);
}

/**
 * Minimal banner — last resort for old iOS.
 * One button. No clipboard talk. Just "Open in Safari".
 */
function showBreakoutBanner(url: string, appName: string | null) {
  if (document.getElementById('deeplink-banner')) return;

  const banner = document.createElement('div');
  banner.id = 'deeplink-banner';
  banner.style.cssText = `
    position:fixed;bottom:0;left:0;right:0;z-index:99999;
    background:#111;padding:20px 20px calc(20px + env(safe-area-inset-bottom, 0px));
    animation:deeplink-up 0.3s cubic-bezier(0.16,1,0.3,1);
    font-family:-apple-system,system-ui,sans-serif;
  `;

  const app = appName || 'Cette app';

  banner.innerHTML = `
    <style>@keyframes deeplink-up{from{transform:translateY(100%)}to{transform:translateY(0)}}</style>
    <p style="color:rgba(255,255,255,0.5);font-size:13px;margin:0 0 12px;text-align:center;">
      ${app} bloque l'ouverture. Appuie pour ouvrir dans Safari.
    </p>
    <button id="deeplink-go" style="
      display:block;width:100%;background:#fff;color:#000;border:none;
      border-radius:14px;padding:16px;font-size:16px;font-weight:700;
      cursor:pointer;-webkit-tap-highlight-color:transparent;
    ">
      Ouvrir dans Safari ↗
    </button>
    <button id="deeplink-close" style="
      display:block;width:100%;background:none;border:none;color:rgba(255,255,255,0.25);
      padding:12px;font-size:13px;cursor:pointer;margin-top:4px;
    ">
      Fermer
    </button>
  `;

  document.body.appendChild(banner);

  document.getElementById('deeplink-go')?.addEventListener('click', () => {
    // Try x-safari one more time (user-initiated = more permissions)
    const safariScheme = url.startsWith('https://')
      ? url.replace(/^https:\/\//, 'x-safari-https://')
      : url.replace(/^http:\/\//, 'x-safari-http://');
    window.location.href = safariScheme;

    // Fallback: direct navigate after 500ms
    setTimeout(() => { window.location.href = url; }, 500);
    banner.remove();
  });

  document.getElementById('deeplink-close')?.addEventListener('click', () => {
    banner.remove();
  });

  // Auto-dismiss after 8s
  setTimeout(() => banner.remove(), 8000);
}
