// src/lib/deeplink.ts
// ═══ FDR DEEPLINK ENGINE ═══
// Détecte les navigateurs in-app (Instagram, Facebook, TikTok, Snapchat, etc.)
// et force l'ouverture dans le navigateur natif.

export interface BrowserInfo {
  isInApp: boolean;
  isIG: boolean;
  isFB: boolean;
  isTT: boolean;
  isSN: boolean;
  isLI: boolean;
  isTG: boolean;
  isLine: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  appName: string | null;
}

export function detectBrowser(): BrowserInfo {
  const ua = navigator.userAgent || '';
  const isIG = /Instagram/i.test(ua);
  const isFB = /FBAN|FBAV/i.test(ua);
  const isTT = /BytedanceWebview|TikTok/i.test(ua);
  const isSN = /Snapchat/i.test(ua);
  const isLI = /LinkedInApp/i.test(ua);
  const isTG = /Telegram/i.test(ua);
  const isLine = /\bLine\//i.test(ua);
  const isInApp = isIG || isFB || isTT || isSN || isLI || isTG || isLine;

  return {
    isInApp,
    isIG, isFB, isTT, isSN, isLI, isTG, isLine,
    isIOS: /iPhone|iPad|iPod/i.test(ua),
    isAndroid: /Android/i.test(ua),
    appName: isIG ? 'Instagram' : isFB ? 'Facebook' : isTT ? 'TikTok'
      : isSN ? 'Snapchat' : isLI ? 'LinkedIn' : isTG ? 'Telegram'
      : isLine ? 'Line' : null,
  };
}

/**
 * Navigate to URL, breaking out of in-app browser if needed.
 * Returns true if navigation was handled (caller should preventDefault).
 */
export function deeplinkNavigate(url: string): boolean {
  const b = detectBrowser();

  // Native browser → just go
  if (!b.isInApp) {
    window.location.href = url;
    return true;
  }

  // Android in-app → intent:// to force Chrome
  if (b.isAndroid) {
    const stripped = url.replace(/^https?:\/\//, '');
    window.location.href = `intent://${stripped}#Intent;scheme=https;package=com.android.chrome;end`;
    // Fallback after 1.2s if intent didn't work
    setTimeout(() => { window.location.href = url; }, 1200);
    return true;
  }

  // iOS in-app → try window.open, then <a> trick
  if (b.isIOS) {
    try {
      const w = window.open(url, '_blank');
      if (w) return true;
    } catch {
      // Blocked by browser
    }
    // Fallback: create and click a temporary <a>
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return true;
  }

  // Unknown in-app → just navigate
  window.location.href = url;
  return true;
}
