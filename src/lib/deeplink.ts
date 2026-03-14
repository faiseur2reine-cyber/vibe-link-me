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
 * 
 * Strategy:
 * - Native browser → direct navigation
 * - Android in-app → intent:// to force Chrome
 * - iOS in-app → try x-safari-https scheme, then auto-copy + toast prompt
 */
export function deeplinkNavigate(url: string): boolean {
  const b = detectBrowser();

  // Native browser → open in new tab via <a> click (bypasses COOP/CORP headers)
  if (!b.isInApp) {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noreferrer';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return true;
  }

  // Android in-app → intent:// to force Chrome
  if (b.isAndroid) {
    const stripped = url.replace(/^https?:\/\//, '');
    window.location.href = `intent://${stripped}#Intent;scheme=https;package=com.android.chrome;end`;
    setTimeout(() => { window.location.href = url; }, 1200);
    return true;
  }

  // iOS in-app → multiple strategies
  if (b.isIOS) {
    // Strategy 1: x-safari-https scheme (iOS 17.4+)
    const safariUrl = url.replace(/^https:\/\//, 'x-safari-https://');
    window.location.href = safariUrl;
    
    // Strategy 2: after 800ms, if still here → auto-copy + show toast
    setTimeout(() => {
      try { navigator.clipboard.writeText(url); } catch {}
      showCopyToast(url, b.appName);
    }, 800);
    
    return true;
  }

  // Unknown in-app → try direct + copy fallback
  window.location.href = url;
  return true;
}

/**
 * Show a floating toast instructing user to open in Safari.
 * Auto-dismisses after 8 seconds.
 */
function showCopyToast(url: string, appName: string | null) {
  // Don't show if there's already one
  if (document.getElementById('deeplink-toast')) return;

  const toast = document.createElement('div');
  toast.id = 'deeplink-toast';
  toast.style.cssText = `
    position: fixed; bottom: 24px; left: 16px; right: 16px; z-index: 99999;
    background: #000; color: #fff; border-radius: 16px; padding: 16px 20px;
    display: flex; flex-direction: column; gap: 8px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    animation: slideUp 0.3s ease-out;
    font-family: -apple-system, system-ui, sans-serif;
  `;

  const appLabel = appName || 'cette app';
  toast.innerHTML = `
    <style>@keyframes slideUp{from{transform:translateY(100px);opacity:0}to{transform:translateY(0);opacity:1}}</style>
    <div style="display:flex;align-items:center;gap:8px">
      <span style="font-size:20px">📋</span>
      <div>
        <p style="font-weight:700;font-size:14px;margin:0">Lien copié !</p>
        <p style="font-size:12px;opacity:0.6;margin:2px 0 0">${appLabel} bloque l'ouverture directe</p>
      </div>
    </div>
    <div style="display:flex;gap:8px">
      <button id="deeplink-open-safari" style="flex:1;background:#fff;color:#000;border:none;border-radius:10px;padding:10px;font-weight:600;font-size:13px;cursor:pointer">
        Ouvrir dans Safari ↗
      </button>
      <button id="deeplink-dismiss" style="background:rgba(255,255,255,0.1);color:#fff;border:none;border-radius:10px;padding:10px 14px;font-size:13px;cursor:pointer">
        ✕
      </button>
    </div>
  `;

  document.body.appendChild(toast);

  // "Open in Safari" button → navigate + clean up
  document.getElementById('deeplink-open-safari')?.addEventListener('click', () => {
    window.location.href = url;
    toast.remove();
  });

  // Dismiss
  document.getElementById('deeplink-dismiss')?.addEventListener('click', () => {
    toast.remove();
  });

  // Auto-dismiss after 8s
  setTimeout(() => toast.remove(), 8000);
}
